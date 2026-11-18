"""把成片拆成审片材料：逐秒画面拼图、几处连拍、声音的波形和频谱图、声音数据表。材料出在 review\\审片材料\\。

用法：python make_review_pack.py 成片文件名     （在本期的 review 文件夹里跑）
给独立审查员（reviewer）看时：画面和声音分两个人审；只给材料，不给自己的结论；交回来的每一条自己再核实。
"""
import json
import math
import re
import subprocess
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')
HERE = Path(__file__).resolve().parent
EP = HERE.parent
if len(sys.argv) < 2:
    sys.exit('用法：python make_review_pack.py 成片文件名')
FILM = EP / sys.argv[1]
OUT = HERE / '审片材料'
OUT.mkdir(exist_ok=True)
W = Path(r'E:/tools/FredTalk-work/ep1')
FF = ['ffmpeg', '-v', 'error', '-y']
PLACED = json.loads((EP / 'audio' / 'placed.json').read_text(encoding='utf-8'))
SLOT = PLACED['slot']
D = json.loads((W / 'src' / SLOT / 'data.json').read_text(encoding='utf-8'))
C, LS = D['cuts'], D['LS']


def run(a):
    return subprocess.run(a, check=True)


# 1 逐秒画面：每 1.25 秒一格，每张 12 格（一张管 15 秒）。第 n 格的时刻 = 文件名里的秒数 + 0.625 + 1.25 ×（n − 1）
dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(FILM)], capture_output=True, text=True).stdout)
for i in range(int(dur // 15) + 1):
    a = i * 15
    run(FF + ['-ss', str(a), '-t', '15', '-i', str(FILM), '-vf', 'fps=0.8,scale=960:-1,tile=4x3:padding=6:color=black', '-frames:v', '1', '-q:v', '3', str(OUT / f'画面_{a:03d}秒起_每1.25秒一格.jpg')])

# 2 连拍：几处关键动作，每 0.1 秒一格
bursts = {'连拍_开头前2.4秒': 0.0, '连拍_第一次换段': C[0] - 0.5, '连拍_第二次换段': C[min(1, len(C) - 1)] - 0.5, '连拍_角色说话_中文': LS[1] + 0.5, '连拍_结尾进场': C[-1] - 0.6, '连拍_最后一问': LS[-1] - 0.3}
for line in D['VO']:                                  # 再加一处念英文词的地方，看嘴抖不抖
    lat = [a for ch, a, b in line if re.match(r'[A-Za-z]', ch)]
    if len(lat) >= 5:
        bursts['连拍_角色说话_英文'] = lat[0] - 0.3
        break
for name, a in bursts.items():
    run(FF + ['-ss', f'{max(0, a):.2f}', '-t', '2.4', '-i', str(FILM), '-vf', 'fps=10,scale=960:-1,tile=6x4:padding=6:color=black', '-frames:v', '1', '-q:v', '3', str(OUT / f'{name}_每0.1秒一格.jpg')])

# 3 声音图
run(FF + ['-i', str(FILM), '-filter_complex', 'showwavespic=s=3840x600:split_channels=0:colors=white', '-frames:v', '1', str(OUT / '声音_波形_整条.png')])
run(FF + ['-i', str(FILM), '-lavfi', 'showspectrumpic=s=3840x1000:legend=1:scale=log', '-frames:v', '1', str(OUT / '声音_频谱_整条.png')])


def lufs(path):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', str(path), '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True, encoding='utf-8', errors='replace').stderr
    tail = r[r.rindex('Summary:'):]
    g = lambda p: float(re.search(p, tail).group(1))
    return {'I': g(r'I:\s+(-?[\d.]+) LUFS'), 'LRA': g(r'LRA:\s+(-?[\d.]+) LU'), 'peak': g(r'Peak:\s+(-?[\d.]+) dBFS')}, r


film, raw = lufs(FILM)
st = [(float(m.group(1)), float(m.group(2))) for m in re.finditer(r't:\s*([\d.]+)\s+TARGET.*?S:\s*(-?[\d.]+)', raw)]
rows = []
for a in range(0, int(dur) + 1, 3):
    seg = [s for t, s in st if a <= t < a + 3 and s > -70]
    rows.append((a, sum(seg) / len(seg) if seg else None, max(seg) if seg else None))
voice, _ = lufs(W / 'public' / SLOT / 'voice.wav')
music, _ = lufs(W / 'public' / SLOT / 'music.wav')
mv = D['musicVol']
lines = PLACED['lines']
ts = json.loads((EP / 'audio' / 'timestamps.json').read_text(encoding='utf-8'))['sentences']
P = re.compile(r'[\s，。、？！：；…—“”（）()\[\],.?!:;"\'-]')

md = ['# 声音数据（机器量的，没有人听过）', '', f'成片：{FILM.name}，{dur:.2f} 秒。', '', '## 整体',
      f'- 成片整体响度 {film["I"]} LUFS，响度范围 LRA {film["LRA"]} LU，峰值 {film["peak"]} dBFS。',
      f'- 混音前：人声 {voice["I"]} LUFS；配乐大约在 {music["I"] + 20 * math.log10(mv):.1f} LUFS，比人声低约 {voice["I"] - (music["I"] + 20 * math.log10(mv)):.1f} LU。开头、换段、最后一问之后配乐会抬高约 6 dB。',
      f'- 配乐：同一首曲子；接缝{"在成片第 %s 秒" % D["seam"] if D.get("seam") else "没有（片子比曲子短）"}；结尾淡出。',
      '- 后期：人声和配乐混好以后整体过了一道压缩（3:1）、提音量、限幅，见 post.py。',
      '- 音效：每次换段一声转场声、角色出现时一声轻响，另有几声强调。具体时刻看画面代码里的 SFX。',
      '', '## 每 3 秒的短时响度（LUFS）', '| 第几秒起 | 平均 | 最大 |', '|---|---|---|']
md += [f'| {a} | {"%.1f" % m if m is not None else "—"} | {"%.1f" % x if x is not None else "—"} |' for a, m, x in rows]
md += ['', '## 每句话：起止、时长、语速、和下一句之间的间隔', '| # | 起 | 止 | 秒 | 字/秒 | 间隔 | 机器听到的 | 稿子 |', '|---|---|---|---|---|---|---|---|']
for i, ln in enumerate(lines):
    d = ln['end'] - ln['start']
    gap = lines[i + 1]['start'] - ln['end'] if i + 1 < len(lines) else dur - ln['end']
    md.append(f'| {i + 1} | {ln["start"]:.2f} | {ln["end"]:.2f} | {d:.2f} | {len(P.sub("", ln["text"])) / d:.1f} | {gap:.2f} | {ts[i].get("asr", "")} | {ln["text"]} |')
md += ['', '说明："字/秒"把英文字母按个数算，带英文名的句子会显得偏快。"机器听到的"是语音识别的结果，英文名常被听成别的词，不代表真的念错，但值得人听一下。',
       '', '## 字幕', '| 起 | 止 | 秒 | 字 |', '|---|---|---|---|']
md += [f'| {s["s"]:.2f} | {s["e"]:.2f} | {s["e"] - s["s"]:.2f} | {s["text"]} |' for s in D['subs']]
(OUT / '声音数据.md').write_text('\n'.join(md), encoding='utf-8')
print('ok', len(list(OUT.iterdir())), '个文件')
