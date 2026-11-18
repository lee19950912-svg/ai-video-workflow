// 《DeepSeek 全家桶应用 API》：2026-11-14 这一期。第一期只讲一件事、也是第一期按"一个舞台"做的片子。
// 稿子 E:\自媒体\AI热点-1114\dialog.json（32 句，"不按规范"那一版，用户说"用新这版，重配"）。
// 舞台的做法照 hot3\Film6.tsx：左边一张大卡、右边一栏，Aha 全片站在同一个地方，每段只换卡里的内容。
// 卡里放的都是真东西：DeepSeek 官方公告、官方文档、官方示例代码仓库、官方样板页的截图（2026-11-14 截），和用户给的官方价目表。
// 没有真画面可放的两处（"它图什么""自来水厂"）放一个关键词，挂"我的看法"。
import React from 'react';
import { AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import D from './data.json';
import { CARD, RING, Fonts, PAGE, INK, MID, Reveal, WARN, WHITE, abs, clamp, expo, inout, io, logo, mi, mix, mono, rise, tex, u } from '../hot/fx';
import { Buddy, Mood } from '../hot/Buddy';
import { BLACKPILL, Head, keyMood, makeTalk } from '../hot/layouts';

const LS = D.LS as number[], LE = D.LE as number[], C = D.cuts as number[], END = D.END as number, VO = D.VO as unknown as [string, number, number][][];
const SUBS = D.subs as { s: number; e: number; text: string }[];
const at = (li: number, phrase: string) => { const s = VO[li].map((c) => c[0]).join(''), i = s.indexOf(phrase); if (i < 0) throw new Error(`第 ${li} 句里找不到：${phrase}`); return VO[li][i][1]; };
const talkAt = makeTalk(VO);
const TITLE = 'DeepSeek 全家桶应用 API', NAME = 'Aha', N = 4;
const DEMO = { x: 96, y: 150, w: 1356, h: 763, r: 34 }, BS = 1356 / 880, BX = 1672, BY = 628, ST = 0.4, AS = 290;
const smooth = (t: number, a: number, b: number) => { const v = u(t, a, b); return v * v * v * (v * (6 * v - 15) + 10); };
const LIFTS = D.lifts as number[][];
const musicGain = (t: number) => { let k = 0; LIFTS.forEach(([a, b]) => { k = Math.max(k, io(t, a, a + 0.25) * (1 - io(t, b - 0.25, b))); }); return (D.musicVol as number) * (1 + k); };
const LogoPill = ({ w, h = 92, children }: { w: number; h?: number; children: React.ReactNode }) => <div style={{ width: w, height: h, borderRadius: h / 2, ...CARD, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{children}</div>;
const pill = (s: string, w: number) => <LogoPill w={w} h={104}><span style={mi(46, INK, 600)}>{s}</span></LogoPill>;
const dsLogo = (w: number) => <img src={logo('deepseek.svg')} style={{ width: w }} />;   // 官网页头那个 logo，蓝色是官方的品牌色
const nameTag = (x: number, y: number, size = 24, extra: React.CSSProperties = {}) => <div style={abs(x - 100, y, { width: 200, display: 'flex', justifyContent: 'center', ...extra })}><span style={BLACKPILL(size)}>{NAME}</span></div>;

const IW = 320, IH = 202, IX = (i: number) => 96 + i * 345.3, IY = 440;
const SEC: { num: string; role: string; who: string; tx: string; glow: string; from: [number, number]; flood: React.ReactNode }[] = [
  { num: '01', role: '以前难在哪', who: 'DeepSeek 自家 App 的本事', tx: 'teal', glow: 'rgba(10,90,150,.24)', from: [IX(0) + IW / 2, IY + IH / 2], flood: pill('它自家的 App', 420) },
  { num: '02', role: '全家桶', who: '官方公告 · 2026 年 11 月 13 日', tx: 'coral', glow: 'rgba(240,80,60,.24)', from: [BX, BY], flood: <LogoPill w={420} h={124}>{dsLogo(320)}</LogoPill> },
  { num: '03', role: '多少钱', who: 'DeepSeek 官方价目表', tx: 'gold', glow: 'rgba(240,150,40,.26)', from: [BX, BY], flood: pill('官方价目表', 380) },
  { num: '04', role: '跟你的关系', who: '写代码的 · 写不了代码的', tx: 'green', glow: 'rgba(30,160,100,.26)', from: [BX, BY], flood: pill('普通人', 280) },
];

// ── 换段（全片唯一一种转场）：颜色从 Aha 身上铺满全屏，亮一下第几个和这一段叫什么，再收回 Aha 身上 ──
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

// ── 卡里放的官方图。卡里的坐标是 880×495，整体放大到 1356×763 ──
// kf = [成片第几秒, 放大倍数, 对准图上的 x, y]；frames = 黑框依次框图上的哪一块（跟着图一起动）
type PK = [number, number, number, number][];
type Box = [number, number, number, number];
type Fr = { at: number; box: Box };
const B = (w: number, h: number, b: number[]): Box => [b[0] / w, b[1] / h, b[2] / w, b[3] / h];   // 原图上的像素 → 0 到 1
const pic = (img: string, iw: number, ih: number, kf: PK, frames: Fr[] = []) => (t: number) => {
  let n = 0; kf.forEach((k, i) => { if (t >= k[0]) n = i; });
  const a = kf[n], b = kf[Math.min(kf.length - 1, n + 1)], k = n === kf.length - 1 ? 1 : smooth(t, a[0], b[0]), z = mix(a[1], b[1], k), cx = mix(a[2], b[2], k), cy = mix(a[3], b[3], k), w = 880 * z, h = w * ih / iw, L = 440 - cx * w, T = 247.5 - cy * h;
  let m = -1; frames.forEach((f, i) => { if (t >= f.at) m = i; });
  let g: number[] | null = null;
  if (m >= 0) { const q = frames[m].box, p = m ? frames[m - 1].box : q, e = expo(t, frames[m].at, frames[m].at + 0.45); g = q.map((v, i) => mix(p[i], v, e)); }
  return <><div style={abs(0, 0, { width: 880, height: 495, background: WHITE })} /><Img src={staticFile(img)} style={abs(L, T, { width: w, height: h })} />
    {g && <div style={abs(L + g[0] * w - 5, T + g[1] * h - 5, { width: (g[2] - g[0]) * w + 10, height: (g[3] - g[1]) * h + 10, borderRadius: 12, boxSizing: 'border-box', border: `3.4px solid ${INK}`, boxShadow: '0 6px 16px rgba(14,14,16,.16)', opacity: u(t, frames[0].at, frames[0].at + 0.18) })} />}</>;
};
const ART = 'hot4/shots/article.png', GUIDE = 'hot4/shots/guide.png', GH = 'hot4/shots/github_narrow.png', DEMOPG = 'hot4/shots/demo.png', NEWS = 'hot4/shots/news_narrow.png', PRICE = 'hot4/shots/price.jpg';
const art = (kf: PK, fr: Fr[]) => pic(ART, 2200, 7200, kf, fr), guide = (kf: PK, fr: Fr[]) => pic(GUIDE, 2880, 6000, kf, fr), gh = (kf: PK, fr: Fr[]) => pic(GH, 1760, 6000, kf, fr);
const AZ = 1.567, GZ = 1.706;   // 公告、文档、代码仓库各自的放大倍数：正文那一栏刚好占满卡宽，字不被切

// ── 舞台：大卡 + 右栏 + Aha。四段都用它，只换 panels（卡里的内容）──
type Panel = { a: number; b: number; src?: string; body: (t: number) => React.ReactNode };
type TagK = { text: string; at: number; out: number; warn?: boolean };
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
      {tag && <div style={abs(BX - 210, BY - 236, { width: 420, display: 'flex', justifyContent: 'center', ...rise(t, tag.at, { out: tag.out, dy: 14, s0: 0.8 }) })}><span style={BLACKPILL(26, tag.warn ? WARN : INK)}>{tag.text}</span></div>}
    </div>
    {nameTag(BX, BY + 176, 24, { opacity: pop })}
    {t > c + 0.92 && (ahaOff === undefined || t < ahaOff) && <Buddy t={t} x={BX - pt * 16} y={BY - (mood === 'wow' ? Math.sin(mk * Math.PI) * 26 : 0)} size={mix(210, AS, pop)} tint={S.tx} mood={mood} prev={M.prev} mk={mk} talk={talkAt(t)} look={[-0.7 - pt * 0.25, -0.05]} sy={1 + Math.sin(u(t, c + 0.92, c + 1.42) * Math.PI) * 0.08}
      armR={22 + (bmood(mood) + (mood === 'think' ? 128 : 0)) * mk} armL={22 + pt * 112 + bmood(mood) * mk * (1 - pt)} rot={(mood === 'think' ? -6 * mk : mood === 'side' ? 4 * mk : 0) - pt * 7} seed={S.num.charCodeAt(1)} />}
  </>;
}
// 卡里的一个关键词（没有真画面可放的时候用；一句话最多一个）
const word = (t: number, text: string, a: number, b?: number, size = 150) => (t < a - 0.05 || (b !== undefined && t >= b + 0.3) ? null : <div style={abs(0, 247.5 - size * 0.62, { width: 880, textAlign: 'center', ...mi(size, INK), ...rise(t, a, { dy: 30, s0: 0.92, d: 0.6, out: b }) })}>{text}</div>);

// ══ 开头：一个关键词 → DeepSeek 的 logo；四张小卡；Aha 已经站在它全片都站的地方 ═══════════════
const ITEMS: [string, string, string, string][] = [['01', '以前难在哪', '它自家 App 的本事', 'teal'], ['02', '全家桶', '官方公告', 'coral'], ['03', '多少钱', '官方价目表', 'gold'], ['04', '跟你的关系', '往后会碰到什么', 'green']];
const itemCard = (t: number, i: number, x: number, y: number, shadow: string, extra: React.CSSProperties = {}) => { const [no, name, sub, tint] = ITEMS[i], s = 0.81;
  return <div key={i} style={abs(x, y, { width: IW, height: IH, borderRadius: 30 * s, overflow: 'hidden', background: WHITE, boxShadow: shadow, ...extra })}>
    <div style={abs(0, 0, { width: IW, height: 84 * s, ...tex(tint, t + i) })} /><span style={abs(24 * s, 28 * s, mono(26 * s, WHITE))}>{no}</span>
    <span style={abs(24 * s, 112 * s, mi((name.length > 3 ? 46 : 54) * s, INK))}>{name}</span><span style={abs(26 * s, 186 * s, mi(23 * s, MID, 500))}>{sub}</span>
  </div>; };
const cap = (text: string, extra: React.CSSProperties) => <div style={abs(96, 236, { height: 128, borderRadius: 64, background: INK, padding: '0 40px', display: 'flex', alignItems: 'center', ...mi(96, WHITE), ...extra })}>{text}</div>;
const TopLine = () => <div style={abs(76, 60, { display: 'flex', alignItems: 'center', gap: 16, zIndex: 5 })}><div style={{ width: 16, height: 16, borderRadius: 8, background: INK }} /><span style={mi(30, INK, 600)}>{TITLE}</span><span style={mi(27, MID, 500)}>· 2026 年 11 月 13 日发布</span></div>;
function Intro({ t }: { t: number }) {
  const who = at(2, 'DeepSeek') - 0.3, k0 = at(0, '反常') - 0.1, lift = expo(t, C[0] - 0.9, C[0] - 0.4);
  const mood: Mood = t < k0 ? 'calm' : t < who ? 'think' : 'happy', hop = Math.sin(u(t, who, who + 0.5) * Math.PI), wave = u(t, 0.1, 0.35) * (1 - u(t, 1.9, 2.3)), hap = io(t, who, who + 0.3);
  return <>
    <TopLine />
    {t < who + 0.2 && cap('一件反常的事', { transformOrigin: '50% 50%', transform: `scale(${1 + 0.1 * Math.sin(u(t, k0, k0 + 0.45) * Math.PI)})`, opacity: 1 - io(t, who - 0.12, who + 0.1) })}
    {t > who && <div style={abs(96, 222, rise(t, who, { dy: 24, s0: 0.9 }))}><LogoPill w={600} h={156}>{dsLogo(470)}</LogoPill></div>}
    {ITEMS.map((_, i) => { const up = i === 0 ? lift : 0, bob = Math.sin(u(t, 0.15 + i * 0.14, 0.7 + i * 0.14) * Math.PI) * 16 + Math.sin(u(t, who + 0.2 + i * 0.12, who + 0.7 + i * 0.12) * Math.PI) * 16;
      return itemCard(t, i, IX(i), IY - up * 14 - bob, `${RING}0 ${24 + up * 22}px ${54 + up * 30}px rgba(30,40,80,${0.17 + up * 0.1}), 0 4px 10px rgba(30,40,80,.09)`); })}
    <Buddy t={t} x={BX} y={BY - hop * 60} size={AS} tint="violet" mood={mood} talk={talkAt(t)} look={[-0.7, -0.05]} sy={1 + hop * 0.06} armR={22 + wave * (108 + Math.sin(t * 13) * 24) + hap * 55 + (mood === 'think' ? 128 : 0)} armL={22 + hap * 55} rot={mood === 'think' ? -6 : 0} foot={hop} />
    {nameTag(BX, BY + 176, 24)}
  </>;
}

// ══ 01 以前难在哪：官方文档的"功能对照"表（它 App 里的本事）→ 官方公告第一段（别人要自己接，很费功夫）══════
function S1({ t }: { t: number }) {
  const c = C[0], lazy = at(5, '懒得') - 0.12, own = LS[6] - 0.12, hard = at(7, '要自己') - 0.12;
  return <>
    <Head title={TITLE} num="01" total="04" role="" who={SEC[0].who} />
    <Stage t={t} i={0} pts={[at(3, '上网搜'), at(4, 'PDF'), at(4, '丢个链接'), lazy + 0.1, hard + 0.1]}
      moods={[[c, 'calm'], [lazy, 'happy'], [own, 'calm'], [hard, 'think'], [at(8, '很费功夫') - 0.1, 'side']]}
      panels={[
        { a: c + ST, b: own, src: '图 · DeepSeek 官方文档', body: guide([[c + ST, GZ, 0.505, 0.2092], [lazy - 0.5, GZ, 0.505, 0.2092], [lazy + 0.4, GZ, 0.505, 0.3092]],
          [{ at: at(3, '上网搜') - 0.12, box: B(2880, 6000, [632, 991, 2276, 1126]) }, { at: at(4, 'PDF') - 0.12, box: B(2880, 6000, [632, 1260, 2276, 1393]) }, { at: at(4, '丢个链接') - 0.12, box: B(2880, 6000, [632, 1393, 2276, 1527]) }, { at: lazy, box: B(2880, 6000, [632, 2023, 2276, 2288]) }]) },
        { a: own, b: C[1], src: '图 · DeepSeek 官方公告', body: art([[own, AZ, 0.5, 0.0507]],
          [{ at: own + 0.25, box: B(2200, 7200, [425, 226, 1775, 342]) }, { at: hard, box: B(2200, 7200, [1036, 340, 1775, 404]) }]) }]} />
  </>;
}

// ══ 02 全家桶：官方文档新闻页（名字和日期）→ 示例里的"开关" → 代码仓库 → 公告里"1:1 复刻"那句 ═══════
function S2({ t }: { t: number }) {
  const c = C[1], sw = LS[11] - 0.12, demo = LS[12] - 0.12, quote = LS[13] - 0.12;
  return <>
    <Head title={TITLE} num="02" total="04" role="" who={SEC[1].who} />
    <Stage t={t} i={1} pts={[at(10, '全家桶'), at(11, '开关'), at(12, '样板'), at(13, '甚至')]} tags={[{ text: '官方的原话', at: quote + 0.1, out: C[2] }]}
      moods={[[c, 'calm'], [at(10, '全家桶'), 'happy'], [sw, 'calm'], [demo, 'happy'], [quote, 'wow']]}
      panels={[
        { a: c + ST, b: sw, src: '图 · DeepSeek 官方文档 · 新闻页', body: pic(NEWS, 1800, 3000, [[c + ST, 1, 0.5, 0.1687]],
          [{ at: at(9, '打包') - 0.12, box: B(1800, 3000, [160, 12, 1610, 68]) }, { at: at(10, '全家桶') - 0.3, box: B(1800, 3000, [24, 458, 796, 532]) }]) },
        { a: sw, b: demo, src: '图 · 官方文档里的示例', body: guide([[sw, 1.74, 0.505, 0.8618]], [{ at: at(11, '开关') - 0.3, box: B(2880, 6000, [745, 5200, 1740, 5300]) }]) },
        { a: demo, b: quote, src: '图 · 官方示例代码仓库（GitHub）', body: gh([[demo, 1, 0.5, 0.1292]], [{ at: at(12, '样板') - 0.12, box: B(1760, 6000, [24, 340, 412, 408]) }, { at: at(12, '代码公开') - 0.12, box: B(1760, 6000, [1256, 740, 1464, 790]) }]) },
        { a: quote, b: C[2], src: '图 · DeepSeek 官方公告', body: art([[quote, AZ, 0.5, 0.1222]], [{ at: at(13, '甚至') - 0.3, box: B(2200, 7200, [425, 606, 1775, 724]) }]) }]} />
  </>;
}

// ══ 03 多少钱：官方价目表（黑框挨行走）→ 一个关键词（我的看法）═════════════════════════════
function S3({ t }: { t: number }) {
  const c = C[2], half = at(15, '半分钱') - 0.1, why = LS[19] - 0.12, mine = at(19, '我的看法') - 0.1, tap = at(20, '自来水厂') - 0.15;
  return <>
    <Head title={TITLE} num="03" total="04" role="" who={SEC[2].who} />
    <Stage t={t} i={2} pts={[at(15, '搜一次'), LS[16] + 0.1, LS[17] + 0.1, tap + 0.2]}
      tags={[{ text: '我算的：5 元 ÷ 1000 次', at: half, out: LS[16] - 0.05 }, { text: '我的看法', at: mine, out: C[3] }]}
      moods={[[c, 'calm'], [half + 0.05, 'wow'], [LS[16], 'calm'], [at(18, '自己标') - 0.1, 'side'], [why, 'think'], [tap, 'happy']]}
      panels={[
        { a: c + ST, b: why, src: '图 · DeepSeek 官方价目表', body: pic(PRICE, 819, 1050, [[c + ST, 1, 0.5, 0.213], [LS[16] - 0.5, 1, 0.5, 0.213], [LS[16] + 0.3, 1, 0.5, 0.515], [at(18, '自己标') - 0.5, 1, 0.5, 0.515], [at(18, '自己标') + 0.3, 1, 0.5, 0.75]],
          [{ at: at(15, '搜一次') - 0.12, box: [0.05, 0.318, 0.95, 0.41] }, { at: LS[16], box: [0.05, 0.527, 0.95, 0.615] }, { at: LS[17], box: [0.05, 0.63, 0.95, 0.72] }, { at: at(18, '自己标') + 0.3, box: [0.715, 0.922, 0.975, 0.974] }]) },
        { a: why, b: C[3], body: (tt) => <>{word(tt, '图什么？', why + 0.1, tap)}{word(tt, '自来水厂', tap)}</> }]} />
  </>;
}

// ══ 04 跟你的关系：公告结尾 → 代码仓库的说明 → 样板页要填钥匙 → 文档里"请使用 Flash" → 公告里的责任那条 ════
function S4({ t }: { t: number }) {
  const c = C[3], code = LS[25] - 0.12, key = LS[27] - 0.12, flash = LS[28] - 0.12, duty = LS[29] - 0.12, guess = at(24, '多半') - 0.1, ex = inout(t, LE[29] + 0.02, LE[29] + 0.42);
  return <>
    <Head title={TITLE} num="04" total="04" role="" who={SEC[3].who} />
    <Stage t={t} i={3} fadeK={ex} ahaOff={C[4] - 0.4} pts={[at(23, '笔记软件'), at(24, '会上网搜'), at(26, '最费功夫'), at(27, '钥匙'), at(28, 'Flash'), at(29, '内容审核')]}
      tags={[{ text: '我猜', at: guess, out: code, warn: true }, { text: '官方写的', at: duty + 0.1, out: C[4] + 1 }]}
      moods={[[c, 'calm'], [LS[22], 'happy'], [LS[23], 'calm'], [guess, 'think'], [code, 'happy'], [key, 'calm'], [flash, 'side'], [duty, 'calm']]}
      panels={[
        { a: c + ST, b: code, src: '图 · DeepSeek 官方公告的结尾', body: art([[c + ST, AZ, 0.5, 0.6104]],
          [{ at: at(23, '笔记软件') - 0.3, box: B(2200, 7200, [425, 4500, 1775, 4564]) }, { at: at(24, '会上网搜') - 0.12, box: B(2200, 7200, [925, 4558, 1562, 4624]) }]) },
        { a: code, b: key, src: '图 · 官方示例代码仓库（GitHub）', body: gh([[code, 1.65, 0.3486, 0.392]], [{ at: at(26, '做一个') - 0.12, box: B(1760, 6000, [88, 2088, 1142, 2236]) }, { at: at(26, '最费功夫') - 0.12, box: B(1760, 6000, [88, 2448, 566, 2530]) }]) },
        { a: key, b: flash, src: '图 · DeepSeek 官方样板页', body: pic(DEMOPG, 2880, 1800, [[key, 1.5, 0.5, 0.5]], [{ at: at(27, '钥匙') - 0.3, box: B(2880, 1800, [1120, 594, 2152, 678]) }]) },
        { a: flash, b: duty, src: '图 · DeepSeek 官方文档', body: guide([[flash, GZ, 0.505, 0.7058]], [{ at: at(28, 'Flash') - 0.3, box: B(2880, 6000, [620, 4350, 1080, 4415]) }]) },
        { a: duty, b: C[4] + 1, src: '图 · DeepSeek 官方公告', body: art([[duty, AZ, 0.5, 0.1879]], [{ at: at(29, '内容审核') - 0.5, box: B(2200, 7200, [436, 1610, 1775, 1714]) }]) }]} />
  </>;
}

// ══ 结尾：四张小卡回来，只留一个问题 ═══════════════════════════════════════════════
function Outro({ t }: { t: number }) {
  const c = C[4] - 0.4, cq = at(31, '你最想') - 0.15, q = io(t, cq, cq + 0.5), hop = Math.sin(u(t, cq, cq + 0.55) * Math.PI);
  return <>
    {t >= C[4] + 0.08 && <TopLine />}
    <div style={abs(96, 208)}><Reveal t={t} t0={cq + 0.1} text="装进哪个软件？" style={mi(150)} stagger={0.06} /></div>
    {ITEMS.map((_, i) => itemCard(t, i, IX(i), IY + Math.sin(t * 1.6 + i) * 4, `${RING}0 24px 54px rgba(30,40,80,.17), 0 4px 10px rgba(30,40,80,.09)`, { ...rise(t, c + 0.3 + i * 0.09, { dy: 60, s0: 0.9 }) }))}
    <Buddy t={t} x={BX} y={BY - hop * 60} size={AS} tint="green" tint2="violet" tk={io(t, c + 0.2, c + 1.0)} seed={52} mood={t > cq ? 'happy' : 'calm'} talk={talkAt(t)} look={[t > cq ? 0 : -0.7, 0.1]} sy={1 + hop * 0.06} armL={22 + q * 50} armR={22 + q * 50} foot={hop} />
    {nameTag(BX, BY + 176, 24)}
    <div style={abs(0, 880, { width: 1920, textAlign: 'center', ...mono(20, MID), opacity: u(t, LE[31] + 0.3, LE[31] + 0.8) })}>出处：DeepSeek 官方公告、官方文档、官方示例代码（2026-11-13）· 价钱是它自己公布的 · “自来水厂”是我的看法</div>
  </>;
}

function Subs({ t }: { t: number }) {
  const s = SUBS.find((x) => t >= x.s && t < x.e);
  if (!s) return null;
  return <div style={abs(0, 962, { width: 1920, textAlign: 'center', ...mi(44, INK, 600), opacity: u(t, s.s, s.s + 0.1), transform: `translateY(${(1 - expo(t, s.s, s.s + 0.3)) * 10}px)`, textShadow: '0 0 16px rgba(255,255,255,.95), 0 0 4px rgba(255,255,255,.9)' })}>{s.text}</div>;
}
const SFX: [number, string, number][] = [...C.slice(0, N).map((c): [number, string, number] => [c - 0.38, 'whoosh-short', 0.2]), ...C.slice(0, N).map((c): [number, string, number] => [c + 0.86, 'pop', 0.09]), [C[N] - 0.4, 'slide', 0.14]];
const PARTS = [S1, S2, S3, S4];

export function Film7() {
  const { fps, width } = useVideoConfig(), t = useCurrentFrame() / fps;
  return <AbsoluteFill style={{ background: PAGE }}>
    <Fonts />
    <div style={{ position: 'absolute', width: 1920, height: 1080, transform: `scale(${width / 1920})`, transformOrigin: '0 0', overflow: 'hidden' }}>
      {t < C[0] && <Intro t={t} />}
      {PARTS.map((P, i) => (t >= C[i] && t < C[i + 1] + (i === N - 1 ? 0.08 : 0) ? <P key={i} t={t} /> : null))}
      {t >= C[N] - 0.4 && <Outro t={t} />}
      {SEC.map((_, i) => <Flood key={i} t={t} i={i} />)}
      <Subs t={t} />
    </div>
    <Audio src={staticFile('hot4/voice.wav')} />
    <Audio src={staticFile('hot4/music.wav')} volume={(f) => musicGain(f / 30)} />
    {SFX.map(([s, n, v], i) => <Sequence key={i} from={Math.max(0, Math.round(s * fps))} durationInFrames={Math.round(fps * 2)}><Audio src={staticFile(`sfx/${n}.wav`)} volume={v} /></Sequence>)}
  </AbsoluteFill>;
}
export const FILM7_FRAMES = Math.round(END * 30);
