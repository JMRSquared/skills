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
 * Chapter counter and act dots.
 *
 * `useActiveAct` is the only React subscription to scroll on the page. It fires
 * four times across the whole document, not sixty times a second.
 */
function ChapterHud() {
  const activeAct = useActiveAct();
  const index = ACT_ORDER.indexOf(activeAct);
  const entry = ACTS[index] ?? ACTS[0];

  return (
    <>
      <div className="hud">
        <span className="hud__index">{pad(index + 1)}</span>
        <span className="hud__slash">/</span>
        <span>{pad(ACT_ORDER.length)}</span>
        <span className="hud__label">{entry.eyebrow}</span>
      </div>

      <div className="dots">
        {ACT_ORDER.map((id, dotIndex) => (
          <span key={id} className={`dot${dotIndex <= index ? " is-on" : ""}${dotIndex === index ? " is-current" : ""}`} />
        ))}
      </div>
    </>
  );
}

const pad = (value: number) => String(value).padStart(2, "0");
