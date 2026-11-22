#!/usr/bin/env python3
"""N67 Chaos 安装包提取/分析工具（基于本次逆向结果）。

用法:
    python3 n67_chaos_extract.py Chaos-190.bin outdir/

会做的事:
  1. 用官方 tools/p67_pack.py 的容器格式解析整个安装包（magic=0x1234A55A）。
  2. 把所有资源条目（main.lua / icon.bin / 网络声明 / chaos-NN.dat /
     chaos-rl.dat 等）原样导出到 outdir/。
  3. 解开 chaos-NN.dat 的 CPK1 分片：每个分片是"单个 0x8000 输出窗口"的
     LZ 压缩流（不是裸数据），按窗口偏移拼回真正的 CHAOS 镜像。
     CPK1 头部第 17..20 字节是压缩流的 FNV-1a 校验（本工具会核对）。
  4. 解析 chaos-rl.dat 的 CRL1 重定位表为 JSON，并核对站点值确实是
     [0x1D100000, 0x1D100000+CHAOS_SIZE] 范围内的链接期地址。
  5. 从 main.lua 里把代码部分（跳过内嵌二进制长字符串）单独导出成可读文本。

重定位结论（已由 loader 反汇编核实）:
    设备侧公式是  new = old - 0x1D100000 + 运行时执行基址，
    即 old 本身就是按 0x1D100000 链接好的绝对地址；不存在额外的"占位编码"。
    CRL1 结构 = "CRL1" + u32(站点数) + u32(镜像总大小) + u32(FNV-1a(站点表))
                + 站点数 * u32(升序偏移)。
"""
import struct, sys, json, re
from pathlib import Path

MAGIC = 0x1234A55A
PAIR_OFF = 0xA8
PAIRS = 11
DEF_SIZE = 16

FNV_INIT = 0x811C9DC5
FNV_PRIME = 0x01000193


def fnv1a(data, h=FNV_INIT):
    for b in data:
        h = ((h ^ b) * FNV_PRIME) & 0xFFFFFFFF
    return h


def lz_decode(src, expected=None):
    """解 CPK1 分片里的 LZ 流。

    格式与 main.lua 的 data_assets 解压器一致：
      t = 下一字节
      t < 128 : 字面量，复制随后 t 字节（t 不能为 0）
      t >= 128: 回溯，读 u16 距离 d，复制 (t-128+4) 字节，允许重叠
    """
    out = bytearray()
    i = 0
    while i < len(src):
        t = src[i]
        i += 1
        if t < 128:
            if t == 0:
                raise ValueError("LZ 字面量长度为 0")
            if i + t > len(src):
                raise ValueError("LZ 字面量越界")
            out += src[i:i + t]
            i += t
        else:
            if i + 2 > len(src):
                raise ValueError("LZ 回溯参数越界")
            d = src[i] | (src[i + 1] << 8)
            i += 2
            n = t - 128 + 4
            if d == 0 or d > len(out):
                raise ValueError(f"LZ 回溯距离非法: {d} > 已输出 {len(out)}")
            start = len(out) - d
            for k in range(n):
                out.append(out[start + k])
        if expected is not None and len(out) > expected:
            raise ValueError("LZ 输出超过窗口大小")
    return bytes(out)


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
    style_bytes = buf[0x100:0x148].split(b"\0", 1)[0]
    spec = {
        "preview": str(preview_path),
        "version": struct.unpack_from("<I", buf, 4)[0],
        "id": id_bytes.decode("latin1"),
        "name": name_bytes.decode("utf-8", "replace"),
        "styleName": style_bytes.decode("utf-8", "replace"),
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
    """解压 chaos-NN.dat 分片，拼回真正按 0x1D100000 链接的 CHAOS 镜像。"""
    chunk_files = []
    for p in outdir.glob("*_chaos-*.dat"):
        m = re.search(r"chaos-(\d+)\.dat$", p.name)
        if m:
            chunk_files.append((int(m.group(1)), p))
    chunk_files.sort()
    if not chunk_files:
        print("[分片] 未找到 chaos-NN.dat，跳过")
        return None

    # 从 chaos-rl.dat 读镜像总大小（含 .bss）和站点表，用于校验
    total, sites = None, []
    for p in outdir.glob("*_chaos-rl.dat"):
        data = p.read_bytes()
        if data[:4] == b"CRL1":
            body = data[4:]
            n = len(body) // 4
            vals = struct.unpack("<%dI" % n, body[:n * 4])
            total, sites = vals[1], list(vals[3:])

    image = bytearray(total) if total else bytearray()
    covered = 0
    for n, p in chunk_files:
        raw = p.read_bytes()
        assert raw[:4] == b"CPK1", f"chaos-{n:02d}.dat 头部不是 CPK1"
        f1, f2, f3 = struct.unpack_from("<III", raw, 4)
        check = struct.unpack_from("<I", raw, 16)[0]
        comp = raw[20:20 + f3]
        if fnv1a(comp) != check:
            raise ValueError(f"chaos-{n:02d}.dat 的 FNV-1a 校验不符")
        out = lz_decode(comp, expected=f2)
        if len(out) != f2:
            print(f"[分片] 警告: chaos-{n:02d}.dat 解出 {len(out)} 字节，头部声明窗口 {f2}")
        need = f1 + len(out)
        if len(image) < need:
            image.extend(b"\x00" * (need - len(image)))
        image[f1:need] = out
        covered = max(covered, need)
        print(f"[分片] chaos-{n:02d}.dat -> 偏移 {hex(f1)}，"
              f"压缩 {len(comp)} 字节，解出 {len(out)} 字节")

    out_path = outdir / "CHAOS_IMAGE.bin"
    out_path.write_bytes(bytes(image))
    print(f"[分片] 解压完成: {out_path} ({len(image)} 字节，"
          f"有效覆盖 {covered} 字节 / {hex(covered)})")

    if sites and total:
        bad = 0
        for s in sites:
            if s + 4 > len(image):
                bad += 1
                continue
            v = struct.unpack_from("<I", image, s)[0]
            if not (0x1D100000 <= v <= 0x1D100000 + total):
                bad += 1
        if bad:
            print(f"[分片] 警告: {bad}/{len(sites)} 个重定位站点不在链接地址范围")
        else:
            print(f"[分片] 重定位站点校验通过: {len(sites)}/{len(sites)} 都是 "
                  f"[0x1D100000, 0x1D100000+{total}] 的链接期地址")
    return image


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
    calc = fnv1a(struct.pack("<%dI" % len(sites), *sites))
    out = {
        "reloc_count_field": reloc_count,
        "module_total_size_field": total_size,
        "fnv1a_hash_field": hex(fnv1a_hash),
        "fnv1a_recomputed": hex(calc),
        "fnv1a_ok": calc == fnv1a_hash,
        "actual_site_count": len(sites),
        "sites": [hex(s) for s in sites],
    }
    (outdir / "chaos_rl_decoded.json").write_text(json.dumps(out, indent=1))
    print(f"[重定位] {len(sites)} 个站点, 声明总大小 {total_size}, "
          f"FNV-1a={hex(fnv1a_hash)} ({'校验通过' if calc == fnv1a_hash else '校验失败'})")


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
