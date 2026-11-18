"""Rank candidate voices by similarity to a reference recording.
Timbre: cosine similarity of ECAPA speaker embeddings (speechbrain/spkrec-ecapa-voxceleb, Apache-2.0). Also reports median pitch and speech rate.
usage: E:\\tools\\qwen3-tts\\venv\\Scripts\\python.exe match_rank.py <reference.wav> <candidates_dir>
"""
import json
import subprocess
import sys
from pathlib import Path

import librosa
import numpy as np
import torch
from speechbrain.inference.speaker import EncoderClassifier
from speechbrain.utils.fetching import LocalStrategy

SR = 16000
CHARS = 30   # 汉字和英文词数，和 match_gen.py 的句子一致


def load(p):
    pcm = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', str(p), '-ar', str(SR), '-ac', '1', '-f', 'f32le', 'pipe:1'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(pcm, dtype=np.float32).copy()


def pitch(x):
    f0, voiced, _ = librosa.pyin(x, fmin=60, fmax=320, sr=SR, frame_length=1024)
    return float(np.nanmedian(f0[voiced]))


def main():
    sys.stdout.reconfigure(encoding='utf-8')
    ref, cand = Path(sys.argv[1]), Path(sys.argv[2])
    net = EncoderClassifier.from_hparams(source='speechbrain/spkrec-ecapa-voxceleb', savedir=r'E:\tools\doubao-voice\ecapa', run_opts={'device': 'cuda'}, local_strategy=LocalStrategy.COPY)

    def emb(x):
        with torch.no_grad():
            e = net.encode_batch(torch.from_numpy(x).unsqueeze(0).to('cuda')).squeeze()
        return torch.nn.functional.normalize(e, dim=0)
    rx = load(ref)
    re = emb(rx)
    rp = pitch(rx)
    lines = ref.parent / 'lines.json'
    rate = ''
    if lines.exists():
        L = json.loads(lines.read_text(encoding='utf-8'))
        rate = sum(len(m['text']) for m in L) / sum(m['end'] - m['start'] for m in L)
    print(f'reference: pitch {rp:.0f} Hz, {rate if rate == "" else round(rate, 2)} chars/s (with punctuation counted)')
    rows = []
    for f in sorted(cand.glob('*.mp3')):
        x = load(f)
        rows.append((float(torch.dot(re, emb(x))), f.stem, pitch(x), len(x) / SR))
    rows.sort(reverse=True)
    for s, n, p, d in rows:
        print(f'{s:.3f}  {n}  音高 {p:.0f} Hz ({p - rp:+.0f})  时长 {d:.2f}s')
    (cand / 'rank.json').write_text(json.dumps([{'name': n, 'score': round(s, 3), 'pitch': round(p), 'dur': round(d, 2)} for s, n, p, d in rows], ensure_ascii=False, indent=1), encoding='utf-8')


if __name__ == '__main__':
    main()
