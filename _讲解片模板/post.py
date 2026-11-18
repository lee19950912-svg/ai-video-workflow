"""声音后处理：人声压一压、整体提到约 -12 LUFS、峰值不超过 -1 dB。只改音轨，画面原样拷贝。
用法：python post.py [out/ 里的文件名] [成片文件名]
"""
import json
import re
import subprocess
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')
HERE = Path(__file__).resolve().parent
W = Path(r'E:/tools/FredTalk-work/ep1')
if len(sys.argv) < 3:
    sys.exit('用法：python post.py 画面工程out里的文件名 成片文件名')
SRC = W / 'out' / sys.argv[1]
OUT = HERE / sys.argv[2]
TARGET = -12.0
COMP = 'acompressor=threshold=0.09:ratio=3:attack=5:release=90:makeup=1'


def measure(path, pre=''):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', str(path), '-vn', '-af', (pre + ',' if pre else '') + 'ebur128=peak=true', '-f', 'null', '-'],
                       capture_output=True, text=True, encoding='utf-8', errors='replace').stderr
    tail = r[r.rindex('Summary:'):]
    return float(re.search(r'I:\s+(-?[\d.]+) LUFS', tail).group(1)), float(re.search(r'Peak:\s+(-?[\d.]+) dBFS', tail).group(1))


i0, p0 = measure(SRC)
gain = TARGET - measure(SRC, COMP)[0]
for _ in range(6):   # 限幅会吃掉一点响度，量了再补
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(SRC), '-map', '0:v', '-c:v', 'copy', '-map', '0:a',
                    '-af', f'{COMP},volume={gain:.2f}dB,alimiter=limit=0.76:level=false,aresample=48000', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', str(OUT)], check=True)
    lufs, peak = measure(OUT)
    if abs(lufs - TARGET) < 0.1:
        break
    gain += TARGET - lufs
(HERE / 'audio' / 'loudness.json').write_text(json.dumps({'lufs': lufs, 'peak': peak}), encoding='utf-8')
print('处理前 %.1f LUFS / 峰值 %.1f；处理后 %.1f LUFS / 峰值 %.1f dB（补了 %.1f dB）' % (i0, p0, lufs, peak, gain))
print('ok', OUT)
