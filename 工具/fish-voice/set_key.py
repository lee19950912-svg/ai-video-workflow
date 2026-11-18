"""Ask for the Fish Audio API key (hidden input), save it to .env next to this file, then test the connection (free)."""
import getpass
import sys
from pathlib import Path

import requests

HERE = Path(__file__).resolve().parent
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

print('请把 Fish Audio 的 API Key 粘贴进来（粘贴后屏幕上不会显示，这是正常的），然后按回车：')
key = getpass.getpass('> ').strip()
if len(key) < 16:
    sys.exit('看起来没粘贴进来，请重新双击运行。')
(HERE / '.env').write_text(f'FISH_AUDIO_API_KEY={key}\n', encoding='utf-8')
print('已保存。正在测试能不能连上 Fish（只查账户，不扣钱）……')
r = requests.get('https://api.fish.audio/wallet/self/api-credit', headers={'Authorization': f'Bearer {key}'}, timeout=30)
print('连接成功，Key 可以用。' if r.ok else f'连接失败（状态 {r.status_code}），请检查 Key 是否复制完整，然后重新双击运行。')
