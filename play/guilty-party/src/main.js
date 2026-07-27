// ═══ main.js — 入口/主循环 ═══
let lastLogicTime = 0;
let lastRenderTime = 0;

async function main() {
  await loadAllData();
  const canvas = document.getElementById('game-canvas');
  canvas.width = cfg('camera.viewport_w', 960);
  canvas.height = cfg('camera.viewport_h', 720);

  Render.init(canvas);
  Input.init(canvas);
  Audio_.init();
  Audio_.bindBus();
  MapSystem.init();
  PlayerManager.init();
  Evidence.init();
  Trial.init();
  Voting.init();
  AISystem.init();
  GameStateMachine.init();
  UI.init();

  Bus.on('game_over', (data) => UI.showGameOver(data));
  Bus.on('toggle_pause', () => UI.reactToMenuMode());
  Bus.on('case_loaded', () => {
    Camera.reset();
    window._bodyDiscoveredFor = null;
    setTimeout(() => {
      const h = PlayerManager.getHuman();
      if (h) Camera.snapTo(h.x, h.y);
    }, 50);
  });

  // Logic ticks at fixed 33ms via setInterval — runs even in background tabs
  lastLogicTime = performance.now();
  setInterval(logicTick, 33);
  // Render: RAF for smoothness when visible + setInterval fallback for headless/background
  requestAnimationFrame(renderTick);
  setInterval(() => { if (document.hidden || performance.now() - lastRenderTime > 200) draw(); }, 50);
}

function logicTick() {
  const now = performance.now();
  const dt = Math.min(0.1, (now - lastLogicTime) / 1000);
  lastLogicTime = now;
  if (UI.menuMode === 'playing') {
    GameStateMachine.update(dt);
    PlayerManager.update(dt, GameStateMachine.getPhase());
    AISystem.update(dt, GameStateMachine.getPhase());
    Trial.update(dt, GameStateMachine.getPhase());
    // Camera follows human
    const human = PlayerManager.getHuman();
    if (human) Camera.follow(human);
    Camera.update(dt);
  }
  Render.update(dt);
}

function renderTick(t) {
  lastRenderTime = performance.now();
  draw();
  requestAnimationFrame(renderTick);
}

function draw() {
  const ctx = Render.getCtx();
  Render.clear();
  ctx.save();
  Render.applyShake();
  // 只有在playing/paused/game_over才画游戏世界
  if (UI.menuMode === 'playing' || UI.menuMode === 'paused' || UI.menuMode === 'game_over') {
    drawWorld(ctx);
  }
  // UI层
  UI.draw(ctx, GameStateMachine.getPhase(), GameStateMachine.getSecondsLeft(), GameStateMachine.getRound());
  ctx.restore();
  Render.drawFlashAndParticles();
}

