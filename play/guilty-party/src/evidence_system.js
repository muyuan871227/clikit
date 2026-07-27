// ═══ evidence_system.js — 证据生成/搜查/伪造/篡改/销毁/鉴定 ═══
const Evidence = (() => {
  // evidence pool: 全局所有证据实例
  // {id, category, isReal, accusedPlayerId, placedBy, mark, roomId, slotIndex, content, isFrame, tampered}
  let pool = [];
  let currentCase = null;

  function init() {
    bindBus();
  }
  function bindBus() {
    Bus.on('case_loaded', ({caseId}) => generateForCase(caseId));
    Bus.on('search_completed', onSearchComplete);
    Bus.on('player_frame_request', onFrameRequest);
    Bus.on('player_tamper_request', onTamperRequest);
    Bus.on('player_destroy_request', onDestroyRequest);
    Bus.on('player_use_lens_request', onLensRequest);
    Bus.on('player_search_intent', onSearchIntent);
    Bus.on('canvas_click', onCanvasClick);
    Bus.on('round_started', onRoundStart);
  }

  function generateForCase(caseId) {
    pool = [];
    const loc = (DATA.locations?.locations || []).find(l => l.id === caseId);
    if (!loc) { console.warn('case not found', caseId); return; }
    currentCase = loc;
    const dist = loc.clue_distribution || {};
    const players = PlayerManager.getAll();
    const killerId = PlayerManager.getKillerId();
    const detectiveIds = players.filter(p => p.role !== 'killer').map(p => p.id);
    for (const [roomId, slotList] of Object.entries(dist)) {
      slotList.forEach((evName, slotIdx) => {
        const tpl = getEntity(evName);
        if (!tpl) return;
        // 大多数证据指向无辜玩家(随机选一个非凶手)或凶手(铁证)
        let accused;
        if (tpl.always_real) {
          // 铁证: 50%指向凶手,50%指向无辜(让侦探需要交叉验证)
          accused = Math.random() < 0.55 ? killerId : Utils.pick(detectiveIds);
        } else {
          // 普通真证据: 70%随机指向某个玩家(可能错), 30%指向凶手
          accused = Math.random() < 0.3 ? killerId : Utils.pick(players.map(p => p.id));
        }
        pool.push({
          id: `ev_${roomId}_${slotIdx}`,
          category: tpl.category,
          isReal: true,
          isForgeable: tpl.is_forgeable !== false,
          alwaysReal: !!tpl.always_real,
          editableByKiller: !!tpl.editable_by_killer,
          accusedPlayerId: accused,
          placedBy: 'natural',
          mark: 'unknown',
          roomId,
          slotIndex: slotIdx,
          searchedBy: new Set(),
          icon: tpl.icon,
          weight: tpl.base_weight || 20,
          pointsReal: tpl.points_real_incriminate || 30,
          pointsFake: tpl.points_frame_mislead || 25,
          tampered: false,
          fakeTestimony: false
        });
      });
    }
    Bus.emit('evidence_generated', {evidenceList: pool});
  }

  function onRoundStart() {
    PlayerManager.resetRoundActions();
  }

  function getInRoomSlot(roomId, slotIdx) {
    return pool.find(e => e.roomId === roomId && e.slotIndex === slotIdx);
  }

  function getById(id) {
    return pool.find(e => e.id === id);
  }

  function getAll() { return pool; }

  function getEvidenceForRoom(roomId) {
    return pool.filter(e => e.roomId === roomId).sort((a, b) => a.slotIndex - b.slotIndex);
  }

  // === 玩家搜查 ===
  function onSearchIntent() {
    const human = PlayerManager.getHuman();
    if (!human || !human.alive || human.searching) return;
    // 找到最近的可搜家具(必须在 60px 范围内,且全局未被搜过)
    const furniture = MapSystem.getFurnitureInRoom(human.room);
    let best = null, bestD = Infinity;
    for (const f of furniture) {
      if (f.evidence_slot === undefined) continue;
      const ev = getInRoomSlot(human.room, f.evidence_slot);
      if (!ev || ev.searchedBy.size > 0) continue; // 全局唯一:任何人搜过则跳过
      const dx = human.x - f.cx, dy = human.y - f.cy;
      const d = dx * dx + dy * dy;
      if (d < bestD && d < 60 * 60) { bestD = d; best = f; }
    }
    if (best) startSearch(human.id, human.room, best.evidence_slot);
  }

  function onCanvasClick({x, y}) {
    const human = PlayerManager.getHuman();
    if (!human || !human.alive) return;
    if (UI.isModalOpen()) return;
    // 屏幕坐标 → 世界(地图)坐标
    const HUD_OFFSET = 60;
    const VW = Camera.viewportW();
    if (x > VW) return; // 点在右侧面板上,忽略
    const world = Camera.screenToWorld(x, y, HUD_OFFSET);
    const hit = MapSystem.findFurnitureAt(world.x, world.y, 8);
    if (hit && hit.roomId === human.room && hit.slotIndex !== undefined) {
      const ev = getInRoomSlot(hit.roomId, hit.slotIndex);
      if (ev && ev.searchedBy.size > 0) {
        UI.showToast('已被人搜过 — 此处空了');
        return;
      }
      if (ev && !human.searching) {
        const f = hit.furniture;
        const room = MapSystem.getRoomById(hit.roomId);
        const dx = human.x - (room.rect.x + f.x + f.w / 2);
        const dy = human.y - (room.rect.y + f.y + f.h / 2);
        if (dx * dx + dy * dy < 80 * 80) {
          startSearch(human.id, hit.roomId, hit.slotIndex);
        } else {
          UI.showToast('Get closer to search');
        }
      }
    }
  }

  function findSlotAt(screenX, screenY) {
    const HUD_OFFSET = 60;
    const world = Camera.screenToWorld(screenX, screenY, HUD_OFFSET);
    const hit = MapSystem.findFurnitureAt(world.x, world.y, 8);
    if (!hit) return null;
    const ev = getInRoomSlot(hit.roomId, hit.slotIndex);
    return {roomId: hit.roomId, slotIndex: hit.slotIndex, ev};
  }

  function startSearch(playerId, roomId, slotIndex) {
    const p = PlayerManager.getPlayer(playerId);
    if (!p || !p.alive) return;
    if (p.room !== roomId) return;
    const ev = getInRoomSlot(roomId, slotIndex);
    if (!ev) return;
    if (ev.searchedBy.size > 0) return; // 全局唯一
    p.searching = {roomId, slotIndex, progress: 0};
    triggerJuice('juice_search_start', p.x, p.y);
  }

  function onSearchComplete({playerId, roomId, slotIndex}) {
    const p = PlayerManager.getPlayer(playerId);
    const ev = getInRoomSlot(roomId, slotIndex);
    if (!p || !ev) return;
    ev.searchedBy.add(playerId);
    ev._lastDisturbedAt = performance.now();
    if (!p.evidence_book.find(b => b.id === ev.id)) {
      p.evidence_book.push(ev);
    }
    triggerJuice('juice_search_complete', p.x, p.y);
    Bus.emit('clue_added_to_player', {playerId, evidence: ev});
  }

  // === 凶手:栽赃 ===
  function onFrameRequest() {
    const human = PlayerManager.getHuman();
    if (!human || human.role !== 'killer' || !human.alive) {
      UI.showToast(t('action.frame') + ' — N/A');
      return;
    }
    if (human.framePerRoundLeft <= 0) {
      UI.showToast('Frame: 0 left');
      return;
    }
    const aloneSec = PlayerManager.getAloneSeconds(human.id);
    if (aloneSec < cfg('killer_actions.frame_linger_seconds', 5)) {
      UI.showToast(`Stay alone ${(cfg('killer_actions.frame_linger_seconds', 5) - aloneSec).toFixed(1)}s more`);
      return;
    }
    // 找一个空 slot 在当前房间, 找不到→在slot[0]覆盖性放伪证
    UI.openFrameDialog(human.room, (category, accusedId) => {
      if (category === null) return;
      placeFrame(human.id, human.room, category, accusedId);
    });
  }

  // === 目击系统:在某事件发生时,所有视野内能看到该位置的玩家(非作案者本人)记录目击 ===
  function recordWitnesses(actorId, x, y, actionLabel) {
    const R = cfg('vision.radius', 170);
    const witnesses = [];
    for (const observer of PlayerManager.getAlive()) {
      if (observer.id === actorId) continue;
      if (MapSystem.isVisible(observer.x, observer.y, x, y, R)) {
        witnesses.push(observer.id);
        // 给目击者一个"witness 笔记"加入证据册
        const actor = PlayerManager.getPlayer(actorId);
        const witnessNote = {
          id: `witness_${Utils.uid()}`,
          category: 'movement_log',
          isReal: true,
          isForgeable: false,
          alwaysReal: true,  // 目击=铁证
          editableByKiller: false,
          accusedPlayerId: actorId,
          placedBy: 'witness',
          mark: 'real', // 自己看到的就是真
          roomId: 'witness',
          slotIndex: -1,
          searchedBy: new Set([observer.id]),
          icon: 'sprite_evidence_log',
          weight: 50,
          pointsReal: 60,
          pointsFake: 0,
          tampered: false,
          fakeTestimony: false,
          witnessNote: actionLabel,
          witnessActor: actor.name
        };
        observer.evidence_book.push(witnessNote);
        // 提升目击者对作案者的怀疑度
        observer.suspicion[actorId] = Math.min(100, (observer.suspicion[actorId] || 0) + 35);
        // 人类目击 → 弹窗 + 音效
        if (observer.isHuman) {
          UI.showToast(`👁 你目击了 ${actor.name} ${actionLabel}!`);
          triggerJuice('juice_lens_fake_detected', x, y);
        }
      }
    }
    return witnesses;
  }

  function placeFrame(killerId, roomId, category, accusedId) {
    // 找空slot
    const inRoom = getEvidenceForRoom(roomId);
    let slotIdx = -1;
    // 先找未被搜查过的slot,把它替换/标记为伪证
    for (const ev of inRoom) {
      if (ev.searchedBy.size === 0) { slotIdx = ev.slotIndex; break; }
    }
    if (slotIdx === -1) slotIdx = 0;
    // 替换该slot的evidence
    const oldIdx = pool.findIndex(e => e.roomId === roomId && e.slotIndex === slotIdx);
    if (oldIdx !== -1) pool.splice(oldIdx, 1);
    const fakeId = `ev_${roomId}_${slotIdx}_fake_${Utils.uid()}`;
    const tpl = getEntity('evidence_' + category);
    pool.push({
      id: fakeId, category, isReal: false, isForgeable: true, alwaysReal: false,
      editableByKiller: tpl?.editable_by_killer || false,
      accusedPlayerId: accusedId, placedBy: killerId, mark: 'unknown',
      roomId, slotIndex: slotIdx, searchedBy: new Set(),
      icon: tpl?.icon, weight: tpl?.base_weight || 20,
      pointsReal: tpl?.points_real_incriminate || 30,
      pointsFake: tpl?.points_frame_mislead || 25, tampered: false, fakeTestimony: false
    });
    const k = PlayerManager.getPlayer(killerId);
    if (k) k.framePerRoundLeft--;
    triggerJuice('juice_frame_placed', k?.x, k?.y);
    Bus.emit('frame_placed_event', {placerId: killerId, evidenceId: fakeId, roomId, slotIndex: slotIdx});
    UI.showToast(t('popup.frame_placed'));
    // 目击!如果有人看到他在这房间里栽赃,他完蛋了
    recordWitnesses(killerId, k.x, k.y, '在' + t('room.' + roomId) + '栽赃');
  }

  // 凶手AI: 在伪造时调用
  function aiPlaceFrame(killerId, roomId, category, accusedId) {
    placeFrame(killerId, roomId, category, accusedId);
  }

  // === 篡改 ===
  function onTamperRequest() {
    const human = PlayerManager.getHuman();
    if (!human || human.role !== 'killer' || !human.alive) return;
    if (human.tamperPerRoundLeft <= 0) { UI.showToast('Tamper: 0 left'); return; }
    // 选择一个文档类已搜过的证据,改其指向
    const tamperable = human.evidence_book.filter(e => e.editableByKiller);
    if (tamperable.length === 0) { UI.showToast('No doc to tamper'); return; }
    UI.openTamperDialog(tamperable, (evidenceId, newAccusedId) => {
      if (!evidenceId) return;
      const ev = getById(evidenceId);
      if (!ev) return;
      ev.accusedPlayerId = newAccusedId;
      ev.tampered = true;
      ev.isReal = false; // 篡改后等同伪证(lens会显示)
      human.tamperPerRoundLeft--;
      triggerJuice('juice_tamper', human.x, human.y);
      UI.showToast('Document tampered');
      recordWitnesses(human.id, human.x, human.y, '篡改证据');
    });
  }

  function aiTamper(killerId, evidenceId, newAccusedId) {
    const ev = getById(evidenceId);
    const k = PlayerManager.getPlayer(killerId);
    if (!ev || !k) return;
    ev.accusedPlayerId = newAccusedId;
    ev.tampered = true;
    ev.isReal = false;
    k.tamperPerRoundLeft--;
    triggerJuice('juice_tamper', k.x, k.y);
  }

  // === 销毁 ===
  function onDestroyRequest() {
    const human = PlayerManager.getHuman();
    if (!human || human.role !== 'killer' || !human.alive) return;
    if (human.destroyLeft <= 0) { UI.showToast('Destroy: 0 left'); return; }
    // 销毁某条最具威胁的证据(对自己)
    UI.openDestroyDialog(human.evidence_book, (evidenceId) => {
      if (!evidenceId) return;
      destroyEvidence(human.id, evidenceId);
    });
  }

  function destroyEvidence(killerId, evidenceId) {
    const idx = pool.findIndex(e => e.id === evidenceId);
    if (idx !== -1) pool.splice(idx, 1);
    // 也从所有玩家evidence_book移除
    for (const p of PlayerManager.getAll()) {
      p.evidence_book = p.evidence_book.filter(e => e.id !== evidenceId);
    }
    const k = PlayerManager.getPlayer(killerId);
    if (k) k.destroyLeft--;
    triggerJuice('juice_destroy_evidence', k?.x, k?.y);
    Bus.emit('evidence_destroyed', {evidenceId});
    UI.showToast('Evidence destroyed');
    recordWitnesses(killerId, k.x, k.y, '销毁证据');
  }

  function aiDestroy(killerId, evidenceId) {
    destroyEvidence(killerId, evidenceId);
  }

  // === 放大镜 ===
  function spawnLensInRandomRoom() {
    // 简化: 直接给一个活着的随机玩家放大镜
    const alive = PlayerManager.getAlive();
    if (alive.length === 0) return;
    const target = Utils.pick(alive);
    target.lens++;
    triggerJuice('juice_lens_pickup', target.x, target.y);
    Bus.emit('lens_spawned', {receiverId: target.id});
    if (target.isHuman) UI.showToast('You got the Lens!');
  }

  function onLensRequest() {
    const human = PlayerManager.getHuman();
    if (!human) return;
    if (human.role === 'killer') { UI.showToast('凶手不能使用放大镜'); return; }
    if (human.lens <= 0) { UI.showToast('No lens'); return; }
    if (human.evidence_book.length === 0) { UI.showToast('No evidence to verify'); return; }
    UI.openLensDialog(human.evidence_book, (evidenceId, lieIfKiller) => {
      if (!evidenceId) return;
      useLens(human.id, evidenceId, lieIfKiller);
    });
  }

  function useLens(playerId, evidenceId, lieIfKiller = false) {
    const p = PlayerManager.getPlayer(playerId);
    const ev = getById(evidenceId);
    if (!p || !ev || p.lens <= 0) return;
    if (p.role === 'killer') return; // 凶手禁用放大镜
    p.lens--;
    let mark;
    if (p.role === 'killer' && lieIfKiller) {
      mark = ev.isReal ? 'fake' : 'real';
      ev.mark = mark;
      triggerJuice('juice_lens_use', p.x, p.y);
    } else {
      mark = ev.isReal ? 'real' : 'fake';
      ev.mark = mark;
      if (mark === 'fake') triggerJuice('juice_lens_fake_detected', p.x, p.y);
      else triggerJuice('juice_lens_use', p.x, p.y);
    }
    Bus.emit('evidence_marked', {evidenceId, mark, verifiedBy: playerId});
    if (p.isHuman) {
      UI.showToast(`Verified: ${mark.toUpperCase()}`);
    }
  }

  function aiUseLens(playerId, evidenceId, lieIfKiller = false) {
    useLens(playerId, evidenceId, lieIfKiller);
  }

  // === 假证词 ===
  function onFalseTestimonyRequest() {
    const human = PlayerManager.getHuman();
    if (!human || human.role !== 'killer') return;
    if (human.falseTestimonyLeft <= 0) { UI.showToast('Fake Testimony: 0 left'); return; }
    UI.openFalseTestimonyDialog((accusedId) => {
      if (accusedId === null) return;
      placeFalseTestimony(human.id, accusedId);
    });
  }

  function placeFalseTestimony(killerId, accusedId) {
    const k = PlayerManager.getPlayer(killerId);
    const fakeId = `fakelog_${Utils.uid()}`;
    const tpl = getEntity('evidence_movement_log');
    const fakeEv = {
      id: fakeId, category: 'movement_log', isReal: false, isForgeable: true,
      alwaysReal: false, editableByKiller: false,
      accusedPlayerId: accusedId, placedBy: killerId, mark: 'unknown',
      roomId: 'witness', slotIndex: -1, searchedBy: new Set([killerId]),
      icon: tpl?.icon, weight: 20, pointsReal: 25, pointsFake: 28,
      tampered: false, fakeTestimony: true
    };
    pool.push(fakeEv);
    k.evidence_book.push(fakeEv);
    k.falseTestimonyLeft--;
    triggerJuice('juice_frame_placed', k.x, k.y);
    UI.showToast('Fake testimony submitted');
  }

  function aiFalseTestimony(killerId, accusedId) {
    placeFalseTestimony(killerId, accusedId);
  }

  // === 公示证据池(审判时使用) ===
  // (UI管理,Evidence仅提供查询)
  function getPlayerSearchedEvidence(playerId) {
    return pool.filter(e => e.searchedBy.has(playerId));
  }

  // 注册false_testimony事件
  Bus.on('player_false_testimony_request', onFalseTestimonyRequest);

  return {
    init, getAll, getById, getInRoomSlot, getEvidenceForRoom, findSlotAt,
    spawnLensInRandomRoom, getPlayerSearchedEvidence,
    aiPlaceFrame, aiTamper, aiDestroy, aiUseLens, aiFalseTestimony,
    placeFrame, useLens,
    _recordWitnesses: recordWitnesses
  };
})();
