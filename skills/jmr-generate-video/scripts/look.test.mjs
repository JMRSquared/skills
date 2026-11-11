import assert from 'node:assert/strict';
import { test } from 'node:test';
import { analyse, cutFrames, findCuts, FPS, problems, SHEET, shotMiddles } from './look.mjs';

const WIDTH = 36;
const HEIGHT = 64;

const seeded = (seed) => {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
};

const noiseFrame = (seed) => {
  const random = seeded(seed);
  return Uint8Array.from({ length: WIDTH * HEIGHT }, () => Math.floor(random() * 256));
};

const film = (seconds, frameAt) => Array.from({ length: seconds * FPS }, (_, i) => frameAt(i));

test('a film of new pictures passes', () => {
  const result = analyse(film(30, (i) => noiseFrame(1 + Math.floor(i / FPS))), WIDTH, HEIGHT);
  assert.deepEqual(problems(result), []);
});

test('a picture that never changes is reported as still', () => {
  const picture = noiseFrame(7);
  const result = analyse(film(30, () => picture), WIDTH, HEIGHT);
  const found = problems(result).join('\n');
  assert.match(found, /same picture sits/);
  assert.match(found, /barely changes/);
  assert.match(found, /different pictures/);
});

test('a long hold in the middle of a moving film is reported', () => {
  const hold = noiseFrame(9);
  const frames = film(40, (i) => (i >= 10 * FPS && i < 20 * FPS ? hold : noiseFrame(100 + i)));
  const result = analyse(frames, WIDTH, HEIGHT);
  assert.equal(result.longestStillAt, 10);
  assert.ok(result.longestStillSeconds >= 9 && result.longestStillSeconds <= 11);
});

test('an end card may hold', () => {
  const card = noiseFrame(11);
  const frames = film(30, (i) => (i >= 26 * FPS ? card : noiseFrame(200 + i)));
  assert.equal(analyse(frames, WIDTH, HEIGHT).longestStillSeconds, 0);
});

test('a dark, empty lower frame is reported in portrait', () => {
  const darkBelow = (i) => {
    const frame = noiseFrame(300 + i);
    frame.fill(5, Math.floor(HEIGHT * 0.7) * WIDTH);
    return frame;
  };
  const result = analyse(film(30, darkBelow), WIDTH, HEIGHT);
  assert.equal(result.emptyLowerShare, 1);
  assert.match(problems(result).join('\n'), /lower 30%/);
});

test('the lower frame check does not apply to landscape', () => {
  const dark = (i) => {
    const frame = noiseFrame(400 + i);
    frame.fill(5, Math.floor(WIDTH * 0.7) * HEIGHT);
    return frame;
  };
  assert.equal(analyse(film(10, dark), HEIGHT, WIDTH).emptyLowerShare, 0);
});

test('a dark film of sparse changing shapes still counts as different pictures', () => {
  const sparse = (i) => {
    const frame = new Uint8Array(WIDTH * HEIGHT);
    const random = seeded(500 + Math.floor(i / FPS));
    for (let n = 0; n < 12; n += 1) frame[Math.floor(random() * frame.length)] = 255;
    return frame;
  };
  const result = analyse(film(20, sparse), HEIGHT, WIDTH);
  assert.ok(result.secondsPerNewPicture <= 1.5, `got ${result.secondsPerNewPicture}`);
});

test('cuts are found where the picture changes, once per transition', () => {
  const result = analyse(film(9, (i) => noiseFrame(1 + Math.floor(i / (3 * FPS)))), WIDTH, HEIGHT);
  assert.deepEqual(result.cuts, [3, 6]);
});

test('changes closer than the minimum gap count as one cut', () => {
  const frames = film(4, (i) => noiseFrame(i >= FPS * 2 ? 50 + i : 1));
  const result = analyse(frames, WIDTH, HEIGHT);
  assert.deepEqual(result.cuts.filter((at) => at < 3), [2]);
});

test('a still film has no cuts', () => {
  const picture = noiseFrame(3);
  assert.deepEqual(findCuts(film(5, () => picture).map(() => Float32Array.from({ length: 4 }, (_, i) => i - 1.5))), []);
});

test('the shot sheet takes the middle of every shot', () => {
  assert.deepEqual(shotMiddles([2, 5], 10), [1, 3.5, 7.5]);
  assert.deepEqual(shotMiddles([], 8), [4]);
});

test('each cut gets a full row of frames, kept inside the film', () => {
  const span = SHEET.framesEachSide * 2 + 1;
  const rows = cutFrames([0.1, 5, 9.95], 10);
  assert.ok(rows.every((row) => row.length === span));
  assert.equal(rows[0][0], 0);
  assert.equal(rows[1][SHEET.framesEachSide], 5 * SHEET.cutFps);
  assert.equal(rows[2][span - 1], 10 * SHEET.cutFps - 1);
});
