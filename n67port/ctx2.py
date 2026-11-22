"""Call-context matcher v2: use the updated N67 port.37 module (same 10p source
lineage) and restrict to the 35 symbols the 10p module actually calls.
Keeps register numbers (r0-r3 are ABI arg regs) and small immediates/offsets.
"""
import difflib
import json
import re
import struct

from capstone import Cs, CS_ARCH_ARM, CS_MODE_THUMB
from capstone.arm import ARM_OP_IMM

import lib

TENP = '/workspace/off10p/01_chaos_sup.bin'
N67 = '/workspace/chaos_work/extract3/CHAOS_IMAGE.bin'
FW_LO, FW_HI = 0x0C000000, 0x0CE00000
WIN = 18

TARGETS = """SYM_APP_LAUNCHER_ADD SYM_APP_LAUNCHER_DEL SYM_CHAOS_INIT_BUFFER
SYM_CHAOS_NOTIFY SYM_CHAOS_REGISTER_DRIVER SYM_CHAOS_UNREGISTER_DRIVER
SYM_LVX_CONTENT_PAD_BOTTOM SYM_LVX_LABEL_CREATE SYM_LVX_LABEL_SET_LONG_MODE
SYM_LVX_LABEL_SET_TEXT SYM_LVX_LIST_ITEM_UPDATE SYM_LVX_LIST_ROW_CREATE
SYM_LVX_LIST_ROW_TRAILING SYM_LVX_MSGBOX_CREATE SYM_LVX_NOTIFICATION_INSERT_MESSAGE
SYM_LVX_OBJECT_ALIGN SYM_LVX_OBJECT_DELETE SYM_LVX_OBJECT_SET_SIZE
SYM_LVX_PAGE_CONTENT_CREATE SYM_LVX_STYLE_APPLY SYM_LV_BAR_SET_RANGE
SYM_LV_DISPLAY_GET_HORIZONTAL_RESOLUTION SYM_LV_DISPLAY_INVALIDATE_AREA
SYM_LV_EVENT_GET_CODE SYM_LV_OBJ_ADD_EVENT_CB SYM_LV_OBJ_ALIGN_TO
SYM_LV_OBJ_CLEAR_FLAG SYM_LV_OBJ_GET_STYLE_PROP SYM_LV_OBJ_TREE_WALK
SYM_LV_TIMER_CREATE SYM_LV_TIMER_DEL SYM_PAGE_GOTO SYM_QUICKAPP_REGISTER_APP
SYM_REGISTER_DRIVER SYM_UNREGISTER_DRIVER""".split()


def in_fw(v):
    return FW_LO <= v < FW_HI and (v & 1)


def norm(ins):
    mn = ins.mnemonic.split('.')[0]
    ops = []
    for op in ins.operands:
        if op.type == 1:
            ops.append('r%d' % op.reg)
        elif op.type == 2:
            v = op.imm
            ops.append(hex(v) if -0x10000 < v < 0x10000 else 'BIG')
        elif op.type == 3:
            d = op.mem.disp
            ops.append(('m' + hex(d)) if -0x10000 < d < 0x10000 else 'mBIG')
        else:
            ops.append('?')
    return mn + ' ' + ','.join(ops)


