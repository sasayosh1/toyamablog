#!/usr/bin/env python3
from PIL import Image
import os
from datetime import datetime

# 32x32のベースサイズで作成し、後で512x512にスケール
base_size = 32
scale = 16  # 512 / 32 = 16倍拡大

# ベースイメージ作成
base_img = Image.new('RGBA', (base_size, base_size), (0, 0, 0, 0))
pixels = base_img.load()

# 色の定義
pink_bg = (255, 105, 180, 255)  # #FF69B4
white = (255, 255, 255, 255)
light_pink = (255, 182, 193, 255)  # より薄いピンク
dark_red = (139, 0, 0, 255)
black = (0, 0, 0, 255)
gray = (128, 128, 128, 255)
green = (0, 128, 0, 255)
orange = (255, 165, 0, 255)

# 背景をピンクで全面塗りつぶし
for x in range(base_size):
    for y in range(base_size):
        pixels[x, y] = pink_bg

# ウサギの耳部分（左側）- より正確な位置とサイズ
ear_left_coords = [
    (5, 3), (6, 3), (7, 3), (8, 3), (9, 3),
    (4, 4), (5, 4), (6, 4), (7, 4), (8, 4), (9, 4), (10, 4),
    (4, 5), (5, 5), (6, 5), (7, 5), (8, 5), (9, 5), (10, 5),
    (5, 6), (6, 6), (7, 6), (8, 6), (9, 6),
    (6, 7), (7, 7), (8, 7),
]

# ウサギの耳部分（右側）
ear_right_coords = [
    (22, 3), (23, 3), (24, 3), (25, 3), (26, 3),
    (21, 4), (22, 4), (23, 4), (24, 4), (25, 4), (26, 4), (27, 4),
    (21, 4), (22, 5), (23, 5), (24, 5), (25, 5), (26, 5), (27, 5),
    (22, 6), (23, 6), (24, 6), (25, 6), (26, 6),
    (23, 7), (24, 7), (25, 7),
]

# 耳の内側（薄ピンク）
ear_inner_left = [(6, 5), (7, 5), (8, 5), (7, 6)]
ear_inner_right = [(23, 5), (24, 5), (25, 5), (24, 6)]

# 顔の輪郭（白）
face_coords = []
# 上部
for x in range(8, 24):
    face_coords.append((x, 8))
# 左右の輪郭
for y in range(9, 20):
    if y < 18:
        face_coords.extend([(7, y), (24, y)])
# 下部
for x in range(8, 24):
    if y == 19:
        face_coords.append((x, 19))

# 顔の内部を白で塗りつぶし
for y in range(9, 19):
    for x in range(8, 24):
        face_coords.append((x, y))

# 目（赤）
eye_coords = [(10, 12), (11, 12), (20, 12), (21, 12)]

# 鼻（薄ピンク）
nose_coords = [(15, 14), (16, 14)]

# ほっぺた（ピンク）
cheek_coords = [(9, 15), (22, 15)]

# メガネフレーム（黒）
glasses_coords = []
# 左のレンズフレーム
for x in range(7, 13):
    glasses_coords.extend([(x, 16), (x, 19)])
for y in range(16, 20):
    glasses_coords.extend([(7, y), (12, y)])

# 右のレンズフレーム  
for x in range(19, 25):
    glasses_coords.extend([(x, 16), (x, 19)])
for y in range(16, 20):
    glasses_coords.extend([(19, y), (24, y)])

# メガネのブリッジ
for x in range(13, 19):
    glasses_coords.append((x, 17))

# メガネのレンズ（白）
lens_coords = []
for y in range(17, 19):
    for x in range(8, 12):
        lens_coords.append((x, y))
    for x in range(20, 24):
        lens_coords.append((x, y))

# 口の部分（緑）
mouth_coords = [(13, 21), (14, 21), (17, 21), (18, 21)]
for x in range(14, 18):
    mouth_coords.append((x, 22))

# 顎・マスク部分（黒）
mask_coords = []
for y in range(23, 27):
    for x in range(10, 22):
        if y == 23 and (x < 12 or x > 19):
            continue
        if y == 26 and (x < 13 or x > 18):
            continue
        mask_coords.append((x, y))

# オレンジの十字マーク
cross_coords = [(15, 28), (16, 28), (15, 29), (16, 29)]

# 座標に基づいて色を設定
for coord in ear_left_coords + ear_right_coords:
    if coord[0] < base_size and coord[1] < base_size:
        pixels[coord] = white

for coord in ear_inner_left + ear_inner_right:
    if coord[0] < base_size and coord[1] < base_size:
        pixels[coord] = light_pink

for coord in face_coords:
    if coord[0] < base_size and coord[1] < base_size:
        pixels[coord] = white

for coord in eye_coords:
    if coord[0] < base_size and coord[1] < base_size:
        pixels[coord] = dark_red

for coord in nose_coords:
    if coord[0] < base_size and coord[1] < base_size:
        pixels[coord] = light_pink

for coord in cheek_coords:
    if coord[0] < base_size and coord[1] < base_size:
        pixels[coord] = pink_bg

for coord in glasses_coords:
    if coord[0] < base_size and coord[1] < base_size:
        pixels[coord] = black

for coord in lens_coords:
    if coord[0] < base_size and coord[1] < base_size:
        pixels[coord] = white

for coord in mouth_coords:
    if coord[0] < base_size and coord[1] < base_size:
        pixels[coord] = green

for coord in mask_coords:
    if coord[0] < base_size and coord[1] < base_size:
        pixels[coord] = black

for coord in cross_coords:
    if coord[0] < base_size and coord[1] < base_size:
        pixels[coord] = orange

# 512x512にスケールアップ（ピクセル化を維持）
final_img = base_img.resize((512, 512), Image.NEAREST)

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


# 保存（public には直接書き込まない）
os.makedirs(_out_dir(), exist_ok=True)
out_path = os.environ.get("OUTPUT_PATH") or _unique_path(os.path.join(_out_dir(), "profile.png"))
final_img.save(out_path, "PNG")
print(f"アイコンを作成しました: {out_path}")
