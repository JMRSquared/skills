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
  /** Short plain name shown in the fixed progress label. Sentence case. */
  readonly label: string;
  /** A plain, complete statement about the product (references/no-slop.md).
   *  The first act renders it as the page's only h1; the rest as h2s. */
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
    label: "The player arrives",
    headline: "See inside a portable cassette player",
    body: "The player holds the right of the frame and the words hold the left. As you move down the page, one timeline opens it up in four steps.",
    subject: { w: 0.9, h: 1.55 },
    fill: 0.54,
  },
  {
    id: "open",
    scrollLength: 260,
    label: "The tape lifts out",
    headline: "The tape cartridge lifts out of the deck as you scroll",
    body: "Every moving part reads one number: how far down the page you are. The tape lift, the spin and the camera all follow that number, so they stay in step.",
    subject: { w: 0.95, h: 2.05 },
    fill: 0.6,
  },
  {
    id: "play",
    scrollLength: 280,
    label: "The camera moves in",
    headline: "The camera works out how close to stand to the player",
    body: "Nobody typed in a camera distance. The camera knows how big the player is and how much of the frame it should fill, and it moves to fit. The same numbers work on a phone.",
    subject: { w: 0.75, h: 1.0 },
    fill: 0.62,
  },
  {
    id: "order",
    scrollLength: 200,
    label: "Back to the opening view",
    headline: "The cassette player ends in the pose it started in",
    body: "The last step pulls back to the opening view, so the page closes on a shape you have already seen. It has one paragraph and one button.",
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
  { title: "Cast body", note: "One shell with no visible screws" },
  { title: "Transport deck", note: "Carries the reels and the playback head" },
  { title: "Tape cartridge", note: "Lifts clear of the deck" },
  { title: "Drive spindles", note: "Both turn in step with the tape" },
] as const;
