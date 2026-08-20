import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { storyState } from "./director";

export const MODEL_URL = "./models/cassette_player/cassette_player_1k.gltf";

/**
 * The product.
 *
 * The source model is in metres and about 240mm long, which is too small to
 * light comfortably next to a 1-unit floor grid, so it lives inside a group
 * scaled to scene units. The loaded graph is kept intact rather than flattened:
 * detaching a mesh from its node drops whatever transform that node carried.
 *
 * Poly Haven ships real PBR materials with this file, so nothing here replaces
 * them. When a model arrives with no materials — a CAD export, a scan — build
 * them in one place keyed by node name prefix, the way `three/materials.ts` in
 * the reference build does, so a still renderer can read the same table.
 */

const SCALE = 6;
/**
 * The glTF nodes carry a +90 degree X rotation, so the file's Z is the scene's
 * Y and the body reads as an upright slab 0.129 x 0.237 x 0.049 metres. Its
 * base sits at -0.111 in model space, which is 0.666 scene units below the
 * floor: measure this, never guess it, or the product stands in the ground.
 */
const BASE_LIFT = 0.111 * SCALE;
/** How far the cartridge travels when it lifts clear, in scene units. */
const LIFT = 0.5;

export function Product() {
  const gltf = useGLTF(MODEL_URL);
  const outerRef = useRef<THREE.Group>(null);
  const tapeRef = useRef<THREE.Object3D | null>(null);

  // Clone so a StrictMode remount, or any second instance, never fights the
  // cached scene over its transforms.
  const model = useMemo(() => gltf.scene.clone(true), [gltf.scene]);

  const materials = useMemo(() => {
    const found = new Set<THREE.Material>();
    model.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.castShadow = true;
      object.receiveShadow = true;
      // The model's own maps are kept; only the environment response is
      // pushed, because the studio here is dimmer than Poly Haven's.
      const material = object.material as THREE.Material;
      if (material instanceof THREE.MeshStandardMaterial) {
        material.envMapIntensity = 1.35;
      }
      found.add(material);
    });
    return [...found];
  }, [model]);

  const tapeBase = useMemo(() => {
    const node = model.getObjectByName("cassette_player_tape") ?? null;
    tapeRef.current = node;
    return node ? node.position.clone() : new THREE.Vector3();
  }, [model]);

  useEffect(() => {
    return () => {
      for (const material of materials) material.dispose();
    };
  }, [materials]);

  useFrame(() => {
    const group = outerRef.current;
    if (!group) return;

    const show = storyState.show;
    group.visible = show > 0.01;
    if (!group.visible) return;

    applyFade(materials, show);

    // Keep the product inside the frame however wide the display is. The
    // solver publishes the limit; the staging never gets to override it.
    const offset = storyState.bodyX * storyState.stagingScale;
    const limit = storyState.maxOffsetX;
    group.position.x = THREE.MathUtils.clamp(offset, -limit, limit);
    group.position.y = storyState.bodyY;

    group.rotation.y = storyState.spin + storyState.pointerX * 0.1;
    group.rotation.x = storyState.tilt + storyState.pointerY * 0.05;

    const tape = tapeRef.current;
    if (tape) {
      const lift = storyState.tapeLift;
      // The node lives in the model's own millimetre-ish space, so the lift is
      // divided back out of the group scale rather than being applied twice.
      // The node position is in the model's own space, so the scene-unit lift
      // is divided back out of the group scale rather than applied twice.
      tape.position.set(
        tapeBase.x,
        tapeBase.y + (lift * LIFT) / SCALE,
        tapeBase.z + (lift * LIFT * 0.55) / SCALE,
      );
      tape.rotation.z = storyState.tapeSpin * lift;
    }

  });

  return (
    <group ref={outerRef} position={[storyState.bodyX, storyState.bodyY, 0]}>
      <group scale={SCALE} position={[0, BASE_LIFT, 0]}>
        <primitive object={model} />
      </group>
    </group>
  );
}

/**
 * Fades every part together. Transparency is switched off again at full
 * opacity so the common case never pays for depth sorting.
 */
function applyFade(materials: readonly THREE.Material[], show: number) {
  const wantsTransparency = show <= 0.99;
  for (const material of materials) {
    if (material.transparent !== wantsTransparency) {
      material.transparent = wantsTransparency;
      material.needsUpdate = true;
    }
    material.opacity = show;
    // Depth writing stays on through the fade. Without it the shell stops
    // occluding and the internals show through a nearly solid object.
    material.depthWrite = true;
  }
}

useGLTF.preload(MODEL_URL);
