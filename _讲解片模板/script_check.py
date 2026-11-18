"""Machine part of the script self-check (规范: E:\\自媒体\\播客写稿规范-去AI味.html).

Flags AI-style words and structures, over-long lines, lines with two numbers, missing question marks,
the same speaker twice in a row, and the estimated length. The human part of the checklist (read it aloud,
does anyone doubt or get corrected, are the roles mixed up) still has to be done by reading the script.

usage: python script_check.py [dialog.json] [max_seconds] [min_seconds]   (default target 60–90 s; pass e.g. 180 for a longer episode)

一人讲（dialog.json 里只有一个说话的人）时：不查“同一个人连说两句”，每句最长 40 字，
还会列出技术词，提醒紧跟一句大白话解释（写稿规范第二b节）。
"""
import json, re, sys
from pathlib import Path

BANNED = ['首先', '其次', '最后', '总之', '综上所述', '此外', '因此', '然而', '值得注意', '值得一提', '不可否认',
          '不仅', '一方面', '另一方面', '赋能', '助力', '打造', '闭环', '底层逻辑', '意义深远', '引发热议', '浪潮',
          '进行', '该公司', '显著', '是否', '这意味着', '不容忽视']
PATTERNS = [(r'不是.{1,12}而是', '不是……而是'), (r'一是.{1,30}二是', '一是……二是（列清单）'),
            (r'一边.{1,6}，一边', '一边……一边（对仗）'), (r'不[^，。]{1,5}，只', '不……，只……（和"不是而是"一个味道）')]
# 2026-11-12 用户："文案内容 我不满意，ai味十足"。那篇稿子原来的机器检查是"没发现问题"，所以加下面几项。
# 这些只是提醒，查到了就念一遍看是不是太工整；查不到也不等于没有 AI 味。
LIST_OPEN = re.compile(r'^(先说|首先|第[一二三四五六七八九十]个|再来是|接下来|然后是|最后一个|最后说)')
TONE = re.compile(r'说实话|对了|我看|我猜|说白了|其实|真的假的|吧[，。？！]|啊[，。？！]|呢[，。？！]|嘛[，。]|呗')
SUMMARY_END = re.compile(r'所以该|记住|总结|要学会|这几样|三件事|三点')


def couplet(t):
    """相邻两个短分句像不像对仗：都带"的"且长短差不多，或者开头是同一个字（一张……，一套……）。"""
    parts = [x for x in re.split(r'[，。：；？！、]', t) if x]
    for a, b in zip(parts, parts[1:]):
        if not (3 <= len(a) <= 9 and 3 <= len(b) <= 9):
            continue
        if '的' in a and '的' in b and abs(a.index('的') - b.index('的')) <= 1 and abs(len(a) - len(b)) <= 1:
            return f'{a}，{b}'
        if a[0] == b[0] and a[0] in '一有越又最':
            return f'{a}，{b}'
    return None
CHARS_PER_SEC = 6.3  # measured: Fish voices at speed 1.15 (deepseek-1020: 383 chars in 60.6 s)
JARGON = ['API', '接口', '模型', '参数', '算力', 'token', 'Token', '智能体', 'Agent', 'agent', '开源', '训练', '推理',
          '向量', '上下文', '多模态', '部署', '架构', '算法', '数据集', '基准', '微调', '权重', '提示词']
NUM = re.compile(r'\d+(?:\.\d+)?|[零一二两三四五六七八九十百千万亿]+(?:点[零一二三四五六七八九]+)?(?=[个%年月日号岁倍名位成块元亿万千百次条款])')


