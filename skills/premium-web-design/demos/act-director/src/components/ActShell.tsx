import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { act } from "../story/acts";
import { useActSection } from "../story/ScrollProvider";
import { ACT_ORDER } from "../story/scrollStore";
import type { ActId } from "../story/scrollStore";

/**
 * One chapter of the story.
 *
 * The section is taller than the viewport so it owns a stretch of scroll, while
 * its contents pin to the top with `position: sticky`. That gap between the
 * outer height and the pinned height is the scrub range the director animates
 * against.
 *
 * Nothing between this section and the document may create a scroll container:
 * an ancestor with `overflow: hidden`, `contain: paint`, `filter` or any
 * `transform` becomes the containing block and the stage sticks inside a box
 * that has already scrolled past, with no error raised. Use `overflow-x: clip`,
 * never `overflow-x: hidden`.
 */
export function ActShell({ id, children, align = "center" }: ActShellProps) {
  const register = useActSection(id);
  const entry = act(id);

  return (
    <section
      id={`act-${id}`}
      ref={register}
      className="act"
      style={{ minHeight: `${entry.scrollLength}svh` }}
    >
      <div className={`act__pin act__pin--${align}`}>
        {/* On a narrow screen the copy stacks over the product, so it gets a
            scrim. Wide screens keep the raw canvas: there the two sit side by
            side and a scrim would only mute the render. */}
        <div className="act__scrim" />
        <div className="act__column">{children}</div>
      </div>
    </section>
  );
}

/**
 * Fades and lifts its children the first time they reach the viewport.
 *
 * Under reduced motion the content renders in its final state rather than
 * animating faster. A reveal that ships `opacity: 0` and relies on JavaScript to
 * undo it is a blank page whenever the bundle fails, so the initial hidden state
 * is applied from the effect, after the observer exists.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return undefined;
    }

    setArmed(true);

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        setShown(true);
        observer.disconnect();
      },
      { rootMargin: "-8% 0px -8% 0px" },
    );
    observer.observe(node);

    // A scroll that clears the block in a single frame — an anchor jump, a
    // restored position, find-in-page — can leave a block that was already past
    // the viewport stranded at opacity 0.
    const rescue = window.setTimeout(() => setShown(true), 1600);

    return () => {
      observer.disconnect();
      window.clearTimeout(rescue);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal${armed ? " reveal--armed" : ""}${shown ? " is-in" : ""}${className ? ` ${className}` : ""}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

/**
 * Headline plus body. Every act opens with this block.
 *
 * No eyebrow above the headline: the headline names the subject on its own
 * (references/no-slop.md), and "ACT ONE" told the reader nothing the dots do
 * not. The first act's headline is the page's one h1 in the display role;
 * every later act is an h2 in the title role, one size for all of them
 * (references/typographic-hierarchy.md, R7).
 */
export function ActCopy({ id, children }: ActCopyProps) {
  const entry = act(id);
  const isFirst = id === ACT_ORDER[0];
  const Heading = isFirst ? "h1" : "h2";

  return (
    <div className={`copy${isFirst ? " copy--first" : ""}`}>
      <Reveal>
        <Heading className={isFirst ? "display" : "title"}>{entry.headline}</Heading>
      </Reveal>
      <Reveal delay={0.08}>
        <p className="lead">{entry.body}</p>
      </Reveal>
      {children ? <Reveal delay={0.16}>{children}</Reveal> : null}
    </div>
  );
}

type ActShellProps = {
  id: ActId;
  align?: "center" | "bottom" | "split";
  children: ReactNode;
};

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

type ActCopyProps = {
  id: ActId;
  children?: ReactNode;
};
