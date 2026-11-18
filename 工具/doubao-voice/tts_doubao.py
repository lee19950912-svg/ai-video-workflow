"""豆包语音合成模型 2.0（火山引擎）配音，按字符计费，免费额度外要花钱。
官方接口：https://docs.volcengine.com/docs/doubao-voice/unidirectional-streaming-text-to-speech-http?lang=zh
音色列表：https://www.volcengine.com/docs/6561/1257544?lang=zh
Key 在同目录 .env 里，由 设置Key.bat 写入，本程序只在内部读取，不打印。

试听：python tts_doubao.py --audition <输出文件夹> "一句话"
配整期：python tts_doubao.py <一期文件夹> --voice zh_male_xxx_uranus_bigtts [--rate 0]
  读 dialog.json，写 audio/full.wav、audio/lines.json、script.json（格式和原来的 tts_dialog.py 一样）。
Python 用 E:\\tools\\fish-voice\\venv\\Scripts\\python.exe。
"""
import argparse
import base64
import json
import subprocess
import sys
import uuid
import wave
from pathlib import Path

import requests

HERE = Path(__file__).resolve().parent
URL = 'https://openspeech.bytedance.com/api/v3/tts/unidirectional'
RESOURCE = 'seed-tts-2.0'
SR = 24000
GAP = 0.18
AUDITION = {
    '解说小明': 'zh_male_jieshuoxiaoming_uranus_bigtts',
    '磁性解说': 'zh_male_cixingjieshuonan_uranus_bigtts',
    '阳光青年': 'zh_male_yangguangqingnian_uranus_bigtts',
    '活力小哥': 'zh_male_huolixiaoge_uranus_bigtts',
    '开朗学长': 'zh_male_kailangxuezhang_uranus_bigtts',
    '深夜播客': 'zh_male_shenyeboke_uranus_bigtts',
}


def key():
    env = HERE / '.env'
    if not env.exists():
        sys.exit('还没填 Key：请先双击 设置Key.bat')
    for line in env.read_text(encoding='utf-8').splitlines():
        if line.startswith('DOUBAO_API_KEY='):
            return line.split('=', 1)[1].strip()
    sys.exit('.env 里没有 DOUBAO_API_KEY，请重新双击 设置Key.bat')


def tts(text, voice, rate, k, context=''):
    """Returns mp3 bytes. Stream lines are JSON: code 0 + base64 data, then an end code (20000000)."""
    h = {'X-Api-Key': k, 'X-Api-Resource-Id': RESOURCE, 'X-Api-Request-Id': str(uuid.uuid4()), 'Content-Type': 'application/json'}
    body = {'user': {'uid': 'ziyou-video'}, 'req_params': {'text': text, 'speaker': voice,
            'audio_params': {'format': 'mp3', 'sample_rate': SR, 'speech_rate': rate}}}
    if context:   # 语音指令：官方写法是把 JSON 序列化成字符串放进 additions
        body['req_params']['additions'] = json.dumps({'context_texts': [context]}, ensure_ascii=False)
    r = requests.post(URL, headers=h, json=body, stream=True, timeout=180)
    if r.status_code != 200:
        sys.exit(f'豆包返回错误（状态 {r.status_code}）：{r.text[:300]}')
    out = bytearray()
    for raw in r.iter_lines():
        if not raw:
            continue
        msg = json.loads(raw)
        if msg.get('data'):
            out += base64.b64decode(msg['data'])
        if msg.get('code') not in (0, 20000000, None):
            sys.exit(f"豆包返回错误：{msg.get('code')} {msg.get('message')}")
    if not out:
        sys.exit('豆包没有返回声音')
    return bytes(out)


def to_pcm(mp3):
    return subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', 'pipe:0', '-ar', str(SR), '-ac', '1', '-f', 's16le', 'pipe:1'],
                          input=mp3, capture_output=True, check=True).stdout


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('episode', nargs='?')
    ap.add_argument('--voice')
    ap.add_argument('--rate', type=int, default=0, help='语速，官方范围 -50 到 100，0 是原速，100 是 2 倍')
    ap.add_argument('--audition', nargs=2, metavar=('OUT', 'TEXT'))
    ap.add_argument('--context', default='', help='语音指令，比如「用很自然的聊天语气说」')
    a = ap.parse_args()
    sys.stdout.reconfigure(encoding='utf-8')
    k = key()
    if a.audition:
        out, text = Path(a.audition[0]), a.audition[1]
        out.mkdir(parents=True, exist_ok=True)
        for name, voice in AUDITION.items():
            (out / f'{name}.mp3').write_bytes(tts(text, voice, a.rate, k))
            print('ok', name)
        print('本次合成字符数', len(text) * len(AUDITION))
        return
    if not a.voice:
        sys.exit('要指定 --voice')
    ep = Path(a.episode)
    d = json.loads((ep / 'dialog.json').read_text(encoding='utf-8'))
    buf, meta, t = bytearray(), [], 0.0
    for i, (spk, text) in enumerate(d['lines']):
        pcm = to_pcm(tts(text, a.voice, a.rate, k, a.context))
        if i:
            buf += b'\x00\x00' * round(GAP * SR)
            t += GAP
        dur = len(pcm) / 2 / SR
        meta.append({'i': i, 'speaker': spk, 'text': text, 'start': round(t, 3), 'end': round(t + dur, 3)})
        print(f'[{i + 1}/{len(d["lines"])}] {dur:5.2f}s  {text}', flush=True)
        buf += pcm
        t += dur
    (ep / 'audio').mkdir(exist_ok=True)
    with wave.open(str(ep / 'audio' / 'full.wav'), 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(bytes(buf))
    (ep / 'audio' / 'lines.json').write_text(json.dumps(meta, ensure_ascii=False, indent=1), encoding='utf-8')
    (ep / 'script.json').write_text(json.dumps({'sentences': [m['text'] for m in meta]}, ensure_ascii=False, indent=1), encoding='utf-8')
    print(f'total {t:.2f}s, 字符数 {sum(len(m["text"]) for m in meta)}')


if __name__ == '__main__':
    main()
