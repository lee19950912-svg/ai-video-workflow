"""把配好的音排到成片时间线上，并导出给画面工程（E:/tools/FredTalk-work/ep1/src/<SLOT>/data.json）。

每期只改下面"这一期要改的"那几行。做法（为什么这么做见 E:\\自媒体\\制作流程-AI热点讲解片.md）：
1. 每句配音先各自调到差不多一样响。
2. 每句头尾的静音按实际声音裁齐，再按意思给停顿（顺着说的 / 要回味的 / 换段）。
3. 换段点放在停顿的前三分之一处：上一句说完马上转场，新一段开口前画面已经到位。
4. 配乐的循环接缝放进某一次换段的空当里，交叉淡化。
用法：python place.py      跑完看 排时间.txt
"""
import array
import json
import math
import re
import subprocess
import sys
import wave
from pathlib import Path

# ── 这一期要改的 ─────────────────────────────────────────────────────────
SLOT = 'hotX'                 # 这一期在画面工程里的文件夹名（src/<SLOT>、public/<SLOT>），每期一个新名字，别覆盖旧的
SECS = [(0, 3), (3, 7), (7, 11), (11, 14)]   # 每一段从第几句到第几句（从 0 数，右边不含）：开头 / 各段 / 结尾
BIG_AFTER = {0, 1}            # 这几句（从 0 数）说完多停一下：比方、数字、主张之后
SEAM_CUT = None               # 配乐接缝放在第几次换段（从 0 数）。None = 片子比曲子短、不用接；片子长于 96 秒时填一个靠后的换段
# ── 一般不用改的 ─────────────────────────────────────────────────────────
PRE, TAIL = 0.35, 2.6
GAP, GAP_BIG, GAP_SEC, GAP_OUTRO, GAP_ASK = 0.27, 0.65, 1.4, 1.5, 0.85
HEAD_KEEP, TAIL_KEEP = 0.04, 0.07

sys.stdout.reconfigure(encoding='utf-8')
HERE = Path(__file__).resolve().parent
W = Path(r'E:/tools/FredTalk-work/ep1')
PUB = W / 'public' / SLOT
MUSIC = Path(r'E:/自媒体/_讲解片模板/配乐/pop-track-03.mp3')
BEAT = json.loads(Path(r'E:/自媒体/_讲解片模板/配乐/pop-track-03_beats.json').read_text(encoding='utf-8'))
PUNC = re.compile(r'[\s，。、？！：；…—「」『』“”（）()\[\],.?!:;"\'-]')
if SLOT == 'hotX':
    sys.exit('先把 place.py 顶上的 SLOT、SECS、BIG_AFTER 改成这一期的。')

LINES = [t for _, t in json.loads((HERE / 'dialog.json').read_text(encoding='utf-8'))['lines']]
META = json.loads((HERE / 'audio' / 'lines.json').read_text(encoding='utf-8'))
TS = json.loads((HERE / 'audio' / 'timestamps.json').read_text(encoding='utf-8'))['sentences']
assert SECS[-1][1] == len(LINES), f'SECS 最后要到第 {len(LINES)} 句'

with wave.open(str(HERE / 'audio' / 'full.wav')) as w:
    SR = w.getframerate()
    pcm = array.array('h', w.readframes(w.getnframes()))
FR = SR // 20


def frames_rms(seg):
    return [math.sqrt(sum(x * x for x in seg[k:k + FR]) / FR) for k in range(0, len(seg) - FR + 1, FR)]


# 1 每句：裁头尾静音，量有声部分的响度，调到中位数那句的水平
segs = []
for m in META:
    a, b = int(m['start'] * SR), int(m['end'] * SR)
    seg = pcm[a:b]
    r = frames_rms(seg)
    loud = [i for i, v in enumerate(r) if v > 180]
    i0, i1 = loud[0], loud[-1] + 1
    ta, tb = max(0, i0 * FR - int(HEAD_KEEP * SR)), min(len(seg), i1 * FR + int(TAIL_KEEP * SR))
    voiced = [v for v in r[i0:i1] if v > 400]
    segs.append({'seg': seg[ta:tb], 'off': m['start'] + ta / SR, 'rms': math.sqrt(sum(v * v for v in voiced) / len(voiced)), 'cut_head': ta / SR, 'cut_tail': (len(seg) - tb) / SR})
