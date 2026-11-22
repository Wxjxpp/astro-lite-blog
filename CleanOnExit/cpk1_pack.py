#!/usr/bin/env python3
"""把一个按 0x1D100000 链接好的扁平镜像切成 chaos-NN.dat 分片（CPK1 格式）。

格式（由安装包 + loader 反汇编确认）:
    "CPK1" + u32(窗口在镜像里的起始偏移 f1)
           + u32(该窗口解压后的大小 f2，通常 0x8000，最后一块更小)
           + u32(压缩流长度 f3)
           + u32(FNV-1a(压缩流))
           + 压缩流

压缩流是 main.lua data_assets 用的同一套 LZ:
    t < 128 : 字面量，随后 t 字节（t 必须是 1..127）
    t >= 128: 回溯，随后 u16 距离，复制 (t-128+4) 字节（允许重叠）
每个分片独立压缩、只覆盖自己的一个输出窗口；回溯不会跨窗口。

用法:
    python3 cpk1_pack.py CHAOS_IMAGE.bin outdir/ [模块总大小(含 .bss)]

模块总大小只用于打印和与 main.lua 的 CHAOS_SIZE 对照；分片覆盖范围由
镜像最后一个非零字节决定（末尾全零的 .bss 不落盘）。
"""
import struct
import sys
from pathlib import Path

WINDOW = 0x8000
MIN_MATCH = 4
MAX_MATCH = 131
FNV_INIT = 0x811C9DC5
FNV_PRIME = 0x01000193


def fnv1a(data, h=FNV_INIT):
    for b in data:
        h = ((h ^ b) * FNV_PRIME) & 0xFFFFFFFF
    return h


def lz_encode(data: bytes) -> bytes:
    n = len(data)
    out = bytearray()
    lit = bytearray()

    def flush():
        nonlocal lit, out
        j = 0
        while j < len(lit):
            take = min(127, len(lit) - j)
            out.append(take)
            out += lit[j:j + take]
            j += take
        lit = bytearray()

    prev = [-1] * n
    heads: dict[int, int] = {}
    i = 0
    while i < n:
        best_len = 0
        best_dist = 0
        if i + 3 <= n:
            key = data[i] | (data[i + 1] << 8) | (data[i + 2] << 16)
            cand = heads.get(key, -1)
            max_len = min(MAX_MATCH, n - i)
            depth = 0
            while cand >= 0 and depth < 32 and i - cand <= 0xFFFF:
                if best_len == 0 or (i + best_len < n and data[cand + best_len] == data[i + best_len]):
                    ln = 0
                    while ln < max_len and data[cand + ln] == data[i + ln]:
                        ln += 1
                    if ln > best_len:
                        best_len, best_dist = ln, i - cand
                        if ln == max_len:
                            break
                cand = prev[cand]
                depth += 1
            prev[i] = heads.get(key, -1)
            heads[key] = i

        if best_len >= MIN_MATCH:
            flush()
            out.append(128 + best_len - 4)
            out += struct.pack("<H", best_dist)
            for k in range(i + 1, min(i + best_len, n - 2)):
                kk = data[k] | (data[k + 1] << 8) | (data[k + 2] << 16)
                prev[k] = heads.get(kk, -1)
                heads[kk] = k
            i += best_len
        else:
            lit.append(data[i])
            i += 1
    flush()
    return bytes(out)


def split(binpath: Path, outdir: Path, total_size: int | None = None):
    data = binpath.read_bytes()
    if not data:
        raise ValueError("镜像为空")
    total_size = total_size if total_size is not None else len(data)

    last_nonzero = -1
    for i in range(len(data) - 1, -1, -1):
        if data[i] != 0:
            last_nonzero = i
            break
    if last_nonzero < 0:
        raise ValueError("镜像全是 0")
    covered = (last_nonzero + 1 + 3) & ~3
    if covered > total_size:
        raise ValueError(f"有效数据 {covered} 超过模块总大小 {total_size}")

    outdir.mkdir(parents=True, exist_ok=True)
    chunk_count = (covered + WINDOW - 1) // WINDOW
    total_comp = 0
    for idx in range(chunk_count):
        win_start = idx * WINDOW
        win_end = min(win_start + WINDOW, covered)
        comp = lz_encode(data[win_start:win_end])
        header = (b"CPK1" + struct.pack("<III", win_start, win_end - win_start, len(comp))
                  + struct.pack("<I", fnv1a(comp)))
        (outdir / f"chaos-{idx:02d}.dat").write_bytes(header + comp)
        total_comp += len(comp)
        print(f"chaos-{idx:02d}.dat: 偏移 {hex(win_start)}, 窗口 {win_end - win_start} 字节, "
              f"压缩 {len(comp)} 字节")

    print(f"\n共 {chunk_count} 个分片, 镜像有效长度 {covered} ({hex(covered)}), "
          f"模块总大小 {total_size}, 压缩后合计 {total_comp} 字节")
    print("main.lua 需要同步的信息结构体字段:")
    print(f"  CHAOS_SIZE   = {total_size}")
    print(f"  覆盖长度     = {covered}")
    print(f"  分片数       = {chunk_count}")
    print("  重定位站点数 / FNV-1a 由 chaos-rl.dat 决定（见 n67_chaos_extract.py 的输出）")


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    binpath = Path(sys.argv[1])
    outdir = Path(sys.argv[2])
    total_size = int(sys.argv[3]) if len(sys.argv) > 3 else None
    split(binpath, outdir, total_size)


if __name__ == "__main__":
    main()
