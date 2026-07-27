// ═══ input_system.js — 键盘+鼠标 ═══
const Input = (() => {
  const keys = {};
  let mouseX = 0, mouseY = 0;
  let mouseDown = false;
  let canvas = null;

  function init(canv) {
    canvas = canv;
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('click', onCanvasClick);
  }

  function onKeyDown(e) {
    if (keys[e.code]) return; // 防止长按重复
    keys[e.code] = true;
    handleHotkey(e.code, e);
  }
  function onKeyUp(e) {
    keys[e.code] = false;
  }

  function handleHotkey(code, evt) {
    const kb = DATA.keybindings || {};
    const p1 = kb.player1 || {};
    if ((p1.search_interact || []).includes(code)) {
      Bus.emit('player_search_intent', {});
      evt.preventDefault();
    }
    if ((p1.open_evidence_book || []).includes(code)) {
      Bus.emit('toggle_evidence_book', {});
      evt.preventDefault();
    }
    if ((p1.use_lens || []).includes(code)) {
      Bus.emit('player_use_lens_request', {});
      evt.preventDefault();
    }
    if ((p1.pause_menu || []).includes(code)) {
      Bus.emit('toggle_pause', {});
      evt.preventDefault();
    }
    const ui = kb.ui_hotkeys || {};
    if ((ui.frame_action || []).includes(code)) Bus.emit('player_frame_request', {});
    if ((ui.tamper_action || []).includes(code)) Bus.emit('player_tamper_request', {});
    if ((ui.destroy_action || []).includes(code)) Bus.emit('player_destroy_request', {});
    if ((ui.false_testimony || []).includes(code)) Bus.emit('player_false_testimony_request', {});
    if ((ui.vent_use || []).includes(code)) Bus.emit('player_vent_request', {});
    if (code === 'KeyM') {
      Audio_.setMuted(!Audio_.isMuted());
    }
  }

  function onMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
  }
  function onMouseDown(e) { mouseDown = true; }
  function onMouseUp(e) { mouseDown = false; }
  function onCanvasClick(e) {
    Audio_.resumeIfNeeded();
    // Always pass raw screen coords. Listeners that need world coords convert via Camera.
    Bus.emit('canvas_click', {x: mouseX, y: mouseY, screenX: mouseX, screenY: mouseY});
  }

  function getMove() {
    const kb = DATA.keybindings || {};
    const p1 = kb.player1 || {};
    let dx = 0, dy = 0;
    if ((p1.move_left || []).some(k => keys[k])) dx -= 1;
    if ((p1.move_right || []).some(k => keys[k])) dx += 1;
    if ((p1.move_up || []).some(k => keys[k])) dy -= 1;
    if ((p1.move_down || []).some(k => keys[k])) dy += 1;
    if (dx !== 0 && dy !== 0) {
      const inv = 1 / Math.sqrt(2);
      dx *= inv; dy *= inv;
    }
    return {dx, dy};
  }

  function getMouse() { return {x: mouseX, y: mouseY, down: mouseDown}; }
  function isKeyDown(code) { return !!keys[code]; }

  return {init, getMove, getMouse, isKeyDown};
})();
