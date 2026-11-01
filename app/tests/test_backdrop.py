# app/tests/test_backdrop.py — the committed backdrop is exactly what the generator makes.
import pathlib, struct, sys, tempfile, unittest
APP = pathlib.Path(__file__).parents[1]
sys.path.insert(0, str(APP / "backdrop")); import make_backdrop as m
COMMITTED = APP / "mods" / "nc-chrome" / "backdrop.png"

class Backdrop(unittest.TestCase):
    def test_committed_png_is_reproducible(self):
        with tempfile.TemporaryDirectory() as d:
            out = pathlib.Path(d) / "backdrop.png"
            m.write_png(out, (m.row_pixels(y) for y in range(m.H)))
            self.assertEqual(out.read_bytes(), COMMITTED.read_bytes())

    def test_png_header(self):
        b = COMMITTED.read_bytes()
        self.assertEqual(b[:8], b"\x89PNG\r\n\x1a\n")
        self.assertEqual(struct.unpack(">II", b[16:24]), (m.W, m.H))

    def test_scene(self):
        horizon = m.row_pixels(m.HORIZON)
        self.assertEqual(tuple(horizon[:3]), m.HORIZON_LINE)            # the magenta horizon spans the width
        mid_sun = m.row_pixels(m.SUN_CY - m.SUN_R // 2 - 30)           # upper half of the sun, no gaps there
        self.assertNotEqual(tuple(mid_sun[m.W // 2 * 3: m.W // 2 * 3 + 3]), tuple(mid_sun[:3]))
        sky = m.row_pixels(10)
        self.assertEqual(tuple(sky[m.W // 2 * 3: m.W // 2 * 3 + 3]), tuple(sky[:3]))  # no sun high in the sky

if __name__ == "__main__": unittest.main()
