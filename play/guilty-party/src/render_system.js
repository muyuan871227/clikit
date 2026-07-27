// ═══ render_system.js — Canvas绘制 + 相机 ═══
const Camera = (() => {
  let x = 0, y = 0;             // 当前相机中心(地图坐标)
  let targetX = 0, targetY = 0;
  let initialized = false;

  function follow(p) {
    if (!p) return;
    targetX = p.x;
    targetY = p.y;
    if (!initialized) { x = targetX; y = targetY; initialized = true; }
  }
  function update(dt) {
    if (!DATA.map_layout) return;
    const smooth = DATA.map_layout.viewport?.follow_smooth || 0.12;
    x = Utils.lerp(x, targetX, smooth);
    y = Utils.lerp(y, targetY, smooth);
    clamp();
  }
  function clamp() {
    const v = DATA.map_layout?.viewport;
    const m = DATA.map_layout?.map_bounds;
    if (!v || !m) return;
    x = Utils.clamp(x, v.width / 2, m.width - v.width / 2);
    y = Utils.clamp(y, v.height / 2, m.height - v.height / 2);
  }
  function snapTo(px, py) { x = px; y = py; targetX = px; targetY = py; clamp(); initialized = true; }
  function reset() { initialized = false; x = 0; y = 0; targetX = 0; targetY = 0; }
  function getX() { return x; }
  function getY() { return y; }
  function viewportW() { return DATA.map_layout?.viewport?.width || 720; }
  function viewportH() { return DATA.map_layout?.viewport?.height || 660; }
  function applyTransform(ctx) {
    ctx.translate(viewportW() / 2 - x, viewportH() / 2 - y);
  }
  function screenToWorld(sx, sy, hudOffset = 0) {
    return {x: sx + x - viewportW() / 2, y: sy - hudOffset + y - viewportH() / 2};
  }
  function isVisible(rect) {
    const left = x - viewportW() / 2, right = x + viewportW() / 2;
    const top = y - viewportH() / 2, bot = y + viewportH() / 2;
    return rect.x + rect.w > left && rect.x < right && rect.y + rect.h > top && rect.y < bot;
  }
  return {follow, update, snapTo, reset, getX, getY, viewportW, viewportH, applyTransform, screenToWorld, isVisible};
})();

const Render = (() => {
  let canvas = null, ctx = null;
  const particles = [];
  let shake = {dx: 0, dy: 0, time: 0, intensity: 0};
  let flash = {color: null, alpha: 0, duration: 0, elapsed: 0};
  let hitStop = {until: 0};

  function init(canv) {
    canvas = canv;
    ctx = canv.getContext('2d');
    bindBus();
  }

  function bindBus() {
    Bus.on('triggerJuice', ({eventName, x, y}) => {
      const spec = DATA.juice?.events?.[eventName];
      if (!spec) return;
      if (spec.screen_shake) addShake(spec.screen_shake);
      if (spec.flash_color) addFlash(spec.flash_color, spec.flash_ms || 200);
      if (spec.hit_stop_ms) hitStop.until = performance.now() + spec.hit_stop_ms;
      if (spec.particle) spawnParticles(spec.particle, x, y);
    });
  }

  function addShake(intensity) {
    shake.intensity = Math.max(shake.intensity, intensity);
    shake.time = 0;
  }
  function addFlash(color, ms) {
    flash.color = color;
    flash.alpha = 0.6;
    flash.duration = ms / 1000;
    flash.elapsed = 0;
  }

  // 粒子生成
  function spawnParticles(kind, x, y) {
    if (x === undefined) { x = canvas.width / 2; y = canvas.height / 2; }
    let count = 8, color = '#FFD700', shape = 'circle', size = 4, lifeMs = 600, speed = 80;
    switch (kind) {
      case 'particle_search_dust': count = 6; color = '#a8a89a'; size = 3; lifeMs = 500; speed = 40; break;
      case 'particle_evidence_sparkle': count = 14; color = '#FFD700'; shape = 'star'; size = 5; lifeMs = 700; speed = 100; break;
      case 'particle_shadow_swirl': count = 10; color = '#3a0a0a'; shape = 'circle'; size = 6; lifeMs = 800; speed = 60; break;
      case 'particle_ink_drop': count = 5; color = '#1a0a3a'; size = 4; lifeMs = 400; speed = 30; break;
      case 'particle_burn_ash': count = 18; color = '#FF6B00'; shape = 'circle'; size = 4; lifeMs = 900; speed = 70; break;
      case 'particle_lens_glint': count = 12; color = '#00E5FF'; shape = 'star'; size = 6; lifeMs = 700; speed = 120; break;
      case 'particle_truth_ring': count = 20; color = '#FFFFFF'; shape = 'circle'; size = 4; lifeMs = 600; speed = 150; break;
      case 'particle_red_truth_ring': count = 20; color = '#FF3B30'; shape = 'circle'; size = 4; lifeMs = 600; speed = 150; break;
      case 'particle_vote_drop': count = 6; color = '#FFD700'; size = 3; lifeMs = 500; speed = 60; break;
      case 'particle_smoke_puff': count = 12; color = '#3a3a45'; shape = 'circle'; size = 8; lifeMs = 800; speed = 50; break;
      case 'particle_dark_laugh': count = 16; color = '#8B0000'; shape = 'star'; size = 5; lifeMs = 1000; speed = 80; break;
      case 'particle_light_burst': count = 22; color = '#FFD700'; shape = 'star'; size = 6; lifeMs = 1000; speed = 130; break;
    }
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = speed * (0.4 + Math.random() * 0.8);
      particles.push({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        gravity: 30, alpha: 1, color, shape, size: size * (0.7 + Math.random() * 0.6),
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 4,
        life: lifeMs / 1000, totalLife: lifeMs / 1000
      });
    }
  }

  function update(dt) {
    // hitstop
    if (performance.now() < hitStop.until) return;
    // shake decay
    if (shake.intensity > 0) {
      shake.dx = (Math.random() - 0.5) * 2 * shake.intensity;
      shake.dy = (Math.random() - 0.5) * 2 * shake.intensity;
      shake.intensity *= 0.85;
      if (shake.intensity < 0.1) { shake.intensity = 0; shake.dx = 0; shake.dy = 0; }
    }
    // flash decay
    if (flash.alpha > 0) {
      flash.elapsed += dt;
      flash.alpha = Math.max(0, 0.6 * (1 - flash.elapsed / flash.duration));
    }
    // particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += p.gravity * dt;
      p.vx *= 0.98;
      p.rotation += p.rotSpeed * dt;
      p.life -= dt;
      p.alpha = Math.max(0, p.life / p.totalLife);
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  function clear() {
    ctx.save();
    ctx.fillStyle = '#0d1018';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  function applyShake() {
    ctx.translate(shake.dx, shake.dy);
  }

  function drawFlashAndParticles() {
    // particles
    for (const p of particles) Sprites.drawParticle(ctx, p);
    // flash overlay
    if (flash.alpha > 0) {
      ctx.save();
      ctx.fillStyle = flash.color;
      ctx.globalAlpha = flash.alpha;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
  }

  function getCtx() { return ctx; }
  function getCanvas() { return canvas; }
  function getParticleCount() { return particles.length; }

  return { init, update, clear, applyShake, drawFlashAndParticles, spawnParticles, getCtx, getCanvas, getParticleCount };
})();

// 全局触发 juice helper(供其他系统调用)
function triggerJuice(eventName, x, y) {
  Bus.emit('triggerJuice', {eventName, x, y});
}
