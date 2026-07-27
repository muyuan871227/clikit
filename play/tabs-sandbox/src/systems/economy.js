// ═══ Economy 系统 · 金币预算 + 扣款 + 解锁 ═══
const EconomySys = (() => {
  let currentGold = 0;
  let currentBudget = 0;
  let deployCount = {};
  let unlocked = ['pikeman'];
  let highestCleared = 0;
  let currentLevelId = null;

  function init() {
    // 读存档
    const save = loadSave();
    if (save) {
      highestCleared = save.highest_cleared || 0;
      unlocked = save.unlocked || ['pikeman'];
    }

    on('plan_phase_started', ({ level_id, budget }) => {
      currentLevelId = level_id;
      currentBudget = budget;
      currentGold = budget;
      deployCount = {};
      emit('gold_changed', { current: currentGold, delta: 0 });
    });

    on('deploy_request', handleDeploy);
    on('remove_request', handleRemove);

    on('level_won', ({ level_id }) => {
      const m = /level_(\d+)/.exec(level_id);
      if (m) {
        const n = parseInt(m[1], 10);
        if (n > highestCleared) highestCleared = n;
      }
    });

    on('unlock_granted', ({ entity_name }) => {
      if (!unlocked.includes(entity_name)) {
        unlocked.push(entity_name);
        emit('unlock_list_changed', { entities: [...unlocked] });
      }
      saveGame();
    });

    emit('unlock_list_changed', { entities: [...unlocked] });
  }

  function handleDeploy({ type, x, y, team }) {
    const tpl = getEntityTemplate(type);
    if (!tpl) return;
    const cost = tpl.cost_gold || 0;
    const capSame = cfg('caps.max_units_same_type', 30);
    const capTotal = cfg('caps.max_total_units_per_side', 40);
    const isSandbox = currentLevelId === 'sandbox';
    const finalTeam = team || 'ally';

    if (!isSandbox) {
      // 主线: 只能 ally, 受金币和上限限制
      if (currentGold < cost) { emit('deploy_denied', { reason: 'no_gold', type }); return; }
      const total = Object.values(deployCount).reduce((a, b) => a + b, 0);
      if ((deployCount[type] || 0) >= capSame) { emit('deploy_denied', { reason: 'cap_reached', type }); return; }
      if (total >= capTotal) { emit('deploy_denied', { reason: 'cap_reached', type }); return; }
      currentGold -= cost;
      deployCount[type] = (deployCount[type] || 0) + 1;
      emit('gold_changed', { current: currentGold, delta: -cost });
      emit('spawn_request', { type, x, y, team: 'ally' });
    } else {
      // 沙盒: 自由部署双方, 不消耗金币, 只受同类上限保护(防卡帧)
      const sandboxCap = 60; // 沙盒每方每兵种上限放宽
      const key = finalTeam + ':' + type;
      if ((deployCount[key] || 0) >= sandboxCap) { emit('deploy_denied', { reason: 'cap_reached', type }); return; }
      deployCount[key] = (deployCount[key] || 0) + 1;
      // 显示用聚合数量
      deployCount[type] = (deployCount[type] || 0) + 1;
      emit('spawn_request', { type, x, y, team: finalTeam });
    }
  }

  function handleRemove({ entity_id }) {
    if (GameState.getState() !== 'PLAN') return;
    const e = EntitySys.findById(entity_id);
    if (!e) return;
    const isSandbox = currentLevelId === 'sandbox';
    if (!isSandbox && e.team !== 'ally') return;  // 主线不让移除敌方
    const cost = e.cost_gold || 0;
    if (!isSandbox) currentGold += cost;
    if (deployCount[e.name]) deployCount[e.name]--;
    if (isSandbox) {
      const k = e.team + ':' + e.name;
      if (deployCount[k]) deployCount[k]--;
    }
    emit('gold_changed', { current: currentGold, delta: cost });
  }

  function saveGame() {
    saveData({ highest_cleared: highestCleared, unlocked: [...unlocked] });
  }

  function getGold() { return currentGold; }
  function getBudget() { return currentBudget; }
  function getUnlocked() { return [...unlocked]; }
  function getHighestCleared() { return highestCleared; }
  function getDeployCount(type) { return deployCount[type] || 0; }

  return { init, getGold, getBudget, getUnlocked, getHighestCleared, getDeployCount, saveGame };
})();
window.EconomySys = EconomySys;
