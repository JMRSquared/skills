import type { ActId } from "./scrollStore";

/**
 * The act table. Write this before any code.
 *
 * One row per act, in scroll order. `scrollLength` is the section height in
 * viewport heights, so it is also the beat length: never below 150, or a
 * trackpad crosses the whole act in one flick. `subject` and `fill` are what
 * the camera solver frames against, and they are copy-adjacent on purpose —
 * the person writing the headline is the person deciding how large the object
 * reads behind it.
 */
export type Act = {
  readonly id: ActId;
  /** Section height in vh. Also the beat length. */
  readonly scrollLength: number;
  readonly eyebrow: string;
  readonly headline: string;
  readonly body: string;
  /** Bounding size of whatever this act is about, in scene units. */
  readonly subject: { readonly w: number; readonly h: number };
  /** Share of the frame that subject should occupy. */
  readonly fill: number;
};

export const ACTS = [
  {
    id: "arrive",
    scrollLength: 190,
    eyebrow: "ACT ONE",
    headline: "One object, four beats",
    body: "The product holds the right of the frame while the copy holds the left. Nothing has happened yet. Scroll and the timeline starts moving.",
    subject: { w: 0.9, h: 1.55 },
    fill: 0.54,
  },
  {
    id: "open",
    scrollLength: 260,
    eyebrow: "ACT TWO",
    headline: "The tape lifts as you scroll",
    body: "Every property on screen is a keyframe track sampled against one number. The tape lift, the spin and the camera pose all read the same clock, so they cannot drift apart.",
    subject: { w: 0.95, h: 2.05 },
    fill: 0.6,
  },
  {
    id: "play",
    scrollLength: 280,
    eyebrow: "ACT THREE",
    headline: "The camera solves its own distance",
    body: "No hand-authored Z. The rig is told how big the subject is and how much of the frame it should fill, then it works out where to stand. The same numbers frame correctly on a phone.",
    subject: { w: 0.75, h: 1.0 },
    fill: 0.62,
  },
  {
    id: "order",
    scrollLength: 200,
    eyebrow: "ACT FOUR",
    headline: "It lands where it started",
    body: "The last act pulls back towards the opening framing so the story closes on a shape the reader already knows. One line of copy, one call to action.",
    subject: { w: 1.0, h: 1.7 },
    fill: 0.48,
  },
] as const satisfies readonly Act[];

const BY_ID = new Map(ACTS.map((entry) => [entry.id, entry]));

/** Typed lookup into the act table. */
export function act(id: ActId): Act {
  const found = BY_ID.get(id);
  if (!found) throw new Error(`Unknown act: ${id}`);
  return found;
}

/** What the teardown list in act three steps through. */
export const CALLOUTS = [
  { title: "Cast body", note: "One shell, no visible fixings" },
  { title: "Transport deck", note: "Carries the reels and the head" },
  { title: "Tape cartridge", note: "Lifts clear of the deck" },
  { title: "Drive spindles", note: "Both turn under the same clock" },
] as const;
