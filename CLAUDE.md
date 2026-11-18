# 自媒体工作区 · 给 Claude 的项目规矩

The user doesn't code. Talk to them in plain Simplified Chinese (their global CLAUDE.md applies), and keep every user-facing line in Chinese, including progress notes. They use both the terminal CLI and the desktop app, so don't rely on desktop-only tools for critical steps.

The channel makes **AI 热点讲解片**: landscape, one narrator, white background, official footage of the thing itself, and a small mascot named **Aha** who explains. The old dual-host podcast format was retired; its template, host images and workflow doc were deleted on 2026-11-12 at the user's request.

## Read first
- `README.md`: what each folder is.
- `制作流程-AI热点讲解片.md`: the workflow and every decision with its reason. **This doc is the source of truth.**
- `_讲解片模板\README.md` and `_讲解片模板\画面规矩.md`: per-episode steps, tools, layout rules (each rule carries the user's own words).
- `待办.md`: open items. `授权与合规.md`: licences and publishing rules.
- `_组件库\规矩和踩过的坑.md`: the user's feedback, quoted, in order.
- For an episode, follow the workflow doc stage by stage. Start from the sample episode `AI热点-1112\` (scored 99.99). The newest episode is `AI热点-1112-新稿\` (2026-11-13: approved script v6, whole-script voicing; its finished film used per-section layouts, which the user replaced with "one stage" on 2026-11-14; not scored). For script and voicing practice, follow the newer one. The episode in progress is `AI热点-1114\` (DeepSeek 全家桶应用 API; read its `进度.md` first): script and voice done, stills sent, whole film not rendered, two questions waiting on the user.
- The workflow doc has a one-page "不该做的事" list (2026-11-14). Read it before starting; add to it whenever the user or a review rules something out.

## Hard rules
- The topic always comes from the user. Never pick one and start.
- Confirm the script with the user before any voicing. Confirm any new character, look or layout with stills before building a whole film.
- Facts: original post, official docs and at least one outlet. Keep `核实过的事实.md` in every episode folder; never invent numbers. A number you computed yourself must also be written there, or it stays off screen. If only the party's own statement exists, say so and write "按它公布的". After any rewrite, re-check every absolute claim (同一天 / 第一 / 最 / 全部) against the fact table: on 2026-11-13 a rewrite turned "五条新消息" into "同一天出了五样新东西", which was wrong for one of the five.
- Write scripts per `播客写稿规范-去AI味.html` (section 二b, one narrator) plus "稿子怎么写" in the workflow doc. Run `script_check.py` before showing a script, then the lieflat AI-tone check (the user named this tool on 2026-11-13): fix only what it finds, call the same thing by the same word throughout, and never vary sentence length just to look human.
- Lay out every frame per `_讲解片模板\画面规矩.md`. Frame 0 must be a complete picture. One stage for the whole film (三b, decided by the user 2026-11-14): the big card, the right column and Aha keep the same place from frame 0 to the last frame; per section only what is inside the card changes, picked by that section's content. The same shot appears only once per film (四-10): keep a shot list and check it before delivery. On-screen text must not repeat the narration: one keyword per spot at most (三-4 and section 十). Before delivery, count layouts, Aha positions, transition types and repeated lines, and write the counts in the shot list.
- Say things in plain words. On 2026-11-14 the user had to ask "一个舞台和五种办事 是什么意思" after three turns of my own shorthand (版式, 舞台). When offering a choice, describe what is on screen and let them answer "左边 / 右边".
- When the user pastes someone else's method with few or no words, they want our current film checked against it (my reading; first seen 2026-11-12 with "有在这么做吗", again 2026-11-14 with no words). Audit with real counts, say plainly where we fall short, make stills for any change, and leave the finished film and approved rules alone until they answer.
- Script style is unsettled as of 2026-11-14: for the 1114 episode the user asked for a draft written "不参考任何规范", then chose it over the rule-following draft ("用新这版，重配"). They did not say the rules are void. Before writing the next script, ask whether to follow "稿子怎么写" or the freer 1114 style; facts, the fact table and confirm-before-voicing stay either way. Do not open a script with "我跟你说个事儿" (user, 2026-11-14: "去掉 我跟你说个事儿").
- When the user says "先收尾", stop starting new work: write where things stand into the episode's `进度.md`, update `待办.md`, list temp files with sizes without deleting, and leave pending questions pending.
- When the user says "沉淀" or "整理沉淀", fold the recent lessons into the workflow doc, the template, `画面规矩.md`, `REVIEW.md`, `待办.md` and this file, and fix anything in them that has gone stale.
- **Audit the sound before delivery, every episode** (`audio_check.py`): per-line loudness, real pauses, what word each sound effect lands on, where the music seam falls. You cannot hear; say so and tell the user what to listen for.
- Self-review scores only catch defects; whether it looks good is the user's score alone.
- At high scores, bring in independent `reviewer` agents: picture and sound separately, materials only, no conclusions; verify every finding yourself before reporting.
- Spending money (voicing, image generation, any paid tier), downloading files, publishing, or changing accounts: ask first, in one line with amount / file / source / size.
- Don't monetise for now. Voice is Doubao TTS 2.0 (`E:\tools\doubao-voice\`, voice 小天 `zh_male_taocheng_uranus_bigtts`, context 用轻松播客的语气说); its commercial terms are not verified yet.
- Deleting things: list them with sizes and get a yes first.

## Verification commands (run from an episode folder unless noted)
| What | Command |
|---|---|
| Script self-check | `python script_check.py dialog.json 130` |
| AI-tone check (lieflat, non-commercial licence) | `python -X utf8 -I E:\tools\lieflat-less-ai-tone\scripts\detect.py 去AI味\稿子.md` (make the .md with `去AI味\to_md.py`; add `--candidates` for the semantic layer; example in `AI热点-1112\去AI味\`) |
| Voice (costs money, ask) | `E:\tools\fish-voice\venv\Scripts\python.exe E:\tools\doubao-voice\tts_para.py . --paras <total number of lines> --voice zh_male_taocheng_uranus_bigtts --context "用轻松播客的语气说"` (the whole script in ONE request, then split into lines; never voice line by line or section by section, the pitch jumps between requests; re-voicing a single line afterwards will not match its neighbours) |
| Voice matches script | `E:\tools\fish-voice\venv\Scripts\python.exe E:\tools\fish-voice\align.py .` (every line ≥ 0.90; English names are not scored, so the user must listen) |
| Voice consistency (pitch / timbre per line; run right after voicing) | same python, `timbre_check.py .` → lines marked ◀ drift more than 1.5 semitones |
| Re-voice one line | same python, `revoice_line.py <line no.> ["text to speak"]` |
| Timeline | edit the config block at the top of `place.py`, then `python place.py` → read `排时间.txt` |
| Stills | in `E:\tools\FredTalk-work\ep1`: `node tools/stills.mjs out/x 0,3.2,15 0.5 FILMN soft` then `python tools/sheet.py out/x 5` |
| Render | in `E:\tools\FredTalk-work\ep1`: `npx remotion render src/index.tsx FILMN out/raw.mp4 --codec=h264 --crf=17 --log=error` |
| Loudness | `python post.py raw.mp4 成片_名字.mp4` → about −12 LUFS, peak ≤ −1 dBFS |
| Sound audit | `python audio_check.py <sfx times, comma separated>` → read `声音检查.txt` (includes a check for gaps in the music) |
| Review pack | in `review\`: `python make_review_pack.py 成片_名字.mp4` |
| Official web-page screenshots (ask first) | Edge headless with a throwaway profile, narrow window so text is large: see the row in `_讲解片模板\README.md`. Originals go to `E:\tools\brand-footage\<date>\`; record sources in `授权与合规.md` |

## Where things live
- Template: `_讲解片模板\`. Copy it per episode as `AI热点-月日\`. Tool changes go to the template first, then to the current episode.
- Picture project: `E:\tools\FredTalk-work\ep1\` (Remotion; the path must be ASCII). Sample film `src\hot2\Film4.tsx`; **start new episodes from `src\hot3\Film6.tsx`** (`FILM6`, several items per film) or `src\hot4\Film7.tsx` (`FILM7`, one topic, cards hold official web-page screenshots with a moving frame); both are one-stage and so far exist only as stills, never rendered whole; `src\hot3\Film5.tsx` (`FILM5`) is the per-section-layout film, kept for reference; mascot `src\hot\Buddy.tsx`, shared parts `src\hot\fx.tsx`, section layouts `src\hot\layouts.tsx` (five layouts, picked per section by content, approved 2026-11-12; usage example `src\hot2\LayoutReel.tsx`; rules in `画面规矩.md` section 三b). A backup copy sits in `_讲解片模板\样板代码\`; keep it in sync when those files change.
- Official footage and logos: `E:\tools\brand-footage\`, `E:\tools\brand-logos\`. Record every download in `授权与合规.md`.
- Music: `_讲解片模板\配乐\` (Mixkit Pop Track 03).
- Removed and not coming back unless the user asks: LTX / ComfyUI / InfiniteTalk / qwen3-tts / Real-ESRGAN (2026-11-08), the dual-host podcast template, host images and early episodes (2026-11-12). `E:\tools\openai-image\gen_host.py` pointed at the deleted host folders, so it needs new paths before it can run.
- Windows gotchas: run Python with `PYTHONUTF8=1`. Don't put backslash paths or Chinese paths in bash heredocs / `printf` / `echo` (escapes get eaten); write the file with the Write tool or Python.

## Keeping docs current
When anything changes, update `制作流程-AI热点讲解片.md` (current state plus the decision and its reason, with the user's words), `_讲解片模板\README.md` / `画面规矩.md`, and `待办.md`. Record user feedback verbatim in `_组件库\规矩和踩过的坑.md`.

## 参考
- 素材授权：Mixkit https://mixkit.co/license/ （每条素材看页面标 Free 还是 Restricted），Pexels https://www.pexels.com/license/ ，Pixabay https://pixabay.com/service/license-summary/ 。
- OpenAI 出图（按张收费，用前先问）：工具在 `E:\tools\openai-image\`，密钥由用户双击 `设置Key.bat` 填进同目录 `.env`，不读、不打印。2026-11-08 实测每张约 0.056 美元。
- 对标和学习笔记：`对标拆解\`（只学做法，片中内容不当事实用）。
