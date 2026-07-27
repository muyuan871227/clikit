// ═══ Render 系统 (Three.js 3D) ═══════════════════════════════════════════
//
// FILE MAP (regenerate after large edits — see iter-5 in ITERATION-PLAN.md):
//
//   §0  HELPERS       (~ 50 lines)   w() / darkenColor / isOverAbyss
//   §1  INIT          (~110 lines)   init / setupThree / lights / fog / canvases
//   §2  MAP THEME     (~700 lines)   loadMapTheme / buildObstacleMesh /
//                                    buildMapDecor (one builder per obstacle kind)
//   §3  GROUND TEX    (~290 lines)   makeGroundTextureForMap + per-map sprinkle helpers
//                                    (flower, mushroom, log, cactus, snowpine, torch)
//   §4  BACKGROUND    (~ 80 lines)   addBackgroundDecoration / addCamp / makeTree
//   §5  UNIT MESH     (~210 lines)   addEntityMesh / makeUnitMesh /
//                                    buildPikeman / buildArcher / buildCavalry /
//                                    buildGiant / buildMage / buildShield
//   §6  RAGDOLL       (~ 35 lines)   transformToRagdoll / removeEntityMesh
//   §7  PROJECTILE    (~ 25 lines)   addProjectileMesh / removeProjectileMesh / clearAllMeshes
//   §8  JUICE         (~100 lines)   triggerJuice / spawnParticle / updateParticles
//   §9  SYNC MESHES   (~330 lines)   syncMeshes (the big per-frame entity-mesh writer)
//   §10 GHOST/DECOR   (~120 lines)   updateGhost (drag-preview) / updateDecor / clearLavaSources
//   §11 RENDER LOOP   (~100 lines)   render / renderUIOverlay
//   §12 ACCESSORS     (~ 10 lines)   getUICtx / getCamera / getScene / getRenderer
//   §13 CAMERA API    (~ 80 lines)   applyCamera / setCameraTilt|Dist|Rot / cameraAPI
//
// Total ~2200 lines. NOT split into separate files because the entire module
// shares closure state (scene, camera, entityMeshes, particles, etc.). Splitting
// would force shared-mutable-state across modules — worse than one big IIFE.
//
// AI codegen: search for "§N" to jump to a section.

