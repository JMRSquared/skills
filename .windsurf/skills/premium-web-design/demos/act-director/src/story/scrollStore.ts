/**
 * Scroll state for the whole story.
 *
 * The 3D scene samples this every frame, so the hot path stays outside React:
 * values live on a module singleton and are mutated in place. React components
 * subscribe only to the coarse "which act is on screen" signal, which changes a
 * handful of times per page rather than sixty times a second.
 *
 * Nothing in this file imports React or three.js. That is deliberate: the same
 * store drives a plain three.js renderer, a GSAP timeline or a canvas 2D scene
 * without a line of change.
 */

export type ActId = "arrive" | "open" | "play" | "order";

/** Author order. Drives both the DOM section order and the act ranges. */
export const ACT_ORDER: readonly ActId[] = ["arrive", "open", "play", "order"] as const;

type ActRange = { top: number; height: number };

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

class ScrollStore {
  /** Smoothed scroll position in pixels, as reported by Lenis. */
  scrollY = 0;
  /** Document progress, 0 at the top, 1 at the very bottom. */
  progress = 0;
  /** Pixels per frame, signed. Feeds inertia in the scene. */
  velocity = 0;
  /** Viewport height, cached so the frame loop never reads layout. */
  viewport = 0;

  activeAct: ActId = ACT_ORDER[0]!;

  private ranges = new Map<ActId, ActRange>();
  private elements = new Map<ActId, HTMLElement>();
  private listeners = new Set<() => void>();

  /** A section calls this from its ref callback. Returns the unregister. */
  registerAct(id: ActId, el: HTMLElement) {
    this.elements.set(id, el);
    this.measure();
    return () => {
      this.elements.delete(id);
      this.ranges.delete(id);
    };
  }

  /** Re-reads layout. Called on register, on resize, and after fonts load. */
  measure() {
    this.viewport = window.innerHeight;
    for (const [id, el] of this.elements) {
      const rect = el.getBoundingClientRect();
      this.ranges.set(id, {
        // Rect plus current scroll, not offsetTop: correct inside any
        // positioned ancestor and correct on the first frame after a reload
        // that restored a scroll position.
        top: rect.top + window.scrollY,
        height: rect.height,
      });
    }
  }

  update(scrollY: number, velocity: number) {
    this.scrollY = scrollY;
    this.velocity = velocity;

    const scrollable = document.documentElement.scrollHeight - this.viewport;
    this.progress = scrollable > 0 ? clamp01(scrollY / scrollable) : 0;

    const next = this.resolveActiveAct();
    if (next !== this.activeAct) {
      this.activeAct = next;
      for (const listener of this.listeners) listener();
    }
  }

  /**
   * Progress through one act: 0 the moment its section reaches the top of the
   * viewport, 1 when its last pixel leaves. Sections are taller than the
   * viewport, so this is the scrub range each chapter animates against.
   */
  actProgress(id: ActId) {
    const range = this.ranges.get(id);
    if (!range) return 0;
    const travel = range.height - this.viewport;
    if (travel <= 0) return clamp01((this.scrollY - range.top) / range.height);
    return clamp01((this.scrollY - range.top) / travel);
  }

  /** True while any part of the act is on screen, with a half-viewport pad. */
  isActVisible(id: ActId) {
    const range = this.ranges.get(id);
    if (!range) return false;
    return (
      this.scrollY + this.viewport * 1.5 > range.top &&
      this.scrollY - this.viewport * 0.5 < range.top + range.height
    );
  }

  /** The act under the middle of the viewport. */
  private resolveActiveAct(): ActId {
    const probe = this.scrollY + this.viewport * 0.5;
    let current: ActId = ACT_ORDER[0]!;
    for (const id of ACT_ORDER) {
      const range = this.ranges.get(id);
      if (range && probe >= range.top) current = id;
    }
    return current;
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getActiveAct = () => this.activeAct;
}

export const scrollStore = new ScrollStore();

/** Frame-rate independent exponential smoothing. */
export function damp(current: number, target: number, lambda: number, delta: number) {
  return current + (target - current) * (1 - Math.exp(-lambda * delta));
}

/** Smoothstep easing over a 0..1 input. */
export function smoothstep(t: number) {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

export { clamp01 };
