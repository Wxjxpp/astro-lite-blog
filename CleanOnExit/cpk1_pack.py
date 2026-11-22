#!/usr/bin/env python3
"""把一个扁平二进制镜像切成 chaos-NN.dat 分片（CPK1 格式）。

算法已用原包的 37 个分片逐字节验证过，100% 还原：
  1. 按 0x8000(32KB) 对齐切窗口。
  2. 每个窗口裁掉"末尾的连续 0"，只留到最后一个非零字节。
  3. 如果某个窗口从头到尾全是 0（典型是 .bss 尾巴），直接跳过、
     不生成对应分片——包里完全没有这一段，运行时靠 malloc 出来的
     内存本来就是清零的来覆盖。
  4. 分片文件名 chaos-00.dat, chaos-01.dat... 必须连续编号、不能跳号
     （设备侧的加载器是从 00 开始一个个找文件，碰到第一个不存在的
     文件名就会认为读完了）。

用法:
    python3 cpk1_pack.py 新的chaos_sup.bin outdir/ 1584816

第三个参数是模块总大小（含 .bss），不给就用文件实际大小。

⚠️ 这个脚本只负责"怎么切分片"，不负责算 chaos-rl.dat 里的重定位表、
不负责改 main.lua 里的 CHAOS_SIZE / chaos_ctor 偏移 / info 结构体那几个
字段——这些需要你自己根据新二进制重新核对，流程见同目录
TUTORIAL.md 第 4、5 节。重定位表（chaos-rl.dat）如果用旧的，新二进制
的重定位点基本不可能对得上，大概率直接导致 Chaos 加载后行为错误/崩溃。
"""
import struct
import sys
from pathlib import Path

WINDOW = 0x8000


def split(binpath: Path, outdir: Path, total_size: int | None = None):
    data = binpath.read_bytes()
    if total_size is None:
        total_size = len(data)
    if total_size > len(data):
        data = data + b"\x00" * (total_size - len(data))

    outdir.mkdir(parents=True, exist_ok=True)

    # 找到最后一个非零字节所在的窗口，之后的窗口全部跳过不生成
    last_nonzero = -1
    for i in range(len(data) - 1, -1, -1):
        if data[i] != 0:
            last_nonzero = i
            break
    last_window = last_nonzero // WINDOW if last_nonzero >= 0 else -1

    chunk_index = 0
    for win_start in range(0, (last_window + 1) * WINDOW, WINDOW):
        win_end = min(win_start + WINDOW, total_size)
        window = data[win_start:win_end]
        # 裁掉窗口末尾连续的 0
        trimmed_len = len(window)
        while trimmed_len > 0 and window[trimmed_len - 1] == 0:
            trimmed_len -= 1
        body = window[:trimmed_len]

        name = f"chaos-{chunk_index:02d}.dat"
        payload_name = f"_lua/_Lua/{name}".encode("latin1")
        # 头部格式（已用原包验证）：
        #   "CPK1" + u32(窗口起始偏移 f1) + u32(窗口大小 0x8000, 最后一块可能更小)
        #   + u32(本分片有效数据长度 f3) + 4字节未知校验(此处填0，设备侧
        #     这4字节具体用途未核实，原包里不是固定值，先占位)
        header = b"CPK1" + struct.pack("<III", win_start, win_end - win_start, len(body))
        chunk = header + b"\x00\x00\x00\x00" + body
        (outdir / name).write_bytes(chunk)
        print(f"{name}: 偏移 {hex(win_start)}, 窗口 {win_end-win_start} 字节, "
              f"有效数据 {len(body)} 字节")
        chunk_index += 1

    print(f"\n共生成 {chunk_index} 个分片，总模块大小 {total_size} 字节")
    print("注意：头部里那 4 字节未知校验字段是占位的 0，不是原包的真实算法，"
          "真正烧录前请先搞清楚这 4 字节到底校验什么（见 TUTORIAL.md）。")


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
