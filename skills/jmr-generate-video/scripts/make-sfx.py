#!/usr/bin/env python3
"""Generate the transition sounds brag's CC0 library lacks: whooshes, risers and hits.

  make-sfx.py <out-dir> [--key A]

Standard library only. Everything is synthesised here, so no licence applies and
the same files are safe for ads and client work. Writes 48 kHz mono WAVs.
"""
import argparse
import math
import random
import struct
import wave
from pathlib import Path

RATE = 48000
SEMITONES = {"C": -9, "D": -7, "E": -5, "F": -4, "G": -2, "A": 0, "B": 2}


def one_pole(samples, cutoff):
    """Low-pass. cutoff is a function of position 0..1, so sweeps stay cheap."""
    out, level, total = [], 0.0, max(len(samples) - 1, 1)
    for i, sample in enumerate(samples):
        coefficient = math.exp(-2 * math.pi * cutoff(i / total) / RATE)
        level = (1 - coefficient) * sample + coefficient * level
        out.append(level)
    return out


def band_noise(seconds, rng, cutoff, passes=2, high_pass=180.0):
    noise = [rng.uniform(-1, 1) for _ in range(int(seconds * RATE))]
    low = noise
    for _ in range(passes):
        low = one_pole(low, cutoff)
    rumble = one_pole(low, lambda _: high_pass)
    return [a - b for a, b in zip(low, rumble)]


def bell(position, peak=0.5, sharpness=1.6):
    """Rises to 1 at peak, then falls. Asymmetric so a whoosh passes by the ear."""
    x = position / peak if position < peak else (1 - position) / (1 - peak)
    return max(0.0, x) ** sharpness


def glide(seconds, start, end, decay, curve=20.0):
    """A sine that falls from start Hz to end Hz under an exponential decay."""
    samples, phase = [], 0.0
    for i in range(int(seconds * RATE)):
        t = i / RATE
        phase += 2 * math.pi * (end + (start - end) * math.exp(-t * curve)) / RATE
        samples.append(math.sin(phase) * math.exp(-t * decay))
    return samples


def mix(*layers):
    length = max(len(layer) for layer in layers)
    return [sum(layer[i] for layer in layers if i < len(layer)) for i in range(length)]


def scaled(samples, gain):
    return [s * gain for s in samples]


