"""Helpers for Chaos module + Vela firmware reverse engineering."""
import struct
from capstone import Cs, CS_ARCH_ARM, CS_MODE_THUMB
from capstone.arm import ARM_OP_REG, ARM_OP_IMM, ARM_OP_MEM, ARM_REG_PC

FW_BASE = 0x0C0C0000


def load(p):
    return open(p, 'rb').read()


def elf_syms(data):
    shoff = struct.unpack_from('<I', data, 0x20)[0]
    shentsize, shnum, shstrndx = struct.unpack_from('<HHH', data, 0x2E)
    secs = []
    for i in range(shnum):
        off = shoff + i * shentsize
        name, typ, flags, addr, offset, size, link, info, align, entsize = \
            struct.unpack_from('<IIIIIIIIII', data, off)
        secs.append(dict(name_off=name, type=typ, addr=addr, off=offset, size=size,
                         link=link, entsize=entsize))
    shstr = data[secs[shstrndx]['off']:secs[shstrndx]['off'] + secs[shstrndx]['size']]
    for s in secs:
        e = shstr.find(b'\0', s['name_off'])
        s['name'] = shstr[s['name_off']:e].decode()
    return secs


def module_functions(path):
    """Return list of (name, addr, size) for .text FUNC symbols and dict of .text info."""
    data = load(path)
    secs = elf_syms(data)
    by = {s['name']: s for s in secs}
    symtab = by['.symtab']
    strtab_sec = secs[symtab['link']]
    strtab = data[strtab_sec['off']:strtab_sec['off'] + strtab_sec['size']]
    text = by['.text']
    funcs = []
    for i in range(symtab['size'] // 16):
        name, val, size, info, other, shndx = struct.unpack_from(
            '<IIIBBH', data, symtab['off'] + i * 16)
        e = strtab.find(b'\0', name)
        nm = strtab[name:e].decode('utf-8', 'replace')
        if (info & 0xf) == 2 and shndx == 1 and size > 0:
            funcs.append((nm, val & ~1, size))
    funcs.sort(key=lambda x: x[1])
    return data[text['off']:text['off'] + text['size']], funcs, text['off']


def dis(code, addr, count=0):
    md = Cs(CS_ARCH_ARM, CS_MODE_THUMB)
    md.detail = True
    out = []
    for ins in md.disasm(code, addr, count):
        out.append(ins)
    return out


def enclosing(funcs, addr):
    """funcs sorted list of (name,addr,size); return name whose range covers addr."""
    import bisect
    addrs = [f[1] for f in funcs]
    i = bisect.bisect_right(addrs, addr) - 1
    while i >= 0:
        nm, a, sz = funcs[i]
        if a <= addr < a + sz:
            return nm
        i -= 1
    return None


def fw_string(img, addr):
    off = addr - FW_BASE
    if not (0 <= off < len(img)):
        return None
    e = img.find(b'\0', off, off + 256)
    if e < 0:
        return None
    return img[off:e].decode('utf-8', 'replace')
