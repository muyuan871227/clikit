// ═══ UI 系统 · 菜单 / 关卡选择 / HUD / 结算 ═══
const UISys = (() => {
  let ctx = null;
  let canvasW = 1280, canvasH = 720;
  let hoverButton = null;
  let pressedButton = null;
  let currentUnitSelected = null;
  let goldDisplayed = 0;
  let unlocked = ['pikeman'];
  let lastLevelWon = null;
  let lastSandboxEnd = null;
  let deployDeniedFlash = 0;
  let denyReason = '';
  let denyType = '';
  let tutorialBubble = null;
  let showUnlockToast = null;
  let unlockToastUntil = 0;
  let bannerText = null;
  let bannerUntil = 0;
  let countdownStart = 0;
  let sandboxMapPickerOpen = false;  // 沙盒地图选择器是否打开

  // 交互区域(每帧重建)
  let _hitAreas = [];

  function init() {
    canvasW = cfg('render.canvas_width', 1280);
    canvasH = cfg('render.canvas_height', 720);

    on('plan_phase_started', ({ budget, level_id }) => {
      goldDisplayed = budget;
      currentUnitSelected = null;
      lastLevelWon = null;
      if (typeof EconomySys !== 'undefined' && EconomySys.getUnlocked) unlocked = EconomySys.getUnlocked();
      // 沙盒首次进入自动打开地图选择器
      if (level_id === 'sandbox' && !window._sandboxMapPicked) {
        sandboxMapPickerOpen = true;
      }
    });
    on('battle_phase_started', () => {
      // 启动 3-2-1 倒计时
      countdownStart = now();
    });
    on('gold_changed', ({ current }) => {
      // displayed 渐近
    });
    on('unlock_list_changed', ({ entities }) => { unlocked = entities; });
    on('unlock_granted', ({ entity_name }) => {
      showUnlockToast = { name: t('unit.' + entity_name), key: entity_name, startT: now() };
      unlockToastUntil = now() + 3500;
    });
    on('deploy_denied', ({ reason, type }) => {
      deployDeniedFlash = now() + 600;
      denyReason = reason; denyType = type;
      if (typeof AudioSys !== 'undefined') AudioSys.playSfx('sfx_deny', 0.4);
    });
    on('level_won', (info) => { lastLevelWon = info; });
    on('level_lost', (info) => { lastLevelWon = null; });
    on('sandbox_ended', (info) => { lastSandboxEnd = info; });
    on('tutorial_show', (data) => { tutorialBubble = data; });
    on('tutorial_hide', () => { tutorialBubble = null; });
    on('zone_entered', ({ zone_data }) => {
      if (zone_data.new_element) {
        bannerText = t('unit.' + zone_data.new_element.replace('_intro', '')) + ' ' + t('ui.entered');
        bannerUntil = now() + 1800;
      }
    });
    on('unit_type_selected', ({ type }) => { currentUnitSelected = type; InputSys.setSelected(type); });
  }

  function update(dt) {
    // gold lerp
    const actual = EconomySys.getGold();
    goldDisplayed += (actual - goldDisplayed) * 0.2;
  }

  function render(c) {
    ctx = c || (RenderSys && RenderSys.getUICtx ? RenderSys.getUICtx() : null);
    if (!ctx) return;
    _hitAreas = [];
    const state = GameState.getState();
    if (state === 'MENU' || state === 'LOADING') renderMenu();
    else if (state === 'LEVEL_SELECT') renderLevelSelect();
    else if (state === 'PLAN') renderPlanHUD();
    else if (state === 'BATTLE') renderBattleHUD();
    else if (state === 'RESULT_WIN' || state === 'RESULT_LOSS') renderResult(state);
    else if (state === 'RESULT_SANDBOX') renderSandboxResult();

    // 沙盒地图选择器 (优先于其他覆盖层)
    if (sandboxMapPickerOpen && state === 'PLAN' && GameState.getCurrentLevelId() === 'sandbox') {
      renderSandboxMapPicker();
      return;
    }
    // 暂停遮罩 + 菜单
    if (window.isPaused && window.isPaused() && (state === 'PLAN' || state === 'BATTLE')) {
      ctx.save();
      ctx.fillStyle = 'rgba(10,15,25,0.85)';
      ctx.fillRect(0, 0, canvasW, canvasH);
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 64px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(t('ui.paused'), canvasW/2, 220);
      ctx.fillStyle = '#AAA';
      ctx.font = '20px sans-serif';
      ctx.fillText(t('ui.click_resume'), canvasW/2, 270);
      ctx.restore();
      drawButton(t('ui.resume'), canvasW/2 - 150, 320, 300, 64, 'pause_resume', true);
      drawButton(t('ui.restart'), canvasW/2 - 150, 408, 300, 64, 'pause_replay', false, 'neutral');
      drawButton(t('ui.back_to_menu'), canvasW/2 - 150, 496, 300, 64, 'pause_menu', false, 'neutral');
    }
    // 横幅
    if (bannerText && now() < bannerUntil) {
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 260, canvasW, 80);
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 48px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(bannerText, canvasW/2, 315);
      ctx.restore();
    }

    // 解锁横幅: 划入 + 缩放高亮
    if (showUnlockToast && now() < unlockToastUntil) {
      const dt = now() - showUnlockToast.startT;
      const totalDur = 3500;
      let scale = 1, alpha = 1, slideY = 0;
      if (dt < 250) { scale = dt/250; alpha = dt/250; slideY = -50 + 50 * (dt/250); }
      else if (dt < 500) { scale = 1.0 + Math.sin((dt-250)/250 * Math.PI) * 0.2; }
      else if (dt > totalDur - 400) { alpha = (totalDur - dt) / 400; }
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(canvasW/2, 110 + slideY);
      ctx.scale(scale, scale);
      // 闪光底
      const grd = ctx.createLinearGradient(-220, 0, 220, 0);
      grd.addColorStop(0, 'rgba(50,80,50,0.95)');
      grd.addColorStop(0.5, 'rgba(80,140,80,0.95)');
      grd.addColorStop(1, 'rgba(50,80,50,0.95)');
      ctx.fillStyle = grd;
      ctx.fillRect(-220, -38, 440, 76);
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 3;
      ctx.strokeRect(-220, -38, 440, 76);
      // 文字
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(t('ui.unit_unlocked'), 0, -16);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText(showUnlockToast.name, 0, 14);
      ctx.restore();
    }

    // 教程气泡
    if (tutorialBubble) renderTutorialBubble();
  }

  // Duolingo-style 3D pressable button: large radius, bottom shadow simulating depth
  function drawButton(label, x, y, w, h, id, highlight, variant) {
    ctx.save();
    const hover = hoverButton === id;
    const pressed = pressedButton === id;
    // Color palette (Duolingo-inspired)
    const VARIANTS = {
      primary:   { fill: '#58CC02', shadow: '#4AAB04', text: '#FFFFFF' },  // green primary
      secondary: { fill: '#1CB0F6', shadow: '#1492CC', text: '#FFFFFF' },  // info blue
      warning:   { fill: '#FFC800', shadow: '#D9A800', text: '#3C2900' },  // yellow
      danger:    { fill: '#FF4B4B', shadow: '#D43A3A', text: '#FFFFFF' },  // red
      neutral:   { fill: '#FFFFFF', shadow: '#E5E5E5', text: '#4B4B4B' },  // light card
      dark:      { fill: '#3C3C3C', shadow: '#1F1F1F', text: '#FFFFFF' }   // dark
    };
    const v = variant ? VARIANTS[variant] : (highlight ? VARIANTS.primary : VARIANTS.secondary);
    const shadowH = 5;  // depth
    const offset = pressed ? shadowH : 0;
    const radius = Math.min(16, h/2);
    // Bottom shadow (depth)
    ctx.fillStyle = v.shadow;
    roundRect(ctx, x, y + (pressed ? 0 : shadowH), w, h, radius);
    ctx.fill();
    // Top face
    ctx.fillStyle = hover ? lightenHex(v.fill, 0.07) : v.fill;
    roundRect(ctx, x, y + offset, w, h - shadowH, radius);
    ctx.fill();
    // Subtle border for outline button (neutral variant)
    if (variant === 'neutral') {
      ctx.strokeStyle = '#E5E5E5';
      ctx.lineWidth = 2;
      roundRect(ctx, x, y + offset, w, h - shadowH, radius);
      ctx.stroke();
    }
    // Text
    ctx.fillStyle = v.text;
    ctx.font = 'bold ' + Math.round(h * 0.36) + 'px -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + w/2, y + offset + (h - shadowH)/2);
    ctx.restore();
    _hitAreas.push({ x, y, w, h, id, type: 'button' });
  }

  // Helper: rounded rect path
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // Helper: lighten a hex color
  function lightenHex(hex, factor) {
    const m = /^#([0-9a-f]{6})$/i.exec(hex);
    if (!m) return hex;
    const v = parseInt(m[1], 16);
    let r = (v >> 16) & 0xff, g = (v >> 8) & 0xff, b = v & 0xff;
    r = Math.min(255, Math.round(r + (255 - r) * factor));
    g = Math.min(255, Math.round(g + (255 - g) * factor));
    b = Math.min(255, Math.round(b + (255 - b) * factor));
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  }

  function drawText(txt, x, y, size = 18, color = '#FFF', align = 'left') {
    ctx.save();
    ctx.fillStyle = color;
    ctx.font = `${size}px sans-serif`;
    ctx.textAlign = align;
    ctx.textBaseline = 'top';
    ctx.fillText(txt, x, y);
    ctx.restore();
  }

  function renderMenu() {
    // Duolingo-style menu: light gradient backdrop, big card with rounded buttons
    ctx.save();
    // Semi-transparent dark background to dim the 3D scene
    ctx.fillStyle = 'rgba(15,18,30,0.55)';
    ctx.fillRect(0, 0, canvasW, canvasH);
    // White rounded card in the center
    const cardW = 520, cardH = 480;
    const cardX = canvasW/2 - cardW/2, cardY = canvasH/2 - cardH/2;
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    roundRect(ctx, cardX + 6, cardY + 10, cardW, cardH, 24);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    roundRect(ctx, cardX, cardY, cardW, cardH, 24);
    ctx.fill();
    // Title (bold large dark text on white card)
    ctx.fillStyle = '#3C3C3C';
    ctx.font = 'bold 56px -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(t('game.title'), canvasW/2, cardY + 100);
    // Subtitle
    ctx.fillStyle = '#777';
    ctx.font = '20px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(t('game.subtitle'), canvasW/2, cardY + 138);
    // Best level
    if (EconomySys.getHighestCleared() > 0) {
      ctx.fillStyle = '#58CC02';
      ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText('🏆 ' + t('menu.highest', { n: EconomySys.getHighestCleared() }), canvasW/2, cardY + 178);
    }
    ctx.restore();

    // Buttons (Duolingo green primary + neutral secondary)
    const btnX = canvasW/2 - 180, btnW = 360;
    drawButton(t('menu.start'),    btnX, cardY + 220, btnW, 64, 'menu.start',    true,  'primary');
    drawButton(t('menu.sandbox'),  btnX, cardY + 304, btnW, 64, 'menu.sandbox',  false, 'secondary');
    if (EconomySys.getHighestCleared() > 0)
      drawButton(t('menu.continue'), btnX, cardY + 388, btnW, 64, 'menu.continue', false, 'neutral');
  }

  function renderLevelSelect() {
    ctx.fillStyle = 'rgba(15,18,30,0.78)';
    ctx.fillRect(0, 0, canvasW, canvasH);
    drawText(t('level.select'), canvasW/2, 60, 40, '#FFD700', 'center');
    const highest = EconomySys.getHighestCleared();
    const cols = 5;
    const cell = 105;
    const gap = 16;
    const totalW = cols * cell + (cols - 1) * gap;
    const startX = (canvasW - totalW) / 2;
    const startY = 140;
    const locs = DATA.locations?.locations || [];
    const maps = DATA.locations?.maps || {};
    for (let i = 1; i <= 20; i++) {
      const idx = i - 1;
      const cx = startX + (idx % cols) * (cell + gap);
      const cy = startY + Math.floor(idx / cols) * (cell + gap);
      const cleared = i <= highest;
      const locked = i > highest + 1;
      const isCurrent = (i === highest + 1);
      const levelId = `level_${String(i).padStart(2, '0')}`;
      const lvData = locs.find(l => l.id === levelId);
      const mapId = lvData?.map || 'plains';
      const mapData = maps[mapId];
      ctx.save();
      // 地图主题渐变背景 (基于 map 颜色)
      const grd = ctx.createLinearGradient(cx, cy, cx, cy + cell);
      if (locked) {
        grd.addColorStop(0, '#2a2a3a'); grd.addColorStop(1, '#1a1a2a');
      } else if (mapData) {
        const top = mapData.sky_top || '#5a7a8a';
        const bot = mapData.ground || '#5a8a4a';
        grd.addColorStop(0, top);
        grd.addColorStop(0.5, mapData.sky_bot || top);
        grd.addColorStop(1, bot);
      } else {
        grd.addColorStop(0, '#4a5a8a'); grd.addColorStop(1, '#2a3a5a');
      }
      ctx.fillStyle = grd;
      ctx.fillRect(cx, cy, cell, cell);
      // 暗化锁定/未通关
      if (!cleared && !isCurrent && !locked) {
        ctx.fillStyle = 'rgba(20,20,30,0.45)';
        ctx.fillRect(cx, cy, cell, cell);
      }
      if (locked) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(cx, cy, cell, cell);
      }
      // 边框
      const pulse = isCurrent ? (0.5 + 0.5 * Math.sin(now() / 250)) : 1;
      ctx.strokeStyle = locked ? '#444' : (isCurrent ? `rgba(255,215,0,${pulse})` : (cleared ? '#8FE87C' : '#FFFFFF'));
      ctx.lineWidth = isCurrent ? 4 : 2;
      ctx.strokeRect(cx, cy, cell, cell);
      // 关卡号
      ctx.fillStyle = locked ? '#555' : '#FFF';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(i, cx + cell/2, cy + cell/2 - 8);
      // 地图名
      if (!locked && mapData) {
        ctx.font = '11px sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.fillText(mapData.name, cx + cell/2, cy + cell - 14);
      }
      // 完成对勾
      if (cleared) {
        ctx.fillStyle = '#8FE87C';
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('✓', cx + 6, cy + 4);
      }
      // 锁标志
      if (locked) {
        ctx.fillStyle = '#666';
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🔒', cx + cell/2, cy + cell/2 + 30);
      }
      ctx.restore();
      if (!locked) _hitAreas.push({ x: cx, y: cy, w: cell, h: cell, id: 'level:' + levelId, type: 'button' });
    }
    // 沙盒
    const sx = canvasW/2 - 110, sy = startY + 4 * (cell + gap) + 20;
    ctx.save();
    const sgrd = ctx.createLinearGradient(sx, sy, sx, sy + 60);
    sgrd.addColorStop(0, '#8a3ab8'); sgrd.addColorStop(1, '#5a1a8a');
    ctx.fillStyle = sgrd;
    ctx.fillRect(sx, sy, 220, 60);
    ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 3;
    ctx.strokeRect(sx, sy, 220, 60);
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('🎮 ' + t('menu.sandbox'), sx + 110, sy + 30);
    ctx.restore();
    _hitAreas.push({ x: sx, y: sy, w: 220, h: 60, id: 'level:sandbox', type: 'button' });
    drawButton(t('result.back'), 40, canvasH - 80, 160, 50, 'back_to_menu');
  }

  function renderPlanHUD() {
    const isSandbox = GameState.getCurrentLevelId() === 'sandbox';
    // 顶部预算条
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, canvasW, 80);
    if (isSandbox) {
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'left';
      const mapId = window._sandboxMap || 'plains';
      const mapName = t('map.' + mapId);
      ctx.fillText('🎮 ' + t('sandbox.title', { map: mapName }), 40, 35);
      ctx.fillStyle = '#AAA';
      ctx.font = '14px sans-serif';
      ctx.fillText(t('sandbox.hint'), 40, 60);
      // Pick map button
      drawButton('🗺 ' + t('sandbox.choose_map'), canvasW - 480, 16, 160, 50, 'sandbox_open_picker', false, 'secondary');
    } else {
      const lowGold = EconomySys.getGold() < 20;
      const warnFlash = deployDeniedFlash > now() && denyReason === 'no_gold';
      ctx.fillStyle = warnFlash ? '#FF4A4A' : (lowGold ? '#E8D84A' : '#FFD700');
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`$${Math.round(goldDisplayed)} / $${EconomySys.getBudget()}`, 40, 50);
    }
    // 倒计时 (沙盒不显示)
    if (!isSandbox) {
      const secs = Math.ceil(GameState.getPhaseTimer());
      ctx.fillStyle = secs <= 5 ? '#FF6B4A' : '#FFF';
      ctx.textAlign = 'right';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(t('plan.timer', { s: secs }), canvasW - 40, 50);
    } else {
      // 沙盒显示: 双方人数
      ctx.textAlign = 'right';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillStyle = '#4A90E2';
      ctx.fillText(t('sandbox.blue') + ': ' + (typeof EntitySys !== 'undefined' ? EntitySys.getAllies().length : 0), canvasW - 200, 38);
      ctx.fillStyle = '#E74C3C';
      ctx.fillText(t('sandbox.red') + ': ' + (typeof EntitySys !== 'undefined' ? EntitySys.getEnemies().length : 0), canvasW - 60, 38);
      ctx.fillStyle = '#888';
      ctx.font = '13px sans-serif';
      ctx.fillText(t('sandbox.right_click_remove'), canvasW - 60, 64);
    }
    ctx.restore();

    renderPalette();
    drawButton(t('plan.start'), canvasW - 240, canvasH - 84, 210, 64, 'start_battle', true, 'primary');
    drawButton(t('plan.reset'), canvasW - 460, canvasH - 84, 200, 64, 'reset', false, 'warning');
    drawButton(t('result.back'), canvasW - 640, canvasH - 84, 170, 64, 'back_to_select', false, 'neutral');
  }

  function renderPalette() {
    const cardW = 80, cardH = 88;
    const gap = 6;
    const startX = 14;
    const startY = 100;
    for (let i = 0; i < unlocked.length; i++) {
      const type = unlocked[i];
      const tpl = getEntityTemplate(type);
      if (!tpl) continue;
      // 竖排
      const cx = startX, cy = startY + i * (cardH + gap);
      const isSelected = currentUnitSelected === type;
      const affordable = EconomySys.getGold() >= tpl.cost_gold;
      ctx.save();
      // 渐变背景
      const grd = ctx.createLinearGradient(cx, cy, cx, cy + cardH);
      if (isSelected) { grd.addColorStop(0, '#7AAAFF'); grd.addColorStop(1, '#3A6ABF'); }
      else if (affordable) { grd.addColorStop(0, '#4A5A7A'); grd.addColorStop(1, '#2A3A5A'); }
      else { grd.addColorStop(0, '#2A2A3A'); grd.addColorStop(1, '#1A1A2A'); }
      ctx.fillStyle = grd;
      ctx.fillRect(cx, cy, cardW, cardH);
      ctx.strokeStyle = isSelected ? '#FFD700' : (affordable ? '#888' : '#444');
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.strokeRect(cx, cy, cardW, cardH);
      // 兵种简笔图标
      drawUnitIcon(ctx, cx + cardW/2, cy + 28, tpl, affordable);
      // 名字
      ctx.fillStyle = affordable ? '#FFF' : '#888';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(t('unit.' + type), cx + cardW/2, cy + cardH - 24);
      // 价格
      ctx.fillStyle = affordable ? '#FFD700' : '#776';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('$' + tpl.cost_gold, cx + cardW/2, cy + cardH - 8);
      // 已部署数
      const cnt = EconomySys.getDeployCount(type);
      if (cnt > 0) {
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('x' + cnt, cx + cardW - 6, cy + 20);
      }
      // cap flash
      if (deployDeniedFlash > now() && denyType === type && denyReason === 'cap_reached') {
        ctx.strokeStyle = '#FF4A4A';
        ctx.lineWidth = 4;
        ctx.strokeRect(cx, cy, cardW, cardH);
      }
      // 快捷键 (左上角)
      ctx.fillStyle = isSelected ? '#FFD700' : '#AAA';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText((i+1) + '', cx + 6, cy + 14);
      ctx.restore();
      _hitAreas.push({ x: cx, y: cy, w: cardW, h: cardH, id: 'palette:' + type, type: 'palette' });
    }
  }

  // 绘制兵种小图标 (与 3D 模型呼应)
  function drawUnitIcon(c, cx, cy, tpl, ok) {
    c.save();
    c.globalAlpha = ok ? 1.0 : 0.4;
    const fam = tpl.family;
    const skin = '#F5D6A8';
    const teamCol = '#4A90E2';
    if (fam === 'giant') {
      // 大头大身体
      c.fillStyle = '#AA6644';
      c.fillRect(cx-12, cy-2, 24, 22);
      c.fillStyle = '#D4A777';
      c.beginPath(); c.arc(cx, cy-10, 10, 0, Math.PI*2); c.fill();
      c.fillStyle = '#000';
      c.beginPath(); c.arc(cx-3, cy-10, 1.5, 0, Math.PI*2); c.fill();
      c.beginPath(); c.arc(cx+3, cy-10, 1.5, 0, Math.PI*2); c.fill();
    } else if (fam === 'cavalry') {
      // 马 + 骑士
      c.fillStyle = '#7A5A3A';
      c.fillRect(cx-14, cy+4, 28, 10);
      c.fillRect(cx+10, cy-2, 8, 6);  // 马头
      c.fillStyle = teamCol;
      c.fillRect(cx-3, cy-12, 7, 14);
      c.fillStyle = skin;
      c.beginPath(); c.arc(cx, cy-15, 4, 0, Math.PI*2); c.fill();
      // 剑
      c.strokeStyle = '#CCC';
      c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(cx+3, cy-12); c.lineTo(cx+14, cy-22); c.stroke();
    } else if (fam === 'mage') {
      // 锥形袍 + 尖帽
      c.fillStyle = '#5A3A7A';
      c.beginPath(); c.moveTo(cx-12, cy+18); c.lineTo(cx+12, cy+18); c.lineTo(cx, cy-2); c.fill();
      c.fillStyle = skin;
      c.beginPath(); c.arc(cx, cy-5, 4, 0, Math.PI*2); c.fill();
      c.fillStyle = '#4A2A6A';
      c.beginPath(); c.moveTo(cx-5, cy-10); c.lineTo(cx+5, cy-10); c.lineTo(cx, cy-22); c.fill();
      // 法杖+火球
      c.strokeStyle = '#6A4A2A'; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(cx+8, cy+10); c.lineTo(cx+12, cy-14); c.stroke();
      c.fillStyle = '#FF6B4A';
      c.beginPath(); c.arc(cx+12, cy-16, 3, 0, Math.PI*2); c.fill();
    } else if (fam === 'tank') {
      // 盾兵: 大盾+身体
      c.fillStyle = '#7A6A4A';
      c.fillRect(cx-14, cy-8, 6, 24);
      c.fillStyle = '#888';
      c.fillRect(cx-3, cy-4, 9, 18);
      c.fillStyle = skin;
      c.beginPath(); c.arc(cx+1, cy-10, 4, 0, Math.PI*2); c.fill();
      c.fillStyle = '#FFD700';
      c.beginPath(); c.arc(cx-11, cy+4, 2, 0, Math.PI*2); c.fill();
    } else if (fam === 'ranged') {
      // 弓手
      c.fillStyle = '#3A7A3A';
      c.fillRect(cx-4, cy-2, 8, 18);
      c.fillStyle = skin;
      c.beginPath(); c.arc(cx, cy-8, 4, 0, Math.PI*2); c.fill();
      c.fillStyle = '#2A5A2A';
      c.beginPath(); c.moveTo(cx-5, cy-10); c.lineTo(cx+5, cy-10); c.lineTo(cx, cy-18); c.fill();
      // 弓
      c.strokeStyle = '#6A4A2A'; c.lineWidth = 1.5;
      c.beginPath(); c.arc(cx+10, cy, 6, -Math.PI/2, Math.PI/2); c.stroke();
    } else {
      // 矛兵 (默认)
      c.fillStyle = '#888';
      c.fillRect(cx-4, cy-2, 8, 18);
      c.fillStyle = skin;
      c.beginPath(); c.arc(cx, cy-8, 4, 0, Math.PI*2); c.fill();
      c.fillStyle = '#666';
      c.fillRect(cx-5, cy-13, 10, 5);  // 头盔
      // 矛
      c.strokeStyle = '#6A4A2A'; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(cx+5, cy-12); c.lineTo(cx+14, cy-22); c.stroke();
      c.fillStyle = '#CCC';
      c.beginPath(); c.moveTo(cx+13, cy-22); c.lineTo(cx+15, cy-20); c.lineTo(cx+12, cy-19); c.fill();
    }
    c.restore();
  }

  function getSpriteImg(name) {
    // 访问 RenderSys 的 spriteCache (不暴露, 通过全局 img)
    // 简单方案: 用独立缓存
    if (!UISys._imgCache) UISys._imgCache = {};
    if (!UISys._imgCache[name]) {
      const img = new Image();
      img.src = `assets/sprites/${name}.svg`;
      UISys._imgCache[name] = img;
    }
    return UISys._imgCache[name];
  }

  function renderBattleHUD() {
    const isSandbox = GameState.getCurrentLevelId() === 'sandbox';
    // 3-2-1 GO 倒计时 (BATTLE 开始后 1.6s 内)
    if (countdownStart > 0) {
      const elapsed = now() - countdownStart;
      if (elapsed < 1600) {
        const idx = Math.min(3, Math.floor(elapsed / 400));
        const labels = ['3', '2', '1', 'GO!'];
        const tickT = elapsed - idx * 400;
        const scale = 1 + (1 - tickT/400) * 1.5;
        const a = Math.max(0, 1 - tickT/400);
        ctx.save();
        ctx.translate(canvasW/2, canvasH/2);
        ctx.scale(scale, scale);
        ctx.globalAlpha = a;
        ctx.fillStyle = idx === 3 ? '#FFD700' : '#FF6B4A';
        ctx.font = 'bold 140px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labels[idx], 4, 4);
        ctx.fillStyle = '#FFF';
        ctx.fillText(labels[idx], 0, 0);
        ctx.restore();
      } else {
        countdownStart = 0;
      }
    }
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, canvasW, 60);
    if (isSandbox) {
      // 沙盒: 不显示倒计时, 显示"沙盒战斗中" + 双方计数
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 26px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🎮 ' + t('sandbox.fighting'), canvasW/2, 38);
    } else {
      const secs = Math.ceil(GameState.getPhaseTimer());
      ctx.fillStyle = secs <= 5 ? '#FF6B4A' : '#FFF';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(t('battle.timer', { s: secs }), canvasW/2, 42);
    }
    ctx.fillStyle = '#4A90E2';
    ctx.textAlign = 'left';
    ctx.font = 'bold 24px sans-serif';
    const allyN = EntitySys.getAllies().length;
    const enemyN = EntitySys.getEnemies().length;
    ctx.fillText(isSandbox ? t('sandbox.blue') + ': ' + allyN : t('battle.ally', { n: allyN }), 40, 38);
    ctx.fillStyle = '#E74C3C';
    ctx.textAlign = 'right';
    ctx.fillText(isSandbox ? t('sandbox.red') + ': ' + enemyN : t('battle.enemy', { n: enemyN }), canvasW - 40, 38);
    ctx.restore();

    drawButton(t('result.replay'), canvasW - 200, canvasH - 78, 160, 56, 'reset', false, 'warning');
    const ts = window.getTimeScale ? window.getTimeScale() : 1.0;
    const paused = window.isPaused && window.isPaused();
    drawButton(paused ? '▶' : '‖', 40, canvasH - 78, 64, 56, 'pause', false, 'neutral');
    drawButton(ts === 1.0 ? '1×' : (ts === 2.0 ? '2×' : '4×'), 116, canvasH - 78, 64, 56, 'speed', false, 'neutral');
    if (isSandbox) {
      drawButton('🗺 ' + t('sandbox.change_map'), canvasW - 380, canvasH - 78, 170, 56, 'sandbox_open_picker', false, 'secondary');
    }
  }

  function renderResult(state) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(0, 0, canvasW, canvasH);
    const win = state === 'RESULT_WIN';
    ctx.fillStyle = win ? '#FFD700' : '#E84A4A';
    ctx.font = 'bold 96px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(win ? t('result.victory') : t('result.defeat'), canvasW/2, 180);
    // 评级 (仅胜利)
    if (win && lastLevelWon) {
      const remain = lastLevelWon.ally_remain || 0;
      const initial = lastLevelWon.initial || Math.max(remain, 1);
      const ratio = remain / Math.max(initial, 1);
      let rank = 'C', col = '#9D9D9D';
      if (ratio >= 0.8) { rank = 'S'; col = '#FFD700'; }
      else if (ratio >= 0.6) { rank = 'A'; col = '#FF8A4A'; }
      else if (ratio >= 0.4) { rank = 'B'; col = '#7AAFFF'; }
      // 大评级字体 + 脉动
      const pulse = 1 + 0.08 * Math.sin(now() / 200);
      ctx.save();
      ctx.translate(canvasW/2, 320);
      ctx.scale(pulse, pulse);
      // 圆形勋章
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.beginPath(); ctx.arc(0, 0, 65, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = col;
      ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(0, 0, 65, 0, Math.PI*2); ctx.stroke();
      ctx.fillStyle = col;
      ctx.font = 'bold 78px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(rank, 0, 4);
      ctx.restore();
      // 统计
      ctx.fillStyle = '#FFF';
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(t('result.remain', { n: remain, total: initial }), canvasW/2, 420);
    }
    ctx.restore();
    // buttons
    const lvl = GameState.getCurrentLevelId();
    const m = /level_(\d+)/.exec(lvl);
    const num = m ? parseInt(m[1], 10) : 0;
    const canNext = win && num > 0 && num < 20;
    if (canNext) drawButton(t('result.next'), canvasW/2 - 280, canvasH - 144, 170, 64, 'next', true, 'primary');
    drawButton(t('result.replay'), canvasW/2 - 90, canvasH - 144, 180, 64, 'replay', false, 'warning');
    drawButton(t('result.back'), canvasW/2 + 110, canvasH - 144, 170, 64, 'back_to_select', false, 'neutral');
  }

  function renderSandboxResult() {
    // Dim backdrop
    ctx.save();
    ctx.fillStyle = 'rgba(15,18,30,0.7)';
    ctx.fillRect(0, 0, canvasW, canvasH);
    // White card centered
    const cardW = 560, cardH = 420;
    const cardX = canvasW/2 - cardW/2, cardY = 130;
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    roundRect(ctx, cardX + 6, cardY + 10, cardW, cardH, 24); ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    roundRect(ctx, cardX, cardY, cardW, cardH, 24); ctx.fill();

    const info = lastSandboxEnd || { winner: 'blue', ally_remain: 0, enemy_remain: 0 };
    const isBlue = info.winner === 'blue';
    const winColor = isBlue ? '#1CB0F6' : '#FF4B4B';
    const winLabel = isBlue ? t('sandbox.blue_wins') : t('sandbox.red_wins');
    // Pulsating crown
    ctx.save();
    ctx.translate(canvasW/2, cardY + 90);
    const pulse = 1 + 0.06 * Math.sin(now() / 250);
    ctx.scale(pulse, pulse);
    ctx.font = 'bold 84px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('👑', 0, 0);
    ctx.restore();
    // Big title
    ctx.fillStyle = winColor;
    ctx.font = 'bold 64px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(winLabel, canvasW/2, cardY + 200);
    // Subtitle
    ctx.fillStyle = '#777';
    ctx.font = '20px -apple-system, sans-serif';
    ctx.fillText(t('sandbox.battle_end'), canvasW/2, cardY + 232);
    // Survivors
    const remain = isBlue ? info.ally_remain : info.enemy_remain;
    ctx.fillStyle = '#3C3C3C';
    ctx.font = 'bold 28px -apple-system, sans-serif';
    ctx.fillText(t('sandbox.survivors', { n: remain }), canvasW/2, cardY + 290);
    ctx.restore();

    // Buttons under card
    const btnY = cardY + cardH + 24;
    drawButton(t('sandbox.replay'),    canvasW/2 - 270, btnY, 170, 64, 'sandbox_replay',   true,  'primary');
    drawButton(t('sandbox.pick_map'),  canvasW/2 - 90,  btnY, 180, 64, 'sandbox_pick_map', false, 'secondary');
    drawButton(t('sandbox.main_menu'), canvasW/2 + 100, btnY, 170, 64, 'back_to_menu',     false, 'neutral');
  }

  function renderSandboxMapPicker() {
    // 暗背景
    ctx.fillStyle = 'rgba(10,15,25,0.92)';
    ctx.fillRect(0, 0, canvasW, canvasH);
    // 标题
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🗺  ' + t('picker.title'), canvasW/2, 80);
    ctx.fillStyle = '#AAA';
    ctx.font = '20px sans-serif';
    ctx.fillText(t('picker.subtitle'), canvasW/2, 115);

    const maps = DATA.locations?.maps || {};
    const ids = Object.keys(maps);
    // 3 列 × 3 行布局, 9 张地图刚好排满, 全部可见无需滚动
    const cols = 3;
    const cw = 280, ch = 150;
    const gap = 16;
    const totalW = cols * cw + (cols - 1) * gap;
    const startX = (canvasW - totalW) / 2;
    const startY = 135;
    const currentMap = window._sandboxMap || 'plains';
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      const m = maps[id];
      const cx = startX + (i % cols) * (cw + gap);
      const cy = startY + Math.floor(i / cols) * (ch + gap);
      const isSelected = id === currentMap;
      // Card with rounded corners + gradient
      ctx.save();
      roundRect(ctx, cx, cy, cw, ch, 14);
      ctx.clip();
      const grd = ctx.createLinearGradient(cx, cy, cx, cy + ch);
      grd.addColorStop(0, m.sky_top || '#7898a8');
      grd.addColorStop(0.55, m.sky_bot || '#aab8a0');
      grd.addColorStop(0.6, m.ground_top || '#7a9858');
      grd.addColorStop(1, m.ground || '#6c8c4a');
      ctx.fillStyle = grd;
      ctx.fillRect(cx, cy, cw, ch);
      drawMapThumbnail(id, cx, cy, cw, ch);
      ctx.restore();
      // Border (selected = green ring, default = subtle)
      ctx.strokeStyle = isSelected ? '#58CC02' : 'rgba(255,255,255,0.35)';
      ctx.lineWidth = isSelected ? 4 : 2;
      roundRect(ctx, cx, cy, cw, ch, 14);
      ctx.stroke();
      // Name + tip strip at bottom
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.72)';
      roundRect(ctx, cx, cy + ch - 44, cw, 44, 0);
      ctx.fill();
      ctx.fillStyle = isSelected ? '#58CC02' : '#FFFFFF';
      ctx.font = 'bold 22px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(t('map.' + id), cx + cw/2, cy + ch - 26);
      ctx.fillStyle = '#BBB';
      ctx.font = '11px -apple-system, sans-serif';
      ctx.fillText(t('tip.' + id), cx + cw/2, cy + ch - 8);
      ctx.restore();
      _hitAreas.push({ x: cx, y: cy, w: cw, h: ch, id: 'sandbox_pick:' + id, type: 'button' });
    }
    drawButton(t('picker.back'), canvasW/2 - 100, canvasH - 84, 200, 64, 'sandbox_close_picker', false, 'neutral');
  }

  function drawMapThumbnail(id, cx, cy, cw, ch) {
    ctx.save();
    // 限制绘制区域
    ctx.beginPath();
    ctx.rect(cx, cy, cw, ch - 40);
    ctx.clip();
    const baseY = cy + ch * 0.55;
    // 不同地图画特征图形
    if (id === 'forest') {
      // 多个三角形 (树)
      ctx.fillStyle = '#3a6a3a';
      for (let i = 0; i < 8; i++) {
        const tx = cx + 20 + (i % 4) * 50;
        const ty = baseY + (i % 2) * 18;
        ctx.beginPath();
        ctx.moveTo(tx, ty - 22); ctx.lineTo(tx - 10, ty); ctx.lineTo(tx + 10, ty); ctx.fill();
      }
    } else if (id === 'desert') {
      // 半圆沙丘
      ctx.fillStyle = '#c8a060';
      for (const [x, y, r] of [[cx+50, baseY, 30], [cx+130, baseY-8, 36], [cx+170, baseY+10, 24]]) {
        ctx.beginPath(); ctx.ellipse(x, y, r, r*0.5, 0, Math.PI, 2*Math.PI); ctx.fill();
      }
      // 仙人掌
      ctx.fillStyle = '#3a7a3a';
      ctx.fillRect(cx + 30, baseY - 18, 4, 18);
    } else if (id === 'snow') {
      // 雪松三角
      ctx.fillStyle = '#2a4a2a';
      for (let i = 0; i < 5; i++) {
        const tx = cx + 30 + i * 35;
        ctx.beginPath();
        ctx.moveTo(tx, baseY - 24); ctx.lineTo(tx - 12, baseY); ctx.lineTo(tx + 12, baseY); ctx.fill();
      }
      // 雪覆盖
      ctx.fillStyle = '#fff';
      ctx.fillRect(cx, baseY, cw, ch - 40 - (baseY - cy));
    } else if (id === 'bridge') {
      // 河流 + 桥
      ctx.fillStyle = '#4a7aa8';
      ctx.fillRect(cx + cw/2 - 8, cy + 20, 16, ch - 80);
      ctx.fillStyle = '#6a4a2a';
      ctx.fillRect(cx + cw/2 - 18, baseY - 4, 36, 12);
    } else if (id === 'volcano') {
      // 黑曜石 + 熔岩
      ctx.fillStyle = '#1a1620';
      for (const [x, y] of [[cx+40, baseY-10], [cx+130, baseY+5], [cx+170, baseY-5]]) {
        ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI*2); ctx.fill();
      }
      ctx.fillStyle = '#ff6a3a';
      ctx.fillRect(cx + 60, baseY + 5, 50, 12);
      ctx.fillStyle = '#ffaa50';
      ctx.fillRect(cx + 65, baseY + 8, 40, 6);
    } else if (id === 'ruins') {
      // 柱子
      ctx.fillStyle = '#c8b890';
      for (let i = 0; i < 4; i++) {
        const tx = cx + 30 + i * 45;
        ctx.fillRect(tx, baseY - 32, 12, 32);
        ctx.fillRect(tx - 3, baseY - 36, 18, 6);
      }
    } else if (id === 'castle') {
      // 城墙
      ctx.fillStyle = '#9a8a78';
      ctx.fillRect(cx + 20, baseY - 30, cw - 40, 30);
      // 锯齿
      for (let i = 0; i < 6; i++) {
        ctx.fillRect(cx + 30 + i*30, baseY - 38, 12, 8);
      }
      // 塔楼
      ctx.fillStyle = '#7a6a58';
      ctx.fillRect(cx + 18, baseY - 50, 18, 50);
      ctx.fillRect(cx + cw - 38, baseY - 50, 18, 50);
      // 红顶
      ctx.fillStyle = '#8a3a3a';
      ctx.beginPath(); ctx.moveTo(cx + 18, baseY - 50); ctx.lineTo(cx + 27, baseY - 65); ctx.lineTo(cx + 36, baseY - 50); ctx.fill();
      ctx.beginPath(); ctx.moveTo(cx + cw - 38, baseY - 50); ctx.lineTo(cx + cw - 29, baseY - 65); ctx.lineTo(cx + cw - 20, baseY - 50); ctx.fill();
    } else {
      // plains: 小花
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = ['#FFE680','#FFAACC'][i%2];
        ctx.beginPath(); ctx.arc(cx + 40 + i * 35, baseY + 5, 4, 0, Math.PI*2); ctx.fill();
      }
    }
    ctx.restore();
  }

  function renderTutorialBubble() {
    if (!tutorialBubble) return;
    // 不在 RESULT/MENU 显示
    const st = GameState.getState();
    if (st !== 'PLAN' && st !== 'BATTLE') return;
    ctx.save();
    ctx.fillStyle = 'rgba(20,20,30,0.9)';
    const w = 360, h = 56;
    const x = canvasW/2 - w/2, y = 100;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tutorialBubble.prompt || '', x + w/2, y + h/2);
    ctx.restore();
  }

  function hitTest(x, y, button) {
    for (const h of _hitAreas) {
      if (x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h) {
        if (h.type === 'palette') {
          const type = h.id.split(':')[1];
          currentUnitSelected = type;
          InputSys.setSelected(type);
          emit('unit_type_selected', { type });
          return true;
        }
        if (h.type === 'button') {
          pressedButton = h.id;
          return true;
        }
      }
    }
    return false;
  }

  function hitTestUp(x, y, wasClick, button) {
    pressedButton = null;
    if (!wasClick) return false;
    for (const h of _hitAreas) {
      if (x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h) {
        if (h.type === 'button') {
          handleButton(h.id);
          return true;
        }
      }
    }
    return false;
  }

  function handleButton(id) {
    if (id.startsWith('level:')) { emit('level_selected', { level_id: id.slice(6) }); return; }
    if (id === 'start_battle') { emit('player_request_start', {}); return; }
    if (id === 'reset') { emit('player_request_reset', {}); return; }
    if (id === 'pause') { if (window.setPaused) window.setPaused(!window.isPaused()); return; }
    if (id === 'pause_resume') { if (window.setPaused) window.setPaused(false); return; }
    if (id === 'pause_replay') { if (window.setPaused) window.setPaused(false); emit('player_request_reset', {}); return; }
    if (id === 'pause_menu') { if (window.setPaused) window.setPaused(false); emit('menu_select', { option: 'back_to_menu' }); return; }
    if (id === 'sandbox_next_map') {
      const allMaps = Object.keys(DATA.locations?.maps || { plains: 1 });
      const cur = window._sandboxMap || 'plains';
      const idx = allMaps.indexOf(cur);
      const next = allMaps[(idx + 1) % allMaps.length];
      window._sandboxMap = next;
      const fakeZone = { ...DATA.locations.locations.find(l => l.id === 'sandbox'), map: next };
      emit('zone_entered', { level_id: 'sandbox', zone_data: fakeZone });
      return;
    }
    if (id === 'sandbox_open_picker') { sandboxMapPickerOpen = true; return; }
    if (id === 'sandbox_close_picker') { sandboxMapPickerOpen = false; return; }
    if (id.startsWith('sandbox_pick:')) {
      const mapId = id.slice('sandbox_pick:'.length);
      window._sandboxMap = mapId;
      window._sandboxMapPicked = true;
      // 清场重新加载
      EntitySys.getAllies().slice().forEach(e => emit('remove_request', { entity_id: e.id }));
      EntitySys.getEnemies().slice().forEach(e => emit('remove_request', { entity_id: e.id }));
      const fakeZone = { ...DATA.locations.locations.find(l => l.id === 'sandbox'), map: mapId };
      emit('zone_entered', { level_id: 'sandbox', zone_data: fakeZone });
      sandboxMapPickerOpen = false;
      return;
    }
    if (id === 'speed') {
      const cur = window.getTimeScale ? window.getTimeScale() : 1.0;
      const next = cur === 1.0 ? 2.0 : (cur === 2.0 ? 4.0 : 1.0);
      if (window.setTimeScale) window.setTimeScale(next);
      return;
    }
    if (id === 'next' || id === 'replay' || id === 'back_to_menu' || id === 'back_to_select'
        || id === 'sandbox_replay' || id === 'sandbox_pick_map') {
      emit('menu_select', { option: id });
      return;
    }
    if (id === 'menu.start' || id === 'menu.sandbox' || id === 'menu.continue') {
      emit('menu_select', { option: id.split('.')[1] });
      return;
    }
  }

  return { init, update, render, hitTest, hitTestUp };
})();
window.UISys = UISys;
