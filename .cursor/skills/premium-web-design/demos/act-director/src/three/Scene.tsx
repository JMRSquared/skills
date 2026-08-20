import { AdaptiveDpr, Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { SCENE_COLORS, storyState, updateStoryState } from "./director";
import { Product } from "./Product";
import { damp } from "../story/scrollStore";

/**
 * The set. A dark room, three studio lights, one product.
 * Everything else is timing, which lives in `director.ts`.
 *
 * The effect chain is the expensive part here and it is dropped as soon as the
 * measured frame rate says the machine cannot afford it, so a weak GPU degrades
 * to a still-good scene rather than a stuttering one.
 */
export function Scene({ quality }: SceneProps) {
  const [degraded, setDegraded] = useState(false);
  const rich = quality === "high" && !degraded;

  return (
    <>
      {/* Mounted first so its useFrame runs first: every other component in
          this tree reads the state it writes. */}
      <Rig />
      <PerformanceMonitor
        bounds={() => [48, 60]}
        flipflops={2}
        onDecline={() => setDegraded(true)}
        onFallback={() => setDegraded(true)}
      />
      <AdaptiveDpr />

      <color attach="background" args={[SCENE_COLORS.void]} />

      <ambientLight intensity={0.55} />
      <KeyLight />
      <spotLight
        position={[-4, 3.2, -2.4]}
        angle={0.7}
        penumbra={1}
        intensity={22}
        color={SCENE_COLORS.cool}
        distance={16}
      />
      <pointLight position={[0, 1.1, 3]} intensity={4} color={SCENE_COLORS.accentBright} distance={10} />

      {/* Studio reflections with no HDRI fetch. Baked once, on the first frame.
          Swap for <Environment files="./hdris/…hdr" /> when you want a real
          room; /gltf-assets downloads CC0 HDRIs from Poly Haven. */}
      <Environment resolution={rich ? 256 : 128} frames={1}>
        <Lightformer form="rect" intensity={1.3} position={[0, 4, -4]} scale={[9, 5, 1]} color="#cfe0ff" />
        <Lightformer
          form="rect"
          intensity={1.1}
          position={[-5, 2, 2]}
          rotation-y={Math.PI / 2}
          scale={[7, 4, 1]}
          color="#8fb4ff"
        />
        <Lightformer
          form="rect"
          intensity={1.4}
          position={[5, 2.4, 1.6]}
          rotation-y={-Math.PI / 2}
          scale={[7, 4, 1]}
          color="#ffffff"
        />
        <Lightformer form="circle" intensity={1.2} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={4} color="#ffd9c4" />
      </Environment>

      <Product />

      {/* No floor mesh and no ContactShadows. Both cost a visible edge in a
          void set: a directional light's shadow camera has finite extent and
          its boundary lands on a large plane as a straight lit/unlit line, and
          drei's ContactShadows draws its own square plane whose corners show
          the moment the subject does not fill it. For one hero object a baked
          radial sprite is cheaper, has no edge, and never needs a depth pass. */}
      <GroundPool />

      {rich ? (
        <EffectComposer enableNormalPass={false}>
          <Bloom intensity={0.7} luminanceThreshold={0.42} luminanceSmoothing={0.5} mipmapBlur radius={0.66} />
          <Vignette offset={0.3} darkness={0.62} />
        </EffectComposer>
      ) : null}
    </>
  );
}

/**
 * Advances the film and flies the camera.
 *
 * The authored camera tracks give a DIRECTION to shoot from. This solves the
 * distance from the subject size and the share of frame it should fill, which
 * is what makes the same numbers frame correctly on a 21:9 monitor and on a
 * phone held upright.
 */
/**
 * The share of frame HEIGHT below which a subject stops reading as the subject.
 * The camera will crop a wide object's width rather than retreat past this.
 */
const MIN_HEIGHT_SHARE = 0.28;

function Rig() {
  const target = useRef(new THREE.Vector3(0, 0.72, 0));
  const aim = useRef(new THREE.Vector3());

  useFrame(({ camera, size }, delta) => {
    updateStoryState(delta);

    const aspect = size.height > 0 ? size.width / size.height : 1.6;
    storyState.stagingScale = THREE.MathUtils.clamp(aspect / 1.6, 0.16, 1);

    // A phone has width to spare in neither direction, so let the subject claim
    // more of the frame there than it does on a monitor.
    const narrowness = THREE.MathUtils.clamp(1.6 / Math.max(aspect, 0.35) - 1, 0, 2.6);
    const fillW = Math.min(0.92, storyState.fill * (1 + narrowness * 0.55));
    // Height is the scarce axis on a phone: the copy stacks above the product
    // instead of sitting beside it, so the subject gets LESS of the height even
    // as it gets more of the width. Authoring one fill number per act and
    // splitting it per axis here is what keeps a phone from turning into a
    // full-bleed object with the headline lying across it.
    const fillH = Math.max(0.26, Math.min(0.7, storyState.fill) * (1 - narrowness * 0.17));

    // Distance that makes the subject fill its share of the frame on both axes.
    const fov = camera instanceof THREE.PerspectiveCamera ? camera.fov : 38;
    const perUnit = 2 * Math.tan((fov * Math.PI) / 360);
    const fromHeight = storyState.subjectH / fillH / perUnit;
    const fromWidth = storyState.subjectW / fillW / (perUnit * aspect);
    // Height decides whether an object reads; width can be cropped. Standing
    // back far enough to fit a WIDE subject across a narrow screen is what
    // turns a car into a 16%-of-frame smudge on a phone, so the retreat is
    // capped at the distance where the subject still fills MIN_HEIGHT_SHARE of
    // the frame vertically. Past that point the frame crops the width instead.
    const fromMinHeight = storyState.subjectH / MIN_HEIGHT_SHARE / perUnit;
    const distance =
      Math.max(fromHeight, Math.min(fromWidth, fromMinHeight)) +
      // A fast scroll pushes the camera back a touch. Cheap sense of speed.
      storyState.speed * 0.25;

    const visibleH = perUnit * distance;
    const visibleW = visibleH * aspect;

    // Every lateral move, of the subject or of the look-at, has to leave the
    // whole subject on screen. Without this the product walks off a wide
    // display and half off a narrow one.
    const headroom = Math.max(0, visibleW / 2 - storyState.subjectW / 2 - 0.15);
    storyState.maxOffsetX = headroom;

    // Drop the subject into the lower band on a tall screen so the copy above
    // it has clear air, using only frame the subject is not already occupying.
    const spare = Math.max(0, visibleH - storyState.subjectH);
    // Dropping the look-at moves the subject DOWN by the same amount, so the
    // lift can never exceed the room actually below it. The bare 0.62 was tuned
    // against one tall subject and pushed a wide one's roofline off the bottom.
    const lift = Math.min((1 - storyState.stagingScale) * spare * 0.62, Math.max(0, spare / 2 - 0.12));
    const wantedTargetX = THREE.MathUtils.clamp(
      storyState.targetX * storyState.stagingScale,
      -headroom,
      headroom,
    );

    target.current.x = damp(target.current.x, wantedTargetX, 6, delta);
    target.current.y = damp(target.current.y, storyState.targetY + lift, 6, delta);
    target.current.z = damp(target.current.z, storyState.targetZ, 6, delta);

    // CAM_X/Y/Z is a DIRECTION measured from the look-at, not a world position.
    // Its length is thrown away: the solver above owns the distance. Keeping it
    // relative is what stops the authored angle from drifting every time the
    // look-at moves, which is what happens if you subtract the target from a
    // world position and then normalise.
    aim.current
      .set(storyState.camX * storyState.stagingScale, storyState.camY, storyState.camZ)
      .normalize()
      .multiplyScalar(distance);

    const parallaxX = storyState.pointerX * 0.24;
    const parallaxY = storyState.pointerY * 0.15;

    camera.position.x = damp(camera.position.x, target.current.x + aim.current.x + parallaxX, 6, delta);
    camera.position.y = damp(camera.position.y, target.current.y + aim.current.y + parallaxY, 6, delta);
    camera.position.z = damp(camera.position.z, target.current.z + aim.current.z, 6, delta);
    camera.lookAt(target.current);
  });

  return null;
}

/**
 * The key swings with the timeline so each act is lit from a new angle. Its
 * shadow map is regenerated only once the light has actually moved: redrawing
 * every casting mesh on a frame where nothing changed is pure waste.
 */
function KeyLight() {
  const ref = useRef<THREE.DirectionalLight>(null);
  const lastAngle = useRef(Number.NaN);

  useFrame(() => {
    const light = ref.current;
    if (!light) return;

    const angle = 0.7 + storyState.t * 0.3;
    if (Math.abs(angle - lastAngle.current) < 0.01) return;
    lastAngle.current = angle;

    light.position.set(Math.sin(angle) * 5, 4.6, Math.cos(angle) * 5);
    light.shadow.needsUpdate = true;
  });

  return (
    <directionalLight
      ref={ref}
      position={[3.2, 4.6, 3.6]}
      intensity={3.4}
      color="#fff2e6"
      castShadow
      shadow-autoUpdate={false}
      shadow-mapSize={[1024, 1024]}
      shadow-camera-near={0.5}
      shadow-camera-far={20}
      // Wide enough that the frustum boundary never lands inside the frame as
      // a straight lit/unlit edge across the floor.
      shadow-camera-top={9}
      shadow-camera-bottom={-9}
      shadow-camera-left={-9}
      shadow-camera-right={9}
      shadow-bias={-0.0012}
    />
  );
}

/**
 * The grounding: one soft dark sprite under the subject, plus an additive
 * accent pool that comes up with the timeline. Both share a single generated
 * radial-gradient texture, so there is no image to download and no hard circle
 * edge to give the trick away.
 */
function GroundPool() {
  const accentRef = useRef<THREE.MeshBasicMaterial>(null);
  const texture = useMemo(() => createRadialTexture(), []);
  useEffect(() => () => texture.dispose(), [texture]);

  useFrame(() => {
    const material = accentRef.current;
    if (!material) return;
    const pulse = 0.84 + 0.16 * Math.sin(storyState.elapsed * 1.9);
    material.opacity = storyState.glow * pulse * 0.4 * storyState.show;
  });

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} scale={[1.5, 1.05, 1]}>
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial map={texture} color="#000000" transparent opacity={0.85} depthWrite={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]} scale={[2.1, 1.5, 1]}>
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial
          ref={accentRef}
          map={texture}
          color={SCENE_COLORS.accent}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/** A 128px radial falloff, generated once. No network request, no hard edge. */
function createRadialTexture(): THREE.Texture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d")!;
  const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.45, "rgba(255,255,255,0.55)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

type SceneProps = {
  quality: "high" | "low";
};
