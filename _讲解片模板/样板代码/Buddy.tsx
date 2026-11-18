// IP 形象小样（2026-11-12）。用户原话："你去看看muse dot grokbot的IP形象"。
// 看到的共同点：不是人，是一个极简的小团子加两只眼睛，靠眼神、挤压和变形说话（Meta 的 Jolly 是奶白毛绒团子，
// OpenAI 的 Dots 是彩色毛绒小形状加一件配饰，xAI 的 Grok Bot 是纯色小形状加两只斜眼睛、完全用代码做、各种状态之间平滑变形）。
// 我们自己的做法（不照搬它们的长相）：身体用片子里已经有的"会流动的柔和云彩色"，颜色跟着当前这一段变；黑色圆眼睛带高光；
// 没有手，身边跟着一颗黑色小胶囊当"教鞭"，飞到清单上就变成那条黑色胶囊。
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { CARD, Fonts, INK, MID, PAGE, WHITE, abs, clamp, expo, inout, io, mi, mix, mono, tex, tw, u } from './fx';

export type Mood = 'calm' | 'happy' | 'wow' | 'side' | 'think';
const GLOW: Record<string, string> = { violet: 'rgba(110,80,230,.38)', coral: 'rgba(240,90,60,.36)', teal: 'rgba(10,140,160,.36)', gold: 'rgba(240,150,40,.38)', green: 'rgba(30,160,100,.36)' };

function Eye({ mood, side, close, look }: { mood: Mood; side: number; close: number; look: [number, number] }) {
  const cx = side * 27 + look[0] * 10, cy = -2 + look[1] * 9, o = 1 - close;
  if (mood === 'happy') return <path d={`M ${cx - 13} ${cy + 6} Q ${cx} ${cy - 18 * o - 2} ${cx + 13} ${cy + 6}`} fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" />;
  if (mood === 'side') return <><path d={`M ${cx - 12} ${cy - 3} L ${cx + 12} ${cy - 3} A 12 ${Math.max(1, 15 * o)} 0 0 1 ${cx - 12} ${cy - 3} Z`} fill={INK} /><circle cx={cx + 5} cy={cy + 2} r={2.6} fill={WHITE} opacity={o} /></>;
  const rx = mood === 'wow' ? 14 : mood === 'think' ? 9.5 : 11.5, ry = (mood === 'wow' ? 14.5 : mood === 'think' ? 10.5 : 12.5) * o;
  return <>
    <ellipse cx={cx} cy={cy} rx={rx} ry={Math.max(1.2, ry)} fill={INK} />
    <circle cx={cx + 3.5} cy={cy - ry * 0.4} r={mood === 'wow' ? 4.2 : 3.2} fill={WHITE} opacity={o * o} />
    {mood === 'think' && side > 0 && <path d={`M ${cx - 12} ${cy - 24} L ${cx + 12} ${cy - 30}`} stroke={INK} strokeWidth={5} strokeLinecap="round" />}
  </>;
}

// 嘴（用户 2026-11-12："IP形象 缺少说话的嘴"）。talk 是 0 到 1 的张嘴程度，跟着配音的每个字开合；不说话时按表情摆嘴形
function Mouth({ mood, talk, look }: { mood: Mood; talk: number; look: [number, number] }) {
  const cx = look[0] * 7, cy = 24 + look[1] * 6, o = clamp(talk), st = { fill: 'none', stroke: INK, strokeWidth: 5.5, strokeLinecap: 'round' as const };
  if (o > 0.08) return <ellipse cx={cx} cy={cy + 2} rx={9 - o * 1.5} ry={2.5 + o * (mood === 'wow' ? 11 : 8)} fill={INK} />;
  if (mood === 'happy') return <path d={`M ${cx - 11} ${cy - 1} Q ${cx} ${cy + 12} ${cx + 11} ${cy - 1}`} {...st} />;
  if (mood === 'wow') return <ellipse cx={cx} cy={cy + 3} rx={6} ry={7.5} fill={INK} />;
  if (mood === 'side') return <path d={`M ${cx - 9} ${cy + 4} L ${cx + 9} ${cy}`} {...st} />;
  if (mood === 'think') return <path d={`M ${cx - 2} ${cy + 3} Q ${cx + 5} ${cy - 1} ${cx + 11} ${cy + 3}`} {...st} />;
  return <path d={`M ${cx - 8} ${cy} Q ${cx} ${cy + 7} ${cx + 8} ${cy}`} {...st} />;
}

