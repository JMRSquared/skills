#!/usr/bin/env node
// Measures a rendered film for what a viewer sees and `hyperframes check` cannot:
// pictures that sit still, too few different pictures and an empty lower frame.
// It reads no taste. A pass means the film is not obviously static, and nothing more.
import { spawnSync } from 'node:child_process';
import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const FPS = 5;
const ANALYSIS_WIDTH = 90;
const WINDOW_SECONDS = 3;
const END_CARD_SECONDS = 4;
// Similarity ignores brightness and contrast, so a sparse dark film counts the same as a
// bright one and a slow push on a photo still counts as the same picture.
const SAME_PICTURE = 0.97;
const NEW_PICTURE = 0.7;
// Calibrated against HeyGen's films, which measure 1.2-1.7 s per picture and 0% still, and
// the two rejected reels this check was written to catch, at 4.5-4.9 s and 13-25% still.
export const LIMITS = { longestStillSeconds: 4, stillShare: 0.08, secondsPerNewPicture: 3, emptyLowerShare: 0.25 };
const EMPTY_LOWER = { fromHeight: 0.7, maxLuma: 45, maxSpread: 9 };

const normalise = (frame) => {
  let sum = 0;
  for (const value of frame) sum += value;
  const mean = sum / frame.length;
  const out = new Float32Array(frame.length);
  let energy = 0;
  for (let i = 0; i < frame.length; i += 1) {
    out[i] = frame[i] - mean;
    energy += out[i] ** 2;
  }
  const norm = Math.max(Math.sqrt(energy), 1);
  for (let i = 0; i < out.length; i += 1) out[i] /= norm;
  return out;
};

const similarity = (a, b) => {
  let total = 0;
  for (let i = 0; i < a.length; i += 1) total += a[i] * b[i];
  return total;
};

const isLowerEmpty = (frame, width, height) => {
  const lower = frame.subarray(Math.floor(height * EMPTY_LOWER.fromHeight) * width);
  let sum = 0;
  for (const value of lower) sum += value;
  const mean = sum / lower.length;
  let spread = 0;
  for (const value of lower) spread += (value - mean) ** 2;
  return mean <= EMPTY_LOWER.maxLuma && Math.sqrt(spread / lower.length) <= EMPTY_LOWER.maxSpread;
};

const measureStillness = (normalised) => {
  const gap = WINDOW_SECONDS * FPS;
  const counted = Math.max(0, normalised.length - gap - END_CARD_SECONDS * FPS);
  let stillWindows = 0;
  let run = 0;
  let longest = { windows: 0, start: 0 };
  for (let i = 0; i < counted; i += 1) {
    const still = similarity(normalised[i], normalised[i + gap]) > SAME_PICTURE;
    stillWindows += still ? 1 : 0;
    run = still ? run + 1 : 0;
    if (run > longest.windows) longest = { windows: run, start: i - run + 1 };
  }
  return {
    longestStillSeconds: longest.windows ? longest.windows / FPS + WINDOW_SECONDS : 0,
    longestStillAt: longest.start / FPS,
    stillShare: counted ? stillWindows / counted : 0,
  };
};

const countPictures = (normalised) => {
  const kept = [];
  for (let i = 0; i < normalised.length; i += FPS) {
    if (kept.every((picture) => similarity(picture, normalised[i]) < NEW_PICTURE)) kept.push(normalised[i]);
  }
  return kept.length;
};

export const analyse = (frames, width, height) => {
  const seconds = frames.length / FPS;
  const normalised = frames.map(normalise);
  const pictures = countPictures(normalised);
  return {
    seconds,
    pictures,
    secondsPerNewPicture: seconds / Math.max(pictures, 1),
    emptyLowerShare: height > width ? frames.filter((frame) => isLowerEmpty(frame, width, height)).length / frames.length : 0,
    ...measureStillness(normalised),
  };
};

export const problems = (result) => {
  const found = [];
  if (result.longestStillSeconds > LIMITS.longestStillSeconds) {
    found.push(`the same picture sits for ${result.longestStillSeconds.toFixed(1)} s from ${result.longestStillAt.toFixed(1)} s. Change it or make it act within ${LIMITS.longestStillSeconds} s`);
  }
  if (result.stillShare > LIMITS.stillShare) {
    found.push(`${Math.round(result.stillShare * 100)}% of the film barely changes over ${WINDOW_SECONDS} s. Keep it under ${Math.round(LIMITS.stillShare * 100)}%`);
  }
  if (result.secondsPerNewPicture > LIMITS.secondsPerNewPicture) {
    found.push(`there are ${result.pictures} different pictures, one every ${result.secondsPerNewPicture.toFixed(1)} s. Build a new one at least every ${LIMITS.secondsPerNewPicture} s`);
  }
  if (result.emptyLowerShare > LIMITS.emptyLowerShare) {
    found.push(`the lower 30% of the frame is dark and empty for ${Math.round(result.emptyLowerShare * 100)}% of the film. Extend the world under the platform's buttons`);
  }
  return found;
};

const readFrames = (file) => {
  const probe = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', file], { encoding: 'utf8' });
  if (probe.status !== 0) throw new Error(`ffprobe could not read ${file}. Check the path and that ffmpeg is installed.`);
  const [sourceWidth, sourceHeight] = probe.stdout.trim().split(',').map(Number);
  const height = Math.round((ANALYSIS_WIDTH * sourceHeight) / sourceWidth / 2) * 2;
  const decode = spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-vf', `fps=${FPS},scale=${ANALYSIS_WIDTH}:${height},format=gray`, '-f', 'rawvideo', '-'], { maxBuffer: 2 ** 31 - 1 });
  if (decode.status !== 0) throw new Error(`ffmpeg could not decode ${file}: ${String(decode.stderr).trim()}`);
  const size = ANALYSIS_WIDTH * height;
  const frames = [];
  for (let at = 0; at + size <= decode.stdout.length; at += size) frames.push(decode.stdout.subarray(at, at + size));
  return { frames, width: ANALYSIS_WIDTH, height };
};

const main = () => {
  const file = process.argv[2];
  if (!file) {
    console.error('look needs a video file, for example <out>/video.mp4.');
    process.exit(2);
  }
  const { frames, width, height } = readFrames(file);
  const result = analyse(frames, width, height);
  console.log(`look: ${result.seconds.toFixed(1)} s, ${result.pictures} different pictures (one every ${result.secondsPerNewPicture.toFixed(1)} s), longest still ${result.longestStillSeconds.toFixed(1)} s, still ${Math.round(result.stillShare * 100)}% of the film, lower frame empty ${Math.round(result.emptyLowerShare * 100)}%`);
  const found = problems(result);
  for (const problem of found) console.log(`LOOK: ${problem}`);
  if (found.length) process.exit(1);
  console.log('look: nothing obviously static. This says nothing about taste, so still judge the frames against references/world-class.md.');
};

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) main();