function drawWorld(ctx) {
  const phase = GameStateMachine.getPhase();
  if (phase === 'trial' || phase === 'voting' || phase === 'game_over' || phase === 'idle') {
    return;
  }
  const HUD_OFFSET = 60;
  const VW = Camera.viewportW();
  const VH = Camera.viewportH();
  const human = PlayerManager.getHuman();

  ctx.save();
  // 视口剪裁:仅在游戏区域内绘制(避免覆盖右侧面板)
  ctx.beginPath();
  ctx.rect(0, HUD_OFFSET, VW, VH);
  ctx.clip();

  // 平移到 viewport 顶部
  ctx.translate(0, HUD_OFFSET);

  // 视口背景(在地图边外的区域显示深色)
  ctx.fillStyle = '#05060a';
  ctx.fillRect(0, 0, VW, VH);

  // 应用相机变换
  ctx.save();
  Camera.applyTransform(ctx);

  // 1. 走廊地板(底层)
  for (const c of MapSystem.getCorridors()) {
    if (Camera.isVisible(c.rect)) drawCorridor(ctx, c.rect);
  }
  // 2. 房间地板 + 名牌
  for (const r of MapSystem.getRooms()) {
    if (Camera.isVisible(r.rect)) {
      Sprites.drawRoom(ctx, r.rect.x, r.rect.y, r.rect.w, r.rect.h, r.color_temp, t('room.' + r.id));
    }
  }
  // 2b. 幻觉房间闪烁 (随机房间偶尔金光,可能是真线索可能是噪音)
  if (window._phantomFlash && performance.now() < window._phantomFlash.until) {
    const r = MapSystem.getRoomById(window._phantomFlash.roomId);
    if (r) {
      const remaining = (window._phantomFlash.until - performance.now()) / 600;
      ctx.save();
      ctx.fillStyle = `rgba(255, 215, 0, ${remaining * 0.18})`;
      ctx.fillRect(r.rect.x, r.rect.y, r.rect.w, r.rect.h);
      ctx.restore();
    }
  }
  // 3. 高亮玩家所在房间
  if (human) {
    const myRoom = MapSystem.getRoomById(human.room);
    if (myRoom) {
      ctx.save();
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 6]);
      ctx.lineDashOffset = -performance.now() / 60;
      ctx.strokeRect(myRoom.rect.x + 2, myRoom.rect.y + 2, myRoom.rect.w - 4, myRoom.rect.h - 4);
      ctx.setLineDash([]);
      ctx.restore();
    }
  }
  // 4. 家具
  for (const r of MapSystem.getRooms()) {
    if (Camera.isVisible(r.rect)) drawRoomFurniture(ctx, r);
  }
  // 5. 墙壁
  drawWalls(ctx);
  // 6a. 受害者尸体(在犯罪房间)
  drawVictimBody(ctx);
  // 6. 凶手密道
  if (human?.role === 'killer') drawSecretPassage(ctx);
  // 7. Fog of War — 在玩家身上绘制前先绘制视野遮罩
  drawFogOfWar(ctx, human);
  // 8. 玩家(只画视野内的他人 + 自己永远画)
  for (const p of PlayerManager.getAll()) {
    if (p.isHuman) { drawPlayerSprite(ctx, p); continue; }
    if (!p.alive) continue;
    if (!human || !human.alive) { drawPlayerSprite(ctx, p); continue; }
    const R = cfg('vision.radius', 320);
    if (MapSystem.isVisible(human.x, human.y, p.x, p.y, R)) {
      drawPlayerSprite(ctx, p);
    }
  }

  ctx.restore();   // 取消相机变换
  // 在视口顶部绘制小地图(可选,固定在屏幕坐标)
  drawMinimap(ctx, VW, VH);
  ctx.restore();   // 取消视口剪裁

  // 凶手心慌:被多人盯着 → 屏幕边缘红色脉动(只对凶手可见)
  if (human?.role === 'killer' && window._killerWatchers >= 2) {
    const HUD = 60;
    const t1 = (Math.sin(performance.now() / 200) + 1) / 2;
    const intensity = Math.min(1, (window._killerWatchers - 1) * 0.4) * (0.45 + t1 * 0.35);
    ctx.save();
    const grad = ctx.createRadialGradient(VW / 2, HUD + VH / 2, Math.min(VW, VH) * 0.2, VW / 2, HUD + VH / 2, Math.max(VW, VH) * 0.55);
    grad.addColorStop(0, 'rgba(255,0,0,0)');
    grad.addColorStop(0.7, `rgba(255,0,0,0)`);
    grad.addColorStop(1, `rgba(255,0,0,${intensity})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, HUD, VW, VH);
    // 警示文字
    ctx.fillStyle = `rgba(255,80,80,${intensity * 1.2})`;
    ctx.font = 'bold 13px PingFang SC, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`⚠ ${window._killerWatchers} 人盯着你 — 离开!`, VW / 2, HUD + 76);
    ctx.restore();
  }

  // 右侧面板(屏幕坐标,不受相机/剪裁影响)
  drawActivityPanel(ctx);
}

function drawMinimap(ctx, VW, VH) {
  if (!DATA.map_layout) return;
  const mb = DATA.map_layout.map_bounds;
  const mmW = 140, mmH = 96;
  const mmX = VW - mmW - 10, mmY = 10;
  ctx.save();
  // 背景
  ctx.fillStyle = 'rgba(10,10,18,0.85)';
  ctx.fillRect(mmX, mmY, mmW, mmH);
  ctx.strokeStyle = 'rgba(255,215,0,0.6)';
  ctx.lineWidth = 1;
  ctx.strokeRect(mmX, mmY, mmW, mmH);
  const sx = mmW / mb.width, sy = mmH / mb.height;
  // 房间
  for (const r of MapSystem.getRooms()) {
    ctx.fillStyle = r.color_temp === 'warm' ? '#5c4630' : r.color_temp === 'cool' ? '#2c3a55' : '#3a3a45';
    ctx.fillRect(mmX + r.rect.x * sx, mmY + r.rect.y * sy, r.rect.w * sx, r.rect.h * sy);
  }
  for (const c of MapSystem.getCorridors()) {
    ctx.fillStyle = '#1a1410';
    ctx.fillRect(mmX + c.rect.x * sx, mmY + c.rect.y * sy, c.rect.w * sx, c.rect.h * sy);
  }
  // 只显示自己 + 视野内的其他玩家(像 Among Us 的 admin map 不可见)
  const human = PlayerManager.getHuman();
  if (human?.alive) {
    const R = cfg('vision.radius', 320);
    for (const p of PlayerManager.getAll()) {
      if (!p.alive) continue;
      if (p.isHuman) {
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(mmX + p.x * sx, mmY + p.y * sy, 3.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (MapSystem.isVisible(human.x, human.y, p.x, p.y, R)) {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(mmX + p.x * sx, mmY + p.y * sy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  // 视口框
  const cx = Camera.getX(), cy = Camera.getY();
  const VHm = Camera.viewportH(), VWm = Camera.viewportW();
  ctx.strokeStyle = 'rgba(255,215,0,0.8)';
  ctx.lineWidth = 1;
  ctx.strokeRect(mmX + (cx - VWm / 2) * sx, mmY + (cy - VHm / 2) * sy, VWm * sx, VHm * sy);
  ctx.restore();
}

function drawCorridor(ctx, rect) {
  ctx.fillStyle = '#1a1410';
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.strokeStyle = '#2a1f18';
  ctx.lineWidth = 1;
  for (let x = rect.x; x < rect.x + rect.w; x += 32) {
    ctx.beginPath(); ctx.moveTo(x, rect.y); ctx.lineTo(x, rect.y + rect.h); ctx.stroke();
  }
  for (let y = rect.y; y < rect.y + rect.h; y += 32) {
    ctx.beginPath(); ctx.moveTo(rect.x, y); ctx.lineTo(rect.x + rect.w, y); ctx.stroke();
  }
}

function drawRoomFurniture(ctx, room) {
  const human = PlayerManager.getHuman();
  for (const f of (room.furniture || [])) {
    const ax = room.rect.x + f.x, ay = room.rect.y + f.y;
    Sprites.drawFurniture(ctx, f.sprite, ax, ay, f.w, f.h);
    const slotIdx = f.evidence_slot;
    if (slotIdx === undefined) continue;
    const ev = Evidence.getInRoomSlot(room.id, slotIdx);
    if (!ev || !human) continue;
    // 搜证残痕:8s 内被搜过的家具发金光
    if (ev._lastDisturbedAt) {
      const sinceMs = performance.now() - ev._lastDisturbedAt;
      if (sinceMs < 8000) {
        const a = (1 - sinceMs / 8000) * 0.55;
        ctx.save();
        ctx.strokeStyle = `rgba(255, 215, 0, ${a})`;
        ctx.lineWidth = 2;
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 8;
        ctx.strokeRect(ax - 2, ay - 2, f.w + 4, f.h + 4);
        ctx.restore();
      }
    }
    if (ev.searchedBy.has(human.id)) {
      // 我搜到了:显示证据图标 + 真伪色环
      const ix = ax + f.w - 10, iy = ay + 10;
      ctx.fillStyle = ev.mark === 'real' ? '#34C759' : ev.mark === 'fake' ? '#FF3B30' : '#FFD700';
      ctx.beginPath(); ctx.arc(ix, iy, 8, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#000'; ctx.lineWidth = 1; ctx.stroke();
      Sprites.drawEvidenceIcon(ctx, ix, iy, 5, ev.category);
    } else if (ev.searchedBy.size > 0) {
      // 别人搜过了:显示灰色 "已搜空" 标记,我无法再搜
      const ix = ax + f.w / 2, iy = ay - 8;
      ctx.save();
      ctx.fillStyle = 'rgba(100,100,100,0.6)';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✗ 已搜空', ix, iy);
      ctx.restore();
    } else if (human.searching && human.searching.roomId === room.id && human.searching.slotIndex === slotIdx) {
      ctx.save();
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(ax + f.w / 2, ay + f.h / 2, Math.max(f.w, f.h) * 0.55, -Math.PI / 2, -Math.PI / 2 + human.searching.progress * Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } else if (canHumanSearchHere(human, room.id, slotIdx)) {
      const t1 = (performance.now() / 400) % (Math.PI * 2);
      const yoff = Math.sin(t1) * 3;
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.beginPath();
      ctx.arc(ax + f.w / 2, ay - 14 + yoff, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', ax + f.w / 2, ay - 14 + yoff);
      ctx.restore();
    }
  }
}

function canHumanSearchHere(human, roomId, slotIdx) {
  if (human.room !== roomId) return false;
  const ev = Evidence.getInRoomSlot(roomId, slotIdx);
  if (!ev || ev.searchedBy.size > 0) return false; // 全局唯一
  const f = MapSystem.getFurnitureByEvidenceSlot(roomId, slotIdx);
  if (!f) return false;
  const dx = human.x - f.cx, dy = human.y - f.cy;
  return dx * dx + dy * dy < 60 * 60;
}

function drawWalls(ctx) {
  ctx.save();
  ctx.strokeStyle = '#0a0708';
  ctx.lineWidth = 4;
  ctx.lineCap = 'square';
  for (const w of MapSystem.getWalls()) {
    ctx.beginPath();
    ctx.moveTo(w.x1, w.y1);
    ctx.lineTo(w.x2, w.y2);
    ctx.stroke();
  }
  ctx.strokeStyle = '#3a2f26';
  ctx.lineWidth = 1;
  for (const w of MapSystem.getWalls()) {
    ctx.beginPath();
    ctx.moveTo(w.x1, w.y1);
    ctx.lineTo(w.x2, w.y2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawFogOfWar(ctx, viewer) {
  if (!viewer) return;
  const mb = DATA.map_layout?.map_bounds;
  if (!mb) return;
  const R = cfg('vision.radius', 320);
  const fogAlpha = cfg('vision.fog_alpha', 0.72);
  const wallBlock = cfg('vision.wall_blocking', true);

  ctx.save();

  // 使用 even-odd 填充规则,只在视野外绘制暗色(视野多边形内部是"洞",不被填充)
  ctx.fillStyle = `rgba(0,0,0,${fogAlpha})`;
  ctx.beginPath();
  // 外矩形(整张地图)
  ctx.rect(0, 0, mb.width, mb.height);
  // 内多边形(视野范围)—— 墙壁阻挡时是真实多边形,否则是圆
  if (wallBlock) {
    const poly = MapSystem.computeVisibilityPolygon(viewer.x, viewer.y, R, 84);
    ctx.moveTo(poly[0].x, poly[0].y);
    for (let i = 1; i < poly.length; i++) ctx.lineTo(poly[i].x, poly[i].y);
    ctx.closePath();
  } else {
    ctx.moveTo(viewer.x + R, viewer.y);
    ctx.arc(viewer.x, viewer.y, R, 0, Math.PI * 2, true);
  }
  ctx.fill('evenodd');

  // 视野边缘柔化(从视野内向外做渐变淡出)
  const grad = ctx.createRadialGradient(viewer.x, viewer.y, R - 40, viewer.x, viewer.y, R + 20);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, `rgba(0,0,0,${fogAlpha * 0.5})`);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(viewer.x, viewer.y, R + 20, 0, Math.PI * 2);
  ctx.fill();

  // 视野边缘高亮(细金线)
  ctx.strokeStyle = 'rgba(255,215,0,0.2)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(viewer.x, viewer.y, R, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

function drawVictimBody(ctx) {
  const cases = DATA.locations?.locations || [];
  const cur = cases.find(c => c.id === GameStateMachine.getCurrentCaseId?.()) || cases[0];
  if (!cur) return;
  const room = MapSystem.getRoomById(cur.victim_location);
  if (!room) return;
  // 尸体位置:房间一角
  const bx = room.rect.x + room.rect.w * 0.7;
  const by = room.rect.y + room.rect.h * 0.7;
  Sprites.drawFurniture(ctx, 'body', bx - 22, by - 18, 44, 36);
  // 玩家进入此房间触发"发现尸体"
  const human = PlayerManager.getHuman();
  if (human && human.alive && human.room === cur.victim_location && !window._bodyDiscoveredFor) {
    window._bodyDiscoveredFor = cur.id;
    triggerJuice('juice_destroy_evidence', bx, by);
    Audio_.play('sfx_distant_scream');
    UI.showToast('💀 你发现了尸体! 案发地点: ' + t('room.' + cur.victim_location));
  }
}

function drawSecretPassage(ctx) {
  const sp = MapSystem.getSecretPassage();
  if (!sp) return;
  for (const ep of sp.endpoints) {
    Sprites.drawFurniture(ctx, 'vent', ep.x - 14, ep.y - 14, 28, 28);
    const t1 = (Math.sin(performance.now() / 350) + 1) / 2;
    ctx.save();
    ctx.strokeStyle = `rgba(255, 30, 30, ${0.3 + t1 * 0.5})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.arc(ep.x, ep.y, 18 + t1 * 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }
}

function drawPlayerSprite(ctx, p) {
  Sprites.drawPlayer(ctx, p.x, p.y, p.color, 14, p.role, p.isHuman, p.alive);
  ctx.save();
  ctx.font = 'bold 11px PingFang SC, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = 'rgba(0,0,0,0.85)';
  ctx.fillText(p.name, p.x + 1, p.y + 13);
  ctx.fillStyle = p.isHuman ? '#FFD700' : '#fff';
  ctx.fillText(p.name, p.x, p.y + 12);
  if (p.lens > 0) Sprites.drawLens(ctx, p.x + 12, p.y - 14, 7);
  if (p.searching) {
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 18, -Math.PI / 2, -Math.PI / 2 + p.searching.progress * Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawActivityPanel(ctx) {
  const W = ctx.canvas.width;
  const PANEL_X = 720;
  const PANEL_W = W - PANEL_X;
  const HUD_OFFSET = 60;
  ctx.save();
  ctx.fillStyle = 'rgba(15,18,28,0.92)';
  ctx.fillRect(PANEL_X, HUD_OFFSET, PANEL_W, ctx.canvas.height - HUD_OFFSET);
  ctx.strokeStyle = 'rgba(255,215,0,0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(PANEL_X, HUD_OFFSET); ctx.lineTo(PANEL_X, ctx.canvas.height); ctx.stroke();

  // Roster 标题
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 13px PingFang SC, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('SUSPECTS', PANEL_X + 12, HUD_OFFSET + 22);

  const human = PlayerManager.getHuman();
  const players = PlayerManager.getAll();
  const startY = HUD_OFFSET + 38;
  const R = cfg('vision.radius', 320);
  players.forEach((p, i) => {
    const y = startY + i * 36;
    // 头像
    Sprites.drawPlayer(ctx, PANEL_X + 22, y + 14, p.color, 12, p.role, p.isHuman, p.alive);
    // 名字
    ctx.fillStyle = p.alive ? '#fff' : '#666';
    ctx.font = 'bold 12px PingFang SC, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(p.name, PANEL_X + 42, y + 12);
    // 状态(基于视野: 只有自己/视野内的人才显示房间;否则显示 'unknown' 或上次见到)
    ctx.fillStyle = '#a8a8b8';
    ctx.font = '10px PingFang SC, sans-serif';
    let info;
    if (!p.alive) info = '✗ eliminated';
    else if (p.isHuman) info = t('room.' + p.room);
    else if (human?.alive && MapSystem.isVisible(human.x, human.y, p.x, p.y, R)) {
      info = t('room.' + p.room) + (p.searching ? ' 🔍' : (p.lens > 0 ? ' ◉' : ''));
      // remember last seen
      p._lastSeenRoom = p.room;
      p._lastSeenAt = performance.now();
    } else if (p._lastSeenRoom) {
      const ago = ((performance.now() - p._lastSeenAt) / 1000) | 0;
      info = `last: ${t('room.' + p._lastSeenRoom)} (${ago}s)`;
    } else {
      info = '? unknown';
    }
    ctx.fillText(info, PANEL_X + 42, y + 26);
    // 进度条:他人 → 我对此人的怀疑度,自己 → AI 对我的平均怀疑度
    let sus = null;
    if (human && p.id !== human.id && human.suspicion?.[p.id] !== undefined) {
      sus = human.suspicion[p.id];
    } else if (human && p.id === human.id) {
      // 汇总所有活着的 AI 对我的怀疑度
      const others = PlayerManager.getAll().filter(q => q.id !== human.id && q.alive);
      if (others.length > 0) {
        const sum = others.reduce((acc, q) => acc + (q.suspicion?.[human.id] || 0), 0);
        sus = sum / others.length;
      }
    }
    if (sus !== null) {
      ctx.fillStyle = 'rgba(40,30,30,0.8)';
      ctx.fillRect(PANEL_X + PANEL_W - 60, y + 12, 50, 6);
      ctx.fillStyle = sus > 60 ? '#FF3B30' : sus > 30 ? '#FF9500' : '#34C759';
      ctx.fillRect(PANEL_X + PANEL_W - 60, y + 12, 50 * (sus / 100), 6);
    }
  });
  // 提示
  ctx.fillStyle = '#666';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${PlayerManager.getAlive().length}/6 alive`, PANEL_X + PANEL_W / 2, startY + players.length * 36 + 16);

  // 我的证据计数
  if (human) {
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 12px PingFang SC, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Evidence: ${human.evidence_book.length}`, PANEL_X + PANEL_W / 2, startY + players.length * 36 + 40);
    ctx.fillStyle = '#a8a8b8';
    ctx.font = '10px sans-serif';
    ctx.fillText('[Tab] to view', PANEL_X + PANEL_W / 2, startY + players.length * 36 + 56);
  }
  ctx.restore();
}

window.addEventListener('load', main);
