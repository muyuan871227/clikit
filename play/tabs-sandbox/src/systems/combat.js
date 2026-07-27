// ═══ Combat 系统 · 攻击 + 伤害 + 投射物 ═══
const CombatSys = (() => {
  const projectiles = [];
  let nextProjId = 1;

  function init() {
    on('ai_attack_request', handleAttack);
    on('game_state_changed', ({ to }) => { if (to === 'PLAN' || to === 'MENU') projectiles.length = 0; });
  }

  function handleAttack({ attacker_id, target_id }) {
    const a = EntitySys.findById(attacker_id);
    const t = EntitySys.findById(target_id);
    if (!a || !t || !a.alive || !t.alive) return;
    if (a.attack_cooldown_ms > 0) return;
    const d = dist(a.x, a.y, t.x, t.y);
    if (d > (a.range || 40)) return;

    // 朝向
    a.facing_right = t.x > a.x;

    // 有投射物 → 远程
    if (a.projectile) {
      spawnProjectile(a, t);
    } else {
      // 近战
      dealDamage(a, t, 'melee');
      // AOE
      if (a.area_damage_radius) {
        applyAOE(a, t.x, t.y, a.area_damage_radius);
      }
    }
    a.attack_cooldown_ms = a.hit_speed_ms || 1000;
    // 攻击开始特效
    if (a.attack_start_effect) RenderSys.triggerJuice(a.attack_start_effect, a.x, a.y);
  }

  function dealDamage(attacker, target, dmgType) {
    const base = attacker.damage || 10;
    // synergy
    const syn = calcSynergy(attacker);
    // counter
    const cMul = calcCounter(attacker, target);
    // crit
    const crit = rngFloat() < cfg('combat.crit_chance', 0.08) ? cfg('combat.crit_multiplier', 1.5) : 1;
    const total = base * (1 + syn) * cMul * crit;

    emit('damage_request', { target, amount: total, source: attacker, damage_type: dmgType });

    // 击退
    const dx = target.x - attacker.x, dy = target.y - attacker.y;
    const d = Math.sqrt(dx*dx + dy*dy) || 1;
    const kb = cfg('combat.knockback_base', 120) * (base / 20);
    const juiceEv = DATA.juice?.events?.[target.damage_effect || 'hit_light'];
    const kMul = juiceEv?.knockback_mul || 1.0;
    emit('apply_impulse', { entity_id: target.id, vx: dx/d * kb * kMul, vy: dy/d * kb * kMul });
  }

  function applyAOE(attacker, x, y, radius) {
    const targets = attacker.team === 'ally' ? EntitySys.getEnemies() : EntitySys.getAllies();
    let hits = 0;
    for (const t of targets) {
      const d = dist(x, y, t.x, t.y);
      if (d < radius) {
        hits++;
        const falloff = 1 - (d / radius) * 0.5;
        const base = attacker.damage;
        const partial = { ...attacker, damage: base * falloff };
        dealDamage(partial, t, 'aoe');
      }
    }
    // 友军伤害
    if (cfg('combat.friendly_fire_aoe', false)) {
      const friends = attacker.team === 'ally' ? EntitySys.getAllies() : EntitySys.getEnemies();
      for (const t of friends) {
        if (t.id === attacker.id) continue;
        const d = dist(x, y, t.x, t.y);
        if (d < radius) {
          const partial = { ...attacker, damage: attacker.damage * 0.5 * (1 - d/radius) };
          dealDamage(partial, t, 'aoe');
        }
      }
    }
    emit('aoe_hit', { x, y, radius, source_id: attacker.id });
  }

  function calcSynergy(attacker) {
    const r = cfg('synergy.radius_px', 100);
    const same = attacker.team === 'ally' ? EntitySys.getAllies() : EntitySys.getEnemies();
    let sameCount = 0;
    for (const a of same) {
      if (a.id === attacker.id || a.family !== attacker.family) continue;
      if (dist(a.x, a.y, attacker.x, attacker.y) < r) sameCount++;
    }
    let syn1 = Math.min(sameCount, 2) * cfg('synergy.same_type_bonus_per', 0.075);
    let syn2 = 0;
    if (attacker.family === 'ranged' || attacker.family === 'mage') {
      const rearDx = attacker.team === 'ally' ? -50 : 50;
      for (const a of same) {
        if (a.family !== 'tank') continue;
        const ddx = a.x - (attacker.x + rearDx);
        if (Math.abs(ddx) < 60 && Math.abs(a.y - attacker.y) < 60) { syn2 = cfg('synergy.shield_rear_bonus', 0.10); break; }
      }
    }
    return Math.min(syn1 + syn2, cfg('synergy.max_total_bonus', 0.25));
  }

  function calcCounter(attacker, target) {
    const table = DATA.globals?.counter || {};
    const af = attacker.family, tf = target.family;
    const map = {
      'infantry->cavalry': 'pike_vs_cavalry',
      'ranged->infantry': 'archer_vs_pike',
      'cavalry->ranged': 'cavalry_vs_archer'
    };
    const key = map[`${af}->${tf}`];
    if (key && table[key]) return table[key];
    // shield 吸收减伤 (attacker 是 ranged, target 是 tank)
    if (af === 'ranged' && tf === 'tank' && table.shield_vs_archer) return table.shield_vs_archer;
    return 1.0;
  }

  function spawnProjectile(attacker, target) {
    const pData = DATA.entities?.projectiles?.[attacker.projectile];
    if (!pData) return;
    const dx = target.x - attacker.x, dy = target.y - attacker.y;
    const d = Math.sqrt(dx*dx + dy*dy) || 1;
    const isFire = pData.sprite === 'fireball';
    // 判断地图抬高: skybridge 单位站在 5.58 高的平台上, 弹道要相应抬高
    const mapId = (typeof RenderSys !== 'undefined' && RenderSys.getCurrentMapId)
                  ? RenderSys.getCurrentMapId() : null;
    const elevateY = (mapId === 'skybridge') ? 5.58 : 0;
    const p = {
      id: nextProjId++,
      owner_id: attacker.id,
      team: attacker.team,
      x: attacker.x, y: attacker.y - 12,
      vx: dx/d * pData.speed, vy: dy/d * pData.speed,
      damage: attacker.damage,
      max_range: pData.max_range || 260,
      aoe_radius: pData.aoe_radius || 0,
      traveled: 0,
      sprite: pData.sprite,
      hit_effect: pData.hit_effect,
      family: attacker.family,
      // 弹道高度参数 (3D 渲染用) - 含地图抬高
      total_dist: d,                              // 初始水平距离 (arena 单位)
      spawn_h: elevateY + 1.4,                    // 起点世界高度 (弓/法球在攻击者头顶)
      end_h: elevateY + 0.9,                      // 终点世界高度 (击中目标胸/腹)
      arc_factor: isFire ? 0.05 : 0.18,           // 弧线幅度系数
    };
    projectiles.push(p);
    emit('projectile_spawned', { projectile: p });
  }

  function update(dt) {
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      const oldX = p.x, oldY = p.y;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.traveled += Math.sqrt((p.x - oldX)**2 + (p.y - oldY)**2);
      if (p.traveled > p.max_range) {
        projectiles.splice(i, 1);
        emit('projectile_destroyed', { projectile: p });
        continue;
      }
      // 命中检测
      const targets = p.team === 'ally' ? EntitySys.getEnemies() : EntitySys.getAllies();
      let hit = null;
      for (const t of targets) {
        if (dist(p.x, p.y, t.x, t.y) < (t.collision_radius || 14)) { hit = t; break; }
      }
      if (hit) {
        // 构造伪 attacker
        const src = { id: p.owner_id, team: p.team, damage: p.damage, family: p.family, x: p.x, y: p.y, damage_effect: p.hit_effect };
        if (p.aoe_radius > 0) {
          applyAOE(src, p.x, p.y, p.aoe_radius);
        } else {
          dealDamage(src, hit, 'projectile');
        }
        if (p.hit_effect) RenderSys.triggerJuice(p.hit_effect, p.x, p.y);
        projectiles.splice(i, 1);
        emit('projectile_destroyed', { projectile: p });
      }
    }
  }

  function getProjectiles() { return projectiles; }
  return { init, update, getProjectiles };
})();
window.CombatSys = CombatSys;
