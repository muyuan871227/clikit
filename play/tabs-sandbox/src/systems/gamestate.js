// ═══ GameState 系统 · 状态机 ═══
const GameState = (() => {
  let state = 'LOADING';
  let currentLevelId = null;
  let phaseTimer = 0;
  let phaseTimeEmitAt = 0;
  let emittedAllEnemiesDead = false;
  let emittedAllAlliesDead = false;
  let overtimeActive = false;

  function init() {
    on('game_state_changed', ({ to }) => { if (to === 'MENU') { _reset(); } });
    on('level_selected', ({ level_id }) => { enterPlan(level_id); });
    on('player_request_start', () => { if (state === 'PLAN') enterBattle(); });
    on('player_request_reset', () => { if (state === 'PLAN') enterPlan(currentLevelId); else if (state === 'BATTLE') transition('RESULT_LOSS'); });
    on('all_enemies_dead', () => {
      if (state !== 'BATTLE') return;
      if (currentLevelId === 'sandbox') { endSandbox('blue'); return; }
      winLevel();
    });
    on('all_allies_dead', () => {
      if (state !== 'BATTLE') return;
      if (currentLevelId === 'sandbox') { endSandbox('red'); return; }
      loseLevel();
    });
    on('menu_select', ({ option }) => { handleMenu(option); });
  }

  function _reset() {
    state = 'MENU';
    currentLevelId = null;
    phaseTimer = 0;
    overtimeActive = false;
  }

  function transition(to) {
    const from = state; state = to;
    emit('game_state_changed', { from, to });
  }

  function handleMenu(option) {
    if (option === 'start') transition('LEVEL_SELECT');
    else if (option === 'sandbox') { enterPlan('sandbox'); }
    else if (option === 'continue') {
      const save = loadSave();
      const nextLv = save ? Math.min((save.highest_cleared || 0) + 1, 20) : 1;
      transition('LEVEL_SELECT');
    }
    else if (option === 'back_to_menu') transition('MENU');
    else if (option === 'back_to_select') transition('LEVEL_SELECT');
    else if (option === 'replay') enterPlan(currentLevelId);
    else if (option === 'sandbox_replay') {
      // 沙盒重玩: 清除单位 + 回到 PLAN
      EntitySys.getAllies().slice().forEach(e => emit('remove_request', { entity_id: e.id }));
      EntitySys.getEnemies().slice().forEach(e => emit('remove_request', { entity_id: e.id }));
      enterPlan('sandbox');
    }
    else if (option === 'sandbox_pick_map') {
      // 回到地图选择 (清空已部署单位)
      EntitySys.getAllies().slice().forEach(e => emit('remove_request', { entity_id: e.id }));
      EntitySys.getEnemies().slice().forEach(e => emit('remove_request', { entity_id: e.id }));
      window._sandboxMapPicked = false;
      enterPlan('sandbox');
    }
    else if (option === 'next') {
      const n = _levelNum(currentLevelId);
      if (n && n < 20) enterPlan(`level_${String(n+1).padStart(2, '0')}`);
      else transition('LEVEL_SELECT');
    }
  }

  function _levelNum(id) {
    const m = /level_(\d+)/.exec(id || '');
    return m ? parseInt(m[1], 10) : null;
  }

  function enterPlan(levelId) {
    if (state === 'PLAN' && currentLevelId === levelId) { /* 重玩: 清空继续 */ }
    currentLevelId = levelId;
    emittedAllAlliesDead = false;
    emittedAllEnemiesDead = false;
    overtimeActive = false;
    const num = _levelNum(levelId) || 0;
    const budget = (levelId === 'sandbox') ? 9999 :
      cfg('player.start_gold', 250) + num * cfg('player.gold_per_level', 30);
    transition('PLAN');
    // Zone 监听 level_enter (新事件) 避免和 UI 的 level_selected 循环
    emit('level_enter', { level_id: levelId });
    emit('plan_phase_started', { level_id: levelId, budget });
    phaseTimer = cfg('session.plan_phase_s', 30);
    phaseTimeEmitAt = Math.ceil(phaseTimer);
  }

  let _initialAllyCount = 0;
  function enterBattle() {
    transition('BATTLE');
    _initialAllyCount = EntitySys.getAllies().length;
    emit('battle_phase_started', {});
    phaseTimer = cfg('session.battle_phase_s', 60);
    phaseTimeEmitAt = Math.ceil(phaseTimer);
    overtimeActive = false;
    emittedAllAlliesDead = false;
    emittedAllEnemiesDead = false;
  }

  function winLevel() {
    if (state !== 'BATTLE') return;
    const info = {
      level_id: currentLevelId,
      ally_remain: EntitySys.getAllies().length,
      initial: _initialAllyCount,
      total_deaths: _initialAllyCount - EntitySys.getAllies().length
    };
    transition('RESULT_WIN');
    emit('level_won', info);
  }

  function loseLevel() {
    if (state !== 'BATTLE') return;
    transition('RESULT_LOSS');
    emit('level_lost', { level_id: currentLevelId });
  }

  function endSandbox(winner) {
    if (state !== 'BATTLE') return;
    const ally = EntitySys.getAllies().length;
    const enemy = EntitySys.getEnemies().length;
    transition('RESULT_SANDBOX');
    emit('sandbox_ended', { winner, ally_remain: ally, enemy_remain: enemy });
  }

  function update(dt) {
    const isSandbox = currentLevelId === 'sandbox';
    if (state === 'PLAN') {
      // 沙盒不计时
      if (isSandbox) return;
      phaseTimer -= dt;
      const secs = Math.max(0, Math.ceil(phaseTimer));
      if (secs !== phaseTimeEmitAt) { phaseTimeEmitAt = secs; emit('tick_remaining_s', { phase: 'plan', seconds_left: secs }); }
      if (phaseTimer <= 0) enterBattle();
    } else if (state === 'BATTLE') {
      if (isSandbox) {
        // 沙盒战斗无超时, 但仍触发胜负 emit
        return;
      }
      phaseTimer -= dt;
      const secs = Math.max(0, Math.ceil(phaseTimer));
      if (secs !== phaseTimeEmitAt) { phaseTimeEmitAt = secs; emit('tick_remaining_s', { phase: 'battle', seconds_left: secs }); }
      if (phaseTimer <= 0) {
        if (!overtimeActive) { overtimeActive = true; phaseTimer = cfg('session.overtime_s', 10); }
        else {
          const a = EntitySys.getAllies().length, e = EntitySys.getEnemies().length;
          if (a > e || a === e) winLevel(); else loseLevel();
        }
      }
    }
  }

  function getState() { return state; }
  function getCurrentLevelId() { return currentLevelId; }
  function getPhaseTimer() { return phaseTimer; }

  return { init, update, transition, getState, getCurrentLevelId, getPhaseTimer };
})();
window.GameState = GameState;
