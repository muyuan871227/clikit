// ═══ Tutorial 系统 · 首次 level_01 3 步引导 ═══
const TutorialSys = (() => {
  let active = false;
  let stepIdx = 0;
  let completed = false;
  const STORAGE_KEY = 'tabs_tutorial_done';

  function init() {
    completed = localStorage.getItem(STORAGE_KEY) === '1';

    on('plan_phase_started', ({ level_id }) => {
      if (level_id === 'level_01' && !completed) {
        active = true; stepIdx = 0;
        showStep(0);
      }
    });
    on('spawn_request', ({ team }) => {
      if (active && stepIdx === 0 && team === 'ally') {
        emit('tutorial_hide', {});
        setTimeout(() => { stepIdx = 1; showStep(1); }, 1500);
      }
    });
    on('battle_phase_started', () => {
      if (active && stepIdx === 1) {
        emit('tutorial_hide', {});
        stepIdx = 2;
        // step_3 只显示 2 秒然后自动消失, 不阻塞视线
        showStep(2);
        setTimeout(() => { emit('tutorial_hide', {}); }, 2500);
      }
    });
    on('entity_destroyed', ({ target }) => {
      if (active && stepIdx === 2 && target.team === 'enemy') {
        emit('tutorial_hide', {});
        completeTut();
      }
    });
    on('level_won', () => { if (active) { emit('tutorial_hide', {}); completeTut(); } });
    on('level_lost', () => { if (active) { emit('tutorial_hide', {}); } });
    on('game_state_changed', ({ to }) => {
      if (to === 'MENU' || to === 'LEVEL_SELECT') emit('tutorial_hide', {});
    });
  }

  function showStep(i) {
    const prompts = ['tut.drag_pikeman', 'tut.press_start', 'tut.watch_battle'];
    emit('tutorial_show', { step_id: 'step_' + i, prompt: t(prompts[i]) });
  }

  function completeTut() {
    active = false; completed = true;
    localStorage.setItem(STORAGE_KEY, '1');
    emit('tutorial_completed', {});
  }

  function update(dt) { /* step timeout handled via delays */ }

  return { init, update };
})();
window.TutorialSys = TutorialSys;
