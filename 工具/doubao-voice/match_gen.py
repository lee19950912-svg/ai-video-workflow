"""Make every candidate Doubao 2.0 male voice read the same sentence, for comparing with a reference voice.
usage: python match_gen.py <out_dir>     (about 34 characters per voice; skips files that already exist)
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import tts_doubao as T  # noqa: E402

TEXT = 'Claude 玩宝可梦，会边玩边记笔记。不过先别急着吹，做梦也会翻车。'
U = 'zh_male_{}_uranus_bigtts'
I = 'ICL_uranus_zh_male_{}_tob'
CAND = {
    '云舟': U.format('m191'), '小天': U.format('taocheng'), '刘飞': U.format('liufei'), '大壹': U.format('dayi'),
    '儒雅逸辰': U.format('ruyayichen'), '邻家男孩': U.format('linjiananhai'), '儒雅青年': U.format('ruyaqingnian'),
    '温暖阿虎': U.format('wennuanahu'), '反卷青年': U.format('fanjuanqingnian'), '悬疑解说': U.format('xuanyijieshuo'),
    '高冷沉稳': U.format('gaolengchenwen'), '开朗弟弟': U.format('kailangdidi'), '快乐小东': U.format('kuailexiaodong'),
    '悠悠君子': U.format('youyoujunzi'), '清爽男大': U.format('qingshuangnanda'), '渊博小叔': U.format('yuanboxiaoshu'),
    '温柔小哥': U.format('wenrouxiaoge'), '东方浩然': U.format('dongfanghaoran'), '广告解说': U.format('guanggaojieshuo'),
    '精英青年': I.format('jingyingqingnian'), '沉稳明仔': I.format('chenwenmingzai'), '亲切青年': I.format('qinqieqingnian'),
    '斯文青年': I.format('siwenqingnian'), '开朗青年': I.format('kailangqingnian'), '清朗温润': I.format('qinglangwenrun'),
    '自信青年': I.format('zixinqingnian'), '正直青年': I.format('zhengzhiqingnian'),
}


def main():
    sys.stdout.reconfigure(encoding='utf-8')
    out = Path(sys.argv[1])
    out.mkdir(parents=True, exist_ok=True)
    k = T.key()
    done = bad = 0
    for name, voice in CAND.items():
        f = out / f'{name}.mp3'
        if f.exists():
            continue
        try:
            f.write_bytes(T.tts(TEXT, voice, 0, k))
            done += 1
            print('ok', name, flush=True)
        except SystemExit as e:
            bad += 1
            print('失败', name, str(e)[:160], flush=True)
    print(f'新合成 {done} 个，失败 {bad} 个，约 {done * len(TEXT)} 字符')


if __name__ == '__main__':
    main()
