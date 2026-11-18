// 可以换着用的段落版式（2026-11-12）。
// 来历：用户发来一段别人总结的做法（"以模块化组件替代固定模板"），问"有在这么做吗"。我答：小零件是共用的，但整条片子的骨架是照上一期整份复制，
// 每段都是"左边大卡 + 右边一栏"。用户："两件都做，先出静帧"；看完静帧："可以，做小样"。
// 这里每个版式是一个独立的零件，按这一段的内容挑着用：
//   Versus     两样东西并排比（两张官方图 + 各自一个数）
//   BigNumber  一个数当主角，旁边放它的出处（官方图上那一处，黄线划出来）
//   Steps      一步一步（流程或时间线），Aha 沿着底下那条线走
//   Wide       一张很宽的官方图，通栏，黑框在图上挨个框出正在讲的那一块，Aha 坐在卡片上沿
// 原来的"大卡 + 右栏"（Film4.tsx 的 Section）留着，放 16:9 的官方演示视频最合适。
// 画面规矩照旧：白底黑字、颜色只来自这一段的云彩底色、不往真画面上压字、下沿不过 y=940、底部是字幕。
// 所有时间都是成片里的秒数；"一开始就在场"的东西，把它的时间填成比这一段开始还早。
import React from 'react';
import { Img, staticFile } from 'remotion';
import { RING, INK, MID, WARN, WHITE, abs, clamp, expo, inout, io, mi, mix, mono, rise, tex, u } from './fx';
import { Buddy, Mood } from './Buddy';

const HL = '#FFD21F';
export const BLACKPILL = (size = 28, bg = INK): React.CSSProperties => ({ ...mi(size, WHITE, 600), background: bg, borderRadius: size, padding: `${Math.round(size * 0.4)}px ${Math.round(size * 0.8)}px ${Math.round(size * 0.47)}px` });

// ── 小工具 ─────────────────────────────────────────────────────────────
export const pulse = (t: number, a: number, b: number, d = 0.22) => io(t, a, a + d) * (1 - io(t, b - d, b));
// 眼睛看哪：[第几秒起, x, y]，挨个平滑过去
export const keyLook = (t: number, keys: [number, number, number][], d = 0.35): [number, number] => { let x = keys[0][1], y = keys[0][2]; keys.forEach(([a, kx, ky]) => { const k = io(t, a, a + d); x = mix(x, kx, k); y = mix(y, ky, k); }); return [x, y]; };
// 表情：[第几秒起, 表情]，换的时候眨一下眼
export const keyMood = (t: number, keys: [number, Mood][]) => { let n = 0; keys.forEach((k, i) => { if (t >= k[0]) n = i; }); return { mood: keys[n][1], prev: n > 0 ? keys[n - 1][1] : undefined, mk: n > 0 ? u(t, keys[n][0], keys[n][0] + 0.22) : 1 }; };
// 嘴：配音念到每个中文字张一下；英文词整个当一段，每 0.19 秒张一下（按字母张会抖）
export const makeTalk = (VO: [string, number, number][][]) => {
  const SP: [number, number, boolean][] = [];
  VO.forEach((line) => line.forEach(([ch, a, b]) => { const lat = /[A-Za-z0-9]/.test(ch), last = SP[SP.length - 1]; if (lat && last && last[2] && a - last[1] < 0.03) last[1] = b; else SP.push([a, b, lat]); }));
  return (t: number) => { for (const [a, b, lat] of SP) { if (t >= a && t < b) return 0.3 + 0.7 * Math.abs(Math.sin(((t - a) / (lat ? 0.19 : Math.max(0.01, b - a))) * Math.PI)); if (a > t) return a - t < 0.06 ? 0.3 : 0; } return 0; };
};

