"""Cross-match Chaos modules (10p ELF vs N67 raw) by referenced string sets.

For every function that references firmware entry addresses, we also collect the
string literals it references.  Functions from the two builds are paired by the
Jaccard similarity of those string sets; each pair votes for (10p addr -> N67 addr).
"""
import bisect
import collections
import json
import re
import struct

from capstone import Cs, CS_ARCH_ARM, CS_MODE_THUMB
from capstone.arm import ARM_OP_IMM

import lib

TENP = '/workspace/off10p/01_chaos_sup.bin'
N67 = '/workspace/chaos_work/extract2/CHAOS_IMAGE.bin'
N67_LINK_BASE = 0x1D100000
FW_RANGES = [(0x0C000000, 0x0CE00000), (0x1C000000, 0x1C800000), (0x00200000, 0x00300000)]


def in_fw(v):
    return v & 1 and any(lo <= v < hi for lo, hi in FW_RANGES)


BAD_STR = ('License', 'GNU', 'WARRANTY', 'Copyright', 'Free Software', 'Foundation',
           'Permission is hereby', 'WITHOUT ANY')


def ok_str(s):
    return (s and len(s) >= 6 and all(31 < ord(c) < 127 for c in s)
            and not any(b in s for b in BAD_STR))


class Elf:
    def __init__(self, path):
        self.d = lib.load(path)
        shoff = struct.unpack_from('<I', self.d, 0x20)[0]
        ents, num, shstr = struct.unpack_from('<HHH', self.d, 0x2E)
        self.secs = [struct.unpack_from('<IIIIIIIIII', self.d, shoff + i * ents) for i in range(num)]
        ss = self.d[self.secs[shstr][4]:self.secs[shstr][4] + self.secs[shstr][5]]
        self.names = {}
        for i, s in enumerate(self.secs):
            e = ss.find(b'\0', s[0])
            self.names[ss[s[0]:e].decode()] = i
        self.by = {n: self.secs[i] for n, i in self.names.items()}

    def sec(self, n):
        return self.by[n]

    def syms(self):
        st = self.by['.symtab']
        strt = self.d[self.secs[st[6]][4]:self.secs[st[6]][4] + self.secs[st[6]][5]]
        out = []
        for i in range(st[5] // 16):
            name, val, size, info, other, sh = struct.unpack_from('<IIIBBH', self.d, st[4] + i * 16)
            e = strt.find(b'\0', name)
            out.append((strt[name:e].decode('utf8', 'replace'), val, size, sh))
        return out


def read_rostr(elf, va):
    ro = elf.sec('.rodata')
    o = va - ro[3]
    rd = elf.d[ro[4]:ro[4] + ro[5]]
    if 0 <= o < len(rd):
        e = rd.find(b'\0', o, o + 200)
        if e > o:
            try:
                s = rd[o:e].decode('utf8')
            except UnicodeDecodeError:
                return None
            if ok_str(s):
                return s
    return None


def mov_imm16(hw1, hw2):
    return ((hw1 & 0xf) << 12) | (((hw1 >> 10) & 1) << 11) | (((hw2 >> 12) & 7) << 8) | (hw2 & 0xff)


def tenp_analysis():
    elf = Elf(TENP)
    text, funcs, _ = lib.module_functions(TENP)
    td = text
    addrs = [f[1] for f in funcs]

    def owner(a):
        j = bisect.bisect_right(addrs, a) - 1
        if j >= 0 and funcs[j][1] <= a < funcs[j][1] + funcs[j][2]:
            return funcs[j]
        return None

    reltab = elf.sec('.rel.text')
    rels = []
    for off in range(reltab[4], reltab[4] + reltab[5], 8):
        r, info = struct.unpack_from('<II', elf.d, off)
        rels.append((r, info >> 8, info & 0xff))
    syms = elf.syms()

    # strings
    fstr = collections.defaultdict(set)
    movw = {}
    for r, si, typ in rels:
        _, val, _, sh = syms[si]
        if typ == 2:
            w = struct.unpack_from('<I', td, r)[0]
            va = val + w
            s = read_rostr(elf, va)
            if s is None and w:
                s = read_rostr(elf, elf.sec('.rodata')[3] + w)
        elif typ in (47, 48):
            hw1, hw2 = struct.unpack_from('<HH', td, r)
            v = mov_imm16(hw1, hw2)
            if typ == 47:
                movw[r] = (si, v)
                continue
            s = None
            for back in range(2, 18, 2):
                k = r - back
                if k in movw and movw[k][0] == si:
                    va = val + ((v << 16) | movw[k][1])
                    s = read_rostr(elf, va)
                    if s is None:
                        s = read_rostr(elf, elf.sec('.rodata')[3] + ((v << 16) | movw[k][1]))
                    break
        else:
            continue
        if s:
            o = owner(r)
            if o:
                fstr[o[1]].add(s)

    # firmware refs
    fw = collections.defaultdict(collections.Counter)
    md = Cs(CS_ARCH_ARM, CS_MODE_THUMB)
    md.detail = True
    for name, a, size in funcs:
        last = {}
        for ins in lib.dis(code := td[a:a + size], a):
            v = None
            if ins.mnemonic == 'ldr' and '[pc' in ins.op_str:
                m = re.search(r'#(0x[0-9a-f]+)', ins.op_str)
                if m:
                    lit = ((ins.address + 4) & ~3) + int(m.group(1), 16)
                    if 0 <= lit <= len(td) - 4:
                        v = struct.unpack_from('<I', td, lit)[0]
            elif ins.mnemonic == 'movw' and len(ins.operands) > 1 and ins.operands[1].type == ARM_OP_IMM:
                last[ins.operands[0].reg] = ins.operands[1].imm
            elif ins.mnemonic == 'movt' and len(ins.operands) > 1 and ins.operands[1].type == ARM_OP_IMM:
                rg = ins.operands[0].reg
                if rg in last:
                    v = (ins.operands[1].imm << 16) | (last[rg] & 0xffff)
                    last.pop(rg, None)
            if v is not None and in_fw(v):
                fw[a][v] += 1
    return funcs, fstr, fw


def n67_analysis():
    img = lib.load(N67)
    # prologue-based regions
    starts = set([0])
    for i in range(0, len(img) - 4, 2):
        h = img[i] | (img[i + 1] << 8)
        if (h >> 8) == 0xb5 or (h == 0xe92d and (img[i + 3] & 0x40)):
            starts.add(i)
    starts = sorted(starts)
    # also add BL targets
    md = Cs(CS_ARCH_ARM, CS_MODE_THUMB)
    md.detail = True
    pos = 0
    bl_targets = set()
    while pos < len(img) - 3:
        got = None
        for ins in md.disasm(img[pos:pos + 24], pos, count=1):
            got = ins
        if got is None:
            pos += 2
            continue
        if got.mnemonic == 'bl' and got.operands and got.operands[0].type == ARM_OP_IMM:
            t = got.operands[0].imm
            if 0 <= t < len(img):
                bl_targets.add(t)
        pos += got.size
    starts = sorted(set(starts) | bl_targets)
    addrs = starts

    def owner(a):
        j = bisect.bisect_right(addrs, a) - 1
        return addrs[j]

    fstr = collections.defaultdict(set)
    for off in range(0, len(img) - 3, 4):
        v = struct.unpack_from('<I', img, off)[0]
        if N67_LINK_BASE <= v < N67_LINK_BASE + len(img):
            o = v - N67_LINK_BASE
            e = img.find(b'\0', o, o + 200)
            if e > o:
                try:
                    s = img[o:e].decode('utf8')
                except UnicodeDecodeError:
                    continue
                if ok_str(s):
                    fstr[owner(off)].add(s)

    # firmware refs with sites
    fw = collections.defaultdict(collections.Counter)
    pos = 0
    last = {}
    while pos < len(img) - 3:
        got = None
        for ins in md.disasm(img[pos:pos + 24], pos, count=1):
            got = ins
        if got is None:
            pos += 2
            last = {}
            continue
        v = None
        if got.mnemonic == 'ldr' and '[pc' in got.op_str:
            m = re.search(r'#(0x[0-9a-f]+)', got.op_str)
            if m:
                lit = ((got.address + 4) & ~3) + int(m.group(1), 16)
                if 0 <= lit <= len(img) - 4:
                    v = struct.unpack_from('<I', img, lit)[0]
        elif got.mnemonic == 'movw' and len(got.operands) > 1 and got.operands[1].type == ARM_OP_IMM:
            last[got.operands[0].reg] = got.operands[1].imm
        elif got.mnemonic == 'movt' and len(got.operands) > 1 and got.operands[1].type == ARM_OP_IMM:
            rg = got.operands[0].reg
            if rg in last:
                v = (got.operands[1].imm << 16) | (last[rg] & 0xffff)
                last.pop(rg, None)
        if v is not None and in_fw(v):
            fw[owner(pos)][v] += 1
        pos += got.size
    return starts, fstr, fw


def main():
    _, s10, fw10 = tenp_analysis()
    _, s67, fw67 = n67_analysis()
    # rarity
    df = collections.Counter()
    for st in s67.values():
        for s in st:
            df[s] += 1
    funcs10 = [a for a in s10 if s10[a]]
    funcs67 = [a for a in s67 if s67[a]]
    matches = []
    for a in funcs10:
        best = (0, None, [])
        for b in funcs67:
            common = s10[a] & s67[b]
            if not common:
                continue
            score = sum(1.0 / df[s] for s in common)
            if score > best[0]:
                best = (score, b, sorted(common))
        if best[1] is not None:
            matches.append((best[0], a, best[1], best[2], fw10.get(a), fw67.get(best[1])))
    matches.sort(reverse=True)

    # votes: (10p_off -> n67_off)
    votes = collections.Counter()
    evidence = collections.defaultdict(list)
    for score, a, b, common, fa, fb in matches:
        if not fa or not fb:
            continue
        if len(fa) == 1 and len(fb) == 1:
            x = next(iter(fa))
            y = next(iter(fb))
            votes[(x, y)] += 1
            evidence[(x, y)].append((a, b, common[:2], round(score, 2)))

    out = []
    for (x, y), n in votes.most_common():
        out.append({'10p': hex(x), 'n67': hex(y), 'votes': n,
                    'evidence': [{'f10': hex(a), 'f67': hex(b), 'strings': c, 'score': s}
                                 for a, b, c, s in evidence[(x, y)][:4]]})
    json.dump(out, open('/workspace/n67port/module_votes.json', 'w'), indent=1)
    print('matched 10p funcs', len(matches), 'votes', len(out))
    for r in out[:20]:
        print(r['10p'], '->', r['n67'], 'votes', r['votes'], r['evidence'][0]['strings'])


if __name__ == '__main__':
    main()
