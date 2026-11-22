"""Match firmware symbols by *caller context* between the 10p ELF module and the
N67 raw module. The module source is the same, so the instruction context that
loads a firmware function address is far more stable than the firmware callee
itself (which is a different build).

Output: ctx_scores.json  { SYM_X: {10p, sites10p, ranked:[(score,n67addr,...)...]} }
"""
import difflib
import json
import re
import struct

from capstone import Cs, CS_ARCH_ARM, CS_MODE_THUMB
from capstone.arm import ARM_OP_IMM

import lib

TENP = '/workspace/off10p/01_chaos_sup.bin'
N67 = '/workspace/chaos_work/extract2/CHAOS_IMAGE.bin'
FW_LO, FW_HI = 0x0C000000, 0x0CE00000
WIN = 14  # instructions before the target load


def in_fw(v):
    return FW_LO <= v < FW_HI and (v & 1)


def norm(ins):
    """Normalise an instruction into a comparison token."""
    mn = ins.mnemonic.split('.')[0]
    parts = []
    for op in ins.operands:
        if op.type == 1:  # REG
            parts.append('R')
        elif op.type == 2:  # IMM
            v = op.imm
            if -0x10000 < v < 0x10000:
                parts.append(hex(v))
            else:
                parts.append('IMM')
        elif op.type == 3:  # MEM
            parts.append('MEM')
        else:
            parts.append('?')
    return mn + ' ' + ','.join(parts)


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
                ctx = hist[-WIN:] + [tok]
                sites.setdefault(v, []).append({'caller': name, 'ctx': ctx})
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
    while pos < n - 3:
        got = None
        for ins in md.disasm(img[pos:pos + 24], pos, count=1):
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
            ctx = hist[-WIN:] + [tok]
            sites.setdefault(v, []).append({'caller': None, 'site': pos, 'ctx': ctx})
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


def ctx_score(a, b):
    return difflib.SequenceMatcher(None, a, b).ratio()


def main():
    s10 = scan_tenp()
    s67 = scan_n67()
    syms = load_syms()
    refs67 = json.load(open('/workspace/n67port/refs_n67.json'))
    cand = sorted(int(k, 16) for k in refs67)
    out = {}
    for name, addr in syms:
        if addr not in s10:
            continue
        best = {}
        for w in cand:
            if w not in s67:
                continue
            best_s = 0
            for A in s10[addr]:
                for B in s67[w]:
                    sc = ctx_score(A['ctx'], B['ctx'])
                    if sc > best_s:
                        best_s = sc
            best[w] = best_s
        ranked = sorted(((round(sc, 3), hex(w)) for w, sc in best.items()), reverse=True)
        out[name] = {
            '10p': hex(addr),
            'callers': sorted({x['caller'] for x in s10[addr] if x['caller']}),
            'n_sites10': len(s10[addr]),
            'ranked': ranked[:8],
            'full': {hex(w): round(sc, 3) for w, sc in best.items()},
        }
        print(f"{name:34s} {hex(addr):>12s} n={len(s10[addr]):2d} top={ranked[:3]}")
    json.dump(out, open('/workspace/n67port/ctx_scores.json', 'w'), indent=1)


if __name__ == '__main__':
    main()
