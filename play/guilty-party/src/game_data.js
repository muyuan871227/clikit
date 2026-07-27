// ═══ game_data.js — 数据访问层 ═══
const DATA = {};

async function loadAllData() {
  const files = [
    'globals', 'entities', 'ai_behaviors', 'locations',
    'juice', 'keybindings', 'progression', 'economy', 'tutorial',
    'map_layout'
  ];
  const bust = '?_=' + Date.now();
  for (const name of files) {
    try {
      const resp = await fetch(`assets/configs/${name}.json${bust}`, {cache: 'no-store'});
      DATA[name] = await resp.json();
    } catch (e) {
      console.warn(`Missing config ${name}.json`, e);
      DATA[name] = {};
    }
  }
  // localization: 支持 en / zh / es / fr / de / ja / ko (默认英文)
  const SUPPORTED = ['en', 'zh', 'es', 'fr', 'de', 'ja', 'ko'];
  let lang = localStorage.getItem('guiltyParty.lang');
  if (!lang || !SUPPORTED.includes(lang)) {
    lang = 'en'; // 默认英文
  }
  DATA._currentLang = lang;
  await loadLanguage(lang);
}

async function loadLanguage(lang) {
  const bust = '?_=' + Date.now();
  try {
    const resp = await fetch(`assets/strings/${lang}.json${bust}`, {cache: 'no-store'});
    DATA._strings = await resp.json();
    DATA._currentLang = lang;
    localStorage.setItem('guiltyParty.lang', lang);
  } catch (e) {
    DATA._strings = {};
  }

  // entity index
  DATA._entityIndex = {};
  for (const e of (DATA.entities?.entities || [])) {
    DATA._entityIndex[e.name] = e;
  }
  console.log('[GameData] loaded', Object.keys(DATA));
}

/** Read a global config by dot path. */
function cfg(path, defaultVal = null) {
  const keys = path.split('.');
  let cur = DATA.globals;
  for (const k of keys) {
    if (cur == null || typeof cur !== 'object') return defaultVal;
    cur = cur[k];
  }
  return cur !== undefined ? cur : defaultVal;
}

/** Get an entity template by name. */
function getEntity(name) {
  return DATA._entityIndex[name] || null;
}

/** Get all entities of a given type. */
function getEntitiesByType(type) {
  return (DATA.entities?.entities || []).filter(e => e.type === type);
}

/** Translate a key with optional substitutions. */
function t(key, params = {}) {
  let text = DATA._strings?.[key] || key;
  for (const [k, v] of Object.entries(params)) {
    text = text.replace(`{${k}}`, v);
  }
  return text;
}

/** Get player display name (localized). */
function getPlayerName(playerIndex) {
  const lang = DATA._currentLang || 'zh';
  const arr = lang === 'zh' ? cfg('players.names_zh') : cfg('players.names_en');
  return arr ? arr[playerIndex] : `P${playerIndex}`;
}

/** Get player color. */
function getPlayerColor(playerIndex) {
  const colors = cfg('players.colors') || ['#fff'];
  return colors[playerIndex] || '#fff';
}
