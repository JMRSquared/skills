import { lazy, Suspense } from "react";
import { ActArrive } from "./sections/ActArrive";
import { ActOpen } from "./sections/ActOpen";
import { ActOrder } from "./sections/ActOrder";
import { ActPlay } from "./sections/ActPlay";
import { ACTS } from "./story/acts";
import { ScrollProvider, useActiveAct } from "./story/ScrollProvider";
import { ACT_ORDER } from "./story/scrollStore";

/** three.js, drei and the effect chain load on their own, after first paint. */
const StageMount = lazy(() => import("./three/StageMount"));

/**
 * One fixed WebGL canvas sits behind the whole document; four acts scroll over
 * it. Scroll position is the only thing tying the two together, which is why
 * the story reads as a single continuous shot.
 */
export function App() {
  return (
    <ScrollProvider>
      <Suspense fallback={null}>
        <StageMount />
      </Suspense>

      <ChapterHud />

      <main>
        <ActArrive />
        <ActOpen />
        <ActPlay />
        <ActOrder />
      </main>
    </ScrollProvider>
  );
}

/**
 * Act label and act dots.
 *
 * `useActiveAct` is the only React subscription to scroll on the page. It fires
 * four times across the whole document, not sixty times a second.
 *
 * The label names the step in words ("The tape lifts out"). The dots already
 * show position, so a "01 / 04" counter would be a numbered label saying the
 * same thing in a form nobody reads (references/typographic-hierarchy.md, R6).
 */
function ChapterHud() {
  const activeAct = useActiveAct();
  const index = ACT_ORDER.indexOf(activeAct);
  const entry = ACTS[index] ?? ACTS[0];

  return (
    <>
      <div className="hud">
        <span className="hud__label">{entry.label}</span>
      </div>

      <div className="dots">
        {ACT_ORDER.map((id, dotIndex) => (
          <span key={id} className={`dot${dotIndex <= index ? " is-on" : ""}${dotIndex === index ? " is-current" : ""}`} />
        ))}
      </div>
    </>
  );
}

