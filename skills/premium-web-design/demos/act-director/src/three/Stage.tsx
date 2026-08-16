import { useProgress } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useState } from "react";
import { setPointer } from "./director";
import { Scene } from "./Scene";
// Rendered out of this very scene by scripts/render-poster.mjs, so the static
// path and the live path can never drift into two different art directions.
import posterUrl from "./poster.jpg";

/**
 * Hosts the single WebGL canvas. It is fixed behind the whole document and
 * never scrolls; the act sections slide over it. One canvas for the whole page,
 * never one per section.
 */
export function Stage() {
  const quality = useQuality();
  useDocumentPointer();

  // Announce which path ran. A silent fallback is a correct-looking page with
  // no canvas in it, and nobody finds out.
  useEffect(() => {
    document.documentElement.dataset.scenePath = quality === "off" ? "static" : "webgl";
  }, [quality]);

  // Hand the static plate in index.html over to the React loader. Doing this on
  // mount rather than on first paint of the canvas means the two never overlap.
  useEffect(() => {
    document.documentElement.classList.remove("is-booting");
  }, []);

  if (quality === "off") return <StaticStage />;

  return (
    <div className="stage" aria-hidden="true">
      <Canvas
        shadows
        // A retina display at 2x is four times the fill for a scene that is
        // mostly soft gradients. 1.6 is the honest ceiling on a desktop GPU.
        // Phones and low-core machines land in `low` and are capped at 1.25,
        // which is the number the README quotes. AdaptiveDpr walks either down
        // further if frames start dropping.
        dpr={quality === "high" ? [1, 1.6] : [1, 1.25]}
        gl={{
          antialias: quality === "high",
          powerPreference: "high-performance",
          alpha: false,
          stencil: false,
          depth: true,
        }}
        camera={{ fov: 38, near: 0.1, far: 60, position: [1.6, 1.1, 3.4] }}
        onCreated={({ gl }) => {
          const context = gl.getContext();
          const debug = context.getExtension("WEBGL_debug_renderer_info");
          const renderer = debug ? context.getParameter(debug.UNMASKED_RENDERER_WEBGL) : "unknown";
          console.info(`[scene] webgl · renderer="${renderer}"`);
        }}
      >
        <Suspense fallback={null}>
          <Scene quality={quality} />
        </Suspense>
      </Canvas>
    </div>
  );
}

/** Shown while the model streams in. */
export function StageLoader() {
  const { progress, active } = useProgress();
  const [dismissed, setDismissed] = useState(false);
  const ready = !active && progress >= 100;

  useEffect(() => {
    if (!ready) return undefined;
    // A minimum on screen. On a warm cache the model is ready in about 40ms,
    // and a bar that appears and vanishes inside 40ms reads as a flicker.
    const timer = window.setTimeout(() => setDismissed(true), 520);
    return () => window.clearTimeout(timer);
  }, [ready]);

  // A deadline. One 404 and a loader with no upper bound holds the reader on an
  // empty frame for ever.
  useEffect(() => {
    const deadline = window.setTimeout(() => setDismissed(true), 8000);
    return () => window.clearTimeout(deadline);
  }, []);

  if (dismissed) return null;

  return (
    <div className={`loader${ready ? " is-done" : ""}`} role="status" aria-live="polite">
      <span className="loader__label">Act Director</span>
      <span className="loader__count">{Math.round(progress)}%</span>
      <div className="loader__rail">
        <div className="loader__bar" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

/**
 * No-WebGL and reduced-motion path. A still of the same scene, staged where the
 * live scene parks the product in act one so the copy column stays clear.
 * Render this file out of the live scene rather than art-directing it
 * separately, or the two drift.
 */
function StaticStage() {
  return (
    <div className="stage stage--static" aria-hidden="true">
      <div className="stage__still" style={{ backgroundImage: `url(${posterUrl})` }} />
      <div className="stage__scrim" />
    </div>
  );
}

type Quality = "high" | "low" | "off";

/**
 * Picks a rendering tier once, on mount. Reduced-motion readers and machines
 * without WebGL get the still instead of a stuttering canvas.
 *
 * A software rasteriser is a reason to spend less, not to refuse: it still
 * lands on "low" here, so a headless browser checking the page sees a canvas.
 */
function useQuality(): Quality {
  return useMemo<Quality>(() => {
    if (typeof window === "undefined") return "off";
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "off";

    const probe = document.createElement("canvas");
    const context = probe.getContext("webgl2") ?? probe.getContext("webgl");
    if (!context) return "off";

    const cores = navigator.hardwareConcurrency ?? 4;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const narrow = window.innerWidth < 820;
    if (cores <= 4 || (coarse && narrow)) return "low";
    return "high";
  }, []);
}

/** Feeds normalised pointer position to the director for light parallax. */
function useDocumentPointer() {
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return undefined;
    const onMove = (event: PointerEvent) => {
      setPointer(
        (event.clientX / window.innerWidth) * 2 - 1,
        -((event.clientY / window.innerHeight) * 2 - 1),
      );
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
}
