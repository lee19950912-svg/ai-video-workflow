// 四种新段落版式的会动小样（2026-11-12）。用户看完静帧说"可以，做小样"。
// 内容和配音都是 12 日那期现成的（没有重新配音）：每一小段从成片里截一句或几句话，配上对应的新版式。
// 时间一律用成片里的秒数，这样每个字什么时候念都和原片一样。
import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import D from './data.json';
import { Fonts, PAGE, MID, abs, io, mono, u } from '../hot/fx';
import { BigNumber, Head, Steps, Sub, Versus, Wide, keyLook, keyMood, makeTalk, pulse } from '../hot/layouts';

const LS = D.LS as number[], VO = D.VO as unknown as [string, number, number][][], SUBS = D.subs as { s: number; e: number; text: string }[];
const at = (li: number, phrase: string) => { const s = VO[li].map((c) => c[0]).join(''), i = s.indexOf(phrase); if (i < 0) throw new Error(`第 ${li} 句里找不到：${phrase}`); return VO[li][i][1]; };
const talkAt = makeTalk(VO);
const FABLE = 'hot2/shots/fable_board.jpg', EMBER = 'hot2/shots/ember_board.jpg', AD = 'hot2/shots/ad_frames.jpg', COUCH = 'hot2/shots/couch.jpg', CARDIMG = 'hot2/shots/decision_card.jpg';
const TITLE = '同一天，五个新同事', GOLD = 'rgba(240,150,40,.26)';

// a/b = 这一小段在成片里从第几秒到第几秒；va/vb = 配音从第几秒截到第几秒（都落在句子之间的空当里）
const CLIPS = [
  { key: 'versus', a: 41.7, b: 59.9, va: 42.33, vb: 59.5, label: '小样 1 / 4 · 两样并排比' },
  { key: 'number', a: 50.7, b: 54.95, va: 51.04, vb: 54.05, label: '小样 2 / 4 · 一个数当主角' },
  { key: 'steps', a: 87.5, b: 94.3, va: 88.12, vb: 93.6, label: '小样 3 / 4 · 一步一步' },
  { key: 'wide', a: 20.2, b: 28.1, va: 20.96, vb: 27.25, label: '小样 4 / 4 · 宽图通栏' },
];
const STARTS: number[] = []; CLIPS.reduce((acc, c) => { STARTS.push(acc); return acc + (c.b - c.a); }, 0);
const TOTAL = STARTS[STARTS.length - 1] + CLIPS[CLIPS.length - 1].b - CLIPS[CLIPS.length - 1].a;

