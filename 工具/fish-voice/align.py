"""Word-level timing for a voiced script: audio/full.wav + audio/lines.json -> audio/timestamps.json.

Replaces the old timestamps_cpu.py (lost when the Claude skills folder was cleared, 2026-11-08).
Runs faster-whisper on each line separately, then maps the recognised characters onto the script's own characters,
so the words in the output are always the script's words. Lines whose match is under 0.90 are flagged for a listen.

usage: E:\\tools\\fish-voice\\venv\\Scripts\\python.exe align.py <episode_dir> [--model small]
"""
import argparse
import difflib
import json
import re
import sys
import wave
from pathlib import Path

import numpy as np
from faster_whisper import WhisperModel
from opencc import OpenCC
from pypinyin import lazy_pinyin

SKIP = re.compile(r'[\s，。、？！：；…—「」『』（）()\[\],.?!:;"\'-]')
TOK = re.compile(r'[A-Za-z0-9.]*[A-Za-z0-9]|[^\s]')


T2S = OpenCC('t2s')
CN = '零一二三四五六七八九'


def read_number(m):
    """1935 -> 一千九百三十五 (whisper writes numbers as digits; the script spells them out)."""
    n, out = m.group(0), ''
    if len(n) > 4 or (n[0] == '0' and len(n) > 1):
        return ''.join(CN[int(c)] for c in n)
    v = int(n)
    if v == 0:
        return '零'
    units = [(1000, '千'), (100, '百'), (10, '十')]
    zero = False
    for u, name in units:
        d = v // u
        v %= u
        if d:
            out += ('零' if zero and out else '') + CN[d] + name
            zero = False
        elif out:
            zero = True
    if v:
        out += ('零' if zero and out else '') + CN[v]
    return out[1:] if out.startswith('一十') else out


def norm(t):
    return re.sub(r'\d+', read_number, T2S.convert(t))


def latin(c):
    return c.isascii() and c.isalpha()


def tokens(text):
    """Script text -> tokens: a Latin word or number stays whole, each Chinese character is one token, punctuation dropped."""
    return [t for t in TOK.findall(text) if not SKIP.fullmatch(t)]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('episode')
    ap.add_argument('--model', default='small')
    a = ap.parse_args()
    sys.stdout.reconfigure(encoding='utf-8')
    ep = Path(a.episode)
    lines = json.loads((ep / 'audio' / 'lines.json').read_text(encoding='utf-8'))
    with wave.open(str(ep / 'audio' / 'full.wav'), 'rb') as w:
        sr = w.getframerate()
        pcm = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    if sr != 16000:   # whisper wants 16 kHz
        n = int(len(pcm) * 16000 / sr)
        pcm = np.interp(np.linspace(0, len(pcm) - 1, n), np.arange(len(pcm)), pcm)
    model = WhisperModel(a.model, device='cpu', compute_type='int8')
    out, bad = [], 0
    for m in lines:
        s0, s1 = int(m['start'] * 16000), int(m['end'] * 16000)
        segs, _ = model.transcribe(pcm[s0:s1], language='zh', word_timestamps=True, beam_size=5, vad_filter=False,
                                   condition_on_previous_text=False)   # 不给稿子当提示，分数才算真的「听出来」
        heard = []   # (char, start, end) on the full-track clock
        for seg in segs:
            for w in seg.words or []:
                t = norm(SKIP.sub('', w.word)).lower()
                for k, ch in enumerate(t):
                    d = (w.end - w.start) / len(t)
                    heard.append((ch, m['start'] + w.start + k * d, m['start'] + w.start + (k + 1) * d))
        toks = tokens(m['text'])
        want = [(i, ch) for i, t in enumerate(toks) for ch in t.lower()]
        # 按读音比：同音字（它/他、记/迹）是识别程序写错字，配音并没有念错
        say = lambda c: lazy_pinyin(c)[0]
        sm = difflib.SequenceMatcher(None, [say(c) for _, c in want], [say(c) for c, _, _ in heard], autojunk=False)
        at = {}
        for b in sm.get_matching_blocks():
            for k in range(b.size):
                at[b.a + k] = heard[b.b + k]
        known = sorted(at)
        def when(idx):   # a character the recogniser missed: interpolate from its neighbours
            if idx in at:
                return at[idx][1], at[idx][2]
            if not known:
                frac = idx / max(1, len(want))
                return m['start'] + frac * (m['end'] - m['start']), m['start'] + (idx + 1) / max(1, len(want)) * (m['end'] - m['start'])
            lo = max([k for k in known if k < idx], default=None)
            hi = min([k for k in known if k > idx], default=None)
            a0 = at[lo][2] if lo is not None else m['start']
            a1 = at[hi][1] if hi is not None else m['end']
            n0 = lo if lo is not None else -1
            n1 = hi if hi is not None else len(want)
            f = (idx - n0) / (n1 - n0)
            g = (idx + 1 - n0) / (n1 - n0)
            return a0 + (a1 - a0) * (f - 1 / (n1 - n0)), a0 + (a1 - a0) * g
        words, pos = [], 0
        for t in toks:
            first, last = pos, pos + len(t) - 1
            words.append({'text': t, 'start': round(when(first)[0], 3), 'end': round(when(last)[1], 3)})
            pos += len(t)
        for k in range(1, len(words)):   # keep time moving forward
            words[k]['start'] = max(words[k]['start'], words[k - 1]['start'])
            words[k]['end'] = max(words[k]['end'], words[k]['start'])
        # 英文名（Claude、Anthropic）常被听成别的词，不计分，靠人耳听；中文字才算
        hit = sum(1 for k in at if not latin(want[k][1]))
        w_n = sum(1 for _, c in want if not latin(c))
        h_n = sum(1 for c, _, _ in heard if not latin(c))
        score = round(2 * hit / max(1, w_n + h_n), 3)
        ok = score >= 0.90
        bad += 0 if ok else 1
        asr = ''.join(c for c, _, _ in heard)
        out.append({'i': m['i'], 'text': m['text'], 'start': words[0]['start'], 'end': words[-1]['end'], 'asr': asr, 'match': score, 'ok': ok, 'words': words})
        print(f"[{m['i'] + 1}/{len(lines)}] {score:.2f} {'' if ok else '!! 要听一下 '}{m['text']}")
    (ep / 'audio' / 'timestamps.json').write_text(json.dumps({'sr': sr, 'total': lines[-1]['end'], 'sentences': out}, ensure_ascii=False, indent=1), encoding='utf-8')
    print('lines under 0.90:', bad)


if __name__ == '__main__':
    main()
