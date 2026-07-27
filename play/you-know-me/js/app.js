// app.js — Main application controller
import { Game, PHASES } from './game.js';
import { INTENTION_TYPES } from './questions.js';
import * as UI from './ui.js';
import * as Audio from './audio.js';
import * as Archive from './archive.js';
import * as Gemini from './gemini.js';
import { generateShareCard, downloadShareCard } from './share.js';

const game = new Game();
let selectedIntentionType = null;
let geminiSuggestions = null;

// ===== INITIALIZATION =====
export function init() {
  bindGlobalEvents();
  UI.showScreen('screen-welcome');
  renderArchiveScreen();
}

function bindGlobalEvents() {
  // Welcome
  el('btn-start').addEventListener('click', () => {
    Audio.resumeAudio();
    Audio.playClick();
    UI.showScreen('screen-setup');
  });
  el('btn-archive-menu').addEventListener('click', () => {
    Audio.playClick();
    renderArchiveScreen();
    UI.showScreen('screen-archive');
  });
  el('btn-settings-menu').addEventListener('click', () => {
    Audio.playClick();
    loadSettings();
    UI.showScreen('screen-settings');
  });

  // Setup
  el('btn-start-game').addEventListener('click', startGame);

  // Questioning phase
  el('btn-submit-intention').addEventListener('click', submitIntention);
  el('btn-ai-suggest').addEventListener('click', requestAISuggestions);
  el('intention-text').addEventListener('input', updateCharCount);

  // Answering phase
  el('btn-submit-answer').addEventListener('click', submitAnswer);

  // Privacy screens
  el('btn-pass-guesser').addEventListener('click', () => {
    Audio.playClick();
    enterAnsweringPhase();
  });
  el('btn-pass-reveal').addEventListener('click', () => {
    Audio.playClick();
    doReveal();
  });

  // Reveal actions
  el('btn-reverse').addEventListener('click', initiateReverse);
  el('btn-skip-reverse').addEventListener('click', () => {
    Audio.playClick();
    afterReveal();
  });
  el('btn-continue-after-reveal').addEventListener('click', () => {
    Audio.playClick();
    afterReveal();
  });

  // Dialogue
  el('btn-dialogue-done').addEventListener('click', () => {
    Audio.playClick();
    UI.showDialogueOverlay(false);
    game.finishDialogue();
    goToPhase();
  });
  el('btn-gemini-guide').addEventListener('click', requestGeminiGuide);
  el('btn-mark-valuable').addEventListener('click', markValuable);

  // Reverse questioning
  el('btn-submit-reverse-intention').addEventListener('click', submitReverseIntention);
  el('reverse-intention-text').addEventListener('input', updateReverseCharCount);
  el('btn-pass-reverse').addEventListener('click', () => {
    Audio.playClick();
    enterReverseAnswering();
  });
  el('btn-submit-reverse-answer').addEventListener('click', submitReverseAnswer);

  // Round end
  el('btn-next-round').addEventListener('click', () => {
    Audio.playClick();
    Audio.playRoundTransition();
    game.nextRound();
    goToPhase();
  });

  // Settlement
  el('btn-share-card').addEventListener('click', createShareCard);
  el('btn-view-report').addEventListener('click', viewReport);
  el('btn-play-again').addEventListener('click', () => {
    Audio.playClick();
    game.reset();
    UI.showScreen('screen-welcome');
  });
  el('btn-view-archive').addEventListener('click', () => {
    Audio.playClick();
    renderArchiveScreen();
    UI.showScreen('screen-archive');
  });

  // Archive
  el('btn-archive-back').addEventListener('click', () => {
    Audio.playClick();
    UI.showScreen('screen-welcome');
  });

  // Settings
  el('btn-settings-back').addEventListener('click', () => {
    Audio.playClick();
    UI.showScreen('screen-welcome');
  });
  el('toggle-sound').addEventListener('click', toggleSound);
  el('btn-save-gemini-key').addEventListener('click', saveGeminiKey);
  el('btn-clear-data').addEventListener('click', () => {
    if (confirm('确定清除所有游戏数据？此操作不可恢复。')) {
      Archive.clearArchive();
      UI.showToast('数据已清除');
    }
  });

  // Archive filters
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderArchiveScreen(btn.dataset.filter);
    });
  });

  // Report back
  el('btn-report-back').addEventListener('click', () => {
    Audio.playClick();
    UI.showScreen('screen-settlement');
  });
}