// 官方图上取哪一处：z 放大倍数，cx/cy 对准图上的位置（0 到 1），marks = 要用黄线划出来的字 [左, 右, 字的下沿]
export type Crop = { img: string; iw: number; ih: number; z?: number; cx?: number; cy?: number; marks?: [number, number, number][] };
const cropEl = (c: Crop, w: number, h: number, mk = 1) => {
  const z = c.z ?? 1, cx = c.cx ?? 0.5, cy = c.cy ?? 0.5, W = w * z, H = (W * c.ih) / c.iw, L = w / 2 - cx * W, T = h / 2 - cy * H;
  return <>
    <Img src={staticFile(c.img)} style={abs(L, T, { width: W, height: H })} />
    {(c.marks || []).map(([a, b, y], i) => <div key={i} style={abs(L + a * W, T + y * H, { width: (b - a) * W * clamp(mk), height: Math.max(7, W * 0.007), borderRadius: 4, background: HL })} />)}
  </>;
};
// cover：先用这一段的颜色盖着，k 从 0 到 1 时颜色收成一个点露出图（和换段时"颜色收进 Aha 身体"是同一个动作）
export function Shot({ t = 0, x, y, w, h, c, r = 30, glow = 'rgba(30,40,80,.17)', mk = 1, cover, style = {} }: { t?: number; x: number; y: number; w: number; h: number; c: Crop; r?: number; glow?: string; mk?: number; cover?: { tint: string; k: number; to: [number, number] }; style?: React.CSSProperties }) {
  return <div style={abs(x, y, { width: w, height: h, borderRadius: r, overflow: 'hidden', background: WHITE, boxShadow: `${RING}0 28px 64px ${glow}, 0 4px 12px rgba(30,40,80,.10)`, ...style })}>
    {cropEl(c, w, h, mk)}
    {cover && cover.k < 1 && <div style={abs(0, 0, { width: w, height: h, ...tex(cover.tint, t), clipPath: `circle(${mix(Math.hypot(w, h), 0, cover.k)}px at ${cover.to[0]}px ${cover.to[1]}px)` })} />}
  </div>;
}

// 左上角那一行：片名后面跟"第几个 / 共几个 + 这一段叫什么 + 谁家的"。所有版式都放在这同一个位置
export function Head({ title, num, total, role, who }: { title: string; num: string; total: string; role: string; who: string }) {
  return <div style={abs(76, 60, { display: 'flex', alignItems: 'center', gap: 16, zIndex: 5 })}>
    <div style={{ width: 16, height: 16, borderRadius: 8, background: INK }} /><span style={mi(30, INK, 600)}>{title}</span>
    <span style={{ ...mono(21, WHITE), background: INK, borderRadius: 20, padding: '8px 15px 9px', marginLeft: 10 }}>{num} / {total}</span>
    <span style={mi(30, INK, 600)}>{role}</span><span style={mi(27, MID, 500)}>· {who}</span>
  </div>;
}
export const Sub = ({ text, k = 1 }: { text: string; k?: number }) => <div style={abs(0, 962, { width: 1920, textAlign: 'center', ...mi(44, INK, 600), opacity: clamp(k), textShadow: '0 0 16px rgba(255,255,255,.95), 0 0 4px rgba(255,255,255,.9)' })}>{text}</div>;
const Src = ({ x, y, w, align = 'left', children }: { x: number; y: number; w?: number; align?: 'left' | 'right' | 'center'; children: React.ReactNode }) => <div style={abs(x, y, { width: w, textAlign: align, ...mono(19, MID) })}>{children}</div>;

