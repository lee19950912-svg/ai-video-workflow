"""Ask for the Doubao (Volcengine) API Key with hidden input and save it to .env next to this file. Nothing is sent or spent here."""
import getpass
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

print('请把火山引擎的 API Key 粘贴进来（粘贴后屏幕上不会显示，这是正常的），然后按回车：')
key = getpass.getpass('> ').strip()
if len(key) < 16:
    sys.exit('看起来没粘贴进来，请重新双击运行。')
(HERE / '.env').write_text(f'DOUBAO_API_KEY={key}\n', encoding='utf-8')
print('已保存。回到对话里点「填好了」，我来测试并出试听。')