def main():
    sys.stdout.reconfigure(encoding='utf-8')
    path = Path(sys.argv[1] if len(sys.argv) > 1 else 'dialog.json')
    lines = json.loads(path.read_text(encoding='utf-8'))['lines']
    issues, total, counts = [], 0, {}
    solo = len({w for w, _ in lines}) == 1
    max_len = 40 if solo else 50
    jargon = []
    prev = None
    for i, (who, text) in enumerate(lines, 1):
        t = re.sub(r'\s', '', text)
        total += len(t)
        tag = f'L{i:02d} {who}'
        for w in BANNED:
            if w in t:
                counts[w] = counts.get(w, 0) + 1
                issues.append(f'{tag}: 有 AI 腔的词「{w}」')
        for pat, name in PATTERNS:
            if re.search(pat, t):
                issues.append(f'{tag}: 句式「{name}」')
        dashes = t.count('——')
        counts['——'] = counts.get('——', 0) + dashes
        if len(t) > max_len:
            issues.append(f'{tag}: 太长（{len(t)} 字，最好不超过 {max_len}）')
        if solo:
            jargon += [f'{tag}「{w}」' for w in JARGON if w in text]
        if solo and len(re.findall(r'[A-Za-z][A-Za-z0-9.]*(?:\s+[A-Z0-9][A-Za-z0-9.]*)*', text.replace('AI', ''))) >= 3:
            issues.append(f'{tag}: 一句里三个以上外文名，只听的人记不住（嘴上只念一个，其余放画面上）')
        if len(NUM.findall(t)) >= 2:
            issues.append(f'{tag}: 一句里有两个以上数字')
        c = couplet(t)
        if c:
            issues.append(f'{tag}: 像对仗句「{c}」（念一遍，太工整就改成随口说的）')
        if re.search(r'(吗|呢|什么|啥|多少|怎么|哪|谁|几|是不是|该不该|对不对|真的假的)[^？?]{0,3}$', t) and not re.search(r'[？?]', t):
            issues.append(f'{tag}: 像问句但没有「？」')
        if who == prev and not solo:
            issues.append(f'{tag}: 同一个人连说两句（检查是不是角色串了）')
        prev = who
    if counts.get('——', 0) > 1:
        issues.append(f'破折号用了 {counts["——"]} 次（整篇最多 1 次，只用在说到一半改口）')
    secs = total / CHARS_PER_SEC
    print(f'{len(lines)} 句，{total} 字，估计 {secs:.0f} 秒')
    hi = float(sys.argv[2]) if len(sys.argv) > 2 else 90
    lo = float(sys.argv[3]) if len(sys.argv) > 3 else 60
    if not lo - 5 <= secs <= hi + 5:
        issues.append(f'总长估计 {secs:.0f} 秒，超出 {lo:.0f}–{hi:.0f} 秒')
    lengths = [len(re.sub(r"\s", "", t)) for _, t in lines]
    if max(lengths) - min(lengths) < 15:
        issues.append('句子长短太整齐（最长和最短差不到 15 字）')
    med = sorted(lengths)[len(lengths) // 2]
    if len(lengths) >= 8 and sum(abs(x - med) <= 5 for x in lengths) / len(lengths) > 0.7:
        issues.append(f'句子长短太齐（七成以上的句子都在 {med} 字上下 5 个字以内），像书面稿')
    if solo:
        opens = [f'L{i:02d}' for i, (_, t) in enumerate(lines, 1) if LIST_OPEN.search(t)]
        if len(opens) >= 3:
            issues.append(f'像清单：{len(opens)} 句是"先说 / 第几个 / 再来是"这样开头的（{"、".join(opens)}）')
        tone = sum(1 for _, t in lines if TONE.search(t))
        if tone < len(lines) / 8:
            issues.append(f'几乎没有口气（{len(lines)} 句里只有 {tone} 句带"说实话、对了、我看、吧、啊"这类），像在念文章')
        sents = [x for _, t in lines for x in re.split(r'[。？！]', re.sub(r'\s', '', t)) if x]
        short = sum(1 for x in sents if len(x) <= 8)
        if len(sents) >= 10 and short / len(sents) > 0.3:   # CHOPPY
            issues.append(f'切得太碎（{len(sents)} 句里有 {short} 句不到 9 个字），一顿一顿的；顺着说完，中间用逗号')
        if any(re.search(r'用不上|碰不到|看个热闹|跟你没关系|听着挺', t) for _, t in lines):
            issues.append('有泼冷水、损人的话（用不上 / 碰不到 / 看个热闹 这类）；用户要的是像朋友聊天')
        neg = [i for i, (_, t) in enumerate(lines, 1) if re.search(r'[不没别未勿]|并非|无法', t)]   # NEGATION
        if neg:
            issues.append('有否定的说法（第 ' + '、'.join(str(i) for i in neg) + ' 句带"不 / 没 / 别"）；用户 2026-11-13 说"不要否定用语"，换成肯定的说法')
        if any(SUMMARY_END.search(t) for _, t in lines[-3:]):
            issues.append('结尾像在总结或列建议（规范：结尾是一句具体的话加一个问题）')
    print('\n'.join(issues) if issues else '机器检查：没发现问题（不等于没有 AI 味，下面几条要自己念一遍）')
    if jargon:
        print('技术词（看后面有没有紧跟一句大白话解释，没有就换成日常说法）：' + '、'.join(jargon))
    if solo:
        print('还要人工看：前 15 秒有没有走完开头三步；没学过技术的人听一遍能不能懂；技术词后面有没有紧跟一句解释；没确认的和猜测的说清了吗；结尾是不是一句具体的话加一个问题。')
        print('查 AI 味（2026-11-12 起）：有没有一个比方从头套到尾（比方随口一句就扔）；几件事是不是讲得一样细、但进法不一样（不要五段一个模子）；口气像不像朋友聊天，有没有损人、泼冷水的话；有没有把话切成一顿一顿的短句；有没有对仗句、排比（两三个长得一样的短语或句子并排）；每段第一句有没有接住上一段（承上启下）；有没有哪句你对朋友说不出口；稿子里有没有"试过"或用户自己的态度，还是全在转述公告。')
        return
    print('还要人工看：前 15 秒有没有走完开头三步；每个小话题有没有小糖问出的问题；没确认的和猜测的说清了吗；留的结局讲到了吗；出声读一遍；有没有人怀疑、追问或被纠正；角色有没有串；有没有总结式结尾。')


if __name__ == '__main__':
    main()