const popIn = (t: number, t0: number): React.CSSProperties => (t < t0 ? { opacity: 0 } : { opacity: u(t, t0, t0 + 0.12), transform: `scale(${mix(0.6, 1, expo(t, t0, t0 + 0.4))})` });
// Aha + 名字牌。ctl 是这一刻它的样子（表情、看哪、两只手、歪头），由用版式的人按配音排
export type AhaCtl = { mood?: Mood; prev?: Mood; mk?: number; look?: [number, number]; armL?: number; armR?: number; rot?: number; dy?: number };
// 一段之内换版式（2026-11-13）：上一个版式的 Aha 到 hideAt 就不画了，下一个版式的 Aha 从它原来站的地方（from）跳到新位置，中间不断
export type AhaFrom = { x: number; y: number; size: number; at: number };
// Aha 旁边的小牌子（我猜 / 据报道 / 官方说）；warn = 用红色
export type Tag = { text: string; at: number; warn?: boolean; out?: number };   // out = 到点收起：牌子只管它那半句，别罩到下一句事实（2026-11-13 审片）
const tagPill = (t: number, tag: Tag | undefined, x: number, y: number, w = 300, align: 'center' | 'flex-start' | 'flex-end' = 'center') => {
  if (!tag || t < tag.at || (tag.out !== undefined && t >= tag.out)) return null;
  const p = popIn(t, tag.at), o = tag.out !== undefined ? 1 - u(t, tag.out - 0.15, tag.out) : 1;
  return <div style={abs(x, y, { width: w, display: 'flex', justifyContent: align, ...p, opacity: (p.opacity as number) * o })}><span style={BLACKPILL(26, tag.warn ? WARN : INK)}>{tag.text}</span></div>;
};
export function Aha({ t, x: x1, y: y1, size: s1, tint, ctl = {}, talk = 0, tag = 'below', from, hideAt }: { t: number; x: number; y: number; size: number; tint: string; ctl?: AhaCtl; talk?: number; tag?: 'below' | 'left'; from?: AhaFrom; hideAt?: number }) {
  if (hideAt !== undefined && t >= hideAt) return null;
  const k = from ? inout(t, from.at, from.at + 0.6) : 1, x = from ? mix(from.x, x1, k) : x1, y = from ? mix(from.y, y1, k) : y1, size = from ? mix(from.size, s1, k) : s1;
  const jump = from ? Math.sin(k * Math.PI) * 70 : 0, yy = y + (ctl.dy ?? 0) - jump;
  return <>
    <Buddy t={t} x={x} y={yy} size={size} tint={tint} mood={ctl.mood ?? 'calm'} prev={ctl.prev} mk={ctl.mk ?? 1} look={ctl.look ?? [0, 0]} armL={ctl.armL ?? 22} armR={ctl.armR ?? 22} rot={ctl.rot ?? 0} talk={talk} />
    {tag === 'below' ? <div style={abs(x - 100, y - jump + size * 0.6, { width: 200, display: 'flex', justifyContent: 'center' })}><span style={BLACKPILL(22)}>Aha</span></div>
      : <div style={abs(x - size * 0.6 - 200, y - 6, { width: 200, display: 'flex', justifyContent: 'flex-end' })}><span style={BLACKPILL(22)}>Aha</span></div>}
  </>;
}

// ══ 版式一：两样并排比 ═══════════════════════════════════════════════════════
// 两张卡一开始都在；还没讲到的那张先用颜色盖着（cover = 揭开的时刻），讲到了颜色收走露出图。名字、数、比方的小牌子各等到嘴上说到才出来。
export type Side = { crop: Crop; cover?: number; name: string; nameAt: number; pill?: string; pillBg?: string; pillAt?: number; num: string; unit: string; per?: string; numAt: number; src: string };
export function Versus({ t, tint, glow, L, R, tag, aha, talk = 0 }: { t: number; tint: string; glow: string; L: Side; R: Side; tag?: { text: string; at: number }; aha?: AhaCtl; talk?: number }) {
  const W = 804, H = 440;
  const block = (S: Side, x: number, right: boolean) => <>
    <div style={abs(x, 652, { width: 684, display: 'flex', justifyContent: right ? 'flex-end' : 'flex-start', alignItems: 'center', gap: 16 })}>
      {/* 小牌子放在靠外的一头，这样它出来之前名字也和下面的数对齐 */}
      {right && S.pill && <span style={{ ...BLACKPILL(26, S.pillBg || INK), ...popIn(t, S.pillAt ?? 0) }}>{S.pill}</span>}
      <span style={{ ...mi(32, INK, 600), ...rise(t, S.nameAt, { dy: 16, s0: 1 }) }}>{S.name}</span>
      {S.per && <span style={{ ...mi(32, MID, 500), marginLeft: -6, opacity: u(t, S.numAt, S.numAt + 0.25) }}>· {S.per}</span>}
      {!right && S.pill && <span style={{ ...BLACKPILL(26, S.pillBg || INK), ...popIn(t, S.pillAt ?? 0) }}>{S.pill}</span>}
    </div>
    <div style={abs(x, 716, { width: 684, display: 'flex', justifyContent: right ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 16, ...rise(t, S.numAt, { dy: 36, s0: 0.92 }) })}><span style={mi(150, INK)}>{S.num}</span><span style={{ ...mi(56, INK, 600), marginBottom: 16 }}>{S.unit}</span></div>
  </>;
  const cov = (S: Side, to: [number, number]) => (S.cover === undefined ? undefined : { tint, k: inout(t, S.cover, S.cover + 0.75), to });
  const shown = (S: Side) => (S.cover === undefined ? 1 : u(t, S.cover + 0.5, S.cover + 0.8));
  return <>
    <Shot t={t} x={96} y={150} w={W} h={H} c={L.crop} glow={glow} mk={expo(t, L.numAt + 0.2, L.numAt + 0.8)} cover={cov(L, [W, H])} />
    <Shot t={t} x={1020} y={150} w={W} h={H} c={R.crop} glow={glow} mk={expo(t, R.numAt + 0.2, R.numAt + 0.8)} cover={cov(R, [0, H])} />
    <div style={{ opacity: shown(L) }}><Src x={100} y={606}>{L.src}</Src></div>
    <div style={{ opacity: shown(R) }}><Src x={1020} y={606} w={W - 4} align="right">{R.src}</Src></div>
    {block(L, 96, true)}{block(R, 1140, false)}
    {tag && <div style={abs(810, 598, { width: 300, display: 'flex', justifyContent: 'center', ...popIn(t, tag.at) })}><span style={BLACKPILL(24)}>{tag.text}</span></div>}
    <Aha t={t} x={960} y={778} size={205} tint={tint} ctl={aha} talk={talk} />
  </>;
}

