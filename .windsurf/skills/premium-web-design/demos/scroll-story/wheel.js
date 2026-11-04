/* The object: a bike wheel in a truing stand. Flick it and it spins with
   inertia, then settles with one repair and its price at the top. Scroll turns
   it through the same repairs by reading the kit's --p on the hero scene.
   Renders only while something moves, so an idle page costs nothing. */
const REPAIRS = [
  { name: 'Puncture fix', price: 'R150' },
  { name: 'Full service', price: 'R950' },
  { name: 'Wheel truing', price: 'R220' },
];

const STEP = (Math.PI * 2) / REPAIRS.length;
const SPRING = 5.5;
const FRICTION = 0.85;
const SNAP_BELOW = 1.1;
const REST = 0.002;
const SLOW_FRAME = 0.1;
const SLOW_FRAMES_ALLOWED = 3;

const mount = document.querySelector('[data-object]');
const canvas = mount.querySelector('canvas');
const scene = document.querySelector('#hero');
const nameEl = document.querySelector('#repair-name');
const priceEl = document.querySelector('#repair-price');
const chips = REPAIRS.map((_, i) => mount.querySelector(`[data-repair="${i}"]`));
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

const start = async () => {
  const THREE = await import('three');
  const { RoomEnvironment } = await import('three/addons/environments/RoomEnvironment.js');

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;

  const world = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  world.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  world.environmentIntensity = 0.75;

  const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 40);
  camera.position.set(0, 0.25, 7.2);
  camera.lookAt(0, -0.08, 0);

  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(-1.2, 7, 3.2);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.radius = 14;
  key.shadow.blurSamples = 12;
  key.shadow.bias = -0.0004;
  key.shadow.camera.left = key.shadow.camera.bottom = -3;
  key.shadow.camera.right = key.shadow.camera.top = 3;
  world.add(key);

  const chrome = new THREE.MeshStandardMaterial({ color: 0xc9ccd1, metalness: 1, roughness: 0.22 });
  const steel = new THREE.MeshStandardMaterial({ color: 0x8f949b, metalness: 1, roughness: 0.38 });
  const alloy = new THREE.MeshStandardMaterial({ color: 0x1b1c1f, metalness: 0.75, roughness: 0.34 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x17171a, metalness: 0, roughness: 0.82 });
  const gum = new THREE.MeshStandardMaterial({ color: 0xa97c50, metalness: 0, roughness: 0.75 });
  const paint = new THREE.MeshStandardMaterial({ color: 0x24262b, metalness: 0.55, roughness: 0.42 });

  const shadowed = (mesh) => { mesh.castShadow = true; return mesh; };
  const wheel = new THREE.Group();

  const torus = (major, tube, material, squashZ = 1) => {
    const mesh = shadowed(new THREE.Mesh(new THREE.TorusGeometry(major, tube, 28, 220), material));
    mesh.scale.z = squashZ;
    wheel.add(mesh);
    return mesh;
  };
  torus(1, 0.058, rubber);
  torus(0.962, 0.05, gum, 1.08);
  torus(0.925, 0.03, alloy, 1.25);

  /* Tread knobs catch the light, and that is what makes the spin readable. */
  const knobs = new THREE.InstancedMesh(new THREE.BoxGeometry(0.016, 0.014, 0.05), rubber, 240);
  const place = new THREE.Object3D();
  for (let i = 0; i < 240; i++) {
    const a = (i / 240) * Math.PI * 2;
    place.position.set(Math.cos(a) * 1.056, Math.sin(a) * 1.056, 0);
    place.rotation.z = a;
    place.updateMatrix();
    knobs.setMatrixAt(i, place.matrix);
  }
  knobs.castShadow = true;
  wheel.add(knobs);

  const lathe = (profile, material) => {
    const points = profile.map(([r, z]) => new THREE.Vector2(r, z));
    const mesh = shadowed(new THREE.Mesh(new THREE.LatheGeometry(points, 56), material));
    mesh.rotation.x = Math.PI / 2;
    wheel.add(mesh);
    return mesh;
  };
  lathe([[0.012, -0.11], [0.03, -0.11], [0.034, -0.075], [0.075, -0.07], [0.078, -0.058], [0.036, -0.052], [0.03, 0], [0.036, 0.052], [0.078, 0.058], [0.075, 0.07], [0.034, 0.075], [0.03, 0.11], [0.012, 0.11]], chrome);

  /* Laced spokes: each leaves a hub flange tangentially and meets the rim. */
  const spoke = new THREE.CylinderGeometry(0.0036, 0.0036, 1, 8);
  const nipple = new THREE.CylinderGeometry(0.0075, 0.0075, 0.03, 8);
  const up = new THREE.Vector3(0, 1, 0);
  const COUNT = 32;
  for (let i = 0; i < COUNT; i++) {
    const a = (i / COUNT) * Math.PI * 2;
    const side = i % 2 ? 1 : -1;
    const lean = (i % 4 < 2 ? 1 : -1) * 1.05;
    const from = new THREE.Vector3(Math.cos(a + lean) * 0.07, Math.sin(a + lean) * 0.07, side * 0.062);
    const to = new THREE.Vector3(Math.cos(a) * 0.905, Math.sin(a) * 0.905, 0);
    const dir = to.clone().sub(from);
    const rod = shadowed(new THREE.Mesh(spoke, chrome));
    rod.scale.y = dir.length();
    rod.position.copy(from).addScaledVector(dir, 0.5);
    rod.quaternion.setFromUnitVectors(up, dir.clone().normalize());
    wheel.add(rod);
    const nut = new THREE.Mesh(nipple, steel);
    nut.position.copy(to);
    nut.quaternion.copy(rod.quaternion);
    wheel.add(nut);
  }

  /* Cassette and valve: details that say "this is a real rear wheel". */
  for (let i = 0; i < 9; i++) {
    const r = 0.145 - i * 0.0105;
    const cog = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.0055, 40), i % 2 ? chrome : steel));
    cog.rotation.x = Math.PI / 2;
    cog.position.z = -0.098 + i * 0.0072;
    wheel.add(cog);
  }
  const valve = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.08, 10), chrome));
  valve.position.set(0, 0.875, 0);
  wheel.add(valve);

  /* The stand does not turn. */
  const stand = new THREE.Group();
  const tube = (from, to, radius, material) => {
    const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
    const dir = b.clone().sub(a);
    const mesh = shadowed(new THREE.Mesh(new THREE.CapsuleGeometry(radius, dir.length(), 8, 16), material));
    mesh.position.copy(a).addScaledVector(dir, 0.5);
    mesh.quaternion.setFromUnitVectors(up, dir.normalize());
    stand.add(mesh);
  };
  for (const z of [-0.135, 0.135]) tube([0, 0, z], [0, -1.17, z * 1.5], 0.019, paint);
  tube([-0.42, -1.2, 0], [0.42, -1.2, 0], 0.024, alloy);
  tube([0, -1.2, -0.3], [0, -1.2, 0.3], 0.024, alloy);
  tube([0, 0, -0.16], [0, 0, 0.16], 0.009, steel);

  const rig = new THREE.Group();
  rig.add(wheel, stand);
  rig.rotation.y = -0.52;
  rig.rotation.x = 0.03;
  world.add(rig);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.ShadowMaterial({ opacity: 0.17 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.225;
  floor.receiveShadow = true;
  world.add(floor);

  /* State. theta is the wheel's turn. Scroll sets one part of the target and
     the pointer sets the other, so neither fights the other. */
  let theta = still ? 0 : -2.4;
  let omega = 0;
  let scrollTurn = 0;
  let userTurn = 0;
  let grabbed = false;
  let coasting = false;
  let lastAngle = 0;
  let lastTime = 0;
  let visible = true;
  let running = false;
  let active = -1;
  let slowFrames = 0;
  let degraded = false;

  const target = () => scrollTurn + userTurn;
  const repairAt = (turn) => ((Math.round(-turn / STEP) % REPAIRS.length) + REPAIRS.length) % REPAIRS.length;

  const showRepair = () => {
    const now = repairAt(theta);
    if (now === active) return;
    active = now;
    nameEl.textContent = REPAIRS[now].name;
    priceEl.textContent = REPAIRS[now].price;
    chips.forEach((chip, i) => chip.setAttribute('aria-pressed', String(i === now)));
  };

  const rimPoint = new THREE.Vector3();
  const placeChips = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    chips.forEach((chip, i) => {
      const a = theta + i * STEP + Math.PI / 2;
      /* rig, not wheel: a already includes the spin. */
      rimPoint.set(Math.cos(a) * 1.17, Math.sin(a) * 1.17, 0).applyMatrix4(rig.matrixWorld).project(camera);
      chip.style.transform = `translate(${(rimPoint.x * 0.5 + 0.5) * w}px, ${(-rimPoint.y * 0.5 + 0.5) * h}px) translate(-50%, -50%)`;
    });
  };

  const draw = () => {
    wheel.rotation.z = theta;
    rig.updateMatrixWorld(true);
    renderer.render(world, camera);
    placeChips();
    showRepair();
  };

  const readScroll = () => {
    if (still) return;
    const p = parseFloat(scene.style.getPropertyValue('--p')) || 0;
    const next = -Math.min(1, p * 1.25) * STEP * (REPAIRS.length - 1);
    if (Math.abs(next - scrollTurn) > 1e-4) {
      scrollTurn = next;
      coasting = false;
      wake();
    }
  };

  /* On a slow GPU a physics loop becomes slow motion. Drop the moving shadow
     and go straight to rest, so the page stays usable and the object still works. */
  const degrade = () => {
    degraded = true;
    renderer.setPixelRatio(1);
    renderer.shadowMap.autoUpdate = false;
    coasting = false;
    omega = 0;
    userTurn = Math.round((theta - scrollTurn) / STEP) * STEP;
    theta = target();
    resize();
  };

  const frame = (time) => {
    const elapsed = (time - lastTime) / 1000 || 0.016;
    const dt = Math.min(0.05, elapsed);
    lastTime = time;
    if (!degraded && elapsed > SLOW_FRAME && ++slowFrames > SLOW_FRAMES_ALLOWED) degrade();
    if (degraded && !grabbed) {
      theta = target();
      omega = 0;
      coasting = false;
    }
    if (!grabbed) {
      if (coasting) {
        omega *= Math.exp(-FRICTION * dt);
        if (Math.abs(omega) < SNAP_BELOW) {
          coasting = false;
          userTurn = Math.round((theta - scrollTurn) / STEP) * STEP;
        }
      } else {
        omega += (SPRING * SPRING * (target() - theta) - 2 * SPRING * omega) * dt;
      }
      theta += omega * dt;
    }
    draw();
    const resting = !grabbed && !coasting && Math.abs(omega) < REST && Math.abs(target() - theta) < REST;
    if (resting || !visible) { running = false; return; }
    requestAnimationFrame(frame);
  };

  function wake() {
    if (running || !visible) return;
    running = true;
    lastTime = performance.now();
    requestAnimationFrame(frame);
  }

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    /* Keep the whole wheel in frame in a narrow column. */
    camera.fov = w / h < 1 ? 24 / Math.max(w / h, 0.55) : 24;
    camera.updateProjectionMatrix();
    draw();
  };

  const pointerAngle = (e) => {
    const box = canvas.getBoundingClientRect();
    rimPoint.set(0, 0, 0).applyMatrix4(wheel.matrixWorld).project(camera);
    const cx = box.left + (rimPoint.x * 0.5 + 0.5) * box.width;
    const cy = box.top + (-rimPoint.y * 0.5 + 0.5) * box.height;
    return Math.atan2(cy - e.clientY, e.clientX - cx);
  };

  canvas.addEventListener('pointerdown', (e) => {
    grabbed = true;
    coasting = false;
    omega = 0;
    lastAngle = pointerAngle(e);
    lastTime = performance.now();
    canvas.setPointerCapture(e.pointerId);
    canvas.classList.add('is-grabbed');
    wake();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!grabbed) return;
    const angle = pointerAngle(e);
    let delta = angle - lastAngle;
    if (delta > Math.PI) delta -= Math.PI * 2;
    if (delta < -Math.PI) delta += Math.PI * 2;
    lastAngle = angle;
    theta += delta;
    const now = performance.now();
    const dt = Math.max(0.008, (now - lastTime) / 1000);
    lastTime = now;
    omega = omega * 0.6 + (delta / dt) * 0.4;
  });
  const release = () => {
    if (!grabbed) return;
    grabbed = false;
    canvas.classList.remove('is-grabbed');
    coasting = true;
    if (degraded) userTurn = Math.round((theta - scrollTurn + Math.sign(omega) * STEP) / STEP) * STEP;
    wake();
  };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  /* A small nudge on arrival, so the wheel invites the hand. */
  canvas.addEventListener('pointerenter', () => {
    if (still || grabbed || coasting) return;
    omega += 0.7;
    wake();
  });

  const goTo = (index) => {
    const from = repairAt(theta);
    let move = ((index - from + REPAIRS.length) % REPAIRS.length);
    if (move === 2) move = -1;
    userTurn -= move * STEP;
    coasting = false;
    if (still) theta = target();
    wake();
    if (still) draw();
  };
  chips.forEach((chip, i) => chip.addEventListener('click', () => goTo(i)));
  mount.addEventListener('keydown', (e) => {
    const move = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!move) return;
    e.preventDefault();
    goTo((active + move + REPAIRS.length) % REPAIRS.length);
    chips[(active + move + REPAIRS.length) % REPAIRS.length].focus();
  });

  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) wake();
  }).observe(canvas);
  addEventListener('scroll', readScroll, { passive: true });
  /* The kit damps --p after scroll stops, so keep reading while it settles. */
  new MutationObserver(readScroll).observe(scene, { attributes: true, attributeFilter: ['style'] });

  resize();
  mount.classList.add('is-ready');
  readScroll();
  wake();
};

start().catch((error) => {
  /* The price list further down the page still has everything. */
  mount.classList.add('is-unavailable');
  console.info('[wheel] 3D unavailable, showing the price list only:', error.message);
});
