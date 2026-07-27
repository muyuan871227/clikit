// 主入口 - 屏幕切换 + UI控制

const game = new Game();
const timer = new GameTimer();
let currentScreen = 'welcome';

// === 屏幕切换 ===
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = document.getElementById(screenId);
  if (screen) {
    screen.classList.add('active');
    currentScreen = screenId;
  }
  // HUD 在游戏中显示
  const hud = document.getElementById('hud');
  const noHudScreens = ['welcome', 'setup'];
  hud.style.display = noHudScreens.includes(screenId) ? 'none' : 'flex';
}

// === 欢迎页 ===
function onStart() {
  effects.playClick();
  showScreen('setup');
}

// === 设置页 ===
function onSetupComplete() {
  effects.playClick();
  const name1 = document.getElementById('player1-name').value.trim() || '玩家A';
  const name2 = document.getElementById('player2-name').value.trim() || '玩家B';
  const level = parseInt(document.getElementById('friendship-level').value) || 2;

  game.reset();
  game.player1 = name1;
  game.player2 = name2;
  game.friendshipLevel = level;

  startRound(1);
}

// === 轮次管理 ===
function startRound(roundNum) {
  game.initRound(roundNum);
  updateHUD();

  if (roundNum <= 2) {
    showRoundIntro(roundNum);
  } else {
    showRoundIntro(3);
  }
}

function showRoundIntro(round) {
  const introEl = document.getElementById('round-intro');
  const titleEl = document.getElementById('round-intro-title');
  const descEl = document.getElementById('round-intro-desc');
  const creatorEl = document.getElementById('round-intro-creator');

  if (round === 1) {
    titleEl.textContent = '第 1 轮';
    descEl.textContent = '偏好与秘密';
    creatorEl.textContent = `${game.player1} 出题，${game.player2} 来猜`;
  } else if (round === 2) {
    titleEl.textContent = '第 2 轮';
    descEl.textContent = '习惯与行为';
    creatorEl.textContent = `${game.player2} 出题，${game.player1} 来猜`;
  } else {
    titleEl.textContent = '第 3 轮';
    descEl.textContent = '共同记忆';
    creatorEl.textContent = '双方同时作答，同时揭晓';
  }

  showScreen('round-intro');
}

function onRoundIntroNext() {
  effects.playClick();
  if (game.currentRound <= 2) {
    startQuestion();
  } else {
    startSharedQuestion();
  }
}

// === 出题界面（第1、2轮）===
function startQuestion() {
  const template = game.getCurrentTemplate();
  if (!template) return;

  document.getElementById('create-round-info').textContent = `第${game.currentRound}轮 · 第${game.currentQuestion + 1}/${game.totalQuestionsPerRound}题`;
  document.getElementById('create-creator').textContent = `${game.getCreator()}，现在轮到你出题`;
  document.getElementById('create-template').textContent = template.template;
  document.getElementById('create-answer').value = '';

  // 藏题深度默认
  setDepthStar(1);

  showScreen('create');
  updateHUD();

  // 启动20秒倒计时
  timer.start(20, (remaining, total) => {
    updateCreateTimer(remaining, total);
  }, () => {
    onCreateTimeout();
  });
}

function setDepthStar(star) {
  game.currentDepthStar = star;
  document.querySelectorAll('.depth-star').forEach((btn, i) => {
    btn.classList.toggle('active', i < star);
  });
  const labels = ['她应该知道（×1.0）', '她可能不知道（×1.5）', '她绝对不知道（×2.0）'];
  document.getElementById('depth-label').textContent = labels[star - 1];
}

function updateCreateTimer(remaining, total) {
  const progress = remaining / total;
  const timerBar = document.getElementById('create-timer-bar');
  const timerText = document.getElementById('create-timer-text');
  if (timerBar) {
    timerBar.style.width = `${progress * 100}%`;
    // 颜色渐变
    if (progress > 0.5) timerBar.style.background = '#A8D8B9';
    else if (progress > 0.25) timerBar.style.background = '#F5C842';
    else timerBar.style.background = '#FF8FAB';
  }
  if (timerText) timerText.textContent = Math.ceil(remaining) + '秒';

  // 最后3秒心跳
  if (remaining <= 3 && remaining > 0 && Math.ceil(remaining) !== Math.ceil(remaining + 0.1)) {
    effects.playTick();
  }
}

function onCreateTimeout() {
  // 超时自动提交：使用已填内容或默认
  onCreateSubmit(true);
}

