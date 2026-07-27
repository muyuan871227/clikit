// ═══ AI 系统 · 自动战斗行为 + waypoint 寻路 ═══
const AISys = (() => {
  let gameState = 'LOADING';
  let waypoints = [];  // 当前地图的路点 [{x, y}]

  function init() {
    on('game_state_changed', ({ to }) => { gameState = to; });
    on('zone_entered', ({ zone_data }) => {
      const mapId = zone_data?.map || 'plains';
      const mapData = DATA.locations?.maps?.[mapId];
      waypoints = (mapData?.waypoints || []).map(w => ({ ...w }));
    });
  }

  // 找最近的 waypoint, 该 waypoint 比当前位置更接近目标
  function findBestWaypoint(e, target) {
    if (!waypoints.length) return null;
    const myDist = Math.hypot(target.x - e.x, target.y - e.y);
    let best = null, bestScore = -Infinity;
    for (const wp of waypoints) {
      const myToWp = Math.hypot(wp.x - e.x, wp.y - e.y);
      // 跳过太近的 wp (已在 wp 上)
      if (myToWp < 35) continue;
      const wpDist = Math.hypot(target.x - wp.x, target.y - wp.y);
      if (wpDist >= myDist) continue;  // wp 不靠近目标, 跳过
      // 优先选 wpDist 最小的 (最接近目标的可达 wp)
      const score = -wpDist - myToWp * 0.3;
      if (score > bestScore) { bestScore = score; best = wp; }
    }
    return best;
  }

  // 直线到目标是否被障碍阻断 (粗略)
  function pathBlocked(fromX, fromY, toX, toY, r) {
    const dx = toX - fromX, dy = toY - fromY;
    const len = Math.hypot(dx, dy);
    if (len < 1) return false;
    const steps = Math.ceil(len / 12);
    const sx = dx / steps, sy = dy / steps;
    for (let i = 1; i <= steps; i++) {
      if (PhysicsSys.checkBlocked(fromX + sx * i, fromY + sy * i, r)) return true;
    }
    return false;
  }

  function update(dt) {
    if (gameState !== 'BATTLE') return;
    const all = EntitySys.getAll();
    for (const e of all) {
      if (e.is_ragdoll || !e.alive) continue;
      updateOne(e, dt);
    }
  }

  function updateOne(e, dt) {
    const tpl = DATA.ai_behaviors?.behaviors?.[e.ai_behavior];
    if (!tpl) return;

    // 周期性 acquire target
    e.ai_acquire_timer -= dt * 1000;
    if (e.ai_acquire_timer <= 0 || !e.ai_target_id || !isTargetValid(e)) {
      acquireTarget(e, tpl);
      e.ai_acquire_timer = tpl.acquire_interval_ms || 500;
    }

    const realTarget = e.ai_target_id ? EntitySys.findById(e.ai_target_id) : null;
    if (!realTarget || !realTarget.alive) {
      emit('set_velocity', { entity_id: e.id, vx: 0, vy: 0 });
      return;
    }

    // Waypoint 路点导航: 若直线到目标被阻挡, 先去最近的 waypoint
    const r = e.collision_radius || 14;
    let target = realTarget;
    if (waypoints.length > 0) {
      // 缓存检查间隔 (避免每帧重算)
      if (!e._wpCheckUntil || now() > e._wpCheckUntil) {
        if (pathBlocked(e.x, e.y, realTarget.x, realTarget.y, r)) {
          const wp = findBestWaypoint(e, realTarget);
          if (wp) {
            // 检查到 waypoint 也是否阻挡 (若是, 不走 wp, 让局部避障处理)
            if (!pathBlocked(e.x, e.y, wp.x, wp.y, r)) {
              e._currentWp = { x: wp.x, y: wp.y };
            } else {
              e._currentWp = null;
            }
          } else {
            e._currentWp = null;
          }
        } else {
          e._currentWp = null;  // 直线清晰, 不需要 wp
        }
        e._wpCheckUntil = now() + 300;  // 300ms 重新评估
      }
      // 接近 wp 后切回真实目标
      if (e._currentWp) {
        const wpD = Math.hypot(e.x - e._currentWp.x, e.y - e._currentWp.y);
        if (wpD < 30) e._currentWp = null;
        else target = e._currentWp;
      }
    }

    const dx = target.x - e.x, dy = target.y - e.y;
    const d = Math.sqrt(dx*dx + dy*dy);
    const range = e.range || 40;
    const speed = e.speed || 60;
    // 攻击/范围检测仍用真实目标
    const realDx = realTarget.x - e.x, realDy = realTarget.y - e.y;
    const realD = Math.sqrt(realDx*realDx + realDy*realDy);

    // 攻击范围内 (用真实目标判断) → 攻击
    if (realD <= range && e.attack_cooldown_ms <= 0) {
      emit('ai_attack_request', { attacker_id: e.id, target_id: realTarget.id });
      emit('set_velocity', { entity_id: e.id, vx: 0, vy: 0 });
      return;
    }

    // 移动策略
    const mode = tpl.move_mode;
    let vx = 0, vy = 0;
    const nx = dx / (d || 1), ny = dy / (d || 1);

    if (mode === 'straight_to_target' || mode === 'slow_advance') {
      const sp = mode === 'slow_advance' ? speed * 0.8 : speed;
      vx = nx * sp; vy = ny * sp;
    } else if (mode === 'kite_at_range') {
      const kite = tpl.kite_back_distance || 40;
      if (d < kite) { vx = -nx * speed; vy = -ny * speed; } // 远离
      else if (d > range - 20) { vx = nx * speed; vy = ny * speed; } // 接近
      else { vx = 0; vy = 0; }
    } else if (mode === 'dash_then_attack') {
      const trig = tpl.dash_trigger_distance || 200;
      const sp = d > trig ? (e.dash_speed || 150) : speed;
      vx = nx * sp; vy = ny * sp;
    } else {
      vx = nx * speed; vy = ny * speed;
    }

    // 群体分散力
    const sameTeam = e.team === 'ally' ? EntitySys.getAllies() : EntitySys.getEnemies();
    let avoidX = 0, avoidY = 0, avoidCount = 0;
    for (const m of sameTeam) {
      if (m.id === e.id) continue;
      const ddx = e.x - m.x, ddy = e.y - m.y;
      const dd2 = ddx * ddx + ddy * ddy;
      const sepDist = (e.collision_radius || 14) + (m.collision_radius || 14) + 8;
      if (dd2 < sepDist * sepDist && dd2 > 0.1) {
        const dd = Math.sqrt(dd2);
        avoidX += ddx / dd;
        avoidY += ddy / dd;
        avoidCount++;
      }
    }
    if (avoidCount > 0) {
      vx += (avoidX / avoidCount) * speed * 0.5;
      vy += (avoidY / avoidCount) * speed * 0.5;
    }

    // 障碍物绕开: 多射线 ray-march 找最远清晰路径 + 持久化避障方向
    const lookAheadDist = r + 22;
    const v_len = Math.sqrt(vx*vx + vy*vy);
    if (v_len > 1) {
      const lookX = e.x + vx / v_len * lookAheadDist;
      const lookY = e.y + vy / v_len * lookAheadDist;
      if (PhysicsSys.checkBlocked(lookX, lookY, r)) {
        // Ray-march: 12 个方向, 每条沿射线行走 step=15px 直到撞障碍, 记录到达距离
        const baseAng = Math.atan2(vy, vx);
        const angles = [-150, -120, -90, -60, -45, -30, -15, 15, 30, 45, 60, 90, 120, 150].map(a => a * Math.PI / 180);
        const maxRange = 250;
        const step = 14;
        let bestAng = null;
        let bestScore = -Infinity;
        for (const da of angles) {
          const a = baseAng + da;
          const cosA = Math.cos(a), sinA = Math.sin(a);
          let dist = 0;
          for (let s = step; s <= maxRange; s += step) {
            const px = e.x + cosA * s, py = e.y + sinA * s;
            if (PhysicsSys.checkBlocked(px, py, r)) break;
            dist = s;
          }
          if (dist < r + 18) continue;
          // 假定从射线终点出发能朝目标走的距离 = clearance + 与目标方向贴近度
          const endX = e.x + cosA * dist, endY = e.y + sinA * dist;
          const distToGoal = Math.hypot(endX - target.x, endY - target.y);
          // 偏好长距离 + 朝目标 (轻角度惩罚, 不让侧步无脑)
          const score = dist * 1.5 - distToGoal - Math.abs(da) * 0.8;
          if (score > bestScore) { bestScore = score; bestAng = a; }
        }
        // 持久化避障方向 (avoid oscillation): 200ms 内不重新切换
        if (bestAng != null) {
          if (e._avoidUntil && now() < e._avoidUntil && e._avoidAng != null) {
            // 沿用上次方向 (除非这次方向差异很大)
            const angDiff = Math.abs(((bestAng - e._avoidAng + Math.PI*3) % (Math.PI*2)) - Math.PI);
            if (angDiff < Math.PI / 3) bestAng = e._avoidAng;
          }
          e._avoidAng = bestAng;
          e._avoidUntil = now() + 250;
          vx = Math.cos(bestAng) * speed;
          vy = Math.sin(bestAng) * speed;
        } else {
          // 全部方向都阻挡: 完全无路, 沿 perp 慢移
          const perpX = -vy / v_len, perpY = vx / v_len;
          vx = perpX * speed * 0.5;
          vy = perpY * speed * 0.5;
        }
      } else {
        // 当前方向清晰, 清除避障状态
        e._avoidUntil = 0;
      }
    }

    emit('set_velocity', { entity_id: e.id, vx, vy });
  }

  function isTargetValid(e) {
    const t = EntitySys.findById(e.ai_target_id);
    if (!t || !t.alive || t.team === e.team) return false;
    return true;
  }

  function acquireTarget(e, tpl) {
    const targets = e.team === 'ally' ? EntitySys.getEnemies() : EntitySys.getAllies();
    if (targets.length === 0) { e.ai_target_id = null; return; }
    const priority = (tpl.target_priority && tpl.target_priority[0]) || 'nearest_enemy';

    if (priority === 'densest_cluster') {
      let bestT = null, bestScore = -1;
      for (const t of targets) {
        let cnt = 0;
        for (const t2 of targets) { if (dist2(t.x, t.y, t2.x, t2.y) < 80*80) cnt++; }
        const score = cnt - dist(e.x, e.y, t.x, t.y) * 0.01;
        if (score > bestScore) { bestScore = score; bestT = t; }
      }
      e.ai_target_id = bestT?.id || null;
    } else if (priority === 'highest_hp_enemy') {
      let bestT = null, bestHP = -1;
      for (const t of targets) { if (t.current_hp > bestHP) { bestHP = t.current_hp; bestT = t; } }
      e.ai_target_id = bestT?.id || null;
    } else {
      // nearest_enemy
      let bestT = null, bestD = Infinity;
      for (const t of targets) {
        const d = dist2(e.x, e.y, t.x, t.y);
        if (d < bestD) { bestD = d; bestT = t; }
      }
      e.ai_target_id = bestT?.id || null;
    }
  }

  return { init, update };
})();
window.AISys = AISys;
