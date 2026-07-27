// ui.js — UI updates, animations, particle effects

// Screen management
export function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = document.getElementById(screenId);
  if (screen) {
    screen.classList.add('active');
    screen.scrollTop = 0;
  }
}

// Heartbeat meter update
export function updateHeartbeat(current, max = 30) {
  const meter = document.getElementById('heartbeat-meter');
  const label = document.getElementById('heartbeat-label');
  if (meter) {
    const pct = (current / max) * 100;
    meter.style.width = pct + '%';
    if (current >= 26) meter.className = 'heartbeat-fill gold';
    else if (current >= 16) meter.className = 'heartbeat-fill high';
    else meter.className = 'heartbeat-fill';
  }
  if (label) label.textContent = `${current}/${max}`;
}

// Update HUD info
export function updateHUD(game) {
  const roundEl = document.getElementById('hud-round');
  const reverseEl = document.getElementById('hud-reverse');
  const geminiEl = document.getElementById('hud-gemini');
  const questionNum = document.getElementById('hud-question-num');

  if (roundEl) {
    const roundNames = { 1: '表层探测', 2: '中层博弈', 3: '深层触达' };
    roundEl.textContent = `第${game.round}轮 · ${roundNames[game.round]}`;
    roundEl.className = `round-badge round-${game.round}`;
  }
  if (reverseEl) reverseEl.textContent = `↺ ×${game.reverseCount}`;
  if (geminiEl) geminiEl.textContent = `✨ ×${game.geminiGuideCount}`;
  if (questionNum) questionNum.textContent = `第 ${game.questionIndex + 1}/5 题`;

  updateHeartbeat(game.heartbeat);
}

// Countdown timer
let timerInterval = null;

export function startTimer(seconds, onTick, onEnd) {
  stopTimer();
  let remaining = seconds;
  const timerEl = document.getElementById('timer-display');
  const timerBar = document.getElementById('timer-bar');

  const update = () => {
    if (timerEl) timerEl.textContent = remaining + 's';
    if (timerBar) {
      const pct = (remaining / seconds) * 100;
      timerBar.style.width = pct + '%';
      timerBar.className = remaining <= 5 ? 'timer-bar urgent' : 'timer-bar';
    }
    if (onTick) onTick(remaining);
  };

  update();
  timerInterval = setInterval(() => {
    remaining--;
    if (remaining <= 0) {
      stopTimer();
      if (timerEl) timerEl.textContent = '0s';
      if (timerBar) timerBar.style.width = '0%';
      if (onEnd) onEnd();
    } else {
      update();
    }
  }, 1000);
}

export function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// Particle effects
export function spawnParticles(type = 'correct') {
  const container = document.getElementById('particle-container');
  if (!container) return;

  const configs = {
    correct: { count: 15, color: '#C9956C', shape: '✦', duration: 1200 },
    dual_resonance: { count: 30, color: '#F5C842', shape: '♡', duration: 2000 },
    full_meter: { count: 40, color: '#F5C842', shape: '✨', duration: 2500 },
    partial: { count: 8, color: '#C0C0C0', shape: '·', duration: 800 }
  };

  const config = configs[type] || configs.correct;

  for (let i = 0; i < config.count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.textContent = config.shape;
    p.style.color = config.color;
    p.style.left = (30 + Math.random() * 40) + '%';
    p.style.top = (30 + Math.random() * 40) + '%';
    p.style.setProperty('--tx', (Math.random() - 0.5) * 200 + 'px');
    p.style.setProperty('--ty', (Math.random() - 0.5) * 200 + 'px');
    p.style.animationDuration = config.duration + 'ms';
    container.appendChild(p);
    setTimeout(() => p.remove(), config.duration);
  }
}

// Card flip animation
export function flipCards(leftContent, rightContent) {
  return new Promise(resolve => {
    const leftCard = document.getElementById('reveal-left');
    const rightCard = document.getElementById('reveal-right');
    if (leftCard) {
      leftCard.classList.add('flipping');
      setTimeout(() => {
        leftCard.innerHTML = leftContent;
        leftCard.classList.remove('flipping');
        leftCard.classList.add('flipped');
      }, 250);
    }
    if (rightCard) {
      rightCard.classList.add('flipping');
      setTimeout(() => {
        rightCard.innerHTML = rightContent;
        rightCard.classList.remove('flipping');
        rightCard.classList.add('flipped');
      }, 250);
    }
    setTimeout(resolve, 500);
  });
}

