"""Structure-aware matcher: mnemonic + small immediate / memory-offset pattern.

Discards register allocation (differs across builds) but keeps struct offsets and
constants (stable). Skips veneer stubs. Ranks the 120 N67 module-referenced
addresses for every 10p symbol.
"""
import difflib
import json
import re
import struct

from capstone import Cs, CS_ARCH_ARM, CS_MODE_THUMB

import lib

FW10 = '/workspace/fw_10p/vela_ap.bin'
FW67 = '/workspace/fw_n67/vela_ap.bin'
BASE10 = 0x0C0C0000
BASE67 = 0x0C080000
SIZ = 200  # bytes to disassemble per function


def is_veneer(img, base, addr):
    off = (addr & ~1) - base
    return off >= 0 and img[off:off + 4] == struct.pack('<I', 0xF000F85F)


def tokens(img, base, addr, nbytes=SIZ):
    addr &= ~1
    off = addr - base
    if not (0 <= off < len(img)):
        return []
    md = Cs(CS_ARCH_ARM, CS_MODE_THUMB)
    md.detail = True
    out = []
    for ins in md.disasm(img[off:off + nbytes], addr):
        mn = ins.mnemonic.split('.')[0]
        ops = []
        for op in ins.operands:
            if op.type == 1:            # REG
                ops.append('r')
            elif op.type == 2:          # IMM
                ops.append(hex(op.imm) if -0x10000 < op.imm < 0x10000 else 'BIG')
            elif op.type == 3:          # MEM
                d = op.mem.disp
                ops.append(('m' + hex(d)) if -0x10000 < d < 0x10000 else 'mBIG')
            else:
                ops.append('?')
        out.append(mn + ' ' + ','.join(ops))
    return out


def load_syms():
    res = []
    for line in open('/workspace/Chaos-Module/symbol/10p-3.101.043/firmware.rs'):
        m = re.search(r'pub const (SYM_[A-Z0-9_]+): u32 = (0x[0-9A-Fa-f]+);', line)
        if m:
            res.append((m.group(1), int(m.group(2), 16)))
    return res


def main():
    a = lib.load(FW10)
    b = lib.load(FW67)
    cand = sorted(int(k, 16) for k in json.load(open('/workspace/n67port/refs_n67.json')))
    cand_t = {c: tokens(b, BASE67, c) for c in cand}
    res = {}
    for name, addr in load_syms():
        if not (0x0C000000 <= addr < 0x0CE00000):
            continue
        if is_veneer(a, BASE10, addr):
            res[name] = {'veneer': True}
            continue
        t10 = tokens(a, BASE10, addr)
        if not t10:
            continue
        scored = []
        for c in cand:
            t67 = cand_t[c]
            if not t67:
                continue
            if abs(len(t67) - len(t10)) > 25:
                continue
            r = difflib.SequenceMatcher(None, t10, t67).ratio()
            # length similarity bonus
            r = 0.85 * r + 0.15 * min(len(t10), len(t67)) / max(len(t10), len(t67))
            scored.append((round(r, 3), hex(c)))
        scored.sort(reverse=True)
        res[name] = {'10p': hex(addr), 'ranked': scored[:6]}
    json.dump(res, open('/workspace/n67port/struct_scores.json', 'w'), indent=1)
    for name, v in res.items():
        if v.get('veneer'):
            print(f"{name:38s} VENEER")
        else:
            print(f"{name:38s} {v['10p']:>11s} {v['ranked'][:3]}")


if __name__ == '__main__':
    main()
