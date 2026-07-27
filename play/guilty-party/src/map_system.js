// ═══ map_system.js — Among Us风格地图:房间+走廊+墙+门+密道 ═══
const MapSystem = (() => {
  let layout = null;
  let walls = []; // [{x1,y1,x2,y2,isDoor}]
  let ventCooldown = {};

  function init() {
    layout = DATA.map_layout;
    if (!layout) { console.warn('map_layout not loaded'); return; }
    buildWalls();
  }

  function buildWalls() {
    walls = [];
    // 只为房间构建墙(走廊是房间之间的开放空间,不单独建墙)
    for (const region of layout.rooms) {
      const r = region.rect;
      const doors = region.doors || [];
      addWallWithDoors(r.x, r.y, r.x + r.w, r.y, doors.filter(d => d.side === 'top'), 'horizontal', r);
      addWallWithDoors(r.x, r.y + r.h, r.x + r.w, r.y + r.h, doors.filter(d => d.side === 'bottom'), 'horizontal', r);
      addWallWithDoors(r.x, r.y, r.x, r.y + r.h, doors.filter(d => d.side === 'left'), 'vertical', r);
      addWallWithDoors(r.x + r.w, r.y, r.x + r.w, r.y + r.h, doors.filter(d => d.side === 'right'), 'vertical', r);
    }
  }

  function addWallWithDoors(x1, y1, x2, y2, doors, orient, room) {
    if (doors.length === 0) {
      walls.push({x1, y1, x2, y2, isDoor: false});
      return;
    }
    // 沿这条墙,切掉门洞
    if (orient === 'horizontal') {
      const segLen = x2 - x1;
      const sorted = doors.map(d => ({start: x1 + d.pos * segLen - d.width / 2, end: x1 + d.pos * segLen + d.width / 2}))
                          .sort((a, b) => a.start - b.start);
      let cur = x1;
      for (const d of sorted) {
        if (d.start > cur) walls.push({x1: cur, y1, x2: d.start, y2, isDoor: false});
        cur = d.end;
      }
      if (cur < x2) walls.push({x1: cur, y1, x2, y2, isDoor: false});
    } else {
      const segLen = y2 - y1;
      const sorted = doors.map(d => ({start: y1 + d.pos * segLen - d.width / 2, end: y1 + d.pos * segLen + d.width / 2}))
                          .sort((a, b) => a.start - b.start);
      let cur = y1;
      for (const d of sorted) {
        if (d.start > cur) walls.push({x1, y1: cur, x2, y2: d.start, isDoor: false});
        cur = d.end;
      }
      if (cur < y2) walls.push({x1, y1: cur, x2, y2, isDoor: false});
    }
  }

  function getWalls() { return walls; }
  function getRooms() { return layout?.rooms || []; }
  function getCorridors() { return layout?.corridors || []; }
  function getSecretPassage() { return layout?.secret_passage; }

  function getRoomById(id) { return layout?.rooms.find(r => r.id === id); }

  /** 根据 x,y 判断在哪个房间(或走廊) */
  function getRegionAt(x, y) {
    for (const r of (layout?.rooms || [])) {
      if (x >= r.rect.x && x < r.rect.x + r.rect.w && y >= r.rect.y && y < r.rect.y + r.rect.h) return r.id;
    }
    for (const c of (layout?.corridors || [])) {
      if (x >= c.rect.x && x < c.rect.x + c.rect.w && y >= c.rect.y && y < c.rect.y + c.rect.h) return c.id;
    }
    return null;
  }

  /** 获取房间中心坐标(用于传送/生成点) */
  function roomCenter(roomId) {
    const r = getRoomById(roomId);
    if (!r) return {x: 100, y: 100};
    return {x: r.rect.x + r.rect.w / 2, y: r.rect.y + r.rect.h / 2};
  }

  /** 获取房间的 furniture 列表(slot 0/1/2) */
  function getFurnitureInRoom(roomId) {
    const r = getRoomById(roomId);
    if (!r) return [];
    return (r.furniture || []).map(f => ({
      ...f,
      absX: r.rect.x + f.x,
      absY: r.rect.y + f.y,
      cx: r.rect.x + f.x + f.w / 2,
      cy: r.rect.y + f.y + f.h / 2
    }));
  }

  /** 按 roomId + slot index 获取家具 */
  function getFurnitureByEvidenceSlot(roomId, slotIdx) {
    return getFurnitureInRoom(roomId).find(f => f.evidence_slot === slotIdx);
  }

  /** 找 x,y 坐标附近的可搜家具(用于搜查触发)返回{roomId, slot, furniture} 或 null */
  function findFurnitureAt(x, y, tolerance = 28) {
    for (const room of (layout?.rooms || [])) {
      for (const f of (room.furniture || [])) {
        const fx = room.rect.x + f.x, fy = room.rect.y + f.y;
        if (x >= fx - tolerance && x <= fx + f.w + tolerance &&
            y >= fy - tolerance && y <= fy + f.h + tolerance) {
          return {roomId: room.id, slotIndex: f.evidence_slot, furniture: f};
        }
      }
    }
    return null;
  }

  /** 墙体碰撞:尝试从 (x0,y0) 移动到 (x1,y1),返回最终允许的位置(贴墙) */
  function slideMove(x0, y0, x1, y1, radius = 10) {
    if (!collides(x1, y1, radius)) return {x: x1, y: y1};
    if (!collides(x1, y0, radius)) return {x: x1, y: y0};
    if (!collides(x0, y1, radius)) return {x: x0, y: y1};
    // 如果起点已经在碰撞中(卡住),允许向目标方向推进(逃离)
    if (collides(x0, y0, radius)) {
      return {x: x1, y: y1};
    }
    return {x: x0, y: y0};
  }

  /** 检查点 (x,y) 带半径 radius 是否与任何墙碰撞。家具不挡人(可穿过)。 */
  function collides(x, y, radius) {
    for (const w of walls) {
      if (segCircleCollide(w.x1, w.y1, w.x2, w.y2, x, y, radius)) return true;
    }
    const mb = layout?.map_bounds;
    if (!mb) return false;
    if (x < radius || y < radius || x > mb.width - radius || y > mb.height - radius) return true;
    return false;
  }

  function segCircleCollide(ax, ay, bx, by, cx, cy, r) {
    const dx = bx - ax, dy = by - ay;
    const lenSq = dx * dx + dy * dy;
    let t = ((cx - ax) * dx + (cy - ay) * dy) / (lenSq || 1);
    t = Utils.clamp(t, 0, 1);
    const px = ax + t * dx, py = ay + t * dy;
    const ddx = cx - px, ddy = cy - py;
    return ddx * ddx + ddy * ddy < r * r;
  }

  /** 从 (x0,y0) 到 (x1,y1) 是否被任何墙阻挡 */
  function rayBlocked(x0, y0, x1, y1) {
    for (const w of walls) {
      if (segSegIntersect(x0, y0, x1, y1, w.x1, w.y1, w.x2, w.y2)) return true;
    }
    return false;
  }

  function segSegIntersect(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y) {
    const s1x = p1x - p0x, s1y = p1y - p0y;
    const s2x = p3x - p2x, s2y = p3y - p2y;
    const denom = (-s2x * s1y + s1x * s2y);
    if (Math.abs(denom) < 1e-9) return false;
    const s = (-s1y * (p0x - p2x) + s1x * (p0y - p2y)) / denom;
    const t = (s2x * (p0y - p2y) - s2y * (p0x - p2x)) / denom;
    return s >= 0 && s <= 1 && t >= 0 && t <= 1;
  }

  /** 计算视野多边形:从 (cx,cy) 出发,半径 R,被墙截断,返回 polygon 顶点数组 */
  function computeVisibilityPolygon(cx, cy, R, samples = 72) {
    const points = [];
    for (let i = 0; i < samples; i++) {
      const angle = (i / samples) * Math.PI * 2;
      const ex = cx + Math.cos(angle) * R;
      const ey = cy + Math.sin(angle) * R;
      // 找到最近的墙交点
      let bestT = 1.0;
      for (const w of walls) {
        const t = segSegIntersectT(cx, cy, ex, ey, w.x1, w.y1, w.x2, w.y2);
        if (t !== null && t < bestT) bestT = t;
      }
      points.push({x: cx + Math.cos(angle) * R * bestT, y: cy + Math.sin(angle) * R * bestT});
    }
    return points;
  }

  function segSegIntersectT(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y) {
    const s1x = p1x - p0x, s1y = p1y - p0y;
    const s2x = p3x - p2x, s2y = p3y - p2y;
    const denom = (-s2x * s1y + s1x * s2y);
    if (Math.abs(denom) < 1e-9) return null;
    const s = (-s1y * (p0x - p2x) + s1x * (p0y - p2y)) / denom;
    const t = (s2x * (p0y - p2y) - s2y * (p0x - p2x)) / denom;
    if (s >= 0 && s <= 1 && t >= 0 && t <= 1) return t;
    return null;
  }

  /** 简化版:目标点是否在视野内(距离+墙体阻挡) */
  function isVisible(viewerX, viewerY, targetX, targetY, radius) {
    const dx = targetX - viewerX, dy = targetY - viewerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > radius) return false;
    return !rayBlocked(viewerX, viewerY, targetX, targetY);
  }

  /** 检查玩家是否在密道端点附近 */
  function checkVentUse(p) {
    const sp = layout?.secret_passage;
    if (!sp || !sp.killer_only) return null;
    for (let i = 0; i < sp.endpoints.length; i++) {
      const ep = sp.endpoints[i];
      const dx = p.x - ep.x, dy = p.y - ep.y;
      if (dx * dx + dy * dy < 30 * 30) {
        const other = sp.endpoints[(i + 1) % sp.endpoints.length];
        return {from: ep, to: other};
      }
    }
    return null;
  }

  return {
    init, getWalls, getRooms, getCorridors, getSecretPassage,
    getRoomById, getRegionAt, roomCenter,
    getFurnitureInRoom, getFurnitureByEvidenceSlot, findFurnitureAt,
    slideMove, collides, checkVentUse,
    rayBlocked, computeVisibilityPolygon, isVisible
  };
})();
