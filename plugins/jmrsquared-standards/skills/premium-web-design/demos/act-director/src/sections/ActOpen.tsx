import { ActCopy, ActShell, Reveal } from "../components/ActShell";
import { CALLOUTS } from "../story/acts";
import { useActStep } from "../story/useActScrub";

/**
 * The teardown. As the cartridge lifts in the canvas behind, each callout
 * lights up in turn, so the list reads as a walk through the object rather than
 * a static feature grid.
 *
 * `useActStep` samples on rAF but sets state only when the index changes: four
 * re-renders across a 260svh act, not one per frame.
 */
export function ActOpen() {
  const active = useActStep("open", CALLOUTS.length, 0.2, 0.9);

  return (
    <ActShell id="open" align="split">
      <div className="grid">
        <ActCopy id="open" />
        <Reveal delay={0.2}>
          <ol className="callouts">
            {CALLOUTS.map((callout, index) => (
              <li
                key={callout.title}
                className={`callout${index <= active ? " is-on" : ""}${index === active ? " is-current" : ""}`}
              >
                <span className="callout__dot" />
                <p className="callout__title">{callout.title}</p>
                <p className="callout__note">{callout.note}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </ActShell>
  );
}
