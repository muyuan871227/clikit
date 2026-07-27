// ═══ player_manager.js — 玩家+角色+移动+独处检测 ═══
const PlayerManager = (() => {
  const players = []; // [{id, name, color, role, x, y, room, alive, suspicion: {}, evidence_book: [], lensCount: 0, isHuman, ...actionsLeft}]
  let humanIndex = 0;
  let killerId = null;
  let aloneTimers = {}; // playerId -> seconds in current solo
  let lastRoomMap = {}; // playerId -> roomId

  function init() {
    bindBus();
  }

  function bindBus() {
    Bus.on('case_loaded', () => spawnAllPlayers());
    Bus.on('phase_changed', ({newPhase}) => {});
    Bus.on('player_eliminated', ({playerId}) => {
      const p = getPlayer(playerId);
      if (p) p.alive = false;
      checkOutnumbered();
    });
    Bus.on('player_vent_request', () => {
      const human = getHuman();
      if (!human || human.role !== 'killer') {
        UI.showToast('Only killer can use vents');
        return;
      }
      if (human.ventCooldown > 0) {
        UI.showToast(`Vent cooldown: ${human.ventCooldown.toFixed(1)}s`);
        return;
      }
      const ok = useVent(human.id);
      if (!ok) UI.showToast('Stand on a vent (V)');
      else UI.showToast('Whoosh!');
    });
  }

  function spawnAllPlayers() {
    players.length = 0;
    humanIndex = cfg('players.human_index', 0);
    const total = cfg('players.total', 6);
    killerId = Math.floor(Math.random() * total);

    const rooms = cfg('map.room_ids', []);
    const namesArr = (DATA._currentLang === 'zh' ? cfg('players.names_zh') : cfg('players.names_en')) || [];
    const colors = cfg('players.colors') || [];
    const personalityList = DATA.ai_behaviors?.personality_assignment?.fixed_distribution || [];

    let pIdx = 0;
    for (let i = 0; i < total; i++) {
      const room = rooms[i % rooms.length];
      const c = MapSystem.roomCenter(room);
      // 错开位置,避免所有玩家在同一中心点
      const offsetX = (i % 3 - 1) * 24;
      const offsetY = (Math.floor(i / 3) - 0.5) * 24;
      const isHuman = (i === humanIndex);
      const isKiller = (i === killerId);
      let personality = null;
      if (!isHuman) {
        personality = personalityList[pIdx % personalityList.length] || 'detective_rational';
        pIdx++;
      }
      const p = {
        id: i,
        name: namesArr[i] || `P${i}`,
        color: colors[i] || '#fff',
        role: isKiller ? 'killer' : 'detective',
        isHuman,
        personality,
        alive: true,
        room,
        x: c.x + offsetX,
        y: c.y + offsetY,
        targetX: null, targetY: null,
        moveSpeed: cfg('player_base.speed', 160),
        suspicion: {},
        evidence_book: [],
        seenEvidenceIds: new Set(),
        lens: isKiller ? 0 : 1,  // 侦探默认1个放大镜,凶手0个(凶手只能从场上拾取)
        framePerRoundLeft: isKiller ? cfg('killer_actions.frame_per_round', 1) : 0,
        tamperPerRoundLeft: isKiller ? cfg('killer_actions.tamper_per_round', 1) : 0,
        destroyLeft: isKiller ? cfg('killer_actions.destroy_per_game', 1) : 0,
        falseTestimonyLeft: isKiller ? cfg('killer_actions.false_testimony_per_game', 1) : 0,
        searching: null,
        pathWaypoints: [],
        ai: {decisionTimer: 0, currentTarget: null, busyUntil: 0},
        ventCooldown: 0,
      };
      players.push(p);
    }
    // initialize suspicion to neutral
    for (const p of players) {
      for (const q of players) {
        if (p.id !== q.id) p.suspicion[q.id] = cfg('ai.detective_trust_start', 50) ? 30 : 30;
      }
    }
    Bus.emit('roles_assigned', {humanRole: players[humanIndex].role, killerId});
  }

  function roomCenterX(roomId) {
    const c = MapSystem.roomCenter(roomId);
    return c.x;
  }
  function roomCenterY(roomId) {
    const c = MapSystem.roomCenter(roomId);
    return c.y;
  }
  function roomBounds(roomId) {
    const r = MapSystem.getRoomById(roomId);
    return r ? {x: r.rect.x, y: r.rect.y, w: r.rect.w, h: r.rect.h} : null;
  }

  function getPlayerAt(x, y) {
    return MapSystem.getRegionAt(x, y);
  }

  /** 寻路:房间→门→走廊→门→房间 */
  function computePath(x0, y0, x1, y1) {
    const startRegion = MapSystem.getRegionAt(x0, y0);
    const endRegion = MapSystem.getRegionAt(x1, y1);
    if (startRegion === endRegion) return [{x: x1, y: y1}];

    const path = [];
    // 1. 如果起点在房间里,先走到这个房间的门外(进入走廊)
    if (startRegion && !startRegion.startsWith('corridor_')) {
      const startRoom = MapSystem.getRoomById(startRegion);
      if (startRoom) {
        const door = pickClosestDoor(startRoom, x0, y0);
        if (door) path.push(door);
      }
    }
    // 2. 在目标房间的门外
    const endRoom = MapSystem.getRoomById(endRegion);
    if (endRoom) {
      const door = pickClosestDoor(endRoom, x1, y1);
      if (door) path.push(door);
    }
    // 3. 最终目标
    path.push({x: x1, y: y1});
    return path;
  }

  function pickClosestDoor(room, x, y) {
    if (!room.doors || room.doors.length === 0) return null;
    let best = null, bestD = Infinity;
    for (const d of room.doors) {
      let dx, dy;
      if (d.side === 'top') { dx = room.rect.x + d.pos * room.rect.w; dy = room.rect.y - 12; }
      else if (d.side === 'bottom') { dx = room.rect.x + d.pos * room.rect.w; dy = room.rect.y + room.rect.h + 12; }
      else if (d.side === 'left') { dx = room.rect.x - 12; dy = room.rect.y + d.pos * room.rect.h; }
      else { dx = room.rect.x + room.rect.w + 12; dy = room.rect.y + d.pos * room.rect.h; }
      const dd = (dx - x) ** 2 + (dy - y) ** 2;
      if (dd < bestD) { bestD = dd; best = {x: dx, y: dy}; }
    }
    return best;
  }

  // 心跳/环境音状态
  let heartbeatTimer = 0;
  let ambientTimer = 0;
  function update(dt, currentPhase) {
    if (currentPhase !== 'investigate') return;
    updateHeartbeatAndAmbient(dt);
    for (const p of players) {
      if (!p.alive) continue;
      if (p.searching) {
        p.searching.progress += dt / cfg('evidence.search_duration_seconds', 4.0);
        if (p.searching.progress >= 1.0) {
          Bus.emit('search_completed', {playerId: p.id, roomId: p.searching.roomId, slotIndex: p.searching.slotIndex});
          p.searching = null;
        }
        continue; // 搜查中不能移动
      }
      // 人类: 用键盘
      let dx = 0, dy = 0;
      if (p.isHuman) {
        const m = Input.getMove();
        dx = m.dx * p.moveSpeed * dt;
        dy = m.dy * p.moveSpeed * dt;
      } else if (p.targetX !== null) {
        // 到达目标点(不管路径状态)→清除 target,让下一个 AI tick 重新决策
        const distToTarget = Math.hypot(p.targetX - p.x, p.targetY - p.y);
        if (distToTarget < 8) {
          p.targetX = null; p.targetY = null; p.pathWaypoints = [];
        } else {
          // 朝 waypoint 走
          if (!p.pathWaypoints || p.pathWaypoints.length === 0) {
            p.pathWaypoints = computePath(p.x, p.y, p.targetX, p.targetY);
          }
          const wp = p.pathWaypoints[0];
          if (wp) {
            const ddx = wp.x - p.x, ddy = wp.y - p.y;
            const dist = Math.hypot(ddx, ddy);
            if (dist < 6) {
              p.pathWaypoints.shift();
            } else {
              const sp = p.moveSpeed * dt;
              dx = (ddx / dist) * Math.min(sp, dist);
              dy = (ddy / dist) * Math.min(sp, dist);
            }
          } else {
            p.targetX = p.targetY = null;
          }
        }
      }
      if (dx !== 0 || dy !== 0) {
        const newPos = MapSystem.slideMove(p.x, p.y, p.x + dx, p.y + dy, 10);
        p.x = newPos.x;
        p.y = newPos.y;
      }
      // 区域检测
      const newRegion = MapSystem.getRegionAt(p.x, p.y);
      if (newRegion && !newRegion.startsWith('corridor_') && newRegion !== p.room) {
        p.room = newRegion;
        Bus.emit('player_moved', {playerId: p.id, toRoom: newRegion});
        triggerJuice('juice_room_enter', p.x, p.y);
      }
      // 凶手密道检测(冷却30s)
      if (p.role === 'killer' && p.ventCooldown > 0) p.ventCooldown -= dt;
    }
    updateAloneTimers(dt);
  }

  function updateAloneTimers(dt) {
    for (const p of players) {
      if (!p.alive) { aloneTimers[p.id] = 0; continue; }
      // 只有在实际房间(非走廊)内才累计
      const inRoom = p.room && !p.room.startsWith('corridor_') && MapSystem.getRoomById(p.room);
      if (!inRoom) { aloneTimers[p.id] = 0; continue; }
      const others = players.filter(q => q.id !== p.id && q.alive && q.room === p.room);
      if (others.length === 0) {
        aloneTimers[p.id] = (aloneTimers[p.id] || 0) + dt;
        if (aloneTimers[p.id] >= cfg('killer_actions.frame_linger_seconds', 5)) {
          Bus.emit('player_alone_threshold', {playerId: p.id, roomId: p.room});
        }
      } else {
        aloneTimers[p.id] = 0;
      }
    }
  }

  function getAloneSeconds(playerId) { return aloneTimers[playerId] || 0; }

  function updateHeartbeatAndAmbient(dt) {
    const human = getHuman();
    if (!human || !human.alive) return;
    // === 凶手心慌:被 2+ 个侦探看到 → 提醒凶手离开 ===
    if (human.role === 'killer') {
      const R = cfg('vision.radius', 170);
      let watchers = 0;
      for (const d of getAlive()) {
        if (d.id === human.id) continue;
        if (MapSystem.isVisible(d.x, d.y, human.x, human.y, R)) watchers++;
      }
      window._killerWatchers = watchers; // 渲染层用这个画屏幕红边
    } else {
      window._killerWatchers = 0;
    }
    // === 幻觉响声 (10-20s 随机):不指示真凶,纯氛围+干扰 ===
    ambientTimer += dt;
    if (ambientTimer >= 10 + Math.random() * 10) {
      ambientTimer = 0;
      const events = ['sfx_distant_scream', 'sfx_door_creak', 'sfx_rat_squeak', 'sfx_light_flicker'];
      const ev = Utils.pick(events);
      Audio_.play(ev);
      // 同时:随机一个房间金色微闪 (制造红鲱鱼)
      const rooms = MapSystem.getRooms();
      if (rooms.length > 0) {
        const r = Utils.pick(rooms);
        window._phantomFlash = {roomId: r.id, until: performance.now() + 600};
      }
    }
  }

  function checkOutnumbered() {
    const aliveDet = players.filter(p => p.alive && p.role !== 'killer').length;
    const min = cfg('win_conditions.min_detectives_to_continue', 3);
    if (aliveDet < min) Bus.emit('detectives_outnumbered', {});
  }

  function resetRoundActions() {
    for (const p of players) {
      if (p.role === 'killer') {
        p.framePerRoundLeft = cfg('killer_actions.frame_per_round', 1);
        p.tamperPerRoundLeft = cfg('killer_actions.tamper_per_round', 1);
      }
    }
  }

  function moveToRoom(playerId, roomId) {
    const p = getPlayer(playerId);
    if (!p) return;
    const c = MapSystem.roomCenter(roomId);
    p.targetX = c.x;
    p.targetY = c.y;
    p.pathWaypoints = computePath(p.x, p.y, c.x, c.y);
  }

  function teleportToRoomCenter(playerId, roomId) {
    const p = getPlayer(playerId);
    if (!p) return;
    const c = MapSystem.roomCenter(roomId);
    p.x = c.x;
    p.y = c.y;
    p.room = roomId;
    p.pathWaypoints = [];
  }

  function useVent(playerId) {
    const p = getPlayer(playerId);
    if (!p || p.role !== 'killer' || p.ventCooldown > 0) return false;
    const v = MapSystem.checkVentUse(p);
    if (!v) return false;
    // 在进入通风管前记录目击(从原位置看能看到)
    Evidence._recordWitnesses?.(p.id, p.x, p.y, '钻进了通风管!');
    p.x = v.to.x;
    p.y = v.to.y;
    p.ventCooldown = 30;
    p.pathWaypoints = [];
    triggerJuice('juice_frame_placed', p.x, p.y);
    return true;
  }

  function getPlayer(id) { return players.find(p => p.id === id); }
  function getAll() { return players; }
  function getHuman() { return players[humanIndex]; }
  function getKillerId() { return killerId; }
  function getAlive() { return players.filter(p => p.alive); }

  return {init, update, resetRoundActions, getPlayer, getAll, getHuman, getKillerId, getAlive,
    moveToRoom, teleportToRoomCenter, useVent, getAloneSeconds, roomCenterX, roomCenterY, roomBounds, getPlayerAt};
})();
