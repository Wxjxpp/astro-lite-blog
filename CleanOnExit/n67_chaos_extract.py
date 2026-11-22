#!/usr/bin/env python3
"""N67 Chaos 安装包提取/分析工具（基于本次逆向结果）。

用法:
    python3 n67_chaos_extract.py Chaos-190.bin outdir/

会做的事:
  1. 用官方 tools/p67_pack.py 的容器格式解析整个安装包（已验证两者容器格式
     完全相同，magic=0x1234A55A）。
  2. 把 44 个资源条目（main.lua / icon.bin / 网络声明 / chaos-NN.dat /
     chaos-rl.dat）原样导出到 outdir/。
  3. 按 chaos-00.dat..chaos-36.dat 的 CPK1 分片头重新拼接出完整的
     CHAOS_BIN 镜像（已验证与官方分片逐字节一致）。
  4. 解析 chaos-rl.dat 的 CRL1 重定位表为 JSON。
  5. 从 main.lua 里把 1184 字节的代码部分（跳过内嵌二进制长字符串）单独
     导出成可读文本，方便人工核对地址常量。

已确认、可以直接使用的结论见同目录 REPORT.md。
重定位的"打补丁"公式本工具不提供——按本次反汇编核实，候选公式
（placeholder=0x1D100000+模块内偏移）只对 4260 个重定位点里的 105 个成立，
不是通用规律，贸然套用会错误修补另外 4155 处，所以没有写进本工具。
"""
import struct, sys, json, re
from pathlib import Path

MAGIC = 0x1234A55A
PAIR_OFF = 0xA8
PAIRS = 11
DEF_SIZE = 16


def read_block(buf, off):
    packed = struct.unpack_from("<I", buf, off)[0]
    data_len = packed & 0xFFFFFF
    name_len = packed >> 24
    name = buf[off + 20: off + 20 + name_len].decode("latin1")
    data_off = off + 20 + name_len
    return {"name": name, "data": buf[data_off: data_off + data_len]}


