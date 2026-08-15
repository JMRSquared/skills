import { ACTS } from "../story/acts";
import { ACT_ORDER, damp, scrollStore, smoothstep } from "../story/scrollStore";

/**
 * The choreography.
 *
 * Every animated property is a keyframe track sampled against one continuous
 * timeline value: `act index + progress through that act`, so `t` runs 0..4
 * across four acts. The whole film is one declarative table, which means a beat
 * is retimed by moving a number rather than by rewriting a component.
 *
 * This file imports nothing from React and nothing from three.js. Port it to
 * plain three.js, to GSAP, or to a 2D canvas by changing only who reads
 * `storyState`.
 */

type Key = readonly [t: number, value: number];

/** Sample with clamped ends and smoothstep between keys. Keys sorted by t. */
function sample(keys: readonly Key[], t: number): number {
  const first = keys[0]!;
  if (t <= first[0]) return first[1];
  const last = keys[keys.length - 1]!;
  if (t >= last[0]) return last[1];

  for (let i = 1; i < keys.length; i += 1) {
    const b = keys[i]!;
    if (t <= b[0]) {
      const a = keys[i - 1]!;
      const span = b[0] - a[0];
      const local = span === 0 ? 1 : (t - a[0]) / span;
      return a[1] + (b[1] - a[1]) * smoothstep(local);
    }
  }
  return last[1];
}

// --- Camera ------------------------------------------------------------------
// One pose per act. These describe the ANGLE to shoot from, not the distance:
// the rig normalises the vector and the solver decides how far out to stand.
// The subject has a front. Every camera azimuth here stays on the same side of
// it, and the spin track below is kept slow enough that the two never combine
// into a shot of the back of the product. Orbit freely only around a model that
// is interesting from every angle.
const CAM_X: Key[] = [
  [0, 2.6],
  [1, 2.4],
  [2, 1.9],
  [3, 1.9],
];
const CAM_Y: Key[] = [
  [0, 1.1],
  [1, 1.9],
  [2, 2.4],
  [3, 1.0],
];
const CAM_Z: Key[] = [
  [0, 4.2],
  [1, 4.6],
  [2, 2.8],
  [3, 4.0],
];

const TARGET_X: Key[] = [
  [0, 0],
  [1, -0.1],
  [2, 0.12],
  [3, 0],
];
const TARGET_Y: Key[] = [
  [0, 0.72],
  [1, 0.86],
  [2, 1.02],
  [3, 0.7],
];

/**
 * Subject size and frame share, built from the act table.
 *
 * Each act holds its own numbers for four fifths of its run and only hands over
 * in the last fifth. Interpolating straight from one act's subject to the next
 * means that half way through act two the rig is already framing for act three,
 * and the object loses its head off the top of the screen.
 */
function holdThenHandOver(pick: (index: number) => number): Key[] {
  const keys: Key[] = [];
  ACTS.forEach((_, index) => {
    const value = pick(index);
    keys.push([index, value]);
    if (index < ACTS.length - 1) keys.push([index + 0.8, value]);
  });
  return keys;
}

const SUBJECT_W = holdThenHandOver((i) => ACTS[i]!.subject.w);
const SUBJECT_H = holdThenHandOver((i) => ACTS[i]!.subject.h);
const FILL = holdThenHandOver((i) => ACTS[i]!.fill);

// --- Product -----------------------------------------------------------------

/** Lateral staging. Act one holds the product clear of the headline column. */
const BODY_X: Key[] = [
  [0, 1.05],
  [0.72, 1.05],
  [1.1, 0.1],
  [1.9, 0.1],
  // The close-up would otherwise sit under the headline column. The solver
  // clamps this to whatever still keeps the whole subject on screen.
  [2.15, 0.65],
  [2.8, 0.65],
  [3, 0.15],
];

const BODY_Y: Key[] = [
  [0, 0],
  [1, 0.12],
  [2, 0.06],
  [3, 0],
];

/** Continuous, never reversing. A reversing spin reads as a bug. */
const SPIN: Key[] = [
  [0, 0.35],
  [1, 0.62],
  [2, 0.85],
  [2.6, 0.96],
  [3, 1.05],
];

const TILT: Key[] = [
  [0, 0.08],
  [1, 0.02],
  [2, 0.18],
  [2.8, 0.18],
  [3, 0.06],
];

/** 0 seated in the deck, 1 lifted clear. The whole point of act two. */
const TAPE_LIFT: Key[] = [
  [0, 0],
  [1.05, 0],
  [1.7, 1],
  [2.5, 1],
  [2.9, 0.06],
  [3, 0],
];

/** The cartridge turns to face the reader once it is clear of the deck. */
const TAPE_SPIN: Key[] = [
  [0, 0],
  [1, 0],
  [1.6, 0],
  [2, 2.4],
  [3, 5.6],
];