def fade_edges(samples, ms=4):
    n = min(int(RATE * ms / 1000), len(samples) // 2)
    out = list(samples)
    for i in range(n):
        out[i] *= i / n
        out[-1 - i] *= i / n
    return out


def write(path, samples, peak_db=-3.0):
    samples = fade_edges(samples)
    loudest = max(abs(s) for s in samples) or 1.0
    gain = (10 ** (peak_db / 20)) / loudest
    with wave.open(str(path), "wb") as out:
        out.setnchannels(1)
        out.setsampwidth(2)
        out.setframerate(RATE)
        out.writeframes(b"".join(struct.pack("<h", int(s * gain * 32767)) for s in samples))


def whoosh(seconds, rng, low, high, peak):
    sweep = lambda p: low + (high - low) * bell(p, peak, 1.2)
    noise = band_noise(seconds, rng, sweep)
    total = max(len(noise) - 1, 1)
    return [s * bell(i / total, peak) for i, s in enumerate(noise)]


def riser(seconds, rng, root):
    total = int(seconds * RATE)
    air = band_noise(seconds, rng, lambda p: 300 + 7500 * p ** 2.2)
    tone, phase = [], 0.0
    for i in range(total):
        p = i / total
        phase += 2 * math.pi * root * 2 ** (p * 2) / RATE
        tone.append((math.sin(phase) + 0.35 * math.sin(phase * 2.01)) * p ** 2.4)
    swell = [s * (i / total) ** 2.6 for i, s in enumerate(air)]
    return mix(scaled(swell, 1.0), scaled(tone, 0.22))


def bass_hit(rng, root):
    body = glide(1.4, root * 4, root, 3.2)
    knock = glide(0.12, 900, 120, 45, 60)
    air = band_noise(0.5, rng, lambda p: 5000 * (1 - p) + 300)
    tail = [s * math.exp(-i / RATE * 9) for i, s in enumerate(air)]
    return [math.tanh(1.5 * s) for s in mix(body, scaled(knock, 0.45), scaled(tail, 0.28))]


def thud(root):
    """A short heavy thud with a slight pitch drop, for comedic emphasis."""
    body = glide(0.9, root * 3.2, root * 0.9, 5.5, 28)
    knock = glide(0.05, 1400, 200, 70, 90)
    return [math.tanh(2.2 * s) for s in mix(body, scaled(knock, 0.35))]


def pop(hz):
    return glide(0.14, hz * 1.9, hz, 30, 60)


def ding(hz):
    """A soft struck note. Inharmonic partials keep it from sounding like a test tone."""
    samples = []
    for i in range(int(1.1 * RATE)):
        t = i / RATE
        samples.append(
            math.sin(2 * math.pi * hz * t) * math.exp(-t * 5)
            + 0.45 * math.sin(2 * math.pi * hz * 2.76 * t) * math.exp(-t * 9)
            + 0.18 * math.sin(2 * math.pi * hz * 5.4 * t) * math.exp(-t * 16)
        )
    return samples


def shimmer(rng, hz):
    """A short upward sparkle for a success or a price landing."""
    layers = []
    for step, ratio in enumerate((1, 1.5, 2, 3)):
        offset = [0.0] * int(0.05 * step * RATE)
        layers.append(offset + scaled(ding(hz * ratio)[: int(0.7 * RATE)], 0.5 / (step + 1)))
    air = band_noise(0.6, rng, lambda p: 9000 - 5000 * p, 2, 3000)
    tail = [s * math.exp(-i / RATE * 7) for i, s in enumerate(air)]
    return mix(*layers, scaled(tail, 0.25))


def tape_stop(root):
    """Falling pitch that dies out, for a record-stop style interruption."""
    samples, phase = [], 0.0
    total = int(0.6 * RATE)
    for i in range(total):
        p = i / total
        phase += 2 * math.pi * root * 6 * (1 - p) ** 2.2 / RATE
        samples.append((math.sin(phase) + 0.4 * math.sin(phase * 2.02)) * (1 - p) ** 0.6)
    return samples


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("out")
    parser.add_argument("--key", default="A", choices=sorted(SEMITONES), help="key of the music, so hits sit in it")
    args = parser.parse_args()

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    rng = random.Random(7)
    root = 55.0 * 2 ** (SEMITONES[args.key] / 12)
    note = root * 16

    sounds = {
        # Three takes, because the same whoosh on every cut is the common tell.
        "whoosh-1": whoosh(0.45, rng, 500, 7000, 0.5),
        "whoosh-2": whoosh(0.55, rng, 350, 5200, 0.62),
        "whoosh-3": whoosh(0.38, rng, 700, 8500, 0.42),
        "whoosh-long": whoosh(1.1, rng, 250, 5500, 0.7),
        "swipe": whoosh(0.16, rng, 1500, 9000, 0.35),
        "riser-1s": riser(1.0, rng, root * 4),
        "riser-2s": riser(2.0, rng, root * 4),
        "bass-hit": bass_hit(rng, root),
        "thud": thud(root),
        "pop-1": pop(note),
        "pop-2": pop(note * 1.1892),
        "pop-3": pop(note * 1.4983),
        "ding": ding(note * 2),
        "shimmer": shimmer(rng, note * 2),
        "tape-stop": tape_stop(root * 2),
    }
    for name, samples in sounds.items():
        write(out / f"{name}.wav", samples)
    print(f"wrote {len(sounds)} sounds to {out}")


if __name__ == "__main__":
    main()
