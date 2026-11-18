// 《同一天，五样新东西》的"一个舞台"版（2026-11-14）。用户看了静帧、听了我的三处改法后说："可以，做新的内容"。以后的片子从这一份起步。
// 来历：用户连发两段别人总结的做法（FredTalk 的复盘："廉价感基本是加出来的"），没有附话。四条：
//   一段话只用一个画面；一组内容只用一个"舞台"；只放真东西；别让画面复读台词（一句话最多点亮一个关键词）。
// 这一版和 Film5 的区别：
//   1. 全片一个舞台：左边一张大卡、右边一栏、Aha 从头到尾站在同一个地方。五段只换卡里的内容（两张榜单 / 官方图 / 示意图 / 官方视频 / 三帧）。
//   2. 一段之内不再换版式：要亮一个数的时候，只是卡里换内容。
//   3. 删掉把台词再念一遍的字：开头结尾的整句大标题、步骤卡的整句标题、数字旁边的说明。每处只留一个关键词。
//   4. 第 4 段从六截官方视频减到四截，一句话一截。
// 稿子、配音、时间和 Film5 完全一样（同一个 data.json）。
import React from 'react';
import { AbsoluteFill, Audio, Freeze, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import D from './data.json';
import { CARD, RING, Fonts, PAGE, INK, MID, Reveal, WARN, WHITE, abs, clamp, expo, inout, io, logo, mi, mix, mono, rise, tex, u } from '../hot/fx';
import { Buddy, Mood } from '../hot/Buddy';
import { BLACKPILL, Head, keyMood, makeTalk } from '../hot/layouts';

const LS = D.LS as number[], LE = D.LE as number[], C = D.cuts as number[], END = D.END as number, VO = D.VO as unknown as [string, number, number][][];
const SUBS = D.subs as { s: number; e: number; text: string }[];
const at = (li: number, phrase: string) => { const s = VO[li].map((c) => c[0]).join(''), i = s.indexOf(phrase); if (i < 0) throw new Error(`第 ${li} 句里找不到：${phrase}`); return VO[li][i][1]; };
const talkAt = makeTalk(VO);
const TITLE = '同一天，五样新东西', NAME = 'Aha', HL = '#FFD21F';
// 舞台：大卡的位置和大小、Aha 站的地方，全片不变
const DEMO = { x: 96, y: 150, w: 1356, h: 763, r: 34 }, BS = 1356 / 880, BX = 1672, BY = 628, ST = 0.4, AS = 290;   // AS = Aha 的大小（原来 250，用户同意放大）
const smooth = (t: number, a: number, b: number) => { const v = u(t, a, b); return v * v * v * (v * (6 * v - 15) + 10); };
const LIFTS = D.lifts as number[][];
const musicGain = (t: number) => { let k = 0; LIFTS.forEach(([a, b]) => { k = Math.max(k, io(t, a, a + 0.25) * (1 - io(t, b - 0.25, b))); }); return (D.musicVol as number) * (1 + k); };
const LogoPill = ({ w, h = 92, children }: { w: number; h?: number; children: React.ReactNode }) => <div style={{ width: w, height: h, borderRadius: h / 2, ...CARD, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{children}</div>;
const pill = (s: string, w: number) => <LogoPill w={w} h={104}><span style={mi(46, INK, 600)}>{s}</span></LogoPill>;
const nameTag = (x: number, y: number, size = 24, extra: React.CSSProperties = {}) => <div style={abs(x - 100, y, { width: 200, display: 'flex', justifyContent: 'center', ...extra })}><span style={BLACKPILL(size)}>{NAME}</span></div>;

const SEC: { num: string; role: string; who: string; tx: string; glow: string; from: [number, number]; flood: React.ReactNode }[] = [
  { num: '01', role: '比价钱', who: 'Arena 榜单', tx: 'gold', glow: 'rgba(240,150,40,.26)', from: [224, 541], flood: pill('Arena 榜单', 380) },
  { num: '02', role: '出广告', who: 'fal', tx: 'coral', glow: 'rgba(240,80,60,.24)', from: [BX, BY], flood: pill('fal', 200) },
  { num: '03', role: '做判断', who: '谷歌 · Gemini Decision 1', tx: 'teal', glow: 'rgba(10,90,150,.24)', from: [BX, BY], flood: <LogoPill w={300} h={124}><img src={logo('google.png')} style={{ width: 260 }} /></LogoPill> },
  { num: '04', role: '进工作群', who: '马斯克的公司 · Grok Bot', tx: 'violet', glow: 'rgba(90,60,220,.24)', from: [BX, BY], flood: pill('Grok Bot', 330) },
  { num: '05', role: '出商品图', who: '国内公司 MiniMax · H3 Image', tx: 'green', glow: 'rgba(30,160,100,.26)', from: [BX, BY], flood: pill('MiniMax', 300) },
];

// ── 换段（全片唯一一种转场）：颜色从 Aha 身上铺满全屏，亮一下第几个和干什么，再收回 Aha 身上 ──
function Flood({ t, i }: { t: number; i: number }) {
  const S = SEC[i], c = C[i], cover = inout(t, c - 0.42, c), shrink = expo(t, c + 0.5, c + 1.1);
  const fo = u(t, c - 0.3, c - 0.08) * (1 - u(t, c + 0.38, c + 0.6)), floodO = 1 - u(t, c + 0.98, c + 1.16);
  if (t < c - 0.42 || floodO <= 0) return null;
  const clipP = t < c + 0.5 ? `circle(${cover * 2400}px at ${S.from[0]}px ${S.from[1]}px)` : `circle(${mix(2400, AS * 0.37, shrink)}px at ${BX}px ${BY - 8}px)`;
  return <>
    <div style={abs(0, 0, { width: 1920, height: 1080, ...tex(S.tx, t), clipPath: clipP, opacity: floodO })} />
    {fo > 0 && <div style={abs(0, 0, { width: 1920, height: 1080, opacity: fo, clipPath: clipP })}>
      <div style={abs(0, 150, { width: 1920, textAlign: 'center', ...mi(330, WHITE), transform: `translateY(${(1 - expo(t, c - 0.3, c + 0.2)) * 70}px)`, textShadow: '0 20px 60px rgba(0,0,40,.25)' })}>{S.num}</div>
      <div style={abs(0, 520, { width: 1920, textAlign: 'center', ...mi(130, WHITE), transform: `translateY(${(1 - expo(t, c - 0.2, c + 0.3)) * 50}px)`, textShadow: '0 12px 40px rgba(0,0,40,.25)' })}>{S.role}</div>
      <div style={abs(0, 720, { width: 1920, display: 'flex', justifyContent: 'center', transform: `scale(${mix(0.7, 1, expo(t, c - 0.1, c + 0.4))})` })}>{S.flood}</div>
    </div>}
  </>;
}

// ── 卡里放的真东西。卡里的坐标是 880×495，整体放大到 1356×763 ──
type KF = [number, number][];
const srcAt = (kf: KF, t: number) => { if (t <= kf[0][0]) return kf[0][1]; for (let i = 1; i < kf.length; i++) if (t < kf[i][0]) { const a = kf[i - 1], b = kf[i]; return mix(a[1], b[1], (t - a[0]) / Math.max(1e-6, b[0] - a[0])); } return kf[kf.length - 1][1]; };
const clip = (file: string, kf: KF) => (t: number) => <Freeze frame={Math.max(0, Math.round(srcAt(kf, t) * 30))}><OffthreadVideo muted src={staticFile(file)} style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', objectFit: 'cover' }} /></Freeze>;
// 官方图：kf = [成片第几秒, 放大倍数, 对准图上的 x, y]；frames = 黑框依次框图上的哪一块（跟着图一起动）
type PK = [number, number, number, number][];
type Fr = { at: number; box: [number, number, number, number] };
const pic = (img: string, iw: number, ih: number, kf: PK, frames: Fr[] = []) => (t: number) => {
  let n = 0; kf.forEach((k, i) => { if (t >= k[0]) n = i; });
  const a = kf[n], b = kf[Math.min(kf.length - 1, n + 1)], k = n === kf.length - 1 ? 1 : smooth(t, a[0], b[0]), z = mix(a[1], b[1], k), cx = mix(a[2], b[2], k), cy = mix(a[3], b[3], k), w = 880 * z, h = w * ih / iw, L = 440 - cx * w, T = 247.5 - cy * h;
  let m = -1; frames.forEach((f, i) => { if (t >= f.at) m = i; });
  let g: number[] | null = null;
  if (m >= 0) { const q = frames[m].box, p = m ? frames[m - 1].box : q, e = expo(t, frames[m].at, frames[m].at + 0.45); g = q.map((v, i) => mix(p[i], v, e)); }
  return <><div style={abs(0, 0, { width: 880, height: 495, background: WHITE })} /><Img src={staticFile(img)} style={abs(L, T, { width: w, height: h })} />
    {g && <div style={abs(L + g[0] * w - 6, T + g[1] * h - 6, { width: (g[2] - g[0]) * w + 12, height: (g[3] - g[1]) * h + 12, borderRadius: 14, boxSizing: 'border-box', border: `3.4px solid ${INK}`, boxShadow: '0 6px 16px rgba(14,14,16,.16)', opacity: u(t, frames[0].at, frames[0].at + 0.18) })} />}</>;
};
// 卡里的一小幅官方图（取图上的一处）
type Cr = { img: string; iw: number; ih: number; z?: number; cx?: number; cy?: number };
const cropIn = (c: Cr, x: number, y: number, w: number, h: number, extra: React.ReactNode = null, style: React.CSSProperties = {}) => { const W0 = w * (c.z ?? 1), H0 = W0 * c.ih / c.iw;
  return <div style={abs(x, y, { width: w, height: h, borderRadius: 14, overflow: 'hidden', background: WHITE, boxShadow: '0 0 0 1px rgba(20,30,60,.14), 0 10px 24px rgba(30,40,80,.12)', ...style })}><Img src={staticFile(c.img)} style={abs(w / 2 - (c.cx ?? 0.5) * W0, h / 2 - (c.cy ?? 0.5) * H0, { width: W0, height: H0 })} />{extra}</div>; };

// ── 舞台：大卡 + 右栏 + Aha。全片五段都用它，只换 panels（卡里的内容）──
type Panel = { a: number; b: number; src?: string; body: (t: number) => React.ReactNode };
type TagK = { text: string; at: number; out: number; warn?: boolean };
// fadeK：卡和右栏的字往上淡出（结尾前用）；ahaOff：到点不画 Aha（交给结尾那只，位置大小一样，接得上）
function Stage({ t, i, panels, tags = [], moods, pts = [], fadeK = 0, ahaOff }: { t: number; i: number; panels: Panel[]; tags?: TagK[]; moods: [number, Mood][]; pts?: number[]; fadeK?: number; ahaOff?: number }) {
  const S = SEC[i], c = C[i];
  let pn = -1; panels.forEach((p, k) => { if (t >= p.a) pn = k; });
  const P = pn >= 0 ? panels[pn] : null, M = keyMood(t, moods), mood = M.mood, mk = M.mk;
  let pt = 0; pts.forEach((c0) => { pt = Math.max(pt, io(t, c0 - 0.15, c0 + 0.15) * (1 - io(t, c0 + 1.1, c0 + 1.5))); });
  const pop = expo(t, c + 0.92, c + 1.45), bmood = (m: Mood) => (m === 'wow' ? 120 : m === 'happy' ? 50 : m === 'side' ? 28 : 0), tag = tags.find((g) => t >= g.at && t < g.out);
  return <>
    <div style={{ opacity: 1 - clamp(fadeK * 2.2), transform: `translateY(${-fadeK * 40}px)` }}>
    <div style={abs(DEMO.x, DEMO.y, { width: DEMO.w, height: DEMO.h, borderRadius: DEMO.r, overflow: 'hidden', background: WHITE, boxShadow: `${RING}0 34px 80px ${S.glow}, 0 4px 12px rgba(30,40,80,.10)`, ...rise(t, c + 0.36, { dy: 70, s0: 0.95 }) })}>
      {panels.map((p, k) => { const a0 = k ? p.a - 0.2 : p.a; if (t < a0 - 0.05 || t >= p.b + 0.5) return null;
        return <div key={k} style={{ position: 'absolute', left: 0, top: 0, width: DEMO.w, height: DEMO.h, background: WHITE, ...(k ? rise(t, a0, { dy: 70, s0: 1, d: 0.55 }) : {}) }}>
          <div style={{ position: 'absolute', left: 0, top: 0, width: 880, height: 495, transform: `scale(${BS})`, transformOrigin: '0 0' }}>{p.body(t)}</div>
        </div>; })}
    </div>
    <div style={abs(1488, 196)}><Reveal t={t} t0={c + 0.8} text={S.role} style={mi(S.role.length > 3 ? 66 : 80)} /></div>
    {P && P.src && <div style={abs(1472, BY + 236, { width: 400, textAlign: 'center', ...mono(19, MID), ...rise(t, P.a + 0.3, { dy: 10, s0: 1 }) })}>{P.src}</div>}
    {tag && <div style={abs(BX - 150, BY - 236, { width: 300, display: 'flex', justifyContent: 'center', ...rise(t, tag.at, { out: tag.out, dy: 14, s0: 0.8 }) })}><span style={BLACKPILL(26, tag.warn ? WARN : INK)}>{tag.text}</span></div>}
    </div>
    {nameTag(BX, BY + 176, 24, { opacity: pop })}
    {t > c + 0.92 && (ahaOff === undefined || t < ahaOff) && <Buddy t={t} x={BX - pt * 16} y={BY - (mood === 'wow' ? Math.sin(mk * Math.PI) * 26 : 0)} size={mix(210, AS, pop)} tint={S.tx} mood={mood} prev={M.prev} mk={mk} talk={talkAt(t)} look={[-0.7 - pt * 0.25, -0.05]} sy={1 + Math.sin(u(t, c + 0.92, c + 1.42) * Math.PI) * 0.08}
      armR={22 + (bmood(mood) + (mood === 'think' ? 128 : 0)) * mk} armL={22 + pt * 112 + bmood(mood) * mk * (1 - pt)} rot={(mood === 'think' ? -6 * mk : mood === 'side' ? 4 * mk : 0) - pt * 7} seed={S.num.charCodeAt(1)} />}
  </>;
}
// 卡里的一个大数（只有数和单位，不带说明：嘴上和字幕已经说了）
const bigNum = (t: number, num: string, unit: string, numAt: number, x = 44, y = 130) => <div style={abs(x, y, { display: 'flex', alignItems: 'flex-end', gap: 14, ...rise(t, numAt, { dy: 34, s0: 0.9, d: 0.7 }) })}><span style={mi(220, INK)}>{num}</span><span style={{ ...mi(62, INK, 600), marginBottom: 26 }}>{unit}</span></div>;

const FABLE = 'hot2/shots/fable_board.jpg', EMBER = 'hot2/shots/ember_board.jpg', AD = 'hot2/shots/ad_frames.jpg', COUCH = 'hot2/shots/couch.jpg', CARDIMG = 'hot2/shots/decision_card.jpg', K = 'hot2/footage/k.mp4';

// ══ 开头：五张小卡 + 一个关键词 + Aha（已经站在它全片都站的地方）══════════════════════════
const ITEMS: [string, string, string, string][] = [['01', '比价钱', 'Arena 榜单', 'gold'], ['02', '出广告', 'fal', 'coral'], ['03', '做判断', 'Gemini Decision 1', 'teal'], ['04', '进工作群', 'Grok Bot', 'violet'], ['05', '出商品图', 'MiniMax H3 Image', 'green']];
const IW = 256, IH = 202, IX = (i: number) => 96 + i * 275, IY = 440;
const itemCard = (t: number, i: number, x: number, y: number, shadow: string, extra: React.CSSProperties = {}) => { const [no, name, sub, tint] = ITEMS[i], s = IW / 316;
  return <div key={i} style={abs(x, y, { width: IW, height: IH, borderRadius: 30 * s, overflow: 'hidden', background: WHITE, boxShadow: shadow, ...extra })}>
    <div style={abs(0, 0, { width: IW, height: 84 * s, ...tex(tint, t + i) })} /><span style={abs(24 * s, 28 * s, mono(26 * s, WHITE))}>{no}</span>
    <span style={abs(24 * s, 112 * s, mi((name.length > 3 ? 46 : 54) * s, INK))}>{name}</span><span style={abs(26 * s, 186 * s, mi(23 * s, MID, 500))}>{sub}</span>
  </div>; };
const cap = (text: string, extra: React.CSSProperties) => <div style={abs(96, 236, { height: 128, borderRadius: 64, background: INK, padding: '0 40px', display: 'flex', alignItems: 'center', ...mi(96, WHITE), ...extra })}>{text}</div>;
const TopLine = () => <div style={abs(76, 60, { display: 'flex', alignItems: 'center', gap: 16, zIndex: 5 })}><div style={{ width: 16, height: 16, borderRadius: 8, background: INK }} /><span style={mi(30, INK, 600)}>{TITLE}</span><span style={mi(27, MID, 500)}>· 2026 年 11 月 11 日（美国时间）</span></div>;
function Intro({ t }: { t: number }) {
  const tA = at(1, '就觉得') - 0.15, c0 = at(0, '五样') - 0.1, c1 = at(1, '各干各的') - 0.1, lift = expo(t, C[0] - 0.9, C[0] - 0.4), own = io(t, c1, c1 + 0.4);
  const mood: Mood = t < c0 ? 'calm' : t < tA ? 'wow' : t < c1 ? 'think' : 'happy', hop = Math.sin(u(t, c1, c1 + 0.5) * Math.PI), wave = u(t, 0.1, 0.35) * (1 - u(t, 1.9, 2.3)), hap = io(t, c1, c1 + 0.3);
  return <>
    <TopLine />
    {/* 第 0 帧的标题是片名（同一天 + 五样新东西），不是把台词整句写上去 */}
    <div style={abs(104, 250, { ...mi(104, INK), ...rise(t, -1, { out: tA, dy: 20 }) })}>同一天</div>
    {t < tA + 0.2 && cap('五样新东西', { left: 104 + 3 * 104 + 30, transformOrigin: '50% 50%', transform: `scale(${1 + 0.1 * Math.sin(u(t, c0, c0 + 0.45) * Math.PI)})`, opacity: 1 - io(t, tA - 0.12, tA + 0.1) })}
    <div style={abs(96, 172, { ...BLACKPILL(28), ...rise(t, tA + 0.1, { dy: 20 }) })}>我的看法</div>
    {t > c1 && cap('各干各的', { transformOrigin: '0 50%', transform: `scale(${expo(t, c1, c1 + 0.5)})` })}
    {ITEMS.map((_, i) => { const up = i === 0 ? lift : 0, bob = Math.sin(u(t, 0.15 + i * 0.14, 0.7 + i * 0.14) * Math.PI) * 16 + Math.sin(u(t, c0 + i * 0.12, c0 + 0.5 + i * 0.12) * Math.PI) * 16;
      const dy = own * Math.sin((t - c1) * (2.6 + i * 0.55) + i * 1.9) * 14, rot = own * Math.sin((t - c1) * (1.9 + i * 0.4) + i) * 2.2;
      return itemCard(t, i, IX(i), IY - up * 14 - bob + dy, `${RING}0 ${24 + up * 22}px ${54 + up * 30}px rgba(30,40,80,${0.17 + up * 0.1}), 0 4px 10px rgba(30,40,80,.09)`, { transform: `rotate(${rot}deg)` }); })}
    <Buddy t={t} x={BX} y={BY - hop * 60} size={AS} tint="violet" mood={mood} talk={talkAt(t)} look={[-0.7, t > c1 ? 0.2 : -0.05]} sy={1 + hop * 0.06} armR={22 + wave * (108 + Math.sin(t * 13) * 24) + hap * 55} armL={22 + hap * 55} foot={hop} />
    {nameTag(BX, BY + 176, 24)}
  </>;
}

// ══ 01 比价钱：卡里并排两张 Arena 榜单，各亮一个数 ═══════════════════════════════════
function S1({ t }: { t: number }) {
  const c = C[0], nm = at(4, 'Claude') - 0.1, rank = at(4, '排第一') - 0.05, n1 = at(4, '七美元多') - 0.1, r0 = LS[5] - 0.25, m2 = at(5, 'Meta') - 0.05, n2 = at(5, '两美分') - 0.1, rk2 = at(5, '排名也') - 0.05, only = LS[6] - 0.05, see = LS[7] - 0.05, cheap = at(7, '便宜的') - 0.1;
  const W2 = 410 * 2.454, H2 = W2 * 1303 / 1249, L2 = 205 - 0.7962 * W2, T2 = 112.5 - 0.6366 * H2;
  const col = (x: number, name: string, nameAt: number, tag: string, tagAt: number, bg: string, num: string, numAt: number) => <>
    <div style={abs(x, 286, { width: 410, display: 'flex', alignItems: 'center', gap: 10 })}>
      <span style={{ ...mi(20, INK, 600), ...rise(t, nameAt, { dy: 10, s0: 1 }) }}>{name}</span>
      <span style={{ ...BLACKPILL(14, bg), opacity: u(t, tagAt, tagAt + 0.12), transform: `scale(${mix(0.6, 1, expo(t, tagAt, tagAt + 0.4))})` }}>{tag}</span>
    </div>
    <div style={abs(x - 4, 322, { display: 'flex', alignItems: 'flex-end', gap: 12, ...rise(t, numAt, { dy: 30, s0: 0.9, d: 0.7 }) })}><span style={mi(108, INK)}>{num}</span><span style={{ ...mi(30, INK, 600), marginBottom: 12 }}>美元</span><span style={{ ...mi(18, MID, 500), marginBottom: 16 }}>干一件</span></div>
  </>;
  const body = (tt: number) => { const mk = expo(tt, n2 + 0.35, n2 + 0.95), ck = expo(tt, r0, r0 + 0.7);
    return <>
      {cropIn({ img: FABLE, iw: 2400, ih: 2400, z: 1.06, cx: 0.4954, cy: 0.2682 }, 20, 40, 410, 225)}
      {cropIn({ img: EMBER, iw: 1249, ih: 1303, z: 2.454, cx: 0.7962, cy: 0.6366 }, 450, 40, 410, 225, <>
        <div style={abs(L2 + 0.842 * W2, T2 + 0.661 * H2, { width: (0.88 - 0.842) * W2 * mk, height: 5, borderRadius: 3, background: HL })} />
        {ck < 1 && <div style={abs(0, 0, { width: 410, height: 225, ...tex('gold', tt), clipPath: `circle(${mix(470, 0, ck)}px at 205px 225px)` })} />}
      </>)}
      {col(22, 'Claude Fable 5.2', nm, '总榜第 1', rank, INK, '7.3', n1)}
      {col(452, 'Meta · Muse Ember', m2, '总榜第 25', rk2, MID, '0.02', n2)}
    </>; };
  return <>
    <Head title={TITLE} num="01" total="05" role="" who="Arena 榜单" />
    <Stage t={t} i={0} panels={[{ a: c + ST, b: C[1], src: '图 · Arena 官方（它自己公布的）', body }]} pts={[nm + 0.1, n1 + 0.1, m2 + 0.1, n2 + 0.1]}
      tags={[{ text: '只有 Arena 自己公布', at: only, out: see }, { text: '我看', at: see, out: C[1] }]}
      moods={[[c, 'calm'], [n1 + 0.05, 'wow'], [r0, 'calm'], [n2 + 0.05, 'wow'], [only, 'side'], [see, 'think'], [cheap, 'happy']]} />
  </>;
}

// ══ 02 出广告：官方演示图（推近三次）→ 卡里换成"60 秒"和那支广告里的一幅 ════════════════════
function S2({ t }: { t: number }) {
  const c = C[1], n = at(11, '六十秒') - 0.1, ts = n - 0.12, typed = at(10, '打了') - 0.3, nine = at(10, '九张就') - 0.3, real = at(12, '真的假的') - 0.1, guess = at(12, '我猜') - 0.1, pay = LS[13] - 0.05;
  return <>
    <Head title={TITLE} num="02" total="05" role="" who="fal" />
    <Stage t={t} i={1} pts={[typed + 0.2, nine + 0.2, n + 0.2]} tags={[{ text: '我猜', at: guess, out: pay, warn: true }]}
      moods={[[c, 'calm'], [n + 0.05, 'wow'], [real, 'think'], [guess, 'side'], [pay, 'calm']]}
      panels={[
        { a: c + ST, b: ts, src: '图 · fal 官方演示', body: pic(AD, 3600, 2006, [[c + ST, 1, 0.5, 0.5], [LS[8] + 0.4, 1, 0.5, 0.5], [LS[8] + 1.5, 2.2, 0.3773, 0.2954], [typed, 2.28, 0.3693, 0.2874], [typed + 0.9, 1.42, 0.5, 0.64], [nine, 1.42, 0.5, 0.64], [nine + 0.9, 1.7, 0.565, 0.47], [ts + 0.5, 1.7, 0.565, 0.47]]) },
        { a: ts, b: C[2], src: '图 · fal 官方（那支广告里的一幅）', body: (tt) => <>{bigNum(tt, '60', '秒', n - 0.3)}{cropIn({ img: COUCH, iw: 3600, ih: 2025, z: 2.2, cx: 0.738, cy: 0.44 }, 462, 128, 378, 229, null, rise(tt, n + 0.1, { dy: 16, s0: 1 }))}</> }]} />
  </>;
}

// ══ 03 做判断：谷歌那张示意图，黑框跟着讲解走，图推近三次 ═══════════════════════════════
function S3({ t }: { t: number }) {
  const c = C[2], g = at(18, '所以我猜') - 0.1, photo = at(16, '看张照片') - 0.12, yes = at(16, '洒了') - 0.12, soft = at(18, '做软件') - 0.12;
  return <>
    <Head title={TITLE} num="03" total="05" role="" who="谷歌 · Gemini Decision 1" />
    <Stage t={t} i={2} pts={[at(15, 'Gemini'), yes + 0.2, at(17, '拿布擦')]} tags={[{ text: '我猜', at: g, out: C[3], warn: true }]}
      moods={[[c, 'calm'], [yes + 0.2, 'happy'], [at(17, '怎么办') - 0.1, 'calm'], [at(17, '拿布擦') + 0.1, 'happy'], [LS[18], 'calm'], [g, 'think']]}
      panels={[{ a: c + ST, b: C[3], src: '图 · Google 官方', body: pic(CARDIMG, 2640, 1082,
        [[c + ST, 1, 0.5, 0.5], [photo - 0.5, 1, 0.5, 0.5], [photo + 0.4, 1.75, 0.3, 0.56], [yes - 0.4, 1.75, 0.3, 0.56], [yes + 0.5, 1.75, 0.7, 0.56], [soft - 0.5, 1.75, 0.7, 0.56], [soft + 0.5, 1, 0.5, 0.5]],
        [{ at: at(15, 'Gemini') - 0.12, box: [0.44, 0.55, 0.60, 0.657] }, { at: photo, box: [0.027, 0.185, 0.336, 0.521] }, { at: at(16, '问它') - 0.12, box: [0.043, 0.643, 0.323, 0.713] }, { at: yes, box: [0.694, 0.412, 0.957, 0.525] },
          { at: at(17, '拿布擦') - 0.12, box: [0.694, 0.549, 0.957, 0.664] }, { at: soft, box: [0.372, 0.052, 0.632, 0.145] }]) }]} />
  </>;
}

// ══ 04 进工作群：Grok Bot 官方演示，一句话一截（四截）════════════════════════════════
function S4({ t }: { t: number }) {
  const c = C[3], join = at(19, '是直接进') - 0.15, meet = at(20, '开会') - 0.2, SRC = '画面 · Grok Bot 官方演示';
  return <>
    <Head title={TITLE} num="04" total="05" role="" who="马斯克的公司 · Grok Bot" />
    <Stage t={t} i={3} pts={[join + 0.2, meet + 0.15, at(22, '你们公司') - 0.1]} tags={[{ text: '官方说', at: LS[21] - 0.05, out: LS[22] - 0.1 }]}
      moods={[[c, 'happy'], [join, 'calm'], [LS[21] - 0.1, 'happy'], [LS[22] - 0.1, 'side']]}
      panels={[
        { a: c + ST, b: join, src: SRC, body: clip(K, [[c + ST, 2.0], [join, 6.2]]) },
        { a: join, b: meet, src: SRC, body: clip(K, [[join, 35.0], [meet, 38.3]]) },
        { a: meet, b: LS[22] - 0.12, src: SRC, body: clip(K, [[meet, 11.6], [LS[22] - 0.1, 17.4]]) },
        { a: LS[22] - 0.12, b: C[4], src: SRC, body: clip(K, [[LS[22] - 0.1, 57.0], [C[4], 61.9]]) }]} />
  </>;
}

// ══ 05 出商品图：卡里并排三帧官方演示（说到哪张亮哪张）→ 卡里换成"68 G"和出处 ═════════════════
function S5({ t }: { t: number }) {
  const c = C[4], first = at(24, '一张水母') - 0.2, tee = at(24, '先印到') - 0.2, model = at(24, '模特') - 0.2, see = LS[25] - 0.05, n = at(26, '六十八') - 0.1, ts = n - 0.12, pc = at(26, '我看得') - 0.1, rep = LS[27] - 0.05;
  const ex = inout(t, LE[27] + 0.02, LE[27] + 0.42), steps: [string, string, number][] = [['mm_a', '图案', first], ['mm_b', 'T 恤', tee], ['mm_c', '模特', model]];
  const row = (y: number, l: string, v: string, big = false) => <><span style={abs(470, y + (big ? 12 : 4), mi(big ? 19 : 16, big ? INK : MID, 600))}>{l}</span><span style={abs(470, y, { width: 370, textAlign: 'right', ...mi(big ? 40 : 23, INK, big ? 900 : 600) })}>{v}</span></>;
  const frames = (tt: number) => <>
    {steps.map(([f, label, a0], i) => { const on = io(tt, a0, a0 + 0.3), x = 22 + i * 286;
      return <React.Fragment key={i}>
        {cropIn({ img: `hot3/shots/${f}.jpg`, iw: 1280, ih: 720 }, x, 150 - on * 8, 264, 148.5, null, { boxShadow: `0 0 0 ${1 + on * 2}px rgba(14,14,16,${0.14 + on * 0.86}), 0 ${10 + on * 8}px ${24 + on * 10}px rgba(30,40,80,.14)` })}
        <span style={abs(x + 2, 322, { ...mi(40, INK), opacity: 0.22 + 0.78 * on })}>{label}</span>
        {i < 2 && <span style={abs(x + 264, 204, { width: 22, textAlign: 'center', ...mi(22, MID, 600) })}>→</span>}
      </React.Fragment>; })}
  </>;
  return <>
    <Head title={TITLE} num="05" total="05" role="" who="国内公司 MiniMax · H3 Image" />
    <Stage t={t} i={4} fadeK={ex} ahaOff={C[5] - 0.4} pts={[first + 0.1, tee + 0.1, model + 0.1, n + 0.2]}
        tags={[{ text: '我看', at: see, out: LS[26] - 0.05 }, { text: '我看', at: pc, out: rep }, { text: '据报道', at: rep, out: C[5] + 1, warn: true }]}
        moods={[[c, 'calm'], [model + 0.6, 'happy'], [LS[26], 'calm'], [n + 0.05, 'wow'], [pc, 'think'], [rep, 'side']]}
        panels={[
          { a: c + ST, b: ts, src: '画面 · MiniMax 官方演示里的三帧', body: frames },
          { a: ts, b: C[5] + 1, src: '出处 · MiniMax 官方模型说明', body: (tt) => <>
            {bigNum(tt, '68', 'G', n - 0.3)}
            <div style={rise(tt, n + 0.1, { dy: 16, s0: 1 })}>
              <div style={abs(470, 150, { width: 370, height: 3, background: INK, opacity: 0.9 })} />
              {row(166, '模型自己', '68.65 GB', true)}<div style={abs(470, 226, { width: 370, height: 2, background: '#D5D9E3' })} />
              {row(242, '要一起下的文字理解部分', '66.7 GB')}{row(284, '整个仓库（两种格式）', '204 GB')}
            </div>
            <div style={abs(48, 372, { ...mi(22, INK, 600), ...rise(tt, rep + 0.3, { dy: 10, s0: 1 }) })}>许可是 MiniMax 自己定的社区许可</div>
          </> }]} />
  </>;
}

// ══ 结尾：五张小卡回来，框住我最想试的那张，只留一句"你呢？"═══════════════════════════════
function Outro({ t }: { t: number }) {
  const c = C[5] - 0.4, pick = at(28, 'fal') - 0.15, cq = at(28, '你呢') - 0.15, q = io(t, cq, cq + 0.5), hop = Math.sin(u(t, cq, cq + 0.55) * Math.PI), sel = expo(t, pick, pick + 0.45);
  return <>
    {t >= C[5] + 0.08 && <TopLine />}
    <div style={abs(96, 200)}><Reveal t={t} t0={cq + 0.1} text="你呢？" style={mi(170)} stagger={0.07} /></div>
    {ITEMS.map((_, i) => { const up = i === 1 ? sel : 0;
      return itemCard(t, i, IX(i), IY - up * 22 + Math.sin(t * 1.6 + i) * 4, `${RING}0 ${24 + up * 22}px ${54 + up * 30}px rgba(30,40,80,${0.17 + up * 0.1}), 0 4px 10px rgba(30,40,80,.09)`, { ...rise(t, c + 0.3 + i * 0.09, { dy: 60, s0: 0.9 }) }); })}
    {t > pick && <div style={abs(IX(1) - 12, IY - 12 - sel * 22, { width: IW + 24, height: IH + 24, borderRadius: 36, boxSizing: 'border-box', border: `5px solid ${INK}`, opacity: u(t, pick, pick + 0.2) })} />}
    {<div><Buddy t={t} x={BX} y={BY - hop * 60} size={AS} tint="green" tint2="violet" tk={io(t, c + 0.2, c + 1.0)} seed={53} mood={t > cq ? 'happy' : t > pick ? 'wow' : 'calm'} talk={talkAt(t)} look={[t > cq ? 0 : -0.7, t > cq ? 0.1 : 0.1]} sy={1 + hop * 0.06} armL={22 + 78 * (io(t, pick, pick + 0.2) * (1 - io(t, cq - 0.2, cq))) + q * 50} armR={22 + q * 50} foot={hop} /></div>}
    {nameTag(BX, BY + 176, 24)}
    <div style={abs(0, 880, { width: 1920, textAlign: 'center', ...mono(20, MID), opacity: u(t, LE[28] + 0.3, LE[28] + 0.8) })}>出处：Arena、fal、Google、Grok Bot、MiniMax 的官方帖、官方演示和官方模型说明 · “各干各的”是我的看法</div>
  </>;
}

function Subs({ t }: { t: number }) {
  const s = SUBS.find((x) => t >= x.s && t < x.e);
  if (!s) return null;
  return <div style={abs(0, 962, { width: 1920, textAlign: 'center', ...mi(44, INK, 600), opacity: u(t, s.s, s.s + 0.1), transform: `translateY(${(1 - expo(t, s.s, s.s + 0.3)) * 10}px)`, textShadow: '0 0 16px rgba(255,255,255,.95), 0 0 4px rgba(255,255,255,.9)' })}>{s.text}</div>;
}
const SFX: [number, string, number][] = [...C.slice(0, 5).map((c): [number, string, number] => [c - 0.38, 'whoosh-short', 0.2]), ...C.slice(0, 5).map((c): [number, string, number] => [c + 0.86, 'pop', 0.09]), [C[5] - 0.4, 'slide', 0.14]];
const PARTS = [S1, S2, S3, S4, S5];

export function Film6() {
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
export const FILM6_FRAMES = Math.round(END * 30);
