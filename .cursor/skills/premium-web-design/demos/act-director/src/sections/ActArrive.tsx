import { ActCopy, ActShell, Reveal } from "../components/ActShell";
import { scrollToAct } from "../story/ScrollProvider";

export function ActArrive() {
  return (
    <ActShell id="arrive" align="split">
      <ActCopy id="arrive">
        <div className="row">
          <button type="button" className="button" onClick={() => scrollToAct("order")}>
            Skip to the end
          </button>
          <button type="button" className="button button--ghost" onClick={() => scrollToAct("open")}>
            Start the story
          </button>
        </div>
      </ActCopy>
      <Reveal delay={0.4} className="cue">
        <span className="cue__rail">
          <span className="cue__dot" />
        </span>
        <span>Scroll</span>
      </Reveal>
    </ActShell>
  );
}
