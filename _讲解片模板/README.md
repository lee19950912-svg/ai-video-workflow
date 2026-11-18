# 讲解片模板 · 每期复制一份用

流程和每个决定的原因在上一层的 [制作流程-AI热点讲解片.md](../制作流程-AI热点讲解片.md)，以那份为准。这里是每一步要用的东西，按顺序排。
样板是 11 月 12 日那期《同一天，AI 圈开了场招聘会》（用户打了 99.99 分），在 `E:\自媒体\AI热点-1112\`。同一批题目的新稿版本在 `E:\自媒体\AI热点-1112-新稿\`（2026-11-13，稿子第六稿、整篇一次合成的配音；它的成片是按"每段换一种版式"排的，这个排法 2026-11-14 已被"一个舞台"取代），稿子和配音的做法以新稿那期为准，画面从 Film6 起步。
动手前先看一眼流程文档里的"不该做的事（一页清单）"。

## 开一期新片
1. 把这个文件夹复制一份，改名成 `AI热点-月日`（比如 `AI热点-1115`）。`配乐\` 和 `样板代码\` 不用带过去，删掉副本里的这两个就行。
2. 在画面工程 `E:\tools\FredTalk-work\ep1\` 里给这一期起一个新名字（比如 `hot3`）：新建 `src\hot3\`、`public\hot3\`，把 `src\hot3\Film6.tsx`（一期讲几件事，卡里有视频、图、数字）或 `src\hot4\Film7.tsx`（一期只讲一件事，卡里全是官方网页截图，黑框跟着讲解走）复制过去改。两份都是"一个舞台"（用户 2026-11-14 定的；见 `画面规矩.md` 三b）。每期要改的是 `SEC`（五段的名字、谁家的、颜色）、`ITEMS`（开头的小卡）、每一段 `Stage` 里的 `panels`（卡里放什么、对到哪句话的哪个词）、开头和结尾的关键词。
3. 按下面的表一步步走。

## 每一步用什么
| 步骤 | 文件 / 命令 | 说明 |
|---|---|---|
| 核实 | `核实过的事实.md` | 稿子里每句话对应一行出处；分清官方确认、据报道、我的判断 |
| 写稿 | `dialog.json` | 一句一行。写完跑 `python script_check.py dialog.json 130`（130 是最长秒数） |
| 配音（花钱，先问） | `E:\tools\fish-voice\venv\Scripts\python.exe E:\tools\doubao-voice\tts_para.py . --paras 总句数 --voice zh_male_taocheng_uranus_bigtts --context "用轻松播客的语气说"` | 整篇一次合成再切句（`--paras` 只写总句数；写成"每段句数"就是一段合成一次，段和段之间调子会跳）。逐句合成的 `tts_doubao.py` 每句调子都不一样，2026-11-13 起不用它配整期。出 `audio\full.wav`、`audio\lines.json`、`script.json`、`切句.txt`；每段原始声音在 `audio\paras\`，加 `--split-only` 可以不花钱重新切句 |
| 量音高音色 | `E:\tools\fish-voice\venv\Scripts\python.exe timbre_check.py .` | 配完马上跑。带 ◀ 的句子和整体差 1.5 个半音以上 |
| 对口型 | `E:\tools\fish-voice\venv\Scripts\python.exe E:\tools\fish-voice\align.py .` | 每句 ≥ 0.90；出 `audio\timestamps.json` |
| 只重配一句 | 同一个 python 跑 `revoice_line.py 第几句 ["念的时候用的字"]` | **整篇一次合成之后尽量别用**：单独配的一句调子和前后不搭，配完要跑 `timbre_check.py` 看差多少，差得多就整篇重来。配完重跑对口型。第二个参数用来换个念法（比如把"5.2"去掉），字幕不变 |
| 排时间 | 先改 `place.py` 顶上的 `SLOT`、`SECS`、`BIG_AFTER`、`SEAM_CUT`，再 `python place.py` | 看 `排时间.txt`。数据写进画面工程的 `src\<SLOT>\data.json` 和 `public\<SLOT>\` |
| 截官方网页（没有官方视频时；先问用户） | `"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --headless=new --disable-gpu --hide-scrollbars --user-data-dir=<一个临时空文件夹> --window-size=900,3000 --force-device-scale-factor=2 --virtual-time-budget=12000 --screenshot=<输出.png> <网址>` | 用本机 Edge 的无界面模式，临时空白配置（不带用户的登录信息）。**窗口先用窄的（900 左右）**：页面会变成单栏，放进大卡里字才够大；1440 宽截出来的字太小（2026-11-14 踩过）。高度填大一点，一次截到底。原件放 `E:\tools\brand-footage\日期\`，来源记进 `授权与合规.md` |
| 素材进工程 | 官方演示转成 30 帧、每半秒一个关键帧放 `public\<SLOT>\footage\`；官方图放 `public\<SLOT>\shots\` | 命令见下面"素材怎么转" |
| 写画面 | 画面工程里的 `src\<SLOT>\FilmN.tsx` | 照样板改内容，规矩见 [画面规矩.md](画面规矩.md)。在 `src\index.tsx` 里登记 |
| 出静帧自查 | 在画面工程里 `node tools/stills.mjs out/x 0,3.2,15 0.5 FILMN soft`，再 `python tools/sheet.py out/x 5` | 第三个参数是秒数，用逗号隔开。新形象、新版式、新排法都先出静帧给用户看，点头才渲染整片 |
| 渲染 | 在画面工程里 `npx remotion render src/index.tsx FILMN out/raw.mp4 --codec=h264 --crf=17 --log=error` | 两分钟的片子约 5 到 8 分钟 |
| 调响度 | `python post.py raw.mp4 成片_名字.mp4` | 约 −12 LUFS，峰值不超过 −1 dB |
| 小文件 | `ffmpeg -i 成片_名字.mp4 -c:v libx264 -crf 25 -c:a copy 成片_手机看的小文件.mp4` | 发到手机的上限是 30 MB |
| 查声音 | `python audio_check.py 音效时刻1,音效时刻2,…` | 看 `声音检查.txt`：每句响度差、真实停顿、接缝、配乐有没有断档、音效压在什么字上、机器听岔的词 |
| 列镜头、数一遍 | 本期的 `镜头清单.md`（照 `AI热点-1112-新稿\镜头清单.md` 写） | 每段用了哪张图的哪一处、哪段视频的第几秒，有没有重的；再数几种画法、几个 Aha 位置、几种转场、几处复读台词 |
| 审片材料 | 在 `review\` 里 `python make_review_pack.py 成片_名字.mp4` | 出逐秒拼图、连拍、波形频谱、声音数据，给自己和独立审查员看 |

## 素材怎么转
```bash
ffmpeg -i 原视频.mp4 -an -r 30 -c:v libx264 -preset fast -crf 16 -g 15 -pix_fmt yuv420p public/<SLOT>/footage/k.mp4
ffmpeg -i 原视频.mp4 -vf "fps=1/2,scale=640:-1,tile=4x5:padding=6:color=white" -q:v 4 总览_%02d.jpg
```
第二条出"每 2 秒一格"的总览图，用来看这段演示每一秒在演什么，再决定稿子里的每句话配哪一段。
原件放 `E:\tools\brand-footage\日期\`，每家一个文件夹。下载前要用户点头，来源记进 `授权与合规.md`。

## 这个文件夹里有什么
| 文件 | 是什么 |
|---|---|
| `dialog.json` | 稿子的空壳（音色已填好） |
| `核实过的事实.md` | 事实表的空壳 |
| `script_check.py` | 稿子自查：AI 腔的词、超长句、一句两个数字、问句漏问号、一句三个以上外文名、总时长 |
| `to_md.py` | 把 `dialog.json` 按段落转成文本，给去 AI 味的工具 lieflat（`E:\tools\lieflat-less-ai-tone\`，非商用许可）检测用。用法：`python to_md.py dialog.json 去AI味\稿子.md 2,5,6,4,4,5,1`（最后是每段的句数）。检测和改写的步骤见流程文档"稿子怎么写"，样板在 `AI热点-1112\去AI味\` |
| `place.py` | 排时间（每句调响度、裁静音、分档停顿、配乐接缝、导出给画面工程） |
| `post.py` | 成片调响度 |
| `revoice_line.py` | 只重配一句 |
| `timbre_check.py` | 配完音量每句的音高、亮度、响度，标出和整体差得多的句子（2026-11-13 加，用户听出"每段内容音色不一样"之后）。用法：`E:\tools\fish-voice\venv\Scripts\python.exe timbre_check.py .` |
| `audio_check.py` | 交片前查声音 |
| `review\make_review_pack.py` | 出审片材料 |
| `画面规矩.md` | 画面怎么排、用户说过不要什么 |
| `配乐\` | Pop Track 03（Lily J，Mixkit 免费音乐许可）和它的节拍信息。原曲很响（−10.9 LUFS），混的时候压到人声下面 16 LU |
| `样板代码\` | 画面工程里三个关键文件的备份：`Film4.tsx`（整期）、`Buddy.tsx`（Aha）、`fx.tsx`（共用零件），加 `index.tsx` 和四个小工具。另有 `layouts.tsx`（四种可以换着用的段落版式）和 `LayoutReel.tsx`（拿 12 日那期的配音做的会动小样，也是"怎么用这几种版式"的例子）：2026-11-12 做的，用户看完小样说"可以，定下来"；下一期开始用，12 日那期没有返工。**干活用的是画面工程里的那份，这里只是备份** |

`样板代码\` 里 2026-11-13、14 又存了三份：**`Film6.tsx` 和 `Film7.tsx`（"一个舞台"，现在的起点）**，`Film5.tsx`（新稿那期按五种版式排的，留着备查）。

## 画面工程在哪、为什么不在这里
`E:\tools\FredTalk-work\ep1\`。出片工具 Remotion 的工程路径里不能有中文，所以放在 `E:\tools\` 下面。
- `src\hot\fx.tsx`：颜色、字体、缓动、遮罩出字、底色纹理这些共用零件。
- `src\hot\Buddy.tsx`：Aha（身体、眼睛、嘴、手脚、表情）。`IPDEMO`、`IPSHEET` 是它的小样。
- `src\hot2\Film4.tsx`：12 日那一期。里面"五段共用"的 `Section`、`pic`、`clip`、`talkAt`、`musicGain` 可以原样用；每期要改的是 `ROLES`（开头的小卡）、`SECS`（每段放什么画面、对到哪句话的哪个词）、开头和结尾的字。
- `src\hot\layouts.tsx`：四种新的段落版式（`Versus` 两样并排比、`BigNumber` 一个数当主角、`Steps` 一步一步、`Wide` 宽图通栏），外加 `Head`（左上角那一行）、`Aha`（带名字牌）、`makeTalk`（嘴）、`keyLook` / `keyMood` / `pulse`（按配音排它看哪、什么表情、什么时候抬手）。每段先按内容挑版式（见 `画面规矩.md` 三b），照 `src\hot2\LayoutReel.tsx` 里的写法填时间。`Film4.tsx` 的 `Section` 就是第五种"大卡 + 右栏"。
- `public\sfx\`：音效。`public\fonts\`：字体（MiSans 等）。`public\hot\fluid_soft_*.jpg`：五种柔和云彩底色，用 `tools\fluid.py`、`fluid_more.py` 生成。
- `src\hot3\`：新稿那期。`Film6.tsx`（`FILM6`，"一个舞台"，新一期的起点）、`Film5.tsx`（`FILM5`，按五种版式排的那版成片），两个用同一份 `data.json` 和配音。
- 要重渲 11 日或 12 日那两期：数据分别在 `src\hot\data.json`、`src\hot2\data.json`，登记名是 `FILM3`、`FILM4`。
