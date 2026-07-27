// ═══ ui_system.js — HUD/菜单/对话框/弹窗 ═══
const UI = (() => {
  let toast = null; // {text, until}
  let evidenceBookOpen = false;
  let dialog = null; // {type, payload, callback}
  let menuMode = 'main'; // main | playing | game_over | paused
  let hoverSlot = null; // when mouse over a slot
  let selectedEvidenceId = null;
  let selectedAccusedId = null;
  let gameOverData = null;
  const overlay = document.getElementById('ui-overlay');

  function init() {
    Bus.on('case_loaded', () => { menuMode = 'playing'; toast = null; selectedEvidenceId = null; gameOverData = null; hintDismissed = false; });
    Bus.on('player_search_intent', () => { hintDismissed = true; });
    Bus.on('toggle_evidence_book', () => { hintDismissed = true; });
    Bus.on('player_frame_request', () => { hintDismissed = true; });
    Bus.on('game_over', (d) => { menuMode = 'game_over'; gameOverData = d; });
    Bus.on('vote_resolved', () => { selectedEvidenceId = null; });
    Bus.on('toggle_evidence_book', () => { evidenceBookOpen = !evidenceBookOpen; });
    Bus.on('toggle_pause', () => {
      if (menuMode === 'playing') menuMode = 'paused';
      else if (menuMode === 'paused') menuMode = 'playing';
    });
    Bus.on('canvas_click', handleCanvasClick);
    document.getElementById('loading').classList.add('hidden');
    showMainMenu();
  }
  // === 主菜单(DOM) ===
  function showMainMenu() {
    overlay.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'ui-panel';
    wrap.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(circle at center, rgba(20,15,30,0.85), rgba(5,5,10,0.95));';
    const langs = [
      {code: 'en', label: 'English'},
      {code: 'zh', label: '中文'},
      {code: 'es', label: 'Español'},
      {code: 'fr', label: 'Français'},
      {code: 'de', label: 'Deutsch'},
      {code: 'ja', label: '日本語'},
      {code: 'ko', label: '한국어'}
    ];
    const langOptions = langs.map(l => `<option value="${l.code}" ${DATA._currentLang === l.code ? 'selected' : ''}>${l.label}</option>`).join('');
    wrap.innerHTML = `
      <div style="position:absolute;top:24px;right:32px;display:flex;align-items:center;gap:8px;">
        <span style="color:#a8a8b8;font-size:13px;">🌐 ${t('menu.language')}:</span>
        <select id="lang-select" style="background:#1a1d2e;color:#FFD700;border:1px solid #FFD700;padding:6px 10px;border-radius:4px;font-size:13px;cursor:pointer;">${langOptions}</select>
      </div>
      <h1 style="font-size:48px;color:#FFD700;letter-spacing:6px;margin-bottom:8px;text-shadow:0 0 16px rgba(255,215,0,0.4);">${t('game.title')}</h1>
      <p style="font-size:14px;color:#a8a8b8;margin-bottom:36px;letter-spacing:1px;text-align:center;max-width:560px;line-height:1.6;">${t('game.subtitle')}</p>
      <button class="menu-btn" id="btn-start">${t('menu.start')}</button>
      <button class="menu-btn" id="btn-howto" style="margin-top:8px;">📖 ${t('menu.how_to_play')}</button>
    `;
    overlay.appendChild(wrap);
    document.getElementById('btn-start').onclick = () => {
      Audio_.resumeIfNeeded();
      Audio_.play('sfx_button_click');
      overlay.innerHTML = '';
      menuMode = 'playing';
      Bus.emit('start_game', {caseId: 'case_1_tutorial'});
    };
    document.getElementById('btn-howto').onclick = () => {
      Audio_.play('sfx_button_click');
      showHowToPlay();
    };
    document.getElementById('lang-select').onchange = async (e) => {
      Audio_.play('sfx_button_click');
      await loadLanguage(e.target.value);
      showMainMenu(); // 重新渲染
    };
  }

  function showHowToPlay() {
    const modal = document.createElement('div');
    modal.id = 'htp-modal';
    modal.className = 'ui-panel';
    modal.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.85);z-index:100;';
    const sections = [
      ['htp.goal_h', 'htp.goal'],
      ['htp.phases_h', 'htp.phases'],
      ['htp.evidence_h', 'htp.evidence'],
      ['htp.vision_h', 'htp.vision'],
      ['htp.killer_h', 'htp.killer'],
      ['htp.detective_h', 'htp.detective'],
      ['htp.keys_h', 'htp.keys'],
      ['htp.tips_h', 'htp.tips']
    ];
    const sectionsHtml = sections.map(([h, b]) => `
      <div style="margin-bottom:18px;">
        <h3 style="color:#FFD700;font-size:16px;margin-bottom:6px;">${t(h)}</h3>
        <p style="color:#e8e8f0;font-size:13px;line-height:1.7;white-space:pre-line;">${t(b)}</p>
      </div>
    `).join('');
    modal.innerHTML = `
      <div style="background:#1a1d2e;border:2px solid #FFD700;border-radius:10px;padding:32px 40px;max-width:760px;max-height:88vh;overflow-y:auto;box-shadow:0 0 40px rgba(255,215,0,0.3);">
        <h2 style="color:#FFD700;font-size:28px;margin-bottom:24px;text-align:center;letter-spacing:3px;">${t('htp.title')}</h2>
        ${sectionsHtml}
        <div style="text-align:center;margin-top:24px;">
          <button class="menu-btn" id="htp-close">${t('menu.close')}</button>
        </div>
      </div>
    `;
    overlay.appendChild(modal);
    document.getElementById('htp-close').onclick = () => {
      Audio_.play('sfx_button_click');
      modal.remove();
    };
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
  }

  function showGameOver(data) {
    overlay.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'ui-panel';
    wrap.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(0,0,0,0.85);';
    const win = data.winner;
    const human = PlayerManager.getHuman();
    const humanIsKiller = human?.role === 'killer';
    const humanWon = (win === 'killer' && humanIsKiller) || (win === 'detectives' && !humanIsKiller);
    const titleColor = humanWon ? '#FFD700' : '#FF6B6B';
    const titleText = humanWon ? t('result.title.win') : t('result.title.lose');
    let subText;
    if (humanWon) {
      subText = humanIsKiller ? t('win.killer') : t('win.detective');
    } else {
      subText = humanIsKiller ? t('lose.killer') : t('lose.detective');
    }
    const killer = PlayerManager.getPlayer(PlayerManager.getKillerId());
    wrap.innerHTML = `
      <h1 style="font-size:64px;color:${titleColor};letter-spacing:8px;margin-bottom:8px;">${titleText}</h1>
      <p style="font-size:18px;color:#e8e8f0;margin-bottom:8px;">${subText}</p>
      <p style="font-size:14px;color:#a8a8b8;margin-bottom:24px;">真凶: ${killer ? killer.name : '?'}</p>
      <p style="font-size:16px;color:#FFD700;margin-bottom:36px;">${t('result.rep_gained', {n: humanWon ? 100 : 20})}</p>
      <div>
        <button class="menu-btn" id="btn-next">${t('result.continue')}</button>
        <button class="menu-btn danger" id="btn-menu">主菜单</button>
      </div>
    `;
    overlay.appendChild(wrap);
    document.getElementById('btn-next').onclick = () => {
      overlay.innerHTML = '';
      Bus.emit('start_game', {caseId: nextCaseId(data.caseId || 'case_1_tutorial')});
    };
    document.getElementById('btn-menu').onclick = () => {
      menuMode = 'main';
      showMainMenu();
    };
  }

  function nextCaseId(currentId) {
    const cases = (DATA.locations?.locations || []).map(c => c.id);
    const idx = cases.indexOf(currentId);
    return cases[(idx + 1) % cases.length] || cases[0];
  }

  function showPause() {
    overlay.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'ui-panel';
    wrap.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(0,0,0,0.7);';
    wrap.innerHTML = `
      <h2 style="color:#FFD700;font-size:36px;margin-bottom:24px;letter-spacing:4px;">PAUSED</h2>
      <button class="menu-btn" id="btn-resume">继续</button>
      <button class="menu-btn danger" id="btn-quit">回主菜单</button>
    `;
    overlay.appendChild(wrap);
    document.getElementById('btn-resume').onclick = () => { menuMode = 'playing'; overlay.innerHTML = ''; };
    document.getElementById('btn-quit').onclick = () => { menuMode = 'main'; showMainMenu(); };
  }

  function showToast(text) {
    toast = {text, until: performance.now() + 1800};
  }

  // === Dialog 系统 ===
  function openFrameDialog(roomId, callback) {
    dialog = {type: 'frame', roomId, callback};
  }
  function openTamperDialog(evidenceList, callback) {
    dialog = {type: 'tamper', evidenceList, callback};
  }
  function openDestroyDialog(evidenceList, callback) {
    dialog = {type: 'destroy', evidenceList, callback};
  }
  function openLensDialog(evidenceList, callback) {
    dialog = {type: 'lens', evidenceList, callback};
  }
  function openFalseTestimonyDialog(callback) {
    dialog = {type: 'false_testimony', callback};
  }
  function isModalOpen() { return dialog !== null; }
  function closeDialog(...args) {
    const d = dialog;
    dialog = null;
    if (d && d.callback) d.callback(...args);
  }

  // === Canvas绘制(HUD+游戏中UI) ===
  function draw(ctx, currentPhase, secondsLeft, currentRound) {
    if (menuMode !== 'playing' && menuMode !== 'game_over' && menuMode !== 'paused') return;
    drawHUD(ctx, currentPhase, secondsLeft, currentRound);
    if (currentPhase === 'investigate') drawInvestigateOverlay(ctx);
    if (currentPhase === 'trial') drawTrialPanel(ctx);
    if (currentPhase === 'voting') drawVotingPanel(ctx);
    if (evidenceBookOpen) drawEvidenceBook(ctx);
    if (dialog) drawDialog(ctx);
    if (toast) drawToast(ctx);
  }

  function drawHUD(ctx, phase, secondsLeft, round) {
    const W = ctx.canvas.width;
    ctx.save();
    // 顶部条
    ctx.fillStyle = 'rgba(15,18,28,0.92)';
    ctx.fillRect(0, 0, W, 60);
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, 60); ctx.lineTo(W, 60); ctx.stroke();
    // 阶段
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 18px PingFang SC, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(t('phase.' + phase), 16, 30);
    // 时间
    ctx.fillStyle = '#fff';
    ctx.font = '20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(Utils.formatTime(secondsLeft), W / 2, 30);
    // 回合
    ctx.fillStyle = '#a8a8b8';
    ctx.font = '14px PingFang SC, sans-serif';
    ctx.textAlign = 'right';
    const totalRounds = cfg('session.rounds', 3);
    const showRound = Math.max(1, Math.min(round, totalRounds));
    ctx.fillText(t('hud.round', {n: showRound}), W - 16, 30);

    // 玩家自己的角色徽章 — 嵌入在HUD条内右侧
    const human = PlayerManager.getHuman();
    if (human) {
      const badgeX = W - 280, badgeW = 76;
      ctx.fillStyle = human.role === 'killer' ? '#8B0000' : '#1B5E20';
      ctx.fillRect(badgeX, 14, badgeW, 32);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 13px PingFang SC, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(t('role.' + human.role), badgeX + badgeW / 2, 30);
      if (human.lens > 0) {
        Sprites.drawLens(ctx, badgeX - 14, 30, 10);
      }
    }
    ctx.restore();
  }

  function drawInvestigateOverlay(ctx) {
    const human = PlayerManager.getHuman();
    if (!human) return;
    // 提示
    if (human.searching) {
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(360 - 130, ctx.canvas.height - 90, 260, 36);
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`Searching ${t('room.' + human.searching.roomId)}... ${(human.searching.progress * 100) | 0}%`, 360, ctx.canvas.height - 72);
      ctx.restore();
    } else if (!hintDismissed) {
      const round = GameStateMachine.getRound();
      const sec = GameStateMachine.getSecondsLeft();
      const elapsed = cfg('session.investigate_seconds', 180) - sec;
      if (round === 1 && elapsed < 12) {
        // 首回合提示
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.78)';
        ctx.fillRect(360 - 200, ctx.canvas.height - 100, 400, 50);
        ctx.strokeStyle = 'rgba(255,215,0,0.6)';
        ctx.strokeRect(360 - 200, ctx.canvas.height - 100, 400, 50);
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 13px PingFang SC, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(human.role === 'killer' ?
          '你是凶手! 走入空房间≥5秒后按 F 栽赃他人' :
          '走进房间,点击 ? 或按 Space 搜证。Tab 查看证据册。',
          360, ctx.canvas.height - 84);
        ctx.fillStyle = '#a8a8b8';
        ctx.font = '11px sans-serif';
        ctx.fillText('提示自动消失 · 按任意键关闭', 360, ctx.canvas.height - 64);
        ctx.restore();
      }
    }
    // 凶手按钮
    if (human.role === 'killer') {
      drawKillerActions(ctx, human);
    }
    // 当前回合 banner
    drawRoundBanner(ctx);
  }
  let hintDismissed = false;
  let bannerShown = {round: 0, until: 0};
  function drawRoundBanner(ctx) {
    const r = GameStateMachine.getRound();
    if (r > 0 && bannerShown.round !== r) {
      bannerShown = {round: r, until: performance.now() + 2200};
    }
    const remaining = bannerShown.until - performance.now();
    if (remaining > 0 && r > 0) {
      const alpha = Math.min(1, remaining / 600);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = 'rgba(0,0,0,0.65)';
      ctx.fillRect(0, 200, ctx.canvas.width, 100);
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 48px PingFang SC, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(t('hud.round', {n: r}), ctx.canvas.width / 2, 250);
      ctx.restore();
    }
  }

  function drawKillerActions(ctx, p) {
    const x0 = 16, y0 = ctx.canvas.height - 134;
    const ventCD = p.ventCooldown > 0 ? `(${p.ventCooldown.toFixed(0)}s)` : 'READY';
    const btns = [
      {label: `[F] Frame ${p.framePerRoundLeft}/1`, color: '#8B0000', on: p.framePerRoundLeft > 0},
      {label: `[T] Tamper ${p.tamperPerRoundLeft}/1`, color: '#4B0082', on: p.tamperPerRoundLeft > 0},
      {label: `[X] Destroy ${p.destroyLeft}`, color: '#FF4500', on: p.destroyLeft > 0},
      {label: `[Y] Fake Testimony ${p.falseTestimonyLeft}`, color: '#A52A2A', on: p.falseTestimonyLeft > 0},
      {label: `[V] Vent  ${ventCD}`, color: '#1a3a5a', on: p.ventCooldown <= 0},
    ];
    ctx.save();
    btns.forEach((b, i) => {
      ctx.fillStyle = b.on ? b.color : '#444';
      ctx.fillRect(x0, y0 + i * 24, 180, 22);
      ctx.fillStyle = b.on ? '#fff' : '#888';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(b.label, x0 + 8, y0 + i * 24 + 11);
    });
    // alone timer
    const aloneSec = PlayerManager.getAloneSeconds(p.id);
    const need = cfg('killer_actions.frame_linger_seconds', 5);
    if (aloneSec > 0 && aloneSec < need) {
      ctx.fillStyle = '#FFD700';
      ctx.font = '12px monospace';
      ctx.fillText(`Alone: ${aloneSec.toFixed(1)}s / ${need}s`, x0, y0 - 8);
    } else if (aloneSec >= need) {
      ctx.fillStyle = '#34C759';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`Ready to frame!`, x0, y0 - 8);
    }
    ctx.restore();
  }

  function drawTrialPanel(ctx) {
    const W = ctx.canvas.width, H = ctx.canvas.height;
    ctx.save();
    ctx.fillStyle = 'rgba(20,18,40,0.95)';
    ctx.fillRect(0, 60, W, H - 60);
    // === 标题区:90-145 ===
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 22px PingFang SC, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE TRIAL — ' + t('phase.trial'), W / 2, 95);
    const speaker = Trial.getCurrentSpeaker();
    if (speaker) {
      ctx.fillStyle = '#fff';
      ctx.font = '15px PingFang SC, sans-serif';
      ctx.fillText(`${speaker.name} 正在发言...`, W / 2, 120);
    }
    // === 嫌疑人头像区:140-275(更紧凑) ===
    const players = PlayerManager.getAll();
    const pCardW = 100, pCardH = 120;
    const startX = (W - pCardW * players.length) / 2;
    for (let i = 0; i < players.length; i++) {
      const p = players[i];
      const x = startX + i * pCardW;
      const y = 145;
      ctx.fillStyle = p.alive ? '#252840' : '#1a1a25';
      ctx.fillRect(x + 6, y, pCardW - 12, pCardH);
      Sprites.drawPlayer(ctx, x + pCardW / 2, y + 42, p.color, 24, p.role, p.isHuman, p.alive);
      ctx.fillStyle = p.alive ? '#fff' : '#666';
      ctx.font = 'bold 13px PingFang SC, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(p.name, x + pCardW / 2, y + 86);
      if (speaker?.id === p.id) {
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.strokeRect(x + 6, y, pCardW - 12, pCardH);
      }
      const human = PlayerManager.getHuman();
      if (human && p.id !== human.id && human.suspicion?.[p.id] !== undefined) {
        const sus = human.suspicion[p.id];
        ctx.fillStyle = '#1a1a25';
        ctx.fillRect(x + 12, y + 102, pCardW - 24, 6);
        ctx.fillStyle = sus > 60 ? '#FF3B30' : sus > 30 ? '#FF9500' : '#34C759';
        ctx.fillRect(x + 12, y + 102, (pCardW - 24) * (sus / 100), 6);
      }
    }
    // === 你的证据 (左半) + 公示证据 (右半) 并排 ===
    drawTrialActionsForHuman(ctx);
    drawPresentedEvidence(ctx);
    ctx.restore();
  }

  function drawPresentedEvidence(ctx) {
    const W = ctx.canvas.width, H = ctx.canvas.height;
    const items = Trial.getPresentedEvidence();
    // 右半区
    const x0 = W / 2 + 10, y0 = 285, w = W / 2 - 50, h = H - y0 - 30;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(x0, y0, w, h);
    ctx.strokeStyle = 'rgba(255,215,0,0.3)';
    ctx.strokeRect(x0, y0, w, h);
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`公示证据池 (${items.length})`, x0 + 14, y0 + 20);
    if (items.length === 0) {
      ctx.fillStyle = '#666';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('暂无人出示证据', x0 + w / 2, y0 + h / 2);
    } else {
      const cardW = w - 28;
      const cardH = 48;
      const maxRows = Math.floor((h - 32) / (cardH + 6));
      items.slice(-maxRows).forEach((it, i) => {
        const x = x0 + 14, y = y0 + 28 + i * (cardH + 6);
        ctx.fillStyle = '#1a1d2e';
        ctx.fillRect(x, y, cardW, cardH);
        Sprites.drawEvidenceIcon(ctx, x + 22, y + 24, 16, it.evidence.category);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'left';
        const name = PlayerManager.getPlayer(it.presenterId)?.name || '';
        const acc = PlayerManager.getPlayer(it.accusedId)?.name || '';
        ctx.fillText(`${name} → ${acc}`, x + 46, y + 18);
        ctx.font = 'bold 11px sans-serif';
        let trialMark;
        if (it.evidence.mark === 'real') { ctx.fillStyle = '#34C759'; trialMark = '✓ 真'; }
        else if (it.evidence.mark === 'fake') { ctx.fillStyle = '#FF3B30'; trialMark = '✗ 伪'; }
        else { ctx.fillStyle = '#a8a8b8'; trialMark = '未鉴定'; }
        ctx.fillText(trialMark, x + 46, y + 36);
        if (it.evidence.alwaysReal) {
          ctx.fillStyle = '#FFD700';
          ctx.font = 'bold 10px sans-serif';
          ctx.fillText('★铁证', x + cardW - 50, y + 18);
        }
      });
    }
    ctx.restore();
  }

  function drawTrialActionsForHuman(ctx) {
    const human = PlayerManager.getHuman();
    if (!human || !human.alive) return;
    const W = ctx.canvas.width, H = ctx.canvas.height;
    ctx.save();
    // === 左半区面板:我的证据 + 行动按钮 ===
    const x0 = 40, y0 = 285, w = W / 2 - 50, h = H - y0 - 30;
    ctx.fillStyle = 'rgba(15,18,30,0.95)';
    ctx.fillRect(x0, y0, w, h);
    ctx.strokeStyle = 'rgba(255,215,0,0.3)';
    ctx.strokeRect(x0, y0, w, h);
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`你的证据 (${human.evidence_book.length})`, x0 + 14, y0 + 20);
    ctx.fillStyle = '#a8a8b8';
    ctx.font = '11px sans-serif';
    ctx.fillText('点选 → 点嫌疑人出示', x0 + 14, y0 + 36);

    // 行动按钮 (右上角对齐)
    let btnX = x0 + w - 120, btnY = y0 + 10;
    if (human.lens > 0 && human.role !== 'killer') {
      ctx.fillStyle = '#00E5FF';
      ctx.fillRect(btnX, btnY, 110, 24);
      ctx.fillStyle = '#000';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`[L] 鉴定 (${human.lens})`, btnX + 55, btnY + 12);
      btnY += 28;
    }
    if (human.role === 'killer' && human.falseTestimonyLeft > 0) {
      ctx.fillStyle = '#8B0000';
      ctx.fillRect(btnX, btnY, 110, 24);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`[Y] 假证 ${human.falseTestimonyLeft}`, btnX + 55, btnY + 12);
    }

    // 证据卡网格
    const allEv = human.evidence_book;
    const cardW = 90, cardH = 62, gap = 8;
    const listX = x0 + 14, listY = y0 + 48;
    const listW = w - 28, listH = h - 56;
    const perRow = Math.max(1, Math.floor(listW / (cardW + gap)));
    if (allEv.length === 0) {
      ctx.fillStyle = '#666';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('尚未收集证据', listX + listW / 2, listY + listH / 2);
    }
    allEv.forEach((ev, i) => {
      const row = Math.floor(i / perRow);
      const col = i % perRow;
      const x = listX + col * (cardW + gap);
      const y = listY + row * (cardH + gap);
      if (y + cardH > listY + listH) return; // 超出面板不画
      const selected = selectedEvidenceId === ev.id;
      ctx.fillStyle = selected ? '#FFD700' : '#252840';
      ctx.fillRect(x, y, cardW, cardH);
      Sprites.drawEvidenceIcon(ctx, x + 22, y + 30, 18, ev.category);
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'left';
      let lbl;
      if (ev.mark === 'real') { ctx.fillStyle = '#34C759'; lbl = '✓真'; }
      else if (ev.mark === 'fake') { ctx.fillStyle = '#FF3B30'; lbl = '✗伪'; }
      else { ctx.fillStyle = '#a8a8b8'; lbl = '?'; }
      ctx.fillText(lbl, x + 46, y + 22);
      ctx.fillStyle = selected ? '#000' : '#fff';
      ctx.font = 'bold 11px sans-serif';
      const accName = (PlayerManager.getPlayer(ev.accusedPlayerId)?.name || '?').slice(0, 3);
      ctx.fillText('→' + accName, x + 46, y + 42);
      if (ev.alwaysReal) {
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('★', x + cardW - 12, y + 12);
      }
    });
    ctx.restore();
  }

  function drawVotingPanel(ctx) {
    const W = ctx.canvas.width, H = ctx.canvas.height;
    ctx.save();
    ctx.fillStyle = 'rgba(20,15,40,0.97)';
    ctx.fillRect(0, 60, W, H - 60);
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 32px PingFang SC, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VOTE', W / 2, 120);
    ctx.fillStyle = '#a8a8b8';
    ctx.font = '14px sans-serif';
    ctx.fillText('点击你怀疑的人 · 弃权也是一种策略', W / 2, 150);

    const players = PlayerManager.getAll();
    const cardW = 130;
    const startX = (W - cardW * players.length) / 2;
    const human = PlayerManager.getHuman();
    const myVote = Voting.getVotes()[human?.id];
    for (let i = 0; i < players.length; i++) {
      const p = players[i];
      const x = startX + i * cardW;
      const y = 200;
      const myTarget = (myVote === p.id);
      ctx.fillStyle = !p.alive ? '#1a1a25' : myTarget ? '#3a2828' : '#252840';
      ctx.fillRect(x + 6, y, cardW - 12, 160);
      Sprites.drawPlayer(ctx, x + cardW / 2, y + 60, p.color, 32, p.role, p.isHuman, p.alive);
      ctx.fillStyle = p.alive ? '#fff' : '#666';
      ctx.font = 'bold 16px PingFang SC, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(p.name, x + cardW / 2, y + 120);
      // 已投者数
      const votes = Voting.getVotes();
      const cnt = Object.values(votes).filter(v => v === p.id).length;
      if (cnt > 0) {
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(`${cnt} 票`, x + cardW / 2, y + 142);
      }
      if (myTarget) {
        ctx.strokeStyle = '#FF3B30';
        ctx.lineWidth = 4;
        ctx.strokeRect(x + 6, y, cardW - 12, 160);
      }
    }
    // abstain
    const abX = W / 2 - 80;
    const abY = 400;
    const myAbstain = (myVote === 'abstain');
    ctx.fillStyle = myAbstain ? '#3a3a28' : '#252840';
    ctx.fillRect(abX, abY, 160, 50);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px PingFang SC, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(t('action.abstain'), abX + 80, abY + 25);
    if (myAbstain) {
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 3;
      ctx.strokeRect(abX, abY, 160, 50);
    }
    // 状态
    const totalAlive = PlayerManager.getAlive().length;
    const cast = Object.keys(Voting.getVotes()).length;
    ctx.fillStyle = '#a8a8b8';
    ctx.font = '14px sans-serif';
    ctx.fillText(`${cast}/${totalAlive} 已投票`, W / 2, abY + 80);
    ctx.restore();
  }

  function drawEvidenceBook(ctx) {
    const W = ctx.canvas.width, H = ctx.canvas.height;
    const human = PlayerManager.getHuman();
    if (!human) return;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 28px PingFang SC, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(t('hud.evidence_book'), W / 2, 60);
    ctx.fillStyle = '#a8a8b8';
    ctx.font = '12px sans-serif';
    ctx.fillText('Press Tab to close', W / 2, 84);
    if (human.evidence_book.length === 0) {
      ctx.fillStyle = '#666';
      ctx.font = '16px PingFang SC, sans-serif';
      ctx.fillText('Empty', W / 2, H / 2);
    } else {
      const cols = 4;
      const cardW = 200, cardH = 90;
      const startX = (W - cardW * cols) / 2;
      human.evidence_book.forEach((ev, i) => {
        const x = startX + (i % cols) * cardW;
        const y = 110 + Math.floor(i / cols) * cardH;
        ctx.fillStyle = '#1a1d2e';
        ctx.fillRect(x + 6, y, cardW - 12, cardH - 8);
        Sprites.drawEvidenceIcon(ctx, x + 30, y + 35, 22, ev.category);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 13px PingFang SC, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(t(`evidence.${ev.category}.reveal`), x + 60, y + 24);
        ctx.fillStyle = '#a8a8b8';
        ctx.font = '11px sans-serif';
        const room = ev.roomId === 'witness' ? 'Witness' : t('room.' + ev.roomId);
        const acc = PlayerManager.getPlayer(ev.accusedPlayerId)?.name || '?';
        ctx.fillText(`${room} → ${acc}`, x + 60, y + 44);
        ctx.font = 'bold 11px sans-serif';
        let markLabel = '';
        if (ev.mark === 'real') { ctx.fillStyle = '#34C759'; markLabel = '✓ 已鉴定:真'; }
        else if (ev.mark === 'fake') { ctx.fillStyle = '#FF3B30'; markLabel = '✗ 已鉴定:伪'; }
        else { ctx.fillStyle = '#888'; markLabel = '未鉴定 (用 L 放大镜)'; }
        if (ev.alwaysReal) markLabel += ' ★铁证';
        if (ev.tampered) markLabel += ' ⚠已篡改';
        ctx.fillText(markLabel, x + 60, y + 62);
      });
    }
    ctx.restore();
  }

  function drawDialog(ctx) {
    const W = ctx.canvas.width, H = ctx.canvas.height;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 22px PingFang SC, sans-serif';
    ctx.textAlign = 'center';
    if (dialog.type === 'frame') {
      ctx.fillText(`Frame in ${t('room.' + dialog.roomId)}`, W / 2, 100);
      ctx.fillStyle = '#a8a8b8';
      ctx.font = '13px sans-serif';
      ctx.fillText('Choose evidence type', W / 2, 130);
      const cats = ['weapon', 'motive_doc', 'movement_log', 'fingerprint'];
      cats.forEach((c, i) => {
        const x = W / 2 - 220 + i * 120, y = 160;
        const isHover = !!hoverCheck(x, y, 100, 100);
        const isSelected = dialog._chosenCat === c;
        ctx.fillStyle = isSelected ? '#3a2828' : (isHover ? '#2a3040' : '#252840');
        ctx.fillRect(x, y, 100, 100);
        if (isSelected) {
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, 100, 100);
        }
        Sprites.drawEvidenceIcon(ctx, x + 50, y + 40, 24, c);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px PingFang SC, sans-serif';
        // 用本地化文本(例: "武器" / "Weapon"),去掉"找到一件"前缀
        let label = t(`evidence.${c}.reveal`);
        label = label.replace(/^找到(一件|一份|一组|一处|一条)/, '').replace(/^Found? /i, '');
        ctx.fillText(label, x + 50, y + 82);
      });
      // accused 选择行 — 排除人类自己和已死的
      const human = PlayerManager.getHuman();
      ctx.fillStyle = '#a8a8b8';
      ctx.font = '13px sans-serif';
      ctx.fillText(t('action.accuse_short') + ':', W / 2, 290);
      const players = PlayerManager.getAlive().filter(p => p.id !== human?.id);
      players.forEach((p, i) => {
        const x = W / 2 - (players.length * 80) / 2 + i * 80, y = 310;
        ctx.fillStyle = (selectedAccusedId === p.id) ? '#3a2828' : '#252840';
        ctx.fillRect(x, y, 70, 80);
        Sprites.drawPlayer(ctx, x + 35, y + 30, p.color, 18, p.role, p.isHuman, true);
        ctx.fillStyle = '#fff';
        ctx.font = '11px PingFang SC, sans-serif';
        ctx.fillText(p.name, x + 35, y + 65);
      });
      // confirm/cancel
      drawDialogButtons(ctx, () => {
        if (dialog._chosenCat && selectedAccusedId !== null) closeDialog(dialog._chosenCat, selectedAccusedId);
      }, () => closeDialog(null, null));
    }
    else if (dialog.type === 'tamper') {
      ctx.fillText('Tamper a Document', W / 2, 100);
      drawEvidencePicker(ctx, dialog.evidenceList, (evId) => {
        // 选完后,选 newAccused
        dialog._pickedEvId = evId;
      });
      // 选newAccused
      drawAccusedPicker(ctx, 350, (pid) => {
        if (dialog._pickedEvId) closeDialog(dialog._pickedEvId, pid);
      });
      drawDialogButtons(ctx, () => {
        if (dialog._pickedEvId && selectedAccusedId !== null) closeDialog(dialog._pickedEvId, selectedAccusedId);
      }, () => closeDialog(null, null));
    }
    else if (dialog.type === 'destroy') {
      ctx.fillText('Destroy Evidence (1 use)', W / 2, 100);
      drawEvidencePicker(ctx, dialog.evidenceList, (evId) => closeDialog(evId));
      drawDialogButtons(ctx, () => {}, () => closeDialog(null));
    }
    else if (dialog.type === 'lens') {
      ctx.fillText('Verify Evidence', W / 2, 100);
      drawEvidencePicker(ctx, dialog.evidenceList, (evId) => {
        const human = PlayerManager.getHuman();
        if (human?.role === 'killer') {
          dialog._evIdLensChoice = evId;
        } else {
          closeDialog(evId, false);
        }
      });
      // killer额外有"说谎"按钮
      if (PlayerManager.getHuman()?.role === 'killer') {
        const human = PlayerManager.getHuman();
        ctx.fillStyle = '#a8a8b8';
        ctx.font = '13px sans-serif';
        ctx.fillText('You are killer — choose to LIE or TELL TRUTH about result', W / 2, 360);
        // truth button
        ctx.fillStyle = '#1B5E20';
        ctx.fillRect(W / 2 - 200, 380, 160, 40);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 14px sans-serif';
        ctx.fillText('Tell Truth', W / 2 - 120, 405);
        // lie button
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(W / 2 + 40, 380, 160, 40);
        ctx.fillStyle = '#fff';
        ctx.fillText('Lie', W / 2 + 120, 405);
      }
      drawDialogButtons(ctx, () => {}, () => closeDialog(null, false));
    }
    else if (dialog.type === 'false_testimony') {
      ctx.fillText('Submit False Testimony — Accuse Whom?', W / 2, 100);
      drawAccusedPicker(ctx, 200, (pid) => closeDialog(pid));
      drawDialogButtons(ctx, () => {
        if (selectedAccusedId !== null) closeDialog(selectedAccusedId);
      }, () => closeDialog(null));
    }
    ctx.restore();
  }

  function drawEvidencePicker(ctx, list, onPick) {
    const W = ctx.canvas.width;
    list.forEach((ev, i) => {
      const x = 80 + (i % 5) * 150, y = 160 + Math.floor(i / 5) * 80;
      const selected = (dialog._pickedEvId === ev.id) || (dialog._evIdLensChoice === ev.id);
      ctx.fillStyle = selected ? '#3a2828' : '#252840';
      ctx.fillRect(x, y, 130, 60);
      Sprites.drawEvidenceIcon(ctx, x + 22, y + 30, 18, ev.category);
      ctx.fillStyle = '#fff'; ctx.font = '11px sans-serif'; ctx.textAlign = 'left';
      ctx.fillText(t(`evidence.${ev.category}.reveal`), x + 46, y + 22);
      ctx.fillText('→' + (PlayerManager.getPlayer(ev.accusedPlayerId)?.name || ''), x + 46, y + 38);
    });
  }

  function drawAccusedPicker(ctx, baseY, onPick) {
    const W = ctx.canvas.width;
    const human = PlayerManager.getHuman();
    const players = PlayerManager.getAlive().filter(p => p.id !== human?.id);
    players.forEach((p, i) => {
      const x = W / 2 - (players.length * 80) / 2 + i * 80, y = baseY;
      ctx.fillStyle = (selectedAccusedId === p.id) ? '#3a2828' : '#252840';
      ctx.fillRect(x, y, 70, 80);
      Sprites.drawPlayer(ctx, x + 35, y + 30, p.color, 18, p.role, p.isHuman, true);
      ctx.fillStyle = '#fff'; ctx.font = '11px PingFang SC, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(p.name, x + 35, y + 65);
    });
  }

  function drawDialogButtons(ctx, onConfirm, onCancel) {
    const W = ctx.canvas.width, H = ctx.canvas.height;
    ctx.fillStyle = '#1B5E20';
    ctx.fillRect(W / 2 - 160, H - 80, 140, 40);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('Confirm', W / 2 - 90, H - 60);
    ctx.fillStyle = '#444';
    ctx.fillRect(W / 2 + 20, H - 80, 140, 40);
    ctx.fillStyle = '#fff';
    ctx.fillText('Cancel', W / 2 + 90, H - 60);
    dialog._confirm = onConfirm;
    dialog._cancel = onCancel;
  }

  function drawToast(ctx) {
    if (!toast || performance.now() > toast.until) { toast = null; return; }
    const W = ctx.canvas.width, H = ctx.canvas.height;
    ctx.save();
    const text = toast.text;
    ctx.font = 'bold 16px PingFang SC, sans-serif';
    const w = ctx.measureText(text).width + 40;
    ctx.fillStyle = 'rgba(15,18,30,0.95)';
    ctx.fillRect((W - w) / 2, H - 140, w, 36);
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 1;
    ctx.strokeRect((W - w) / 2, H - 140, w, 36);
    ctx.fillStyle = '#FFD700';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, W / 2, H - 122);
    ctx.restore();
  }

  // === click handling ===
  function handleCanvasClick({x, y}) {
    if (menuMode === 'paused') return;
    if (dialog) { handleDialogClick(x, y); return; }
    // 投票面板点击
    const phase = GameStateMachine.getPhase();
    if (phase === 'voting') {
      handleVotingClick(x, y);
      return;
    }
    if (phase === 'trial') {
      handleTrialClick(x, y);
      return;
    }
  }

  function handleDialogClick(x, y) {
    const W = Render.getCanvas().width, H = Render.getCanvas().height;
    // confirm
    if (x >= W / 2 - 160 && x <= W / 2 - 20 && y >= H - 80 && y <= H - 40) {
      if (dialog._confirm) dialog._confirm();
      return;
    }
    if (x >= W / 2 + 20 && x <= W / 2 + 160 && y >= H - 80 && y <= H - 40) {
      if (dialog._cancel) dialog._cancel();
      return;
    }
    // type-specific
    if (dialog.type === 'frame') {
      const cats = ['weapon', 'motive_doc', 'movement_log', 'fingerprint'];
      cats.forEach((c, i) => {
        const cx = W / 2 - 220 + i * 120, cy = 160;
        if (x >= cx && x <= cx + 100 && y >= cy && y <= cy + 100) {
          dialog._chosenCat = c;
        }
      });
      // accused picker
      pickAccusedAt(x, y, 310);
    } else if (dialog.type === 'tamper') {
      pickEvidenceListAt(x, y, dialog.evidenceList);
      pickAccusedAt(x, y, 350);
    } else if (dialog.type === 'destroy') {
      pickEvidenceListAt(x, y, dialog.evidenceList, (id) => closeDialog(id));
    } else if (dialog.type === 'lens') {
      pickEvidenceListAt(x, y, dialog.evidenceList);
      const human = PlayerManager.getHuman();
      if (human?.role === 'killer' && dialog._evIdLensChoice) {
        if (x >= W / 2 - 200 && x <= W / 2 - 40 && y >= 380 && y <= 420) {
          closeDialog(dialog._evIdLensChoice, false); // truth
        } else if (x >= W / 2 + 40 && x <= W / 2 + 200 && y >= 380 && y <= 420) {
          closeDialog(dialog._evIdLensChoice, true); // lie
        }
      }
    } else if (dialog.type === 'false_testimony') {
      pickAccusedAt(x, y, 200);
    }
  }

  function pickEvidenceListAt(x, y, list, onAfterPick) {
    list.forEach((ev, i) => {
      const ex = 80 + (i % 5) * 150, ey = 160 + Math.floor(i / 5) * 80;
      if (x >= ex && x <= ex + 130 && y >= ey && y <= ey + 60) {
        dialog._pickedEvId = ev.id;
        if (dialog.type === 'lens') dialog._evIdLensChoice = ev.id;
        if (onAfterPick) onAfterPick(ev.id);
      }
    });
  }
  function pickAccusedAt(x, y, baseY) {
    const W = Render.getCanvas().width;
    const human = PlayerManager.getHuman();
    const players = PlayerManager.getAlive().filter(p => p.id !== human?.id);
    players.forEach((p, i) => {
      const px = W / 2 - (players.length * 80) / 2 + i * 80, py = baseY;
      if (x >= px && x <= px + 70 && y >= py && y <= py + 80) {
        selectedAccusedId = p.id;
      }
    });
  }
  function hoverCheck(x, y, w, h) {
    const m = Input.getMouse();
    return m.x >= x && m.x <= x + w && m.y >= y && m.y <= y + h;
  }

  function handleVotingClick(x, y) {
    const W = Render.getCanvas().width;
    const players = PlayerManager.getAll();
    const cardW = 130;
    const startX = (W - cardW * players.length) / 2;
    for (let i = 0; i < players.length; i++) {
      const p = players[i];
      if (!p.alive) continue;
      const cx = startX + i * cardW + 6, cy = 200;
      if (x >= cx && x <= cx + cardW - 12 && y >= cy && y <= cy + 160) {
        const human = PlayerManager.getHuman();
        if (!human || !human.alive) return;
        if (p.id === human.id) { showToast("Can't vote yourself"); return; }
        Bus.emit('vote_cast', {voterId: human.id, targetId: p.id});
        return;
      }
    }
    // abstain
    if (x >= W / 2 - 80 && x <= W / 2 + 80 && y >= 400 && y <= 450) {
      const human = PlayerManager.getHuman();
      if (human?.alive) Bus.emit('vote_cast', {voterId: human.id, targetId: 'abstain'});
    }
  }

  function handleTrialClick(x, y) {
    const human = PlayerManager.getHuman();
    if (!human?.alive) return;
    const W = Render.getCanvas().width, H = Render.getCanvas().height;
    // 我的evidence栏 — 左半区网格(与 drawTrialActionsForHuman 对应)
    const x0 = 40, y0 = 285, w = W / 2 - 50, listH = H - y0 - 30 - 56;
    const listX = x0 + 14, listY = y0 + 48;
    const listW = w - 28;
    const cardW = 90, cardH = 62, gap = 8;
    const perRow = Math.max(1, Math.floor(listW / (cardW + gap)));
    const allEv = human.evidence_book;
    allEv.forEach((ev, i) => {
      const row = Math.floor(i / perRow);
      const col = i % perRow;
      const ex = listX + col * (cardW + gap);
      const ey = listY + row * (cardH + gap);
      if (ey + cardH > listY + listH) return;
      if (x >= ex && x <= ex + cardW && y >= ey && y <= ey + cardH) {
        selectedEvidenceId = ev.id;
      }
    });
    // 点击suspect头像 → 出示 (新布局: pCardW=100, y=145, h=120)
    if (selectedEvidenceId) {
      const players = PlayerManager.getAll();
      const pCardW = 100;
      const startX = (W - pCardW * players.length) / 2;
      for (let i = 0; i < players.length; i++) {
        const p = players[i];
        if (!p.alive) continue;
        if (p.id === human.id) continue;
        const cx = startX + i * pCardW + 6, cy = 145;
        if (x >= cx && x <= cx + pCardW - 12 && y >= cy && y <= cy + 120) {
          Bus.emit('player_present_evidence', {presenterId: human.id, evidenceId: selectedEvidenceId, accusedId: p.id});
          selectedEvidenceId = null;
          return;
        }
      }
    }
    // 行动按钮(右上角在左半面板内)
    const btnX = 40 + (W / 2 - 50) - 120;
    let btnY = 285 + 10;
    if (human.lens > 0 && human.role !== 'killer') {
      if (x >= btnX && x <= btnX + 110 && y >= btnY && y <= btnY + 24) {
        Bus.emit('player_use_lens_request', {});
        return;
      }
      btnY += 28;
    }
    if (human.role === 'killer' && human.falseTestimonyLeft > 0) {
      if (x >= btnX && x <= btnX + 110 && y >= btnY && y <= btnY + 24) {
        Bus.emit('player_false_testimony_request', {});
      }
    }
  }

  function reactToMenuMode() {
    if (menuMode === 'main') showMainMenu();
    else if (menuMode === 'game_over' && gameOverData) { showGameOver(gameOverData); gameOverData = null; }
    else if (menuMode === 'paused') showPause();
  }

  return {
    init, draw, showToast,
    openFrameDialog, openTamperDialog, openDestroyDialog, openLensDialog, openFalseTestimonyDialog,
    closeDialog, isModalOpen, get activePopup() { return menuMode; },
    reactToMenuMode, showMainMenu, showGameOver,
    get isEvidenceBookOpen() { return evidenceBookOpen; },
    get menuMode() { return menuMode; }, set menuMode(v) { menuMode = v; }
  };
})();