// 小团子本体（名字：Aha，用户 2026-11-12 定的）。x、y 是身体中心；sx、sy 是横竖方向的挤压；mk 是从上一个表情换到这个表情的进度（换的时候先眨一下眼）
export function Buddy({ t, x, y, size, tint, tint2, tk = 0, mood, prev, mk = 1, look = [0, 0], sx = 1, sy = 1, rot = 0, seed = 0, armL = 22, armR = 22, foot = 0, talk = 0 }: { t: number; x: number; y: number; size: number; tint: string; tint2?: string; tk?: number; mood: Mood; prev?: Mood; mk?: number; look?: [number, number]; sx?: number; sy?: number; rot?: number; seed?: number; armL?: number; armR?: number; foot?: number; talk?: number }) {
  const breathe = Math.sin(t * 2.2 + seed) * 0.012, w = size * 0.86 * (sx - breathe), h = size * 0.98 * (sy + breathe);
  const bt = (t + seed * 1.7) % 3.4, blink = bt > 3.22 ? Math.sin(((bt - 3.22) / 0.18) * Math.PI) : 0, swap = 1 - Math.abs(2 * clamp(mk) - 1);
  const close = Math.max(blink, mk < 1 ? swap : 0), shown = mk < 0.5 && prev ? prev : mood;
  const body = (name: string): React.CSSProperties => ({ ...tex(name, t * 2.2 + seed), position: 'absolute', inset: 0, borderRadius: '50% 50% 40% 40% / 64% 64% 34% 34%', filter: 'saturate(1.45) contrast(1.06)' });
  // 用户 2026-11-12："缺少手脚"。短手短脚，和身体同一种颜色、稍深一点，画在身体后面
  const aw = size * 0.145, al = size * 0.31, fw = size * 0.25, fh = size * 0.14, ring = Math.max(1.5, size * 0.008);
  const limb = (key: string, left: number, top: number, lw: number, lh: number, deg: number, origin: string, rad: string) => <div key={key} style={abs(left, top, { width: lw, height: lh, transform: `rotate(${deg}deg)`, transformOrigin: origin })}>
    <div style={{ ...tex(tint, t * 2.2 + seed + 3), position: 'absolute', inset: 0, borderRadius: rad, filter: 'saturate(1.5) contrast(1.08) brightness(.86)' }} />
    {tint2 && tk > 0 && <div style={{ ...tex(tint2, t * 2.2 + seed + 3), position: 'absolute', inset: 0, borderRadius: rad, filter: 'saturate(1.5) contrast(1.08) brightness(.86)', opacity: tk }} />}
    <div style={{ position: 'absolute', inset: 0, borderRadius: rad, boxShadow: `inset 0 ${-size * 0.03}px ${size * 0.05}px rgba(20,10,80,.25), inset 0 ${size * 0.02}px ${size * 0.03}px rgba(255,255,255,.5), 0 0 0 ${ring}px rgba(20,30,60,.2)` }} />
  </div>;
  const shY = h * 0.5, wig = Math.sin(t * 2.2 + seed) * 1.5;
  return <div style={abs(x - w / 2, y - h / 2 + size * 0.46 * (1 - sy), { width: w, height: h, transform: `rotate(${rot}deg)`, transformOrigin: '50% 100%' })}>
    <div style={abs(w * 0.1, h * 1.02, { width: w * 0.8, height: size * 0.12, borderRadius: '50%', background: 'rgba(20,30,60,.16)', filter: `blur(${size * 0.04}px)` })} />
    {/* 头顶一撮小卷毛：我们自己的记号，会跟着晃 */}
    {limb('tuft', w * 0.5 - size * 0.03, -size * 0.12, size * 0.13, size * 0.22, 18 + Math.sin(t * 2.6 + seed) * 6 - (sy - 1) * 70, '50% 100%', '70% 70% 45% 45% / 80% 80% 30% 30%')}
    {limb('fl', w * 0.5 - w * 0.23 - fw / 2, h * 0.925 + foot * size * 0.06, fw, fh, -6 - foot * 14, '50% 0%', '50%')}
    {limb('fr', w * 0.5 + w * 0.23 - fw / 2, h * 0.925 + foot * size * 0.06, fw, fh, 6 + foot * 14, '50% 0%', '50%')}
    {limb('al', w * 0.5 - w * 0.4 - aw / 2, shY - aw / 2, aw, al, armL + wig, `50% ${aw / 2}px`, `${aw / 2}px`)}
    {limb('ar', w * 0.5 + w * 0.4 - aw / 2, shY - aw / 2, aw, al, -armR - wig, `50% ${aw / 2}px`, `${aw / 2}px`)}
    <div style={{ position: 'absolute', inset: 0, borderRadius: '50% 50% 40% 40% / 64% 64% 34% 34%', boxShadow: `0 ${size * 0.1}px ${size * 0.24}px ${GLOW[tk > 0.5 && tint2 ? tint2 : tint] || GLOW.violet}` }} />
    <div style={body(tint)} />
    {tint2 && tk > 0 && <div style={{ ...body(tint2), opacity: tk }} />}
    <div style={{ position: 'absolute', inset: 0, borderRadius: '50% 50% 40% 40% / 64% 64% 34% 34%', boxShadow: `inset 0 ${-size * 0.09}px ${size * 0.16}px rgba(20,10,80,.22), inset 0 ${size * 0.05}px ${size * 0.1}px rgba(255,255,255,.6), 0 0 0 ${Math.max(1.5, size * 0.008)}px rgba(20,30,60,.14)` }} />
    <svg viewBox="-100 -100 200 200" style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', overflow: 'visible' }}>
      <Eye mood={shown} side={-1} close={close} look={look} /><Eye mood={shown} side={1} close={close} look={look} /><Mouth mood={shown} talk={talk} look={look} />
    </svg>
  </div>;
}

