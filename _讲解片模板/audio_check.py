"""交片前查声音。排完时间（place.py）、最好成片也出来以后跑。结果写到 声音检查.txt。

查四样（为什么查见 E:\\自媒体\\制作流程-AI热点讲解片.md 的"交片前必查"）：
1. 排好以后每句各自多响，最响和最轻差多少（应该不超过约 1.5 LU）。
2. 每句之间真的静了多久。
3. 配乐接缝在第几秒、那一刻在念什么；配乐中间有没有断档（哪半秒比全曲中等音量低 15 dB 以上）。
4. 你给的每个音效时刻，前后 0.25 秒里念的是什么字（音效不能压关键词）。
5. 机器把哪些词听成了别的词（要请用户听）。
用法：python audio_check.py [音效时刻用逗号隔开，比如 14.1,15.4,36.2]
"""
import array
import json
import math
import re
import subprocess
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')
HERE = Path(__file__).resolve().parent
placed = json.loads((HERE / 'audio' / 'placed.json').read_text(encoding='utf-8'))
ts = json.loads((HERE / 'audio' / 'timestamps.json').read_text(encoding='utf-8'))['sentences']
D = json.loads((Path(r'E:/tools/FredTalk-work/ep1/src') / placed['slot'] / 'data.json').read_text(encoding='utf-8'))
lines, VO = placed['lines'], D['VO']
flat = [(c, a, b) for line in VO for c, a, b in line]
PUNC = re.compile(r'[\s，。、？！：；…—“”（）()\[\],.?!:;"\'-]')
out = []


def lufs(path, a, b):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-ss', f'{a}', '-t', f'{b - a}', '-i', str(path), '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True, encoding='utf-8', errors='replace').stderr
    return float(re.search(r'I:\s+(-?[\d.]+) LUFS', r[r.rindex('Summary:'):]).group(1))


v = [lufs(HERE / 'audio' / 'voice_placed.wav', ln['start'], ln['end']) for ln in lines]
out.append(f'## 1 每句各自的响度：最响 {max(v):.1f}（第 {v.index(max(v)) + 1} 句），最轻 {min(v):.1f}（第 {v.index(min(v)) + 1} 句），相差 {max(v) - min(v):.1f} LU' + ('  ← 超过 1.5，要查' if max(v) - min(v) > 1.5 else ''))
out.append('\n## 2 每句之后真的静了多久，以及机器听到的字')
for i, ln in enumerate(lines):
    gap = (VO[i + 1][0][1] - VO[i][-1][2]) if i + 1 < len(lines) else D['END'] - VO[i][-1][2]
    asr = ts[i].get('asr', '')
    same = PUNC.sub('', ln['text']).lower() == asr.lower()
    out.append(f'{i + 1:2d}  {v[i]:6.1f} LUFS  之后静 {gap:.2f} 秒  {ln["text"]}' + ('' if same else f'\n      机器听到：{asr}'))
out.append('\n## 3 配乐接缝')
if D.get('seam'):
    hit = ''.join(c for c, a, b in flat if a - 0.4 <= D['seam'] <= b + 0.4)
    out.append(f'在成片第 {D["seam"]} 秒；前后 0.4 秒内念的是：{hit or "（没人说话，好）"}' + ('  ← 接缝落在说话的时候，换一次换段放' if hit else ''))
else:
    out.append('片子比曲子短，没有接缝。')
# 配乐断档：每 0.5 秒量一次，比全曲中等音量低 15 dB 以上就算断了（开头半秒和结尾 2 秒的淡出不算）
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(Path(r'E:/tools/FredTalk-work/ep1/public') / placed['slot'] / 'music.wav'), '-ac', '1', '-ar', '8000', '-f', 's16le', '-'], capture_output=True).stdout
x = array.array('h')
x.frombytes(raw[:len(raw) // 2 * 2])
db = [10 * math.log10(max(sum(s * s for s in x[k:k + 4000]) / 4000, 1)) for k in range(0, len(x) - 3999, 4000)]
med = sorted(db)[len(db) // 2]
holes = [k * 0.5 for k, v in enumerate(db) if v < med - 15 and 0.5 <= k * 0.5 < D['END'] - 2]
if holes:
    out.append('配乐断档：第 ' + '、'.join('%.1f' % h for h in holes) + ' 秒起的半秒几乎没声  ← 要查（多半是把曲子自己的结尾渐弱放出来了）')
else:
    out.append('配乐从头到尾没有断档（每半秒量一次）。')
out.append('\n## 4 音效压在什么字上')
sfx = [float(x) for x in sys.argv[1].split(',')] if len(sys.argv) > 1 else D['cuts']
if len(sys.argv) < 2:
    out.append('（没给音效时刻，下面查的是每个换段点）')
for t in sfx:
    hit = ''.join(c for c, a, b in flat if a - 0.25 <= t <= b + 0.25)
    out.append(f'{t:7.2f} 秒：{hit or "（没人说话，好）"}')
(HERE / '声音检查.txt').write_text('\n'.join(out), encoding='utf-8')
print(out[0])
