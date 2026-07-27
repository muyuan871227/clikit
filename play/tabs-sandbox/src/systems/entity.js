// ═══ Entity 系统 · 实体生命周期 ═══
const EntitySys = (() => {
  let nextId = 1;
  const allies = [];
  const enemies = [];
  const corpses = [];

  function init() {
    on('spawn_request', ({ type, x, y, team }) => { spawn(type, x, y, team || 'ally'); });
    on('damage_request', handleDamage);
    on('remove_request', ({ entity_id }) => { removeEntity(entity_id); });
    on('game_state_changed', ({ to }) => { if (to === 'PLAN' || to === 'MENU') clearAll(); });
  }

  function spawn(type, x, y, team) {
    const tpl = getEntityTemplate(type);
    if (!tpl) { console.warn('unknown entity type', type); return null; }
    if (allies.length + enemies.length >= cfg('physics.max_entities', 120)) return null;
    const e = JSON.parse(JSON.stringify(tpl));
    e.id = nextId++;
    e.x = x; e.y = y;
    e.prev_x = x; e.prev_y = y;
    e.vx = 0; e.vy = 0;
    e.team = team;
    e.alive = true;
    e.is_ragdoll = false;
    e.ragdoll_timer = 0;
    e.ragdoll_alpha = 1.0;
    e.current_hp = e.hp;
    e.max_hp = e.hp;
    e.attack_cooldown_ms = 0;
    e.ai_state = 'idle';
    e.ai_target_id = null;
    e.ai_acquire_timer = 0;
    e.facing_right = team === 'ally';
    e.bones = null; // 布娃娃骨骼
    e.constraints = null;

    // 难度修正 (仅 enemy)
    if (team === 'enemy') {
      const num = parseInt((GameState.getCurrentLevelId() || 'level_01').slice(6), 10) || 1;
      const mods = DATA.ai_behaviors?.difficulty_modifiers || {};
      let key = 'level_1_5';
      if (num >= 16) key = 'level_16_20';
      else if (num >= 11) key = 'level_11_15';
      else if (num >= 6) key = 'level_6_10';
      const m = mods[key] || {};
      e.hp = Math.round(e.hp * (m.enemy_hp_mul || 1));
      e.current_hp = e.hp; e.max_hp = e.hp;
      e.damage = Math.round(e.damage * (m.enemy_dmg_mul || 1));
    }

    (team === 'ally' ? allies : enemies).push(e);
    emit('entity_spawned', { entity: e });
    // spawn juice
    if (e.spawn_effect) RenderSys.triggerJuice(e.spawn_effect, x, y);
    return e;
  }

  function handleDamage({ target, amount, source, damage_type }) {
    if (!target || !target.alive) return;
    // 无敌帧
    if (target._invincible_until && now() < target._invincible_until) return;

    // 护甲减伤
    const arm = target.armor || 0;
    let final = amount * (1 - arm / 100);
    // 盾兵 shield_hp 优先吸收
    if (target.shield_hp > 0) {
      const absorb = Math.min(final, target.shield_hp);
      target.shield_hp -= absorb;
      final -= absorb;
    }
    target.current_hp -= final;
    target._invincible_until = now() + cfg('combat.hit_stun_ms', 100);
    target._lastDamageSource = source;  // 用于布娃娃飞起方向

    emit('entity_damaged', { target, amount: final, source, damage_type });
    if (target.damage_effect) RenderSys.triggerJuice(target.damage_effect, target.x, target.y);

    if (target.current_hp <= 0 && target.alive) {
      killEntity(target, source);
    }
  }

  function killEntity(target, source) {
    target.alive = false;
    target.is_ragdoll = true;
    target.ragdoll_timer = cfg('combat.death_flop_duration_ms', 2000);

    // 从活体队列移除
    const arr = target.team === 'ally' ? allies : enemies;
    const i = arr.indexOf(target);
    if (i >= 0) arr.splice(i, 1);

    // 加入 corpses, 初始化 bones (物理系统使用)
    PhysicsSys.initRagdoll(target);
    corpses.push(target);

    // 清理 corpses 上限
    const maxRag = cfg('physics.max_ragdoll_on_screen', 40);
    while (corpses.length > maxRag) {
      const oldest = corpses.shift();
      emit('entity_cleanup', { entity_id: oldest.id });
    }

    emit('entity_destroyed', { target, source });
    if (target.death_effect) RenderSys.triggerJuice(target.death_effect, target.x, target.y);

    // 检查阵亡广播
    if (allies.length === 0 && enemies.length > 0) emit('all_allies_dead', {});
    if (enemies.length === 0 && allies.length > 0) emit('all_enemies_dead', {});
  }

  function removeEntity(id) {
    for (const arr of [allies, enemies]) {
      const i = arr.findIndex(e => e.id === id);
      if (i >= 0) { arr.splice(i, 1); emit('entity_cleanup', { entity_id: id }); return; }
    }
  }

  function clearAll() {
    allies.length = 0; enemies.length = 0; corpses.length = 0;
  }

  function update(dt) {
    // 冷却衰减
    for (const e of allies) { if (e.attack_cooldown_ms > 0) e.attack_cooldown_ms -= dt * 1000; }
    for (const e of enemies) { if (e.attack_cooldown_ms > 0) e.attack_cooldown_ms -= dt * 1000; }
    // 布娃娃计时
    for (let i = corpses.length - 1; i >= 0; i--) {
      const c = corpses[i];
      c.ragdoll_timer -= dt * 1000;
      if (c.ragdoll_timer < 500) c.ragdoll_alpha = Math.max(0, c.ragdoll_timer / 500);
      if (c.ragdoll_timer <= 0) {
        corpses.splice(i, 1);
        emit('entity_cleanup', { entity_id: c.id });
      }
    }
  }

  function getAllies() { return allies; }
  function getEnemies() { return enemies; }
  function getCorpses() { return corpses; }
  function getAll() { return [...allies, ...enemies]; }
  function findById(id) {
    return allies.find(e => e.id === id) || enemies.find(e => e.id === id) || null;
  }
  function getAllyNear(x, y, r) {
    let best = null, bestD = r * r;
    for (const e of allies) {
      const d = dist2(x, y, e.x, e.y);
      if (d < bestD) { bestD = d; best = e; }
    }
    return best;
  }
  function getAnyNear(x, y, r) {
    let best = null, bestD = r * r;
    for (const e of [...allies, ...enemies]) {
      const d = dist2(x, y, e.x, e.y);
      if (d < bestD) { bestD = d; best = e; }
    }
    return best;
  }

  return { init, update, spawn, getAllies, getEnemies, getCorpses, getAll, findById, getAllyNear, getAnyNear };
})();
window.EntitySys = EntitySys;
