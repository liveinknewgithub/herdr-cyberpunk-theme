# app/tests/test_theme.py
import json, re, unittest, pathlib
HEX = re.compile(r"^#[0-9A-F]{6}$")
T = json.loads((pathlib.Path(__file__).parents[1] / "themes" / "cyberpunk-2077.json").read_text())
class Theme(unittest.TestCase):
    def test_top_level(self):
        for k in ("background", "foreground", "selection", "cursor", "ansi", "colors"): self.assertIn(k, T)
        self.assertEqual(T["background"], "#0E070F"); self.assertEqual(T["cursor"], "#FCEE0A")
    def test_ansi_16_hex(self):
        self.assertEqual(len(T["ansi"]), 16)
        for c in T["ansi"]: self.assertRegex(c, HEX)
        self.assertEqual(T["ansi"][1], "#FF003C"); self.assertEqual(T["ansi"][3], "#FCEE0A"); self.assertEqual(T["ansi"][5], "#FF3D8B"); self.assertEqual(T["ansi"][6], "#3BD0CC")
    def test_colors(self):
        c = T["colors"]
        self.assertEqual(c["accent"], "#FCEE0A"); self.assertEqual(c["accent_foreground"], "#0C0510")
        self.assertEqual(c["selected"], "#4C1743"); self.assertEqual(c["blocked"], "#FF003C"); self.assertEqual(c["done"], "#3BD0CC")
        for v in c.values(): self.assertRegex(v, HEX)
if __name__ == "__main__": unittest.main()
