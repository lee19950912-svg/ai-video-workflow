import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { Film, Film2 } from './Film';
import { ShellFilm } from './Shell';
import { LineFilm } from './Line';
import { Compare } from './Pen';
import { Compare2, Ours3 } from './Pen2';
import D from './data.json';
// HOT（笔头版）和 REFILM（白底版第一、二稿）用的是第一版稿子的时间表；hot/data.json 现在是第三版稿子的，所以先不登记这两个。
// 要重渲它们：在 E:\自媒体\AI热点-1111 里用 dialog_v1.json 和 audio_v1 重新跑 place.py。
import { SoftStills } from './hot/Soft';
import { RefStills } from './hot/Ref';
import { Film3, FILM3_FRAMES } from './hot/Film3';
import { BuddyDemo, BuddySheet } from './hot/Buddy';
import { Film4, FILM4_FRAMES } from './hot2/Film4';
import { LayoutReel, REEL_FRAMES } from './hot2/LayoutReel';
import { Film5, FILM5_FRAMES } from './hot3/Film5';
import { Film6, FILM6_FRAMES } from './hot3/Film6';
import { Film7, FILM7_FRAMES } from './hot4/Film7';

function Root() {
  const n = Math.round((D.END as number) * 30);
  return <><Composition id="FILM" component={Film} durationInFrames={n} fps={30} width={1920} height={1080} /><Composition id="FILM2" component={Film2} durationInFrames={n} fps={30} width={1920} height={1080} /><Composition id="SHELL" component={ShellFilm} durationInFrames={n} fps={30} width={1920} height={1080} /><Composition id="LINE" component={LineFilm} durationInFrames={n} fps={30} width={1920} height={1080} /><Composition id="COMPARE" component={Compare} durationInFrames={450} fps={30} width={1920} height={1080} /><Composition id="COMPARE2" component={Compare2} durationInFrames={450} fps={30} width={1920} height={1080} /><Composition id="IPDEMO" component={BuddyDemo} durationInFrames={375} fps={30} width={1920} height={1080} /><Composition id="IPSHEET" component={BuddySheet} durationInFrames={30} fps={30} width={1920} height={1080} /><Composition id="LAYOUTREEL" component={LayoutReel} durationInFrames={REEL_FRAMES} fps={30} width={1920} height={1080} /><Composition id="FILM5" component={Film5} durationInFrames={FILM5_FRAMES} fps={30} width={1920} height={1080} /><Composition id="FILM6" component={Film6} durationInFrames={FILM6_FRAMES} fps={30} width={1920} height={1080} /><Composition id="FILM7" component={Film7} durationInFrames={FILM7_FRAMES} fps={30} width={1920} height={1080} /><Composition id="FILM4" component={Film4} durationInFrames={FILM4_FRAMES} fps={30} width={1920} height={1080} /><Composition id="FILM3" component={Film3} durationInFrames={FILM3_FRAMES} fps={30} width={1920} height={1080} /><Composition id="REF" component={RefStills} durationInFrames={90} fps={30} width={1920} height={1080} /><Composition id="SOFT" component={SoftStills} durationInFrames={90} fps={30} width={1920} height={1080} /><Composition id="OURS3" component={Ours3} durationInFrames={450} fps={30} width={1920} height={1080} /></>;
}
registerRoot(Root);
