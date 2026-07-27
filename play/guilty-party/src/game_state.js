// ═══ game_state.js — 流程状态机 ═══
const GameStateMachine = (() => {
  let phase = 'idle'; // idle | investigate | trial | voting | intermission | game_over
  let round = 0;
  let timer = 0;
  let phaseDuration = 0;
  let currentCaseId = null;
  let isOver = false;
  let lensSpawnedThisRound = false;

  function init() {
    bindBus();
  }
  function bindBus() {
    Bus.on('start_game', ({caseId}) => loadCase(caseId));
    Bus.on('killer_caught', () => {
      if (isOver) return;
      isOver = true;
      finish('detectives', 'killer_caught');
    });
    Bus.on('detectives_outnumbered', () => {
      if (isOver) return;
      isOver = true;
      finish('killer', 'outnumbered');
    });
  }

  function loadCase(caseId) {
    currentCaseId = caseId;
    round = 0;
    isOver = false;
    Bus.emit('case_loaded', {caseId});
    nextRound();
  }

  function nextRound() {
    if (isOver) return;
    round++;
    if (round > cfg('session.rounds', 3)) {
      // 凶手存活到第3回合后→killer wins
      isOver = true;
      finish('killer', 'survived_all_rounds');
      return;
    }
    Bus.emit('round_started', {round});
    triggerJuice('juice_round_start');
    UI.showToast(t('popup.round_banner', {n: round}));
    lensSpawnedThisRound = false;
    setPhase('investigate', cfg('session.investigate_seconds', 180));
  }

  function setPhase(newPhase, duration) {
    phase = newPhase;
    phaseDuration = duration;
    timer = duration;
    Bus.emit('phase_changed', {newPhase, round, secondsLeft: duration});
  }

  function update(dt) {
    if (isOver || phase === 'idle') return;
    timer -= dt;
    // 在investigate阶段:回合中部生成放大镜
    // 放大镜不再随机刷新 — 仅侦探起手 1 个
    if (timer <= 0) {
      timer = 0;
      advancePhase();
    }
  }

  function advancePhase() {
    if (phase === 'investigate') {
      setPhase('trial', cfg('session.trial_seconds', 120));
    } else if (phase === 'trial') {
      setPhase('voting', cfg('session.voting_seconds', 30));
    } else if (phase === 'voting') {
      Voting.resolve();
      // 等待resolve事件,再决定继续/终局
      setTimeout(() => {
        if (isOver) return;
        AISystem.endRoundDecay();
        nextRound();
      }, 1500);
      setPhase('intermission', 1.5);
    } else if (phase === 'intermission') {
      // handled by setTimeout above
    }
  }

  function finish(winner, reason) {
    setPhase('game_over', 0);
    Bus.emit('game_over', {winner, reason, caseId: currentCaseId});
  }

  function getPhase() { return phase; }
  function getRound() { return round; }
  function getSecondsLeft() { return Math.max(0, timer); }
  function isGameOver() { return isOver; }

  function getCurrentCaseId() { return currentCaseId; }
  return {init, update, getPhase, getRound, getSecondsLeft, isGameOver, loadCase, getCurrentCaseId};
})();
