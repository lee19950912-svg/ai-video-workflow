"""再加两种柔和云彩色：金色、绿色（11 月 12 日这一期有五段，原来只有紫、橙、蓝绿三种）。用法同 fluid.py。"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from fluid import make  # noqa: E402

make('soft_gold', ['#FFA43A', '#FFB552', '#FFC66E', '#FFAE86', '#FFA948', '#FFBC5C'], 67, warp=120, contrast=0.85, blur=7)
make('soft_green', ['#35B97C', '#52C98E', '#7ADBA6', '#A9E8B4', '#5FD0A0', '#43C086'], 79, warp=120, contrast=0.85, blur=7)
