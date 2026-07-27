// ═══ trial_system.js — 审判+发言+出示证据 ═══
const Trial = (() => {
  let active = false;
  let presentedEvidence = []; // [{presenterId, evidence, accusedId, time}]
  let speeches = []; // [{playerId, text, time}]
  let currentSpeakerIdx = 0;
  let speakerTimer = 0;
  let speakerSeconds = 20;

  function init() {
    bindBus();
  }
  function bindBus() {
    Bus.on('phase_changed', ({newPhase}) => {
      if (newPhase === 'trial') start();
      else active = false;
    });
    Bus.on('player_present_evidence', ({presenterId, evidenceId, accusedId}) => {
      const ev = Evidence.getById(evidenceId);
      if (!ev) return;
      presentedEvidence.push({presenterId, evidence: ev, accusedId, time: performance.now()});
      const presenter = PlayerManager.getPlayer(presenterId);
      const accused = PlayerManager.getPlayer(accusedId);
      addSpeech(presenterId, t('ai.speech.evidence', {name: presenter.name, evidence: t('evidence.' + ev.category + '.reveal')}) + ` → ${accused?.name}`);
      Bus.emit('evidence_presented', {presenterId, evidenceId, accusedId});
      // suspicion update
      AISystem.absorbEvidence(ev, accusedId);
    });
  }

  function start() {
    active = true;
    presentedEvidence = [];
    speeches = [];
    currentSpeakerIdx = 0;
    speakerTimer = 0;
    const alive = PlayerManager.getAlive();
    speakerSeconds = (cfg('session.trial_seconds', 120) - 10) / Math.max(1, alive.length); // -10s buffer
    triggerJuice('juice_trial_begin');
    Bus.emit('trial_started', {alive});
    nextSpeaker(true);
  }

  function nextSpeaker(first = false) {
    const alive = PlayerManager.getAlive();
    if (alive.length === 0) return;
    if (!first) currentSpeakerIdx++;
    if (currentSpeakerIdx >= alive.length) { currentSpeakerIdx = 0; }
    speakerTimer = 0;
    Bus.emit('speech_turn', {playerId: alive[currentSpeakerIdx].id, secondsAllotted: speakerSeconds});
    // AI自动发言
    const speaker = alive[currentSpeakerIdx];
    if (!speaker.isHuman) {
      // AI在第3秒做出动作
      setTimeout(() => {
        if (!active) return;
        const aliveNow = PlayerManager.getAlive();
        if (aliveNow[currentSpeakerIdx] === speaker) {
          AISystem.aiTrialAction(speaker);
        }
      }, 800 + Math.random() * 1500);
    }
  }

  function addSpeech(playerId, text) {
    speeches.push({playerId, text, time: performance.now()});
    if (speeches.length > 30) speeches.shift();
  }

  function update(dt, currentPhase) {
    if (!active || currentPhase !== 'trial') return;
    speakerTimer += dt;
    if (speakerTimer >= speakerSeconds) nextSpeaker();
  }

  function getCurrentSpeaker() {
    const alive = PlayerManager.getAlive();
    return alive[currentSpeakerIdx];
  }
  function getSpeeches() { return speeches; }
  function getPresentedEvidence() { return presentedEvidence; }

  return {init, update, addSpeech, getCurrentSpeaker, getSpeeches, getPresentedEvidence};
})();
