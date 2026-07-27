// ═══ engine.js · Reusable 3D Game Kernel ═══
//
// This file contains the GENRE-AGNOSTIC core of the TABS architecture:
//   - Event bus (on / off / emit)
//   - 2D arena ↔ 3D world coordinate system (SCALE, w())
//   - Math helpers (clamp, dist, dist2, lerp, lerpColor, easeOut, easeInOut)
//   - Time helpers (now)
//   - Deterministic RNG (setSeed, rng, rngInt, rngFloat)
//   - Tiny string-hash (hashStr) — useful for level seeds
//   - Generic localStorage save helpers (Engine.saveJSON / loadJSON)
//
// NOT in here (because they're TABS-specific):
//   - DATA store + config loading       → game_data.js
//   - cfg() / t() / getEntityTemplate() → game_data.js
//   - SAVE_KEY                          → game_data.js (TABS-specific)
//
// Other 3D games can `<script src="engine.js">` and immediately have access to
// all the foundations. game_data.js then layers TABS-specific data on top.
//
// Update this file ONLY for genre-agnostic primitives. If it's TABS-shaped,
// put it elsewhere.

(function (root) {
  'use strict';

  // ─── Event Bus ────────────────────────────────────────────────────
  const _listeners = {};
  function on(event, handler) { (_listeners[event] ||= []).push(handler); }
  function off(event, handler) {
    const arr = _listeners[event]; if (!arr) return;
    const i = arr.indexOf(handler); if (i >= 0) arr.splice(i, 1);
  }
  function emit(event, payload) {
    const arr = _listeners[event]; if (!arr) return;
    // Snapshot list so a handler that calls off()/on() during dispatch
    // doesn't corrupt the iteration.
    const handlers = arr.slice();
    for (const h of handlers) {
      try { h(payload); } catch (e) { console.error(`[event:${event}]`, e); }
    }
  }
  function listenerCount(event) { return (_listeners[event] || []).length; }

  // ─── Coordinate System ────────────────────────────────────────────
  // Arena = 2D logical space (game uses this everywhere for path, AI, collide)
  // World = 3D Three.js space; arena.y maps to world.z, world.y is height.
  const SCALE = 0.04;                  // 1 arena px = 0.04 world units
  let arenaW = 960, arenaH = 540;       // defaults; can be overridden via setArena()
  function setArena(w, h) { arenaW = w; arenaH = h; }
  function w3(x, y, h = 0) {
    // Three.js may not be loaded yet (engine is genre-agnostic); return
    // a {x,y,z} object that's compatible with `THREE.Vector3.copy()`.
    return (typeof THREE !== 'undefined')
      ? new THREE.Vector3((x - arenaW / 2) * SCALE, h, (y - arenaH / 2) * SCALE)
      : { x: (x - arenaW / 2) * SCALE, y: h, z: (y - arenaH / 2) * SCALE };
  }
  function worldToArena(worldX, worldZ) {
    return { x: worldX / SCALE + arenaW / 2, y: worldZ / SCALE + arenaH / 2 };
  }

  // ─── Math ────────────────────────────────────────────────────────
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function dist(ax, ay, bx, by) {
    const dx = ax - bx, dy = ay - by; return Math.sqrt(dx*dx + dy*dy);
  }
  function dist2(ax, ay, bx, by) {
    const dx = ax - bx, dy = ay - by; return dx*dx + dy*dy;
  }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeOut(t)    { t = clamp(t, 0, 1); return 1 - Math.pow(1 - t, 3); }
  function easeInOut(t)  { t = clamp(t, 0, 1); return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2; }
  function lerpColor(hexA, hexB, t) {
    // Both arguments should be 0xRRGGBB integers.
    const ar = (hexA >> 16) & 0xff, ag = (hexA >> 8) & 0xff, ab = hexA & 0xff;
    const br = (hexB >> 16) & 0xff, bg = (hexB >> 8) & 0xff, bb = hexB & 0xff;
    const r = Math.round(lerp(ar, br, t));
    const g = Math.round(lerp(ag, bg, t));
    const b = Math.round(lerp(ab, bb, t));
    return (r << 16) | (g << 8) | b;
  }

  // ─── Time ────────────────────────────────────────────────────────
  function now() { return performance.now(); }

  // ─── Deterministic RNG (linear congruential) ─────────────────────
  let _rngSeed = 1337;
  function setSeed(s) { _rngSeed = (s >>> 0) || 1; }
  function rngFloat() {
    _rngSeed = (_rngSeed * 1664525 + 1013904223) >>> 0;
    return _rngSeed / 4294967296;
  }
  function rng(min, max) { return min + (max - min) * rngFloat(); }
  function rngInt(min, max) { return Math.floor(rng(min, max + 1)); }

  // ─── Tiny string hash (deterministic seed from a string) ─────────
  function hashStr(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
    return h >>> 0;
  }

  // ─── Generic localStorage save (key passed in, no opinion on schema) ─
  function saveJSON(key, obj) {
    try { localStorage.setItem(key, JSON.stringify(obj)); return true; }
    catch (e) { console.warn(`[engine] save ${key} failed:`, e); return false; }
  }
  function loadJSON(key) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; }
    catch (e) { return null; }
  }

  // ─── iter-19: low-FX mode toggle (perf escape hatch) ─────────────
  // Disables expensive shadow maps in exchange for ~2ms/frame savings.
  // Set `localStorage.tabs_lowfx = '1'` before page load to enable.
  // Helpers below let game code toggle and check at runtime.
  function setLowFX(on) {
    localStorage.setItem('tabs_lowfx', on ? '1' : '0');
    console.log(`[engine] lowFX ${on ? 'ON' : 'OFF'} — reload page to apply`);
  }
  function isLowFX() {
    return localStorage.getItem('tabs_lowfx') === '1';
  }

  // ─── iter-13: DPR-aware UI canvas helper ─────────────────────────
  //
  // 2D HUD canvas needs to be sized at width*DPR / height*DPR (physical pixels)
  // and CSS-scaled back to width/height — otherwise text looks blurry on retina.
  // Call once after setting canvas.width/height in CSS px, then before draw scale ctx.
  //
  //   const c = document.getElementById('ui');
  //   Engine.setupHiDPICanvas(c, 1280, 720);
  //
  // The canvas internally renders at 1280*DPR × 720*DPR; ctx is auto-scaled so
  // your existing draw calls (`ctx.fillRect(0, 0, 1280, 720)`) keep working
  // unchanged but look sharp on retina.
  function setupHiDPICanvas(canvas, cssW, cssH) {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  }

  // ─── iter-11: optional GLTF escape hatch ────────────────────────
  //
  // Async loads a GLTFloader-readable URL and returns a THREE.Object3D
  // (or the fallback mesh if loading fails / GLTFLoader isn't available).
  //
  //   const player = await Engine.loadGltfModel('/assets/hero.glb', buildPikeman());
  //   scene.add(player);
  //
  // Caller's responsibility:
  //   - Ensure THREE.GLTFLoader is loaded BEFORE calling
  //     (add <script src="three/examples/js/loaders/GLTFLoader.js">)
  //   - Pass a fallback (primitive-built) mesh as 2nd arg for resilience
  //   - Don't depend on GLTF in a "default-on" path; this is an escape
  //     hatch for when an asset is actually available
  function loadGltfModel(url, fallback) {
    return new Promise((resolve) => {
      const Ctor = (typeof THREE !== 'undefined' && THREE.GLTFLoader);
      if (!Ctor) {
        console.warn('[engine] GLTFLoader not loaded — using fallback for', url);
        resolve(fallback || null);
        return;
      }
      try {
        const loader = new Ctor();
        loader.load(
          url,
          (gltf) => resolve(gltf.scene || fallback || null),
          undefined,
          (err) => {
            console.warn('[engine] GLTF load failed:', url, err);
            resolve(fallback || null);
          }
        );
      } catch (e) {
        console.warn('[engine] GLTF threw:', e);
        resolve(fallback || null);
      }
    });
  }

  // ─── Public API ──────────────────────────────────────────────────
  const Engine = {
    // event bus
    on, off, emit, listenerCount,
    // coords
    SCALE, get arenaW() { return arenaW; }, get arenaH() { return arenaH; },
    setArena, w: w3, worldToArena,
    // math
    clamp, dist, dist2, lerp, easeOut, easeInOut, lerpColor,
    // time / rng
    now, setSeed, rng, rngInt, rngFloat,
    // utils
    hashStr, saveJSON, loadJSON,
    // iter-11 / iter-13 / iter-19
    setupHiDPICanvas, loadGltfModel, setLowFX, isLowFX,
  };

  // Backward-compat: install as window globals (so existing code keeps working).
  // game_data.js / systems still call `emit()`, `on()`, `clamp()` etc unprefixed.
  root.Engine = Engine;
  root.on = on; root.off = off; root.emit = emit;
  root.now = now;
  root.setSeed = setSeed; root.rng = rng; root.rngInt = rngInt; root.rngFloat = rngFloat;
  root.clamp = clamp; root.dist = dist; root.dist2 = dist2;
  root.hashStr = hashStr;
})(window);
