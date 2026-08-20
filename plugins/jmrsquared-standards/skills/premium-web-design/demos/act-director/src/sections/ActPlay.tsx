import { ActCopy, ActShell } from "../components/ActShell";
import { useTapePercent } from "../story/useActScrub";

/**
 * The number in this copy is sampled from the same keyframe track the cartridge
 * moves on, so the two can never disagree. It stays correct with WebGL off.
 *
 * This act stages the product hard right and keeps every word in the left
 * column. A second column here would land on the close-up, which is the one
 * legibility failure that no scrim fixes.
 */
export function ActPlay() {
  const percent = useTapePercent();

  return (
    <ActShell id="play" align="split">
      <ActCopy id="play">
        <div className="readout">
          <span className="readout__value">{percent}%</span>
          <span className="readout__label">
            Cartridge lift, read from the same track
            <br />
            the 3D object moves on
          </span>
        </div>
      </ActCopy>
    </ActShell>
  );
}
