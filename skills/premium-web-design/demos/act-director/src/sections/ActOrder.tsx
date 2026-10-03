import { ActCopy, ActShell } from "../components/ActShell";
import { scrollToAct } from "../story/ScrollProvider";

export function ActOrder() {
  return (
    <ActShell id="order" align="bottom">
      <ActCopy id="order">
        <div className="row">
          <button type="button" className="button" onClick={() => scrollToAct("arrive")}>
            Go back to the first view
          </button>
        </div>
      </ActCopy>
    </ActShell>
  );
}