// ===== GAME FLOW =====
function startGame() {
  const nameA = el('input-name-a').value.trim() || '玩家A';
  const nameB = el('input-name-b').value.trim() || '玩家B';
  const apiKey = el('input-gemini-key').value.trim();

  if (apiKey) Gemini.setGeminiKey(apiKey);

  Audio.playClick();
  game.reset();
  game.setup(nameA, nameB);
  goToPhase();
}

function goToPhase() {
  UI.updateHUD(game);

  switch (game.phase) {
    case PHASES.QUESTIONING:
      enterQuestioningPhase();
      break;
    case PHASES.PASS_TO_GUESSER:
      showPassScreen('guesser');
      break;
    case PHASES.ANSWERING:
      enterAnsweringPhase();
      break;
    case PHASES.PASS_TO_REVEAL:
      showPassScreen('reveal');
      break;
    case PHASES.REVEAL:
      doReveal();
      break;
    case PHASES.DIALOGUE:
      showDialogue();
      break;
    case PHASES.REVERSE_PROMPT:
      showReversePrompt();
      break;
    case PHASES.REVERSE_QUESTIONING:
      enterReverseQuestioning();
      break;
    case PHASES.REVERSE_PASS:
      showPassScreen('reverse');
      break;
    case PHASES.REVERSE_ANSWERING:
      enterReverseAnswering();
      break;
    case PHASES.REVERSE_REVEAL:
      doReverseReveal();
      break;
    case PHASES.ROUND_END:
      showRoundEnd();
      break;
    case PHASES.SETTLEMENT:
      showSettlement();
      break;
  }
}

// ===== QUESTIONING PHASE =====
function enterQuestioningPhase() {
  UI.showScreen('screen-game');
  UI.updateHUD(game);
  UI.displayQuestion(game.currentQuestion);

  // Show asker info
  const asker = game.getAsker();
  el('current-role-label').textContent = `${asker.name}，轮到你出题`;
  el('phase-label').textContent = '写下你的隐藏意图';

  // Reset inputs
  selectedIntentionType = null;
  el('intention-text').value = '';
  updateCharCount();
  el('btn-submit-intention').disabled = true;
  document.querySelectorAll('.intention-type-btn').forEach(b => b.classList.remove('selected'));
  el('suggestion-container').innerHTML = '';
  geminiSuggestions = null;

  // Show questioning controls, hide answering
  el('questioning-controls').style.display = 'block';
  el('answering-controls').style.display = 'none';
  el('reveal-controls').style.display = 'none';

  // Intention type buttons
  document.querySelectorAll('.intention-type-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.intention-type-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedIntentionType = btn.dataset.type;
      Audio.playClick();
      checkIntentionReady();
    };
  });

  // AI suggest button visibility
  el('btn-ai-suggest').style.display = Gemini.isGeminiEnabled() ? 'flex' : 'none';

  // Start timer
  UI.startTimer(60, (remaining) => {
    if (remaining <= 5) Audio.playTick(true);
    const display = el('timer-display');
    if (display) display.className = remaining <= 5 ? 'timer-display urgent' : 'timer-display';
  }, () => {
    // Auto-submit with whatever they have
    if (selectedIntentionType && el('intention-text').value.trim()) {
      submitIntention();
    }
  });
}

function updateCharCount() {
  const text = el('intention-text').value;
  const count = el('char-count');
  count.textContent = `${text.length}/50`;
  count.className = text.length > 50 ? 'char-count over' : text.length > 40 ? 'char-count warn' : 'char-count';
  checkIntentionReady();
}