target = sorted(s['rms'] for s in segs)[len(segs) // 2]
for s in segs:
    g = max(0.5, min(3.2, target / s['rms']))
    g = min(g, 30000 / max(abs(x) for x in s['seg']))
    s['gain_db'] = 20 * math.log10(g)
    fade = int(0.012 * SR)
    seg = array.array('h', (int(max(-32767, min(32767, x * g))) for x in s['seg']))
    for k in range(fade):
        seg[k] = int(seg[k] * k / fade)
        seg[-1 - k] = int(seg[-1 - k] * k / fade)
    s['seg'] = seg

# 2 排时间
starts, cuts, gaps, t = [], [], [], PRE
first = {a for a, _ in SECS}
for i, s in enumerate(segs):
    if i:
        if i in first:
            g = GAP_OUTRO if i == SECS[-1][0] else GAP_SEC
            cuts.append(round(t + g * 0.3, 3))
        elif i == len(segs) - 1:
            g = GAP_ASK
        else:
            g = GAP_BIG if (i - 1) in BIG_AFTER else GAP
        gaps.append(g)
        t += g
    starts.append(round(t, 3))
    t += len(s['seg']) / SR
END = round(t + TAIL, 2)
LS = starts
LE = [round(a + len(s['seg']) / SR, 3) for a, s in zip(starts, segs)]

out = array.array('h', [0]) * int(END * SR)
for a, s in zip(starts, segs):
    k = int(a * SR)
    out[k:k + len(s['seg'])] = s['seg']
with wave.open(str(HERE / 'audio' / 'voice_placed.wav'), 'wb') as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(out.tobytes())

VO = []
for i, s in enumerate(TS):
    chars = []
    for wd in s['words']:
        txt = PUNC.sub('', wd['text'])
        if not txt:
            continue
        a, b = wd['start'] - segs[i]['off'] + LS[i], wd['end'] - segs[i]['off'] + LS[i]
        a, b = max(LS[i], a), min(LE[i], max(b, a + 0.02))
        step = (b - a) / len(txt)
        chars += [[ch, round(a + k * step, 3), round(a + (k + 1) * step, 3)] for k, ch in enumerate(txt)]
    VO.append(chars)

# 字幕：按标点切，一条最多 14 个字
subs = []
for i, text in enumerate(LINES):
    plain = ''.join(c for c, _, _ in VO[i])
    merged = []
    for part in [x for x in re.split(r'(?<=[，。？：、])', text) if x.strip()]:
        n = len(PUNC.sub('', part))
        if merged and len(PUNC.sub('', merged[-1])) + n <= 14:
            merged[-1] += part
        else:
            merged.append(part)
    if len(PUNC.sub('', text)) != len(plain):
        merged = [text]
    pos, times = 0, []
    for part in merged:
        n = len(PUNC.sub('', part)) if len(merged) > 1 else len(plain)
        times.append((VO[i][pos][1], VO[i][pos + n - 1][2], part))
        pos += n
    for k, (a, b, part) in enumerate(times):
        nxt = times[k + 1][0] - 0.04 if k + 1 < len(times) else min(b + 0.45, LS[i + 1] - 0.06 if i + 1 < len(LINES) else END)
        subs.append({'s': round(max(0, a - 0.04), 3), 'e': round(nxt, 3), 'text': part.strip().rstrip('，。、：'), 'line': i})

PUB.mkdir(parents=True, exist_ok=True)
ff = ['ffmpeg', '-v', 'error', '-y']
subprocess.run(ff + ['-i', str(HERE / 'audio' / 'voice_placed.wav'), '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s16le', str(PUB / 'voice.wav')], check=True)


def dur(path):
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(path)], capture_output=True, text=True).stdout)


# 3 配乐
SRC, XF, period = dur(MUSIC), 0.4, BEAT['period']