const RenderSys = (() => {
  // §0 ─ HELPERS ──────────────────────────────────────────────────
  // 2D 战场 960x540 → 3D 单位
  const SCALE = 0.04; // 1 px = 0.04 unit  (战场 38.4 x 21.6 单位)
  let scene, camera, renderer, threeCanvas, uiCanvas, uiCtx;
  let dirLight, ambient;
  let groundMesh;
  let entityMeshes = new Map(); // entity.id → THREE.Group
  let projectileMeshes = new Map();
  let particles = [];
  let goldFloaters = [];
  let damageNumbers = [];
  let shakeMag = 0;
  let flashColor = null, flashUntil = 0;
  let colorTemp = 'neutral';
  let canvasW = 1280, canvasH = 720;
  let arenaW = 960, arenaH = 540, groundY = 480;
  let ghost = null;
  let aoeRings = [];
  let bgMusicTimer = 0;

  // 工具函数: 2D 战场坐标 → 3D world 坐标
  // 战场中心 = (480, 270) 在 2D, → (0, 0, 0) 在 3D
  // 2D x → 3D x (左右)
  // 2D y → 3D z (深度)
  // 3D y = 高度
  function w(x, y, h = 0) {
    return new THREE.Vector3(
      (x - arenaW / 2) * SCALE,
      h,
      (y - arenaH / 2) * SCALE
    );
  }

  // 把 0xRRGGBB 颜色按因子变暗 (0=黑, 1=原色)
  function darkenColor(hex, factor) {
    const r = Math.round(((hex >> 16) & 0xff) * factor);
    const g = Math.round(((hex >> 8) & 0xff) * factor);
    const b = Math.round((hex & 0xff) * factor);
    return (r << 16) | (g << 8) | b;
  }

  // 判断 3D 世界坐标 (worldX, worldZ) 是否在深渊范围内
  function isOverAbyss(worldX, worldZ) {
    if (!scene || !scene.userData.abyssDebrisSources) return false;
    const arenaX = worldX / SCALE + arenaW / 2;
    const arenaY = worldZ / SCALE + arenaH / 2;
    for (const a of scene.userData.abyssDebrisSources) {
      if (Math.abs(arenaX - a.x) <= a.w/2 && Math.abs(arenaY - a.y) <= a.h/2) return true;
    }
    return false;
  }

  // §1 ─ INIT ─────────────────────────────────────────────────────
  function init(_unused) {
    threeCanvas = document.getElementById('threecanvas');
    uiCanvas = document.getElementById('ui');
    // iter-13: DPR-aware setup — sharp text on retina + mobile
    if (Engine && Engine.setupHiDPICanvas) {
      uiCtx = Engine.setupHiDPICanvas(uiCanvas, 1280, 720);
    } else {
      uiCanvas.width = 1280; uiCanvas.height = 720;
      uiCtx = uiCanvas.getContext('2d');
    }
    uiCtx.imageSmoothingEnabled = true;
    arenaW = cfg('arena.width', 960);
    arenaH = cfg('arena.height', 540);
    groundY = cfg('arena.ground_y', 480);
    canvasW = cfg('render.canvas_width', 1280);
    canvasH = cfg('render.canvas_height', 720);

    setupThree();

    on('entity_spawned', ({ entity }) => addEntityMesh(entity));
    on('entity_destroyed', ({ target }) => transformToRagdoll(target));
    on('entity_cleanup', ({ entity_id }) => removeEntityMesh(entity_id));
    on('projectile_spawned', ({ projectile }) => addProjectileMesh(projectile));
    on('projectile_destroyed', ({ projectile }) => removeProjectileMesh(projectile.id));
    on('zone_entered', ({ zone_data, level_id }) => {
      colorTemp = zone_data.color_temp || 'neutral';
      const mapId = zone_data.map || 'plains';
      loadMapTheme(mapId);
      // 中线 + 半场色 + 战场绿色平面: 全部隐藏 (用户要求 — 防止透过深渊看到颜色覆盖)
      if (scene.userData.allyHalf) scene.userData.allyHalf.material.opacity = 0;
      if (scene.userData.enemyHalf) scene.userData.enemyHalf.material.opacity = 0;
      if (scene.userData.centerLine) scene.userData.centerLine.visible = false;
      if (scene.userData.arenaPlane) scene.userData.arenaPlane.visible = (mapId !== 'skybridge');
    });
    on('battle_phase_started', () => {
      // 战斗时隐藏侧边遮罩
      if (scene.userData.allyHalf) scene.userData.allyHalf.material.opacity = 0;
      if (scene.userData.enemyHalf) scene.userData.enemyHalf.material.opacity = 0;
    });
    on('gold_changed', ({ current, delta }) => {
      if (delta !== 0 && delta !== current) goldFloaters.push({ x: 150, y: 90, vy: -0.04, text: (delta > 0 ? '+' : '') + '$' + Math.round(delta), color: delta > 0 ? '#8FE87C' : '#E87C6C', alpha: 1.0, life: 800 });
    });
    on('battle_phase_started', () => triggerJuice('battle_start', arenaW/2, 100));
    on('level_won', () => {
      triggerJuice('victory', arenaW/2, 200);
      // 所有存活 ally 进入庆祝模式
      for (const e of EntitySys.getAllies()) {
        const g = entityMeshes.get(e.id);
        if (g) g.userData.celebrate = { startT: now() };
      }
      // 庆祝五彩纸屑
      for (let i = 0; i < 80; i++) {
        const ang = Math.random() * Math.PI * 2;
        const sp = 3 + Math.random() * 4;
        particles.push({
          x: 0, y: 5, z: 0,
          vx: Math.cos(ang) * sp,
          vy: 4 + Math.random() * 4,
          vz: Math.sin(ang) * sp,
          life: 2500, maxLife: 2500,
          color: `hsl(${Math.random()*360},80%,60%)`,
          size: 0.08, gravity: 0.005, type: 'dot'
        });
      }
    });
    on('level_lost', () => triggerJuice('defeat', arenaW/2, 200));
    on('aoe_hit', ({ x, y, radius }) => {
      // 同屏限 6 个环, 防止视觉刷屏
      if (aoeRings.length >= 6) aoeRings.shift();
      aoeRings.push({ x, y, radius, life: 220, max: 220 });
    });
    on('game_state_changed', ({ to }) => {
      if (to === 'PLAN' || to === 'MENU' || to === 'LEVEL_SELECT') {
        clearAllMeshes();
        aoeRings.length = 0;
        particles.length = 0;
        goldFloaters.length = 0;
        shakeMag = 0;
      }
      // 重置时间缩放
      if (to === 'PLAN' || to === 'MENU') {
        if (window.setTimeScale) window.setTimeScale(1.0);
        if (window.setPaused) window.setPaused(false);
      }
    });
    // 攻击动画: 武器挥砍 + 单位前冲
    on('damage_request', ({ source }) => {
      if (!source || source.id == null) return;
      const g = entityMeshes.get(source.id);
      if (!g) return;
      g.userData.attackAnim = { t: 0, dur: 0.25 };
    });
    // 受击闪白 + 后仰 + 伤害飞字
    on('entity_damaged', ({ target, amount, damage_type }) => {
      if (!target) return;
      const g = entityMeshes.get(target.id);
      if (!g) return;
      g.userData.hitFlash = 0.18;
      g.userData.hitRecoil = { t: 0, dur: 0.15 };
      // 飞字 (世界坐标 → 屏幕坐标在 syncMeshes 计算)
      const isCrit = amount > (target.max_hp * 0.25);  // 单次伤害>25%最大HP视为暴击
      damageNumbers.push({
        worldX: target.x, worldY: target.y, worldH: 1.6,
        amount: Math.round(amount),
        crit: isCrit,
        life: 800, max: 800,
        vy: -50, vx: (Math.random() - 0.5) * 30
      });
    });
  }

  function setupThree() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x6B8FB8);
    scene.fog = new THREE.Fog(0x6B8FB8, 30, 100);

    // 透视相机 (低角度, 更像 TABS 的侧前观战视角)
    const aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 200);
    camera.position.set(0, 14, 22);
    camera.lookAt(0, 1, 0);

    renderer = new THREE.WebGLRenderer({ canvas: threeCanvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    // 后处理: ACES 色调映射 + 曝光提升 (世界级感)
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    // 光照 (3 点照明: key + fill + rim)
    ambient = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambient);
    // Key Light (主光, 暖色)
    dirLight = new THREE.DirectionalLight(0xfff4dd, 1.2);
    dirLight.position.set(12, 28, 18);
    // iter-19: shadow-map perf toggle — set localStorage.tabs_lowfx=1 to use
    // baseRing as fake blob-shadow instead of real shadow map (~2ms savings per frame).
    const lowFX = localStorage.getItem('tabs_lowfx') === '1';
    dirLight.castShadow = !lowFX;
    if (!lowFX) {
      dirLight.shadow.mapSize.set(2048, 2048);
      dirLight.shadow.camera.left = -28;
      dirLight.shadow.camera.right = 28;
      dirLight.shadow.camera.top = 28;
      dirLight.shadow.camera.bottom = -28;
      dirLight.shadow.bias = -0.0008;
      dirLight.shadow.normalBias = 0.02;
    }
    scene.userData._lowFX = lowFX;
    scene.add(dirLight);
    // Fill Light (补光, 冷蓝色)
    const fill = new THREE.HemisphereLight(0x88aaff, 0x554433, 0.55);
    scene.add(fill);
    // Rim Light (边缘光, 让单位轮廓清晰)
    const rim = new THREE.DirectionalLight(0xa8c0ff, 0.5);
    rim.position.set(-10, 8, -15);
    scene.add(rim);

    // 地面 + procedural 纹理 (草地+花斑)
    const groundGeo = new THREE.PlaneGeometry(arenaW * SCALE * 1.6, arenaH * SCALE * 2.2);
    const groundTex = makeGroundTexture();
    const groundMat = new THREE.MeshStandardMaterial({ map: groundTex, roughness: 0.95 });
    groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // 战场区域分隔 (高台地图隐藏, 防止透过深渊看到绿色覆盖层)
    const arenaPlaneGeo = new THREE.PlaneGeometry(arenaW * SCALE, arenaH * SCALE);
    const arenaPlaneMat = new THREE.MeshStandardMaterial({ color: 0x8aaa5a, roughness: 0.9, transparent: true, opacity: 0.4 });
    const arenaPlane = new THREE.Mesh(arenaPlaneGeo, arenaPlaneMat);
    arenaPlane.rotation.x = -Math.PI / 2;
    arenaPlane.position.y = 0.012;
    scene.add(arenaPlane);
    scene.userData.arenaPlane = arenaPlane;

    // 中线 (默认隐藏, 由 zone_entered 根据地图决定是否显示)
    const lineGeo = new THREE.PlaneGeometry(0.15, arenaH * SCALE);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 });
    const line = new THREE.Mesh(lineGeo, lineMat);
    line.rotation.x = -Math.PI / 2;
    line.position.y = 0.02;
    line.visible = false;
    scene.add(line);
    scene.userData.centerLine = line;

    // 沙盒模式: 蓝/红半场提示遮罩 (默认隐藏, level_enter 时根据 sandbox 显示)
    const halfW = arenaW * SCALE / 2;
    const halfH = arenaH * SCALE;
    const allyHalf = new THREE.Mesh(
      new THREE.PlaneGeometry(halfW, halfH),
      new THREE.MeshBasicMaterial({ color: 0x4A90E2, transparent: true, opacity: 0.0, side: THREE.DoubleSide })
    );
    allyHalf.rotation.x = -Math.PI / 2;
    allyHalf.position.set(-halfW/2, 0.014, 0);
    scene.add(allyHalf);
    scene.userData.allyHalf = allyHalf;
    const enemyHalf = new THREE.Mesh(
      new THREE.PlaneGeometry(halfW, halfH),
      new THREE.MeshBasicMaterial({ color: 0xE74C3C, transparent: true, opacity: 0.0, side: THREE.DoubleSide })
    );
    enemyHalf.rotation.x = -Math.PI / 2;
    enemyHalf.position.set(halfW/2, 0.014, 0);
    scene.add(enemyHalf);
    scene.userData.enemyHalf = enemyHalf;

    // 远山
    addBackgroundDecoration();

    window.addEventListener('resize', onResize);
    onResize();
  }

  // §2 ─ MAP THEME ────────────────────────────────────────────────
  // ═══ 地图主题系统 ═══
  let currentMapId = null;
  let mapDecorGroup = null;

  function loadMapTheme(mapId) {
    if (currentMapId === mapId) return;
    currentMapId = mapId;
    // 切地图时重新调整相机 (高台地图需抬高 lookAt)
    if (typeof onResize === 'function') onResize();
    // 移除旧装饰
    if (mapDecorGroup) {
      scene.remove(mapDecorGroup);
      mapDecorGroup.traverse(o => {
        if (o.geometry) o.geometry.dispose?.();
        if (o.material) {
          if (Array.isArray(o.material)) o.material.forEach(m => m.dispose?.());
          else o.material.dispose?.();
        }
      });
    }
    mapDecorGroup = new THREE.Group();
    scene.add(mapDecorGroup);
    if (typeof clearLavaSources === 'function') clearLavaSources();

    const mapData = (DATA.locations?.maps && DATA.locations.maps[mapId]) || null;
    if (!mapData) return;

    // 渐变天空盒 (用 canvas texture 实现, top→bot)
    if (!scene.userData.skyBoxMat) {
      const skyCanvas = document.createElement('canvas');
      skyCanvas.width = 16; skyCanvas.height = 256;
      const skyTex = new THREE.CanvasTexture(skyCanvas);
      scene.userData.skyCanvas = skyCanvas;
      scene.userData.skyTex = skyTex;
      scene.background = skyTex;
      scene.userData.skyBoxMat = true;
    }
    {
      const c = scene.userData.skyCanvas;
      const ctx = c.getContext('2d');
      const grd = ctx.createLinearGradient(0, 0, 0, c.height);
      grd.addColorStop(0, mapData.sky_top || '#9bc8e6');
      grd.addColorStop(1, mapData.sky_bot || mapData.sky_top || '#c8e0f0');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, c.width, c.height);
      scene.userData.skyTex.needsUpdate = true;
    }
    if (scene.fog) {
      scene.fog.color = new THREE.Color(mapData.fog || 0xa8c8de);
      // 高台地图: 雾色用浅蓝灰 (山间薄雾感, 不是死黑)
      if (mapId === 'skybridge') {
        scene.fog.color = new THREE.Color(0x7898b8);  // 蓝灰雾
        scene.fog.near = 28;
        scene.fog.far = 75;
      } else {
        scene.fog.near = 30;
        scene.fog.far = 100;
      }
    }
    // 更新地面材质
    if (groundMesh && groundMesh.material) {
      if (mapId === 'skybridge') {
        // 高台地图: 地面作为统一深渊背景 (单一深蓝灰色, 无贴图, 看下去都是同一颜色)
        groundMesh.material.map = null;
        groundMesh.material.color = new THREE.Color(0x4a5a70);
        groundMesh.material.needsUpdate = true;
        groundMesh.position.y = -8;
      } else {
        groundMesh.material.map = makeGroundTextureForMap(mapId, mapData);
        groundMesh.material.color = new THREE.Color(0xffffff);
        groundMesh.material.needsUpdate = true;
        groundMesh.position.y = 0;
      }
    }
    // 加载背景装饰
    const decors = mapData.decor || [];
    for (const d of decors) buildMapDecor(d, mapDecorGroup);
    // 加载实际障碍物 3D 表现
    const obs = mapData.obstacles || [];
    for (const o of obs) buildObstacleMesh(o, mapDecorGroup);
  }

  // 障碍物 3D 模型 (位置使用 2D arena 坐标转 3D)
  function buildObstacleMesh(o, parent) {
    const wp = w(o.x, o.y, 0);
    if (o.kind === 'tree') {
      const t = makeTree(true);
      t.position.copy(wp);
      parent.add(t);
    } else if (o.kind === 'log') {
      const log = new THREE.Mesh(
        new THREE.CylinderGeometry((o.h||14)*SCALE, (o.h||14)*SCALE, (o.w||80)*SCALE, 8),
        new THREE.MeshStandardMaterial({ color: 0x6a4a2a, roughness: 1 })
      );
      log.rotation.z = Math.PI / 2;
      log.position.set(wp.x, (o.h||14)*SCALE*0.5, wp.z);
      log.castShadow = true;
      parent.add(log);
    } else if (o.kind === 'dune') {
      const dune = new THREE.Mesh(
        new THREE.SphereGeometry(o.r * SCALE, 16, 8, 0, Math.PI*2, 0, Math.PI/2),
        new THREE.MeshStandardMaterial({ color: 0xd8b868, roughness: 1 })
      );
      dune.position.set(wp.x, 0, wp.z);
      dune.scale.y = 0.4;
      dune.castShadow = true;
      parent.add(dune);
    } else if (o.kind === 'rock' || o.kind === 'stone' || o.kind === 'obsidian') {
      const isObs = o.kind === 'obsidian';
      const rock = new THREE.Mesh(
        new THREE.IcosahedronGeometry(o.r * SCALE, 0),
        new THREE.MeshStandardMaterial({ color: isObs ? 0x1a1820 : 0x8a8a90, roughness: isObs ? 0.4 : 0.9, metalness: isObs ? 0.5 : 0 })
      );
      rock.position.set(wp.x, o.r * SCALE * 0.5, wp.z);
      rock.castShadow = true;
      parent.add(rock);
    } else if (o.kind === 'ice') {
      const ice = new THREE.Mesh(
        new THREE.IcosahedronGeometry(o.r * SCALE, 0),
        new THREE.MeshStandardMaterial({ color: 0xb8d8e8, transparent: true, opacity: 0.85, roughness: 0.2, metalness: 0.3 })
      );
      ice.position.set(wp.x, o.r * SCALE * 0.7, wp.z);
      ice.castShadow = true;
      parent.add(ice);
    } else if (o.kind === 'snowdrift') {
      // 半透明白色斑 (减速区视觉)
      const drift = new THREE.Mesh(
        new THREE.BoxGeometry(o.w * SCALE, 0.05, o.h * SCALE),
        new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 })
      );
      drift.position.set(wp.x, 0.04, wp.z);
      parent.add(drift);
      // 雪堆颗粒 (上方有几个圆球)
      for (let i = 0; i < 6; i++) {
        const ball = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 }));
        ball.position.set(wp.x + (Math.random()-0.5) * o.w * SCALE * 0.7, 0.18, wp.z + (Math.random()-0.5) * o.h * SCALE * 0.7);
        ball.castShadow = true;
        parent.add(ball);
      }
    } else if (o.kind === 'river') {
      const river = new THREE.Mesh(
        new THREE.BoxGeometry(o.w * SCALE, 0.05, o.h * SCALE),
        new THREE.MeshStandardMaterial({ color: 0x4a7aa8, transparent: true, opacity: 0.85, roughness: 0.2, metalness: 0.5 })
      );
      river.position.set(wp.x, 0.04, wp.z);
      parent.add(river);
    } else if (o.kind === 'lava') {
      // 发光熔岩池
      const lava = new THREE.Mesh(
        new THREE.BoxGeometry(o.w * SCALE, 0.06, o.h * SCALE),
        new THREE.MeshStandardMaterial({ color: 0xff4a1a, emissive: 0xff5a2a, emissiveIntensity: 1.2, roughness: 0.4 })
      );
      lava.position.set(wp.x, 0.04, wp.z);
      lava.userData.isLava = true;
      parent.add(lava);
      // 熔岩边缘黑色岩壳
      const rim = new THREE.Mesh(
        new THREE.BoxGeometry(o.w * SCALE * 1.05, 0.08, o.h * SCALE * 1.05),
        new THREE.MeshStandardMaterial({ color: 0x1a0a0a })
      );
      rim.position.set(wp.x, 0.02, wp.z);
      parent.add(rim);
      // 持续生成火星 (运行时由 updateLavaParticles)
      if (!scene.userData.lavaSources) scene.userData.lavaSources = [];
      scene.userData.lavaSources.push(o);
    } else if (o.kind === 'pillar') {
      const p = new THREE.Mesh(
        new THREE.CylinderGeometry(o.r * SCALE * 0.9, o.r * SCALE * 1.0, 2.2, 12),
        new THREE.MeshStandardMaterial({ color: 0xc8b890, roughness: 0.95 })
      );
      p.position.set(wp.x, 1.1, wp.z);
      p.castShadow = true;
      parent.add(p);
      // 柱顶装饰
      const cap = new THREE.Mesh(
        new THREE.BoxGeometry(o.r * SCALE * 2.2, 0.15, o.r * SCALE * 2.2),
        new THREE.MeshStandardMaterial({ color: 0xb8a880 })
      );
      cap.position.set(wp.x, 2.25, wp.z);
      parent.add(cap);
    } else if (o.kind === 'wall') {
      // 矩形墙
      const h = 1.5;
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(o.w * SCALE, h, o.h * SCALE),
        new THREE.MeshStandardMaterial({ color: 0xa89870, roughness: 0.95 })
      );
      wall.position.set(wp.x, h/2, wp.z);
      wall.castShadow = true;
      wall.receiveShadow = true;
      parent.add(wall);
    } else if (o.kind === 'tower') {
      // 圆塔
      const t = new THREE.Mesh(
        new THREE.CylinderGeometry(o.r * SCALE, o.r * SCALE * 1.1, 3.5, 12),
        new THREE.MeshStandardMaterial({ color: 0x8a7a68, roughness: 0.9 })
      );
      t.position.set(wp.x, 1.75, wp.z);
      t.castShadow = true;
      parent.add(t);
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(o.r * SCALE * 1.15, 1.2, 12),
        new THREE.MeshStandardMaterial({ color: 0x8a3a3a })
      );
      cone.position.set(wp.x, 4.1, wp.z);
      parent.add(cone);
    } else if (o.kind === 'abyss') {
      // ═══ 无底深渊: 仅注册碰撞 + 下落碎石源, 不渲染岩壁 ═══
      if (!scene.userData.abyssDebrisSources) scene.userData.abyssDebrisSources = [];
      scene.userData.abyssDebrisSources.push({ x: o.x, y: o.y, w: o.w, h: o.h });
    } else if (o.kind === 'platform') {
      // 高台: 5.5 单位高, 多层岩石壁画营造强烈悬崖感
      const w_ = o.w * SCALE, h_ = o.h * SCALE;
      const PLATFORM_H = 5.5;
      // 顶面草地
      const top = new THREE.Mesh(
        new THREE.BoxGeometry(w_, 0.18, h_),
        new THREE.MeshStandardMaterial({ color: 0x6a8a4a, roughness: 0.95 })
      );
      top.position.set(wp.x, PLATFORM_H, wp.z);
      top.castShadow = true; top.receiveShadow = true;
      parent.add(top);
      // 顶面边缘亮草带
      const rim = new THREE.Mesh(
        new THREE.BoxGeometry(w_ + 0.04, 0.06, h_ + 0.04),
        new THREE.MeshStandardMaterial({ color: 0x9eca6a, roughness: 1 })
      );
      rim.position.set(wp.x, PLATFORM_H + 0.12, wp.z);
      parent.add(rim);
      // 不规则顶边 (一圈小岩石, 像被风化的山顶)
      const rockEdgeMat = new THREE.MeshStandardMaterial({ color: 0x6a5a48, roughness: 1 });
      const innerSign = wp.x > 0 ? -1 : 1;
      const innerEdgeX = wp.x + innerSign * w_/2;
      // 沿内侧 (悬崖) 边缘加石头
      for (let i = 0; i < 14; i++) {
        const stone = new THREE.Mesh(
          new THREE.BoxGeometry(0.14 + Math.random()*0.18, 0.16 + Math.random()*0.14, 0.14 + Math.random()*0.16),
          rockEdgeMat
        );
        stone.position.set(
          innerEdgeX + innerSign * (-0.05 - Math.random()*0.08),
          PLATFORM_H + 0.05 + Math.random()*0.1,
          wp.z - h_/2 + 0.1 + (i / 14) * (h_ - 0.2) + (Math.random()-0.5)*0.1
        );
        stone.rotation.y = Math.random() * Math.PI;
        stone.castShadow = true;
        parent.add(stone);
      }
      // ═══ 多层岩石悬崖断面 (4 层不同颜色, 沉积岩效果) ═══
      const layerColors = [
        0x6a5a48, // 浅棕 (顶层, 风化)
        0x5a4838, // 中棕
        0x4a3a2c, // 深棕
        0x3a2c20, // 最深 (底层)
      ];
      // 内侧 (面朝悬崖) - 4 层叠加
      const layerH = PLATFORM_H / layerColors.length;
      for (let li = 0; li < layerColors.length; li++) {
        const layer = new THREE.Mesh(
          new THREE.BoxGeometry(0.12, layerH * 1.02, h_),
          new THREE.MeshStandardMaterial({ color: layerColors[li], roughness: 1 })
        );
        layer.position.set(
          innerEdgeX + innerSign * 0.05,
          PLATFORM_H - layerH * (li + 0.5),
          wp.z
        );
        layer.castShadow = true;
        parent.add(layer);
      }
      // 前后两侧 (短边) - 也分层
      for (let li = 0; li < layerColors.length; li++) {
        for (const zside of [-h_/2 + 0.05, h_/2 - 0.05]) {
          const layer = new THREE.Mesh(
            new THREE.BoxGeometry(w_ - 0.2, layerH * 1.02, 0.1),
            new THREE.MeshStandardMaterial({ color: layerColors[li], roughness: 1 })
          );
          layer.position.set(wp.x, PLATFORM_H - layerH * (li + 0.5), zside);
          layer.castShadow = true;
          parent.add(layer);
        }
      }
      // 平台主体 (内部, 不可见)
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(w_ - 0.3, PLATFORM_H - 0.18, h_ - 0.3),
        new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 1.0 })
      );
      body.position.set(wp.x, PLATFORM_H/2 - 0.09, wp.z);
      parent.add(body);
      // ═══ 悬挂岩石 (悬崖面突出物, 8 块不同位置) ═══
      for (let i = 0; i < 8; i++) {
        const r = new THREE.Mesh(
          new THREE.IcosahedronGeometry(0.18 + Math.random()*0.22, 0),
          new THREE.MeshStandardMaterial({ color: 0x4a4042, roughness: 1 })
        );
        r.position.set(
          innerEdgeX + innerSign * (0.06 + Math.random()*0.12),
          PLATFORM_H * (0.15 + Math.random() * 0.7),
          wp.z + (Math.random()-0.5) * h_ * 0.9
        );
        r.castShadow = true;
        parent.add(r);
      }
      // ═══ 悬挂藤蔓 (绿色细长矩形, 5 根 drape over edge) ═══
      for (let i = 0; i < 5; i++) {
        const vine = new THREE.Mesh(
          new THREE.BoxGeometry(0.04, 0.4 + Math.random()*0.4, 0.04),
          new THREE.MeshStandardMaterial({ color: 0x4a7a3a, roughness: 1 })
        );
        vine.position.set(
          innerEdgeX + innerSign * 0.02,
          PLATFORM_H - 0.1 - (vine.geometry.parameters.height / 2),
          wp.z + (Math.random()-0.5) * h_ * 0.85
        );
        // 顶部叶丛
        const leaf = new THREE.Mesh(
          new THREE.SphereGeometry(0.08 + Math.random()*0.05, 8, 6),
          new THREE.MeshStandardMaterial({ color: 0x5a8a3a, roughness: 1 })
        );
        leaf.position.copy(vine.position);
        leaf.position.y = PLATFORM_H - 0.05;
        leaf.scale.y = 0.5;
        parent.add(vine);
        parent.add(leaf);
      }
      // ═══ 悬崖底部岩屑堆 (坡面碎石, 增加纵向感) ═══
      for (let i = 0; i < 6; i++) {
        const debris = new THREE.Mesh(
          new THREE.IcosahedronGeometry(0.12 + Math.random()*0.1, 0),
          new THREE.MeshStandardMaterial({ color: 0x383028, roughness: 1 })
        );
        debris.position.set(
          innerEdgeX + innerSign * (0.15 + Math.random()*0.15),
          0.05 + Math.random() * 0.3,
          wp.z + (Math.random()-0.5) * h_ * 0.85
        );
        parent.add(debris);
      }
    } else if (o.kind === 'bridge_deck') {
      // 廊桥 (与高台等高的细长石条 - 高度同 PLATFORM_H=5.5)
      const w_ = o.w * SCALE, h_ = o.h * SCALE;
      const PLATFORM_H = 5.5;
      // 桥面 (略加厚, 显得结实)
      const deck = new THREE.Mesh(
        new THREE.BoxGeometry(w_, 0.5, h_),
        new THREE.MeshStandardMaterial({ color: 0x9a8a6a, roughness: 0.9 })
      );
      deck.position.set(wp.x, PLATFORM_H - 0.25, wp.z);
      deck.castShadow = true;
      deck.receiveShadow = true;
      parent.add(deck);
      // 桥面砖缝
      for (let i = 0; i < 6; i++) {
        const seam = new THREE.Mesh(
          new THREE.BoxGeometry(w_, 0.02, 0.04),
          new THREE.MeshStandardMaterial({ color: 0x6a5a3a })
        );
        seam.position.set(wp.x, PLATFORM_H + 0.005, wp.z - h_/2 + (i + 0.5) * h_ / 6);
        parent.add(seam);
      }
      // 桥两端落桥点的石头堆 (像桥头堡)
      for (const sx of [wp.x - w_/2 + 0.05, wp.x + w_/2 - 0.05]) {
        for (let i = 0; i < 3; i++) {
          const stone = new THREE.Mesh(
            new THREE.BoxGeometry(0.18, 0.18 + Math.random()*0.12, 0.18),
            new THREE.MeshStandardMaterial({ color: 0x6a5a4a, roughness: 1 })
          );
          stone.position.set(
            sx + (Math.random()-0.5) * 0.1,
            PLATFORM_H + 0.06 + i * 0.15,
            wp.z + (Math.random()-0.5) * h_ * 0.6
          );
          stone.castShadow = true;
          parent.add(stone);
        }
      }
    }
  }

  function buildMapDecor(name, parent) {
    if (name === 'trees_sparse') {
      for (let i = 0; i < 8; i++) {
        const t = makeTree();
        t.position.set(-26 - Math.random()*4, 0, -10 + Math.random()*20);
        parent.add(t);
      }
      for (let i = 0; i < 8; i++) {
        const t = makeTree();
        t.position.set(26 + Math.random()*4, 0, -10 + Math.random()*20);
        parent.add(t);
      }
    } else if (name === 'trees_dense') {
      // 茂密森林: 战场内也有树丛
      for (let i = 0; i < 30; i++) {
        const t = makeTree(true);
        const side = Math.random() < 0.5 ? -1 : 1;
        t.position.set(side * (12 + Math.random()*16), 0, -14 + Math.random()*28);
        parent.add(t);
      }
    } else if (name === 'flowers') {
      for (let i = 0; i < 30; i++) {
        const f = makeFlower();
        f.position.set((Math.random()-0.5)*70, 0, (Math.random()-0.5)*40);
        parent.add(f);
      }
    } else if (name === 'logs' || name === 'mushrooms') {
      for (let i = 0; i < 6; i++) {
        const m = name === 'mushrooms' ? makeMushroom() : makeLog();
        m.position.set((Math.random()-0.5)*60, 0, -10 + Math.random()*20);
        parent.add(m);
      }
    } else if (name === 'dunes') {
      // 沙丘: 地平线上扁圆
      for (let i = 0; i < 10; i++) {
        const dune = new THREE.Mesh(
          new THREE.SphereGeometry(2 + Math.random()*3, 12, 6, 0, Math.PI*2, 0, Math.PI/2),
          new THREE.MeshLambertMaterial({ color: 0xd8b868 })
        );
        dune.position.set(-30 + i*7 + Math.random()*4, 0, -22 - Math.random()*8);
        dune.scale.y = 0.3;
        parent.add(dune);
      }
    } else if (name === 'cactus') {
      for (let i = 0; i < 6; i++) {
        const c = makeCactus();
        c.position.set((Math.random()-0.5)*60, 0, -8 + Math.random()*16);
        parent.add(c);
      }
    } else if (name === 'skull') {
      const s = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 12, 10),
        new THREE.MeshLambertMaterial({ color: 0xe8d8b0 })
      );
      s.position.set(-8, 0.4, 5);
      parent.add(s);
    } else if (name === 'snow_pines') {
      for (let i = 0; i < 14; i++) {
        const t = makeSnowPine();
        const side = Math.random() < 0.5 ? -1 : 1;
        t.position.set(side * (16 + Math.random()*10), 0, -12 + Math.random()*24);
        parent.add(t);
      }
    } else if (name === 'ice_rocks') {
      for (let i = 0; i < 10; i++) {
        const r = new THREE.Mesh(
          new THREE.IcosahedronGeometry(0.4 + Math.random()*0.6, 0),
          new THREE.MeshStandardMaterial({ color: 0xb8d8e8, transparent: true, opacity: 0.85, roughness: 0.3 })
        );
        r.position.set((Math.random()-0.5)*70, 0.3, (Math.random()-0.5)*30);
        r.castShadow = true;
        parent.add(r);
      }
    } else if (name === 'river') {
      // 中线水域
      const river = new THREE.Mesh(
        new THREE.PlaneGeometry(2.5, 22),
        new THREE.MeshStandardMaterial({ color: 0x4a7aa8, transparent: true, opacity: 0.75, roughness: 0.2, metalness: 0.4 })
      );
      river.rotation.x = -Math.PI / 2;
      river.position.set(0, 0.02, 0);
      parent.add(river);
    } else if (name === 'bridge') {
      const bridge = new THREE.Mesh(
        new THREE.BoxGeometry(3, 0.15, 4),
        new THREE.MeshStandardMaterial({ color: 0x6a4a2a, roughness: 0.9 })
      );
      bridge.position.set(0, 0.08, 0);
      bridge.castShadow = true;
      parent.add(bridge);
      // 桥栏杆
      for (const z of [-2, 2]) {
        const rail = new THREE.Mesh(
          new THREE.BoxGeometry(3, 0.4, 0.1),
          new THREE.MeshStandardMaterial({ color: 0x5a3a1a })
        );
        rail.position.set(0, 0.3, z);
        parent.add(rail);
      }
    } else if (name === 'stones') {
      for (let i = 0; i < 8; i++) {
        const r = new THREE.Mesh(
          new THREE.IcosahedronGeometry(0.3 + Math.random()*0.4, 0),
          new THREE.MeshStandardMaterial({ color: 0x8a8a90, roughness: 0.9 })
        );
        r.position.set((Math.random()-0.5)*60, 0.2, (Math.random()-0.5)*25);
        r.castShadow = true;
        parent.add(r);
      }
    } else if (name === 'lava_cracks') {
      // 熔岩裂痕 (发光)
      for (let i = 0; i < 5; i++) {
        const crack = new THREE.Mesh(
          new THREE.PlaneGeometry(3 + Math.random()*4, 0.6),
          new THREE.MeshBasicMaterial({ color: 0xff5a1a, transparent: true, opacity: 0.85 })
        );
        crack.rotation.x = -Math.PI / 2;
        crack.rotation.z = (Math.random()-0.5) * 1.5;
        crack.position.set((Math.random()-0.5)*30, 0.015, (Math.random()-0.5)*20);
        parent.add(crack);
      }
    } else if (name === 'obsidian') {
      for (let i = 0; i < 10; i++) {
        const r = new THREE.Mesh(
          new THREE.IcosahedronGeometry(0.4 + Math.random()*0.4, 0),
          new THREE.MeshStandardMaterial({ color: 0x1a1820, roughness: 0.4, metalness: 0.5 })
        );
        r.position.set((Math.random()-0.5)*60, 0.3, (Math.random()-0.5)*25);
        r.castShadow = true;
        parent.add(r);
      }
    } else if (name === 'smoke') {
      // 持续生成黑烟粒子 (用环境精灵, 简化做静态烟柱)
      for (let i = 0; i < 4; i++) {
        const s = new THREE.Mesh(
          new THREE.ConeGeometry(0.4, 1.5, 6),
          new THREE.MeshStandardMaterial({ color: 0x554a4a, transparent: true, opacity: 0.5 })
        );
        s.position.set(-25 + i*15, 0.7, -20);
        parent.add(s);
      }
    } else if (name === 'pillars') {
      // 残柱
      for (let i = 0; i < 6; i++) {
        const p = new THREE.Mesh(
          new THREE.CylinderGeometry(0.4, 0.45, 2 + Math.random()*1.5, 12),
          new THREE.MeshStandardMaterial({ color: 0xc8b890, roughness: 0.9 })
        );
        p.position.set((Math.random()-0.5)*55, 1, (Math.random()-0.5)*20);
        p.castShadow = true;
        parent.add(p);
      }
    } else if (name === 'broken_walls') {
      for (let i = 0; i < 4; i++) {
        const w = new THREE.Mesh(
          new THREE.BoxGeometry(2, 1.2, 0.4),
          new THREE.MeshStandardMaterial({ color: 0xb8a888, roughness: 0.9 })
        );
        w.rotation.y = Math.random() * Math.PI;
        w.position.set((Math.random()-0.5)*50, 0.6, -15 + Math.random()*30);
        w.castShadow = true;
        parent.add(w);
      }
    } else if (name === 'vines') {
      for (let i = 0; i < 8; i++) {
        const v = new THREE.Mesh(
          new THREE.BoxGeometry(0.06, 1.5, 0.06),
          new THREE.MeshStandardMaterial({ color: 0x4a6a2a })
        );
        v.position.set((Math.random()-0.5)*55, 0.7, (Math.random()-0.5)*25);
        v.rotation.z = (Math.random()-0.5) * 0.5;
        parent.add(v);
      }
    } else if (name === 'castle_wall') {
      // 后方城墙 (敌方一侧)
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(30, 3.5, 1.2),
        new THREE.MeshStandardMaterial({ color: 0x9a8a78, roughness: 0.95 })
      );
      wall.position.set(0, 1.75, -16);
      wall.castShadow = true;
      wall.receiveShadow = true;
      parent.add(wall);
      // 城墙锯齿 (battlements)
      for (let i = 0; i < 12; i++) {
        const tooth = new THREE.Mesh(
          new THREE.BoxGeometry(1, 0.7, 1.2),
          new THREE.MeshStandardMaterial({ color: 0x9a8a78 })
        );
        tooth.position.set(-13.5 + i*2.5, 3.5 + 0.35, -16);
        parent.add(tooth);
      }
      // 塔楼
      for (const tx of [-15, 15]) {
        const tower = new THREE.Mesh(
          new THREE.CylinderGeometry(1.4, 1.6, 5, 12),
          new THREE.MeshStandardMaterial({ color: 0x8a7a68, roughness: 0.9 })
        );
        tower.position.set(tx, 2.5, -16);
        tower.castShadow = true;
        parent.add(tower);
        const cone = new THREE.Mesh(
          new THREE.ConeGeometry(1.6, 2, 12),
          new THREE.MeshStandardMaterial({ color: 0x8a3a3a })
        );
        cone.position.set(tx, 6, -16);
        parent.add(cone);
      }
    } else if (name === 'torches') {
      for (let i = 0; i < 5; i++) {
        const torch = makeTorch();
        torch.position.set(-20 + i*10, 0, -14);
        parent.add(torch);
      }
    } else if (name === 'banners') {
      for (let i = 0; i < 4; i++) {
        const b = new THREE.Mesh(
          new THREE.PlaneGeometry(0.6, 1.8),
          new THREE.MeshStandardMaterial({ color: 0x8a3a3a, side: THREE.DoubleSide })
        );
        const px = -18 + i*12;
        b.position.set(px, 1.5, -14.5);
        parent.add(b);
      }
    } else if (name === 'stone_bridge') {
      // 工字布局的"高台+窄廊桥"装饰
      // 左平台 (x:0-290, y:0-540)
      const lp = { kind: 'platform', shape: 'rect', x: 145, y: 270, w: 290, h: 540 };
      buildObstacleMesh(lp, parent);
      // 右平台 (x:670-960, y:0-540)
      const rp = { kind: 'platform', shape: 'rect', x: 815, y: 270, w: 290, h: 540 };
      buildObstacleMesh(rp, parent);
      // 廊桥 (x:290-670, y:220-320 = 100px 窄走廊)
      const br = { kind: 'bridge_deck', shape: 'rect', x: 480, y: 270, w: 380, h: 100 };
      buildObstacleMesh(br, parent);
    } else if (name === 'floating_islands') {
      // 远处漂浮岛屿装饰 (色彩明亮, 拉远视觉层次)
      for (let i = 0; i < 7; i++) {
        const g = new THREE.Group();
        // 底部锥形岩石 (棕色)
        const isle = new THREE.Mesh(
          new THREE.ConeGeometry(2 + Math.random()*1.5, 1.8, 8),
          new THREE.MeshStandardMaterial({ color: 0x8a7a5a, roughness: 1 })
        );
        isle.rotation.x = Math.PI;
        isle.position.y = -0.2;
        g.add(isle);
        // 顶部翠绿草地 (色更鲜亮)
        const top = new THREE.Mesh(
          new THREE.CylinderGeometry(2 + Math.random()*1.3, 2.2 + Math.random()*1.3, 0.3, 12),
          new THREE.MeshStandardMaterial({ color: 0x7eaa48, roughness: 1 })
        );
        top.position.y = 0.85;
        g.add(top);
        // 岛上加棵小树 (50% 概率)
        if (Math.random() < 0.5) {
          const tree = makeTree(false);
          tree.scale.setScalar(0.6);
          tree.position.set((Math.random()-0.5) * 1.5, 1.0, (Math.random()-0.5) * 1.5);
          g.add(tree);
        }
        g.position.set(-32 + i*11 + Math.random()*3, 5 + Math.random()*4, -24 - Math.random()*8);
        parent.add(g);
      }
    } else if (name === 'clouds') {
      // 大量蓬松云朵, 多层深度
      for (let i = 0; i < 20; i++) {
        const cloud = new THREE.Group();
        // 每朵云由 3-5 个球叠加
        const count = 3 + Math.floor(Math.random() * 3);
        for (let j = 0; j < count; j++) {
          const ball = new THREE.Mesh(
            new THREE.SphereGeometry(0.8 + Math.random()*0.6, 12, 8),
            new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 })
          );
          ball.position.set(j * 0.7, (Math.random()-0.5) * 0.3, (Math.random()-0.5) * 0.5);
          ball.scale.y = 0.55;
          cloud.add(ball);
        }
        cloud.position.set(
          -35 + i * 4 + Math.random() * 3,
          7 + Math.random() * 5,
          -28 - Math.random() * 15
        );
        parent.add(cloud);
      }
    }
  }

  // 程序生成各种地图地面纹理 (复用基础, 调整颜色)
  // §3 ─ GROUND TEXTURE ───────────────────────────────────────────
  function makeGroundTextureForMap(mapId, mapData) {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 512;
    const ctx = c.getContext('2d');
    const top = mapData.ground_top || '#7a9858';
    const base = mapData.ground || '#6c8c4a';
    const grd = ctx.createLinearGradient(0, 0, 0, 512);
    grd.addColorStop(0, top); grd.addColorStop(0.5, base); grd.addColorStop(1, top);
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 512, 512);
    if (mapId === 'desert') {
      // 沙波
      for (let i = 0; i < 4000; i++) {
        const x = Math.random()*512, y = Math.random()*512;
        ctx.fillStyle = `rgba(${200+Math.random()*40},${170+Math.random()*30},${100+Math.random()*30},${0.3})`;
        ctx.fillRect(x, y, 2, 1);
      }
      ctx.strokeStyle = 'rgba(150,120,80,0.25)';
      for (let i = 0; i < 30; i++) {
        ctx.beginPath();
        const y = Math.random()*512;
        ctx.moveTo(0, y); ctx.bezierCurveTo(170,y-10,340,y+10,512,y);
        ctx.stroke();
      }
    } else if (mapId === 'snow') {
      // 雪花点
      for (let i = 0; i < 2000; i++) {
        ctx.fillStyle = `rgba(255,255,255,${0.4+Math.random()*0.4})`;
        ctx.fillRect(Math.random()*512, Math.random()*512, 2, 2);
      }
      // 阴影斑
      for (let i = 0; i < 80; i++) {
        ctx.fillStyle = `rgba(180,200,220,${0.15})`;
        ctx.beginPath();
        ctx.arc(Math.random()*512, Math.random()*512, 6+Math.random()*8, 0, Math.PI*2);
        ctx.fill();
      }
    } else if (mapId === 'volcano') {
      // 暗黑岩石 + 红色裂缝
      for (let i = 0; i < 5000; i++) {
        ctx.fillStyle = `rgba(${30+Math.random()*30},${20+Math.random()*15},${20+Math.random()*15},${0.5})`;
        ctx.fillRect(Math.random()*512, Math.random()*512, 1.5, 1.5);
      }
      // 红色裂缝
      ctx.strokeStyle = 'rgba(255,80,30,0.6)';
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 12; i++) {
        ctx.beginPath();
        const x = Math.random()*512, y = Math.random()*512;
        ctx.moveTo(x, y);
        ctx.lineTo(x + (Math.random()-0.5)*30, y + (Math.random()-0.5)*30);
        ctx.lineTo(x + (Math.random()-0.5)*60, y + (Math.random()-0.5)*60);
        ctx.stroke();
      }
    } else if (mapId === 'forest') {
      // 草+落叶
      for (let i = 0; i < 6000; i++) {
        ctx.fillStyle = `rgba(${40+Math.random()*30},${70+Math.random()*30},${30},${0.4})`;
        ctx.fillRect(Math.random()*512, Math.random()*512, 1.2, 1.2);
      }
      for (let i = 0; i < 100; i++) {
        ctx.fillStyle = ['#a8704a','#c89060','#7a4a2a'][Math.floor(Math.random()*3)];
        ctx.beginPath();
        ctx.arc(Math.random()*512, Math.random()*512, 2+Math.random()*1, 0, Math.PI*2);
        ctx.fill();
      }
    } else if (mapId === 'ruins') {
      // 石板地砖
      ctx.strokeStyle = 'rgba(80,70,60,0.3)';
      ctx.lineWidth = 1;
      for (let x = 0; x < 512; x += 64) for (let y = 0; y < 512; y += 64) {
        ctx.strokeRect(x, y, 64, 64);
      }
      for (let i = 0; i < 2000; i++) {
        ctx.fillStyle = `rgba(${100+Math.random()*40},${90+Math.random()*30},${70},${0.3})`;
        ctx.fillRect(Math.random()*512, Math.random()*512, 1.5, 1.5);
      }
    } else if (mapId === 'castle') {
      // 沙土 + 血迹
      for (let i = 0; i < 4000; i++) {
        ctx.fillStyle = `rgba(${130+Math.random()*30},${110+Math.random()*30},${80},${0.4})`;
        ctx.fillRect(Math.random()*512, Math.random()*512, 1.5, 1.5);
      }
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = `rgba(${100+Math.random()*30},20,20,0.4)`;
        ctx.beginPath();
        ctx.arc(Math.random()*512, Math.random()*512, 8+Math.random()*15, 0, Math.PI*2);
        ctx.fill();
      }
    } else if (mapId === 'bridge') {
      // 草地 + 河滩
      for (let i = 0; i < 5000; i++) {
        ctx.fillStyle = `rgba(${100+Math.random()*30},${130+Math.random()*40},${50+Math.random()*30},${0.3})`;
        ctx.fillRect(Math.random()*512, Math.random()*512, 1.2, 1.2);
      }
    } else {
      // 平原 (默认)
      for (let i = 0; i < 6000; i++) {
        ctx.fillStyle = `rgba(${100+Math.random()*40},${130+Math.random()*40},${50+Math.random()*30},${0.3})`;
        ctx.fillRect(Math.random()*512, Math.random()*512, 1.2, 1.2);
      }
      for (let i = 0; i < 80; i++) {
        ctx.fillStyle = ['#FFE680', '#FFAACC', '#FFFFFF'][Math.floor(Math.random()*3)];
        ctx.beginPath(); ctx.arc(Math.random()*512, Math.random()*512, 1.5, 0, Math.PI*2); ctx.fill();
      }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(8, 4);
    return tex;
  }

  function makeFlower() {
    const g = new THREE.Group();
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.25), new THREE.MeshStandardMaterial({ color: 0x4a6a2a }));
    stem.position.y = 0.12; g.add(stem);
    const petal = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 4), new THREE.MeshStandardMaterial({ color: ['#FFE680','#FFAAC0','#FF8A60','#FFFFFF'][Math.floor(Math.random()*4)] }));
    petal.position.y = 0.25; g.add(petal);
    return g;
  }
  function makeMushroom() {
    const g = new THREE.Group();
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.3), new THREE.MeshStandardMaterial({ color: 0xe8d8b0 }));
    stem.position.y = 0.15; g.add(stem);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6, 0, Math.PI*2, 0, Math.PI/2), new THREE.MeshStandardMaterial({ color: 0xc83a3a }));
    cap.position.y = 0.3; g.add(cap);
    return g;
  }
  function makeLog() {
    const g = new THREE.Group();
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.2, 8), new THREE.MeshStandardMaterial({ color: 0x6a4a2a }));
    log.rotation.z = Math.PI / 2;
    log.position.y = 0.18; log.castShadow = true; g.add(log);
    return g;
  }
  function makeCactus() {
    const g = new THREE.Group();
    const main = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.0, 0.3), new THREE.MeshStandardMaterial({ color: 0x4a8a4a, roughness: 0.95 }));
    main.position.y = 0.5; main.castShadow = true; g.add(main);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 0.2), new THREE.MeshStandardMaterial({ color: 0x4a8a4a }));
    arm.position.set(0.2, 0.7, 0); g.add(arm);
    return g;
  }
  function makeSnowPine() {
    const g = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 0.8), new THREE.MeshStandardMaterial({ color: 0x4a3a2a }));
    trunk.position.y = 0.4; g.add(trunk);
    for (let i = 0; i < 3; i++) {
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(0.7 - i*0.18, 0.8, 8),
        new THREE.MeshStandardMaterial({ color: 0x2a4a2a })
      );
      cone.position.y = 0.9 + i*0.5;
      cone.castShadow = true;
      g.add(cone);
    }
    // 雪
    const snow = new THREE.Mesh(
      new THREE.ConeGeometry(0.74, 0.18, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    snow.position.y = 1.0;
    g.add(snow);
    return g;
  }
  function makeTorch() {
    const g = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4), new THREE.MeshStandardMaterial({ color: 0x4a3a2a }));
    pole.position.y = 0.7; g.add(pole);
    const flame = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0xff8a4a, emissive: 0xff5a1a, emissiveIntensity: 1.2 })
    );
    flame.position.y = 1.5; g.add(flame);
    g.userData.flame = flame;
    return g;
  }

  // §4 ─ BACKGROUND ───────────────────────────────────────────────
  function addBackgroundDecoration() {
    // 远处山脉 (蓝灰偏亮, 给"大气透视"感而非剪影)
    for (let i = 0; i < 14; i++) {
      const h = 3 + Math.random() * 5;
      const geo = new THREE.ConeGeometry(1.6 + Math.random() * 2.5, h, 5);
      // 雪顶: 顶部用更浅色
      const colorVariation = 0.85 + Math.random() * 0.15;
      const baseHue = 0.6;
      const hsl = new THREE.Color().setHSL(baseHue, 0.25, 0.55 * colorVariation);
      const mat = new THREE.MeshLambertMaterial({ color: hsl });
      const cone = new THREE.Mesh(geo, mat);
      cone.position.set(-40 + i * 6 + (Math.random() - 0.5) * 4, h / 2 - 1.5, -32 - Math.random() * 10);
      scene.add(cone);
    }
    // 雪顶帽
    for (let i = 0; i < 14; i++) {
      const h = 3 + Math.random() * 5;
      const cap = new THREE.Mesh(
        new THREE.ConeGeometry(0.6 + Math.random() * 0.8, 1.0, 6),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      cap.position.set(-40 + i * 6 + (Math.random() - 0.5) * 4, h - 1.5, -32 - Math.random() * 10);
      scene.add(cap);
    }
    // 双方营地 (常驻)
    addCamp(-22, 0xffe8c2);
    addCamp(22, 0xe8a8a8);
  }

  function addCamp(x, color) {
    const tent = new THREE.Group();
    const cone = new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.4, 12), new THREE.MeshStandardMaterial({ color, roughness: 0.9 }));
    cone.position.y = 0.7;
    cone.castShadow = true;
    tent.add(cone);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.4), new THREE.MeshBasicMaterial({ color: x < 0 ? 0x4A90E2 : 0xE74C3C, side: THREE.DoubleSide }));
    flag.position.set(0.3, 1.7, 0);
    tent.add(flag);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.8), new THREE.MeshStandardMaterial({ color: 0x6a4a2a }));
    pole.position.y = 1.6;
    tent.add(pole);
    // 火堆 (发光)
    const fire = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 12, 10),
      new THREE.MeshStandardMaterial({ color: 0xff8a4a, emissive: 0xff5a1a, emissiveIntensity: 1.0 })
    );
    fire.position.set(-0.6, 0.25, 0.3);
    tent.add(fire);
    tent.userData.fire = fire;
    tent.userData.flag = flag;
    tent.position.set(x, 0, 0);
    scene.add(tent);
    // 加进 update 列表
    if (!scene.userData.camps) scene.userData.camps = [];
    scene.userData.camps.push(tent);
  }

  // 程序生成草地纹理 (canvas → THREE.CanvasTexture)
  function makeGroundTexture() {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 512;
    const ctx = c.getContext('2d');
    // 基底色
    const grd = ctx.createLinearGradient(0, 0, 0, 512);
    grd.addColorStop(0, '#6c8c4a');
    grd.addColorStop(0.5, '#7a9858');
    grd.addColorStop(1, '#5e7e3d');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 512, 512);
    // 草地噪点
    for (let i = 0; i < 6000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const a = Math.random() * 0.3;
      ctx.fillStyle = `rgba(${100 + Math.random()*40},${130 + Math.random()*40},${50 + Math.random()*30},${a})`;
      ctx.fillRect(x, y, 1.2, 1.2);
    }
    // 小花
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const isYellow = Math.random() < 0.6;
      ctx.fillStyle = isYellow ? '#FFE680' : '#FFAACC';
      ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI*2); ctx.fill();
    }
    // 草丛剪影
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      ctx.strokeStyle = `rgba(${60 + Math.random()*40},${100 + Math.random()*40},${40},${0.4})`;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (Math.random()-0.5) * 3, y - 3 - Math.random()*2);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(8, 4);
    return tex;
  }

  function makeTree(dense) {
    const g = new THREE.Group();
    const h = dense ? 0.8 + Math.random()*0.6 : 1.0;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, h, 6), new THREE.MeshStandardMaterial({ color: 0x6a4a2a, roughness: 1 }));
    trunk.position.y = h/2;
    trunk.castShadow = true;
    g.add(trunk);
    const leafColor = dense ? new THREE.Color().setHSL(0.28 + Math.random()*0.08, 0.55, 0.32) : 0x4a7a3a;
    const leaves = new THREE.Mesh(
      new THREE.ConeGeometry(0.7 + (dense ? Math.random()*0.4 : 0), 1.4, 8),
      new THREE.MeshStandardMaterial({ color: leafColor, roughness: 1 })
    );
    leaves.position.y = h + 0.4;
    leaves.castShadow = true;
    g.add(leaves);
    return g;
  }

  function setBgByColorTemp() {
    const colors = {
      warm: { sky: 0xf4d4a0, fog: 0xf4d4a0, sun: 0xffe4bb },
      neutral: { sky: 0x9bc8e6, fog: 0xa8c8de, sun: 0xfff4dd },
      cool: { sky: 0x7898b8, fog: 0x88a4c0, sun: 0xc8d0e8 },
      dark: { sky: 0x3a3e4a, fog: 0x2a2e3a, sun: 0xaaaaff }
    };
    const c = colors[colorTemp] || colors.neutral;
    scene.background = new THREE.Color(c.sky);
    if (scene.fog) scene.fog.color = new THREE.Color(c.fog);
    if (dirLight) dirLight.color = new THREE.Color(c.sun);
  }

  function onResize() {
    const w0 = window.innerWidth, h0 = window.innerHeight;
    renderer.setSize(w0, h0);
    renderer.setPixelRatio(window.devicePixelRatio || 1);  // iter-13
    if (typeof applyCamera === 'function') applyCamera();
    // iter-13: re-setup UI canvas at current DPR (handles DPR change on screen drag)
    if (Engine && Engine.setupHiDPICanvas) {
      uiCtx = Engine.setupHiDPICanvas(uiCanvas, 1280, 720);
      uiCtx.imageSmoothingEnabled = true;
    } else {
      uiCanvas.width = 1280;
      uiCanvas.height = 720;
    }
  }

  // §5 ─ UNIT MESH ────────────────────────────────────────────────
  // ═══ 单位 mesh ═══
  //
  // UNIT_BUILDERS  — dispatched first by entity NAME (e.g. 'archer').
  //   Add a new unit by adding name → buildFn here and an entry in entities.json.
  // UNIT_BUILDERS_BY_FAMILY — fallback when no name match, dispatched by FAMILY
  //   so new units of an existing family work zero-config.
  //
  // Both tables are populated AFTER the build* functions are declared
  // (hoisting + forward-references are fine for function declarations).
  //
  // Public makeUnit(spec) factory:
  //   const mesh = RenderSys.makeUnit({ name: 'archer', team: 'ally', scale: 1.0 })
  //   scene.add(mesh)
  // Useful from external code (sandbox UI, tests, screenshot tool) that wants
  // a unit mesh without going through Entity spawn → entity → makeUnitMesh.
  let UNIT_BUILDERS = {};
  let UNIT_BUILDERS_BY_FAMILY = {};
  function addEntityMesh(e) {
    const g = makeUnitMesh(e);
    g.userData.entityId = e.id;
    const pos = w(e.x, e.y, 0);
    g.position.copy(pos);
    scene.add(g);
    entityMeshes.set(e.id, g);
  }

  function makeUnitMesh(e) {
    const group = new THREE.Group();
    const teamColor = e.team === 'ally' ? 0x4A90E2 : 0xE74C3C;
    const skinColor = 0xf5d6a8;
    const scale = (e.scale || 1) * 1.0;

    // 阴影底盘 (圆盘)
    const baseRing = new THREE.Mesh(
      new THREE.RingGeometry(0.35 * scale, 0.55 * scale, 24),
      new THREE.MeshBasicMaterial({ color: teamColor, transparent: true, opacity: 0.55, side: THREE.DoubleSide })
    );
    baseRing.rotation.x = -Math.PI / 2;
    baseRing.position.y = 0.03;
    group.add(baseRing);

    // 由 family 决定外观 — dispatched via UNIT_BUILDERS table (see iter-6)
    const builder = UNIT_BUILDERS[e.name] || UNIT_BUILDERS_BY_FAMILY[e.family] || buildPikeman;
    builder(group, teamColor, skinColor, scale);

    // 朝向
    if (e.team === 'enemy') group.rotation.y = Math.PI;

    // 血条 (sprite)
    const hbCanvas = document.createElement('canvas');
    hbCanvas.width = 64; hbCanvas.height = 8;
    const hbTex = new THREE.CanvasTexture(hbCanvas);
    const hbMat = new THREE.SpriteMaterial({ map: hbTex, depthTest: false });
    const hb = new THREE.Sprite(hbMat);
    hb.scale.set(1.4 * scale, 0.18 * scale, 1);
    hb.position.set(0, 1.6 * scale, 0);
    hb.userData.canvas = hbCanvas;
    hb.userData.tex = hbTex;
    group.add(hb);
    group.userData.healthBar = hb;
    return group;
  }

  function buildPikeman(g, color, skin, s) {
    // 身体
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.35*s, 0.65*s, 0.25*s), new THREE.MeshStandardMaterial({ color: color, roughness: 0.6 }));
    body.position.y = 0.65*s;
    body.castShadow = true; g.add(body);
    // 头
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18*s, 12, 10), new THREE.MeshStandardMaterial({ color: skin }));
    head.position.y = 1.12*s;
    head.castShadow = true; g.add(head);
    // 头盔
    const helm = new THREE.Mesh(new THREE.CylinderGeometry(0.20*s, 0.22*s, 0.15*s, 12), new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.6, roughness: 0.3 }));
    helm.position.y = 1.22*s;
    helm.castShadow = true; g.add(helm);
    // 腿
    const legGeo = new THREE.BoxGeometry(0.12*s, 0.42*s, 0.14*s);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x4a3322, roughness: 1 });
    const lL = new THREE.Mesh(legGeo, legMat); lL.position.set(-0.09*s, 0.21*s, 0); lL.castShadow = true; g.add(lL);
    const lR = new THREE.Mesh(legGeo, legMat); lR.position.set(0.09*s, 0.21*s, 0); lR.castShadow = true; g.add(lR);
    g.userData.legs = [lL, lR];
    // 矛
    const pikePivot = new THREE.Group();
    pikePivot.position.set(0.16*s, 0.85*s, 0);
    pikePivot.rotation.z = -0.2;
    const pikeShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.025*s, 0.025*s, 1.6*s, 6), new THREE.MeshStandardMaterial({ color: 0x6a4a2a }));
    pikeShaft.position.y = 0.5*s;
    pikePivot.add(pikeShaft);
    const pikeTip = new THREE.Mesh(new THREE.ConeGeometry(0.05*s, 0.16*s, 8), new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.7 }));
    pikeTip.position.y = 1.35*s;
    pikePivot.add(pikeTip);
    g.add(pikePivot);
    g.userData.weapon = pikePivot;
  }

  function buildArcher(g, color, skin, s) {
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.32*s, 0.6*s, 0.22*s), new THREE.MeshStandardMaterial({ color: color, roughness: 0.7 }));
    body.position.y = 0.62*s; body.castShadow = true; g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.17*s, 12, 10), new THREE.MeshStandardMaterial({ color: skin })); head.position.y = 1.05*s; head.castShadow = true; g.add(head);
    // 头巾 (深色版本的队伍色, 与身体协调)
    const hoodColor = darkenColor(color, 0.55);
    const hood = new THREE.Mesh(new THREE.ConeGeometry(0.22*s, 0.28*s, 8), new THREE.MeshStandardMaterial({ color: hoodColor })); hood.position.y = 1.25*s; hood.castShadow = true; g.add(hood);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x4a3322 });
    const lL = new THREE.Mesh(new THREE.BoxGeometry(0.11*s, 0.4*s, 0.12*s), legMat); lL.position.set(-0.08*s, 0.2*s, 0); lL.castShadow = true; g.add(lL);
    const lR = new THREE.Mesh(new THREE.BoxGeometry(0.11*s, 0.4*s, 0.12*s), legMat); lR.position.set(0.08*s, 0.2*s, 0); lR.castShadow = true; g.add(lR);
    g.userData.legs = [lL, lR];
    // 弓
    const bowGroup = new THREE.Group();
    bowGroup.position.set(0.18*s, 0.7*s, 0);
    const bowArc = new THREE.Mesh(new THREE.TorusGeometry(0.32*s, 0.025*s, 6, 12, Math.PI), new THREE.MeshStandardMaterial({ color: 0x6a4a2a }));
    bowArc.rotation.z = Math.PI / 2;
    bowGroup.add(bowArc);
    g.add(bowGroup);
    g.userData.weapon = bowGroup;
  }

  function buildCavalry(g, color, skin, s) {
    // 马身
    const horseBody = new THREE.Mesh(new THREE.BoxGeometry(0.85*s, 0.45*s, 0.4*s), new THREE.MeshStandardMaterial({ color: 0x7a5a3a, roughness: 0.85 }));
    horseBody.position.y = 0.55*s; horseBody.castShadow = true; g.add(horseBody);
    // 马头
    const horseHead = new THREE.Mesh(new THREE.BoxGeometry(0.3*s, 0.3*s, 0.25*s), new THREE.MeshStandardMaterial({ color: 0x7a5a3a }));
    horseHead.position.set(0.5*s, 0.75*s, 0); horseHead.castShadow = true; g.add(horseHead);
    // 马腿
    const lMat = new THREE.MeshStandardMaterial({ color: 0x4a3022 });
    for (const [lx, lz] of [[-0.3, -0.15], [-0.3, 0.15], [0.3, -0.15], [0.3, 0.15]]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1*s, 0.5*s, 0.1*s), lMat);
      leg.position.set(lx*s, 0.25*s, lz*s); leg.castShadow = true; g.add(leg);
    }
    // 骑士
    const rider = new THREE.Mesh(new THREE.BoxGeometry(0.32*s, 0.5*s, 0.25*s), new THREE.MeshStandardMaterial({ color: color, metalness: 0.5, roughness: 0.4 }));
    rider.position.set(0, 1.1*s, 0); rider.castShadow = true; g.add(rider);
    const rHead = new THREE.Mesh(new THREE.SphereGeometry(0.16*s, 12, 10), new THREE.MeshStandardMaterial({ color: skin }));
    rHead.position.set(0, 1.5*s, 0); rHead.castShadow = true; g.add(rHead);
    const helm = new THREE.Mesh(new THREE.CylinderGeometry(0.18*s, 0.20*s, 0.15*s, 12), new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.7 }));
    helm.position.y = 1.6*s; helm.castShadow = true; g.add(helm);
    // 长剑
    const sword = new THREE.Group();
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.05*s, 0.7*s, 0.02*s), new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.8 }));
    blade.position.y = 0.35*s;
    sword.add(blade);
    sword.position.set(0.25*s, 1.0*s, 0); sword.rotation.z = -0.5;
    g.add(sword);
    g.userData.weapon = sword;
  }

  function buildGiant(g, color, skin, s) {
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.7*s, 1.0*s, 0.5*s), new THREE.MeshStandardMaterial({ color: color, roughness: 0.7 })); body.position.y = 1.0*s; body.castShadow = true; g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.32*s, 14, 12), new THREE.MeshStandardMaterial({ color: 0xd4a777 })); head.position.y = 1.85*s; head.castShadow = true; g.add(head);
    // 眼睛
    const eMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const eL = new THREE.Mesh(new THREE.SphereGeometry(0.04*s, 8, 6), eMat); eL.position.set(-0.1*s, 1.92*s, 0.30*s); g.add(eL);
    const eR = new THREE.Mesh(new THREE.SphereGeometry(0.04*s, 8, 6), eMat); eR.position.set(0.1*s, 1.92*s, 0.30*s); g.add(eR);
    // 胳膊
    const armMat = new THREE.MeshStandardMaterial({ color: 0xd4a777 });
    const aL = new THREE.Mesh(new THREE.BoxGeometry(0.25*s, 0.7*s, 0.25*s), armMat); aL.position.set(-0.5*s, 1.0*s, 0); aL.castShadow = true; g.add(aL);
    const aR = new THREE.Mesh(new THREE.BoxGeometry(0.25*s, 0.7*s, 0.25*s), armMat); aR.position.set(0.5*s, 1.0*s, 0); aR.castShadow = true; g.add(aR);
    // 腿
    const legMat = new THREE.MeshStandardMaterial({ color: 0x5a3a22 });
    const lL = new THREE.Mesh(new THREE.BoxGeometry(0.25*s, 0.55*s, 0.25*s), legMat); lL.position.set(-0.18*s, 0.27*s, 0); lL.castShadow = true; g.add(lL);
    const lR = new THREE.Mesh(new THREE.BoxGeometry(0.25*s, 0.55*s, 0.25*s), legMat); lR.position.set(0.18*s, 0.27*s, 0); lR.castShadow = true; g.add(lR);
    g.userData.legs = [lL, lR];
    // 大棒
    const club = new THREE.Group();
    const clubShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.06*s, 0.08*s, 0.9*s, 8), new THREE.MeshStandardMaterial({ color: 0x6a4a2a }));
    clubShaft.position.y = 0.45*s; club.add(clubShaft);
    const clubHead = new THREE.Mesh(new THREE.SphereGeometry(0.22*s, 12, 10), new THREE.MeshStandardMaterial({ color: 0x8a6a4a, roughness: 1 }));
    clubHead.position.y = 1.0*s; club.add(clubHead);
    club.position.set(0.55*s, 1.0*s, 0); club.rotation.z = -0.3;
    g.add(club); g.userData.weapon = club;
  }

  function buildMage(g, color, skin, s) {
    // 袍子 (锥形, 队伍色)
    const robe = new THREE.Mesh(new THREE.ConeGeometry(0.4*s, 0.95*s, 10), new THREE.MeshStandardMaterial({ color: color }));
    robe.position.y = 0.5*s; robe.castShadow = true; g.add(robe);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.16*s, 12, 10), new THREE.MeshStandardMaterial({ color: skin })); head.position.y = 1.1*s; head.castShadow = true; g.add(head);
    // 尖帽 (深色版本队伍色)
    const hatColor = darkenColor(color, 0.6);
    const hat = new THREE.Mesh(new THREE.ConeGeometry(0.22*s, 0.5*s, 10), new THREE.MeshStandardMaterial({ color: hatColor })); hat.position.y = 1.4*s; hat.castShadow = true; g.add(hat);
    // 法杖 + 火球
    const staff = new THREE.Group();
    const staffRod = new THREE.Mesh(new THREE.CylinderGeometry(0.03*s, 0.03*s, 1.4*s, 6), new THREE.MeshStandardMaterial({ color: 0x6a4a2a }));
    staffRod.position.y = 0.4*s; staff.add(staffRod);
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.12*s, 12, 12), new THREE.MeshStandardMaterial({ color: 0xff6b4a, emissive: 0xff4a1a, emissiveIntensity: 0.8 }));
    orb.position.y = 1.18*s; staff.add(orb);
    g.userData.orbLight = orb;
    staff.position.set(0.25*s, 0.4*s, 0); staff.rotation.z = -0.15;
    g.add(staff); g.userData.weapon = staff;
  }

  function buildShield(g, color, skin, s) {
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.4*s, 0.7*s, 0.28*s), new THREE.MeshStandardMaterial({ color: color, metalness: 0.5, roughness: 0.4 })); body.position.y = 0.7*s; body.castShadow = true; g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18*s, 12, 10), new THREE.MeshStandardMaterial({ color: skin })); head.position.y = 1.2*s; head.castShadow = true; g.add(head);
    const helm = new THREE.Mesh(new THREE.SphereGeometry(0.2*s, 12, 10), new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.8 })); helm.position.y = 1.3*s; helm.castShadow = true; g.add(helm);
    // 大盾
    const shield = new THREE.Mesh(new THREE.BoxGeometry(0.06*s, 0.8*s, 0.5*s), new THREE.MeshStandardMaterial({ color: 0x7a6a4a, metalness: 0.4 }));
    shield.position.set(-0.3*s, 0.7*s, 0); shield.castShadow = true; g.add(shield);
    const emblem = new THREE.Mesh(new THREE.CylinderGeometry(0.08*s, 0.08*s, 0.02*s, 12), new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8 }));
    emblem.position.set(-0.34*s, 0.7*s, 0); emblem.rotation.z = Math.PI / 2;
    g.add(emblem);
    // 短剑
    const sword = new THREE.Group();
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.04*s, 0.4*s, 0.02*s), new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.7 }));
    blade.position.y = 0.2*s; sword.add(blade);
    sword.position.set(0.25*s, 0.8*s, 0); sword.rotation.z = -0.3;
    g.add(sword); g.userData.weapon = sword;
    // 腿
    const legMat = new THREE.MeshStandardMaterial({ color: 0x4a3322 });
    const lL = new THREE.Mesh(new THREE.BoxGeometry(0.13*s, 0.45*s, 0.14*s), legMat); lL.position.set(-0.1*s, 0.22*s, 0); lL.castShadow = true; g.add(lL);
    const lR = new THREE.Mesh(new THREE.BoxGeometry(0.13*s, 0.45*s, 0.14*s), legMat); lR.position.set(0.1*s, 0.22*s, 0); lR.castShadow = true; g.add(lR);
    g.userData.legs = [lL, lR];
  }

  // ── Register builders into the dispatch tables (iter-6) ──
  UNIT_BUILDERS = {
    pikeman:  buildPikeman,
    archer:   buildArcher,
    cavalry:  buildCavalry,
    giant:    buildGiant,
    mage:     buildMage,
    shield:   buildShield,
  };
  UNIT_BUILDERS_BY_FAMILY = {
    infantry: buildPikeman,
    ranged:   buildArcher,
    cavalry:  buildCavalry,
    giant:    buildGiant,
    mage:     buildMage,
    tank:     buildShield,
  };

  // Public factory: build a unit Group from a spec without an entity object.
  //
  //   const mesh = RenderSys.makeUnit({
  //     name: 'archer',       // looks up UNIT_BUILDERS['archer']  (preferred)
  //     family: 'ranged',     //   OR fallback to UNIT_BUILDERS_BY_FAMILY['ranged']
  //     team: 'ally',         // 'ally' (blue) | 'enemy' (red) — determines tint + facing
  //     scale: 1.0,           // optional, default 1.0
  //     skin: 0xf5d6a8,       // optional override
  //   })
  //
  // Returns a fresh THREE.Group. Caller is responsible for `scene.add(mesh)`.
  function makeUnit(spec) {
    const team = spec.team || 'ally';
    const teamColor = team === 'ally' ? 0x4A90E2 : 0xE74C3C;
    const skin = (spec.skin != null) ? spec.skin : 0xf5d6a8;
    const scale = (spec.scale != null) ? spec.scale : 1.0;
    const builder = UNIT_BUILDERS[spec.name]
                 || UNIT_BUILDERS_BY_FAMILY[spec.family]
                 || buildPikeman;
    const group = new THREE.Group();
    // shadow disc
    const baseRing = new THREE.Mesh(
      new THREE.RingGeometry(0.35 * scale, 0.55 * scale, 24),
      new THREE.MeshBasicMaterial({ color: teamColor, transparent: true, opacity: 0.55, side: THREE.DoubleSide })
    );
    baseRing.rotation.x = -Math.PI / 2;
    baseRing.position.y = 0.03;
    group.add(baseRing);
    builder(group, teamColor, skin, scale);
    if (team === 'enemy') group.rotation.y = Math.PI;
    return group;
  }

  // §6 ─ RAGDOLL ──────────────────────────────────────────────────
  function transformToRagdoll(e) {
    const g = entityMeshes.get(e.id);
    if (!g) return;
    g.userData.isRagdoll = true;
    // 巨人摔得更狠, 矛兵更轻飞
    const massScale = e.mass || 1;
    const launchY = 6 + Math.random() * 6;
    const spinScale = 1.0 / Math.sqrt(massScale);
    g.userData.spinVel = {
      x: (Math.random() - 0.5) * 28 * spinScale,
      y: (Math.random() - 0.5) * 18 * spinScale,
      z: (Math.random() - 0.5) * 28 * spinScale
    };
    g.userData.airborne = true;
    g.userData.vy = launchY;
    // 击退方向: 沿 source 推开
    const src = e._lastDamageSource;
    let dirX = 0, dirZ = 0;
    if (src && (src.x !== e.x || src.y !== e.y)) {
      const dx = e.x - src.x, dz = e.y - src.y;
      const d = Math.sqrt(dx*dx + dz*dz) || 1;
      dirX = dx / d; dirZ = dz / d;
    } else {
      const ang = Math.random() * Math.PI * 2;
      dirX = Math.cos(ang); dirZ = Math.sin(ang);
    }
    const horizontalKick = (4 + Math.random() * 5) / Math.sqrt(massScale);
    g.userData.vx = dirX * horizontalKick;
    g.userData.vz = dirZ * horizontalKick;
  }

  function removeEntityMesh(id) {
    const g = entityMeshes.get(id);
    if (!g) return;
    scene.remove(g);
    g.traverse(o => { if (o.geometry) o.geometry.dispose?.(); if (o.material) {
      if (Array.isArray(o.material)) o.material.forEach(m => m.dispose?.()); else o.material.dispose?.();
    } });
    entityMeshes.delete(id);
  }

  // §7 ─ PROJECTILE MESH ──────────────────────────────────────────
  function addProjectileMesh(p) {
    let mesh;
    if (p.sprite === 'fireball') {
      const geo = new THREE.SphereGeometry(0.18, 12, 12);
      const mat = new THREE.MeshStandardMaterial({ color: 0xff6b4a, emissive: 0xff4a1a, emissiveIntensity: 1.0 });
      mesh = new THREE.Mesh(geo, mat);
    } else {
      // 箭矢: 圆柱体沿默认 Y 轴, 渲染时用 lookAt 对齐速度向量
      const geo = new THREE.CylinderGeometry(0.025, 0.025, 0.5, 6);
      const mat = new THREE.MeshStandardMaterial({ color: 0xddc88a });
      mesh = new THREE.Mesh(geo, mat);
    }
    mesh.position.copy(w(p.x, p.y, p.spawn_h ?? 1.4));
    scene.add(mesh);
    projectileMeshes.set(p.id, mesh);
  }

  function removeProjectileMesh(id) {
    const m = projectileMeshes.get(id);
    if (!m) return;
    scene.remove(m);
    m.geometry?.dispose(); m.material?.dispose();
    projectileMeshes.delete(id);
  }

  function clearAllMeshes() {
    for (const id of Array.from(entityMeshes.keys())) removeEntityMesh(id);
    for (const id of Array.from(projectileMeshes.keys())) removeProjectileMesh(id);
  }

  // §8 ─ JUICE / PARTICLES ────────────────────────────────────────
  // ═══ Juice ═══
  function triggerJuice(eventName, x, y) {
    const spec = DATA.juice?.events?.[eventName];
    if (!spec) return;
    if (spec.hit_stop_ms) hitStop(spec.hit_stop_ms);
    if (spec.screen_shake) shakeMag += spec.screen_shake;
    if (spec.flash_color) { flashColor = spec.flash_color; flashUntil = now() + (spec.flash_ms || 80); }
    if (spec.slowmo_scale && spec.slowmo_ms) slowMotion(spec.slowmo_scale, spec.slowmo_ms);
    if (spec.particle) spawnParticle(spec.particle, x, y);
    if (spec.sound && typeof AudioSys !== 'undefined') AudioSys.playSfx(spec.sound, 0.5);
  }

  function spawnParticle(name, x, y, hOverride) {
    const spec = DATA.vfx?.[name];
    if (!spec) return;
    const count = spec.count || 8;
    // 默认粒子生成高度: 高台地图取平台单位胸高 (5.58 + 0.6), 其他地图 0.6
    const isSkybridge = currentMapId === 'skybridge';
    const baseY = (hOverride != null) ? hOverride : (isSkybridge ? 6.18 : 0.6);
    const floorY = isSkybridge ? 5.58 : 0.05;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * (spec.spread_rad || Math.PI * 2);
      const sp = (spec.speed || 80) * SCALE * (0.5 + Math.random());
      const c = spec.color === 'rainbow' ? `hsl(${Math.random()*360},80%,60%)` : (spec.color || '#fff');
      particles.push({
        x: (x - arenaW/2) * SCALE,
        y: baseY,
        z: (y - arenaH/2) * SCALE,
        vx: Math.cos(a) * sp,
        vy: 1 + Math.random() * 1.5,
        vz: Math.sin(a) * sp,
        life: spec.lifetime_ms || 500,
        maxLife: spec.lifetime_ms || 500,
        color: c, size: (spec.size || 3) * 0.05,
        gravity: (spec.gravity || 0) * 0.001,
        type: spec.type || 'dot',
        floorY: floorY
      });
    }
  }

  function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt * 1000;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      p.x += (p.vx || 0) * dt;
      p.y += (p.vy || 0) * dt;
      p.z += (p.vz || 0) * dt;
      if (p.gravity != null) p.vy -= p.gravity;
      const floor = (p.floorY != null) ? p.floorY : 0.05;
      if (p.y < floor) p.y = floor;
    }
    if (particles.length > 200) particles.splice(0, particles.length - 200);
    // floaters
    for (let i = goldFloaters.length - 1; i >= 0; i--) {
      const g = goldFloaters[i];
      g.life -= dt * 1000;
      g.y += g.vy * dt * 1000;
      g.alpha = Math.max(0, g.life / 800);
      if (g.life <= 0) goldFloaters.splice(i, 1);
    }
    // 伤害飞字
    for (let i = damageNumbers.length - 1; i >= 0; i--) {
      const d = damageNumbers[i];
      d.life -= dt * 1000;
      d.worldH += d.vy * dt * 0.001;  // 抬升 (世界单位)
      d.worldX += d.vx * dt * 0.05;
      d.vy *= 0.96;  // 减速
      if (d.life <= 0) damageNumbers.splice(i, 1);
    }
    for (let i = aoeRings.length - 1; i >= 0; i--) {
      aoeRings[i].life -= dt * 1000;
      if (aoeRings[i].life <= 0) aoeRings.splice(i, 1);
    }
    // iter-VFX: smooth exponential decay instead of fixed 0.85 multiplier.
    // Frame-rate independent — uses dt directly so shake feels the same at 30 vs 60 fps.
    shakeMag *= Math.pow(0.0001, dt);  // ~95% per frame at 60fps, ~83% at 30fps
    if (shakeMag < 0.05) shakeMag = 0;
  }

  // 每帧同步 entity 位置到 mesh
  // §9 ─ SYNC MESHES (per-frame) ──────────────────────────────────
  function syncMeshes(dt) {
    // 高台地图: 单位站在 5.5 单位高的平台/桥面上
    const elevateY = (currentMapId === 'skybridge') ? 5.58 : 0;
    for (const e of EntitySys.getAll()) {
      const g = entityMeshes.get(e.id);
      if (!g) continue;
      const pos = w(e.x, e.y, 0);
      // 基础位置: 从 entity 同步
      g.position.x = pos.x; g.position.z = pos.z; g.position.y = elevateY;
      // 视觉偏移 (lunge / recoil 累加, 不污染 entity 数据)
      g.userData._visualOffset = { x: 0, y: 0 };
      // 朝向: 根据 AI 目标
      if (e.ai_target_id) {
        const t = EntitySys.findById(e.ai_target_id);
        if (t) {
          const ang = Math.atan2(t.x - e.x, t.y - e.y);
          g.rotation.y = -ang + Math.PI / 2;
        }
      } else {
        g.rotation.y = e.team === 'ally' ? Math.PI / 2 : -Math.PI / 2;
      }
      // 行走腿动画 (在 elevateY 基础上加颠簸, 不要覆盖)
      if (g.userData.legs && (Math.abs(e.vx) + Math.abs(e.vy)) > 5 && !g.userData.isRagdoll) {
        const t = now() / 180 + e.id;
        g.userData.legs[0].rotation.x = Math.sin(t) * 0.55;
        g.userData.legs[1].rotation.x = -Math.sin(t) * 0.55;
        g.position.y = elevateY + Math.abs(Math.sin(t * 2)) * 0.05;
      }
      // 待机轻微浮动
      if (GameState.getState() === 'PLAN' && !g.userData.isRagdoll) {
        g.position.y = elevateY + Math.sin(now() / 400 + e.id) * 0.04;
      }
      // 庆祝跳跃
      if (g.userData.celebrate) {
        const t = (now() - g.userData.celebrate.startT) / 1000;
        const jumpY = Math.abs(Math.sin(t * 5 + e.id)) * 0.4;
        g.position.y = elevateY + jumpY;
        g.rotation.y = t * 2;
      }
      // 受击闪白
      if (g.userData.hitFlash > 0) {
        g.userData.hitFlash -= dt;
        const intensity = Math.max(0, g.userData.hitFlash / 0.18);
        g.traverse(o => {
          if (o.material && o.material.emissive) {
            if (!o.material._origEmissive) o.material._origEmissive = o.material.emissive.clone();
            o.material.emissive.setRGB(intensity, intensity, intensity);
          }
        });
      } else if (g.userData._needsResetEmissive) {
        g.traverse(o => {
          if (o.material && o.material._origEmissive) o.material.emissive.copy(o.material._origEmissive);
        });
        g.userData._needsResetEmissive = false;
      }
      if (g.userData.hitFlash > 0) g.userData._needsResetEmissive = true;
      // 受击后仰 (使用视觉偏移)
      if (g.userData.hitRecoil) {
        g.userData.hitRecoil.t += dt;
        const r = g.userData.hitRecoil;
        if (r.t >= r.dur) g.userData.hitRecoil = null;
        else {
          const pct = r.t / r.dur;
          const dirBack = e.team === 'ally' ? -1 : 1;
          g.userData._visualOffset.x += dirBack * (1 - pct) * 0.08;
        }
      }
      // 攻击挥武器动画 + 武器 trail
      if (g.userData.attackAnim) {
        const a = g.userData.attackAnim;
        a.t += dt;
        const p = a.t / a.dur;
        if (g.userData.weapon) {
          if (p < 0.4) {
            g.userData.weapon.rotation.z = -0.2 - p * 1.6;
          } else if (p < 0.7) {
            g.userData.weapon.rotation.z = -0.2 - 0.64 + (p - 0.4) * 5;
            // 下劈瞬间生成 trail 粒子
            if (p > 0.5 && p < 0.65) {
              const wpos = new THREE.Vector3();
              g.userData.weapon.getWorldPosition(wpos);
              particles.push({
                x: wpos.x, y: wpos.y + 0.5, z: wpos.z,
                vx: 0, vy: 0, vz: 0,
                life: 200, maxLife: 200,
                color: '#FFFFE0', size: 0.06,
                gravity: 0, type: 'dot'
              });
            }
          } else {
            g.userData.weapon.rotation.z = -0.2 + (1 - p) * 0.5;
          }
        }
        // 单位向前冲一小步 (lunge, 视觉偏移)
        const dir = e.team === 'ally' ? 1 : -1;
        if (p < 0.3) g.userData._visualOffset.x += dir * p * 0.3;
        else g.userData._visualOffset.x += dir * (1 - p) * 0.13;
        if (p >= 1) {
          g.userData.attackAnim = null;
          if (g.userData.weapon) g.userData.weapon.rotation.z = -0.2;
        }
      }
      // 应用视觉偏移
      if (g.userData._visualOffset) {
        g.position.x += g.userData._visualOffset.x;
        g.position.y += g.userData._visualOffset.y;
      }
    }
    // 布娃娃: 位置由 spinVel + gravity 控制
    for (const c of EntitySys.getCorpses()) {
      const g = entityMeshes.get(c.id);
      if (!g) continue;
      // 重力下落 + 旋转
      g.position.x += (g.userData.vx || 0) * dt;
      g.position.z += (g.userData.vz || 0) * dt;
      if (g.userData.airborne) {
        g.position.y += (g.userData.vy || 0) * dt;
        g.userData.vy -= 25 * dt;
        // 检查是否处于深渊上方 (skybridge 才有深渊)
        const overAbyss = isOverAbyss(g.position.x, g.position.z);
        if (overAbyss) {
          // 深渊上方: 不停止下落, 一直坠到深渊底部 (-30 之下视为消失)
          if (!g.userData.fallingIntoAbyss) {
            g.userData.fallingIntoAbyss = true;
            // 深渊坠落音效 + 加速旋转
            if (typeof AudioSys !== 'undefined') AudioSys.playSfx('sfx_death_flop', 0.4);
            g.userData.spinVel.x *= 1.6;
            g.userData.spinVel.z *= 1.6;
          }
          // 坠到 -30 以下就标记移除 (避免无限累积)
          if (g.position.y < -30) {
            g.userData.abyssGone = true;
          }
        } else if (g.position.y <= elevateY) {
          // 平台/桥面上方: 落到平面
          g.position.y = elevateY;
          g.userData.airborne = false;
          g.userData.vy = 0;
          // 着陆减速
          g.userData.vx *= 0.4;
          g.userData.vz *= 0.4;
          g.userData.spinVel.x *= 0.3;
          g.userData.spinVel.z *= 0.3;
        }
      }
      g.rotation.x += (g.userData.spinVel?.x || 0) * dt;
      g.rotation.y += (g.userData.spinVel?.y || 0) * dt;
      g.rotation.z += (g.userData.spinVel?.z || 0) * dt;
      // 衰减
      if (!g.userData.airborne) {
        g.userData.spinVel.x *= 0.9;
        g.userData.spinVel.y *= 0.9;
        g.userData.spinVel.z *= 0.9;
      }
      // 透明度
      const a = c.ragdoll_alpha;
      if (a < 1) {
        g.traverse(o => {
          if (o.material && !o.material._origOpacity) {
            o.material._origOpacity = o.material.opacity;
            o.material.transparent = true;
          }
          if (o.material && o.material.opacity != null) o.material.opacity = a * (o.material._origOpacity || 1);
        });
      }
    }
    // 投射物 + 拖尾 (含抛物线弧)
    for (const p of CombatSys.getProjectiles()) {
      const m = projectileMeshes.get(p.id);
      if (!m) continue;
      // 抛物线参数
      const totalDist = p.total_dist || 1;
      const startH = p.spawn_h ?? 1.4;
      const endH   = p.end_h   ?? 0.9;
      const arcF   = p.arc_factor ?? 0.18;
      const arcMag = totalDist * SCALE * arcF;
      const t      = Math.max(0, Math.min(1, p.traveled / totalDist));
      const h      = startH + (endH - startH) * t + arcMag * Math.sin(Math.PI * t);
      const pos    = w(p.x, p.y, h);
      m.position.copy(pos);
      // 朝向: 用稍前位置算 lookAt, 让箭头沿 3D 速度向量
      const isFire = p.sprite === 'fireball';
      if (!isFire) {
        const tNext = Math.min(1, t + 0.04);
        const hNext = startH + (endH - startH) * tNext + arcMag * Math.sin(Math.PI * tNext);
        const aheadX = p.x + p.vx * 0.04;
        const aheadY = p.y + p.vy * 0.04;
        const lookTarget = w(aheadX, aheadY, hNext);
        m.lookAt(lookTarget);
        // CylinderGeometry 默认沿 Y 轴, lookAt 后局部 -Z 指向 target;
        // 旋转 -90° X 把 Y 轴对齐到 -Z (即指向 target)
        m.rotateX(-Math.PI / 2);
      }
      // 每帧产生一个拖尾粒子
      particles.push({
        x: pos.x + (Math.random()-0.5)*0.05,
        y: pos.y + (Math.random()-0.5)*0.05,
        z: pos.z + (Math.random()-0.5)*0.05,
        vx: 0, vy: isFire ? 0.5 : 0, vz: 0,
        life: isFire ? 350 : 180, maxLife: isFire ? 350 : 180,
        color: isFire ? '#FFB050' : '#FFE8A0',
        size: isFire ? 0.12 : 0.04,
        gravity: 0, type: 'dot'
      });
    }
    // 协同光环 (BATTLE 阶段, 同类相邻 ≥2 显示头顶蓝/红圈)
    if (GameState.getState() === 'BATTLE') {
      const all = EntitySys.getAll();
      const synR = cfg('synergy.radius_px', 100);
      for (const e of all) {
        const g = entityMeshes.get(e.id);
        if (!g) continue;
        const sameTeam = e.team === 'ally' ? EntitySys.getAllies() : EntitySys.getEnemies();
        let count = 0;
        for (const o of sameTeam) {
          if (o.id === e.id || o.family !== e.family) continue;
          const dx = e.x - o.x, dy = e.y - o.y;
          if (dx*dx + dy*dy < synR*synR) count++;
        }
        if (count >= 1) {
          if (!g.userData.synAura) {
            const aura = new THREE.Mesh(
              new THREE.RingGeometry(0.18, 0.28, 16),
              new THREE.MeshBasicMaterial({ color: e.team === 'ally' ? 0x4ACFFF : 0xFF7A4A, transparent: true, opacity: 0.7, side: THREE.DoubleSide })
            );
            aura.rotation.x = -Math.PI / 2;
            aura.position.y = 1.65 * (e.scale || 1);
            g.add(aura);
            g.userData.synAura = aura;
          }
          const t = now() / 200;
          const intensity = Math.min(count, 2) / 2;
          g.userData.synAura.material.opacity = 0.4 + 0.4 * intensity * (0.7 + 0.3 * Math.sin(t));
          g.userData.synAura.scale.setScalar(0.9 + 0.15 * Math.sin(t));
          g.userData.synAura.visible = true;
        } else if (g.userData.synAura) {
          g.userData.synAura.visible = false;
        }
      }
    }
    // 血条更新
    for (const e of EntitySys.getAll()) {
      const g = entityMeshes.get(e.id);
      if (!g || !g.userData.healthBar) continue;
      const pct = e.current_hp / e.max_hp;
      const cv = g.userData.healthBar.userData.canvas;
      const cx = cv.getContext('2d');
      cx.clearRect(0, 0, 64, 8);
      if (pct < 1) {
        cx.fillStyle = '#000'; cx.fillRect(0, 0, 64, 8);
        cx.fillStyle = pct > 0.5 ? '#4AE85A' : (pct > 0.25 ? '#E8D84A' : '#E84A4A');
        cx.fillRect(2, 2, 60 * pct, 4);
        g.userData.healthBar.material.map.needsUpdate = true;
        g.userData.healthBar.visible = true;
      } else {
        g.userData.healthBar.visible = false;
      }
    }
    // ghost
    updateGhost();
  }

  // §10 ─ GHOST / DECOR ───────────────────────────────────────────
  function updateGhost() {
    const state = GameState.getState();
    if (state !== 'PLAN') {
      if (ghost) { scene.remove(ghost); ghost = null; }
      return;
    }
    const sel = InputSys.getCurrentSelected();
    if (!sel) {
      if (ghost) { scene.remove(ghost); ghost = null; }
      return;
    }
    const arena = InputSys.getCurrentArenaPos();
    if (!arena) { if (ghost) ghost.visible = false; return; }
    const isSandbox = GameState.getCurrentLevelId() === 'sandbox';
    const arenaW2 = cfg('arena.width', 960);
    const allyMax = cfg('arena.ally_zone_x_max', 440);
    let validPos = false;
    let team = 'ally';
    if (isSandbox) {
      // 沙盒: 按 x 自动判队, 中线 30px 不能放, 障碍区不能放
      if (arena.x > 0 && arena.x < arenaW2 && Math.abs(arena.x - arenaW2/2) > 30) {
        if (!PhysicsSys.checkBlocked(arena.x, arena.y, 14)) {
          validPos = true;
          team = arena.x < arenaW2/2 ? 'ally' : 'enemy';
        }
      }
    } else {
      validPos = arena.x >= 0 && arena.x <= allyMax && !PhysicsSys.checkBlocked(arena.x, arena.y, 14);
    }
    if (!validPos) {
      if (ghost) ghost.visible = false;
      return;
    }
    // 重建 ghost 当 type 或 team 变化时
    const ghostKey = sel + ':' + team;
    if (!ghost || ghost.userData.gkey !== ghostKey) {
      if (ghost) scene.remove(ghost);
      const tpl = getEntityTemplate(sel);
      if (!tpl) return;
      const fakeE = { ...tpl, team, id: -1 };
      ghost = makeUnitMesh(fakeE);
      ghost.userData.gkey = ghostKey;
      ghost.userData.type = sel;
      ghost.traverse(o => {
        if (o.material) {
          o.material = o.material.clone();
          o.material.transparent = true;
          o.material.opacity = 0.55;
        }
      });
      scene.add(ghost);
    }
    ghost.visible = true;
    const pos = w(arena.x, arena.y, 0);
    ghost.position.x = pos.x; ghost.position.z = pos.z;
    // 高台地图: 抬到平台顶面 (与已部署单位同高)
    const elev = (currentMapId === 'skybridge') ? 5.58 : 0;
    // 待机轻微浮动 (与正式单位一致)
    ghost.position.y = elev + Math.sin(now() / 400) * 0.04;
    // 敌方 ghost 朝左
    ghost.rotation.y = team === 'enemy' ? Math.PI : 0;
  }

  // 装饰物动画 (火堆呼吸 + 旗子飘 + 熔岩火星)
  function updateDecor() {
    const camps = scene.userData.camps;
    const t = now() / 1000;
    if (camps) {
      for (const c of camps) {
        if (c.userData.fire) {
          const breathe = 0.85 + Math.sin(t * 4 + c.position.x) * 0.15;
          c.userData.fire.scale.set(breathe, breathe + Math.sin(t * 6) * 0.1, breathe);
          c.userData.fire.material.emissiveIntensity = 0.7 + Math.sin(t * 5) * 0.3;
        }
        if (c.userData.flag) {
          c.userData.flag.rotation.y = Math.sin(t * 2 + c.position.x) * 0.3;
        }
      }
    }
    // 熔岩持续生成火星
    const lavaSources = scene.userData.lavaSources;
    if (lavaSources && lavaSources.length > 0 && Math.random() < 0.5) {
      const o = lavaSources[Math.floor(Math.random() * lavaSources.length)];
      const wp = w(o.x + (Math.random()-0.5) * o.w, o.y + (Math.random()-0.5) * o.h, 0.05);
      particles.push({
        x: wp.x, y: wp.y + 0.05, z: wp.z,
        vx: (Math.random()-0.5) * 0.5,
        vy: 1.5 + Math.random() * 1.5,
        vz: (Math.random()-0.5) * 0.5,
        life: 600, maxLife: 600,
        color: '#FFB060', size: 0.08, gravity: 0.005, type: 'dot'
      });
    }
    // 火炬火焰摇曳
    if (mapDecorGroup) {
      mapDecorGroup.traverse(node => {
        if (node.userData?.flame) {
          const breathe = 0.85 + Math.sin(t * 8 + node.position.x) * 0.15;
          node.userData.flame.scale.setScalar(breathe);
        }
      });
    }
    // 深渊持续下落的碎石粒子 (每帧 0.3 概率生成)
    const abyssSrc = scene.userData.abyssDebrisSources;
    if (abyssSrc && abyssSrc.length > 0 && Math.random() < 0.3) {
      const o = abyssSrc[Math.floor(Math.random() * abyssSrc.length)];
      const wp = w(o.x + (Math.random()-0.5) * o.w * 0.8, o.y + (Math.random()-0.5) * o.h * 0.8, 0);
      particles.push({
        x: wp.x,
        y: -0.5 - Math.random() * 1,
        z: wp.z,
        vx: 0, vy: -2 - Math.random() * 1, vz: 0,
        life: 2500, maxLife: 2500,
        color: '#5a5060', size: 0.05 + Math.random() * 0.05,
        gravity: 0.005, type: 'dot'
      });
    }
  }

  // 切换地图时清掉旧 lava/abyss sources
  function clearLavaSources() {
    scene.userData.lavaSources = [];
    scene.userData.abyssDebrisSources = [];
  }

  // §11 ─ RENDER LOOP ─────────────────────────────────────────────
  // ═══ 主渲染 ═══
  function render() {
    const state = GameState.getState();
    updateDecor();
    // 相机抖动 + 微跟随战场重心 (减弱 lookAt 偏移避免画面歪)
    if (camera._baseY != null) {
      // iter-VFX: smoother shake using perlin-ish sinusoidal jitter instead of pure random
      // → less "TV static" feel, more "earthquake" feel
      const shakePhase = Engine.now() * 0.05;
      const shakeX = shakeMag > 0.1
        ? (Math.sin(shakePhase) + Math.sin(shakePhase * 1.7) * 0.5) * shakeMag * 0.03
        : 0;
      const shakeY = shakeMag > 0.1
        ? (Math.cos(shakePhase * 1.3) + Math.cos(shakePhase * 2.1) * 0.5) * shakeMag * 0.03
        : 0;
      // 极轻微的位置浮动 (BATTLE 阶段才有)
      let camOffsetX = 0;
      const state = GameState.getState();
      if (state === 'BATTLE') {
        const all = EntitySys.getAll();
        if (all.length > 0) {
          let sx = 0;
          for (const e of all) sx += e.x;
          sx /= all.length;
          camOffsetX = (sx - 480) * 0.04 * 0.12;  // 极轻 12% 偏移
        }
      }
      const isRotated = camera._rotRad && Math.abs(camera._rotRad) > 0.001;
      if (isRotated) {
        // 旋转模式: 锁定到 applyCamera 计算的旋转位置, 不做战斗 pan
        camera.position.x = camera._baseX + shakeX;
        camera.position.y = camera._baseY + shakeY;
        camera.position.z = camera._baseZ;
      } else {
        camera.position.x += (camOffsetX - camera.position.x) * 0.02 + shakeX;
        camera.position.y = camera._baseY + shakeY;
        camera.position.z = camera._baseZ;
      }
      camera.lookAt(0, camera._lookY || 0.6, 0);
    }
    // 粒子池 (重用 mesh, 避免 GC 卡顿)
    if (!scene.userData.particleGroup) {
      scene.userData.particleGroup = new THREE.Group();
      scene.add(scene.userData.particleGroup);
      scene.userData.particlePool = [];
    }
    const pg = scene.userData.particleGroup;
    const pool = scene.userData.particlePool;
    let used = 0;
    for (const p of particles) {
      let m;
      if (used < pool.length) {
        m = pool[used];
        m.material.color.set(p.color);
        m.material.opacity = p.life / p.maxLife;
        m.scale.setScalar(p.size / 0.05);
        m.visible = true;
      } else {
        const mat = new THREE.MeshBasicMaterial({ color: p.color, transparent: true, opacity: p.life / p.maxLife });
        m = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 4), mat);
        pool.push(m);
        pg.add(m);
        m.scale.setScalar(p.size / 0.05);
      }
      m.position.set(p.x, p.y, p.z);
      used++;
    }
    // 隐藏未用的 pool mesh
    for (let i = used; i < pool.length; i++) pool[i].visible = false;
    // AOE rings (单独画, 数量少)
    if (!scene.userData.ringGroup) {
      scene.userData.ringGroup = new THREE.Group();
      scene.add(scene.userData.ringGroup);
    }
    const rg = scene.userData.ringGroup;
    rg.clear();
    for (const r of aoeRings) {
      const a = r.life / r.max;
      const inner = r.radius * SCALE * (1.3 - a);
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(inner * 0.7, inner, 32),
        new THREE.MeshBasicMaterial({ color: 0xffe877, transparent: true, opacity: a * 0.85, side: THREE.DoubleSide })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set((r.x - arenaW/2) * SCALE, 0.05, (r.y - arenaH/2) * SCALE);
      rg.add(ring);
    }

    renderer.render(scene, camera);

    // UI 层 (2D)
    renderUIOverlay();
  }

  function renderUIOverlay() {
    const ctx = uiCtx;
    ctx.clearRect(0, 0, 1280, 720);
    // flash
    if (flashColor && now() < flashUntil) {
      ctx.save();
      ctx.globalAlpha = 0.3 * ((flashUntil - now()) / 80);
      ctx.fillStyle = flashColor;
      ctx.fillRect(0, 0, 1280, 720);
      ctx.restore();
    }
    // gold floaters
    for (const g of goldFloaters) {
      ctx.save();
      ctx.globalAlpha = g.alpha;
      ctx.fillStyle = g.color;
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(g.text, g.x, g.y);
      ctx.restore();
    }
    // 伤害飞字 (世界 → 屏幕)
    for (const d of damageNumbers) {
      const wp = w(d.worldX, d.worldY, d.worldH);
      const sp = wp.clone().project(camera);
      const sx = (sp.x * 0.5 + 0.5) * 1280;
      const sy = (-sp.y * 0.5 + 0.5) * 720;
      const a = d.life / d.max;
      const scale = d.crit ? (1.4 + Math.sin(d.life * 0.02) * 0.15) : 1.0;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(sx, sy);
      ctx.scale(scale, scale);
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.font = `bold ${d.crit ? 30 : 22}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('-' + d.amount, 2, 2);
      ctx.fillStyle = d.crit ? '#FFE4A0' : '#FF7878';
      ctx.fillText('-' + d.amount, 0, 0);
      if (d.crit) {
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText('CRIT!', 0, -22);
      }
      ctx.restore();
    }
  }

  // §12 ─ ACCESSORS ───────────────────────────────────────────────
  function getUICtx() { return uiCtx; }
  function getCamera() { return camera; }
  function getScene() { return scene; }
  function getRenderer() { return renderer; }

  // §13 ─ CAMERA API ──────────────────────────────────────────────
  // ═══ 相机参数 API (3 参数: 俯角/视距/旋转) ═══
  // 默认值: 俯角 0.68 / 视距 32 / 旋转 0°
  const CAM_DEFAULTS = { tilt: 0.68, dist: 32, rot: 0 };
  const cameraConfig = {
    overrideTilt: null,        // 0~1, 0=平视 1=正俯视
    overrideDist: null,        // 镜头视距 (15~60)
    overrideRot: null,         // 旋转角度 (0~360°), 0=正前方
  };

  function applyCamera() {
    if (!camera || !threeCanvas) return;
    const w0 = window.innerWidth, h0 = window.innerHeight;
    camera.aspect = w0 / h0;
    const isPortrait = camera.aspect < 1.0;
    camera.fov = isPortrait ? 80 : 50;
    const camDist = cameraConfig.overrideDist != null ? cameraConfig.overrideDist : CAM_DEFAULTS.dist;
    const tilt    = cameraConfig.overrideTilt != null ? cameraConfig.overrideTilt : CAM_DEFAULTS.tilt;
    const isSkybridge = currentMapId === 'skybridge';
    const platformElev = isSkybridge ? 5.5 : 0;
    camera._baseY = camDist * tilt + platformElev;
    camera._baseR = camDist * (isPortrait ? 0.7 : 1.0);
    camera._lookY = (isSkybridge ? 1.5 : 0.6) + platformElev;
    // 旋转: 围绕 (0, lookY, 0) 在水平面上转, 0=正前方, 90=右侧, 180=正后方, 270=左侧
    const rotDeg = cameraConfig.overrideRot != null ? cameraConfig.overrideRot : CAM_DEFAULTS.rot;
    const rotRad = rotDeg * Math.PI / 180;
    camera._rotRad = rotRad;
    camera._baseX = Math.sin(rotRad) * camera._baseR;
    camera._baseZ = Math.cos(rotRad) * camera._baseR;
    camera.position.set(camera._baseX, camera._baseY, camera._baseZ);
    camera.lookAt(0, camera._lookY, 0);
    camera.updateProjectionMatrix();
  }

  function setCameraTilt(t) { cameraConfig.overrideTilt = t; applyCamera(); }
  function setCameraDist(d) { cameraConfig.overrideDist = d; applyCamera(); }
  function setCameraRot(r) { cameraConfig.overrideRot = ((r % 360) + 360) % 360; applyCamera(); }
  function resetCamera() {
    Object.keys(cameraConfig).forEach(k => cameraConfig[k] = null);
    applyCamera();
  }
  function getCameraConfig() {
    return {
      ...cameraConfig,
      currentPos: { x: camera.position.x.toFixed(2), y: camera.position.y.toFixed(2), z: camera.position.z.toFixed(2) },
      currentFov: camera.fov,
      currentBaseY: camera._baseY?.toFixed(2),
      currentBaseZ: camera._baseZ?.toFixed(2),
      currentLookY: camera._lookY?.toFixed(2)
    };
  }

  // 暴露到 window
  window.cameraAPI = {
    setTilt: setCameraTilt,
    setDist: setCameraDist,
    setRot: setCameraRot,
    reset: resetCamera,
    get: getCameraConfig,
    help: () => console.log(`
═══ 相机调整 API (3参数) ═══
cameraAPI.setTilt(0.45)   // 俯角 (0=平视 / 1=正俯视)
cameraAPI.setDist(25)     // 视距 (15~60)
cameraAPI.setRot(45)      // 旋转 (0~360°, 围绕场地中心水平转)
cameraAPI.reset()         // 恢复默认
cameraAPI.get()           // 查看当前参数
    `)
  };

  function getCurrentMapId() { return currentMapId; }
  return {
    init, render, updateParticles, triggerJuice, spawnParticle, syncMeshes,
    getUICtx, getCamera, getScene, getRenderer, applyCamera, getCurrentMapId,
    // iter-6: factory + lookup tables for external use
    makeUnit,
    getUnitBuilders: () => Object.keys(UNIT_BUILDERS),
    getUnitFamilies: () => Object.keys(UNIT_BUILDERS_BY_FAMILY),
  };
})();
window.RenderSys = RenderSys;
