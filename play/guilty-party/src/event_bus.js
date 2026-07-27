// ═══ event_bus.js — 简单的发布订阅 ═══
const Bus = (() => {
  const listeners = {};
  function on(event, fn) {
    (listeners[event] = listeners[event] || []).push(fn);
  }
  function off(event, fn) {
    if (!listeners[event]) return;
    listeners[event] = listeners[event].filter(f => f !== fn);
  }
  function emit(event, payload) {
    const list = listeners[event];
    if (!list) return;
    for (const fn of list) {
      try { fn(payload); }
      catch (e) { console.error(`[Bus] handler error for ${event}:`, e); }
    }
  }
  return { on, off, emit };
})();
