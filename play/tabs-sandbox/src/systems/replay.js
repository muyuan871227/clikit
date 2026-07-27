// ═══ ReplaySys · record entity-state snapshots, scrub-replay last N seconds ═══
//
// Listens passively to engine events; doesn't change gameplay. Snapshots
// every ~6 frames (~100ms @ 60fps) to keep memory bounded. Ring buffer of
// ~300 snapshots = 30 seconds of history.
//
// API:
//   ReplaySys.init()         — start recording (call in main.start)
//   ReplaySys.start()        — explicitly resume (after stop)
//   ReplaySys.stop()         — pause recording
//   ReplaySys.clear()        — drop all frames
//   ReplaySys.length()       — # frames buffered
//   ReplaySys.frameAt(idx)   — read snapshot (0 = oldest, length-1 = newest)
//   ReplaySys.export()       — { frames, meta } for save/share
//   ReplaySys.applySnapshot(frame) — restore entity positions (visual only;
//                                    AI/physics not rewound)
//
// Console helpers (auto-installed):
//   replayDump(N=5)          — log last N frames as table
//   replayLastSecond()       — alias for frameAt(length()-10)
//
// Storage shape per frame:
//   { t: ms, e: [[id, x, y, hp, team], ...], p: [[x, y, ownerTeam], ...] }

const ReplaySys = (() => {
  const MAX_FRAMES = 300;      // ~30 seconds at 100ms cadence
  const SAMPLE_EVERY_MS = 100;
  const frames = [];           // ring buffer (oldest first); shift when full
  let recording = false;
  let lastSampleMs = 0;

  function init() {
    recording = true;
    // Listen for state changes to clear on game restart
    on('game_state_changed', ({ to }) => {
      if (to === 'PLAN' || to === 'MENU') { clear(); }
    });
  }

  function start()  { recording = true; }
  function stop()   { recording = false; }
  function clear()  { frames.length = 0; }
  function length_() { return frames.length; }
  function frameAt(idx) { return frames[idx] || null; }

  function update(_dt) {
    if (!recording) return;
    if (typeof EntitySys === 'undefined') return;
    const now = Engine.now();
    if (now - lastSampleMs < SAMPLE_EVERY_MS) return;
    lastSampleMs = now;
    // Collect minimal entity state — id/x/y/hp/team
    const allies = EntitySys.getAllies();
    const enemies = EntitySys.getEnemies();
    const e = [];
    for (const ent of allies)  e.push([ent.id, Math.round(ent.x), Math.round(ent.y), ent.current_hp | 0, 0]);
    for (const ent of enemies) e.push([ent.id, Math.round(ent.x), Math.round(ent.y), ent.current_hp | 0, 1]);
    // Projectiles (small set)
    const p = [];
    if (typeof CombatSys !== 'undefined' && CombatSys.getProjectiles) {
      for (const pr of CombatSys.getProjectiles()) {
        p.push([Math.round(pr.x), Math.round(pr.y), pr.team === 'ally' ? 0 : 1]);
      }
    }
    frames.push({ t: now, e, p });
    if (frames.length > MAX_FRAMES) frames.shift();
  }

  // Export the buffer as JSON-serializable, suitable for save / share
  function exportBuffer() {
    return {
      meta: { recordedAt: Date.now(), durationMs: frames.length * SAMPLE_EVERY_MS, frames: frames.length },
      frames: frames.slice()
    };
  }

  // Apply a snapshot to current scene (visual-only — won't rewind AI/Physics).
  // For real scrubbing UX, freeze game state first.
  function applySnapshot(frame) {
    if (!frame || typeof EntitySys === 'undefined') return false;
    const byId = new Map();
    for (const ent of EntitySys.getAll()) byId.set(ent.id, ent);
    for (const [id, x, y, hp] of frame.e) {
      const ent = byId.get(id);
      if (ent) {
        ent.x = x; ent.y = y;
        ent.current_hp = Math.max(0, hp);
      }
    }
    return true;
  }

  // Console helpers
  function replayDump(n = 5) {
    const start = Math.max(0, frames.length - n);
    console.table(frames.slice(start).map(f => ({
      t: Math.round(f.t),
      entities: f.e.length,
      projectiles: f.p.length
    })));
  }
  function replayLastSecond() { return frames[Math.max(0, frames.length - 10)] || null; }

  // Expose
  return { init, start, stop, clear, length: length_, frameAt, update,
           export: exportBuffer, applySnapshot };
})();

window.ReplaySys = ReplaySys;
window.replayDump = (n) => ReplaySys.length() > 0
  ? console.table(Array.from({length: Math.min(n||5, ReplaySys.length())}, (_, i) => {
      const f = ReplaySys.frameAt(ReplaySys.length() - 1 - i);
      return { t: Math.round(f.t), entities: f.e.length, projectiles: f.p.length };
    }).reverse())
  : console.log('no replay frames yet');
window.replayExport = () => ReplaySys.export();
