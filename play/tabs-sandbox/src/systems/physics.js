// ═══ Physics 系统 · 移动 + 碰撞 + Verlet 布娃娃 + 障碍物 ═══
const PhysicsSys = (() => {
  let gravity = 980;
  let airDrag = 0.02;
  let iterations = 4;
  let groundFriction = 0.85;
  let arenaW = 960, arenaH = 540, groundY = 480;
  let gridCell = 40;
  let currentState = 'LOADING';
  let obstacles = [];  // [{kind, shape, x, y, r? | w, h?, type?, dps?, speed_mul?}]
  let dotTimers = new Map();  // entity_id -> last DoT tick time

  function init() {
    gravity = cfg('physics.gravity_y', 980);
    airDrag = cfg('physics.air_drag', 0.02);
    iterations = cfg('physics.verlet_iterations', 4);
    groundFriction = cfg('arena.ground_friction', 0.85);
    arenaW = cfg('arena.width', 960);
    arenaH = cfg('arena.height', 540);
    groundY = cfg('arena.ground_y', 480);
    gridCell = cfg('arena.grid_cell_px', 40);

    on('game_state_changed', ({ to }) => { currentState = to; });
    on('zone_entered', ({ zone_data }) => {
      // 加载该地图的障碍物
      const mapId = zone_data?.map || 'plains';
      const mapData = DATA.locations?.maps?.[mapId];
      obstacles = (mapData?.obstacles || []).map(o => ({ ...o }));
    });
    on('apply_impulse', ({ entity_id, vx, vy }) => {
      const e = EntitySys.findById(entity_id);
      if (!e) return;
      e.x += vx * 0.016; e.y += vy * 0.016;
    });
    on('set_velocity', ({ entity_id, vx, vy }) => {
      const e = EntitySys.findById(entity_id);
      if (!e || e.is_ragdoll) return;
      e.vx = vx; e.vy = vy;
    });
  }

  // 为死亡实体初始化 ragdoll bones
  function initRagdoll(entity) {
    const offsets = [
      { name: 'head', dx: 0, dy: -12 },
      { name: 'torso', dx: 0, dy: 0 },
      { name: 'arm_l', dx: -8, dy: -4 },
      { name: 'arm_r', dx: 8, dy: -4 },
      { name: 'leg', dx: 0, dy: 10 }
    ];
    entity.bones = offsets.map(o => {
      const bx = entity.x + o.dx * (entity.scale || 1);
      const by = entity.y + o.dy * (entity.scale || 1);
      // 初始速度来自死亡冲量 + 随机旋转
      const kick = 100 + Math.random() * 120;
      const angle = Math.random() * Math.PI * 2;
      return {
        name: o.name,
        x: bx, y: by,
        prev_x: bx - Math.cos(angle) * kick * 0.016,
        prev_y: by - Math.abs(Math.sin(angle)) * kick * 0.016 - 60 * 0.016
      };
    });
    entity.constraints = [
      [0, 1, 12], [1, 2, 10], [1, 3, 10], [1, 4, 12], [2, 3, 14]
    ];
  }

  function stepEntity(e, dt) {
    // 使用 vx/vy 作为设定速度 (AI set_velocity)
    if (!e.is_ragdoll) {
      e.prev_x = e.x; e.prev_y = e.y;
      if (currentState === 'BATTLE') {
        // 应用减速地形 (检查当前位置是否在 slow zone)
        let speedMul = 1;
        for (const o of obstacles) {
          if (o.type === 'slow' && pointInObstacle(e.x, e.y, o)) speedMul = o.speed_mul || 0.5;
        }
        let stepX = (e.vx || 0) * dt * speedMul;
        let stepY = (e.vy || 0) * dt * speedMul;
        // 障碍物推挤: X 轴
        let nextX = e.x + stepX;
        if (!collideObstacles(nextX, e.y, e.collision_radius || 14)) {
          e.x = nextX;
        } else {
          // 沿轴滑动: 减半步进
          if (!collideObstacles(e.x + stepX * 0.5, e.y, e.collision_radius || 14)) e.x += stepX * 0.5;
        }
        // Y 轴
        let nextY = e.y + stepY;
        if (!collideObstacles(e.x, nextY, e.collision_radius || 14)) {
          e.y = nextY;
        } else {
          if (!collideObstacles(e.x, e.y + stepY * 0.5, e.collision_radius || 14)) e.y += stepY * 0.5;
        }
        // 伤害地形 (lava etc)
        for (const o of obstacles) {
          if (o.type === 'damage' && pointInObstacle(e.x, e.y, o)) {
            const last = dotTimers.get(e.id) || 0;
            const t = now();
            if (t - last >= 500) {  // 每 0.5s tick
              dotTimers.set(e.id, t);
              const dps = o.dps || 10;
              emit('damage_request', {
                target: e,
                amount: dps * 0.5,
                source: { id: -1, x: o.x, y: o.y, family: 'environment', team: 'environment' },
                damage_type: 'environment'
              });
            }
          }
        }
      }
      // 边界
      if (e.x < (e.collision_radius || 12)) e.x = (e.collision_radius || 12);
      if (e.x > arenaW - (e.collision_radius || 12)) e.x = arenaW - (e.collision_radius || 12);
      if (e.y < (e.collision_radius || 12)) e.y = (e.collision_radius || 12);
      if (e.y > groundY) e.y = groundY;
      return;
    }

    // 布娃娃 - Verlet
    if (!e.bones) return;
    for (const b of e.bones) {
      const velX = b.x - b.prev_x;
      const velY = b.y - b.prev_y;
      b.prev_x = b.x; b.prev_y = b.y;
      b.x += velX * (1 - airDrag);
      b.y += velY * (1 - airDrag) + gravity * dt * dt;
      // 地面
      if (b.y > groundY) {
        b.y = groundY;
        b.prev_x = b.x - velX * groundFriction;
      }
      // 边界
      if (b.x < 0) { b.x = 0; b.prev_x = -velX * 0.5; }
      if (b.x > arenaW) { b.x = arenaW; b.prev_x = arenaW + velX * 0.5; }
      if (b.y < 0) { b.y = 0; b.prev_y = -velY * 0.5; }
    }
    // 约束
    for (let iter = 0; iter < iterations; iter++) {
      for (const [ai, bi, rest] of e.constraints) {
        const a = e.bones[ai], b2 = e.bones[bi];
        const dx = b2.x - a.x, dy = b2.y - a.y;
        const d = Math.sqrt(dx*dx + dy*dy) || 0.0001;
        const diff = (d - rest) / d * 0.5;
        a.x += dx * diff; a.y += dy * diff;
        b2.x -= dx * diff; b2.y -= dy * diff;
      }
    }
    // 同步实体位置到 torso
    const torso = e.bones[1];
    e.x = torso.x; e.y = torso.y;
  }

  function collisionCheck() {
    // PLAN 阶段也检测同方碰撞 (防止部署时重叠)
    const allies = EntitySys.getAllies();
    const enemies = EntitySys.getEnemies();
    if (currentState !== 'BATTLE' && currentState !== 'PLAN') return;
    // 构建网格
    const grid = new Map();
    const put = (e) => {
      const gx = Math.floor(e.x / gridCell), gy = Math.floor(e.y / gridCell);
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
        const key = (gx + dx) + ',' + (gy + dy);
        if (!grid.has(key)) grid.set(key, []);
        grid.get(key).push(e);
      }
    };
    const all = allies.concat(enemies);
    for (const e of all) put(e);
    const checked = new Set();
    for (const e of all) {
      const gx = Math.floor(e.x / gridCell), gy = Math.floor(e.y / gridCell);
      const key = gx + ',' + gy;
      const cell = grid.get(key) || [];
      for (const o of cell) {
        if (o.id === e.id) continue;
        const pair = e.id < o.id ? e.id + '-' + o.id : o.id + '-' + e.id;
        if (checked.has(pair)) continue;
        checked.add(pair);
        const dx = e.x - o.x, dy = e.y - o.y;
        const rs = (e.collision_radius || 12) + (o.collision_radius || 12);
        const d2 = dx*dx + dy*dy;
        if (d2 < rs * rs && d2 > 0.01) {
          const d = Math.sqrt(d2);
          const overlap = rs - d;
          const nx = dx / d, ny = dy / d;
          const m1 = e.mass || 1, m2 = o.mass || 1;
          const total = m1 + m2;
          const push1 = overlap * (m2 / total);
          const push2 = overlap * (m1 / total);
          // 推 e: 不能推进障碍 (回退)
          const newEX = e.x + nx * push1, newEY = e.y + ny * push1;
          if (!collideObstacles(newEX, newEY, e.collision_radius || 14)) {
            e.x = newEX; e.y = newEY;
          }
          // 推 o: 不能推进障碍
          const newOX = o.x - nx * push2, newOY = o.y - ny * push2;
          if (!collideObstacles(newOX, newOY, o.collision_radius || 14)) {
            o.x = newOX; o.y = newOY;
          }
          emit('collision', { a: e, b: o, overlap });
        }
      }
    }
  }

  function update(dt) {
    const all = EntitySys.getAll();
    for (const e of all) stepEntity(e, dt);
    for (const c of EntitySys.getCorpses()) stepEntity(c, dt);
    collisionCheck();
    // 障碍逃逸: 任何单位被挤进障碍区都强制推出
    for (const e of all) {
      if (e.is_ragdoll) continue;
      escapeObstacles(e);
    }
  }

  // 把单位推出障碍区 (找最近的边)
  function escapeObstacles(e) {
    const r = e.collision_radius || 14;
    for (const o of obstacles) {
      if (o.type === 'damage' || o.type === 'slow') continue;
      // 检查是否在障碍内
      if (o.shape === 'circle') {
        const dx = e.x - o.x, dy = e.y - o.y;
        const sum = (o.r || 20) + r;
        const d2 = dx*dx + dy*dy;
        if (d2 < sum*sum) {
          // 沿径向推出
          const d = Math.sqrt(d2) || 0.0001;
          const push = sum - d + 1;
          e.x += (dx/d) * push;
          e.y += (dy/d) * push;
        }
      } else { // rect
        const halfW = o.w / 2, halfH = o.h / 2;
        const cx = clamp(e.x, o.x - halfW, o.x + halfW);
        const cy = clamp(e.y, o.y - halfH, o.y + halfH);
        const dx = e.x - cx, dy = e.y - cy;
        const d2 = dx*dx + dy*dy;
        if (d2 < r*r) {
          // 单位可能在矩形内或正贴边
          if (d2 < 0.001) {
            // 完全在内部, 推到最近的 4 边之一
            const distLeft = e.x - (o.x - halfW);
            const distRight = (o.x + halfW) - e.x;
            const distTop = e.y - (o.y - halfH);
            const distBottom = (o.y + halfH) - e.y;
            const minD = Math.min(distLeft, distRight, distTop, distBottom);
            if (minD === distLeft)        e.x = o.x - halfW - r - 1;
            else if (minD === distRight)  e.x = o.x + halfW + r + 1;
            else if (minD === distTop)    e.y = o.y - halfH - r - 1;
            else                          e.y = o.y + halfH + r + 1;
          } else {
            // 在边外但碰着, 沿法线推出
            const d = Math.sqrt(d2);
            const push = r - d + 1;
            e.x += (dx/d) * push;
            e.y += (dy/d) * push;
          }
        }
      }
    }
    // 边界
    if (e.x < (e.collision_radius || 12)) e.x = (e.collision_radius || 12);
    if (e.x > arenaW - (e.collision_radius || 12)) e.x = arenaW - (e.collision_radius || 12);
    if (e.y < (e.collision_radius || 12)) e.y = (e.collision_radius || 12);
    if (e.y > groundY) e.y = groundY;
  }

  // 障碍物点测试 (圆/矩形 — 矩形的 (x,y) 是中心点)
  function pointInObstacle(x, y, o) {
    if (o.shape === 'circle') {
      const dx = x - o.x, dy = y - o.y;
      return dx*dx + dy*dy < (o.r || 20) * (o.r || 20);
    } else { // rect
      return Math.abs(x - o.x) < (o.w/2) && Math.abs(y - o.y) < (o.h/2);
    }
  }

  // 实体 (圆) vs 全部障碍物 (block 类型) 的碰撞
  function collideObstacles(x, y, r) {
    for (const o of obstacles) {
      if (o.type === 'damage' || o.type === 'slow') continue;  // 这些不阻挡
      if (o.shape === 'circle') {
        const dx = x - o.x, dy = y - o.y;
        const sum = (o.r || 20) + r;
        if (dx*dx + dy*dy < sum*sum) return true;
      } else {
        // 矩形 vs 圆: 找最近点
        const halfW = o.w / 2, halfH = o.h / 2;
        const cx = clamp(x, o.x - halfW, o.x + halfW);
        const cy = clamp(y, o.y - halfH, o.y + halfH);
        const dx = x - cx, dy = y - cy;
        if (dx*dx + dy*dy < r * r) return true;
      }
    }
    return false;
  }

  function getObstacles() { return obstacles; }
  function checkBlocked(x, y, r) { return collideObstacles(x, y, r || 14); }

  return { init, update, initRagdoll, getObstacles, checkBlocked, pointInObstacle };
})();
window.PhysicsSys = PhysicsSys;
