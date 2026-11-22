"""Extract firmware-call targets from the 10p ELF module and the N67 raw module."""
import json
import re
import struct
import sys

from capstone import Cs, CS_ARCH_ARM, CS_MODE_THUMB
from capstone.arm import ARM_OP_IMM

import lib

TENP = '/workspace/off10p/01_chaos_sup.bin'
N67 = '/workspace/chaos_work/extract2/CHAOS_IMAGE.bin'
N67_LINK_BASE = 0x1D100000
FW_LO, FW_HI = 0x0C000000, 0x0CE00000


def in_fw(v):
    return FW_LO <= v < FW_HI and v & 1


def scan_tenp():
    data, funcs, toff = lib.module_functions(TENP)
    md = Cs(CS_ARCH_ARM, CS_MODE_THUMB)
    md.detail = True
    targets = {}
    for name, addr, size in funcs:
        code = data[addr:addr + size]
        last = {}
        for ins in lib.dis(code, addr):
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
                ent = targets.setdefault(v, {'count': 0, 'callers': []})
                ent['count'] += 1
                if name and name not in ent['callers']:
                    ent['callers'].append(name)
    return targets


def scan_n67():
    img = lib.load(N67)
    md = Cs(CS_ARCH_ARM, CS_MODE_THUMB)
    md.detail = True
    targets = {}
    pos, n, last = 0, len(img), {}
    while pos < n - 3:
        got = None
        for ins in md.disasm(img[pos:pos + 24], pos, count=1):
            got = ins
        if got is None:
            pos += 2
            last = {}
            continue
        ins = got
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
            ent = targets.setdefault(v, {'count': 0, 'sites': []})
            ent['count'] += 1
            ent['sites'].append(ins.address)
        pos += ins.size
    return targets


if __name__ == '__main__':
    a = scan_tenp()
    b = scan_n67()
    json.dump({hex(k): v for k, v in sorted(a.items())},
              open('/workspace/n67port/refs_10p.json', 'w'), indent=1)
    json.dump({hex(k): v for k, v in sorted(b.items())},
              open('/workspace/n67port/refs_n67.json', 'w'), indent=1)
    print('10p targets', len(a), 'refs', sum(x['count'] for x in a.values()))
    print('n67 targets', len(b), 'refs', sum(x['count'] for x in b.values()))
