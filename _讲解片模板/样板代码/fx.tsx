// 白底版整期用的动效零件（2026-11-11）。用户："出一个完整版，我看看转场动画 动效 特效效果吧 比较注重这个"。
// 这里放：缓动、入场、遮罩出字、打字、勾叉、小图形、字体。镜头本身在 RefFilm.tsx。
import React from 'react';
import { continueRender, delayRender, getInputProps, staticFile } from 'remotion';

// 配色方案（渲染时用 skin 参数切；用户 2026-11-11 选了 soft，现在是默认）：now 最早的流动纹理 / soft 柔和云雾 / flat 纯色 / tint 底色带一点颜色 + 深蓝字 / mono 只用一个颜色
const rawSkin = (getInputProps() as { skin?: string }).skin || '';
export const SKIN = (['now', 'flat', 'tint', 'mono'].includes(rawSkin) ? rawSkin : 'soft') as 'now' | 'soft' | 'flat' | 'tint' | 'mono';
const FLAT: Record<string, string> = { violet: 'linear-gradient(135deg, #6A5CFF, #5546E8)', teal: 'linear-gradient(135deg, #11A99A, #0C8FA0)', coral: 'linear-gradient(135deg, #F6703F, #EC5330)' };

export const INK = SKIN === 'tint' ? '#131B3F' : '#0E0E10', GRAY = '#6C6C76', MID = '#3A3A42', WHITE = '#FFFFFF', WARN = '#E5432D', PAGE = SKIN === 'tint' ? '#EDF1F8' : '#FFFFFF';
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const u = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const io = (t: number, a: number, b: number) => { const v = u(t, a, b); return v * v * (3 - 2 * v); };
export const expo = (t: number, a: number, b: number) => { const v = u(t, a, b); return v >= 1 ? 1 : 1 - Math.pow(2, -10 * v); };       // 快进慢停，不回弹
export const inout = (t: number, a: number, b: number) => { const v = u(t, a, b); return v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2; };
export const mi = (size: number, color = INK, weight = 900): React.CSSProperties => ({ fontFamily: 'Mi', fontWeight: weight, fontSize: size, lineHeight: 1, color, whiteSpace: 'pre', fontSynthesis: 'none', letterSpacing: size > 90 ? -size * 0.02 : 0 });
export const mono = (size: number, color = GRAY): React.CSSProperties => ({ fontFamily: 'Our Mono', fontWeight: 600, fontSize: size, lineHeight: 1, color, whiteSpace: 'pre', letterSpacing: size * 0.03 });
export const ital = (size: number, color = INK): React.CSSProperties => ({ fontFamily: 'Our Serif2', fontWeight: 500, fontStyle: 'italic', fontSize: size, lineHeight: 1, color, whiteSpace: 'pre' });
export const abs = (left: number, top: number, extra: React.CSSProperties = {}): React.CSSProperties => ({ position: 'absolute', left, top, ...extra });
export const tex = (name: string, t = 0): React.CSSProperties => {
  if (SKIN === 'flat' || SKIN === 'tint') return { backgroundImage: FLAT[name] };
  if (SKIN === 'mono') return { backgroundImage: 'linear-gradient(135deg, #3D6BFF, #2448E0)' };
  return { backgroundImage: `url(${staticFile(`hot/fluid_${SKIN === 'soft' ? 'soft_' : ''}${name}.jpg`)})`, backgroundSize: '128% 128%', backgroundPosition: `${50 + Math.sin(t * 0.21) * 42}% ${50 + Math.cos(t * 0.17) * 42}%` };   // 纹理慢慢流动
};
export const logo = (name: string) => staticFile(`hot/logos/${name}`);
// 用户 2026-11-11："卡片因为背景是白色 不明显"。白卡片加一圈细边和更重的阴影。label 传 card0 = 旧样子，cardB = 卡片填很浅的灰蓝（出对比图用）
const cardMode = (getInputProps() as { label?: string }).label || '';
export const RING = cardMode === 'card0' ? '' : cardMode === 'cardB' ? '0 0 0 1.5px rgba(20,30,60,.07), ' : '0 0 0 1.5px rgba(20,30,60,.12), ';
export const CARD: React.CSSProperties = cardMode === 'card0' ? { background: WHITE, boxShadow: '0 18px 44px rgba(30,40,80,.10), 0 2px 6px rgba(30,40,80,.05)' }
  : cardMode === 'cardB' ? { background: '#F1F3F8', boxShadow: `${RING}0 14px 34px rgba(30,40,80,.10)` }
  : { background: WHITE, boxShadow: `${RING}0 24px 54px rgba(30,40,80,.17), 0 4px 10px rgba(30,40,80,.09)` };