function checkIntentionReady() {
  const text = el('intention-text').value.trim();
  el('btn-submit-intention').disabled = !selectedIntentionType || text.length < 2 || text.length > 50;
}

function submitIntention() {
  const text = el('intention-text').value.trim();
  if (!selectedIntentionType || text.length < 2) return;
  Audio.playClick();
  UI.stopTimer();
  game.submitIntention(selectedIntentionType, text);
  goToPhase();
}

async function requestAISuggestions() {
  const btn = el('btn-ai-suggest');
  btn.disabled = true;
  btn.textContent = '正在生成...';

  const apiKey = Gemini.getGeminiKey();
  const history = Archive.getRecentArchive(10);
  const suggestions = await Gemini.generateIntentionSuggestions(
    apiKey, game.currentQuestion.text, history
  );

  btn.textContent = '✨ AI意图灵感';
  btn.disabled = false;

  if (suggestions && suggestions.length > 0) {
    Audio.playGeminiAppear();
    const container = el('suggestion-container');
    container.innerHTML = '';
    suggestions.forEach(s => {
      const card = document.createElement('div');
      card.className = 'suggestion-card';
      card.innerHTML = `<span class="type-tag">${s.type}</span>${s.text}`;
      card.addEventListener('click', () => {
        el('intention-text').value = s.text;
        updateCharCount();
        // Try to select matching type
        const typeMap = { '确认型': 'confirm', '探索型': 'explore', '表达型': 'express', '测试型': 'test' };
        const mappedType = typeMap[s.type];
        if (mappedType) {
          document.querySelectorAll('.intention-type-btn').forEach(b => {
            b.classList.toggle('selected', b.dataset.type === mappedType);
          });
          selectedIntentionType = mappedType;
        }
        checkIntentionReady();
      });
      container.appendChild(card);
    });
  }
}

// ===== PASS SCREEN =====
function showPassScreen(type) {
  const guesser = game.getGuesser();
  const asker = game.getAsker();

  if (type === 'guesser') {
    el('privacy-icon-text').textContent = '🔒';
    el('privacy-main-text').textContent = `请把手机递给 ${guesser.name}`;
    el('privacy-sub-text').textContent = `${asker.name} 已写好意图，现在轮到你来猜`;
    el('btn-pass-guesser').style.display = 'block';
    el('btn-pass-reveal').style.display = 'none';
    el('btn-pass-reverse').style.display = 'none';
    UI.showScreen('screen-privacy');
  } else if (type === 'reveal') {
    el('privacy-icon-text').textContent = '✨';
    el('privacy-main-text').textContent = '准备好揭晓了吗？';
    el('privacy-sub-text').textContent = '请两人一起看屏幕';
    el('btn-pass-guesser').style.display = 'none';
    el('btn-pass-reveal').style.display = 'block';
    el('btn-pass-reverse').style.display = 'none';
    UI.showScreen('screen-privacy');
  } else if (type === 'reverse') {
    const newGuesser = game.currentAsker === 'A' ? game.playerA : game.playerB;
    el('privacy-icon-text').textContent = '🔄';
    el('privacy-main-text').textContent = `请把手机递给 ${newGuesser.name}`;
    el('privacy-sub-text').textContent = '反转！现在轮到你来猜了';
    el('btn-pass-guesser').style.display = 'none';
    el('btn-pass-reveal').style.display = 'none';
    el('btn-pass-reverse').style.display = 'block';
    UI.showScreen('screen-privacy');
  }
}

