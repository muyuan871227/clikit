// ═══ Zone 系统 · 关卡 + 敌方布阵 ═══
const ZoneSys = (() => {
  let currentZone = null;

  function init() {
    on('level_enter', ({ level_id }) => { loadZone(level_id); });
    on('plan_phase_started', ({ level_id, budget }) => { spawnEnemies(level_id); });
    on('level_won', ({ level_id }) => { checkUnlock(level_id); });
  }

  function loadZone(level_id) {
    const locs = DATA.locations?.locations || [];
    let zone = locs.find(z => z.id === level_id) || locs[0];
    // 沙盒: 用全局选中的地图覆盖
    if (level_id === 'sandbox' && window._sandboxMap) {
      zone = { ...zone, map: window._sandboxMap };
    }
    currentZone = zone;
    emit('zone_entered', { level_id, zone_data: zone });
  }
  // 已含 level_id, 但保险起见 emit 时确保有

  function spawnEnemies(level_id) {
    const zone = (DATA.locations?.locations || []).find(z => z.id === level_id);
    if (!zone || !zone.enemy_comp || zone.enemy_comp.length === 0) return;
    setSeed(hashStr(level_id));
    const enemyXMin = cfg('arena.enemy_zone_x_min', 520);
    const arenaW = cfg('arena.width', 960);
    const groundY = cfg('arena.ground_y', 480);

    // 分前后排
    const front = []; const back = []; const giant = [];
    for (const [type, count] of zone.enemy_comp) {
      const tpl = getEntityTemplate(type);
      if (!tpl) continue;
      const fam = tpl.family;
      for (let i = 0; i < count; i++) {
        if (fam === 'giant') giant.push({ type, tpl });
        else if (fam === 'ranged' || fam === 'mage') back.push({ type, tpl });
        else front.push({ type, tpl });
      }
    }

    placeRow(front, 640, 700, 60, groundY - 50);
    placeRow(back, 780, 900, 60, groundY - 50);
    placeRow(giant, 680, 720, 200, groundY - 60);
  }

  function placeRow(list, xMin, xMax, yMin, yMax) {
    if (list.length === 0) return;
    const yRange = yMax - yMin;
    const count = list.length;
    for (let i = 0; i < count; i++) {
      const y = yMin + (i + 0.5) * (yRange / count) + rng(-8, 8);
      const x = xMin + (xMax - xMin) * ((i % 2) === 0 ? 0.3 : 0.7) + rng(-12, 12);
      emit('spawn_request', { type: list[i].type, x, y, team: 'enemy' });
    }
  }

  function checkUnlock(level_id) {
    const m = /level_(\d+)/.exec(level_id);
    if (!m) return;
    const num = parseInt(m[1], 10);
    const chain = DATA.progression?.unlock_chain || [];
    for (const u of chain) {
      if (u.level_cleared === num) emit('unlock_granted', { entity_name: u.unlock });
    }
  }

  function getCurrentZone() { return currentZone; }
  return { init, getCurrentZone };
})();
window.ZoneSys = ZoneSys;
