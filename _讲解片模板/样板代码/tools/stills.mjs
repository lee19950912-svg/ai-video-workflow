// 打包一次，按秒数出多张静帧。用法：node tools/stills.mjs 输出目录 0.3,2.2 [缩放] [合成名] [皮肤] [标签]
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';
const [outDir, list, scale = '0.5', comp = 'FILM', skin = 'fred', label = ''] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const inputProps = { skin, label };
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.tsx'), publicDir: path.resolve('public') });
const composition = await selectComposition({ serveUrl, id: comp, inputProps });
for (const s of list.split(',')) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(parseFloat(s) * composition.fps));
  await renderStill({ composition, serveUrl, frame, inputProps, output: path.join(outDir, `t${String(Math.round(parseFloat(s) * 100)).padStart(5, '0')}.jpg`), imageFormat: 'jpeg', jpegQuality: 88, scale: parseFloat(scale), logLevel: 'error' });
}
fs.rmSync(serveUrl, { recursive: true, force: true });
console.log('ok', list.split(',').length);