// ══ 版式二：一个数当主角 ═════════════════════════════════════════════════════
// 这个版式在数出口前一秒以内再进场，别让左边空着等。右边是这个数在官方图上的出处，Aha 站在下面抬手指着它。
// enter：从同一段的另一个版式换过来时，名字和出处卡在这一刻浮上来（不填就是一开始就在）。proofNode：没有官方图可放时，自己排一张"出处卡"（只放字和数）。
// tag：Aha 旁边的小牌子。note：出处下面再补一行。ahaFrom：Aha 从上一个版式的位置跳过来。
export function BigNumber({ t, tint, glow, pill, pillBg, name, num, unit, cap, src, proof, proofNode, proofSrc, numAt, aha, talk = 0, enter, tag, note, ahaFrom }: { t: number; tint: string; glow: string; pill?: string; pillBg?: string; name: string; num: string; unit: string; cap: string; src: string; proof?: Crop; proofNode?: React.ReactNode; proofSrc: string; numAt: number; aha?: AhaCtl; talk?: number; enter?: number; tag?: Tag; note?: { text: string; at: number }; ahaFrom?: AhaFrom }) {
  const en = (d = 0): React.CSSProperties => (enter === undefined ? {} : rise(t, enter + d, { dy: 40, s0: 0.96 }));
  return <>
    <div style={abs(100, 176, { display: 'flex', alignItems: 'center', gap: 18, ...en(0.24) })}>{pill && <span style={BLACKPILL(30, pillBg || INK)}>{pill}</span>}<span style={mi(38, INK, 600)}>{name}</span></div>
    <div style={abs(84, 262, { display: 'flex', alignItems: 'flex-end', gap: 26, ...rise(t, numAt, { dy: 60, s0: 0.9, d: 0.7 }) })}><span style={mi(360, INK)}>{num}</span><span style={{ ...mi(100, INK, 600), marginBottom: 44 }}>{unit}</span></div>
    <div style={abs(100, 690, { ...mi(64, INK, 600), ...rise(t, numAt + 0.35, { dy: 20, s0: 1 }) })}>{cap}</div>
    <div style={rise(t, numAt + 0.6, { dy: 10, s0: 1 })}><Src x={104} y={786}>{src}</Src></div>
    {note && <div style={abs(100, 836, { ...mi(38, INK, 600), ...rise(t, note.at, { dy: 16, s0: 1 }) })}>{note.text}</div>}
    <div style={en(0.4)}>
      {proof ? <Shot t={t} x={1130} y={170} w={694} h={420} c={proof} glow={glow} mk={expo(t, numAt + 0.35, numAt + 0.95)} />
        : <div style={abs(1130, 170, { width: 694, height: 420, borderRadius: 30, overflow: 'hidden', background: WHITE, boxShadow: `${RING}0 28px 64px ${glow}, 0 4px 12px rgba(30,40,80,.10)` })}>{proofNode}</div>}
      <Src x={1134} y={608}>{proofSrc}</Src>
    </div>
    {tagPill(t, tag, 1626, 716, 260, 'flex-start')}
    <Aha t={t} x={1500} y={768} size={220} tint={tint} ctl={aha} talk={talk} from={ahaFrom} />
  </>;
}

