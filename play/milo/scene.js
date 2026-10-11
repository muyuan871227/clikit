/* An original, softly sculpted companion. No downloaded character assets. */
const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const cleanColor = value => /^#[0-9a-f]{6}$/i.test(value) ? value : '#9dcbb6';

export async function createScene(container, options = {}) {
  // The illustrated version appears immediately, including while WebGL loads.
  const fallback = createIllustration(container, options);
  try {
    const THREE = await Promise.race([
      import(THREE_URL),
      new Promise((_, reject) => setTimeout(() => reject(new Error('3D loading timeout')), 9000)),
    ]);
    const scene = createThreeScene(THREE, container, options);
    fallback.dispose();
    return scene;
  } catch (error) {
    console.info('Companion is using its illustrated rendering mode:', error.message);
    container.dataset.renderer = 'illustration';
    return fallback;
  }
}

function createThreeScene(T, container, options) {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.6));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.26;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;position:absolute;inset:0;touch-action:pan-y;';
  renderer.domElement.setAttribute('aria-label', '可触摸的三维外星伙伴');
  renderer.domElement.setAttribute('role', 'img');
  container.appendChild(renderer.domElement);
  container.dataset.renderer = 'webgl';

  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(34, 1, .1, 60);
  camera.position.set(0, 2.75, 8.7);
  camera.lookAt(0, 1.7, 0);
  const ambient = new T.HemisphereLight(0xfff7e6, 0x859b8a, 2.45);
  scene.add(ambient);
  const key = new T.DirectionalLight(0xfff4df, 3.2);
  key.position.set(-3.8, 7, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -5, right: 5, top: 6, bottom: -4, near: .1, far: 20 });
  key.shadow.bias = -.001;
  key.shadow.normalBias = .025;
  key.shadow.radius = 5;
  scene.add(key);
  const fill = new T.DirectionalLight(0xe7edff, 1.3);
  fill.position.set(4, 3, -3);
  scene.add(fill);

  const material = new T.MeshStandardMaterial({ color: '#9dcbb6', roughness: .88, metalness: 0 });
  material.onBeforeCompile = shader => {
    shader.uniforms.crownColor = { value: new T.Color('#eed7a2') };
    shader.uniforms.shirtColor = { value: new T.Color('#657c86') };
    shader.vertexShader = 'varying vec3 sculptPoint;\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nsculptPoint = position;');
    shader.fragmentShader = 'varying vec3 sculptPoint;\nuniform vec3 crownColor;\nuniform vec3 shirtColor;\n' + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
      float crown = max(smoothstep(3.04, 3.38, sculptPoint.y), smoothstep(.76, 1.03, abs(sculptPoint.x)) * smoothstep(2.55, 2.8, sculptPoint.y));
      diffuseColor.rgb = mix(diffuseColor.rgb, crownColor, crown * .9);
      float top = (1.0 - smoothstep(1.94, 1.955, sculptPoint.y)) * smoothstep(1.16, 1.175, sculptPoint.y) * (1.0 - smoothstep(.48, .50, abs(sculptPoint.x)));
      diffuseColor.rgb = mix(diffuseColor.rgb, shirtColor, top);
    `);
  };
  const bodyGeometry = sculptGeometry(T);
  const character = new T.Group();
  scene.add(character);
  const root = new T.Bone();
  const head = new T.Bone(); head.position.y = 2.05; root.add(head);
  const leftArm = new T.Bone(); leftArm.position.set(-.51, 1.85, 0); root.add(leftArm);
  const rightArm = new T.Bone(); rightArm.position.set(.51, 1.85, 0); root.add(rightArm);
  const leftLeg = new T.Bone(); leftLeg.position.set(-.3, .91, 0); root.add(leftLeg);
  const rightLeg = new T.Bone(); rightLeg.position.set(.3, .91, 0); root.add(rightLeg);
  const body = new T.SkinnedMesh(bodyGeometry, material);
  body.add(root);
  body.bind(new T.Skeleton([root, head, leftArm, rightArm, leftLeg, rightLeg]));
  body.castShadow = true;
  body.receiveShadow = true;
  character.add(body);
  const collar = new T.Mesh(new T.TorusGeometry(.34, .062, 14, 48), new T.MeshStandardMaterial({ color: '#efd9a8', roughness: .9 }));
  collar.rotation.x = Math.PI / 2; collar.scale.y = .92; collar.position.y = 1.95;
  character.add(collar);

  const dark = new T.MeshStandardMaterial({ color: '#263b31', roughness: .34 });
  const whites = new T.MeshStandardMaterial({ color: '#fffef1', roughness: .8 });
  const glint = new T.MeshBasicMaterial({ color: '#fffef0' });
  const face = new T.Group(); head.add(face);
  const eyes = [];
  for (const side of [-1, 1]) {
    const eye = new T.Group(); eye.position.set(side * .255, .45, .484);
    const white = new T.Mesh(new T.SphereGeometry(1, 24, 20), whites);
    white.scale.set(.137, .15, .061); eye.add(white);
    const oval = new T.Mesh(new T.SphereGeometry(1, 24, 20), dark);
    oval.position.set(0, -.006, .052); oval.scale.set(.075, .094, .031); eye.add(oval);
    const shine = new T.Mesh(new T.SphereGeometry(1, 12, 10), glint);
    shine.position.set(-.021, .024, .08); shine.scale.set(.019, .024, .01); eye.add(shine);
    face.add(eye); eyes.push(eye);
    const browPath = new T.CatmullRomCurve3([new T.Vector3(side * .255 - .078, .665, .465), new T.Vector3(side * .255, .681, .481), new T.Vector3(side * .255 + .078, .665, .465)]);
    const brow = new T.Mesh(new T.TubeGeometry(browPath, 12, .02, 8, false), dark); face.add(brow);
  }
  const mouth = new T.Group(); mouth.position.set(0, .23, .526); face.add(mouth);
  const smileCurve = new T.CatmullRomCurve3([
    new T.Vector3(-.072, .024, 0), new T.Vector3(-.04, -.006, .003),
    new T.Vector3(0, -.014, .004), new T.Vector3(.04, -.006, .003), new T.Vector3(.072, .024, 0),
  ]);
  const smile = new T.Mesh(new T.TubeGeometry(smileCurve, 20, .011, 8, false), dark);
  mouth.add(smile);
  const speakingMouth = new T.Mesh(new T.SphereGeometry(1, 20, 14), dark);
  speakingMouth.scale.set(.055, .04, .018); speakingMouth.visible = false; mouth.add(speakingMouth);
  // Soft cheek color is translucently painted, rather than raised plastic discs.
  const blush = new T.MeshBasicMaterial({ color: '#e9b9a5', transparent: true, opacity: .23, depthWrite: false });
  for (const side of [-1, 1]) {
    const cheek = new T.Mesh(new T.CircleGeometry(.088, 32), blush);
    cheek.position.set(side * .42, .28, .417); cheek.rotation.y = side * .42;
    cheek.scale.y = .53; face.add(cheek);
  }

  const world = new T.Group(); scene.add(world);
  const groundMaterial = new T.MeshStandardMaterial({ color: '#bacd9b', roughness: 1 });
  const ground = new T.Mesh(new T.SphereGeometry(1, 80, 40), groundMaterial);
  ground.scale.set(9, 2.4, 7); ground.position.set(0, -2.4, 0);
  ground.receiveShadow = true; world.add(ground);
  const shadowCanvas = document.createElement('canvas'); shadowCanvas.width = shadowCanvas.height = 128;
  const ctx = shadowCanvas.getContext('2d');
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(34,53,33,.25)'); gradient.addColorStop(.55, 'rgba(34,53,33,.09)'); gradient.addColorStop(1, 'rgba(34,53,33,0)');
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 128, 128);
  const shadowTexture = new T.CanvasTexture(shadowCanvas);
  const shadow = new T.Mesh(new T.PlaneGeometry(2.3, 1.65), new T.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.set(0, .034, 0); world.add(shadow);

  const cloudMaterial = new T.MeshStandardMaterial({ color: '#fffbea', roughness: 1 });
  const clouds = [];
  for (const [x, y, z, size] of [[-3.25, 3.48, -3, .65], [3.45, 4.15, -5, .8]]) {
    const cloud = new T.Group(); cloud.position.set(x, y, z); cloud.scale.setScalar(size);
    for (const [dx, dy, s] of [[-.45, 0, .52], [0, .17, .64], [.5, -.04, .42]]) {
      const puff = new T.Mesh(new T.SphereGeometry(1, 24, 16), cloudMaterial);
      puff.position.set(dx, dy, 0); puff.scale.set(s, s * .62, s * .55); cloud.add(puff);
    }
    world.add(cloud); clouds.push(cloud);
  }
  const orb = new T.Mesh(new T.SphereGeometry(.45, 32, 24), new T.MeshBasicMaterial({ color: '#fff4ca' }));
  orb.position.set(2.6, 3.1, -5); world.add(orb);
  const plants = new T.Group(); world.add(plants);
  const stemMaterial = new T.MeshStandardMaterial({ color: '#6d955b', roughness: .95 });
  const petalMaterial = new T.MeshStandardMaterial({ color: '#fff1d2', roughness: .9 });
  const flowerCenter = new T.MeshStandardMaterial({ color: '#e8bd71', roughness: .9 });
  const flowerGeometry = new T.SphereGeometry(1, 12, 8);
  function makeFlower(x, z, scale, index) {
    const flower = new T.Group();
    const groundY = -2.4 + 2.4 * Math.sqrt(Math.max(0, 1 - (x / 9) ** 2 - (z / 7) ** 2));
    flower.position.set(x, groundY, z); flower.scale.setScalar(scale);
    const stem = new T.Mesh(new T.CylinderGeometry(.012, .018, .34, 7), stemMaterial);
    stem.position.y = .17; flower.add(stem);
    const leaf = new T.Mesh(flowerGeometry, stemMaterial);
    leaf.scale.set(.11, .034, .05); leaf.position.set(.06, .13, 0); leaf.rotation.z = .5; flower.add(leaf);
    const bloom = new T.Group(); bloom.position.y = .36; bloom.rotation.set(-.3, 0, index * .7); flower.add(bloom);
    for (let i = 0; i < 5; i++) {
      const angle = i * Math.PI * 2 / 5;
      const petal = new T.Mesh(flowerGeometry, petalMaterial);
      petal.position.set(Math.cos(angle) * .07, Math.sin(angle) * .07, 0);
      petal.scale.set(.072, .058, .028); petal.rotation.z = angle; bloom.add(petal);
    }
    const center = new T.Mesh(flowerGeometry, flowerCenter); center.scale.set(.038, .038, .033); center.position.z = .025; bloom.add(center);
    plants.add(flower);
  }
  const flowerPositions = [[-1.5, .15, 1], [1.35, -.1, .75], [-2.2, -.6, .7], [2.2, -.8, .82], [-.96, 1, .66], [2.8, -1.8, .75], [-2.8, -1.5, .8], [1.9, .9, .55], [-3.2, -.3, .6], [3.25, .1, .8], [-1.8, 1.7, .52], [2.9, 1.3, .65], [-1.18, .6, .66], [1.1, .8, .71], [-1.65, -.65, .59], [1.64, -.55, .63], [-.82, 1.45, .51], [.83, 1.5, .55], [-1.38, 1.4, .49], [1.39, 1.6, .56], [-1.04, -.8, .63], [1.02, -.85, .58], [-1.77, .55, .46], [1.73, .5, .52]];
  flowerPositions.forEach(([x, z, scale], i) => makeFlower(x, z, scale, i));

  let mood = 'calm', speaking = false, plantsCount = 3, disposed = false;
  let interactionTime = -100, waveTime = -100, blinkAt = 2.2, blinkStart = -100;
  let elapsed = 0, lastTime = performance.now(), raf;
  const pointer = new T.Vector2(), look = new T.Vector2();
  const raycaster = new T.Raycaster();
  function pointerMove(event) {
    const r = renderer.domElement.getBoundingClientRect();
    pointer.set(clamp((event.clientX - r.left) / r.width * 2 - 1, -1, 1), clamp(1 - (event.clientY - r.top) / r.height * 2, -1, 1));
  }
  function touch(event) {
    pointerMove(event); raycaster.setFromCamera(pointer, camera);
    if (raycaster.intersectObject(body).length) { interactionTime = elapsed; options.onTouch?.(); }
  }
  const leave = () => pointer.set(0, 0);
  renderer.domElement.addEventListener('pointermove', pointerMove);
  renderer.domElement.addEventListener('pointerup', touch);
  renderer.domElement.addEventListener('pointerleave', leave);
  function resize() {
    const { width, height } = container.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false); camera.aspect = width / height;
    const mobile = camera.aspect < .8;
    camera.position.z = mobile ? 12.1 : 10.8;
    camera.lookAt(0, mobile ? 1.28 : 1.12, 0);
    camera.updateProjectionMatrix();
  }
  const observer = new ResizeObserver(resize); observer.observe(container); resize();
  function animate(now) {
    if (disposed) return;
    const dt = Math.min((now - lastTime) / 1000, .06); lastTime = now;
    if (!document.hidden) elapsed += dt;
    const t = elapsed;
    look.lerp(pointer, 1 - Math.exp(-dt * 3));
    const breathing = reducedMotion ? 0 : Math.sin(t * 1.7) * .014;
    const jumpT = t - interactionTime;
    const jump = !reducedMotion && jumpT < .8 ? Math.sin(clamp(jumpT / .8, 0, 1) * Math.PI) * .34 : 0;
    character.position.y = -.28 + jump;
    character.scale.set(1 - breathing * .2, 1 + breathing, 1 - breathing * .2);
    character.rotation.z = reducedMotion ? 0 : Math.sin(t * .68) * .027;
    character.rotation.y = look.x * .085;
    head.rotation.y = look.x * .15;
    head.rotation.x = -look.y * .06;
    head.rotation.z = mood === 'curious' ? -.095 : reducedMotion ? 0 : mood === 'happy' ? Math.sin(t * 2) * .035 : Math.sin(t * .43) * .022;
    leftArm.rotation.z = reducedMotion ? 0 : -.025 + Math.sin(t * 1.3) * .038;
    const wave = t - waveTime;
    rightArm.rotation.z = reducedMotion ? 0 : wave < 2.5 ? .10 + Math.sin(wave * 12) * .04 : .025 - Math.sin(t * 1.3) * .038;
    leftLeg.rotation.x = jump * .3; rightLeg.rotation.x = -jump * .2;
    shadow.material.opacity = 1 - jump * .9;
    shadow.scale.setScalar(1 - jump * .2);
    if (t >= blinkAt) { blinkStart = t; blinkAt = t + 3.5 + Math.random() * 4; }
    const blinkDelta = t - blinkStart;
    const blinkScale = blinkDelta < .19 ? Math.max(.05, Math.abs(Math.cos(blinkDelta / .19 * Math.PI))) : 1;
    eyes.forEach(eye => { eye.scale.y = blinkScale * (mood === 'sleepy' ? .55 : 1); eye.position.x = (eye.position.x < 0 ? -.255 : .255) + look.x * .016; });
    speakingMouth.visible = speaking; smile.visible = !speaking;
    if (speaking) speakingMouth.scale.y = .024 + Math.abs(Math.sin(t * 11)) * .045;
    mouth.scale.x = mood === 'happy' ? 1.18 : 1;
    plants.children.forEach((flower, i) => { flower.visible = i < plantsCount; flower.rotation.z = reducedMotion ? 0 : Math.sin(t * 1.1 + i * 1.3) * .04; });
    if (!reducedMotion) clouds.forEach((cloud, i) => { cloud.position.y += Math.sin(t * .45 + i * 2) * dt * .012; });
    renderer.render(scene, camera);
    raf = requestAnimationFrame(animate);
  }
  raf = requestAnimationFrame(animate);
  return {
    setColor(hex) { material.color.set(cleanColor(hex)); },
    setMood(value) { mood = ({ bright: 'happy', low: 'curious', tired: 'sleepy' })[value] || value || 'calm'; },
    setSpeaking(value) { speaking = !!value; },
    setPlants(value) { plantsCount = clamp(Math.floor(Number(value) || 0), 0, flowerPositions.length); },
    setWorld(value) {
      const palette = { meadow: ['#bacd9b', '#fff7e6', '#fff4df', '#fff4ca'], dusk: ['#c0aab3', '#f7d0c0', '#ffd7bc', '#fce7bd'], moon: ['#a7b1c6', '#d3dffb', '#ecedff', '#e5eafd'] }[value] || ['#bacd9b', '#fff7e6', '#fff4df', '#fff4ca'];
      groundMaterial.color.set(palette[0]); ambient.color.set(palette[1]); key.color.set(palette[2]); orb.material.color.set(palette[3]);
      clouds.forEach(cloud => { cloud.visible = value !== 'moon'; });
      renderer.toneMappingExposure = value === 'moon' ? 1.04 : 1.26;
    },
    greet() { waveTime = elapsed; interactionTime = elapsed; },
    dispose() {
      disposed = true; cancelAnimationFrame(raf); observer.disconnect();
      renderer.domElement.removeEventListener('pointermove', pointerMove); renderer.domElement.removeEventListener('pointerup', touch); renderer.domElement.removeEventListener('pointerleave', leave);
      const geometries = new Set(), materials = new Set();
      scene.traverse(object => { if (object.geometry) geometries.add(object.geometry); if (object.material) materials.add(object.material); });
      geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); shadowTexture.dispose(); renderer.dispose(); renderer.domElement.remove();
    },
  };
}

// Smooth-union distance field and marching tetrahedra create a single continuous
// silhouette, including shoulders, short feet and small asymmetrical crown fins.
function sculptGeometry(T) {
  function ellipsoid(x, y, z, cx, cy, cz, rx, ry, rz, angle = 0) {
    x -= cx; y -= cy; z -= cz;
    const nx = x * Math.cos(angle) + y * Math.sin(angle), ny = -x * Math.sin(angle) + y * Math.cos(angle);
    const k0 = Math.hypot(nx / rx, ny / ry, z / rz);
    const k1 = Math.hypot(nx / (rx * rx), ny / (ry * ry), z / (rz * rz));
    return k0 * (k0 - 1) / Math.max(k1, .0001);
  }
  function union(a, b, radius) { const h = Math.max(radius - Math.abs(a - b), 0) / radius; return Math.min(a, b) - h * h * radius * .25; }
  function capsule(x, y, z, ax, ay, bx, by, radius) {
    const dx = bx - ax, dy = by - ay;
    const t = clamp(((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy), 0, 1);
    return Math.hypot(x - ax - dx * t, y - ay - dy * t, z + .025) - radius;
  }
  function field(x, y, z) {
    let d = ellipsoid(x, y, z, 0, 2.49, 0, .75, .59, .51);
    d = union(d, ellipsoid(x, y, z, 0, 1.47, -.005, .48, .62, .39), .10);
    d = union(d, ellipsoid(x, y, z, -.60, 1.43, -.015, .155, .52, .20, -.23), .14);
    d = union(d, ellipsoid(x, y, z, .60, 1.43, -.015, .155, .52, .20, .23), .14);
    d = union(d, ellipsoid(x, y, z, -.29, .65, .035, .235, .39, .29, -.07), .2);
    d = union(d, ellipsoid(x, y, z, .29, .65, .035, .235, .39, .29, .07), .2);
    d = union(d, capsule(x, y, z, 0, 2.99, 0, 3.33, .16), .08);
    d = union(d, capsule(x, y, z, -.28, 2.93, -.44, 3.22, .15), .08);
    d = union(d, capsule(x, y, z, .28, 2.93, .44, 3.22, .15), .08);
    d = union(d, capsule(x, y, z, -.55, 2.71, -.81, 2.94, .145), .07);
    d = union(d, capsule(x, y, z, .55, 2.71, .81, 2.94, .145), .07);
    return d;
  }
  const nx = 47, ny = 76, nz = 35;
  const bounds = [-1.12, 1.12, .2, 3.58, -.75, .75];
  const values = new Float32Array(nx * ny * nz);
  const point = (x, y, z) => [bounds[0] + x / (nx - 1) * (bounds[1] - bounds[0]), bounds[2] + y / (ny - 1) * (bounds[3] - bounds[2]), bounds[4] + z / (nz - 1) * (bounds[5] - bounds[4])];
  const index = (x, y, z) => (x * ny + y) * nz + z;
  for (let x = 0; x < nx; x++) for (let y = 0; y < ny; y++) for (let z = 0; z < nz; z++) values[index(x, y, z)] = field(...point(x, y, z));
  const positions = [], normals = [], skinIndices = [], skinWeights = [];
  const corners = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]];
  const tetrahedra = [[0, 5, 1, 6], [0, 1, 2, 6], [0, 2, 3, 6], [0, 3, 7, 6], [0, 7, 4, 6], [0, 4, 5, 6]];
  function vertex(p) {
    positions.push(...p);
    const [x, y, z] = p, e = .001;
    const normal = new T.Vector3(field(x + e, y, z) - field(x - e, y, z), field(x, y + e, z) - field(x, y - e, z), field(x, y, z + e) - field(x, y, z - e)).normalize();
    normals.push(normal.x, normal.y, normal.z);
    const headWeight = smooth(1.92, 2.32, y);
    const armWeight = smooth(.43, .72, Math.abs(x)) * (1 - smooth(1.94, 2.26, y)) * smooth(.96, 1.35, y) * (1 - headWeight);
    const legWeight = (1 - smooth(.72, 1.22, y)) * (1 - headWeight);
    skinIndices.push(0, 1, x < 0 ? 2 : 3, x < 0 ? 4 : 5);
    skinWeights.push(Math.max(0, 1 - headWeight - armWeight - legWeight), headWeight, armWeight, legWeight);
  }
  function triangle(a, b, c) {
    const ab = new T.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    const ac = new T.Vector3(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
    const normal = ab.cross(ac).normalize();
    const mid = a.map((v, i) => (v + b[i] + c[i]) / 3);
    const outside = field(mid[0] + normal.x * .001, mid[1] + normal.y * .001, mid[2] + normal.z * .001);
    const inside = field(mid[0] - normal.x * .001, mid[1] - normal.y * .001, mid[2] - normal.z * .001);
    vertex(a); if (outside < inside) { vertex(c); vertex(b); } else { vertex(b); vertex(c); }
  }
  for (let x = 0; x < nx - 1; x++) for (let y = 0; y < ny - 1; y++) for (let z = 0; z < nz - 1; z++) {
    const vs = corners.map(([dx, dy, dz]) => values[index(x + dx, y + dy, z + dz)]);
    if (vs.every(v => v >= 0) || vs.every(v => v < 0)) continue;
    const ps = corners.map(([dx, dy, dz]) => point(x + dx, y + dy, z + dz));
    for (const tet of tetrahedra) {
      const inside = tet.filter(i => vs[i] < 0), outside = tet.filter(i => vs[i] >= 0);
      if (!inside.length || !outside.length) continue;
      const mix = (a, b) => ps[a].map((v, i) => v + (ps[b][i] - v) * vs[a] / (vs[a] - vs[b]));
      if (inside.length === 1) triangle(...outside.map(b => mix(inside[0], b)));
      else if (outside.length === 1) triangle(...inside.map(a => mix(a, outside[0])));
      else { const a = mix(inside[0], outside[0]), b = mix(inside[0], outside[1]), c = mix(inside[1], outside[0]), d = mix(inside[1], outside[1]); triangle(a, b, c); triangle(b, d, c); }
    }
  }
  const geometry = new T.BufferGeometry();
  geometry.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new T.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('skinIndex', new T.Uint16BufferAttribute(skinIndices, 4));
  geometry.setAttribute('skinWeight', new T.Float32BufferAttribute(skinWeights, 4));
  geometry.computeBoundingSphere();
  return geometry;
}

function createIllustration(container, options) {
  const host = document.createElement('div');
  host.style.cssText = 'position:absolute;inset:0;display:grid;place-items:center;overflow:hidden;';
  const id = `companion-${Math.random().toString(36).slice(2)}`;
  host.innerHTML = `<svg viewBox="0 0 600 700" style="width:100%;height:100%;max-height:100%" role="img" aria-label="可触摸的柔软外星伙伴">
    <defs><radialGradient id="${id}-body" cx="30%" cy="20%" r="80%"><stop stop-color="#e4efd6"/><stop offset=".55" stop-color="#b9d2a1"/><stop offset="1" stop-color="#88a677"/></radialGradient><radialGradient id="${id}-ground"><stop stop-color="#d7dfb9"/><stop offset="1" stop-color="#afc38f"/></radialGradient><filter id="${id}-blur"><feGaussianBlur stdDeviation="10"/></filter></defs>
    <ellipse data-ground cx="300" cy="754" rx="490" ry="235" fill="url(#${id}-ground)"/>
    <g fill="#fffbed" opacity=".88"><path d="M63 240c-24 0-24-28-3-30 5-21 37-24 46-3 23-8 38 23 14 29z"/><path d="M463 184c-25 0-26-27-6-29 8-24 44-24 53 0 23-3 30 27 7 29z"/></g>
    <ellipse cx="300" cy="558" rx="88" ry="15" fill="#546448" opacity=".2" filter="url(#${id}-blur)"/>
    <g data-figure style="transform-origin:300px 552px;cursor:pointer">
      <path data-body d="M229 252C203 245 187 230 198 217 208 207 224 221 236 232C222 206 218 186 232 180 248 173 255 199 260 218C266 200 268 168 284 169 302 170 296 200 298 218C308 201 317 177 331 183 348 191 330 214 327 226C347 216 368 205 376 220 384 234 365 246 364 252C408 299 400 348 357 365L357 392C377 406 389 454 375 466 363 477 352 460 346 447L344 505C362 540 351 558 332 558 317 559 310 545 310 522L288 522C288 545 281 559 265 558 245 558 238 542 252 507L251 447C244 464 232 477 221 465 209 453 224 407 243 392L243 364C195 344 180 282 237 238Z" fill="url(#${id}-body)"/>
      <path d="M251 375Q300 391 350 375L347 462Q300 475 253 462Z" fill="#657c86"/><ellipse cx="300" cy="374" rx="39" ry="8" fill="none" stroke="#efd9a8" stroke-width="10"/><g data-eyes fill="#fffef1"><ellipse cx="270" cy="293" rx="14" ry="16"/><ellipse cx="333" cy="293" rx="14" ry="16"/><g fill="#293c30"><ellipse cx="272" cy="295" rx="8" ry="11"/><ellipse cx="331" cy="295" rx="8" ry="11"/></g><path d="M258 268q11-5 22 0m42 0q11-5 22 0" stroke="#293c30" stroke-width="5" stroke-linecap="round" fill="none"/><g fill="#fffdeb"><ellipse cx="267" cy="289" rx="2" ry="3"/><ellipse cx="330" cy="289" rx="2" ry="3"/></g></g>
      <path data-mouth d="M293 317Q302 327 311 317" fill="none" stroke="#293c30" stroke-width="3" stroke-linecap="round"/>
      <g fill="#e6b69c" opacity=".35"><ellipse cx="249" cy="317" rx="10" ry="4"/><ellipse cx="354" cy="317" rx="10" ry="4"/></g>
    </g>
    <g data-plants stroke="#719451" stroke-width="3"><path d="M137 565v-30m6 15-6 7m317 6v-28m-7 13 7 7"/><g stroke="#fff1ce" stroke-width="10" stroke-linecap="round"><path d="M130 533h14m-7-7v14m310-5h14m-7-7v14"/></g><g fill="#e4ba6a" stroke="none"><circle cx="137" cy="533" r="4"/><circle cx="454" cy="535" r="4"/></g></g>
  </svg>`;
  container.appendChild(host);
  const figure = host.querySelector('[data-figure]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const breathing = reduced ? null : figure.animate([{ transform: 'translateY(0) rotate(-.5deg)' }, { transform: 'translateY(-5px) rotate(.5deg)' }, { transform: 'translateY(0) rotate(-.5deg)' }], { duration: 4200, iterations: Infinity });
  const greet = () => { if (!reduced) figure.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-19px) rotate(-3deg)' }, { transform: 'translateY(0)' }], { duration: 600, easing: 'ease-in-out' }); };
  const click = () => { greet(); options.onTouch?.(); }; figure.addEventListener('pointerup', click);
  let talking;
  function setPlants(value) {
    const count = clamp(Math.floor(Number(value) || 0), 0, 24);
    const positions = [[137,565],[454,566],[96,592],[495,592],[183,580],[417,601],[63,622],[530,619],[159,625],[463,639],[215,608],[381,627],[119,633],[489,643],[174,652],[432,661],[228,641],[368,659],[95,665],[508,682],[144,692],[458,695],[267,668],[330,687]];
    host.querySelector('[data-plants]').innerHTML = positions.slice(0, count).map(([x, y], i) => `<g transform="translate(${x} ${y}) scale(${.7 + (i % 3) * .15})"><path d="M0 0v-30m6 15-6 7"/><g stroke="#fff1ce" stroke-width="9" stroke-linecap="round"><path d="M-7-30H7M0-37v14"/></g><circle cy="-30" r="4" fill="#e4ba6a" stroke="none"/></g>`).join('');
  }
  setPlants(3);
  return {
    setColor(hex) {
      const color = cleanColor(hex); const gradient = host.querySelector(`#${id}-body`);
      const rgb = [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16));
      const tint = factor => '#' + rgb.map(v => Math.round(factor > 0 ? v + (255 - v) * factor : v * (1 + factor)).toString(16).padStart(2, '0')).join('');
      gradient.children[0].setAttribute('stop-color', tint(.4)); gradient.children[1].setAttribute('stop-color', color); gradient.children[2].setAttribute('stop-color', tint(-.18));
    },
    setMood(value) { host.querySelector('[data-eyes]').style.opacity = value === 'sleepy' || value === 'tired' ? '.65' : '1'; figure.style.rotate = value === 'curious' || value === 'low' ? '-3deg' : '0deg'; },
    setSpeaking(value) {
      talking?.cancel();
      const mouth = host.querySelector('[data-mouth]');
      mouth.setAttribute('d', value ? 'M295 316Q302 313 309 316Q314 331 302 332Q291 331 295 316' : 'M293 317Q302 327 311 317');
      mouth.setAttribute('fill', value ? '#293c30' : 'none');
      if (value && !reduced) talking = mouth.animate([{ opacity: 1 }, { opacity: .6 }, { opacity: 1 }], { duration: 270, iterations: Infinity });
    },
    setWorld(value) { host.querySelector('[data-ground]').setAttribute('fill', value === 'moon' ? '#acb8ca' : value === 'dusk' ? '#c3b0bd' : `url(#${id}-ground)`); },
    setPlants,
    greet,
    dispose() { breathing?.cancel(); talking?.cancel(); figure.removeEventListener('pointerup', click); host.remove(); },
  };
}
