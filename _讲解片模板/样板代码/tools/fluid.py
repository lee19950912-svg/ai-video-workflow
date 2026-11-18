"""用代码算"流动渐变"底图（像颜料在水里晕开）。不用 AI 出图，不花钱。
做法：几层平滑噪声叠起来，再用另一组噪声把坐标推歪两次（domain warping），最后按一条色带上色。
用法：<带 numpy 的 python> tools/fluid.py   → public/hot/fluid_*.jpg
"""
import sys
from pathlib import Path

import subprocess

import numpy as np

OUT = Path(__file__).resolve().parent.parent / 'public' / 'hot'
W, H = 960, 540


def smooth(rng, cells):
    """一层平滑噪声：小随机格子放大。"""
    g = rng.random((max(2, int(cells * H / W)) + 3, cells + 3)).astype(np.float32)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    x, y = xx * cells / W, yy * cells / W
    x0, y0 = x.astype(np.int32), y.astype(np.int32)
    fx, fy = x - x0, y - y0
    fx, fy = fx * fx * (3 - 2 * fx), fy * fy * (3 - 2 * fy)
    return (g[y0, x0] * (1 - fx) + g[y0, x0 + 1] * fx) * (1 - fy) + (g[y0 + 1, x0] * (1 - fx) + g[y0 + 1, x0 + 1] * fx) * fy


def fbm(rng, base=3, octaves=4):
    v, amp, tot = np.zeros((H, W), np.float32), 1.0, 0.0
    for o in range(octaves):
        v += smooth(rng, base * 2 ** o) * amp
        tot += amp
        amp *= 0.5
    return v / tot


def sample(f, x, y):
    x, y = np.clip(x, 0, W - 1.001), np.clip(y, 0, H - 1.001)
    x0, y0 = x.astype(np.int32), y.astype(np.int32)
    fx, fy = x - x0, y - y0
    return (f[y0, x0] * (1 - fx) + f[y0, x0 + 1] * fx) * (1 - fy) + (f[y0 + 1, x0] * (1 - fx) + f[y0 + 1, x0 + 1] * fx) * fy


def hexrgb(h):
    return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], np.float32)


def make(name, stops, seed, warp=170, contrast=1.0, blur=2.2):
    rng = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    a, b, c, d, base = fbm(rng), fbm(rng), fbm(rng, 4), fbm(rng, 4), fbm(rng, 3, 5)
    x1, y1 = xx + (a - 0.5) * warp * 2, yy + (b - 0.5) * warp * 2
    x2, y2 = x1 + (sample(c, x1, y1) - 0.5) * warp * 1.4, y1 + (sample(d, x1, y1) - 0.5) * warp * 1.4
    v = sample(base, x2, y2)
    v = (v - v.min()) / (v.max() - v.min())
    v = np.clip((v - 0.5) * contrast + 0.5, 0, 1)
    cols = np.stack([hexrgb(s) for s in stops])
    pos = v * (len(stops) - 1)
    i = np.clip(pos.astype(np.int32), 0, len(stops) - 2)
    f = (pos - i)[..., None]
    f = f * f * (3 - 2 * f)
    rgb = cols[i] * (1 - f) + cols[i + 1] * f
    OUT.mkdir(parents=True, exist_ok=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-i', '-', '-vf', f'scale=1920:1080:flags=bicubic,gblur=sigma={blur}', '-frames:v', '1', '-update', '1', '-q:v', '2', str(OUT / f'fluid_{name}.jpg')],
                   input=rgb.astype(np.uint8).tobytes(), check=True)
    print('ok', name)


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    make('paper', ['#FFFFFF', '#FBF7F0', '#F6EEE2', '#FBE3D8', '#FFFFFF', '#F3F0EA'], 11, warp=200, contrast=0.9)   # 开头结尾：几乎是白的，带一点暖
    make('coral', ['#FFF3DC', '#FFC38F', '#FF8A5C', '#F0503C', '#FF9FB0', '#FFE7D6'], 23, contrast=1.15)            # 第一样
    make('teal', ['#0B4F8A', '#1486A8', '#27B7A4', '#6FD6BD', '#1C6FB8', '#0E5E9C'], 37, contrast=1.15)             # 第二样
    make('violet', ['#2B1E7A', '#5B3FD6', '#A45DF0', '#F07BC0', '#FFC7A8', '#6A45E0'], 51, contrast=1.15)           # 第三样
    # 柔和版（2026-11-11 用户没勾"彩色卡片的颜色"和"会流动的彩色大卡"之后试的）：颜色浅、反差小、没有深色斑块，像云
    make('soft_violet', ['#8391FA', '#A3A9FF', '#C4B6FF', '#EDB5DD', '#FFC6B6', '#929DFF'], 23, warp=120, contrast=0.85, blur=7)
    make('soft_teal', ['#3FA4F2', '#5DBFF0', '#7FD9D8', '#A6EAD0', '#70C6F1', '#52B1F5'], 37, warp=120, contrast=0.85, blur=7)
    make('soft_coral', ['#FF8D69', '#FFA786', '#FFC19E', '#FFAEB6', '#FF9A78', '#FFB18D'], 51, warp=120, contrast=0.85, blur=7)
