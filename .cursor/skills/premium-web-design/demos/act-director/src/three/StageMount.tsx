import { Stage, StageLoader } from "./Stage";

/**
 * Entry point for the entire 3D bundle.
 *
 * `App` pulls this in with `lazy()`, which keeps three.js, drei and the effect
 * chain out of the initial chunk. The copy paints first and the canvas fades in
 * behind it.
 */
export default function StageMount() {
  return (
    <>
      <StageLoader />
      <Stage />
    </>
  );
}
