// ═══ ai_system.js — AI决策(NPC) ═══
const AISystem = (() => {
  let aiTickAccum = 0;
  const TICK = 0.5; // seconds

  function init() {
    Bus.on('case_loaded', () => {
      // 初始化 AI 状态
    });
    Bus.on('clue_added_to_player', ({playerId, evidence}) => {
      // AI 玩家自己捡到证据,触发suspicion更新
      const p = PlayerManager.getPlayer(playerId);
      if (!p) return;
      absorbEvidenceForPlayer(p, evidence, evidence.accusedPlayerId);
    });
  }

  function update(dt, currentPhase) {
    aiTickAccum += dt;
    if (aiTickAccum < TICK) return;
    aiTickAccum = 0;
    const players = PlayerManager.getAll();
    for (const p of players) {
      if (!p.alive || p.isHuman) continue;
      if (currentPhase === 'investigate') aiInvestigate(p);
      // trial: 由Trial触发
      // voting: 由Voting触发
    }
  }

  function aiInvestigate(p) {
    // 如果在搜查中,等
    if (p.searching) return;
    // 如果在移动,等到达
    if (p.targetX !== null) return;
    // 决策: 选下一个动作
    if (p.role === 'killer') return aiInvestigateKiller(p);
    return aiInvestigateDetective(p);
  }

  function aiInvestigateDetective(p) {
    // 全局唯一规则:只搜尚未被任何人搜过的证据
    const rooms = cfg('map.room_ids', []);
    const currentHasUnchecked = Evidence.getEvidenceForRoom(p.room || rooms[0]).some(e => e.searchedBy.size === 0);
    if (currentHasUnchecked && p.room && MapSystem.getRoomById(p.room)) {
      tryEnterAndSearch(p, p.room);
      return;
    }
    const unchecked = rooms.filter(r => r !== p.room && Evidence.getEvidenceForRoom(r).some(e => e.searchedBy.size === 0));
    if (unchecked.length > 0) {
      tryEnterAndSearch(p, Utils.pick(unchecked));
      return;
    }
    tryRandomRoom(p);
  }

  function aiInvestigateKiller(p) {
    const k = DATA.ai_behaviors?.behaviors?.killer_forger || {};
    const w = k.decision_weights || {move_to_empty_room_to_frame: 1};
    const action = Utils.weightedPick(w);
    if (action === 'move_to_empty_room_to_frame') {
      // 找一个无其他活人的房间
      const rooms = cfg('map.room_ids', []);
      const empty = rooms.filter(r => {
        const others = PlayerManager.getAlive().filter(q => q.id !== p.id && q.room === r);
        return others.length === 0;
      });
      if (empty.length > 0) {
        const target = Utils.pick(empty);
        if (p.room === target) {
          // 等待5s后伪造
          if (PlayerManager.getAloneSeconds(p.id) >= cfg('killer_actions.frame_linger_seconds', 5) && p.framePerRoundLeft > 0) {
            doKillerFrame(p);
          }
        } else PlayerManager.moveToRoom(p.id, target);
      } else tryRandomRoom(p);
    } else if (action === 'move_to_incriminating_evidence') {
      // 走到自己已知最不利证据所在房间, 准备销毁/篡改
      const myEv = Evidence.getAll();
      const danger = myEv.find(e => e.accusedPlayerId === p.id && e.alwaysReal);
      if (danger && p.destroyLeft > 0) {
        if (p.room === danger.roomId) {
          // 销毁
          if (Math.random() < 0.4) {
            Evidence.aiDestroy(p.id, danger.id);
          }
        } else PlayerManager.moveToRoom(p.id, danger.roomId);
      } else tryRandomRoom(p);
    } else if (action === 'move_to_pickup_lens') {
      if (Math.random() < 0.05 && p.lens === 0) {
        p.lens = 1;
        triggerJuice('juice_lens_pickup', p.x, p.y);
      }
      tryRandomRoom(p);
    } else {
      tryRandomRoom(p);
    }
  }

  function doKillerFrame(killer) {
    // 选要陷害的目标: 对自己suspicion最高的玩家
    const target = topSuspicionAgainst(killer.id);
    if (target === null) return;
    // 选伪造类别(只能用可伪造的)
    const cats = ['weapon', 'motive_doc', 'movement_log', 'fingerprint'];
    const cat = Utils.pick(cats);
    Evidence.aiPlaceFrame(killer.id, killer.room, cat, target);
  }

  function topSuspicion(p) {
    let best = -Infinity, id = null;
    for (const [k, v] of Object.entries(p.suspicion || {})) {
      if (v > best) { best = v; id = parseInt(k, 10); }
    }
    return best > 30 ? id : null;
  }

  function topSuspicionAgainst(myId) {
    // 全员对myId的suspicion均值
    const players = PlayerManager.getAlive().filter(p => p.id !== myId);
    let best = -Infinity, id = null;
    for (const p of players) {
      const sus = p.suspicion?.[myId] || 0;
      if (sus > best) { best = sus; id = p.id; }
    }
    return id;
  }

  function tryEnterAndSearch(p, roomId) {
    if (p.room === roomId) {
      // 找一个可搜的家具:优先走到尚未被任何人搜过的家具旁边
      const furniture = MapSystem.getFurnitureInRoom(roomId);
      const candidates = furniture.filter(f => {
        if (f.evidence_slot === undefined) return false;
        const ev = Evidence.getInRoomSlot(roomId, f.evidence_slot);
        return ev && ev.searchedBy.size === 0;
      });
      if (candidates.length === 0) { tryRandomRoom(p); return; }
      const target = Utils.pick(candidates);
      const dx = p.x - target.cx, dy = p.y - target.cy;
      if (dx * dx + dy * dy < 50 * 50) {
        // 已在范围内,开始搜
        if (!p.searching) {
          p.searching = {roomId, slotIndex: target.evidence_slot, progress: 0};
          triggerJuice('juice_search_start', p.x, p.y);
        }
      } else {
        // 走到家具旁
        p.targetX = target.cx;
        p.targetY = target.cy;
        p.pathWaypoints = [{x: target.cx, y: target.cy}];
      }
    } else {
      PlayerManager.moveToRoom(p.id, roomId);
    }
  }

  function tryRandomRoom(p) {
    const rooms = cfg('map.room_ids', []);
    const target = Utils.pick(rooms);
    if (p.room !== target) PlayerManager.moveToRoom(p.id, target);
  }

  // === Trial AI 行动 ===
  function aiTrialAction(p) {
    const beh = (p.role === 'killer'
      ? DATA.ai_behaviors?.behaviors?.killer_forger
      : DATA.ai_behaviors?.behaviors?.[p.personality]) || {};
    const ts = beh.trial_strategy || {};
    const action = Utils.weightedPick(ts);
    if (p.role === 'killer') {
      // 凶手: 出示对侦探不利的证据/转移视线
      // 优先使用lens说谎(若持有)
      if (p.lens > 0 && Math.random() < 0.6) {
        const dangerous = p.evidence_book.find(e => e.accusedPlayerId === p.id && e.alwaysReal);
        if (dangerous) {
          Evidence.aiUseLens(p.id, dangerous.id, true); // 谎称真证据是伪
          return;
        }
      }
      // 出示一条假证据指控某侦探
      const fakeEv = p.evidence_book.find(e => e.placedBy === p.id);
      if (fakeEv) {
        Bus.emit('player_present_evidence', {presenterId: p.id, evidenceId: fakeEv.id, accusedId: fakeEv.accusedPlayerId});
        return;
      }
      // 否则随便出示一条指向非自己的
      const decoy = p.evidence_book.find(e => e.accusedPlayerId !== p.id);
      if (decoy) Bus.emit('player_present_evidence', {presenterId: p.id, evidenceId: decoy.id, accusedId: decoy.accusedPlayerId});
      return;
    }
    // 侦探:
    if (action === 'present_strongest_real_evidence' || action === 'accuse_based_on_vibes') {
      // 出示得分最高的证据
      let best = null, score = -Infinity;
      for (const ev of p.evidence_book) {
        const w = (ev.alwaysReal ? 1.5 : 1.0) * (ev.mark === 'real' ? 1.5 : ev.mark === 'fake' ? 0 : 1.0);
        const s = ev.pointsReal * w;
        if (s > score) { score = s; best = ev; }
      }
      if (best) {
        Bus.emit('player_present_evidence', {presenterId: p.id, evidenceId: best.id, accusedId: best.accusedPlayerId});
      }
      // 用lens
      if (p.lens > 0 && Math.random() < 0.4) {
        // 优先验证 unknown 的证据
        const target = p.evidence_book.find(e => e.mark === 'unknown' && !e.alwaysReal);
        if (target) Evidence.aiUseLens(p.id, target.id, false);
      }
    } else if (action === 'accuse_quiet_player') {
      // 简化: 出示对最低互动玩家不利的证据
      const target = topSuspicion(p);
      if (target !== null) {
        const ev = p.evidence_book.find(e => e.accusedPlayerId === target);
        if (ev) Bus.emit('player_present_evidence', {presenterId: p.id, evidenceId: ev.id, accusedId: target});
      }
    } else if (action === 'defend_ally' || action === 'defend_ally_strongly' || action === 'defend_no_one' || action === 'defend_accused_ally') {
      // 简化: 出示一条能洗白的证据
      const wash = p.evidence_book.find(e => e.alwaysReal && e.accusedPlayerId !== p.id);
      if (wash) Bus.emit('player_present_evidence', {presenterId: p.id, evidenceId: wash.id, accusedId: wash.accusedPlayerId});
    }
  }

  // === Voting AI ===
  function aiVote(p) {
    if (p.role === 'killer') {
      // 凶手: 投suspicion最低的侦探(打偏好者)or 投表现最强的侦探(转移)
      const targets = PlayerManager.getAlive().filter(q => q.id !== p.id);
      // 判断: 若有人指向自己很强,投他
      let dangerVoter = null, danger = -Infinity;
      for (const t of targets) {
        const sus = t.suspicion?.[p.id] || 0;
        if (sus > danger) { danger = sus; dangerVoter = t.id; }
      }
      if (danger > 50) return dangerVoter;
      // 否则随便投一个
      return Utils.pick(targets).id;
    }
    // 侦探
    const beh = DATA.ai_behaviors?.behaviors?.[p.personality] || {};
    const threshold = beh.vote_threshold_pct || 50;
    const abstainWhenUncertain = beh.abstain_when_uncertain;
    let best = -Infinity, target = null;
    for (const [k, v] of Object.entries(p.suspicion || {})) {
      const id = parseInt(k, 10);
      const t = PlayerManager.getPlayer(id);
      if (!t || !t.alive || id === p.id) continue;
      if (v > best) { best = v; target = id; }
    }
    if (best >= threshold) return target;
    if (abstainWhenUncertain) return 'abstain';
    return target !== null ? target : 'abstain';
  }

  // === suspicion 更新 ===
  function absorbEvidence(ev, accusedId) {
    // 让所有AI侦探更新对accusedId的suspicion
    for (const p of PlayerManager.getAll()) {
      if (!p.alive || p.isHuman) continue;
      absorbEvidenceForPlayer(p, ev, accusedId);
    }
  }
  function absorbEvidenceForPlayer(p, ev, accusedId) {
    if (accusedId === p.id) return; // 不会怀疑自己(凶手AI除外)
    const belief = ev.mark === 'real' ? 1.0
                 : ev.mark === 'fake' ? 0.0
                 : ev.alwaysReal ? 1.5 : 0.6;
    const delta = (ev.pointsReal || 30) * belief * 0.3;
    p.suspicion[accusedId] = Utils.clamp((p.suspicion[accusedId] || 0) + delta, 0, 100);
  }

  function endRoundDecay() {
    const decay = cfg('ai.suspicion_decay_per_round', 10);
    for (const p of PlayerManager.getAll()) {
      for (const k of Object.keys(p.suspicion || {})) {
        p.suspicion[k] = Math.max(0, p.suspicion[k] - decay);
      }
    }
  }

  return {init, update, aiTrialAction, aiVote, absorbEvidence, endRoundDecay};
})();