function onCreateSubmit(isTimeout = false) {
  timer.stop();
  effects.playClick();

  const answer = document.getElementById('create-answer').value.trim();

  if (!answer && !isTimeout) {
    shakeElement(document.getElementById('create-answer'));
    return;
  }

  const finalAnswer = answer || '（未填写）';

  // 系统自动生成迷惑项
  const template = game.getCurrentTemplate();
  const decoys = generateDecoys(template?.id, template?.category, finalAnswer);
  const options = [finalAnswer, ...decoys];

  game.setQuestionData(finalAnswer, options, game.currentDepthStar);

  // 显示传递界面
  showPassScreen();
}

// === 传递界面 ===
function showPassScreen() {
  const guesser = game.getGuesser();
  document.getElementById('pass-text').textContent = `把手机给 ${guesser}！`;
  document.getElementById('pass-hint').textContent = `${game.getCreator()}，请闭上眼睛或走开`;
  showScreen('pass');
}

function onPassReady() {
  effects.playClick();
  startAnswer();
}

// === 答题界面 ===
function startAnswer() {
  const template = game.getCurrentTemplate();
  document.getElementById('answer-round-info').textContent = `第${game.currentRound}轮 · 第${game.currentQuestion + 1}/${game.totalQuestionsPerRound}题`;
  document.getElementById('answer-guesser').textContent = `${game.getGuesser()}，凭直觉选`;
  document.getElementById('answer-template').textContent = template.template;

  // 显示藏题深度
  const depthEl = document.getElementById('answer-depth');
  depthEl.textContent = '⭐'.repeat(game.currentDepthStar);

  // 填充选项
  const optionsContainer = document.getElementById('answer-options');
  optionsContainer.innerHTML = '';
  game.currentOptions.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt;
    btn.onclick = () => onSelectOption(i);
    optionsContainer.appendChild(btn);
  });

  showScreen('answer');
  updateHUD();

  // 启动10秒倒计时
  let lastSecond = 10;
  timer.start(10, (remaining, total) => {
    updateAnswerTimer(remaining, total);
    const sec = Math.ceil(remaining);
    if (sec !== lastSecond) {
      lastSecond = sec;
      if (sec <= 3 && sec > 0) effects.playHeartbeat();
    }
  }, () => {
    onAnswerTimeout();
  });
}

function updateAnswerTimer(remaining, total) {
  const progress = remaining / total;
  const timerBar = document.getElementById('answer-timer-bar');
  const timerText = document.getElementById('answer-timer-text');
  if (timerBar) {
    timerBar.style.width = `${progress * 100}%`;
    if (progress > 0.5) timerBar.style.background = '#A8D8B9';
    else if (progress > 0.25) timerBar.style.background = '#F5C842';
    else timerBar.style.background = '#FF6B6B';
  }
  if (timerText) timerText.textContent = Math.ceil(remaining) + '秒';

  // 最后3秒震动效果
  if (remaining <= 3) {
    timerBar?.parentElement?.classList.add('urgent');
  }
}

function onSelectOption(index) {
  timer.stop();
  effects.playClick();

  // 高亮选中
  document.querySelectorAll('.option-btn').forEach((btn, i) => {
    btn.classList.toggle('selected', i === index);
    btn.disabled = true;
  });

  setTimeout(() => {
    showReveal(index);
  }, 300);
}

function onAnswerTimeout() {
  // 随机选择或选中当前高亮的
  const selectedBtns = document.querySelectorAll('.option-btn.selected');
  const index = selectedBtns.length > 0 ?
    Array.from(document.querySelectorAll('.option-btn')).indexOf(selectedBtns[0]) :
    Math.floor(Math.random() * 4);
  showReveal(index);
}

