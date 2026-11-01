# app/tests/test_layout.py
import json, unittest, pathlib
L = json.loads((pathlib.Path(__file__).parents[1] / "layouts" / "night-city.json").read_text())
def ids(n, out=None):
    out = out if out is not None else set(); out.add(n.get("id")); [ids(c, out) for c in n.get("children", [])]; return out
def node(n, i):
    if n.get("id") == i: return n
    for c in n.get("children", []):
        f = node(c, i)
        if f: return f
class Layout(unittest.TestCase):
    def test_root_look(self):
        self.assertEqual(L["theme"], "cyberpunk-2077"); self.assertEqual(L["titlebar"], "none")
        self.assertEqual(L["preview"], "layouts/night-city.svg"); self.assertEqual(L["background"], {"image": "mods/nc-chrome/backdrop.png", "fit": "cover"})
        self.assertTrue((pathlib.Path(__file__).parents[1] / "mods" / "nc-chrome" / "backdrop.png").is_file())
        self.assertEqual(L["ui_font"], "Geist Mono"); self.assertEqual(L["terminal_opacity"], 0.92)
    def test_ids_kept(self):
        self.assertTrue({"root","sidebar","brand","sidebar-lists","spaces","agents","sidebar-footer","work","tabs","work-body","main","panel","panel-body","files","changes","status"} <= ids(L))
    def test_pane_frame(self):
        p = node(L, "main")["content"]["pane"]
        self.assertEqual(p["radius"], 0); self.assertEqual(p["gap"], 8); self.assertTrue(p["lone"])
        self.assertEqual(p["border"], {"width": 2, "color": "border"}); self.assertEqual(p["focus"], {"width": 2, "color": "accent"})
        self.assertNotIn("background", p)  # unfilled, so the backdrop shows through the translucent terminals
        self.assertEqual(p["header"]["height"], 30)
    def test_mods(self):
        self.assertEqual(node(L, "brand")["content"]["mod"], "nc-chrome")
        self.assertEqual(node(L, "sidebar-footer")["content"]["mod"], "nc-chrome")
        self.assertEqual(node(L, "sidebar-footer")["content"]["props"], {"footer": True})
        self.assertEqual(node(L, "spaces")["content"]["mod"], "nc-spaces")
        self.assertEqual(node(L, "agents")["content"]["mod"], "nc-agents")
        self.assertEqual(node(L, "tabs")["content"]["mod"], "nc-tabs")
        self.assertEqual(node(L, "main")["content"]["pane"]["header"]["content"]["mod"], "nc-pane")
        self.assertEqual(node(L, "status")["content"]["mod"], "nc-status")
if __name__ == "__main__": unittest.main()