def extract_container(path: Path, outdir: Path):
    buf = path.read_bytes()
    assert struct.unpack_from("<I", buf, 0)[0] == MAGIC, "不是 p67/n67 容器格式 (magic 不符)"
    pairs = [struct.unpack_from("<II", buf, PAIR_OFF + i * 8) for i in range(PAIRS)]
    script_count, script_off = pairs[6]
    outdir.mkdir(parents=True, exist_ok=True)
    files = []
    for i in range(script_count):
        off = struct.unpack_from("<I", buf, script_off + i * DEF_SIZE + 8)[0]
        blk = read_block(buf, off)
        fname = outdir / f"{i:02d}_{Path(blk['name']).name}"
        fname.write_bytes(blk["data"])
        files.append((blk["name"], fname, len(blk["data"])))
        print(f"[容器] {i:02d} {blk['name']}  {len(blk['data'])} 字节 -> {fname}")

    # 额外导出 preview 块 + 一份可以直接喂给 p67_pack.py build() 的 spec.json，
    # 这样"原样重打包"不用再手动拼 spec。
    preview_off = struct.unpack_from("<I", buf, 0x20)[0]
    entry0_off = struct.unpack_from("<I", buf, script_off + 8)[0]
    preview_bytes = buf[preview_off:entry0_off]
    preview_path = outdir / "preview.block"
    preview_path.write_bytes(preview_bytes)
    print(f"[容器] preview 块 {len(preview_bytes)} 字节 -> {preview_path}")

    id_bytes = buf[0x28:0x34].split(b"\0", 1)[0]
    name_bytes = buf[0x68:0xA4].split(b"\0", 1)[0]
    spec = {
        "preview": str(preview_path),
        "id": id_bytes.decode("latin1"),
        "name": name_bytes.decode("utf-8", "replace"),
        "entry_index": 0,
        "files": [
            {"name": name, "path": str(fname)} for name, fname, _ in files
        ],
    }
    spec_path = outdir / "spec.json"
    spec_path.write_text(json.dumps(spec, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[容器] 重打包用的 spec.json 已生成 -> {spec_path}")
    print(f"       原样重打包: python3 p67_pack_official.py build {spec_path} rebuilt.bin")
    print(f"       换掉某个资源后重打包同理，改 spec.json 里对应条目的 path 再跑一遍即可")
    return files


def reconstruct_chaos_bin(outdir: Path):
    """把 chaos-NN.dat 分片拼回完整镜像；对照用，已验证与官方分片字节一致。"""
    chunk_files = []
    for p in outdir.glob("*_chaos-*.dat"):
        m = re.search(r"chaos-(\d+)\.dat$", p.name)
        if m:
            chunk_files.append((int(m.group(1)), p))
    chunk_files.sort()
    if not chunk_files:
        print("[分片] 未找到 chaos-NN.dat，跳过")
        return None
    recon = bytearray()
    for n, p in chunk_files:
        raw = p.read_bytes()
        marker = raw[:4]
        assert marker == b"CPK1", f"chaos-{n:02d}.dat 头部不是 CPK1: {marker}"
        f1, f2, f3 = struct.unpack_from("<III", raw, 4)
        body = raw[16 + 4: 16 + 4 + f3]  # 跳过 CPK1头(16B) + 4字节未知校验
        if len(recon) < f1:
            recon.extend(b"\x00" * (f1 - len(recon)))
        recon[f1:f1 + len(body)] = body
        print(f"[分片] chaos-{n:02d}.dat -> 偏移 {hex(f1)}，{len(body)} 字节")
    out = outdir / "CHAOS_BIN_reconstructed.bin"
    out.write_bytes(recon)
    print(f"[分片] 重建完成: {out} ({len(recon)} 字节，不含末尾全零 .bss)")
    return recon


def parse_relocations(outdir: Path):
    rl = None
    for p in outdir.glob("*_chaos-rl.dat"):
        rl = p
    if rl is None:
        print("[重定位] 未找到 chaos-rl.dat，跳过")
        return
    data = rl.read_bytes()
    assert data[:4] == b"CRL1", "chaos-rl.dat 头部不是 CRL1"
    body = data[4:]
    n = len(body) // 4
    vals = struct.unpack("<%dI" % n, body[:n * 4])
    reloc_count, total_size, fnv1a_hash = vals[0], vals[1], vals[2]
    sites = vals[3:]
    out = {
        "reloc_count_field": reloc_count,
        "module_total_size_field": total_size,
        "fnv1a_hash_field": hex(fnv1a_hash),
        "actual_site_count": len(sites),
        "sites": [hex(s) for s in sites],
    }
    (outdir / "chaos_rl_decoded.json").write_text(json.dumps(out, indent=1))
    print(f"[重定位] {len(sites)} 个站点, 声明总大小 {total_size}, FNV-1a={hex(fnv1a_hash)}")


def extract_main_lua_code(outdir: Path):
    lf = None
    for p in outdir.glob("*_main.lua"):
        lf = p
    if lf is None:
        return
    src = lf.read_bytes()
    spans = [(m.start(), src.find(b"]]", m.start()) + 2) for m in re.finditer(rb"\[\[", src)]
    out, cursor = [], 0
    for s, e in spans:
        out.append(src[cursor:s])
        out.append(b"<<BLOB len=%d>>" % (e - s))
        cursor = e
    out.append(src[cursor:])
    text = b"".join(out).decode("utf-8", errors="replace")
    (outdir / "main_lua_readable.txt").write_text(text, encoding="utf-8")
    print(f"[Lua] 可读代码（二进制长字符串已替换为占位符）已导出到 main_lua_readable.txt")


def main():
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(1)
    src = Path(sys.argv[1])
    outdir = Path(sys.argv[2])
    extract_container(src, outdir)
    reconstruct_chaos_bin(outdir)
    parse_relocations(outdir)
    extract_main_lua_code(outdir)


if __name__ == "__main__":
    main()