// ══ 版式三：一步一步（流程 / 时间线）═══════════════════════════════════════════
// 几张卡一开始都在。at = 讲到这一步的时刻（不一定从左到右，Aha 按讲的先后走过去）；hi = 这张卡抬起来的时刻，不填就是 at。
export type Step = { crop?: Crop; big: string; small: string; at: number; hi?: number };
// aha：盖在它自己那套动作上（比如还没讲到第一步时让它先站着）。tag：Aha 旁边的小牌子。ahaHide：同一段换到下一个版式时，Aha 到点不画。最后一张卡带 crop 时，上半是图、下半是这一段的颜色。
export function Steps({ t, tint, glow, steps, src, talk = 0, aha, tag, ahaHide }: { t: number; tint: string; glow: string; steps: Step[]; src: string; talk?: number; aha?: AhaCtl; tag?: Tag; ahaHide?: number }) {
  const n = steps.length, W = 520, GAP = (1728 - n * W) / (n - 1), X = (i: number) => 96 + i * (W + GAP), CX = (i: number) => X(i) + W / 2, TY = 862;
  const order = steps.map((s, i) => i).sort((a, b) => steps[a].at - steps[b].at);
  let c = 0; order.forEach((i, j) => { if (t >= steps[i].at) c = j; });
  const cur = order[c], prev = c ? order[c - 1] : cur, k = c ? inout(t, steps[cur].at, steps[cur].at + 0.75) : 1, ax = mix(CX(prev), CX(cur), k), dir = Math.sign(CX(cur) - CX(prev));
  const seen = order.slice(0, c).map(CX).concat([ax]), lo = Math.min(...seen), hi = Math.max(...seen), moving = c ? Math.sin(k * Math.PI) : 0;
  const lift = (i: number) => { const a = steps[i].hi ?? steps[i].at, j = order.indexOf(i), nx = j + 1 < n ? steps[order[j + 1]].at : 1e9; return io(t, a, a + 0.3) * (1 - io(t, nx, nx + 0.3)); };
  const h0 = steps[cur].hi ?? -9, hop = Math.abs(Math.sin(k * Math.PI * 2)) * 22 * (c ? 1 : 0) + Math.sin(u(t, h0, h0 + 0.45) * Math.PI) * 26;
  return <>
    {steps.map((s, i) => { const last = i === n - 1, up = lift(i);
      return <div key={i} style={abs(X(i), 160 - up * 14, { width: W, height: 476, borderRadius: 30, overflow: 'hidden', ...(last && !s.crop ? { ...tex(tint, t), boxShadow: `0 ${28 + up * 14}px ${64 + up * 20}px ${glow}` } : { background: WHITE, boxShadow: `${RING}0 ${28 + up * 14}px ${64 + up * 20}px ${glow}, 0 4px 12px rgba(30,40,80,.10)` }) })}>
        {s.crop && <div style={abs(0, 0, { width: W, height: 292, overflow: 'hidden' })}>{cropEl(s.crop, W, 292)}</div>}
        {last && s.crop ? <>
          <span style={abs(30, 318, mono(22, MID))}>{String(i + 1).padStart(2, '0')}</span>
          <span style={abs(28, 344, mi(78, INK))}>{s.big}</span><span style={abs(30, 428, mi(30, MID, 500))}>{s.small}</span>
          <div style={abs(0, 292, { width: W, height: 184, opacity: io(t, s.at, s.at + 0.3) })}>
            <div style={abs(0, 0, { width: W, height: 184, ...tex(tint, t) })} />
            <span style={abs(30, 26, mono(22, WHITE))}>{String(i + 1).padStart(2, '0')}</span>
            <span style={abs(28, 52, { ...mi(78, WHITE), textShadow: '0 6px 20px rgba(0,0,40,.2)' })}>{s.big}</span><span style={abs(30, 136, { ...mi(30, WHITE, 600), textShadow: '0 2px 10px rgba(0,50,30,.5)' })}>{s.small}</span>
          </div>
        </> : last ? <>
          <span style={abs(32, 36, mono(24, WHITE))}>{String(i + 1).padStart(2, '0')}</span>
          <span style={abs(28, 150, { ...mi(150, WHITE), textShadow: '0 10px 30px rgba(0,0,40,.2)' })}>{s.big}</span><span style={abs(34, 330, mi(42, WHITE, 600))}>{s.small}</span>
        </> : <>
          <span style={abs(30, 318, mono(22, MID))}>{String(i + 1).padStart(2, '0')}</span>
          <span style={abs(28, 344, mi(78, INK))}>{s.big}</span><span style={abs(30, 428, mi(30, MID, 500))}>{s.small}</span>
        </>}
      </div>; })}
    {steps.slice(1).map((_, i) => <svg key={i} width={60} height={40} viewBox="0 0 60 40" style={abs(X(i) + W + GAP / 2 - 30, 378)}><path d="M4 20 H52 M36 6 L52 20 L36 34" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" /></svg>)}
    {/* 底下那条线：走过的涂黑，Aha 站在正在讲的那一步 */}
    <div style={abs(CX(0), TY - 3, { width: CX(n - 1) - CX(0), height: 6, borderRadius: 3, background: '#D5D9E4' })} />
    <div style={abs(lo, TY - 3, { width: hi - lo, height: 6, borderRadius: 3, background: INK })} />
    {steps.map((_, i) => { const on = CX(i) >= lo - 1 && CX(i) <= hi + 1; return <div key={i} style={abs(CX(i) - 11, TY - 11, { width: 22, height: 22, borderRadius: 11, boxSizing: 'border-box', background: on ? INK : WHITE, border: `5px solid ${on ? INK : '#B9BFCE'}` })} />; })}
    <Src x={96} y={918}>{src}</Src>
    {tagPill(t, tag, ax + 104, TY - 150, 260, 'flex-start')}
    <Aha t={t} x={ax} y={TY - 104} size={184} tint={tint} talk={talk} hideAt={ahaHide} ctl={{ mood: moving > 0.2 ? 'happy' : 'wow', look: [dir * moving * 0.8, -0.7 * (1 - moving)], armL: 22 + 110 * (1 - moving) + 30 * moving, armR: 22 + 110 * (1 - moving) + 30 * moving, rot: dir * moving * 7, dy: -hop, ...aha }} />
  </>;
}

// ══ 版式四：一张很宽的官方图，通栏 ════════════════════════════════════════════
// 图整张一直在；黑框在图上挨个框出正在讲的那一块（box 是图上的位置，0 到 1）。Aha 坐在卡片上沿，只在图上那一角是空白的时候这么放。
export type Frame = { at: number; box: [number, number, number, number] };
export function Wide({ t, tint, glow, crop, frames = [], src, aha, talk = 0, tag }: { t: number; tint: string; glow: string; crop: Crop; frames?: Frame[]; src: string; aha?: AhaCtl; talk?: number; tag?: Tag }) {
  const X = 96, Y = 196, W = 1728, H = 708, AX = 1668, AY = 110, PAD = 10;
  let n = -1; frames.forEach((f, i) => { if (t >= f.at) n = i; });
  const px = (b: [number, number, number, number]) => [X + b[0] * W - PAD, Y + b[1] * H - PAD, (b[2] - b[0]) * W + PAD * 2, (b[3] - b[1]) * H + PAD * 2];
  let g: number[] | null = null, hop = 0;
  if (n >= 0) { const b = px(frames[n].box), a = n ? px(frames[n - 1].box) : b, k = expo(t, frames[n].at, frames[n].at + 0.45); g = b.map((v, i) => mix(a[i], v, k)); hop = Math.sin(u(t, frames[n].at, frames[n].at + 0.4) * Math.PI); }
  const look: [number, number] = g ? [clamp((g[0] + g[2] / 2 - AX) / 900, -1, 1), clamp((g[1] + g[3] / 2 - AY) / 500, 0.2, 1)] : [-0.5, 0.6];
  return <>
    <Shot t={t} x={X} y={Y} w={W} h={H} c={crop} r={34} glow={glow} />
    {g && <div style={abs(g[0], g[1], { width: g[2], height: g[3], borderRadius: 22, boxSizing: 'border-box', border: `5px solid ${INK}`, boxShadow: '0 10px 24px rgba(14,14,16,.16)', opacity: u(t, frames[0].at, frames[0].at + 0.18) })} />}
    <Src x={100} y={916}>{src}</Src>
    {tagPill(t, tag, AX - 106 - 110 - 320, AY - 8, 300, 'flex-end')}
    <Aha t={t} x={AX} y={AY} size={176} tint={tint} talk={talk} tag="left" ctl={{ look, armL: 22 + 40 + hop * 30, dy: -hop * 10, ...aha }} />
  </>;
}
