import unittest, wave, pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).parents[1] / "sounds")); import make_sounds as m
D = pathlib.Path(__file__).parents[1] / "sounds"
class Sounds(unittest.TestCase):
    def test_done_shape(self):
        s = m.done_samples(); self.assertAlmostEqual(len(s) / 44100, 0.125, delta=0.02)
        self.assertLessEqual(max(abs(x) for x in s), int(32767 * 10 ** (-12 / 20)) + 1)
    def test_blocked_shape(self):
        s = m.blocked_samples(); self.assertAlmostEqual(len(s) / 44100, 0.26, delta=0.03)
        self.assertGreater(len(s), len(m.done_samples()))
    def test_files_exist_and_are_mono_16bit(self):
        for n in ("nc-done.wav", "nc-blocked.wav"):
            with wave.open(str(D / n)) as w: self.assertEqual((w.getnchannels(), w.getsampwidth(), w.getframerate()), (1, 2, 44100))
        for n in ("nc-done.mp3", "nc-blocked.mp3"): self.assertGreater((D / n).stat().st_size, 1000)
if __name__ == "__main__": unittest.main()
