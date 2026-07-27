// ═══ Input 系统 · 3D 战场点击 + UI 命中 ═══
const InputSys = (() => {
  let canvas = null; // UI canvas (用于事件监听)
  let currentSelected = null;
  let hoverArenaX = 0, hoverArenaY = 0;
  let pointerDownPos = null;
  let pointerDownTime = 0;
  let longPressTimer = null;
  let gameState = 'LOADING';
  let raycaster = null;
  let ndc = null;

  function init(cnv) {
    canvas = cnv;
    raycaster = new THREE.Raycaster();
    ndc = new THREE.Vector2();
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    window.addEventListener('keydown', onKeyDown);
    on('game_state_changed', ({ to }) => { gameState = to; currentSelected = null; });
  }

  // CSS 像素坐标 → UI canvas (1280x720) 坐标
  function toUICoords(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (1280 / rect.width);
    const y = (e.clientY - rect.top) * (720 / rect.height);
    return { x, y };
  }

  // 屏幕 → 战场 2D 坐标 (通过 raycast 到适当高度平面)
  function screenToArena(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(ndc, RenderSys.getCamera());
    const SCALE = 0.04;  // 与 render3d 一致 (1px = 0.04 unit)
    const arenaW = cfg('arena.width', 960), arenaH = cfg('arena.height', 540);
    // 高台地图 (skybridge) 使用平台顶面 y=5.58 做相交; 其他地图用 y=0
    const isElevated = GameState.getCurrentLevelId() === 'sandbox' && window._sandboxMap === 'skybridge';
    // 主线: 检查 zone_data.map (但 GameState 没暴露 currentZone)
    let planeY = 0;
    if (isElevated) planeY = 5.58;
    // 尝试相交主平面
    const dir = raycaster.ray.direction;
    const origin = raycaster.ray.origin;
    if (Math.abs(dir.y) < 0.0001) return null;
    const tHit = (planeY - origin.y) / dir.y;
    if (tHit < 0) return null;  // 射线在平面后方
    const hitX = origin.x + dir.x * tHit;
    const hitZ = origin.z + dir.z * tHit;
    return {
      x: hitX / SCALE + arenaW / 2,
      y: hitZ / SCALE + arenaH / 2
    };
  }

  function onPointerDown(e) {
    const ui = toUICoords(e);
    pointerDownPos = ui;
    pointerDownTime = now();
    if (UISys.hitTest(ui.x, ui.y, e.button)) return;

    const isSandbox = GameState.getCurrentLevelId() === 'sandbox';

    if (gameState === 'PLAN' && e.button === 2) {
      const arena = screenToArena(e.clientX, e.clientY);
      if (!arena) return;
      const ent = isSandbox
        ? EntitySys.getAnyNear(arena.x, arena.y, 30)
        : EntitySys.getAllyNear(arena.x, arena.y, 30);
      if (ent) emit('remove_request', { entity_id: ent.id });
      return;
    }

    if (gameState === 'PLAN' && currentSelected && e.button === 0) {
      clearTimeout(longPressTimer);
      longPressTimer = setTimeout(() => {
        const arena = screenToArena(e.clientX, e.clientY);
        if (!arena) return;
        const ent = isSandbox
          ? EntitySys.getAnyNear(arena.x, arena.y, 30)
          : EntitySys.getAllyNear(arena.x, arena.y, 30);
        if (ent) emit('remove_request', { entity_id: ent.id });
      }, 500);
    }
  }

  function onPointerMove(e) {
    const arena = screenToArena(e.clientX, e.clientY);
    if (arena) { hoverArenaX = arena.x; hoverArenaY = arena.y; }
    if (pointerDownPos) {
      const ui = toUICoords(e);
      if (Math.hypot(ui.x - pointerDownPos.x, ui.y - pointerDownPos.y) > 10) clearTimeout(longPressTimer);
    }
  }

  function onPointerUp(e) {
    clearTimeout(longPressTimer);
    if (!pointerDownPos) return;
    const ui = toUICoords(e);
    const wasClick = Math.hypot(ui.x - pointerDownPos.x, ui.y - pointerDownPos.y) < 8;
    pointerDownPos = null;
    if (UISys.hitTestUp(ui.x, ui.y, wasClick, e.button)) return;

    if (gameState === 'PLAN' && currentSelected && e.button === 0) {
      const arena = screenToArena(e.clientX, e.clientY);
      if (!arena) return;
      const isSandbox = GameState.getCurrentLevelId() === 'sandbox';
      const arenaW = cfg('arena.width', 960);
      const groundY = cfg('arena.ground_y', 480);
      // y 范围检查
      if (arena.y < 40 || arena.y > groundY) return;
      if (isSandbox) {
        // 沙盒: 整个战场都能放, 按 x 自动判队
        if (arena.x < 0 || arena.x > arenaW) return;
        const midX = arenaW / 2;
        if (Math.abs(arena.x - midX) < 30) return;
        // 障碍物区域 (含 abyss) 不能部署
        if (PhysicsSys.checkBlocked(arena.x, arena.y, currentSelected ? 14 : 14)) return;
        const team = arena.x < midX ? 'ally' : 'enemy';
        emit('deploy_request', { type: currentSelected, x: arena.x, y: arena.y, team });
      } else {
        // 主线: 只能放己方区
        if (arena.x >= 0 && arena.x <= cfg('arena.ally_zone_x_max', 440)) {
          emit('deploy_request', { type: currentSelected, x: arena.x, y: arena.y });
        }
      }
    }
  }

  function onKeyDown(e) {
    if (e.code === 'Space') { e.preventDefault(); emit('player_request_start', {}); }
    else if (e.code === 'KeyR') emit('player_request_reset', {});
    else if (e.code === 'Escape') emit('menu_select', { option: 'back_to_menu' });
    else if (/^Digit[1-6]$/.test(e.code)) {
      const idx = parseInt(e.code.slice(5), 10) - 1;
      const unlocked = EconomySys.getUnlocked();
      if (unlocked[idx]) { currentSelected = unlocked[idx]; emit('unit_type_selected', { type: unlocked[idx] }); }
    }
  }

  function getCurrentSelected() { return currentSelected; }
  function setSelected(type) { currentSelected = type; }
  function getCurrentArenaPos() { return { x: hoverArenaX, y: hoverArenaY }; }

  return { init, getCurrentSelected, setSelected, getCurrentArenaPos };
})();
window.InputSys = InputSys;
