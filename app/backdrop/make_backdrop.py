#!/usr/bin/env python3
"""Night City backdrop: a synthwave scene behind the slightly translucent terminals.

Plum sky glowing toward a magenta horizon, a striped retro sun sitting on it, and a
perspective grid floor. Through the terminals (terminal_opacity ~0.92) only a faint sun
shows; the horizon and grid show fully in the gaps between panes.

Python 3 stdlib only (zlib + struct). Writes the PNG next to the nc-chrome mod by default:
    python3 -I app/backdrop/make_backdrop.py [out.png]
"""
import math
import struct
import sys
import zlib
from pathlib import Path

W, H = 2560, 1440
HORIZON = round(H * 0.75)          # horizon line, 3/4 down
SUN_CY = round(H * 0.72)           # sun's flat base, just above the horizon
SUN_R = round(H * 0.236)           # sun radius
SKY_TOP, SKY_LOW, GLOW = (0x0A, 0x05, 0x10), (0x16, 0x05, 0x1A), (0x2A, 0x07, 0x2A)
FLOOR_TOP, FLOOR_LOW = (0x14, 0x03, 0x12), (0x0C, 0x02, 0x0C)
SUN_TOP, SUN_LOW = (0x6A, 0x5C, 0x12), (0x6E, 0x16, 0x44)
HORIZON_LINE = (0xA8, 0x22, 0x50)
GRID_NEAR, GRID_FAR = (0x8A, 0x1A, 0x4E), (0x3A, 0x0A, 0x28)


def mix(a, b, t):
    t = min(1.0, max(0.0, t))
    return tuple(round(x + (y - x) * t) for x, y in zip(a, b))


def put(row, x0, x1, c):
    x0, x1 = max(0, int(x0)), min(W, int(x1))
    if x1 > x0:
        row[x0 * 3:x1 * 3] = bytes(c) * (x1 - x0)


def sun_gap(dy):
    """True where a horizontal gap cuts the sun's lower half; gaps thicken toward the base."""
    depth = dy / SUN_R            # 0 at the base, 1 at the top
    if depth > 0.55:
        return False
    band = 0.11                   # stripe period as a fraction of the radius
    phase = (depth % band) / band
    return phase < 0.55 * (1 - depth / 0.55) + 0.08


def row_pixels(y):
    row = bytearray(W * 3)
    if y < HORIZON:
        t = y / HORIZON
        base = mix(SKY_TOP, SKY_LOW, t)
        base = mix(base, GLOW, max(0.0, (t - 0.82) / 0.18) ** 2)
        put(row, 0, W, base)
        dy = SUN_CY - y
        if 0 <= dy <= SUN_R and not sun_gap(dy):
            half = math.sqrt(SUN_R * SUN_R - dy * dy)
            put(row, W / 2 - half, W / 2 + half, mix(SUN_LOW, SUN_TOP, dy / SUN_R))
        return row
    d = y - HORIZON
    put(row, 0, W, mix(FLOOR_TOP, FLOOR_LOW, d / (H - HORIZON)))
    if d < 3:
        put(row, 0, W, HORIZON_LINE)
        return row
    near = d / (H - HORIZON)
    grid = mix(GRID_FAR, GRID_NEAR, near ** 0.6)
    # Horizontal lines: spacing grows with distance below the horizon (perspective).
    k = math.log(d / 6.0, 1.32) if d >= 6 else -1
    if k >= 0 and (k % 1) < 0.9 / max(1.0, d / 30):
        put(row, 0, W, grid)
    # Converging lines from the vanishing point at the horizon's center.
    for i in range(-24, 25):
        x = W / 2 + i * (W / 9) * (d / (H - HORIZON))
        put(row, x - 1, x + 1 + near, grid)
    return row


def write_png(path, rows):
    raw = b"".join(b"\x00" + bytes(r) for r in rows)
    def chunk(tag, data):
        body = tag + data
        return struct.pack(">I", len(data)) + body + struct.pack(">I", zlib.crc32(body) & 0xFFFFFFFF)
    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", W, H, 8, 2, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b"")
    Path(path).write_bytes(png)


def main():
    out = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parent.parent / "mods" / "nc-chrome" / "backdrop.png"
    write_png(out, (row_pixels(y) for y in range(H)))
    print(f"wrote {out} ({out.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
