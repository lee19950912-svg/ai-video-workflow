"""把 dialog json 按段落转成 md（每段一个自然段，段间空行），给 lieflat 的 detect.py 读。
用法：python to_md.py <dialog.json> <out.md> <每段的句数，逗号分隔>"""
import json
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')
src, out, sizes = Path(sys.argv[1]), Path(sys.argv[2]), [int(x) for x in sys.argv[3].split(',')]
lines = [t for _, t in json.loads(src.read_text(encoding='utf-8'))['lines']]
assert sum(sizes) == len(lines), (sum(sizes), len(lines))
paras, i = [], 0
for n in sizes:
    paras.append(''.join(lines[i:i + n]))
    i += n
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text('\n\n'.join(paras) + '\n', encoding='utf-8')
print(out, len(lines), '句', len(paras), '段', sum(len(p) for p in paras), '字')