// ===== ANSWERING PHASE =====
function enterAnsweringPhase() {
  game.phase = PHASES.ANSWERING;
  UI.showScreen('screen-game');
  UI.updateHUD(game);
  UI.displayQuestion(game.currentQuestion);

  const guesser = game.getGuesser();
  el('current-role-label').textContent = `${guesser.name}，轮到你猜`;
  el('phase-label').textContent = '回答问题并猜测对方的意图';

  // Show answering controls
  el('questioning-controls').style.display = 'none';
  el('answering-controls').style.display = 'block';
  el('reveal-controls').style.display = 'none';

  // Reset answer inputs
  el('answer-text').value = '';
  el('guess-direction').value = '';
  selectedGuessType = null;
  document.querySelectorAll('.guess-type-btn').forEach(b => b.classList.remove('selected'));
  el('btn-submit-answer').disabled = true;

  // Guess type buttons
  document.querySelectorAll('.guess-type-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.guess-type-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedGuessType = btn.dataset.type;
      Audio.playClick();
      checkAnswerReady();
    };
  });

  // Timer: 30 seconds
  UI.startTimer(30, (remaining) => {
    if (remaining <= 5) Audio.playTick(true);
    const display = el('timer-display');
    if (display) display.className = remaining <= 5 ? 'timer-display urgent' : 'timer-display';
  }, () => {
    if (selectedGuessType) submitAnswer();
  });
}

let selectedGuessType = null;

function checkAnswerReady() {
  el('btn-submit-answer').disabled = !selectedGuessType;
}

function submitAnswer() {
  if (!selectedGuessType) return;
  Audio.playClick();
  UI.stopTimer();
  const answer = el('answer-text').value.trim();
  const guessDirection = el('guess-direction').value.trim();
  game.submitAnswer(answer, selectedGuessType, guessDirection);
  goToPhase();
}

// ===== REVEAL =====
function doReveal() {
  game.phase = PHASES.REVEAL;
  UI.showScreen('screen-reveal');
  UI.updateHUD(game);

  Audio.playCardFlip();

  const asker = game.getAsker();
  const guesser = game.getGuesser();
  const intention = game.currentIntention;
  const answer = game.currentAnswer;
  const typeLabels = { confirm: '确认', explore: '探索', express: '表达', test: '测试' };

  // Display question
  el('reveal-question').textContent = game.currentQuestion.text;

  // Flip cards
  setTimeout(() => {
    el('reveal-left').innerHTML = `
      <div class="reveal-card-title">${asker.name} 的意图</div>
      <div class="reveal-card-type">【${typeLabels[intention.type] || intention.type}】</div>
      <div class="reveal-card-text">"${intention.text}"</div>
    `;
    el('reveal-right').innerHTML = `
      <div class="reveal-card-title">${guesser.name} 的猜测</div>
      <div class="reveal-card-type">猜测：${typeLabels[answer.guessType] || answer.guessType}</div>
      <div class="reveal-card-text">${answer.guessDirection ? `"${answer.guessDirection}"` : '（未写方向）'}</div>
    `;
    el('reveal-left').classList.add('flipped');
    el('reveal-right').classList.add('flipped');
  }, 250);

  // Evaluate
  const { result, points } = game.reveal();

  setTimeout(() => {
    const resultText = result === 'match' ? '心有灵犀！' : result === 'partial' ? '差一点！' : '打开一扇门';
    const pointsText = points > 0 ? `♡ +${points}` : '→ 真相对话';

    el('reveal-result-text').textContent = resultText;
    el('reveal-result-text').className = `reveal-result-text ${result}`;
    el('reveal-points').textContent = pointsText;

    UI.updateHUD(game);

    // Sound & particles
    if (result === 'match') {
      Audio.playCorrect();
      UI.spawnParticles('correct');
      Audio.playHeartbeatUp();
    } else if (result === 'partial') {
      Audio.playCorrect();
      UI.spawnParticles('partial');
    } else {
      Audio.playMiss();
    }

    // Check full meter
    if (game.heartbeat >= 30) {
      Audio.playFullMeter();
      UI.spawnParticles('full_meter');
    }

    // Show appropriate buttons
    if (result === 'miss') {
      el('btn-reverse').style.display = 'none';
      el('btn-skip-reverse').style.display = 'none';
      el('btn-continue-after-reveal').style.display = 'block';
      el('btn-continue-after-reveal').textContent = '进入真相对话 →';
    } else {
      el('btn-continue-after-reveal').style.display = 'none';
      el('btn-reverse').style.display = game.reverseCount > 0 ? 'inline-flex' : 'none';
      el('btn-reverse-count').textContent = `剩余 ${game.reverseCount} 次`;
      el('btn-skip-reverse').style.display = 'block';
    }
  }, 600);
}

