"""Rank N67 firmware addresses as candidates for every 10p Chaos symbol."""
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
SYM = '/workspace/Chaos-Module/symbol/10p-3.101.043/firmware.rs'


def load_syms():
    out = []
    for line in open(SYM):
        m = re.search(r'pub const (SYM_[A-Z0-9_]+): u32 = (0x[0-9A-Fa-f]+);', line)
        if m:
            out.append((m.group(1), int(m.group(2), 16)))
    return out


def tokens(img, base, addr, nbytes=200):
    addr &= ~1
    off = addr - base
    if not (0 <= off < len(img)):
        return [], False
    md = Cs(CS_ARCH_ARM, CS_MODE_THUMB)
    toks = []
    variadic = False
    for i, ins in enumerate(md.disasm(img[off:off + nbytes], addr)):
        if i < 3 and ins.mnemonic == 'push' and 'r1' in ins.op_str and 'r3' in ins.op_str:
            variadic = True
        toks.append(ins.mnemonic.split('.')[0])
    return toks, variadic


def main():
    a = lib.load(FW10)
    b = lib.load(FW67)
    cand = sorted(int(k, 16) for k in json.load(open('/workspace/n67port/refs_n67.json')))
    cand_t = {c: tokens(b, BASE67, c) for c in cand}
    res = {}
    for name, addr in load_syms():
        if addr < 0x0C000000 or addr >= 0x0CE00000:
            continue
        t10, v10 = tokens(a, BASE10, addr)
        if not t10:
            continue
        scored = []
        for c in cand:
            t67, v67 = cand_t[c]
            if not t67:
                continue
            # length gate
            if abs(len(t67) - len(t10)) > 30:
                continue
            r = difflib.SequenceMatcher(None, t10, t67).ratio()
            if v10 == v67:
                r += 0.05
            scored.append((round(r, 3), c))
        scored.sort(reverse=True)
        res[name] = {'10p': hex(addr), 'candidates': [(s, hex(c)) for s, c in scored[:5]]}
    json.dump(res, open('/workspace/n67port/symbol_candidates.json', 'w'), indent=1)
    for k, v in res.items():
        print(k, v['10p'], v['candidates'][:3])


if __name__ == '__main__':
    main()
