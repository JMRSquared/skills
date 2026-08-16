import Lenis from "lenis";
import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import type { ReactNode, RefCallback } from "react";
import { scrollStore } from "./scrollStore";
import type { ActId } from "./scrollStore";

/**
 * Owns smooth scrolling and the single requestAnimationFrame loop that feeds
 * `scrollStore`. The canvas runs its own loop and reads the store, so the two
 * never fight over frame ordering.
 */
export function ScrollProvider({ children }: ScrollProviderProps) {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const lenis = new Lenis({
      // Reduced motion keeps the document scrolling natively. The store still
      // needs to be fed, so Lenis stays mounted with its smoothing disabled
      // rather than being skipped.
      duration: reduced ? 0 : 0.9,
      smoothWheel: !reduced,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      autoRaf: false,
    });

    scrollStore.measure();
    scrollStore.update(window.scrollY, 0);

    lenis.on("scroll", ({ scroll, velocity }: { scroll: number; velocity: number }) => {
      scrollStore.update(scroll, velocity);
    });

    let frame = requestAnimationFrame(function raf(time: number) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    });

    const remeasure = () => {
      scrollStore.measure();
      scrollStore.update(scrollStore.scrollY, 0);
      lenis.resize();
    };

    // Lenis only emits for scrolls IT drives. Anchor jumps, scrollbar drags,
    // find-in-page, keyboard paging, and every `window.scrollTo` a headless
    // browser makes move the document without ever reaching the handler above,
    // and the story silently stays on whatever frame it was left at. This
    // listener is the one that keeps the store honest; the Lenis handler only
    // adds velocity. Both write the same field, so the later one wins and they
    // cannot disagree.
    const onNativeScroll = () => scrollStore.update(window.scrollY, 0);
    window.addEventListener("scroll", onNativeScroll, { passive: true });

    window.addEventListener("resize", remeasure);
    // iOS resizes the visual viewport after `resize` fires on rotate.
    const onOrientation = () => window.setTimeout(remeasure, 300);
    window.addEventListener("orientationchange", onOrientation);
    document.fonts?.ready.then(remeasure).catch(() => undefined);

    // Sections change height as images, fonts and the canvas settle in.
    const observer = new ResizeObserver(remeasure);
    observer.observe(document.body);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onNativeScroll);
      window.removeEventListener("resize", remeasure);
      window.removeEventListener("orientationchange", onOrientation);
      observer.disconnect();
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}

/** Registers a DOM section as an act and keeps its measured range current. */
export function useActSection(id: ActId): RefCallback<HTMLElement> {
  const cleanupRef = useRef<(() => void) | null>(null);

  return useCallback(
    (node: HTMLElement | null) => {
      cleanupRef.current?.();
      cleanupRef.current = null;
      if (node) cleanupRef.current = scrollStore.registerAct(id, node);
    },
    [id],
  );
}

/** Re-renders only when the act under the viewport centre changes. */
export function useActiveAct(): ActId {
  return useSyncExternalStore(
    (listener) => scrollStore.subscribe(listener),
    scrollStore.getActiveAct,
    () => "arrive" as const,
  );
}

/** Scrolls to an act's section. Used by the nav and the CTA buttons. */
export function scrollToAct(id: ActId) {
  document.getElementById(`act-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

type ScrollProviderProps = {
  children: ReactNode;
};
