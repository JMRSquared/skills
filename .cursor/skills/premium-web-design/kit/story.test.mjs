import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const Story = createRequire(import.meta.url)('./story.js');

test('within maps a window onto 0..1 and clamps outside it', () => {
  assert.equal(Story.within(0.5, 0, 1), 0.5);
  assert.equal(Story.within(-1, 0, 1), 0);
  assert.equal(Story.within(2, 0, 1), 1);
  assert.ok(Math.abs(Story.within(0.3, 0.2, 0.4) - 0.5) < 1e-9);
});

test('within accepts a reversed window', () => {
  assert.equal(Story.within(0.92, 0.92, 0.56), 0);
  assert.equal(Story.within(0.56, 0.92, 0.56), 1);
  assert.ok(Math.abs(Story.within(0.74, 0.92, 0.56) - 0.5) < 1e-9);
});

test('within treats a zero-width window as a step', () => {
  assert.equal(Story.within(0.49, 0.5, 0.5), 0);
  assert.equal(Story.within(0.5, 0.5, 0.5), 1);
});

test('sceneProgress runs 0..1 across the travel of a pinned scene', () => {
  const top = 1000, height = 2500, viewport = 1000;
  assert.equal(Story.sceneProgress(top, height, viewport, 900), 0);
  assert.equal(Story.sceneProgress(top, height, viewport, 1000), 0);
  assert.equal(Story.sceneProgress(top, height, viewport, 1750), 0.5);
  assert.equal(Story.sceneProgress(top, height, viewport, 2500), 1);
  assert.equal(Story.sceneProgress(top, height, viewport, 9000), 1);
});

test('sceneProgress steps when a scene is shorter than the viewport', () => {
  assert.equal(Story.sceneProgress(1000, 600, 1000, 999), 0);
  assert.equal(Story.sceneProgress(1000, 600, 1000, 1000), 1);
});

test('enter and leave cover one viewport either side of the scene', () => {
  assert.equal(Story.enterProgress(2000, 1000, 1000), 0);
  assert.equal(Story.enterProgress(2000, 1000, 1500), 0.5);
  assert.equal(Story.enterProgress(2000, 1000, 2000), 1);
  assert.equal(Story.leaveProgress(2000, 3000, 1000, 4000), 0);
  assert.equal(Story.leaveProgress(2000, 3000, 1000, 4500), 0.5);
  assert.equal(Story.leaveProgress(2000, 3000, 1000, 5000), 1);
});

test('revealProgress spans at least 35% of the viewport', () => {
  const viewport = 900, top = 2000;
  const startY = top - viewport * 0.92;
  const endY = top - viewport * 0.56;
  assert.equal(Story.revealProgress(top, viewport, startY), 0);
  assert.equal(Story.revealProgress(top, viewport, endY), 1);
  assert.ok((endY - startY) / viewport >= 0.35);
});

test('revealProgress shift delays later lines', () => {
  const viewport = 900, top = 2000, y = top - viewport * 0.6;
  assert.ok(Story.revealProgress(top, viewport, y, 0.06) < Story.revealProgress(top, viewport, y));
});

test('revealProgress inside a pin finishes where the pin holds the element', () => {
  const viewport = 1000, top = 5800, held = 0.8;
  const heldY = top - viewport * held;
  assert.equal(Story.revealProgress(top, viewport, heldY, 0, held), 1);
  assert.ok(Story.revealProgress(top, viewport, heldY - 200, 0, held) < 1);
  assert.equal(Story.revealProgress(top, viewport, 0), 0);
});

test('revealProgress ignores a pin that holds the element above the window end', () => {
  const viewport = 1000, top = 3000;
  const y = top - viewport * 0.7;
  assert.equal(Story.revealProgress(top, viewport, y, 0, 0.3), Story.revealProgress(top, viewport, y));
});

test('activeStep counts steps whose top crossed the middle of the viewport', () => {
  const tops = [1000, 2000, 3000];
  assert.equal(Story.activeStep(tops, 0, 1000), -1);
  assert.equal(Story.activeStep(tops, 499, 1000), -1);
  assert.equal(Story.activeStep(tops, 500, 1000), 0);
  assert.equal(Story.activeStep(tops, 1500, 1000), 1);
  assert.equal(Story.activeStep(tops, 9000, 1000), 2);
  assert.equal(Story.activeStep([], 9000, 1000), -1);
});

test('damp converges at the same rate per second at any frame rate', () => {
  const run = (fps) => {
    let value = 0;
    for (let i = 0; i < fps; i += 1) value = Story.damp(value, 100, 9, 1 / fps);
    return value;
  };
  assert.ok(Math.abs(run(60) - run(120)) < 1e-6);
  assert.ok(run(60) > 99.9);
});

test('staggerDistances runs 0 to 1 away from the chosen origin', () => {
  assert.deepEqual(Story.staggerDistances(3), [0, 0.5, 1]);
  assert.deepEqual(Story.staggerDistances(3, 'last'), [1, 0.5, 0]);
  assert.deepEqual(Story.staggerDistances(5, 'center'), [1, 0.5, 0, 0.5, 1]);
  assert.deepEqual(Story.staggerDistances(3, 'nope'), [0, 0.5, 1]);
  assert.deepEqual(Story.staggerDistances(1, 'center'), [0]);
  assert.deepEqual(Story.staggerDistances(0), []);
});

test('staggerDistances on a grid measures from the origin cell in 2D', () => {
  const d = Story.staggerDistances(9, 'center', [3, 3]);
  assert.equal(d[4], 0);
  assert.equal(d[0], 1);
  assert.ok(Math.abs(d[1] - 1 / Math.SQRT2) < 1e-9);
  assert.deepEqual(Story.staggerDistances(4, 'first', [2, 2]).map((v) => Math.round(v * 1000) / 1000), [0, 0.707, 0.707, 1]);
});

test('parseRange reads two numbers and falls back to the full range', () => {
  assert.deepEqual(Story.parseRange('0.2 0.6'), [0.2, 0.6]);
  assert.deepEqual(Story.parseRange(undefined), [0, 1]);
  assert.deepEqual(Story.parseRange('nope'), [0, 1]);
});

test('formatLike keeps decimals and digit grouping from the source', () => {
  assert.equal(Story.formatLike('950', 475.4), '475');
  assert.equal(Story.formatLike('0.4', 0.21), '0.2');
  assert.equal(Story.formatLike('1 200', 1200), '1 200');
  assert.equal(Story.formatLike('12,500', 9876), '9,876');
});

test('countText animates the first number and restores the source at 1', () => {
  assert.equal(Story.countText('R950', 0), 'R0');
  assert.equal(Story.countText('R950', 0.5), 'R475');
  assert.equal(Story.countText('R950', 1), 'R950');
  assert.equal(Story.countText('R1 200 a wheel', 0.5), 'R600 a wheel');
  assert.equal(Story.countText('no digits', 0.5), 'no digits');
});
