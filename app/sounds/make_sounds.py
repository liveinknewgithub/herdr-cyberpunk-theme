#!/usr/bin/env python3
"""Synthesize the two Night City UI blips (done / blocked).

Stdlib only. Writes nc-done.wav / nc-blocked.wav (44.1 kHz mono 16-bit,
peak -12 dBFS) and converts each to .mp3 with ffmpeg when it is on PATH.

    python3 make_sounds.py [outdir]    # default: this script's folder
"""
import math, pathlib, shutil, struct, subprocess, sys, wave

RATE = 44100
PEAK = int(32767 * 10 ** (-12 / 20))  # -12 dBFS
ATTACK = 0.005   # 5 ms linear attack on each tone
RELEASE = 0.002  # 2 ms linear release on every segment end (click guard)
CLIP = 0.8       # blocked: soft clip ceiling, tanh(x / CLIP) * CLIP


def square(f, t):
    return 1.0 if math.sin(2 * math.pi * f * t) >= 0 else -1.0


def saw(f, t):
    return 2.0 * ((f * t) % 1.0) - 1.0


def segment(wave_fn, freq, dur, rate, decay=None, harmonic=0.0):
    """One tone: linear attack, optional exponential decay, short release."""
    n = int(round(dur * rate))
    out = []
    for i in range(n):
        t = i / rate
        x = wave_fn(freq, t) + harmonic * wave_fn(2 * freq, t)
        env = min(1.0, t / ATTACK)
        if decay:
            env *= math.exp(-decay * t / dur)
        env *= min(1.0, (dur - t) / RELEASE)
        out.append(x * env)
    return out


def normalize(xs):
    """Peak-normalize to -12 dBFS and quantize to 16-bit ints."""
    top = max(abs(x) for x in xs) or 1.0
    return [int(round(x / top * PEAK)) for x in xs]


def done_samples(rate=RATE):
    """E5 659 Hz 55 ms then B5 988 Hz 70 ms (square, 2nd harmonic at -12 dB)."""
    h = 10 ** (-12 / 20)
    xs = segment(square, 659, 0.055, rate, harmonic=h)
    xs += segment(square, 988, 0.070, rate, decay=5.0, harmonic=h)
    return normalize(xs)


def blocked_samples(rate=RATE):
    """Three A3 220 Hz saw pulses, 60 ms with 40 ms gaps, tanh soft clip at 0.8."""
    gap = [0.0] * int(round(0.040 * rate))
    xs = []
    for k in range(3):
        last = k == 2
        pulse = segment(saw, 220, 0.060, rate, decay=4.0 if last else None)
        xs += [math.tanh(1.6 * p / CLIP) * CLIP for p in pulse]  # drive 1.6x into the clip
        if not last:
            xs += gap
    return normalize(xs)


def write_wav(path, samples, rate=RATE):
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(rate)
        w.writeframes(struct.pack("<%dh" % len(samples), *samples))


def to_mp3(wav_path):
    """wav -> mp3 next to it via ffmpeg/libmp3lame; False if ffmpeg is missing or fails."""
    if shutil.which("ffmpeg") is None:
        return False
    wav_path = pathlib.Path(wav_path)
    r = subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav_path),
         "-codec:a", "libmp3lame", "-q:a", "4", str(wav_path.with_suffix(".mp3"))])
    return r.returncode == 0


def main(argv):
    out = pathlib.Path(argv[1]) if len(argv) > 1 else pathlib.Path(__file__).resolve().parent
    out.mkdir(parents=True, exist_ok=True)
    for name, fn in (("nc-done", done_samples), ("nc-blocked", blocked_samples)):
        wav = out / (name + ".wav")
        write_wav(wav, fn(), RATE)
        print(wav, "mp3" if to_mp3(wav) else "(no mp3: ffmpeg missing or failed)")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