// === 揭晓界面 ===
function showReveal(selectedIndex) {
  const result = game.submitAnswer(selectedIndex);
  const revealScreen = document.getElementById('reveal');

  document.getElementById('reveal-template').textContent = game.getCurrentTemplate()?.template || '';

  // 显示选项（高亮正确和选中的）
  const optionsEl = document.getElementById('reveal-options');
  optionsEl.innerHTML = '';
  game.currentOptions.forEach((opt, i) => {
    const div = document.createElement('div');
    div.className = 'reveal-option';
    div.textContent = opt;
    if (i === game.correctOptionIndex) div.classList.add('correct');
    if (i === selectedIndex && i !== game.correctOptionIndex) div.classList.add('wrong');
    if (i === selectedIndex) div.classList.add('chosen');
    optionsEl.appendChild(div);
  });

  // 结果文字
  const resultEl = document.getElementById('reveal-result');
  const scoreEl = document.getElementById('reveal-score');
  const bonusEl = document.getElementById('reveal-bonus');

  if (result.isCorrect) {
    resultEl.textContent = '默契爆发！';
    resultEl.className = 'reveal-result correct';
    scoreEl.textContent = `${game.getGuesser()} +${result.score}分`;
    effects.burstParticles(revealScreen, '#F5C842', 35);
    effects.playCorrect();
  } else {
    resultEl.textContent = '原来如此！';
    resultEl.className = 'reveal-result wrong';
    scoreEl.textContent = `${game.getCreator()} 成功藏题 +${result.score}分`;
    effects.floatText(revealScreen, 'OMG', '#FF8FAB', '3rem');
    effects.playSurprise();
  }

  bonusEl.textContent = result.bonusText || '';

  showScreen('reveal');
  updateHUD();
}

function onRevealNext() {
  effects.playClick();
  if (game.nextQuestion()) {
    startQuestion();
  } else {
    showRoundSummary();
  }
}

// === 第3轮：共同记忆 ===
function startSharedQuestion() {
  const template = game.getCurrentTemplate();
  if (!template) return;

  document.getElementById('shared-round-info').textContent = `第3轮 · 第${game.currentQuestion + 1}/${game.totalQuestionsPerRound}题`;
  document.getElementById('shared-template').textContent = template.template;
  document.getElementById('shared-player-label').textContent = `${game.player1}，请输入你的答案`;
  document.getElementById('shared-answer').value = '';
  document.getElementById('shared-phase').textContent = '请不要让对方看到你的答案！';

  showScreen('shared');
  showSharedInput(1);
}

let sharedPhase = 1; // 1=player1输入, 2=player2输入

function showSharedInput(phase) {
  sharedPhase = phase;
  const label = document.getElementById('shared-player-label');
  const input = document.getElementById('shared-answer');
  const phaseText = document.getElementById('shared-phase');
  input.value = '';

  if (phase === 1) {
    label.textContent = `${game.player1}，请输入你的答案`;
    phaseText.textContent = `输完后请把手机给 ${game.player2}`;
  } else {
    label.textContent = `${game.player2}，请输入你的答案`;
    phaseText.textContent = '输完后点击「同时揭晓」';
  }
}

function onSharedSubmit() {
  effects.playClick();
  const answer = document.getElementById('shared-answer').value.trim();
  if (!answer) {
    shakeElement(document.getElementById('shared-answer'));
    return;
  }

  if (sharedPhase === 1) {
    game.submitSharedAnswer(1, answer);
    // 传递给player2
    document.getElementById('shared-answer').value = '';
    showScreen('pass-shared');
    document.getElementById('pass-shared-text').textContent = `把手机给 ${game.player2}`;
  } else {
    game.submitSharedAnswer(2, answer);
    showSharedReveal();
  }
}

function onPassSharedReady() {
  effects.playClick();
  showScreen('shared');
  showSharedInput(2);
}

function showSharedReveal() {
  const result = game.revealSharedMemory();
  const screen = document.getElementById('shared-reveal');

  document.getElementById('shared-reveal-template').textContent = game.getCurrentTemplate()?.template || '';
  document.getElementById('shared-reveal-answer1').textContent = `${game.player1}：${result.answer1}`;
  document.getElementById('shared-reveal-answer2').textContent = `${game.player2}：${result.answer2}`;

  const resultEl = document.getElementById('shared-reveal-result');
  if (result.isMatch) {
    resultEl.textContent = '闪光时刻！你们想的一样！';
    resultEl.className = 'shared-result flash';
    effects.heartBurst(screen, 50);
    effects.playFirework();
  } else {
    resultEl.textContent = '你们真的是闺蜜吗？';
    resultEl.className = 'shared-result mismatch';
    effects.playSurprise();
  }

  showScreen('shared-reveal');
  updateHUD();
}

function onSharedRevealNext() {
  effects.playClick();
  if (game.nextQuestion()) {
    startSharedQuestion();
  } else {
    showRoundSummary();
  }
}

