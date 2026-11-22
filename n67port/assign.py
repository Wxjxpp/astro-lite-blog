"""Combine module-call-context score + firmware-mnemonic score, then solve a
global one-to-one assignment between the 111 10p firmware symbols and the 120
firmware addresses referenced by the N67 module.
"""
import json
import re

import numpy as np
from scipy.optimize import linear_sum_assignment

FW_LO, FW_HI = 0x0C000000, 0x0CE00000


def load_syms():
    out = []
    for line in open('/workspace/Chaos-Module/symbol/10p-3.101.043/firmware.rs'):
        m = re.search(r'pub const (SYM_[A-Z0-9_]+): u32 = (0x[0-9A-Fa-f]+);', line)
        if m:
            out.append((m.group(1), int(m.group(2), 16)))
    return out


def main():
    ctx = json.load(open('/workspace/n67port/ctx_scores.json'))
    mnem = json.load(open('/workspace/n67port/symbol_candidates.json'))
    cur = json.load(open('/workspace/n67port/n67_map.json'))['symbols']
    refs = json.load(open('/workspace/n67port/refs_n67.json'))
    cand = sorted(int(k, 16) for k in refs)
    ci = {c: i for i, c in enumerate(cand)}

    syms = [(n, a) for n, a in load_syms() if FW_LO <= a < FW_HI]
    # collapse exact-address aliases: keep first name
    uniq = []
    seen = set()
    for n, a in syms:
        if a in seen:
            continue
        seen.add(a)
        uniq.append((n, a))
    syms = uniq
    names = [n for n, _ in syms]
    si = {n: i for i, n in enumerate(names)}

    S = np.full((len(syms), len(cand)), -1.0)
    for n, a in syms:
        c = ctx.get(n)
        m = mnem.get(n)
        for j, w in enumerate(cand):
            parts = []
            if c and hex(w) in c['full']:
                parts.append(0.55 * c['full'][hex(w)])
            if m:
                for sc, ww in m['candidates']:
                    if int(ww, 16) == w:
                        parts.append(0.45 * sc)
                        break
            if parts:
                S[si[n], j] = sum(parts)

    # Lock already-verified symbols strongly
    for n, a in syms:
        if n in cur:
            w = int(cur[n]['n67'], 16)
            if w in ci:
                S[si[n], ci[w]] += 5.0

    r, c = linear_sum_assignment(-S)
    rows = []
    for i, j in zip(r, c):
        n = names[i]
        if S[i, j] < 0:
            continue
        row = S[i].copy()
        row[j] = -99
        second = row.max()
        rows.append({
            'sym': n,
            '10p': hex(syms[i][1]),
            'n67': hex(cand[j]),
            'score': round(float(S[i, j]), 3),
            'raw': round(float(S[i, j] - (5.0 if n in cur else 0)), 3),
            'second': round(float(second - (5.0 if n in cur else 0)), 3),
            'margin': round(float(S[i, j] - second), 3),
            'locked': n in cur,
        })
    rows.sort(key=lambda x: (-x['score']))
    json.dump(rows, open('/workspace/n67port/assignment.json', 'w'), indent=1)
    for x in rows:
        flag = 'LOCK' if x['locked'] else ('***' if not x['locked'] and x['raw'] >= 0.70 and x['margin'] >= 0.1 else '   ')
        print(f"{flag} {x['sym']:34s} {x['10p']:>12s} -> {x['n67']:>12s} raw={x['raw']:.3f} margin={x['margin']:.3f}")


if __name__ == '__main__':
    main()
