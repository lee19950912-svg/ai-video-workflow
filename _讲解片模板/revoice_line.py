"""只重配一句（省钱：不用整期重来）。把新的一句接回 audio/full.wav，后面各句的时间跟着挪。
用法：<fish-voice 的 python> revoice_line.py 第几句(从1数) ["念的时候用的字"]
  第二个参数不写就照 dialog.json 原文再配一次；写了就按它念（字幕还是 dialog.json 里的原文）。
配完要重新跑 align.py。
"""
import json
import sys
import wave
from pathlib import Path

sys.path.insert(0, r'E:\tools\doubao-voice')
from tts_doubao import SR, key, to_pcm, tts  # noqa: E402

sys.stdout.reconfigure(encoding='utf-8')
HERE = Path(__file__).resolve().parent
VOICE, CONTEXT = 'zh_male_taocheng_uranus_bigtts', '用轻松播客的语气说'
i = int(sys.argv[1]) - 1
meta = json.loads((HERE / 'audio' / 'lines.json').read_text(encoding='utf-8'))
say = sys.argv[2] if len(sys.argv) > 2 else meta[i]['text']
with wave.open(str(HERE / 'audio' / 'full.wav')) as w:
    pcm = w.readframes(w.getnframes())
new = to_pcm(tts(say, VOICE, 0, key(), CONTEXT))
a, b = round(meta[i]['start'] * SR) * 2, round(meta[i]['end'] * SR) * 2
out = pcm[:a] + new + pcm[b:]
delta = len(new) / 2 / SR - (meta[i]['end'] - meta[i]['start'])
meta[i]['end'] = round(meta[i]['end'] + delta, 3)
for m in meta[i + 1:]:
    m['start'], m['end'] = round(m['start'] + delta, 3), round(m['end'] + delta, 3)
with wave.open(str(HERE / 'audio' / 'full.wav'), 'wb') as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(out)
(HERE / 'audio' / 'lines.json').write_text(json.dumps(meta, ensure_ascii=False, indent=1), encoding='utf-8')
print(f'第 {i + 1} 句重配好了，念的是：{say}（{len(say)} 个字），这句现在 {meta[i]["end"] - meta[i]["start"]:.2f} 秒')
