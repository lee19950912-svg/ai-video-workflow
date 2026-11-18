// 《同一天，AI 圈开了场招聘会》2026-11-12 这一期。稿子 E:\自媒体\AI热点-1112\dialog.json（27 句，用户确认过）。
// 第一稿用户打了 95 分，提了三点（原话见 E:\自媒体\AI热点-1112\README.md），这一稿按它改：
//   1. IP 形象要有说话的嘴，要有名字（定了叫 Aha）→ 嘴跟着配音的每个字开合；开头和每段都挂名字。
//   2. 右边小栏里的标题和小字和字幕重复 → 去掉，只留"第几个岗位、叫什么"和出处。
//   3. 文案那一屏很快就切走，多余；演示外面套一张彩色大卡又套一张白卡，多余 → 两样都去掉：
//      换段时颜色铺满全屏亮一下"第几个 + 岗位名"，然后整片颜色收进 Aha 的身体里，演示直接是白底上的一张大卡。
import React from 'react';
import { AbsoluteFill, Audio, Freeze, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import D from './data.json';
import { CARD, RING, Fonts, PAGE, INK, MID, Reveal, WARN, WHITE, abs, clamp, expo, inout, io, logo, mi, mix, mono, rise, tex, tw, u } from '../hot/fx';
import { Buddy, Mood } from '../hot/Buddy';

const LS = D.LS as number[], LE = D.LE as number[], C = D.cuts as number[], END = D.END as number, VO = D.VO as unknown as [string, number, number][][];
const SUBS = D.subs as { s: number; e: number; text: string }[];
const at = (li: number, phrase: string) => { const s = VO[li].map((c) => c[0]).join(''), i = s.indexOf(phrase); if (i < 0) throw new Error(`第 ${li} 句里找不到：${phrase}`); return VO[li][i][1]; };
const DEMO = { x: 96, y: 150, w: 1356, h: 763, r: 34 }, BS = 1356 / 880, BX = 1672, BY = 640, DRAWBG = '#E6E9F1', NAME = 'Aha';
const smooth = (t: number, a: number, b: number) => { const v = u(t, a, b); return v * v * v * (v * (6 * v - 15) + 10); };
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lerpC = (a: string, b: string, k: number) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(mix(v, B[i], clamp(k)))).join(',')})`; };
const LogoPill = ({ w, h = 92, children }: { w: number; h?: number; children: React.ReactNode }) => <div style={{ width: w, height: h, borderRadius: h / 2, ...CARD, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{children}</div>;
const BLACKPILL = (size = 28): React.CSSProperties => ({ ...mi(size, WHITE, 600), background: INK, borderRadius: size, padding: `${Math.round(size * 0.4)}px ${Math.round(size * 0.8)}px ${Math.round(size * 0.47)}px` });
// Aha 的嘴：配音念到每个字的时候张一下，字和字之间不完全闭上，句子之间闭上
// 英文词不按字母张嘴（那样每秒十几下，嘴会抖）：整个英文词当一段，每 0.19 秒张一下；中文还是一个字张一下
const SPANS: [number, number, boolean][] = [];
VO.forEach((line) => line.forEach(([ch, a, b]) => { const lat = /[A-Za-z0-9]/.test(ch), last = SPANS[SPANS.length - 1]; if (lat && last && last[2] && a - last[1] < 0.03) last[1] = b; else SPANS.push([a, b, lat]); }));
const talkAt = (t: number) => { for (const [a, b, lat] of SPANS) { if (t >= a && t < b) return 0.3 + 0.7 * Math.abs(Math.sin(((t - a) / (lat ? 0.19 : Math.max(0.01, b - a))) * Math.PI)); if (a > t) return a - t < 0.06 ? 0.3 : 0; } return 0; };
// 配乐不再是一条直线：开头人声进来前、每次换段的空当、最后一问之后抬高一倍（约 6 分贝），升降各 0.25 秒
const LIFTS = D.lifts as number[][];
const musicGain = (t: number) => { let k = 0; LIFTS.forEach(([a, b]) => { k = Math.max(k, io(t, a, a + 0.25) * (1 - io(t, b - 0.25, b))); }); return (D.musicVol as number) * (1 + k); };

// ── 真画面：官方演示视频（kf = [成片第几秒, 素材第几秒]）和官方图（kf = [成片第几秒, 放大倍数, 对准图上的 x, y（0 到 1）]）──
type KF = [number, number][];
const srcAt = (kf: KF, t: number) => { if (t <= kf[0][0]) return kf[0][1]; for (let i = 1; i < kf.length; i++) if (t < kf[i][0]) { const a = kf[i - 1], b = kf[i]; return mix(a[1], b[1], (t - a[0]) / Math.max(1e-6, b[0] - a[0])); } return kf[kf.length - 1][1]; };
const V = ({ t, src, kf }: { t: number; src: 'k' | 'm'; kf: KF }) => <Freeze frame={Math.max(0, Math.round(srcAt(kf, t) * 30))}><OffthreadVideo muted src={staticFile(`hot2/footage/${src}.mp4`)} style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', objectFit: 'cover' }} /></Freeze>;
const clip = (src: 'k' | 'm', kf: KF) => (t: number) => <V t={t} src={src} kf={kf} />;
type PK = [number, number, number, number][];
const pic = (img: string, iw: number, ih: number, kf: PK) => (t: number) => {
  let n = 0; kf.forEach((k, i) => { if (t >= k[0]) n = i; });
  const a = kf[n], b = kf[Math.min(kf.length - 1, n + 1)], k = n === kf.length - 1 ? 1 : smooth(t, a[0], b[0]), z = mix(a[1], b[1], k), cx = mix(a[2], b[2], k), cy = mix(a[3], b[3], k), w = 880 * z, h = w * ih / iw;
  return <><div style={abs(0, 0, { width: 880, height: 495, background: WHITE })} /><Img src={staticFile(`hot2/shots/${img}`)} style={abs(440 - cx * w, 247.5 - cy * h, { width: w, height: h })} /></>;
};
const nameTag = (x: number, y: number, size = 24, extra: React.CSSProperties = {}) => <div style={abs(x - 100, y, { width: 200, display: 'flex', justifyContent: 'center', ...extra })}><span style={BLACKPILL(size)}>{NAME}</span></div>;

// ══ 开头：五张岗位牌 + Aha ════════════════════════════════════════════════════
const ROLES: [string, string, string, string][] = [['01', '质检员', 'Gemini Decision 1', 'teal'], ['02', '骨干', 'Claude Fable 5.2', 'gold'], ['03', '进群的同事', 'Grok Bot 1.0', 'violet'], ['04', '拍广告的', 'fal 插件', 'coral'], ['05', '美工', 'MiniMax H3 Image', 'green']];
const roleCard = (t: number, i: number, x: number, y: number, w: number, h: number, shadow: string, extra: React.CSSProperties = {}) => { const [no, name, sub, tint] = ROLES[i], s = w / 316;
  return <div key={i} style={abs(x, y, { width: w, height: h, borderRadius: 30 * s, overflow: 'hidden', background: WHITE, boxShadow: shadow, ...extra })}>
    <div style={abs(0, 0, { width: w, height: 84 * s, ...tex(tint, t + i) })} /><span style={abs(24 * s, 28 * s, mono(26 * s, WHITE))}>{no}</span>
    <span style={abs(24 * s, 112 * s, mi((name.length > 4 ? 44 : 54) * s, INK))}>{name}</span><span style={abs(26 * s, 186 * s, mi(23 * s, MID, 500))}>{sub}</span>
  </div>; };
function Intro({ t }: { t: number }) {
  const tA = LS[1] - 0.15, tB = LS[2] - 0.15, c0 = at(0, '招聘会') - 0.1, c1 = at(1, '你当组长') - 0.1, h0 = 'AI 圈开了场', h1 = 'AI 开始分工了', cards = at(0, '五个岗位') - 0.3;
  const hops: [number, number][] = [[tB + 0.5, 0], [tB + 0.92, 1], [tB + 1.34, 2], [tB + 1.76, 3], [tB + 2.18, 4], [tB + 2.75, 0]];
  let n = -1; hops.forEach((h, i) => { if (t >= h[0]) n = i; });
  const ringX = n < 0 ? 0 : mix(n > 0 ? hops[n - 1][1] : 0, hops[n][1], expo(t, hops[n][0], hops[n][0] + 0.36)), lift = expo(t, C[0] - 0.9, C[0] - 0.4);
  const mood: Mood = t < c0 ? 'calm' : t < tA ? 'wow' : t < c1 ? 'think' : 'happy', hop = Math.sin(u(t, c1, c1 + 0.5) * Math.PI), enter = 1;   // 第 0 帧它就站在那儿，不再从下面跳上来
  const wave = u(t, 0.1, 0.35) * (1 - u(t, 1.9, 2.3)), hap = io(t, c1, c1 + 0.3) * (1 - io(t, tB, tB + 0.3)), ptR = io(t, tB + 0.3, tB + 0.6);
  return <>
    <div style={abs(150, 190, { ...BLACKPILL(28), ...rise(t, -1, { out: tA, dy: 20 }) })}>同一天</div>
    <div style={abs(150, 262)}><Reveal t={t} t0={-1} text={h0} style={mi(96)} out={tA + 0.05} /></div>
    {t < tA + 0.2 && <div style={abs(150 + tw(h0, 96) + 26, 252, { height: 128, borderRadius: 64, background: INK, padding: '0 40px', display: 'flex', alignItems: 'center', ...mi(96, WHITE), transformOrigin: '50% 50%', transform: `scale(${1 + 0.1 * Math.sin(u(t, c0, c0 + 0.45) * Math.PI)})`, opacity: 1 - io(t, tA - 0.12, tA + 0.1) })}>招聘会</div>}
    <div style={abs(150, 190, { ...BLACKPILL(28), ...rise(t, tA + 0.1, { out: tB, dy: 20 }) })}>我的看法</div>
    <div style={abs(150, 262)}><Reveal t={t} t0={tA + 0.15} text={h1} style={mi(96)} out={tB + 0.05} /></div>
    <div style={abs(156, 384)}><Reveal t={t} t0={at(1, '以后') - 0.1} text="以后你用的是一支小队" style={mi(38, MID, 500)} out={tB} /></div>
    {t > c1 && <div style={abs(150 + tw(h1, 96) + 26, 252, { height: 128, borderRadius: 64, background: INK, padding: '0 40px', display: 'flex', alignItems: 'center', ...mi(96, WHITE), transformOrigin: '0 50%', transform: `scale(${expo(t, c1, c1 + 0.5)})`, opacity: 1 - io(t, tB - 0.12, tB + 0.1) })}>你当组长</div>}
    <div style={abs(150, 262)}><Reveal t={t} t0={tB + 0.15} text="认认这五个新同事" style={mi(96)} /></div>
    {ROLES.map((_, i) => { const t0 = -1, up = i === 0 ? lift : 0, bob = Math.sin(u(t, 0.15 + i * 0.14, 0.7 + i * 0.14) * Math.PI) * 18 + Math.sin(u(t, cards + i * 0.14, cards + 0.5 + i * 0.14) * Math.PI) * 18;   // 五张卡一开始就在，挨个抬一下
      return roleCard(t, i, 130 + i * 336, 468 - up * 14 - bob, 316, 250, `${RING}0 ${24 + up * 22}px ${54 + up * 30}px rgba(30,40,80,${0.17 + up * 0.1}), 0 4px 10px rgba(30,40,80,.09)`, { ...rise(t, t0, { dy: 60, s0: 0.9 }) }); })}
    {n >= 0 && <div style={abs(130 + ringX * 336 - 12, 456 - lift * 14, { width: 340, height: 274, borderRadius: 40, boxSizing: 'border-box', border: `5px solid ${INK}`, opacity: u(t, hops[0][0], hops[0][0] + 0.2) })} />}
    <Buddy t={t} x={1700} y={270 + (1 - enter) * 500 - hop * 60} size={210} tint="violet" mood={mood} talk={talkAt(t)} look={[t > tB ? -0.6 : -0.2, t > tB ? 0.7 : 0.1]} sy={1 + hop * 0.06} armR={22 + wave * (108 + Math.sin(t * 13) * 24) + hap * 55} armL={22 + hap * 55 + ptR * 60} foot={(1 - enter) + hop} />
    {nameTag(1700, 396, 24)}
  </>;
}

// ══ 五段共用：颜色铺满 → 亮"第几个 + 岗位名" → 颜色收进 Aha 身体里 → 白底上一张大演示卡，右边是 Aha ══════════
type Panel = { a: number; b: number; tag?: string; tagAt?: number; src?: string; mood?: Mood; pts?: number[]; body: (t: number) => React.ReactNode };
type Sec = { c: number; end: number; tx: string; glow: string; origin: [number, number]; num: string; role: string; who: string; flood: React.ReactNode; panels: Panel[]; last?: boolean };
function Section({ t, S }: { t: number; S: Sec }) {
  const { c, end } = S, cover = inout(t, c - 0.42, c), shrink = expo(t, c + 0.5, c + 1.1), ex = S.last ? inout(t, end - 0.4, end + 0.05) : 0;
  const clipP = t < c + 0.5 ? `circle(${cover * 2400}px at ${S.origin[0]}px ${S.origin[1]}px)` : `circle(${mix(2400, 92, shrink)}px at ${BX}px ${BY - 8}px)`;
  const fo = u(t, c - 0.3, c - 0.08) * (1 - u(t, c + 0.38, c + 0.6)), floodO = 1 - u(t, c + 0.98, c + 1.16);
  let pn = -1; S.panels.forEach((p, i) => { if (t >= p.a) pn = i; });
  const P = pn >= 0 ? S.panels[pn] : null, mood: Mood = P ? P.mood || 'calm' : 'calm', pmood: Mood | undefined = pn > 0 ? S.panels[pn - 1].mood || 'calm' : undefined, mk = P && pn > 0 ? u(t, P.a, P.a + 0.22) : 1;
  let pt = 0; S.panels.forEach((p) => (p.pts || []).forEach((c0) => { pt = Math.max(pt, io(t, c0 - 0.15, c0 + 0.15) * (1 - io(t, c0 + 1.1, c0 + 1.5))); }));
  const pop = expo(t, c + 0.92, c + 1.45), out = 1 - clamp(ex * 2.2), bmood = (m: Mood) => (m === 'wow' ? 120 : m === 'happy' ? 50 : m === 'side' ? 28 : 0);
  return <>
    {t >= c + 0.62 && <div style={{ opacity: out, transform: `translateY(${-ex * 40}px)` }}>
      {/* 演示：白底上直接一张大卡，外面不再套彩色卡 */}
      <div style={abs(DEMO.x, DEMO.y, { width: DEMO.w, height: DEMO.h, borderRadius: DEMO.r, overflow: 'hidden', background: WHITE, boxShadow: `${RING}0 34px 80px ${S.glow}, 0 4px 12px rgba(30,40,80,.10)`, ...rise(t, c + 0.66, { dy: 70, s0: 0.95 }) })}>
        {S.panels.map((p, i) => { const a0 = i ? p.a - 0.2 : p.a; if (t < a0 - 0.05 || t >= p.b + 0.5) return null;
          return <div key={i} style={{ position: 'absolute', left: 0, top: 0, width: DEMO.w, height: DEMO.h, background: WHITE, ...(i ? rise(t, a0, { dy: 70, s0: 1, d: 0.55 }) : {}) }}>
            <div style={{ position: 'absolute', left: 0, top: 0, width: 880, height: 495, transform: `scale(${BS})`, transformOrigin: '0 0' }}>{p.body(t)}</div>
          </div>; })}
      </div>
      {/* 右边：第几个岗位、叫什么；下面是 Aha 和出处。标题和小字去掉了（和字幕重复） */}
      <div style={abs(1492, 176, { ...mono(26, MID), ...rise(t, c + 1.1, { dy: 14, s0: 1 }) })}>{S.num} / 05</div>
      <div style={abs(1488, 216)}><Reveal t={t} t0={c + 1.1} text={S.role} style={mi(S.role.length > 4 ? 58 : 72)} /></div>
      <div style={abs(1492, 306, { ...mi(25, MID, 500), ...rise(t, c + 1.3, { dy: 14, s0: 1 }) })}>{S.who}</div>
      {P && P.tag && t >= (P.tagAt ?? P.a) && <div style={abs(BX - 150, BY - 212, { width: 300, display: 'flex', justifyContent: 'center', ...rise(t, P.tagAt ?? P.a + 0.35, { out: P.b, dy: 14, s0: 0.8 }) })}><span style={{ ...BLACKPILL(26), background: P.tag === '我猜' || P.tag === '据报道' ? WARN : INK }}>{P.tag}</span></div>}
      {nameTag(BX, BY + 150, 22, { opacity: pop })}
      {P && P.src && <div style={abs(1472, BY + 208, { width: 400, textAlign: 'center', ...mono(19, MID), ...rise(t, P.a + 0.3, { dy: 10, s0: 1 }) })}>{P.src}</div>}
    </div>}
    {/* 换段：颜色铺满全屏，亮一下第几个和岗位名，再整片收进 Aha 的身体 */}
    {t >= c - 0.42 && floodO > 0 && <>
      <div style={abs(0, 0, { width: 1920, height: 1080, ...tex(S.tx, t), clipPath: clipP, opacity: floodO })} />
      {fo > 0 && <div style={abs(0, 0, { width: 1920, height: 1080, opacity: fo, clipPath: clipP })}>
        <div style={abs(0, 150, { width: 1920, textAlign: 'center', ...mi(330, WHITE), transform: `translateY(${(1 - expo(t, c - 0.3, c + 0.2)) * 70}px)`, textShadow: '0 20px 60px rgba(0,0,40,.25)' })}>{S.num}</div>
        <div style={abs(0, 520, { width: 1920, textAlign: 'center', ...mi(130, WHITE), transform: `translateY(${(1 - expo(t, c - 0.2, c + 0.3)) * 50}px)`, textShadow: '0 12px 40px rgba(0,0,40,.25)' })}>{S.role}</div>
        <div style={abs(0, 720, { width: 1920, display: 'flex', justifyContent: 'center', transform: `scale(${mix(0.7, 1, expo(t, c - 0.1, c + 0.4))})` })}>{S.flood}</div>
      </div>}
    </>}
    {t > c + 0.92 && out > 0 && <div style={{ opacity: out }}><Buddy t={t} x={BX} y={BY} size={mix(190, 250, pop)} tint={S.tx} mood={mood} prev={pmood} mk={mk} talk={talkAt(t)} look={[-0.7, -0.05]} sy={1 + Math.sin(u(t, c + 0.92, c + 1.42) * Math.PI) * 0.08}
      armR={22 + (bmood(mood) + (mood === 'think' ? 128 : 0)) * mk} armL={22 + pt * 78 + bmood(mood) * mk * (1 - pt)} rot={mood === 'think' ? -6 * mk : mood === 'side' ? 4 * mk : 0} seed={S.num.charCodeAt(1)} /></div>}
  </>;
}

// ── 演示那块屏幕（880×495）里几样自己排的内容：都是数字和字，不是假界面 ───────────────────────
function dFacts(t: number) {
  const items: [string, string, string][] = [['1000', '个问题', '一次最多能答'], ['0.2', '秒左右', '出结果的时间'], ['0.10', '美元', '每百万输入的价钱']];
  return <>
    <div style={abs(0, 0, { width: 880, height: 495, background: DRAWBG })} />
    {items.map(([n, unit, cap], i) => <div key={i} style={abs(34 + i * 276, 96, { width: 260, height: 300, borderRadius: 30, background: WHITE, boxShadow: `0 0 0 3px ${INK}, 0 14px 30px rgba(20,30,60,.2)`, ...rise(t, LS[5] + 0.1 + i * 0.3, { dy: 40, s0: 0.9 }) })}>
      <span style={abs(24, 30, mi(24, MID, 600))}>{cap}</span><span style={abs(22, 104, mi(n.length > 3 ? 84 : 96, INK))}>{n}</span><span style={abs(26, 220, mi(34, INK, 600))}>{unit}</span>
    </div>)}
    <span style={abs(40, 432, { ...mono(21, MID), ...rise(t, LS[5] + 1.0, { dy: 10, s0: 1 }) })}>数字来自 Google 官方帖 · 2026-11-11</span>
  </>;
}
function dCompare(t: number) {
  const t1 = LS[10] + 0.1, t2 = at(10, '便宜') - 0.1, bar = expo(t, t1 + 0.2, t1 + 1.0), bar2 = expo(t, t2 + 0.2, t2 + 0.8);
  return <>
    <div style={abs(0, 0, { width: 880, height: 495, background: DRAWBG })} />
    <div style={abs(40, 26, rise(t, t1, { dy: 30, s0: 0.97 }))}>
      <span style={abs(0, 0, BLACKPILL(26))}>骨干</span><span style={abs(118, 8, mi(30, INK, 600))}>Claude Fable 5.2</span>
      <div style={abs(0, 62, { width: 800 * bar, height: 52, borderRadius: 18, background: INK })} /><span style={abs(0, 128, mi(40, INK))}>一单 7.3 美元</span>
    </div>
    <div style={abs(40, 222, rise(t, t2, { dy: 30, s0: 0.97 }))}>
      <span style={abs(0, 0, { ...BLACKPILL(26), background: MID })}>实习生</span><span style={abs(150, 8, mi(30, INK, 600))}>Muse Ember</span>
      <div style={abs(0, 62, { width: 6 + 6 * bar2, height: 52, borderRadius: 6, background: INK })} /><span style={abs(0, 128, mi(40, INK))}>一单 0.02 美元</span>
    </div>
    <span style={abs(40, 452, mono(20, MID))}>数字是 Arena 公布的中位数 · 比方是我打的</span>
  </>;
}

function dCost(t: number) {
  const t0 = at(8, '干一单') - 0.1;
  return <>
    <div style={abs(0, 0, { width: 880, height: 495, background: DRAWBG })} />
    <div style={abs(150, 72, { width: 580, height: 340, borderRadius: 34, background: WHITE, boxShadow: `0 0 0 3px ${INK}, 0 14px 30px rgba(20,30,60,.2)`, ...rise(t, t0, { dy: 40, s0: 0.9 }) })}>
      <span style={abs(36, 34, mi(28, MID, 600))}>Claude Fable 5.2 · 干一单活儿</span>
      <span style={abs(30, 92, mi(156, INK))}>7.3</span><span style={abs(290, 178, mi(56, INK, 600))}>美元</span>
      <span style={abs(36, 276, mono(21, MID))}>中位数 · Arena 公布</span>
    </div>
  </>;
}
function dLicense(t: number) {
  const t0 = at(22, '据报道') - 0.15, t1 = at(22, '商用') - 0.1;
  return <>
    <div style={abs(0, 0, { width: 880, height: 495, background: DRAWBG })} />
    <div style={abs(64, 110)}><Reveal t={t} t0={t0} text="许可里有限制" style={mi(92)} /></div>
    <div style={abs(68, 238)}><Reveal t={t} t0={t1} text="商用前，先看清条款" style={mi(58, INK, 600)} /></div>
    <span style={abs(70, 346, { ...mono(22, MID), ...rise(t, t1 + 0.4, { dy: 10, s0: 1 }) })}>限制是媒体报道的 · 许可原文我没读到</span>
  </>;
}

const pill = (s: string, w: number) => <LogoPill w={w} h={104}><span style={mi(46, INK, 600)}>{s}</span></LogoPill>;
const O2 = at(7, '有个榜单') - 0.5, ST = 0.66, HOME: [number, number] = [BX, BY];
const SECS: Sec[] = [
  { c: C[0], end: C[1], tx: 'teal', glow: 'rgba(10,90,150,.24)', origin: [288, 593], num: '01', role: '质检员', who: '谷歌 · Gemini Decision 1', flood: <LogoPill w={300} h={124}><img src={logo('google.png')} style={{ width: 260 }} /></LogoPill>,
    panels: [
      { a: C[0] + ST, b: LS[5] - 0.12, src: '图 · Google 官方', pts: [LS[4] + 0.3, at(4, '它只回答') - 0.1],
        body: pic('decision_card.jpg', 2640, 1082, [[C[0] + ST, 1, 0.5, 0.5], [C[0] + 1.7, 1, 0.5, 0.5], [C[0] + 2.9, 1.6, 0.3, 0.57], [at(4, '它只回答') - 0.6, 1.6, 0.3, 0.57], [at(4, '它只回答') + 0.5, 1.6, 0.7, 0.57], [LE[4] + 1, 1.6, 0.7, 0.57]]) },
      { a: LS[5] - 0.12, b: LS[6] - 0.12, src: '数字 · Google 官方', mood: 'wow', pts: [LS[5] + 0.3], body: dFacts },
      { a: LS[6] - 0.12, b: C[1], tag: '我猜', tagAt: at(6, '可你') - 0.1, src: '图 · Google 官方', mood: 'think', pts: [at(6, '可你') - 0.1],
        body: pic('decision_card.jpg', 2640, 1082, [[LS[6] - 0.3, 1.1, 0.5, 0.5], [at(6, '可你') - 0.4, 1.1, 0.5, 0.5], [at(6, '可你') + 0.8, 1.6, 0.7, 0.57], [C[1], 1.6, 0.7, 0.57]]) }] },
  { c: C[1], end: C[2], tx: 'gold', glow: 'rgba(240,150,40,.26)', origin: HOME, num: '02', role: '骨干', who: 'Arena 榜单 · Claude Fable 5.2', flood: pill('Arena 榜单', 380),
    panels: [
      { a: C[1] + ST, b: at(8, '干一单') - 0.25, src: '图 · Arena 官方（它自己公布的）', pts: [LS[8] + 0.5],
        body: pic('fable_board.jpg', 2400, 2400, [[O2, 1, 0.5, 0.285], [LS[8], 1, 0.5, 0.285], [LS[8] + 1.2, 1.08, 0.5, 0.262], [LE[8] + 1, 1.08, 0.5, 0.28]]) },
      { a: at(8, '干一单') - 0.25, b: LS[9] - 0.12, src: '数字 · Arena 公布的中位数', mood: 'wow', body: dCost },
      { a: LS[9] - 0.12, b: LS[10] - 0.12, src: '图 · Arena 官方', mood: 'wow', pts: [LS[9] + 0.3, at(9, '一单') - 0.1],
        body: pic('ember_board.jpg', 1249, 1303, [[LS[9] - 0.3, 1, 0.5, 0.5], [LS[9] + 1.0, 1, 0.5, 0.5], [at(9, '一单') - 0.2, 1.7, 0.74, 0.64], [LE[9] + 1, 1.7, 0.74, 0.64]]) },
      { a: LS[10] - 0.12, b: C[2], tag: '我的比方', mood: 'think', body: dCompare }] },
  { c: C[2], end: C[3], tx: 'violet', glow: 'rgba(90,60,220,.24)', origin: HOME, num: '03', role: '进群的同事', who: '马斯克的公司 · Grok Bot 1.0', flood: pill('Grok Bot', 330),
    panels: [
      { a: C[2] + ST, b: LS[12] - 0.12, src: '画面 · Grok Bot 官方演示', mood: 'happy', body: clip('k', [[C[2] + ST, 2.0], [LS[12] - 0.2, 7.0]]) },
      { a: LS[12] - 0.12, b: LS[13] - 0.12, src: '画面 · Grok Bot 官方演示', pts: [LS[12] + 0.3, at(12, '还能') - 0.1],
        body: clip('k', [[LS[12] - 0.1, 34.2], [at(12, '还能') - 0.3, 37.4], [at(12, '还能') - 0.299, 11.6], [LE[12] + 0.2, 16.4]]) },
      { a: LS[13] - 0.12, b: LS[14] - 0.12, tag: '官方说', src: '画面 · Grok Bot 官方演示', mood: 'happy', pts: [LS[13] + 0.5], body: clip('k', [[LS[13] - 0.1, 38.0], [at(13, '它会') - 0.25, 41.4], [at(13, '它会') - 0.249, 28.2], [LE[13] + 0.2, 31.6]]) },
      { a: LS[14] - 0.12, b: C[3], src: '画面 · Grok Bot 官方演示', mood: 'side', body: clip('k', [[LS[14] - 0.1, 70.6], [C[3], 76.0]]) }] },
  { c: C[3], end: C[4], tx: 'coral', glow: 'rgba(240,80,60,.24)', origin: HOME, num: '04', role: '拍广告的', who: 'fal · 给 ChatGPT 做的插件', flood: pill('fal', 200),
    panels: [
      { a: C[3] + ST, b: LS[17] - 0.12, src: '图 · fal 官方', pts: [LS[16] + 0.4, at(16, '还能') - 0.1],
        body: pic('ad_frames.jpg', 3600, 2006, [[C[3] + ST, 1, 0.5, 0.5], [C[3] + 1.9, 1, 0.5, 0.5], [C[3] + 3.0, 1.5, 0.5, 0.42], [LS[16] - 0.2, 1.5, 0.5, 0.42], [LS[16] + 0.9, 1.55, 0.52, 0.67], [at(16, '就能') - 0.4, 1.55, 0.52, 0.67], [at(16, '就能') + 0.7, 1.5, 0.5, 0.42], [LE[16] + 1, 1.5, 0.5, 0.42]]) },
      { a: LS[17] - 0.12, b: LS[19] - 0.12, src: '图 · fal 官方（广告里的两个镜头）', mood: 'wow', pts: [LS[18] - 0.05],
        body: pic('couch.jpg', 3600, 2025, [[LS[17] - 0.3, 1.3, 0.39, 0.44], [LS[18] - 0.3, 1.3, 0.39, 0.44], [LS[18] + 0.6, 1.3, 0.61, 0.44], [LE[18] + 0.5, 1.08, 0.5, 0.47]]) },
      { a: LS[19] - 0.12, b: C[4], src: '图 · fal 官方', mood: 'side', pts: [at(19, '按次数') - 0.1],
        body: pic('ad_frames.jpg', 3600, 2006, [[LS[19] - 0.3, 1.6, 0.6, 0.3], [LS[19] + 1.0, 3.0, 0.7, 0.2], [C[4], 3.0, 0.7, 0.2]]) }] },
  { c: C[4], end: C[5], tx: 'green', glow: 'rgba(30,160,100,.26)', origin: HOME, num: '05', role: '美工', who: '国内公司 MiniMax · H3 Image', flood: pill('MiniMax', 300), last: true,
    panels: [
      { a: C[4] + ST, b: LS[22] - 0.12, src: '画面 · MiniMax 官方演示', pts: [LS[21] + 0.3, at(21, '放进') - 0.2],
        body: clip('m', [[C[4] + ST, 0.3], [LS[21] - 0.11, 3.6], [LS[21] - 0.1, 16.6], [at(21, '它能') - 0.2, 19.6], [at(21, '它能') - 0.199, 22.0], [LE[21] + 0.2, 26.4]]) },
      { a: LS[22] - 0.12, b: at(22, '据报道') - 0.25, src: '画面 · MiniMax 官方演示', body: clip('m', [[LS[22] - 0.1, 47.6], [LS[22] + 1.4, 48.8]]) },
      { a: at(22, '据报道') - 0.25, b: LS[23] - 0.12, tag: '据报道', mood: 'side', pts: [at(22, '商用') - 0.1], body: dLicense },
      { a: LS[23] - 0.12, b: C[5], tag: '我看', src: '画面 · MiniMax 官方演示', mood: 'happy', pts: [at(23, '一张') - 0.1, at(23, '一套') - 0.1],
        body: clip('m', [[LS[23] - 0.1, 24.0], [at(23, '一张') - 0.2, 25.8], [at(23, '一张') - 0.199, 44.2], [C[5], 47.0]]) }] },
];

// ══ 结尾 ═══════════════════════════════════════════════════════════════
const TAKE = ['把活儿分清楚', '交回来的自己验收', '别都请最贵的那个'];
function Outro({ t }: { t: number }) {
  const c = C[5] - 0.4, tQ = LS[26] - 0.2;   // 结尾比换段点早一点进来，免得中间空一下
  const cues =[at(24, '把活儿') - 0.1, at(24, '交回来') - 0.1, LS[25] - 0.1];
  let n = -1; cues.forEach((cc, i) => { if (t >= cc) n = i; });
  const ak = n >= 0 ? expo(t, cues[n], cues[n] + 0.5) : 0, geo = (i: number) => ({ y: 320 + i * 124, w: tw(TAKE[i], 56) + 76 });
  const pl = n > 0 ? { y: mix(geo(n - 1).y, geo(n).y, ak), w: mix(geo(n - 1).w, geo(n).w, ak), o: 1 } : n === 0 ? { y: geo(0).y, w: mix(80, geo(0).w, ak), o: u(ak, 0, 0.3) } : null;
  const outB = 1 - io(t, tQ - 0.1, tQ + 0.15), q = io(t, tQ, tQ + 0.6), bIn = expo(t, c + 0.2, c + 0.9), pt = n >= 0 ? io(t, cues[n] - 0.1, cues[n] + 0.15) * (1 - io(t, cues[n] + 1.0, cues[n] + 1.4)) : 0;
  const cq = at(26, '你招'), hop = Math.sin(u(t, cq - 0.1, cq + 0.5) * Math.PI), bx = mix(1400, 1660, q), by = mix(600, 400, q) + (1 - bIn) * 500 - hop * 60, bs = mix(290, 220, q);
  return <>
    {outB > 0 && <div style={abs(0, 0, { width: 1920, height: 1080, opacity: outB, transform: `translateY(${-(1 - outB) * 30}px)` })}>
      <div style={abs(150, 200, { ...BLACKPILL(28), ...rise(t, c + 0.15, { dy: 20 }) })}>当组长，练这几样</div>
      {pl && <div style={abs(150, pl.y, { width: pl.w, height: 94, borderRadius: 47, background: INK, opacity: pl.o, boxShadow: '0 14px 30px rgba(14,14,16,.22)' })} />}
      {TAKE.map((s, i) => { const a = n === i ? ak : n - 1 === i ? 1 - ak : 0; return <span key={i} style={abs(188, 320 + i * 124 + 18, { ...mi(56, lerpC(INK, WHITE, a), 600), ...rise(t, cues[i], { dy: 30, s0: 1 }) })}>{s}</span>; })}
    </div>}
    {ROLES.map((_, i) => { const ang = -2.5 + i * 0.47, x0 = 1400 + Math.cos(ang) * 400 - 95, y0 = 560 + Math.sin(ang) * 300 - 75, x1 = 250 + i * 290, y1 = 690, t0 = c + 0.35 + i * 0.1; if (t < t0) return null;
      return roleCard(t, i, mix(x0, x1, q), mix(y0, y1, q) + Math.sin(t * 1.6 + i) * 6 * (1 - q), mix(190, 260, q), mix(150, 205, q), `${RING}0 16px 36px rgba(30,40,80,.18)`, { ...rise(t, t0, { dy: 40, s0: 0.8 }) }); })}
    <Buddy t={t} x={bx} y={by} size={bs} tint="violet" mood={t > tQ ? (t > cq ? 'happy' : 'think') : n === 2 ? 'side' : 'happy'} talk={talkAt(t)} look={[t > tQ ? -0.5 : -0.7, t > tQ ? 0.3 : -0.1]} armL={22 + pt * 78 + (t > cq ? 50 : 0)} armR={22 + (t > tQ && t < cq ? 128 : t > cq ? 50 : 0)} foot={(1 - bIn) + hop} sy={1 + hop * 0.06} rot={t > tQ && t < cq ? -6 : 0} />
    {nameTag(bx, by + bs * 0.62, 24, { opacity: bIn })}
    <div style={abs(0, 250, { width: 1500, textAlign: 'center' })}><Reveal t={t} t0={at(26, '要是') - 0.1} text="要是只能先招一个" style={mi(80, MID, 600)} /></div>
    <div style={abs(0, 370, { width: 1500, textAlign: 'center' })}><Reveal t={t} t0={cq - 0.15} text="你招哪个？" style={mi(190)} stagger={0.06} /></div>
    <div style={abs(0, 916, { width: 1920, textAlign: 'center', ...mono(20, MID), opacity: u(t, LE[26] + 0.3, LE[26] + 0.8) })}>出处：Google、Arena、Grok Bot、fal、MiniMax 的官方帖和官方演示 · 招聘会、组长的说法是我的</div>
  </>;
}

function Subs({ t }: { t: number }) {
  const s = SUBS.find((x) => t >= x.s && t < x.e);
  if (!s) return null;
  return <div style={abs(0, 962, { width: 1920, textAlign: 'center', ...mi(44, INK, 600), opacity: u(t, s.s, s.s + 0.1), transform: `translateY(${(1 - expo(t, s.s, s.s + 0.3)) * 10}px)`, textShadow: '0 0 16px rgba(255,255,255,.95), 0 0 4px rgba(255,255,255,.9)' })}>{s.text}</div>;
}
const SFX: [number, string, number][] = [
  ...C.slice(0, 5).map((c): [number, string, number] => [c - 0.38, 'whoosh-short', 0.2]), ...C.slice(0, 5).map((c): [number, string, number] => [c + 0.86, 'pop', 0.09]), [C[5] - 0.4, 'slide', 0.14],
  [at(1, '你当组长') - 0.1, 'pop', 0.14], [LS[26] - 0.3, 'slide', 0.12],
];

export function Film4() {
  const { fps, width } = useVideoConfig(), t = useCurrentFrame() / fps;
  return <AbsoluteFill style={{ background: PAGE }}>
    <Fonts />
    <div style={{ position: 'absolute', width: 1920, height: 1080, transform: `scale(${width / 1920})`, transformOrigin: '0 0', overflow: 'hidden' }}>
      <div style={abs(76, 60, { display: 'flex', alignItems: 'center', gap: 16, zIndex: 5 })}><div style={{ width: 16, height: 16, borderRadius: 8, background: INK }} /><span style={mi(30, INK, 600)}>同一天，五个新同事</span><span style={mi(27, MID, 500)}>· 2026 年 11 月 11 日（美国时间）</span></div>
      {t < C[0] + 0.1 && <Intro t={t} />}
      {SECS.map((S, i) => t >= S.c - 0.45 && t < S.end + 0.08 ? <Section key={i} t={t} S={S} /> : null)}
      {t >= C[5] - 0.45 && <Outro t={t} />}
      <Subs t={t} />
    </div>
    <Audio src={staticFile('hot2/voice.wav')} />
    <Audio src={staticFile('hot2/music.wav')} volume={(f) => musicGain(f / 30)} />
    {SFX.map(([s, n, v], i) => <Sequence key={i} from={Math.max(0, Math.round(s * fps))} durationInFrames={Math.round(fps * 2)}><Audio src={staticFile(`sfx/${n}.wav`)} volume={v} /></Sequence>)}
  </AbsoluteFill>;
}
export const FILM4_FRAMES = Math.round(END * 30);
