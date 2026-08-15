import { useEffect, useState } from "react";
import { readTimeline, sampleTapeLift } from "../three/director";
import { scrollStore } from "./scrollStore";
import type { ActId } from "./scrollStore";

/**
 * DOM-side scrubbing.
 *
 * The scene reads scroll every frame without React. A few pieces of markup
 * genuinely need to change as you scrub — a stepping callout list, a counting
 * number — so these hooks sample on rAF and set state only when the value they
 * expose actually changes. A stepping list of four re-renders four times across
 * a 280vh act. A raw progress number would re-render on every frame.
 */

/** Which of `steps` slots the act is in. Returns -1 before the first. */
export function useActStep(id: ActId, steps: number, start = 0.12, end = 0.86) {
  const [index, setIndex] = useState(-1);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const local = (scrollStore.actProgress(id) - start) / (end - start);
      const next = local < 0 ? -1 : Math.min(steps - 1, Math.floor(local * steps));
      setIndex((previous) => (previous === next ? previous : next));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [id, steps, start, end]);

  return index;
}

/**
 * How far the tape has lifted, as a whole percentage, sampled from the same
 * keyframe track the 3D cartridge moves on. One source, so the number in the
 * copy can never disagree with the object on screen — including when WebGL is
 * off and the frame loop never runs.
 */
export function useTapePercent() {
  const [percent, setPercent] = useState(() => Math.round(sampleTapeLift(readTimeline()) * 100));

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const next = Math.round(sampleTapeLift(readTimeline()) * 100);
      setPercent((previous) => (previous === next ? previous : next));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return percent;
}