def body_end(path):
    """曲子自己的结尾会渐弱到没声。找出它还在正常响的最后一刻（每 0.5 秒量一次，比全曲中等音量低 8 dB 以上就算已经在收尾），再退到整拍上。"""
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(path), '-ac', '1', '-ar', '8000', '-f', 's16le', '-'], capture_output=True).stdout
    x = array.array('h')
    x.frombytes(raw[:len(raw) // 2 * 2])
    n = 4000
    db = [10 * math.log10(max(sum(v * v for v in x[k:k + n]) / n, 1)) for k in range(0, len(x) - n + 1, n)]
    med = sorted(db)[len(db) // 2]
    k = max(i for i, v in enumerate(db) if v >= med - 8)
    end = (k + 1) * 0.5
    return BEAT['phase'] + math.floor((end - BEAT['phase']) / period) * period


SRC_END = body_end(MUSIC)     # 接缝只用到这里；后面那截渐弱不放
fades = f"afade=t=in:d=0.05,afade=t=out:st={END - 1.6}:d=1.5"
if END <= SRC_END - BEAT['phase'] and SEAM_CUT is None:
    ss, seam = BEAT['phase'], None
    subprocess.run(ff + ['-ss', f'{ss:.3f}', '-i', str(MUSIC), '-t', str(END), '-af', fades, '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s16le', str(PUB / 'music.wav')], check=True)
else:
    if SEAM_CUT is None:
        sys.exit(f'片子 {END} 秒，比曲子（{SRC:.0f} 秒）长：在 place.py 顶上填 SEAM_CUT（接缝放在第几次换段）。')
    seam = cuts[SEAM_CUT] + 0.25
    ss = SRC_END - seam - XF / 2
    ss = max(BEAT['phase'], BEAT['phase'] + round((ss - BEAT['phase']) / period) * period)
    seam = SRC_END - ss - XF / 2
    if abs(seam - cuts[SEAM_CUT] - 0.25) > 0.6:   # 曲子不够长，接缝放不到那么靠后，会落到别处（2026-11-13 踩过：落在一句话中间）
        ok = [k for k, c in enumerate(cuts) if c + 0.25 <= SRC_END - BEAT['phase'] - XF / 2]
        sys.exit(f'接缝放不到第 {SEAM_CUT} 次换段（{cuts[SEAM_CUT]} 秒）：曲子能用的只有 {SRC_END:.0f} 秒（结尾渐弱那截不算）。SEAM_CUT 最大只能填 {ok[-1] if ok else "（没有）"}。')
    subprocess.run(ff + ['-i', str(MUSIC), '-filter_complex',
                         f"[0:a]atrim=start={ss:.3f}:end={SRC_END:.3f},asetpts=PTS-STARTPTS[a];[0:a]atrim=start={BEAT['phase']:.3f},asetpts=PTS-STARTPTS[b];[a][b]acrossfade=d={XF}:c1=tri:c2=tri,atrim=end={END},{fades}[m]",
                         '-map', '[m]', '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s16le', str(PUB / 'music.wav')], check=True)


def lufs(path):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', str(path), '-af', 'ebur128', '-f', 'null', '-'],
                       capture_output=True, text=True, encoding='utf-8', errors='replace').stderr
    return float(re.search(r'I:\s+(-?[\d.]+) LUFS', r[r.rindex('Summary:'):]).group(1))


v, mu = lufs(PUB / 'voice.wav'), lufs(PUB / 'music.wav')
lifts = [[-1, LS[0] - 0.05]] + [[LE[a - 1] + 0.05, LS[a] - 0.12] for a, _ in SECS[1:]] + [[LE[-1] + 0.15, END]]   # 配乐抬起来的时段
data = {'END': END, 'fps': 30, 'LS': LS, 'LE': LE, 'VO': VO, 'cuts': cuts, 'subs': subs, 'lines': LINES,
        'musicVol': round(10 ** ((v - 16 - mu) / 20), 4), 'lifts': [[round(a, 3), round(b, 3)] for a, b in lifts], 'seam': seam and round(seam, 2)}
(W / 'src' / SLOT).mkdir(exist_ok=True)
(W / 'src' / SLOT / 'data.json').write_text(json.dumps(data, ensure_ascii=False), encoding='utf-8')
(HERE / 'audio' / 'placed.json').write_text(json.dumps({'end': END, 'cuts': cuts, 'slot': SLOT, 'seam': data['seam'], 'lines': [{'i': i, 'start': a, 'end': b, 'text': x} for i, (a, b, x) in enumerate(zip(LS, LE, LINES))]}, ensure_ascii=False, indent=1), encoding='utf-8')
rep = ['全长 %.2f 秒；换段 %s；字幕 %d 条；人声 %.1f LUFS，配乐 %.1f LUFS，配乐系数 %.3f；配乐从曲子第 %.2f 秒放起，%s' % (END, cuts, len(subs), v, mu, data['musicVol'], ss, ('接缝在成片第 %.2f 秒' % seam) if seam else '不用接')]
for i, (a, b, x) in enumerate(zip(LS, LE, LINES)):
    rep.append('%2d %6.2f-%6.2f 补 %+5.1f dB 裁头 %.2f 裁尾 %.2f 之后停 %s  %s' % (i, a, b, segs[i]['gain_db'], segs[i]['cut_head'], segs[i]['cut_tail'], ('%.2f' % gaps[i]) if i < len(gaps) else '片尾', x))
for i, s in enumerate(TS):
    if len(PUNC.sub('', LINES[i])) != len(VO[i]):
        rep.append('字数对不上 L%d：稿 %d 识别 %d  %s' % (i, len(PUNC.sub('', LINES[i])), len(VO[i]), ''.join(c for c, _, _ in VO[i])))
(HERE / '排时间.txt').write_text('\n'.join(rep), encoding='utf-8')
print(rep[0])
