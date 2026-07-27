// ═══ main.js · 游戏循环入口 (three.js 3D) ═══

let _lastT = 0;
let _accumulator = 0;
let _hitStopUntil = 0;
let _slowmoUntil = 0;
let _slowmoScale = 1.0;
let _paused = false;
let _timeScale = 1.0;  // 1.0 / 2.0 / 4.0 (快进)

async function start() {
  await loadAllData();
  // 初始化系统
  GameState.init();
  RenderSys.init();
  InputSys.init(document.getElementById('ui'));
  EntitySys.init();
  PhysicsSys.init();
  CombatSys.init();
  ZoneSys.init();
  AISys.init();
  EconomySys.init();
  UISys.init();
  AudioSys.init();
  TutorialSys.init();
  if (typeof ReplaySys !== 'undefined') ReplaySys.init();

  emit('game_state_changed', { from: 'LOADING', to: 'MENU' });
  // 系统初始化顺序导致的事件错过 → 主动同步一次
  emit('unlock_list_changed', { entities: EconomySys.getUnlocked() });
  _lastT = performance.now();
  requestAnimationFrame(loop);
}

function hitStop(ms) { _hitStopUntil = Math.max(_hitStopUntil, now() + ms); }
function slowMotion(scale, ms) { _slowmoUntil = Math.max(_slowmoUntil, now() + ms); _slowmoScale = scale; }
window.hitStop = hitStop; window.slowMotion = slowMotion;

function loop(t) {
  let rawDt = Math.min((t - _lastT) / 1000, 0.1);
  _lastT = t;

  const nowMs = now();
  let dt = rawDt;
  if (_paused) dt = 0;
  else {
    if (nowMs < _hitStopUntil) dt = 0;
    else if (nowMs < _slowmoUntil) dt *= _slowmoScale;
    dt *= _timeScale;
  }

  _accumulator += dt;
  const fixedDt = cfg('render.fixed_dt_ms', 16.67) / 1000;
  const maxSteps = _timeScale > 1.5 ? 8 : 5;
  let steps = 0;
  while (_accumulator >= fixedDt && steps < maxSteps) {
    fixedUpdate(fixedDt);
    _accumulator -= fixedDt;
    steps++;
  }
  if (steps >= maxSteps) _accumulator = 0;

  variableUpdate(rawDt);  // 视觉用真实 dt 不被快进影响
  render();
  requestAnimationFrame(loop);
}

function setPaused(p) { _paused = p; }
function isPaused() { return _paused; }
function setTimeScale(s) { _timeScale = s; }
function getTimeScale() { return _timeScale; }
window.setPaused = setPaused; window.isPaused = isPaused;
window.setTimeScale = setTimeScale; window.getTimeScale = getTimeScale;

// ─── Per-system dt profiler (iter-4) ────────────────────────────────────
// EWMA-smoothed cost in ms for each updater. Active only when the
// PROFILE flag is on: `window.toggleProfiler()` to switch, or set
// `localStorage.tabs_profile = '1'` to start enabled.
const _profile = {
  enabled: localStorage.getItem('tabs_profile') === '1',
  budgetMs: 4.0,       // warn threshold per system
  alpha: 0.08,         // EWMA smoothing
  totalFrameMs: 0,
  systems: Object.create(null),
  lastWarnAt: Object.create(null),
};
function _profStep(name, fn) {
  if (!_profile.enabled) { fn(); return; }
  const t0 = performance.now();
  fn();
  const ms = performance.now() - t0;
  const s = _profile.systems[name] || (_profile.systems[name] = { ewma: 0, last: 0, peak: 0 });
  s.last = ms;
  s.ewma = s.ewma === 0 ? ms : (s.ewma + (ms - s.ewma) * _profile.alpha);
  if (ms > s.peak) s.peak = ms;
  _profile.totalFrameMs += ms;
  if (ms > _profile.budgetMs) {
    const last = _profile.lastWarnAt[name] || 0;
    if (performance.now() - last > 5000) {
      _profile.lastWarnAt[name] = performance.now();
      console.warn(`[profile] ${name} ${ms.toFixed(2)}ms > ${_profile.budgetMs}ms budget`);
    }
  }
}
function profileSummary() {
  if (!_profile.enabled) return { enabled: false, hint: 'call toggleProfiler() to enable' };
  const out = { enabled: true, budgetMs: _profile.budgetMs, systems: {} };
  for (const k of Object.keys(_profile.systems)) {
    const s = _profile.systems[k];
    out.systems[k] = { ewma: +s.ewma.toFixed(2), last: +s.last.toFixed(2), peak: +s.peak.toFixed(2) };
  }
  return out;
}
function toggleProfiler(on) {
  _profile.enabled = (on === undefined) ? !_profile.enabled : !!on;
  localStorage.setItem('tabs_profile', _profile.enabled ? '1' : '0');
  // reset stats when toggled
  _profile.systems = Object.create(null);
  _profile.totalFrameMs = 0;
  console.log(`[profile] ${_profile.enabled ? 'ON' : 'OFF'}`);
  return _profile.enabled;
}
window.profileSummary = profileSummary;
window.toggleProfiler = toggleProfiler;

function fixedUpdate(dt) {
  _profStep('GameState', () => GameState.update(dt));
  _profStep('AI',        () => AISys.update(dt));
  _profStep('Physics',   () => PhysicsSys.update(dt));
  _profStep('Combat',    () => CombatSys.update(dt));
  _profStep('Entity',    () => EntitySys.update(dt));
}

function variableUpdate(dt) {
  _profStep('UI.update',     () => UISys.update(dt));
  _profStep('particles',     () => RenderSys.updateParticles(dt));
  _profStep('syncMeshes',    () => RenderSys.syncMeshes(dt));
  _profStep('Tutorial',      () => TutorialSys.update(dt));
  if (typeof ReplaySys !== 'undefined') _profStep('Replay', () => ReplaySys.update(dt));
}

function render() {
  _profStep('Render3D',  () => RenderSys.render());
  _profStep('UI.render', () => UISys.render(RenderSys.getUICtx()));
  // reset per-frame total at the very END so summary reads frame-N's total
  if (_profile.enabled) _profile.totalFrameMs = 0;
}

const _STATES_IN_GAME = 'IN_GAME';
const _STATES_GAME_OVER = 'GAME_OVER';

window.addEventListener('DOMContentLoaded', start);
