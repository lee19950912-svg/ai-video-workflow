"""量每句配音的音高（基频中位数）、亮度（频谱重心）、响度、语速，找出和整体差得多的句子。只读。
用法：python timbre.py <一期文件夹> [<另一期文件夹> ...]"""
import json
import sys
import wave
from pathlib import Path

import numpy as np

sys.stdout.reconfigure(encoding='utf-8')


def f0_track(seg, sr):
    win, hop = int(0.04 * sr), int(0.01 * sr)
    lo, hi = int(sr / 320), int(sr / 70)
    out = []
    for k in range(0, len(seg) - win, hop):
        fr = seg[k:k + win]
        if np.sqrt((fr ** 2).mean()) < 0.015:
            continue
        fr = fr - fr.mean()
        ac = np.correlate(fr, fr, 'full')[win - 1:]
        if ac[0] <= 0:
            continue
        ac = ac / ac[0]
        j = lo + int(np.argmax(ac[lo:hi]))
        if ac[j] > 0.45:
            out.append(sr / j)
    return np.array(out)


def centroid(seg, sr):
    n = 1024
    cs = []
    for k in range(0, len(seg) - n, n // 2):
        fr = seg[k:k + n]
        if np.sqrt((fr ** 2).mean()) < 0.015:
            continue
        sp = np.abs(np.fft.rfft(fr * np.hanning(n)))
        fq = np.fft.rfftfreq(n, 1 / sr)
        cs.append((sp * fq).sum() / (sp.sum() + 1e-9))
    return float(np.median(cs)) if cs else 0.0


def run(ep):
    A = Path(ep) / 'audio'
    lines = json.loads((A / 'lines.json').read_text(encoding='utf-8'))
    w = wave.open(str(A / 'full.wav'))
    sr = w.getframerate()
    x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
    rows = []
    for L in lines:
        seg = x[int(L['start'] * sr):int(L['end'] * sr)]
        f0 = f0_track(seg, sr)
        v = seg[np.abs(seg) > 0.01]
        nchar = sum(1 for c in L['text'] if '一' <= c <= '鿿')
        rows.append(dict(i=L['i'] + 1, f0=float(np.median(f0)) if len(f0) else 0, rng=float(np.percentile(f0, 90) - np.percentile(f0, 10)) if len(f0) else 0,
                         cen=centroid(seg, sr), rms=20 * np.log10(np.sqrt((v ** 2).mean()) + 1e-9), cps=nchar / (L['end'] - L['start']), text=L['text']))
    f0m = np.median([r['f0'] for r in rows])
    cm = np.median([r['cen'] for r in rows])
    rm = np.median([r['rms'] for r in rows])
    print(f'\n== {ep} ==  {len(rows)} 句；音高中位 {f0m:.0f} Hz，亮度中位 {cm:.0f} Hz')
    print('句  音高Hz  差(半音)  起伏Hz  亮度差%  响度差dB  字/秒  开头')
    for r in rows:
        st = 12 * np.log2(r['f0'] / f0m) if r['f0'] else 0
        cd = (r['cen'] / cm - 1) * 100
        flag = ' ◀' if abs(st) > 1.5 or abs(cd) > 15 or abs(r['rms'] - rm) > 3 else ''
        print(f"{r['i']:>2}  {r['f0']:6.0f}  {st:+7.1f}  {r['rng']:6.0f}  {cd:+7.0f}  {r['rms'] - rm:+8.1f}  {r['cps']:5.1f}  {r['text'][:14]}{flag}")
    st = np.array([12 * np.log2(r['f0'] / f0m) for r in rows if r['f0']])
    cd = np.array([(r['cen'] / cm - 1) * 100 for r in rows])
    rd = np.array([r['rms'] - rm for r in rows])
    print(f'汇总：音高最低到最高差 {st.max() - st.min():.1f} 个半音（标准差 {st.std():.2f}）；亮度差 {cd.min():+.0f}% ~ {cd.max():+.0f}%（标准差 {cd.std():.1f}）；响度差 {rd.min():+.1f} ~ {rd.max():+.1f} dB（标准差 {rd.std():.2f}）')


for ep in sys.argv[1:]:
    run(ep)
