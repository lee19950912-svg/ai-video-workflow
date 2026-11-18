"""一段话合成一次，再按句切开（2026-11-13）。

为什么：tts_doubao.py 是一句一句分开合成的，机器每句自己起调，29 句的音高能差将近 10 个半音，
用户一听就说"每段内容音色不一样"。同一次合成里的话是连着说的，调子不会跳。

用法（Python 用 E:\\tools\\fish-voice\\venv\\Scripts\\python.exe）：
  配音并切句：python tts_para.py <一期文件夹> --paras 2,6,6,5,4,5,1 --voice zh_male_xxx [--context "语音指令"]
  只重新切句（不花钱）：python tts_para.py <一期文件夹> --paras 2,6,6,5,4,5,1 --split-only
  只重配某几段（从 1 数）：再加 --only 3,5
--paras 是每段的句数，加起来要等于 dialog.json 的句数。
每段的原始声音存在 audio/paras/pNN.wav，切句可以反复重做。
输出和 tts_doubao.py 一样：audio/full.wav、audio/lines.json、script.json。之后照常跑 align.py。
"""
import argparse
import difflib
import json
import sys
import wave
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
sys.path.insert(0, r'E:\tools\fish-voice')
from tts_doubao import SR, key, to_pcm, tts  # noqa: E402

PARA_GAP = 0.18   # 段和段之间先留的空（排时间那一步会重排）


def write_wav(p, pcm_bytes):
    with wave.open(str(p), 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm_bytes)


def read_wav(p):
    with wave.open(str(p), 'rb') as w:
        assert w.getframerate() == SR and w.getnchannels() == 1
        return w.readframes(w.getnframes())