function afterReveal() {
  if (game.phase === PHASES.DIALOGUE || game.lastResult === 'miss') {
    showDialogue();
  } else {
    game.advanceQuestion();
    goToPhase();
  }
}

function showReversePrompt() {
  // Already shown in reveal screen buttons
}

// ===== REVERSE =====
function initiateReverse() {
  Audio.playClick();
  if (!game.initiateReverse()) {
    UI.showToast('反转次数已用完');
    return;
  }
  goToPhase();
}

function enterReverseQuestioning() {
  UI.showScreen('screen-reverse-question');
  UI.updateHUD(game);

  // The original guesser is now the asker
  const newAsker = game.getGuesser(); // In reverse, roles swap
  el('reverse-role-label').textContent = `反转！${newAsker.name}，写下你对这道题的意图`;
  el('reverse-question-text').textContent = game.currentQuestion.text;
  el('reverse-intention-text').value = '';
  updateReverseCharCount();

  selectedReverseType = null;
  document.querySelectorAll('.reverse-type-btn').forEach(b => b.classList.remove('selected'));
  el('btn-submit-reverse-intention').disabled = true;

  document.querySelectorAll('.reverse-type-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.reverse-type-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedReverseType = btn.dataset.type;
      Audio.playClick();
      checkReverseIntentionReady();
    };
  });

  UI.startTimer(30, (remaining) => {
    if (remaining <= 5) Audio.playTick(true);
  }, () => {
    if (selectedReverseType && el('reverse-intention-text').value.trim()) {
      submitReverseIntention();
    }
  });
}

let selectedReverseType = null;

function updateReverseCharCount() {
  const text = el('reverse-intention-text').value;
  const count = el('reverse-char-count');
  count.textContent = `${text.length}/50`;
  count.className = text.length > 50 ? 'char-count over' : text.length > 40 ? 'char-count warn' : 'char-count';
  checkReverseIntentionReady();
}

function checkReverseIntentionReady() {
  const text = el('reverse-intention-text').value.trim();
  el('btn-submit-reverse-intention').disabled = !selectedReverseType || text.length < 2 || text.length > 50;
}

function submitReverseIntention() {
  const text = el('reverse-intention-text').value.trim();
  if (!selectedReverseType || text.length < 2) return;
  Audio.playClick();
  UI.stopTimer();
  game.submitIntention(selectedReverseType, text);
  goToPhase();
}

function enterReverseAnswering() {
  UI.showScreen('screen-reverse-answer');
  UI.updateHUD(game);

  const originalAsker = game.getAsker();
  el('reverse-answer-role').textContent = `${originalAsker.name}，猜猜对方的意图`;
  el('reverse-answer-question').textContent = game.currentQuestion.text;
  el('reverse-answer-text').value = '';
  el('reverse-guess-direction').value = '';

  selectedReverseGuessType = null;
  document.querySelectorAll('.reverse-guess-btn').forEach(b => b.classList.remove('selected'));
  el('btn-submit-reverse-answer').disabled = true;

  document.querySelectorAll('.reverse-guess-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.reverse-guess-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedReverseGuessType = btn.dataset.type;
      Audio.playClick();
      el('btn-submit-reverse-answer').disabled = !selectedReverseGuessType;
    };
  });

  UI.startTimer(30, (remaining) => {
    if (remaining <= 5) Audio.playTick(true);
  }, () => {
    if (selectedReverseGuessType) submitReverseAnswer();
  });
}

let selectedReverseGuessType = null;

