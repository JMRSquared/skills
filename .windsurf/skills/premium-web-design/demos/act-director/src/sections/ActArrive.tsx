import { ActCopy, ActShell } from "../components/ActShell";
import { scrollToAct } from "../story/ScrollProvider";

export function ActArrive() {
  return (
    <ActShell id="arrive" align="split">
      <ActCopy id="arrive">
        <div className="row">
          <button type="button" className="button" onClick={() => scrollToAct("open")}>
            Watch the tape lift out
          </button>
          <button type="button" className="button button--ghost" onClick={() => scrollToAct("order")}>
            Skip to the closing view
          </button>
        </div>
      </ActCopy>
    </ActShell>
  );
}