/** Accent light under the deck. Off until the object is worth pointing at. */
const GLOW: Key[] = [
  [0, 0.1],
  [0.9, 0.1],
  [1.3, 1],
  [2.8, 1],
  [3, 0.35],
];

/** Presence. Fading in place beats moving an object out of frame. */
const SHOW: Key[] = [
  [0, 1],
  [4, 1],
];

/** How far the cartridge has lifted at a given timeline position. */
export function sampleTapeLift(t: number): number {
  return sample(TAPE_LIFT, t);
}

export type StoryState = {
  /** Continuous timeline position, 0..ACTS.length. */
  t: number;
  camX: number;
  camY: number;
  camZ: number;
  targetX: number;
  targetY: number;
  bodyX: number;
  bodyY: number;
  spin: number;
  tilt: number;
  tapeLift: number;
  tapeSpin: number;
  glow: number;
  show: number;
  /** Largest lateral offset that keeps the subject inside the frame. */
  maxOffsetX: number;
  /** Smoothed pointer, -1..1 on both axes. Drives a light parallax. */
  pointerX: number;
  pointerY: number;
  /** Absolute scroll speed, normalised 0..1. Adds inertia to the rig. */
  speed: number;
  /** 1 on a wide viewport, falling towards 0 on a phone held upright. */
  stagingScale: number;
  subjectW: number;
  subjectH: number;
  fill: number;
  elapsed: number;
};

export const storyState: StoryState = {
  t: 0,
  camX: 2.6,
  camY: 1.1,
  camZ: 4.2,
  targetX: 0,
  targetY: 0.72,
  bodyX: 1.05,
  bodyY: 0,
  spin: 0.35,
  tilt: 0.08,
  tapeLift: 0,
  tapeSpin: 0,
  glow: 0.1,
  show: 1,
  maxOffsetX: 1.5,
  pointerX: 0,
  pointerY: 0,
  speed: 0,
  stagingScale: 1,
  subjectW: ACTS[0]!.subject.w,
  subjectH: ACTS[0]!.subject.h,
  fill: ACTS[0]!.fill,
  elapsed: 0,
};

const pointerTarget = { x: 0, y: 0 };

export function setPointer(x: number, y: number) {
  pointerTarget.x = x;
  pointerTarget.y = y;
}

/**
 * Raw timeline position, before smoothing.
 *
 * Exported so DOM sections can sample the same tracks the scene uses. Reading
 * scroll directly means a number in the copy matches the object on screen even
 * when WebGL is off and `updateStoryState` is never called.
 */
export function readTimeline(): number {
  const index = ACT_ORDER.indexOf(scrollStore.activeAct);
  const safeIndex = index < 0 ? 0 : index;
  return safeIndex + scrollStore.actProgress(scrollStore.activeAct);
}

/**
 * Advances the whole film by one frame. Called once per frame from the root of
 * the canvas, before any component reads `storyState`.
 */
export function updateStoryState(delta: number) {
  // Clamp the step. A backgrounded tab returns with a multi-second delta and
  // an unclamped damp snaps the whole scene in one frame.
  const step = Math.min(delta, 1 / 20);
  storyState.elapsed += step;

  // Easing the timeline itself is what gives the scene weight: the camera keeps
  // drifting for a beat after the wheel stops.
  storyState.t = damp(storyState.t, readTimeline(), 11, step);
  const t = storyState.t;

  storyState.camX = sample(CAM_X, t);
  storyState.camY = sample(CAM_Y, t);
  storyState.camZ = sample(CAM_Z, t);
  storyState.targetX = sample(TARGET_X, t);
  storyState.targetY = sample(TARGET_Y, t);

  storyState.bodyX = sample(BODY_X, t);
  storyState.bodyY = sample(BODY_Y, t);
  storyState.spin = sample(SPIN, t);
  storyState.tilt = sample(TILT, t);
  storyState.tapeLift = sample(TAPE_LIFT, t);
  storyState.tapeSpin = sample(TAPE_SPIN, t);
  storyState.glow = sample(GLOW, t);
  storyState.show = sample(SHOW, t);

  storyState.subjectW = sample(SUBJECT_W, t);
  storyState.subjectH = sample(SUBJECT_H, t);
  storyState.fill = sample(FILL, t);

  storyState.pointerX = damp(storyState.pointerX, pointerTarget.x, 3.5, step);
  storyState.pointerY = damp(storyState.pointerY, pointerTarget.y, 3.5, step);

  const rawSpeed = Math.min(Math.abs(scrollStore.velocity) / 45, 1);
  storyState.speed = damp(storyState.speed, rawSpeed, 6, step);
}

/** Brand tokens the scene reuses for lights and accents. */
export const SCENE_COLORS = {
  void: "#07090c",
  accent: "#ff7a45",
  accentBright: "#ffb489",
  cool: "#93b4ff",
} as const;
