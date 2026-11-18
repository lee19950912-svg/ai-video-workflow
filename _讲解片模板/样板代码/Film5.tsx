// 《同一天，五样新东西》：11 月 12 日那一期的新稿版本（2026-11-13）。
// 稿子 E:\自媒体\AI热点-1112-新稿\dialog.json（29 句，第六稿，用户说"可以"）；配音是整篇一次合成的那一版。
// 和 Film4 的区别：每一段按内容挑版式（画面规矩三b），不再五段都是"大卡 + 右栏"：
//   01 比价钱   Versus      两张 Arena 榜单并排比
//   02 出广告   大卡 → BigNumber（一段之内换版式：Aha 从大卡旁边跳到数字旁边）
//   03 做判断   Wide        谷歌那张示意图通栏，黑框挨个框
//   04 进工作群 大卡        Grok Bot 官方演示视频
//   05 出商品图 Steps → BigNumber
// 换段的做法没变：颜色铺满 → 亮"第几个 + 干什么" → 颜色收进 Aha 的身体。
import React from 'react';
import { AbsoluteFill, Audio, Freeze, Img, OffthreadVideo, Sequence, getInputProps, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import D from './data.json';
import { CARD, RING, Fonts, PAGE, INK, MID, Reveal, WARN, WHITE, abs, clamp, expo, inout, io, logo, mi, mix, mono, rise, tex, tw, u } from '../hot/fx';
import { Buddy, Mood } from '../hot/Buddy';
import { BLACKPILL, BigNumber, Head, Steps, Versus, Wide, keyLook, keyMood, makeTalk, pulse } from '../hot/layouts';

const LS = D.LS as number[], LE = D.LE as number[], C = D.cuts as number[], END = D.END as number, VO = D.VO as unknown as [string, number, number][][];
const SUBS = D.subs as { s: number; e: number; text: string }[];
const at = (li: number, phrase: string) => { const s = VO[li].map((c) => c[0]).join(''), i = s.indexOf(phrase); if (i < 0) throw new Error(`第 ${li} 句里找不到：${phrase}`); return VO[li][i][1]; };
const talkAt = makeTalk(VO);
const TITLE = '同一天，五样新东西', NAME = 'Aha';
// 试验开关（2026-11-14，用户发来"学会做减法"那份清单）：出静帧时标签填 lean = 删掉画面上把台词再念一遍的字。不填就是现在的成片。
const LEAN = (getInputProps() as { label?: string }).label === 'lean';
const DEMO = { x: 96, y: 150, w: 1356, h: 763, r: 34 }, BS = 1356 / 880, BX = 1672, BY = 640;
const smooth = (t: number, a: number, b: number) => { const v = u(t, a, b); return v * v * v * (v * (6 * v - 15) + 10); };
const LIFTS = D.lifts as number[][];
const musicGain = (t: number) => { let k = 0; LIFTS.forEach(([a, b]) => { k = Math.max(k, io(t, a, a + 0.25) * (1 - io(t, b - 0.25, b))); }); return (D.musicVol as number) * (1 + k); };
const LogoPill = ({ w, h = 92, children }: { w: number; h?: number; children: React.ReactNode }) => <div style={{ width: w, height: h, borderRadius: h / 2, ...CARD, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{children}</div>;
const pill = (s: string, w: number) => <LogoPill w={w} h={104}><span style={mi(46, INK, 600)}>{s}</span></LogoPill>;
const nameTag = (x: number, y: number, size = 24, extra: React.CSSProperties = {}) => <div style={abs(x - 100, y, { width: 200, display: 'flex', justifyContent: 'center', ...extra })}><span style={BLACKPILL(size)}>{NAME}</span></div>;

// 五段：第几个、干什么、谁家的、颜色；from = 颜色从哪儿铺开（上一段结束时 Aha 站的地方），home = 颜色收到哪儿（这一段开头 Aha 站的地方和它的大小）
const SEC: { num: string; role: string; who: string; tx: string; glow: string; from: [number, number]; home: [number, number, number]; flood: React.ReactNode }[] = [
  { num: '01', role: '比价钱', who: 'Arena 榜单', tx: 'gold', glow: 'rgba(240,150,40,.26)', from: [288, 593], home: [960, 778, 205], flood: pill('Arena 榜单', 380) },
  { num: '02', role: '出广告', who: 'fal', tx: 'coral', glow: 'rgba(240,80,60,.24)', from: [960, 778], home: [BX, BY, 250], flood: pill('fal', 200) },
  { num: '03', role: '做判断', who: '谷歌 · Gemini Decision 1', tx: 'teal', glow: 'rgba(10,90,150,.24)', from: [1500, 768], home: [1668, 110, 176], flood: <LogoPill w={300} h={124}><img src={logo('google.png')} style={{ width: 260 }} /></LogoPill> },
  { num: '04', role: '进工作群', who: '马斯克的公司 · Grok Bot', tx: 'violet', glow: 'rgba(90,60,220,.24)', from: [1668, 110], home: [BX, BY, 250], flood: pill('Grok Bot', 330) },
  { num: '05', role: '出商品图', who: '国内公司 MiniMax · H3 Image', tx: 'green', glow: 'rgba(30,160,100,.26)', from: [BX, BY], home: [356, 758, 184], flood: pill('MiniMax', 300) },
];

// ── 换段：颜色铺满全屏，亮一下第几个和干什么，再整片收进 Aha 的身体 ─────────────────────────
function Flood({ t, i }: { t: number; i: number }) {
  const S = SEC[i], c = C[i], cover = inout(t, c - 0.42, c), shrink = expo(t, c + 0.5, c + 1.1);
  const fo = u(t, c - 0.3, c - 0.08) * (1 - u(t, c + 0.38, c + 0.6)), floodO = 1 - u(t, c + 0.98, c + 1.16);
  if (t < c - 0.42 || floodO <= 0) return null;
  const clipP = t < c + 0.5 ? `circle(${cover * 2400}px at ${S.from[0]}px ${S.from[1]}px)` : `circle(${mix(2400, S.home[2] * 0.37, shrink)}px at ${S.home[0]}px ${S.home[1] - 8}px)`;
  return <>
    <div style={abs(0, 0, { width: 1920, height: 1080, ...tex(S.tx, t), clipPath: clipP, opacity: floodO })} />
    {fo > 0 && <div style={abs(0, 0, { width: 1920, height: 1080, opacity: fo, clipPath: clipP })}>
      <div style={abs(0, 150, { width: 1920, textAlign: 'center', ...mi(330, WHITE), transform: `translateY(${(1 - expo(t, c - 0.3, c + 0.2)) * 70}px)`, textShadow: '0 20px 60px rgba(0,0,40,.25)' })}>{S.num}</div>
      <div style={abs(0, 520, { width: 1920, textAlign: 'center', ...mi(130, WHITE), transform: `translateY(${(1 - expo(t, c - 0.2, c + 0.3)) * 50}px)`, textShadow: '0 12px 40px rgba(0,0,40,.25)' })}>{S.role}</div>
      <div style={abs(0, 720, { width: 1920, display: 'flex', justifyContent: 'center', transform: `scale(${mix(0.7, 1, expo(t, c - 0.1, c + 0.4))})` })}>{S.flood}</div>
    </div>}
  </>;
}

// ── 真画面：官方演示视频（kf = [成片第几秒, 素材第几秒]）和官方图（kf = [成片第几秒, 放大倍数, 对准图上的 x, y]）──
type KF = [number, number][];
const srcAt = (kf: KF, t: number) => { if (t <= kf[0][0]) return kf[0][1]; for (let i = 1; i < kf.length; i++) if (t < kf[i][0]) { const a = kf[i - 1], b = kf[i]; return mix(a[1], b[1], (t - a[0]) / Math.max(1e-6, b[0] - a[0])); } return kf[kf.length - 1][1]; };
const clip = (file: string, kf: KF) => (t: number) => <Freeze frame={Math.max(0, Math.round(srcAt(kf, t) * 30))}><OffthreadVideo muted src={staticFile(file)} style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', objectFit: 'cover' }} /></Freeze>;
type PK = [number, number, number, number][];
const pic = (img: string, iw: number, ih: number, kf: PK) => (t: number) => {
  let n = 0; kf.forEach((k, i) => { if (t >= k[0]) n = i; });
  const a = kf[n], b = kf[Math.min(kf.length - 1, n + 1)], k = n === kf.length - 1 ? 1 : smooth(t, a[0], b[0]), z = mix(a[1], b[1], k), cx = mix(a[2], b[2], k), cy = mix(a[3], b[3], k), w = 880 * z, h = w * ih / iw;
  return <><div style={abs(0, 0, { width: 880, height: 495, background: WHITE })} /><Img src={staticFile(img)} style={abs(440 - cx * w, 247.5 - cy * h, { width: w, height: h })} /></>;
};

// ── 版式五："大卡 + 右栏"（放 16:9 的官方演示）。c = 这一段的换段点；hideAt = 同一段换到下一个版式的时刻（Aha 到点不画，交给下一个版式）──
type Panel = { a: number; b: number; tag?: string; tagAt?: number; src?: string; mood?: Mood; pts?: number[]; body: (t: number) => React.ReactNode };
function Big({ t, i, panels, hideAt }: { t: number; i: number; panels: Panel[]; hideAt?: number }) {
  const S = SEC[i], c = C[i];
  let pn = -1; panels.forEach((p, k) => { if (t >= p.a) pn = k; });
  const P = pn >= 0 ? panels[pn] : null, mood: Mood = P ? P.mood || 'calm' : 'calm', pmood: Mood | undefined = pn > 0 ? panels[pn - 1].mood || 'calm' : undefined, mk = P && pn > 0 ? u(t, P.a, P.a + 0.22) : 1;
  let pt = 0; panels.forEach((p) => (p.pts || []).forEach((c0) => { pt = Math.max(pt, io(t, c0 - 0.15, c0 + 0.15) * (1 - io(t, c0 + 1.1, c0 + 1.5))); }));
  const pop = expo(t, c + 0.92, c + 1.45), bmood = (m: Mood) => (m === 'wow' ? 120 : m === 'happy' ? 50 : m === 'side' ? 28 : 0), gone = hideAt !== undefined && t >= hideAt;
  return <>
    <div style={abs(DEMO.x, DEMO.y, { width: DEMO.w, height: DEMO.h, borderRadius: DEMO.r, overflow: 'hidden', background: WHITE, boxShadow: `${RING}0 34px 80px ${S.glow}, 0 4px 12px rgba(30,40,80,.10)`, ...rise(t, c + 0.36, { dy: 70, s0: 0.95 }) })}>
      {panels.map((p, k) => { const a0 = k ? p.a - 0.2 : p.a; if (t < a0 - 0.05 || t >= p.b + 0.5) return null;
        return <div key={k} style={{ position: 'absolute', left: 0, top: 0, width: DEMO.w, height: DEMO.h, background: WHITE, ...(k ? rise(t, a0, { dy: 70, s0: 1, d: 0.55 }) : {}) }}>
          <div style={{ position: 'absolute', left: 0, top: 0, width: 880, height: 495, transform: `scale(${BS})`, transformOrigin: '0 0' }}>{p.body(t)}</div>
        </div>; })}
    </div>
    <div style={abs(1488, 196)}><Reveal t={t} t0={c + 0.8} text={S.role} style={mi(S.role.length > 3 ? 66 : 80)} /></div>
    {P && P.src && <div style={abs(1472, BY + 208, { width: 400, textAlign: 'center', ...mono(19, MID), ...rise(t, P.a + 0.3, { dy: 10, s0: 1 }) })}>{P.src}</div>}
    {!gone && <>
      {P && P.tag && t >= (P.tagAt ?? P.a) && <div style={abs(BX - 150, BY - 212, { width: 300, display: 'flex', justifyContent: 'center', ...rise(t, P.tagAt ?? P.a + 0.35, { out: P.b, dy: 14, s0: 0.8 }) })}><span style={BLACKPILL(26, P.tag === '我猜' || P.tag === '据报道' ? WARN : INK)}>{P.tag}</span></div>}
      {nameTag(BX, BY + 150, 22, { opacity: pop })}
      {t > c + 0.92 && <Buddy t={t} x={BX} y={BY} size={mix(190, 250, pop)} tint={S.tx} mood={mood} prev={pmood} mk={mk} talk={talkAt(t)} look={[-0.7, -0.05]} sy={1 + Math.sin(u(t, c + 0.92, c + 1.42) * Math.PI) * 0.08}
        armR={22 + (bmood(mood) + (mood === 'think' ? 128 : 0)) * mk} armL={22 + pt * 78 + bmood(mood) * mk * (1 - pt)} rot={mood === 'think' ? -6 * mk : mood === 'side' ? 4 * mk : 0} seed={S.num.charCodeAt(1)} />}
    </>}
  </>;
}
// 一段之内换版式：前一个往上淡出，后一个里面的东西各自浮上来
const leave = (t: number, ts: number): React.CSSProperties => ({ opacity: 1 - io(t, ts - 0.05, ts + 0.22), transform: `translateY(${-io(t, ts - 0.05, ts + 0.3) * 34}px)` });

const FABLE = 'hot2/shots/fable_board.jpg', EMBER = 'hot2/shots/ember_board.jpg', AD = 'hot2/shots/ad_frames.jpg', COUCH = 'hot2/shots/couch.jpg', CARDIMG = 'hot2/shots/decision_card.jpg';
const K = 'hot2/footage/k.mp4', ST = 0.4;

// ══ 开头：五样新东西 + Aha ═══════════════════════════════════════════════════
const ITEMS: [string, string, string, string][] = [['01', '比价钱', 'Arena 榜单', 'gold'], ['02', '出广告', 'fal', 'coral'], ['03', '做判断', 'Gemini Decision 1', 'teal'], ['04', '进工作群', 'Grok Bot', 'violet'], ['05', '出商品图', 'MiniMax H3 Image', 'green']];
const itemCard = (t: number, i: number, x: number, y: number, w: number, h: number, shadow: string, extra: React.CSSProperties = {}) => { const [no, name, sub, tint] = ITEMS[i], s = w / 316;
  return <div key={i} style={abs(x, y, { width: w, height: h, borderRadius: 30 * s, overflow: 'hidden', background: WHITE, boxShadow: shadow, ...extra })}>
    <div style={abs(0, 0, { width: w, height: 84 * s, ...tex(tint, t + i) })} /><span style={abs(24 * s, 28 * s, mono(26 * s, WHITE))}>{no}</span>
    <span style={abs(24 * s, 112 * s, mi((name.length > 3 ? 46 : 54) * s, INK))}>{name}</span><span style={abs(26 * s, 186 * s, mi(23 * s, MID, 500))}>{sub}</span>
  </div>; };
const TopLine = () => <div style={abs(76, 60, { display: 'flex', alignItems: 'center', gap: 16, zIndex: 5 })}><div style={{ width: 16, height: 16, borderRadius: 8, background: INK }} /><span style={mi(30, INK, 600)}>{TITLE}</span><span style={mi(27, MID, 500)}>· 2026 年 11 月 11 日（美国时间）</span></div>;
function Intro({ t }: { t: number }) {
  const tA = at(1, '就觉得') - 0.15, c0 = at(0, '五样') - 0.1, c1 = at(1, '各干各的') - 0.1, h0 = 'AI 圈一口气出了', h1 = '现在的 AI，开始', lift = expo(t, C[0] - 0.9, C[0] - 0.4);
  const own = io(t, c1, c1 + 0.4);   // "各干各的"：五张卡各动各的
  const mood: Mood = t < c0 ? 'calm' : t < tA ? 'wow' : t < c1 ? 'think' : 'happy', hop = Math.sin(u(t, c1, c1 + 0.5) * Math.PI);
  const wave = u(t, 0.1, 0.35) * (1 - u(t, 1.9, 2.3)), hap = io(t, c1, c1 + 0.3);
  return <>
    <TopLine />
    {!LEAN && <div style={abs(150, 190, { ...BLACKPILL(28), ...rise(t, -1, { out: tA, dy: 20 }) })}>同一天</div>}
    {!LEAN && <div style={abs(150, 262)}><Reveal t={t} t0={-1} text={h0} style={mi(96)} out={tA + 0.05} /></div>}
    {t < tA + 0.2 && <div style={abs(LEAN ? 150 : 150 + tw(h0, 96) + 26, 252, { height: 128, borderRadius: 64, background: INK, padding: '0 40px', display: 'flex', alignItems: 'center', ...mi(96, WHITE), transformOrigin: '50% 50%', transform: `scale(${1 + 0.1 * Math.sin(u(t, c0, c0 + 0.45) * Math.PI)})`, opacity: 1 - io(t, tA - 0.12, tA + 0.1) })}>五样新东西</div>}
    <div style={abs(150, 190, { ...BLACKPILL(28), ...rise(t, tA + 0.1, { dy: 20 }) })}>我的看法</div>
    {!LEAN && <div style={abs(150, 262)}><Reveal t={t} t0={tA + 0.15} text={h1} style={mi(96)} /></div>}
    {t > c1 && <div style={abs(LEAN ? 150 : 150 + tw(h1, 96) + 26, 252, { height: 128, borderRadius: 64, background: INK, padding: '0 40px', display: 'flex', alignItems: 'center', ...mi(96, WHITE), transformOrigin: '0 50%', transform: `scale(${expo(t, c1, c1 + 0.5)})` })}>各干各的</div>}
    {ITEMS.map((_, i) => { const up = i === 0 ? lift : 0, bob = Math.sin(u(t, 0.15 + i * 0.14, 0.7 + i * 0.14) * Math.PI) * 18 + Math.sin(u(t, c0 + i * 0.12, c0 + 0.5 + i * 0.12) * Math.PI) * 18;
      const dy = own * Math.sin((t - c1) * (2.6 + i * 0.55) + i * 1.9) * 16, rot = own * Math.sin((t - c1) * (1.9 + i * 0.4) + i) * 2.2;   // 每张卡的快慢和方向都不一样
      return itemCard(t, i, 130 + i * 336, 468 - up * 14 - bob + dy, 316, 250, `${RING}0 ${24 + up * 22}px ${54 + up * 30}px rgba(30,40,80,${0.17 + up * 0.1}), 0 4px 10px rgba(30,40,80,.09)`, { transform: `rotate(${rot}deg)` }); })}
    <Buddy t={t} x={1700} y={270 - hop * 60} size={210} tint="violet" mood={mood} talk={talkAt(t)} look={[t > c1 ? -0.6 : -0.2, t > c1 ? 0.7 : 0.1]} sy={1 + hop * 0.06} armR={22 + wave * (108 + Math.sin(t * 13) * 24) + hap * 55} armL={22 + hap * 55} foot={hop} />
    {nameTag(1700, 396, 24)}
  </>;
}

// ══ 01 比价钱：两张 Arena 榜单并排 ════════════════════════════════════════════
function S1({ t }: { t: number }) {
  const a = C[0], nm = at(4, 'Claude') - 0.1, rank = at(4, '排第一') - 0.05, n1 = at(4, '七美元多') - 0.1, r0 = LS[5] - 0.25, n2 = at(5, '两美分') - 0.1, rk2 = at(5, '排名也') - 0.05, only = LS[6] - 0.05, see = LS[7] - 0.05, cheap = at(7, '便宜的') - 0.1, hard = at(7, '难活儿') - 0.1;
  return <>
    <Head title={TITLE} num="01" total="05" role="比价钱" who="Arena 榜单" />
    <Versus t={t} tint="gold" glow={SEC[0].glow} talk={talkAt(t)} tag={t < only ? (LEAN ? undefined : { text: 'Arena · 给 AI 排名的网站', at: at(3, 'Arena') - 0.1 }) : t < see ? { text: '只有 Arena 自己公布', at: only } : { text: '我看', at: see }}
      L={{ crop: { img: FABLE, iw: 2400, ih: 2400, z: 1.06, cx: 0.4954, cy: 0.2682 }, name: 'Claude Fable 5.2', nameAt: nm, pill: '总榜第 1', pillAt: rank, num: '7.3', unit: '美元', per: '干一件', numAt: n1, src: '图 · Arena 官方（它自己公布的）' }}
      R={{ crop: { img: EMBER, iw: 1249, ih: 1303, z: 2.454, cx: 0.7962, cy: 0.6366, marks: [[0.842, 0.88, 0.661]] }, cover: r0, name: 'Meta · Muse Ember', nameAt: at(5, 'Meta') - 0.05, pill: '总榜第 25', pillBg: MID, pillAt: rk2, num: '0.02', unit: '美元', per: '干一件', numAt: n2, src: '图 · Arena 官方' }}
      aha={{ ...keyMood(t, [[a, 'calm'], [n1 + 0.05, 'wow'], [r0, 'calm'], [n2 + 0.05, 'wow'], [only, 'side'], [see, 'think'], [cheap, 'happy']]),
        look: keyLook(t, [[a, 0, 0.1], [LS[3], -0.6, -0.5], [n1, -0.7, 0.25], [r0, 0.6, -0.5], [n2, 0.7, 0.25], [only, 0, 0.05], [cheap, 0.6, 0.2], [hard, -0.6, 0.2]]),
        armL: 22 + 113 * pulse(t, nm, n1 - 0.3) + 78 * pulse(t, n1, r0 - 0.2) + 78 * pulse(t, hard, LE[7] + 0.3),
        armR: 22 + 113 * pulse(t, at(5, 'Meta') - 0.1, n2 - 0.3) + 78 * pulse(t, n2, only - 0.2) + 128 * pulse(t, see, cheap - 0.1, 0.3) + 78 * pulse(t, cheap, hard),
        rot: -6 * pulse(t, see, cheap - 0.1, 0.3) }} />
  </>;
}

// ══ 02 出广告：大卡（官方图）→ 一个数当主角 ═════════════════════════════════════
function S2({ t }: { t: number }) {
  const c = C[1], n = at(11, '六十秒') - 0.1, ts = n - 0.55, typed = at(10, '打了') - 0.3, nine = at(10, '九张就') - 0.3, real = at(12, '真的假的') - 0.1, guess = at(12, '我猜') - 0.1, pay = LS[13] - 0.05;
  return <>
    <Head title={TITLE} num="02" total="05" role={t >= ts + 0.24 ? '出广告' : ''} who="fal" />
    {t < ts + 0.3 && <div style={leave(t, ts)}>
      <Big t={t} i={1} hideAt={ts} panels={[{ a: c + ST, b: ts, src: '图 · fal 官方演示', pts: [typed + 0.2, nine + 0.2],
        body: pic(AD, 3600, 2006, [[c + ST, 1, 0.5, 0.5], [LS[8] + 0.4, 1, 0.5, 0.5], [LS[8] + 1.5, 2.2, 0.3773, 0.2954], [typed, 2.28, 0.3693, 0.2874], [typed + 0.9, 1.42, 0.5, 0.64], [nine, 1.42, 0.5, 0.64], [nine + 0.9, 1.7, 0.565, 0.47], [ts + 0.5, 1.7, 0.565, 0.47]]) }]} />
    </div>}
    {t >= ts && <BigNumber t={t} tint="coral" glow={SEC[1].glow} talk={talkAt(t)} enter={ts} ahaFrom={{ x: BX, y: BY, size: 250, at: ts }} name="fal 自己拿它做的" num="60" unit="秒" cap="一支广告的长度" src="数字 · fal 自己公布的" numAt={n}
      proof={{ img: COUCH, iw: 3600, ih: 2025, z: 2.2, cx: 0.738, cy: 0.44 }} proofSrc="图 · fal 官方"
      tag={t >= guess ? { text: '我猜', at: guess, warn: true, out: pay } : undefined}
      aha={{ ...keyMood(t, [[ts, 'calm'], [n + 0.05, 'wow'], [real, 'think'], [guess, 'side'], [pay, 'calm']]), look: keyLook(t, [[ts, -0.4, -0.3], [n, -0.8, -0.1], [n + 1.4, -0.3, -0.75], [real, 0, 0], [pay, -0.7, 0.3]]),
        armL: 22 + 140 * pulse(t, n + 0.9, real - 0.1, 0.3) + 78 * pulse(t, pay, LE[13] + 0.2), armR: 22 + 128 * pulse(t, real, guess, 0.3) + 28 * pulse(t, guess, pay), rot: -6 * pulse(t, real, guess, 0.3) + 4 * pulse(t, guess, pay) }} />}
  </>;
}

// ══ 03 做判断：谷歌的示意图通栏，黑框挨个框 ═══════════════════════════════════════
function S3({ t }: { t: number }) {
  const g = at(18, '所以我猜') - 0.1;
  return <>
    <Head title={TITLE} num="03" total="05" role="做判断" who="谷歌 · Gemini Decision 1" />
    <Wide t={t} tint="teal" glow={SEC[2].glow} talk={talkAt(t)} crop={{ img: CARDIMG, iw: 2640, ih: 1082 }} src="图 · Google 官方 · 答案在图上是 0.95 的把握，稿子里说成“洒了”"
      frames={[{ at: at(15, 'Gemini') - 0.12, box: [0.44, 0.55, 0.60, 0.657] }, { at: at(16, '看张照片') - 0.12, box: [0.027, 0.185, 0.336, 0.521] }, { at: at(16, '问它') - 0.12, box: [0.043, 0.643, 0.323, 0.713] }, { at: at(16, '洒了') - 0.12, box: [0.694, 0.412, 0.957, 0.525] },
        { at: at(17, '怎么办') - 0.12, box: [0.043, 0.735, 0.323, 0.805] }, { at: at(17, '拿布擦') - 0.12, box: [0.694, 0.549, 0.957, 0.664] }, { at: at(18, '做软件') - 0.12, box: [0.372, 0.052, 0.632, 0.145] }]}
      tag={t >= g ? { text: '我猜', at: g, warn: true } : undefined}
      aha={keyMood(t, [[C[2], 'calm'], [at(16, '洒了') + 0.1, 'happy'], [at(17, '怎么办') - 0.1, 'calm'], [at(17, '拿布擦') + 0.1, 'happy'], [LS[18], 'calm'], [g, 'think']])} />
  </>;
}

// ══ 04 进工作群：Grok Bot 官方演示视频 ══════════════════════════════════════════
function S4({ t }: { t: number }) {
  const c = C[3], join = at(19, '是直接进') - 0.15, meet = at(20, '开会') - 0.2, learn = at(21, '它会') - 0.25, SRC = '画面 · Grok Bot 官方演示';
  return <>
    <Head title={TITLE} num="04" total="05" role="" who="马斯克的公司 · Grok Bot" />
    <Big t={t} i={3} panels={[
      { a: c + ST, b: join, src: SRC, mood: 'happy', body: clip(K, [[c + ST, 2.0], [join, 6.2]]) },
      { a: join, b: meet, src: SRC, pts: [join + 0.2], body: clip(K, [[join, 35.0], [meet, 38.3]]) },
      { a: meet, b: LS[21] - 0.12, src: SRC, pts: [meet + 0.15], body: clip(K, [[meet, 11.6], [LS[21] - 0.1, 14.2]]) },
      { a: LS[21] - 0.12, b: LS[22] - 0.12, tag: '官方说', src: SRC, mood: 'happy', pts: [LS[21] + 0.5], body: clip(K, [[LS[21] - 0.1, 38.5], [learn, 41.4], [learn + 0.001, 28.2], [LE[21] + 0.2, 31.6]]) },
      { a: LS[22] - 0.12, b: C[4], src: SRC, mood: 'side', pts: [at(22, '你们公司') - 0.1], body: clip(K, [[LS[22] - 0.1, 57.0], [C[4], 61.9]]) }]} />
  </>;
}

// ══ 05 出商品图：一步一步（官方演示里的三帧）→ 一个数当主角 ════════════════════════════
function S5({ t }: { t: number }) {
  const first = at(24, '一张水母') - 0.2, tee = at(24, '先印到') - 0.2, model = at(24, '模特') - 0.2, see = LS[25] - 0.05, n = at(26, '六十八') - 0.1, ts = n - 0.55, pc = at(26, '我看得') - 0.1, rep = LS[27] - 0.05, biz = at(27, '想拿去') - 0.1;
  const mm = (f: string) => ({ img: `hot3/shots/${f}.jpg`, iw: 1280, ih: 720 }), ex = inout(t, LE[27] + 0.02, LE[27] + 0.42), row = (y: number, l: string, v: string, big = false) => <><span style={abs(40, y + (big ? 14 : 4), mi(big ? 30 : 26, big ? INK : MID, 600))}>{l}</span><span style={abs(40, y, { width: 614, textAlign: 'right', ...mi(big ? 60 : 36, INK, big ? 900 : 600) })}>{v}</span></>;
  return <>
    <Head title={TITLE} num="05" total="05" role="出商品图" who="国内公司 MiniMax · H3 Image" />
    <div style={{ opacity: 1 - clamp(ex * 2.2), transform: `translateY(${-ex * 40}px)` }}>
    {t < ts + 0.3 && <div style={leave(t, ts)}>
      <Steps t={t} tint="green" glow={SEC[4].glow} talk={talkAt(t)} src="画面 · MiniMax 官方演示里的三帧" ahaHide={ts} tag={t >= see ? { text: '我看', at: see, out: LS[26] - 0.05 } : undefined}
        steps={LEAN ? [{ crop: mm('mm_a'), big: '图案', small: '', at: first }, { crop: mm('mm_b'), big: 'T 恤', small: '', at: tee }, { crop: mm('mm_c'), big: '模特', small: '', at: model }]
          : [{ crop: mm('mm_a'), big: '一张水母图', small: '官方演示里的图案', at: first }, { crop: mm('mm_b'), big: '印到 T 恤上', small: '还是那只水母', at: tee }, { crop: mm('mm_c'), big: '穿上身', small: '和第一张比一比', at: model }]}
        aha={t < first ? { mood: 'calm', look: [0.5, -0.2], armL: 22, armR: 22 + 60 * pulse(t, at(23, '第五样') - 0.1, LE[23]), dy: 0 } : t >= see ? { mood: 'happy', look: [-0.4, -0.5], armL: 22 + 100, armR: 22 } : {}} />
    </div>}
    {t >= ts && <BigNumber t={t} tint="green" glow={SEC[4].glow} talk={talkAt(t)} enter={ts} ahaFrom={{ x: 1564, y: 758, size: 184, at: ts }} name={LEAN ? 'MiniMax H3 Image' : '放上网让人下载的那个 AI'} num="68" unit="G" cap="光它自己的大小" src="数字 · MiniMax 官方模型说明（Hugging Face）" numAt={n} proofSrc="出处 · 官方模型说明和文件清单，2026-11-13 读"
      proofNode={<>
        <span style={abs(40, 44, mi(26, MID, 600))}>MiniMax 官方模型说明里写的大小</span>
        {row(112, '模型自己', '68.65 GB', true)}<div style={abs(40, 212, { width: 614, height: 3, background: '#D5D9E3' })} />
        {row(244, '要一起下的文字理解部分', '66.7 GB')}{row(318, '整个仓库（两种格式）', '204 GB')}
      </>}
      tag={t >= rep ? { text: '据报道', at: rep, warn: true } : t >= pc ? { text: '我看', at: pc } : undefined} note={{ text: '许可是 MiniMax 自己定的社区许可', at: rep + 0.3 }}
      aha={{ ...keyMood(t, [[ts, 'calm'], [n + 0.05, 'wow'], [pc, 'think'], [rep, 'side']]), look: keyLook(t, [[ts, -0.4, -0.3], [n, -0.8, -0.1], [n + 1.2, -0.3, -0.75], [pc, 0, 0], [biz, -0.7, 0.3]]),
        armL: 22 + 140 * pulse(t, n + 0.8, pc - 0.1, 0.3) + 78 * pulse(t, biz, LE[27] + 0.2), armR: 22 + 128 * pulse(t, pc, rep, 0.3) + 28 * pulse(t, rep, C[5]), rot: -6 * pulse(t, pc, rep, 0.3) + 4 * pulse(t, rep, C[5]) }} />}
    </div>
  </>;
}

// ══ 结尾 ═══════════════════════════════════════════════════════════════
function Outro({ t }: { t: number }) {
  const c = C[5] - 0.4, pick = at(28, 'fal') - 0.15, cq = at(28, '你呢') - 0.15, mine = at(28, '我最想试') - 0.1, q = io(t, cq, cq + 0.5);
  const hop = Math.sin(u(t, cq, cq + 0.55) * Math.PI), bIn = expo(t, c + 0.2, c + 0.9), sel = expo(t, pick, pick + 0.45), h1 = '我最想试的是';
  return <>
    {t >= C[5] + 0.08 && <TopLine />}
    {!LEAN && <div style={abs(150, 190, { ...BLACKPILL(28), ...rise(t, c + 0.15, { dy: 20 }) })}>五样说完了</div>}
    {!LEAN && <div style={abs(150, 262)}><Reveal t={t} t0={mine} text={h1} style={mi(96)} out={cq + 0.05} /></div>}
    {!LEAN && t > pick && t < cq + 0.25 && <div style={abs(150 + tw(h1, 96) + 26, 252, { height: 128, borderRadius: 64, background: INK, padding: '0 40px', display: 'flex', alignItems: 'center', ...mi(96, WHITE), transformOrigin: '0 50%', transform: `scale(${sel})`, opacity: 1 - io(t, cq - 0.1, cq + 0.12) })}>出广告那个</div>}
    <div style={abs(150, 236)}><Reveal t={t} t0={cq + 0.1} text="你呢？" style={mi(170)} stagger={0.07} /></div>
    {ITEMS.map((_, i) => { const t0 = c + 0.3 + i * 0.09, up = i === 1 ? sel : 0;
      return itemCard(t, i, 130 + i * 336, 468 - up * 26 + Math.sin(t * 1.6 + i) * 4, 316, 250, `${RING}0 ${24 + up * 22}px ${54 + up * 30}px rgba(30,40,80,${0.17 + up * 0.1}), 0 4px 10px rgba(30,40,80,.09)`, { ...rise(t, t0, { dy: 60, s0: 0.9 }) }); })}
    {t > pick && <div style={abs(130 + 336 - 12, 456 - sel * 26, { width: 340, height: 274, borderRadius: 40, boxSizing: 'border-box', border: `5px solid ${INK}`, opacity: u(t, pick, pick + 0.2) })} />}
    {/* 上一段的 Aha 走了它才出来，由虚变实，不然两只会同屏（2026-11-13 审片） */}
    {t > c + 0.2 && <div style={{ opacity: u(t, c + 0.2, c + 0.42) }}><Buddy t={t} x={1700} y={270 + (1 - bIn) * 420 - hop * 60} size={210} tint="violet" mood={t > cq ? 'happy' : t > pick ? 'wow' : 'calm'} talk={talkAt(t)} look={[t > cq ? 0 : -0.7, t > cq ? 0.1 : 0.6]} sy={1 + hop * 0.06} armL={22 + 78 * pulse(t, pick, cq) + q * 50} armR={22 + q * 50} foot={(1 - bIn) + hop} /></div>}
    {nameTag(1700, 396 + (1 - bIn) * 420, 24, { opacity: bIn })}
    <div style={abs(0, 880, { width: 1920, textAlign: 'center', ...mono(20, MID), opacity: u(t, LE[28] + 0.3, LE[28] + 0.8) })}>出处：Arena、fal、Google、Grok Bot、MiniMax 的官方帖、官方演示和官方模型说明 · “各干各的”是我的看法</div>
  </>;
}

function Subs({ t }: { t: number }) {
  const s = SUBS.find((x) => t >= x.s && t < x.e);
  if (!s) return null;
  return <div style={abs(0, 962, { width: 1920, textAlign: 'center', ...mi(44, INK, 600), opacity: u(t, s.s, s.s + 0.1), transform: `translateY(${(1 - expo(t, s.s, s.s + 0.3)) * 10}px)`, textShadow: '0 0 16px rgba(255,255,255,.95), 0 0 4px rgba(255,255,255,.9)' })}>{s.text}</div>;
}
const SFX: [number, string, number][] = [
  ...C.slice(0, 5).map((c): [number, string, number] => [c - 0.38, 'whoosh-short', 0.2]), ...C.slice(0, 5).map((c): [number, string, number] => [c + 0.86, 'pop', 0.09]), [C[5] - 0.4, 'slide', 0.14],
  [at(11, '六十秒') - 0.65, 'pop', 0.08], [at(26, '六十八') - 0.65, 'pop', 0.08],
];
const PARTS = [S1, S2, S3, S4, S5];

export function Film5() {
  const { fps, width } = useVideoConfig(), t = useCurrentFrame() / fps;
  return <AbsoluteFill style={{ background: PAGE }}>
    <Fonts />
    <div style={{ position: 'absolute', width: 1920, height: 1080, transform: `scale(${width / 1920})`, transformOrigin: '0 0', overflow: 'hidden' }}>
      {t < C[0] && <Intro t={t} />}
      {PARTS.map((P, i) => (t >= C[i] && t < C[i + 1] + (i === 4 ? 0.08 : 0) ? <P key={i} t={t} /> : null))}
      {t >= C[5] - 0.4 && <Outro t={t} />}
      {SEC.map((_, i) => <Flood key={i} t={t} i={i} />)}
      <Subs t={t} />
    </div>
    <Audio src={staticFile('hot3/voice.wav')} />
    <Audio src={staticFile('hot3/music.wav')} volume={(f) => musicGain(f / 30)} />
    {SFX.map(([s, n, v], i) => <Sequence key={i} from={Math.max(0, Math.round(s * fps))} durationInFrames={Math.round(fps * 2)}><Audio src={staticFile(`sfx/${n}.wav`)} volume={v} /></Sequence>)}
  </AbsoluteFill>;
}
export const FILM5_FRAMES = Math.round(END * 30);