// === 轮次结算 ===
function showRoundSummary() {
  const summary = game.getRoundSummary();

  document.getElementById('summary-round').textContent = `第${summary.round}轮结束`;
  document.getElementById('summary-correct').textContent = `猜中 ${summary.correctCount}/${summary.totalQuestions} 题`;
  document.getElementById('summary-harmony').textContent = `当前默契值：${summary.harmonyPercent}%`;
  document.getElementById('summary-score1').textContent = `${game.player1}：${summary.scores.player1}分`;
  document.getElementById('summary-score2').textContent = `${game.player2}：${summary.scores.player2}分`;

  // 下一轮或结算按钮
  const nextBtn = document.getElementById('summary-next-btn');
  if (game.currentRound < 3) {
    nextBtn.textContent = `进入第${game.currentRound + 1}轮`;
    nextBtn.onclick = () => {
      effects.playClick();
      startRound(game.currentRound + 1);
    };
  } else {
    nextBtn.textContent = '查看最终结算';
    nextBtn.onclick = () => {
      effects.playClick();
      showFinalResults();
    };
  }

  showScreen('round-summary');
}

// === 最终结算 ===
function showFinalResults() {
  const results = game.getFinalResults();

  // 默契百分比
  document.getElementById('final-harmony').textContent = `${results.harmonyPercent}%`;
  document.getElementById('final-harmony-text').textContent = getHarmonyComment(results.harmonyPercent);

  // 分数
  document.getElementById('final-score1').textContent = `${results.player1}：${results.scores.player1}分`;
  document.getElementById('final-score2').textContent = `${results.player2}：${results.scores.player2}分`;

  // 赢家
  const winnerEl = document.getElementById('final-winner');
  if (results.winner) {
    winnerEl.textContent = `「本局最懂我」称号授予：${results.winner}`;
  } else {
    winnerEl.textContent = '你们不分上下，默契满分！';
  }

  // 闪光时刻
  document.getElementById('final-flash').textContent = results.flashMoments > 0 ?
    `闪光时刻 ×${results.flashMoments}` : '';

  // 高光题目
  if (results.highlightQuestion) {
    document.getElementById('final-highlight-q').textContent = results.highlightQuestion;
    document.getElementById('final-highlight-a').textContent = results.highlightAnswer;
  }

  showScreen('final');

  // 保存到友情档案
  archive.saveSession({
    player1: results.player1,
    player2: results.player2,
    scores: results.scores,
    harmonyPercent: results.harmonyPercent,
    flashMoments: results.flashMoments,
    questionCount: results.totalQuestions,
  });

  // 撒花效果
  const finalScreen = document.getElementById('final');
  setTimeout(() => {
    effects.burstParticles(finalScreen, '#F5C842', 40);
    effects.burstParticles(finalScreen, '#FF8FAB', 30);
  }, 500);
}

function getHarmonyComment(percent) {
  if (percent >= 90) return '你们就是一个人！灵魂伴侣无疑';
  if (percent >= 75) return '默契满满，你们太懂对方了';
  if (percent >= 60) return '相当不错！你们的友情很深厚';
  if (percent >= 40) return '还有很多可以了解的，继续加油';
  return '你们需要更多时间了解彼此，但这正是这个游戏的意义';
}

// === 分享 ===
async function onShare() {
  effects.playClick();
  const results = game.getFinalResults();
  const imageUrl = await shareCard.generate({
    harmonyPercent: results.harmonyPercent,
    player1: results.player1,
    player2: results.player2,
    highlightQuestion: results.highlightQuestion,
    highlightAnswer: results.highlightAnswer,
  });
  shareCard.share(imageUrl);
}

// === 再来一局 ===
function onPlayAgain() {
  effects.playClick();
  game.reset();
  showScreen('setup');
  document.getElementById('player1-name').value = '';
  document.getElementById('player2-name').value = '';
}

// === HUD ===
function updateHUD() {
  const harmony = game.getHarmonyPercent();
  const hudBar = document.getElementById('hud-harmony-bar');
  const hudText = document.getElementById('hud-harmony-text');
  if (hudBar) hudBar.style.width = `${harmony}%`;
  if (hudText) hudText.textContent = `${harmony}%`;
}

// === 工具函数 ===
function shakeElement(el) {
  el.classList.add('shake');
  setTimeout(() => el.classList.remove('shake'), 500);
}

// === 初始化 ===
document.addEventListener('DOMContentLoaded', () => {
  showScreen('welcome');

  // 点击任意地方解锁音频上下文
  document.addEventListener('click', () => {
    if (effects.audioCtx?.state === 'suspended') {
      effects.audioCtx.resume();
    }
  }, { once: true });
});