// ── 小样：一段 12 秒的小片，看它怎么进场、看东西、指东西、换表情、换颜色 ────────────────────────
const ROWS = ['说一句，文档自己改', '修图也行', '像微信小程序'];
const MOODS: [number, Mood, string][] = [[0, 'calm', '平常'], [3.2, 'happy', '高兴'], [5.4, 'wow', '惊讶'], [7.6, 'side', '留个心眼'], [9.6, 'think', '在想'], [11.2, 'happy', '高兴']];
export function BuddyDemo() {
  const { fps, width } = useVideoConfig(), t = useCurrentFrame() / fps;
  let n = 0; MOODS.forEach((m, i) => { if (t >= m[0]) n = i; });
  const mood = MOODS[n][1], prev = n ? MOODS[n - 1][1] : undefined, mk = n ? u(t, MOODS[n][0], MOODS[n][0] + 0.22) : 1;
  // 进场：从下面跳上来，落地压一下
  const inK = expo(t, 0.2, 0.9), land = Math.sin(u(t, 0.75, 1.25) * Math.PI), hop2 = Math.sin(u(t, 11.2, 11.8) * Math.PI);
  const wow = Math.sin(u(t, 5.4, 5.9) * Math.PI), y = 560 + (1 - inK) * 520 - hop2 * 70 - wow * 26;
  const sy = 1 - land * 0.14 + wow * 0.12 + hop2 * 0.06, sx = 1 + land * 0.12 - wow * 0.08 - hop2 * 0.04;
  const lookX = mix(0, 0.9, io(t, 1.4, 1.9)) * (1 - io(t, 9.4, 9.9)) + (mood === 'side' ? 0.3 : 0), lookY = mood === 'think' ? -0.9 * io(t, 9.6, 10) : mix(0, -0.15, io(t, 1.4, 1.9));
  // 手：进场挥手 → 抬手一指（胶囊飞出去）→ 高兴时两手半举 → 惊讶时举过头 → 留个心眼时叉腰 → 想的时候一只手托着
  const wave = u(t, 0.9, 1.2) * (1 - u(t, 2.0, 2.3)), pt = io(t, 2.3, 2.6) * (1 - io(t, 3.0, 3.4)), hap = (mood === 'happy' ? io(t, MOODS[n][0], MOODS[n][0] + 0.3) : 0) * (1 - pt);
  const wowA = io(t, 5.4, 5.6) * (1 - io(t, 6.6, 7.0)), sideA = io(t, 7.6, 7.9) * (1 - io(t, 9.3, 9.6)), thA = io(t, 9.6, 10.0) * (1 - io(t, 11.1, 11.3));
  const armR = 22 + wave * (108 + Math.sin(t * 13) * 24) + pt * 72 + hap * (50 + Math.sin(t * 9) * 8) + wowA * 125 + sideA * 28 + thA * 128;
  const armL = 22 + hap * (50 + Math.sin(t * 9 + 1) * 8) + wowA * 125 + sideA * 28 - thA * 6;
  const foot = (1 - inK) + hop2 + wowA * 0.5;
  const rot = (mood === 'think' ? -7 * io(t, 9.6, 10.1) : 0) + (mood === 'side' ? 5 * io(t, 7.6, 8) * (1 - io(t, 9.4, 9.7)) : 0) + Math.sin(t * 1.3) * 1.2;
  const tk1 = io(t, 5.3, 6.1), tk2 = io(t, 9.5, 10.3), tint = tk2 > 0 ? 'coral' : 'violet', tint2 = tk2 > 0 ? 'teal' : 'coral', tk = tk2 > 0 ? tk2 : tk1;
  // 黑色小胶囊：先跟在身边，然后飞到清单上变成那条黑色胶囊
  const base = 300, step = 104, rowW = (i: number) => tw(ROWS[i], 46) + 68;
  const fly = expo(t, 2.5, 3.2), toR2 = expo(t, 5.0, 5.5), toR3 = expo(t, 7.3, 7.8), back = expo(t, 9.3, 9.9);
  const hx = 660 + Math.cos(t * 2.4) * 10, hy = y - 190 + Math.sin(t * 3.1) * 12;
  const ry = mix(mix(base, base + step, toR2), base + 2 * step, toR3), rw = mix(mix(rowW(0), rowW(1), toR2), rowW(2), toR3);
  const px = mix(mix(hx, 930, fly), hx, back), py = mix(mix(hy, ry, fly), hy, back), pw = mix(mix(56, rw, fly), 56, back), phh = mix(mix(24, 78, fly), 24, back), act = t < 5.0 ? 0 : t < 7.3 ? 1 : 2, on = fly * (1 - back);
  return <AbsoluteFill style={{ background: PAGE }}>
    <Fonts />
    <div style={{ position: 'absolute', width: 1920, height: 1080, transform: `scale(${width / 1920})`, transformOrigin: '0 0', overflow: 'hidden' }}>
      <div style={abs(76, 60, { display: 'flex', alignItems: 'center', gap: 16 })}><div style={{ width: 16, height: 16, borderRadius: 8, background: INK }} /><span style={mi(30, INK, 600)}>IP 形象小样</span><span style={mi(27, MID, 500)}>· 第 2 版：加了短手短脚 · 代码做的，没花钱</span></div>
      <div style={abs(900, 196, { ...mi(28, WHITE, 600), background: INK, borderRadius: 26, padding: '11px 22px 13px', opacity: u(t, 1.3, 1.7) })}>它来指给你看</div>
      {ROWS.map((r, i) => <React.Fragment key={i}>
        <span style={abs(880, base + i * step + 26, { ...mono(24, MID), opacity: u(t, 1.5 + i * 0.15, 1.9 + i * 0.15), left: 870 })}>{`0${i + 1}`}</span>
        <span style={abs(964, base + i * step + 14, { ...mi(46, INK, 600), opacity: u(t, 1.5 + i * 0.15, 1.9 + i * 0.15) })}>{r}</span>
      </React.Fragment>)}
      <div style={abs(px, py, { width: pw, height: phh, borderRadius: phh / 2, background: INK, boxShadow: '0 14px 30px rgba(14,14,16,.22)', opacity: u(t, 1.0, 1.3) })} />
      {on > 0.6 && <span style={abs(964, ry + 14, { ...mi(46, WHITE, 600), opacity: u(on, 0.6, 1) })}>{ROWS[toR3 > 0.5 ? 2 : toR2 > 0.5 ? 1 : act]}</span>}
      <Buddy t={t} x={480} y={y} size={330} tint={tint} tint2={tint2} tk={tk} mood={mood} prev={prev} mk={mk} look={[lookX, lookY]} sx={sx} sy={sy} rot={rot} armL={armL} armR={armR} foot={foot} />
      <div style={abs(330, 800, { width: 300, textAlign: 'center', ...mi(34, INK, 600), opacity: u(t, 1.0, 1.4) })}>{MOODS[n][2]}</div>
      <div style={abs(0, 962, { width: 1920, textAlign: 'center', ...mi(36, MID, 500) })}>{t < 2.5 ? '进场，挥手，看向右边' : t < 5.0 ? '抬手一指，黑色小胶囊飞到清单上' : t < 7.3 ? '讲到第二条：惊讶，两手举起来，身体换成这一段的颜色' : t < 9.4 ? '讲到要小心的地方：斜着眼，叉着腰' : '胶囊飞回来，它托着头想一想'}</div>
    </div>
  </AbsoluteFill>;
}

