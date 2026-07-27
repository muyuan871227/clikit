// ═══ game_data.js · TABS-specific data store + helpers ═══
//
// Generic kernel (event bus, SCALE, math, RNG, hashStr) lives in engine.js
// and is loaded BEFORE this file. Re-exported as window globals from there.
//
// This file owns ONLY TABS-specific concerns:
//   - DATA store (configs, strings, entity index)
//   - loadAllData() — fetches JSON configs (build script inlines these)
//   - cfg(path)     — read a `globals.*` value
//   - t(key, params)— translate a string
//   - getEntityTemplate(name)
//   - spawnEntity(name, x, y, team) — convenience wrapper
//   - SAVE_KEY + loadSave / saveData — TABS save format

const DATA = {};

async function loadAllData() {
  const files = [
    'globals', 'entities', 'economy', 'progression',
    'locations', 'ai_behaviors', 'tutorial', 'juice', 'keybindings'
  ];
  for (const name of files) {
    try {
      const resp = await fetch(`assets/configs/${name}.json`);
      DATA[name] = await resp.json();
    } catch (e) {
      console.warn(`数据文件 ${name}.json 未找到: ${e.message}`);
      DATA[name] = {};
    }
  }
  const lang = 'en';
  try {
    const resp = await fetch(`assets/strings/${lang}.json`);
    DATA._strings = await resp.json();
  } catch (e) {
    DATA._strings = {};
  }
  // iter-3: localStorage entity overrides — applied AFTER loading so they win
  applyEntityHotTune();
  DATA._entityIndex = {};
  for (const e of (DATA.entities?.entities || [])) {
    DATA._entityIndex[e.name] = e;
  }
  DATA._projectileIndex = DATA.entities?.projectiles || {};
}

function cfg(path, defaultVal = null) {
  const keys = path.split('.');
  let cur = DATA.globals;
  for (const k of keys) {
    if (cur == null || typeof cur !== 'object') return defaultVal;
    cur = cur[k];
  }
  return cur !== undefined ? cur : defaultVal;
}

function t(key, params = {}) {
  let text = (DATA._strings && DATA._strings[key]) || key;
  for (const [k, v] of Object.entries(params)) text = text.replaceAll(`{${k}}`, v);
  return text;
}

function getEntityTemplate(name) { return DATA._entityIndex[name] || null; }

// spawnEntity 接口: 转发给 EntitySys 以满足数据驱动创建
function spawnEntity(name, x, y, team = 'ally') {
  if (typeof EntitySys !== 'undefined' && EntitySys.spawn) return EntitySys.spawn(name, x, y, team);
  emit('spawn_request', { type: name, x, y, team });
  return null;
}

// ─── Hot-tune (iter-3): allow runtime entity overrides via localStorage ─
// Set `tabs_hot_tune` to a JSON blob shaped like:
//   { "archer": { "hp": 200, "damage": 50 }, "giant": { "speed": 120 } }
// Reload the page to apply. Useful for live balance iteration without rebuild.
const HOT_TUNE_KEY = 'tabs_hot_tune';
function applyEntityHotTune() {
  try {
    const raw = localStorage.getItem(HOT_TUNE_KEY);
    if (!raw) return;
    const overrides = JSON.parse(raw);
    const ents = DATA.entities?.entities;
    if (!Array.isArray(ents) || !overrides || typeof overrides !== 'object') return;
    let touched = 0;
    for (const e of ents) {
      const ov = overrides[e.name];
      if (!ov || typeof ov !== 'object') continue;
      for (const k of Object.keys(ov)) {
        e[k] = ov[k];
        touched++;
      }
    }
    if (touched > 0) {
      console.log(`[hot-tune] applied ${touched} entity field override(s) from localStorage.tabs_hot_tune`);
    }
  } catch (e) {
    console.warn('[hot-tune] failed to parse localStorage.tabs_hot_tune:', e);
  }
}
function setHotTune(overrides) {
  // Convenience: window.setHotTune({ archer: { hp: 200 } })
  // Doesn't apply immediately; reload to see effect. Returns the new blob.
  localStorage.setItem(HOT_TUNE_KEY, JSON.stringify(overrides || {}));
  console.log('[hot-tune] saved; reload page to apply');
  return overrides;
}
function clearHotTune() {
  localStorage.removeItem(HOT_TUNE_KEY);
  console.log('[hot-tune] cleared; reload page to apply');
}

// ─── TABS save format ───────────────────────────────────────────
const SAVE_KEY = 'tabs_save_v1';
function loadSave() { return Engine.loadJSON(SAVE_KEY); }
function saveData(obj) { return Engine.saveJSON(SAVE_KEY, obj); }

window.DATA = DATA;
window.cfg = cfg; window.t = t;
window.getEntityTemplate = getEntityTemplate;
window.loadAllData = loadAllData;
window.loadSave = loadSave; window.saveData = saveData;
window.spawnEntity = spawnEntity;
window.setHotTune = setHotTune; window.clearHotTune = clearHotTune;