// Truth dialogue warm orange overlay
export function showDialogueOverlay(show = true) {
  const overlay = document.getElementById('dialogue-overlay');
  if (overlay) {
    overlay.classList.toggle('active', show);
  }
}

// Gemini card slide-in
export function showGeminiCards(questions) {
  const container = document.getElementById('gemini-cards');
  if (!container) return;
  container.innerHTML = '';
  container.classList.add('active');

  questions.forEach((q, i) => {
    const card = document.createElement('div');
    card.className = 'gemini-card';
    card.style.animationDelay = (i * 0.1) + 's';
    card.textContent = typeof q === 'string' ? q : q.text;
    card.addEventListener('click', () => {
      container.querySelectorAll('.gemini-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      container.dataset.selected = i;
    });
    container.appendChild(card);
  });
}

export function hideGeminiCards() {
  const container = document.getElementById('gemini-cards');
  if (container) {
    container.classList.remove('active');
    container.innerHTML = '';
  }
}

// Toast notification
export function showToast(message, duration = 2000) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Question card display
export function displayQuestion(question) {
  const el = document.getElementById('question-text');
  const card = document.getElementById('question-card');
  if (el) el.textContent = question.text;
  if (card) {
    card.className = 'question-card';
    if (question.type === 'secret') card.classList.add('card-secret');
    else if (question.type === 'memory') card.classList.add('card-memory');
    else if (question.type === 'courage') card.classList.add('card-courage');
    else if (question.source === 'gemini') card.classList.add('card-gemini');
    else card.classList.add(`card-level-${question.level}`);
  }

  const geminiTag = document.getElementById('gemini-tag');
  if (geminiTag) {
    geminiTag.style.display = question.source === 'gemini' ? 'inline' : 'none';
  }
}

// Settlement screen
export function renderSettlement(data) {
  const el = document.getElementById('settlement-content');
  if (!el) return;

  const meterClass = data.heartbeat >= 26 ? 'gold' : data.heartbeat >= 16 ? 'high' : '';

  el.innerHTML = `
    <div class="settlement-heartbeat">
      <div class="big-heart ${meterClass}">♡</div>
      <div class="settlement-number">${data.heartbeat}<span class="settlement-max">/30</span></div>
    </div>
    <div class="settlement-emotion">${data.emotionLevel}</div>
    <div class="settlement-stats">
      <div class="stat-item">
        <span class="stat-value">${data.matchRate}%</span>
        <span class="stat-label">猜中率</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">${data.totalQuestions}</span>
        <span class="stat-label">总题数</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">${data.dualResonances}</span>
        <span class="stat-label">双向共鸣</span>
      </div>
    </div>
    ${data.mvp ? `<div class="settlement-mvp">🏆 本局最懂你：${data.mvp}</div>` : '<div class="settlement-mvp">你们旗鼓相当！</div>'}
  `;
}

// Archive timeline
export function renderArchive(records) {
  const el = document.getElementById('archive-list');
  if (!el) return;

  if (records.length === 0) {
    el.innerHTML = '<div class="archive-empty">还没有记录，开始你们的第一局游戏吧！</div>';
    return;
  }

  const typeLabels = { confirm: '确认', explore: '探索', express: '表达', test: '测试' };
  const resultLabels = { match: '♡ 猜中', partial: '~ 接近', miss: '· 未中', dual_resonance: '♡♡ 共鸣' };

  el.innerHTML = records.slice().reverse().map((r, i) => `
    <div class="archive-item ${r.result}">
      <div class="archive-date">${new Date(r.timestamp).toLocaleDateString('zh-CN')} 第${r.round}轮</div>
      <div class="archive-question">${r.question}</div>
      <div class="archive-details">
        <span class="archive-type">${typeLabels[r.intention?.type] || '?'}</span>
        <span class="archive-result">${resultLabels[r.result] || r.result}</span>
      </div>
      <div class="archive-intention">"${r.intention?.text || ''}"</div>
      ${r.userTag ? `<span class="archive-tag">${r.userTag}</span>` : ''}
    </div>
  `).join('');
}