// 表情一览：五种表情 × 三种颜色，再加一排大小示意
export function BuddySheet() {
  const { width } = useVideoConfig(), t = 1.0, moods: [Mood, string][] = [['calm', '平常'], ['happy', '高兴'], ['wow', '惊讶'], ['side', '留个心眼'], ['think', '在想']], tints = ['violet', 'coral', 'teal'];
  return <AbsoluteFill style={{ background: PAGE }}>
    <Fonts />
    <div style={{ position: 'absolute', width: 1920, height: 1080, transform: `scale(${width / 1920})`, transformOrigin: '0 0', overflow: 'hidden' }}>
      <div style={abs(76, 50, { display: 'flex', alignItems: 'center', gap: 16 })}><div style={{ width: 16, height: 16, borderRadius: 8, background: INK }} /><span style={mi(30, INK, 600)}>IP 形象小样 · 表情和颜色</span><span style={mi(27, MID, 500)}>· 第 2 版：加了短手短脚 · 颜色跟着片子当前那一段走</span></div>
      {tints.map((tn, r) => moods.map(([m, lb], c) => <React.Fragment key={`${r}-${c}`}>
        <Buddy t={t + c * 0.37 + r} x={250 + c * 355} y={250 + r * 290} size={210} tint={tn} mood={m} look={m === 'think' ? [0, -0.9] : m === 'side' ? [0.5, 0] : [0, 0]} rot={m === 'think' ? -7 : m === 'side' ? 5 : 0} sy={m === 'wow' ? 1.1 : 1} sx={m === 'wow' ? 0.94 : 1} seed={c + r * 5} armL={m === 'happy' ? 72 : m === 'wow' ? 147 : m === 'side' ? 50 : m === 'think' ? 16 : 22} armR={m === 'happy' ? 72 : m === 'wow' ? 147 : m === 'side' ? 50 : m === 'think' ? 150 : 22} foot={m === 'wow' ? 0.5 : 0} />
        {r === 2 && <div style={abs(250 + c * 355 - 150, 960, { width: 300, textAlign: 'center', ...mi(32, INK, 600) })}>{lb}</div>}
      </React.Fragment>))}
    </div>
  </AbsoluteFill>;
}
void [CARD, inout];
