#!/usr/bin/env python3
from PIL import Image, ImageDraw
import os
from datetime import datetime


def _timestamp():
    return datetime.now().strftime("%Y%m%d-%H%M%S")


def _root_dir():
    return os.path.expanduser(os.environ.get("ANTIGRAVITY_ROOT_DIR", "~/_inbox/antigravity"))


def _out_dir():
    return os.path.join(_root_dir(), "toyamablog", "profile")


def _unique_path(path: str) -> str:
    if not os.path.exists(path):
        return path
    base, ext = os.path.splitext(path)
    return f"{base}-{_timestamp()}{ext}"

# 512x512のキャンバスを作成
size = 512
img = Image.new('RGBA', (size, size), (255, 255, 255, 0))
pixels = img.load()

# ピンクの背景色
pink_bg = (255, 105, 180, 255)  # #FF69B4
white = (255, 255, 255, 255)
light_pink = (255, 192, 203, 255)
dark_red = (139, 0, 0, 255)
black = (0, 0, 0, 255)
gray = (128, 128, 128, 255)
green = (0, 128, 0, 255)
orange = (255, 165, 0, 255)

# 背景をピンクで塗りつぶし
for x in range(size):
    for y in range(size):
        pixels[x, y] = pink_bg

# ピクセルアートのパターンを定義（32x32グリッドでスケール）
scale = size // 32

def set_pixel_block(x, y, color):
    """指定された座標にスケールされたピクセルブロックを設定"""
    for dx in range(scale):
        for dy in range(scale):
            px, py = x * scale + dx, y * scale + dy
            if 0 <= px < size and 0 <= py < size:
                pixels[px, py] = color

# ウサギの耳（左）
for x in range(5, 12):
    for y in range(4, 12):
        if (x == 5 and y < 8) or (x == 11 and y < 8):
            set_pixel_block(x, y, white)
        elif 6 <= x <= 10:
            set_pixel_block(x, y, white if y < 8 else light_pink)

# ウサギの耳（右）  
for x in range(20, 27):
    for y in range(4, 12):
        if (x == 20 and y < 8) or (x == 26 and y < 8):
            set_pixel_block(x, y, white)
        elif 21 <= x <= 25:
            set_pixel_block(x, y, white if y < 8 else light_pink)

# 顔の輪郭
for y in range(8, 20):
    for x in range(6, 26):
        if y == 8 and (8 <= x <= 23):
            set_pixel_block(x, y, white)
        elif y == 19 and (8 <= x <= 23):
            set_pixel_block(x, y, white)
        elif x == 6 and (10 <= y <= 17):
            set_pixel_block(x, y, white)
        elif x == 25 and (10 <= y <= 17):
            set_pixel_block(x, y, white)
        elif 7 <= x <= 24 and 9 <= y <= 18:
            set_pixel_block(x, y, white)

# 目の部分（赤い色）
set_pixel_block(10, 12, dark_red)
set_pixel_block(11, 12, dark_red)
set_pixel_block(20, 12, dark_red)
set_pixel_block(21, 12, dark_red)

# 鼻
set_pixel_block(15, 14, light_pink)
set_pixel_block(16, 14, light_pink)

# ほっぺた
set_pixel_block(8, 15, pink_bg)
set_pixel_block(23, 15, pink_bg)

# メガネのフレーム
for x in range(5, 27):
    for y in range(16, 20):
        if y == 16 and (6 <= x <= 12 or 19 <= x <= 25):
            set_pixel_block(x, y, black)
        elif y == 19 and (6 <= x <= 12 or 19 <= x <= 25):
            set_pixel_block(x, y, black)
        elif (x == 6 or x == 12) and 16 <= y <= 19:
            set_pixel_block(x, y, black)
        elif (x == 19 or x == 25) and 16 <= y <= 19:
            set_pixel_block(x, y, black)
        elif 13 <= x <= 18 and y == 17:
            set_pixel_block(x, y, black)

# メガネのレンズ
for x in range(7, 12):
    for y in range(17, 19):
        set_pixel_block(x, y, white)
for x in range(20, 25):
    for y in range(17, 19):
        set_pixel_block(x, y, white)

# 口の部分
for x in range(12, 20):
    if x == 12 or x == 19:
        set_pixel_block(x, 21, green)
for x in range(13, 19):
    set_pixel_block(x, 22, green)

# 顎の部分
for y in range(22, 26):
    for x in range(8, 24):
        if y == 22 and (10 <= x <= 21):
            set_pixel_block(x, y, black)
        elif y == 25 and (12 <= x <= 19):
            set_pixel_block(x, y, black)
        elif (x == 8 or x == 23) and y == 23:
            set_pixel_block(x, y, black)
        elif 9 <= x <= 22 and 23 <= y <= 24:
            set_pixel_block(x, y, black)

# オレンジの十字マーク
set_pixel_block(15, 28, orange)
set_pixel_block(16, 28, orange)
set_pixel_block(15, 29, orange)
set_pixel_block(16, 29, orange)

# 保存（public には直接書き込まない）
os.makedirs(_out_dir(), exist_ok=True)
out_path = os.environ.get("OUTPUT_PATH") or _unique_path(os.path.join(_out_dir(), "profile.png"))
img.save(out_path, "PNG")
print(f"ドット絵プロフィール画像を作成しました: {out_path}")