def split_para(model, pcm_bytes, texts, label):
    """Returns cut times (seconds, inside this paragraph) between consecutive lines, plus a note per cut."""
    from align import SKIP, norm, tokens   # 复用对稿工具的写法
    from pypinyin import lazy_pinyin
    x = np.frombuffer(pcm_bytes, dtype=np.int16).astype(np.float32) / 32768
    n16 = int(len(x) * 16000 / SR)
    x16 = np.interp(np.linspace(0, len(x) - 1, n16), np.arange(len(x)), x).astype(np.float32)
    segs, _ = model.transcribe(x16, language='zh', word_timestamps=True, beam_size=5, vad_filter=False, condition_on_previous_text=False)
    heard = []
    for seg in segs:
        for w in seg.words or []:
            t = norm(SKIP.sub('', w.word)).lower()
            for k, ch in enumerate(t):
                d = (w.end - w.start) / len(t)
                heard.append((ch, w.start + k * d, w.start + (k + 1) * d))
    want = [(li, ch) for li, text in enumerate(texts) for tok in tokens(text) for ch in tok.lower()]
    say = lambda c: lazy_pinyin(c)[0]
    sm = difflib.SequenceMatcher(None, [say(c) for _, c in want], [say(c) for c, _, _ in heard], autojunk=False)
    at = {}
    for b in sm.get_matching_blocks():
        for k in range(b.size):
            at[b.a + k] = heard[b.b + k]
    match = 2 * len(at) / max(1, len(want) + len(heard))
    # 10 毫秒一格的音量
    hop = int(0.01 * SR)
    fr = np.array([np.sqrt((x[k:k + hop] ** 2).mean()) for k in range(0, len(x) - hop, hop)])
    quiet = max(0.004, 0.12 * float(np.median(fr[fr > 0.02])) if (fr > 0.02).any() else 0.004)
    cuts, notes = [], []
    for li in range(len(texts) - 1):
        last = max((k for k in at if want[k][0] <= li), default=None)
        first = min((k for k in at if want[k][0] > li), default=None)
        ta = at[last][2] if last is not None else 0.0
        tb = at[first][1] if first is not None else len(x) / SR
        missed = (sum(1 for k, (l, _) in enumerate(want) if l == li and (last is None or k > last))
                  + sum(1 for k, (l, _) in enumerate(want) if l == li + 1 and (first is None or k < first)))
        lo, hi = max(0.0, min(ta, tb) - 0.25), min(len(x) / SR, max(ta, tb) + 0.25)
        a, b = int(lo / 0.01), max(int(lo / 0.01) + 1, int(hi / 0.01))
        win = fr[a:b]
        best, run, start, best_start = 0, 0, 0, None
        for k, v in enumerate(win):
            if v < quiet:
                if run == 0:
                    start = k
                run += 1
                if run > best:
                    best, best_start = run, start
            else:
                run = 0
        if best_start is not None and best >= 4:
            cut = (a + best_start + best / 2) * 0.01
            notes.append(f'{label} 第 {li + 1}|{li + 2} 句之间：停顿 {best * 0.01:.2f}s，切在 {cut:.2f}s' + (f'（边上有 {missed} 个字没听出来）' if missed else ''))
        else:
            cut = (a + int(np.argmin(win))) * 0.01
            notes.append(f'{label} 第 {li + 1}|{li + 2} 句之间：!! 没有明显停顿，切在最轻的地方 {cut:.2f}s，要听一下')
        cuts.append(cut)
    for k in range(1, len(cuts)):
        cuts[k] = max(cuts[k], cuts[k - 1] + 0.3)
    return cuts, notes, match


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('episode')
    ap.add_argument('--paras', required=True, help='每段的句数，逗号隔开')
    ap.add_argument('--voice')
    ap.add_argument('--rate', type=int, default=0)
    ap.add_argument('--context', default='')
    ap.add_argument('--split-only', action='store_true', help='不合成，只用已有的 audio/paras/*.wav 重新切句')
    ap.add_argument('--only', default='', help='只重配这几段（从 1 数，逗号隔开），其余用已有的')
    ap.add_argument('--model', default='small')
    a = ap.parse_args()
    sys.stdout.reconfigure(encoding='utf-8')
    ep = Path(a.episode)
    d = json.loads((ep / 'dialog.json').read_text(encoding='utf-8'))
    sizes = [int(v) for v in a.paras.split(',')]
    if sum(sizes) != len(d['lines']):
        sys.exit(f'--paras 加起来是 {sum(sizes)} 句，dialog.json 有 {len(d["lines"])} 句')
    pd = ep / 'audio' / 'paras'
    pd.mkdir(parents=True, exist_ok=True)
    only = {int(v) for v in a.only.split(',') if v}
    paras, i = [], 0
    for n in sizes:
        paras.append(d['lines'][i:i + n])
        i += n
    chars = 0
    if not a.split_only:
        if not a.voice:
            sys.exit('要指定 --voice')
        k = key()
        for pi, para in enumerate(paras, 1):
            f = pd / f'p{pi:02d}.wav'
            if only and pi not in only:
                if not f.exists():
                    sys.exit(f'{f.name} 不在，不能跳过第 {pi} 段')
                continue
            text = ''.join(t for _, t in para)
            pcm = to_pcm(tts(text, a.voice, a.rate, k, a.context))
            write_wav(f, pcm)
            chars += len(text)
            print(f'[第 {pi}/{len(paras)} 段] {len(pcm) / 2 / SR:6.2f}s  {len(text)} 字  {text[:24]}…', flush=True)
        print('本次合成字符数', chars)
    from faster_whisper import WhisperModel
    model = WhisperModel(a.model, device='cpu', compute_type='int8')
    buf, meta, t, li, report = bytearray(), [], 0.0, 0, []
    for pi, para in enumerate(paras, 1):
        pcm = read_wav(pd / f'p{pi:02d}.wav')
        dur = len(pcm) / 2 / SR
        texts = [x for _, x in para]
        cuts, notes, match = split_para(model, pcm, texts, f'第 {pi} 段') if len(para) > 1 else ([], [], 1.0)
        report.append(f'第 {pi} 段 {dur:.2f}s，{len(para)} 句，整段听写对上 {match:.2f}')
        report += ['  ' + x for x in notes]
        if pi > 1:
            buf += b'\x00\x00' * round(PARA_GAP * SR)
            t += PARA_GAP
        edges = [0.0] + cuts + [dur]
        for (spk, text), s, e in zip(para, edges, edges[1:]):
            meta.append({'i': li, 'speaker': spk, 'text': text, 'start': round(t + s, 3), 'end': round(t + e, 3), 'para': pi})
            li += 1
        buf += pcm
        t += dur
    write_wav(ep / 'audio' / 'full.wav', bytes(buf))
    (ep / 'audio' / 'lines.json').write_text(json.dumps(meta, ensure_ascii=False, indent=1), encoding='utf-8')
    (ep / 'script.json').write_text(json.dumps({'sentences': [m['text'] for m in meta]}, ensure_ascii=False, indent=1), encoding='utf-8')
    (ep / '切句.txt').write_text('\n'.join(report) + '\n', encoding='utf-8')
    print('\n'.join(report))
    print(f'total {t:.2f}s，{len(meta)} 句')


if __name__ == '__main__':
    main()