def scan_tenp():
    data, funcs, toff = lib.module_functions(TENP)
    md = Cs(CS_ARCH_ARM, CS_MODE_THUMB)
    md.detail = True
    sites = {}
    for name, addr, size in funcs:
        code = data[addr:addr + size]
        hist = []
        last = {}
        for ins in lib.dis(code, addr):
            tok = norm(ins)
            v = None
            if ins.mnemonic == 'ldr' and '[pc' in ins.op_str:
                m = re.search(r'#(0x[0-9a-f]+)', ins.op_str)
                if m:
                    lit = ((ins.address + 4) & ~3) + int(m.group(1), 16)
                    if 0 <= lit <= len(data) - 4:
                        v = struct.unpack_from('<I', data, lit)[0]
            elif ins.mnemonic == 'movw' and len(ins.operands) > 1 and ins.operands[1].type == ARM_OP_IMM:
                last[ins.operands[0].reg] = ins.operands[1].imm
            elif ins.mnemonic == 'movt' and len(ins.operands) > 1 and ins.operands[1].type == ARM_OP_IMM:
                r = ins.operands[0].reg
                if r in last:
                    v = (ins.operands[1].imm << 16) | (last[r] & 0xffff)
                    last.pop(r, None)
            if v is not None and in_fw(v):
                sites.setdefault(v, []).append(hist[-WIN:] + [tok])
            hist.append(tok)
            if len(hist) > 64:
                hist = hist[-64:]
    return sites


def scan_n67():
    img = lib.load(N67)
    n = len(img)
    md = Cs(CS_ARCH_ARM, CS_MODE_THUMB)
    md.detail = True
    sites = {}
    hist = []
    last = {}
    pos = 0
    while pos < n - 4:
        got = None
        for ins in md.disasm(img[pos:pos + 4], pos, count=1):
            got = ins
        if got is None:
            pos += 2
            hist = []
            last = {}
            continue
        ins = got
        tok = norm(ins)
        v = None
        if ins.mnemonic == 'ldr' and '[pc' in ins.op_str:
            m = re.search(r'#(0x[0-9a-f]+)', ins.op_str)
            if m:
                lit = ((ins.address + 4) & ~3) + int(m.group(1), 16)
                if 0 <= lit <= n - 4:
                    v = struct.unpack_from('<I', img, lit)[0]
        elif ins.mnemonic == 'movw' and len(ins.operands) > 1 and ins.operands[1].type == ARM_OP_IMM:
            last[ins.operands[0].reg] = ins.operands[1].imm
        elif ins.mnemonic == 'movt' and len(ins.operands) > 1 and ins.operands[1].type == ARM_OP_IMM:
            r = ins.operands[0].reg
            if r in last:
                v = (ins.operands[1].imm << 16) | (last[r] & 0xffff)
                last.pop(r, None)
        if v is not None and in_fw(v):
            sites.setdefault(v, []).append(hist[-WIN:] + [tok])
        hist.append(tok)
        if len(hist) > 64:
            hist = hist[-64:]
        pos += ins.size
    return sites


def load_syms():
    out = []
    for line in open('/workspace/Chaos-Module/symbol/10p-3.101.043/firmware.rs'):
        m = re.search(r'pub const (SYM_[A-Z0-9_]+): u32 = (0x[0-9A-Fa-f]+);', line)
        if m:
            out.append((m.group(1), int(m.group(2), 16)))
    return out


def main():
    s10 = scan_tenp()
    s67 = scan_n67()
    cand = sorted(s67)
    syms = [(n, a) for n, a in load_syms() if n in TARGETS]
    out = {}
    for name, addr in syms:
        A = s10.get(addr)
        if not A:
            print(f"{name:38s} NO-10p-CALLSITE")
            continue
        ranked = []
        for c in cand:
            B = s67[c]
            best = 0
            for x in A:
                for y in B:
                    r = difflib.SequenceMatcher(None, x, y).ratio()
                    if r > best:
                        best = r
            ranked.append((round(best, 3), hex(c)))
        ranked.sort(reverse=True)
        margin = ranked[0][0] - ranked[1][0]
        out[name] = {'10p': hex(addr), 'n10': len(A), 'ranked': ranked[:5]}
        print(f"{name:38s} {hex(addr):>11s} n={len(A):2d} top={ranked[0][1]} {ranked[0][0]:.3f} "
              f"margin={margin:.3f}  next={ranked[1][1]} {ranked[1][0]:.3f}")
    json.dump(out, open('/workspace/n67port/ctx2_scores.json', 'w'), indent=1)


if __name__ == '__main__':
    main()