export const GLASS: React.CSSProperties = { background: 'rgba(255,255,255,.93)', boxShadow: '0 16px 32px rgba(10,10,60,.22)' };
// MiSans 的大概字宽（排胶囊、打字用）
export const wOf = (ch: string) => (ch === ' ' ? 0.28 : /[il.,:;'|!]/.test(ch) ? 0.27 : /[mwMW]/.test(ch) ? 0.86 : /[A-Z]/.test(ch) ? 0.67 : /[0-9]/.test(ch) ? 0.6 : ch === '·' ? 0.5 : ch.charCodeAt(0) < 256 ? 0.55 : 1);
export const tw = (s: string, size: number) => Array.from(s).reduce((a, c) => a + wOf(c), 0) * size;

const KEEP: HTMLImageElement[] = [];   // 留着引用，解码好的贴图不被回收
export function Fonts() {
  React.useLayoutEffect(() => {
    const h = delayRender('fonts'), F = (fam: string, file: string, w: string) => new FontFace(fam, `url(${staticFile(`fonts/${file}`)})`, { weight: w });
    const fs = [F('Mi', 'MiSans-Heavy.otf', '900'), F('Mi', 'MiSans-Semibold.otf', '600'), F('Mi', 'MiSans-Medium.otf', '500'), F('Our Serif2', 'NotoSerifSC-VF.ttf', '200 900'), F('Our Mono', 'SourceCodePro-Semibold.otf', '600')];
    Promise.all(fs.map((f) => f.load())).then((l) => { l.forEach((f) => (document.fonts as unknown as { add: (x: FontFace) => void }).add(f)); continueRender(h); });
    // 底色贴图是 CSS 背景，渲染器不会等它加载。2026-11-13 审片：第 0 帧有两张小卡的色条是白的，前 0.4 秒还闪。这里先把贴图加载、解码完再放行。
    if (SKIN === 'soft' || SKIN === 'now') {
      const h2 = delayRender('textures');
      Promise.all(['violet', 'teal', 'coral', 'gold', 'green'].map((n) => { const im = new Image(); im.src = staticFile(`hot/fluid_${SKIN === 'soft' ? 'soft_' : ''}${n}.jpg`); KEEP.push(im); return im.decode().catch(() => undefined); })).then(() => continueRender(h2));
    }
  }, []);
  return null;
}

// 入场：从下面浮上来，由虚变实，略微放大到位。out = 离场时刻（往上飘走）
export function rise(t: number, t0: number, o: { d?: number; dy?: number; out?: number; s0?: number } = {}): React.CSSProperties {
  const d = o.d ?? 0.6, k = expo(t, t0, t0 + d), e = o.out === undefined ? 0 : io(t, o.out - 0.22, o.out);
  if (t < t0) return { opacity: 0 };
  return { opacity: u(t, t0, t0 + d * 0.35) * (1 - e), transform: `translateY(${(1 - k) * (o.dy ?? 44) - e * 30}px) scale(${mix(o.s0 ?? 0.94, 1, k)})`, filter: k < 0.98 ? `blur(${(1 - k) * 10}px)` : e > 0.02 ? `blur(${e * 8}px)` : undefined };
}
// 遮罩出字：字从一条看不见的线下面升上来。stagger>0 时一个字一个字来；out = 离场时刻（继续往上走出遮罩）
export function Reveal({ t, t0, text, style, stagger = 0, d = 0.7, out }: { t: number; t0: number; text: string; style: React.CSSProperties; stagger?: number; d?: number; out?: number }) {
  if (t < t0 - 0.02) return null;
  const size = (style.fontSize as number) || 40, e = out === undefined ? 0 : inout(t, out - 0.28, out);
  const chars = stagger ? Array.from(text) : [text];
  return <span style={{ display: 'inline-block', overflow: 'hidden', height: size * 1.22, paddingRight: size * 0.06, verticalAlign: 'top' }}>
    {chars.map((c, i) => { const k = expo(t, t0 + i * stagger, t0 + i * stagger + d); return <span key={i} style={{ ...style, display: 'inline-block', lineHeight: `${size * 1.22}px`, transform: `translateY(${(1 - k) * 105 - e * 105}%)` }}>{c === ' ' ? ' ' : c}</span>; })}
  </span>;
}
// 打字：从 t0 开始每秒 cps 个字，后面跟一个闪的光标
export function Typed({ t, t0, text, style, cps = 14, cursor = INK }: { t: number; t0: number; text: string; style: React.CSSProperties; cps?: number; cursor?: string }) {
  const chars = Array.from(text), n = clamp(Math.floor((t - t0) * cps), 0, chars.length), size = (style.fontSize as number) || 40, on = n < chars.length || Math.floor(t * 2.5) % 2 === 0;
  return <span style={style}>{chars.slice(0, n).join('')}{t >= t0 - 0.3 && <span style={{ display: 'inline-block', width: Math.max(3, size * 0.08), height: size * 0.95, marginLeft: size * 0.08, background: cursor, opacity: on ? 1 : 0, verticalAlign: 'middle' }} />}</span>;
}
// 勾 / 叉：一笔画出来
export function Mark({ k, ok, size = 60, color }: { k: number; ok: boolean; size?: number; color?: string }) {
  const p = { fill: 'none', stroke: color ?? (ok ? INK : WARN), strokeWidth: 11, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, pathLength: 1, strokeDasharray: 1 };
  return <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
    {ok ? <path d="M22 52 L42 72 L80 30" {...p} strokeDashoffset={1 - clamp(k)} /> : <><path d="M28 28 L72 72" {...p} strokeDashoffset={1 - clamp(k * 2)} /><path d="M72 28 L28 72" {...p} strokeDashoffset={1 - clamp(k * 2 - 1)} /></>}
  </svg>;
}
// 小图形：白板、表格、数据、店、锁
export function Glyph({ kind, size = 120, color = INK, k = 1, sw = 7 }: { kind: 'board' | 'sheet' | 'data' | 'shop' | 'lock' | 'bag'; size?: number; color?: string; k?: number; sw?: number }) {
  const p = { fill: 'none', stroke: color, strokeWidth: sw, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - clamp(k) }, f = clamp(k * 2 - 1);
  return <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
    {kind === 'board' && <><rect x={6} y={14} width={88} height={66} rx={8} {...p} /><rect x={18} y={26} width={20} height={20} rx={3} fill="#F2C84B" opacity={f} /><rect x={44} y={36} width={20} height={20} rx={3} fill="#F0503C" opacity={f} /><rect x={66} y={52} width={18} height={18} rx={3} fill="#5B8DEF" opacity={f} /></>}
    {kind === 'sheet' && <><rect x={8} y={12} width={84} height={76} rx={8} {...p} /><path d="M8 36 H92 M8 62 H92 M36 12 V88 M64 12 V88" {...p} /></>}
    {kind === 'data' && <><path d="M10 90 H92" {...p} /><path d="M24 90 V58 M48 90 V28 M72 90 V44" {...p} strokeWidth={15} strokeLinecap="butt" /></>}
    {kind === 'shop' && <><path d="M12 42 L22 16 H78 L88 42 Z" {...p} /><path d="M18 42 V88 H82 V42" {...p} /><path d="M42 88 V62 H58 V88" {...p} /></>}
    {kind === 'lock' && <><rect x={20} y={46} width={60} height={44} rx={10} fill={color} opacity={f} /><path d="M32 46 V34 A18 18 0 0 1 68 34 V46" {...p} strokeWidth={10} /></>}
    {kind === 'bag' && <><path d="M18 34 H82 L76 90 H24 Z" {...p} /><path d="M36 34 V26 A14 14 0 0 1 64 26 V34" {...p} /></>}
  </svg>;
}