function Clip({ k, t }: { k: string; t: number }) {
  const talk = talkAt(t);
  if (k === 'versus') {
    const a = CLIPS[0].a, n1 = at(8, '干一单') - 0.1, r0 = LS[9] - 0.25, n2 = at(9, '一单') - 0.1, t10 = LS[10] - 0.1, pL = at(10, '骨干') - 0.05, pR = at(10, '实习生') - 0.05, hard = at(10, '活儿难') - 0.05, calc = at(10, '这笔账') - 0.05;
    return <>
      <Head title={TITLE} num="02" total="05" role="骨干" who="Arena 榜单" />
      <Versus t={t} tint="gold" glow={GOLD} talk={talk} tag={{ text: '我的比方', at: t10 }}
        L={{ crop: { img: FABLE, iw: 2400, ih: 2400, z: 1.06, cx: 0.4954, cy: 0.2682 }, name: 'Claude Fable 5.2', nameAt: at(8, 'Claude') - 0.1, pill: '骨干', pillAt: pL, num: '7.3', unit: '美元', per: '一单', numAt: n1, src: '图 · Arena 官方（它自己公布的）' }}
        R={{ crop: { img: EMBER, iw: 1249, ih: 1303, z: 2.454, cx: 0.7962, cy: 0.6366, marks: [[0.842, 0.88, 0.661]] }, cover: r0, name: 'Muse Ember', nameAt: at(9, '叫') - 0.05, pill: '实习生', pillBg: MID, pillAt: pR, num: '0.02', unit: '美元', per: '一单', numAt: n2, src: '图 · Arena 官方' }}
        aha={{ ...keyMood(t, [[a, 'calm'], [at(8, '七美元') - 0.05, 'wow'], [r0, 'calm'], [at(9, '两美分') - 0.05, 'wow'], [t10, 'happy'], [calc, 'think']]),
          look: keyLook(t, [[a, -0.6, -0.5], [n1, -0.7, 0.25], [r0, 0.6, -0.5], [n2, 0.7, 0.25], [t10, 0, 0.05], [pL, -0.5, 0.2], [pR, 0.5, 0.2], [hard, -0.6, 0.2], [calc, 0.1, -0.2]]),
          armL: 22 + 113 * pulse(t, at(8, 'Claude'), n1 - 0.3) + 78 * pulse(t, n1, r0 - 0.2) + 78 * pulse(t, pL, calc),
          armR: 22 + 113 * pulse(t, at(9, 'Meta') - 0.1, n2 - 0.3) + 78 * pulse(t, n2, t10 - 0.2) + 78 * pulse(t, pR, hard) + 128 * io(t, calc, calc + 0.3),
          rot: -6 * io(t, calc, calc + 0.3) }} />
    </>;
  }
  if (k === 'number') {
    const a = CLIPS[1].a, n = at(9, '一单') - 0.1, wow = at(9, '两美分') - 0.05;
    return <>
      <Head title={TITLE} num="02" total="05" role="骨干" who="Arena 榜单" />
      <BigNumber t={t} tint="gold" glow={GOLD} talk={talk} name="Meta 的小号 AI · Muse Ember" num="0.02" unit="美元" cap="干一单活儿" src="数字 · Arena 公布的中位数" proofSrc="图 · Arena 官方" numAt={n}
        proof={{ img: EMBER, iw: 1249, ih: 1303, z: 3.385, cx: 0.8523, cy: 0.642, marks: [[0.842, 0.88, 0.661]] }}
        aha={{ ...keyMood(t, [[a, 'calm'], [wow, 'wow']]), look: keyLook(t, [[a, -0.2, -0.8], [n, -0.8, -0.1], [wow + 0.5, -0.3, -0.75]]), armL: 22 + 140 * io(t, n + 0.35, n + 0.65), armR: 22 + 30 * io(t, wow, wow + 0.3) }} />
    </>;
  }
  if (k === 'steps') {
    const a = CLIPS[2].a;
    return <>
      <Head title={TITLE} num="04" total="05" role="拍广告的" who="fal · 给 ChatGPT 做的插件" />
      <Steps t={t} tint="coral" glow="rgba(240,80,60,.24)" talk={talk} src="图 · fal 官方 · 数字是 fal 自己公布的"
        steps={[{ crop: { img: AD, iw: 3600, ih: 2006, z: 1.8, cx: 0.5585, cy: 0.4715 }, big: '几百张', small: '关键画面，AI 出的', at: at(18, '画面') - 0.2 },
          { crop: { img: COUCH, iw: 3600, ih: 2025, z: 2.1, cx: 0.738, cy: 0.42 }, big: '26 个', small: '镜头，做成会动的', at: LS[18] - 0.2 },
          { big: '60 秒', small: '一支广告', at: a - 1, hi: at(17, '六十') - 0.08 }]} />
    </>;
  }
  return <>
    <Head title={TITLE} num="01" total="05" role="质检员" who="谷歌 · Gemini Decision 1" />
    <Wide t={t} tint="teal" glow="rgba(10,90,150,.24)" talk={talk} crop={{ img: CARDIMG, iw: 2640, ih: 1082 }} src="图 · Google 官方"
      frames={[{ at: at(4, '一张图') - 0.12, box: [0.027, 0.185, 0.336, 0.521] }, { at: at(4, '再给') - 0.12, box: [0.027, 0.56, 0.336, 0.942] }, { at: at(4, '是或者') - 0.12, box: [0.694, 0.412, 0.957, 0.525] }, { at: at(4, '从选项') - 0.12, box: [0.694, 0.549, 0.957, 0.664] }]}
      aha={keyMood(t, [[CLIPS[3].a, 'calm'], [at(4, '从选项') + 0.6, 'happy']])} />
  </>;
}

export function LayoutReel() {
  const { fps, width } = useVideoConfig(), T = useCurrentFrame() / fps;
  let n = 0; STARTS.forEach((s, i) => { if (T >= s) n = i; });
  const c = CLIPS[n], t = c.a + (T - STARTS[n]), len = c.b - c.a, fade = u(T, STARTS[n], STARTS[n] + 0.28) * (1 - u(T, STARTS[n] + len - 0.28, STARTS[n] + len));
  const sub = SUBS.find((x) => t >= x.s && t < x.e && x.s >= c.va - 0.15);
  return <AbsoluteFill style={{ background: PAGE }}>
    <Fonts />
    <div style={{ position: 'absolute', width: 1920, height: 1080, transform: `scale(${width / 1920})`, transformOrigin: '0 0', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: fade }}>
        <Clip k={c.key} t={t} />
        {sub && <Sub text={sub.text} k={u(t, sub.s, sub.s + 0.1)} />}
      </div>
      <div style={abs(0, 1034, { width: 1880, textAlign: 'right', ...mono(20, MID), opacity: fade })}>{c.label}</div>
    </div>
    {CLIPS.map((cl, i) => { const from = Math.round((STARTS[i] + cl.va - cl.a) * fps), dur = Math.round((cl.vb - cl.va) * fps);
      return <Sequence key={i} from={from} durationInFrames={dur}><Audio src={staticFile('hot2/voice.wav')} trimBefore={Math.round(cl.va * fps)} volume={(f) => Math.min(1, f / 2, (dur - f) / 3)} /></Sequence>; })}
    <Audio src={staticFile('hot2/music.wav')} trimBefore={20 * fps} volume={(f) => (D.musicVol as number) * Math.min(1, f / 15, (TOTAL * fps - f) / 45)} />
    {STARTS.slice(1).map((s, i) => <Sequence key={i} from={Math.round((s - 0.22) * fps)} durationInFrames={fps * 2}><Audio src={staticFile('sfx/whoosh-short.wav')} volume={0.16} /></Sequence>)}
  </AbsoluteFill>;
}
export const REEL_FRAMES = Math.round(TOTAL * 30);