function submitReverseAnswer() {
  if (!selectedReverseGuessType) return;
  Audio.playClick();
  UI.stopTimer();
  const answer = el('reverse-answer-text').value.trim();
  const guessDirection = el('reverse-guess-direction').value.trim();
  game.submitAnswer(answer, selectedReverseGuessType, guessDirection);
  doReverseReveal();
}

function doReverseReveal() {
  UI.showScreen('screen-reveal');
  UI.updateHUD(game);

  Audio.playCardFlip();

  const typeLabels = { confirm: '确认', explore: '探索', express: '表达', test: '测试' };

  el('reveal-question').textContent = '🔄 反转揭晓 — ' + game.currentQuestion.text;

  setTimeout(() => {
    el('reveal-left').innerHTML = `
      <div class="reveal-card-title">原始意图</div>
      <div class="reveal-card-type">【${typeLabels[game.currentIntention?.type]}】</div>
      <div class="reveal-card-text">"${game.currentIntention?.text}"</div>
    `;
    el('reveal-right').innerHTML = `
      <div class="reveal-card-title">反转意图</div>
      <div class="reveal-card-type">【${typeLabels[game.reverseIntention?.type]}】</div>
      <div class="reveal-card-text">"${game.reverseIntention?.text}"</div>
    `;
    el('reveal-left').classList.add('flipped');
    el('reveal-right').classList.add('flipped');
  }, 250);

  const { result, points, dualResonance } = game.revealReverse();

  setTimeout(() => {
    if (dualResonance) {
      el('reveal-result-text').textContent = '双向共鸣！';
      el('reveal-result-text').className = 'reveal-result-text dual_resonance';
      el('reveal-points').textContent = `♡ +${points}`;
      Audio.playDualResonance();
      UI.spawnParticles('dual_resonance');
    } else {
      const resultText = result === 'match' ? '猜中了！' : '未猜中';
      el('reveal-result-text').textContent = resultText;
      el('reveal-result-text').className = `reveal-result-text ${result}`;
      el('reveal-points').textContent = `♡ +${points}`;
      if (result === 'match') {
        Audio.playCorrect();
        UI.spawnParticles('correct');
      } else {
        Audio.playMiss();
      }
    }

    UI.updateHUD(game);

    // Show continue button
    el('btn-reverse').style.display = 'none';
    el('btn-skip-reverse').style.display = 'none';
    el('btn-continue-after-reveal').style.display = 'block';
    el('btn-continue-after-reveal').textContent = game.phase === PHASES.DIALOGUE ? '进入真相对话 →' : '继续 →';
    el('btn-continue-after-reveal').onclick = () => {
      Audio.playClick();
      if (game.phase === PHASES.DIALOGUE) {
        showDialogue();
      } else {
        goToPhase();
      }
    };
  }, 600);
}

// ===== TRUTH DIALOGUE =====
function showDialogue() {
  UI.showDialogueOverlay(true);

  el('dialogue-intention-reveal').textContent = `"${game.currentIntention?.text}"`;

  // Gemini guide button
  const geminiBtn = el('btn-gemini-guide');
  geminiBtn.style.display = Gemini.isGeminiEnabled() && game.geminiGuideCount > 0 ? 'flex' : 'none';
  el('gemini-guide-count').textContent = `剩余 ${game.geminiGuideCount} 次`;
  el('btn-mark-valuable').style.display = 'none';
  UI.hideGeminiCards();
}

async function requestGeminiGuide() {
  if (!game.useGeminiGuide()) {
    UI.showToast('AI引导次数已用完');
    return;
  }

  const btn = el('btn-gemini-guide');
  btn.disabled = true;
  btn.textContent = '正在生成...';

  Audio.playGeminiAppear();

  const apiKey = Gemini.getGeminiKey();
  const history = Archive.getRecentArchive(10);
  const questions = await Gemini.generateDeepGuideQuestions(
    apiKey,
    game.currentQuestion.text,
    game.currentIntention?.text || '',
    game.currentAnswer?.guessDirection || '',
    history
  );

  btn.textContent = '✨ AI深层引导';
  btn.disabled = false;
  btn.style.display = 'none';

  UI.showGeminiCards(questions);
  el('btn-mark-valuable').style.display = 'block';
  el('gemini-guide-count').textContent = `剩余 ${game.geminiGuideCount} 次`;
  UI.updateHUD(game);
}

function markValuable() {
  Audio.playClick();
  game.markGeminiGuideValuable();
  Audio.playHeartbeatUp();
  UI.updateHUD(game);
  UI.showToast('♡ +1 感谢你们的深度对话');
  el('btn-mark-valuable').style.display = 'none';
}

// ===== ROUND END =====
function showRoundEnd() {
  const roundNames = { 2: '中层博弈', 3: '深层触达' };
  const roundDescs = {
    2: '问题将更触及感受和想法，意图也会更加深层。准备好了吗？',
    3: '最后一轮，问题将涉及关系的深层话题。敞开心扉，这是最有价值的阶段。'
  };

  el('next-round-num').textContent = `第 ${game.round + 1} 轮`;
  el('next-round-name').textContent = roundNames[game.round + 1] || '';
  el('next-round-desc').textContent = roundDescs[game.round + 1] || '';

  UI.showScreen('screen-round-end');
}

// ===== SETTLEMENT =====
function showSettlement() {
  const data = game.getSettlementData();
  UI.renderSettlement(data);

  // Save to archive
  Archive.saveToArchive(data.history);
  Archive.updateStats(data);

  // Gemini report button
  el('btn-view-report').style.display = Gemini.isGeminiEnabled() ? 'block' : 'none';

  UI.showScreen('screen-settlement');

  if (data.heartbeat >= 30) {
    Audio.playFullMeter();
    UI.spawnParticles('full_meter');
  }
}

function createShareCard() {
  Audio.playClick();
  // Use the last match or interesting record
  const lastRecord = game.history[game.history.length - 1];
  if (!lastRecord) return;

  const cardData = {
    question: lastRecord.question,
    questionType: lastRecord.questionType,
    askerName: lastRecord.asker,
    guesserName: lastRecord.guesser,
    intentionType: lastRecord.intention?.type,
    intentionText: lastRecord.intention?.text,
    guessType: lastRecord.answer?.guessType,
    guessText: lastRecord.answer?.guessDirection,
    result: lastRecord.result,
    heartbeat: game.heartbeat
  };

  const canvas = generateShareCard(cardData);
  downloadShareCard(canvas);
  UI.showToast('分享卡已保存！');
}

async function viewReport() {
  Audio.playClick();
  UI.showScreen('screen-report');
  el('report-body').innerHTML = '<div class="report-loading"><div class="spinner"></div>正在生成关系洞察...</div>';

  const apiKey = Gemini.getGeminiKey();
  const archive = Archive.loadArchive();
  const stats = Archive.loadStats();

  const report = await Gemini.generateReport(
    apiKey, archive, stats,
    game.playerA.name, game.playerB.name
  );

  el('report-body').innerHTML = `<div class="report-content">${report}</div>`;
}

// ===== ARCHIVE SCREEN =====
function renderArchiveScreen(filter = 'all') {
  const records = Archive.getArchiveByTag(filter === 'all' ? null : filter);
  UI.renderArchive(records);
}

// ===== SETTINGS =====
function loadSettings() {
  const key = Gemini.getGeminiKey();
  el('settings-gemini-key').value = key;
  el('toggle-sound').className = Audio.getMuted() ? 'toggle' : 'toggle on';
}

function toggleSound() {
  const muted = Audio.toggleMute();
  el('toggle-sound').className = muted ? 'toggle' : 'toggle on';
  if (!muted) Audio.playClick();
}

function saveGeminiKey() {
  const key = el('settings-gemini-key').value.trim();
  Gemini.setGeminiKey(key);
  UI.showToast(key ? 'API Key 已保存' : 'API Key 已清除');
}

// ===== HELPERS =====
function el(id) {
  return document.getElementById(id);
}

// Start the app — modules are deferred, so DOM is already ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
