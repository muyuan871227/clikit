// 游戏核心逻辑

class Game {
  constructor() {
    this.reset();
  }

  reset() {
    this.player1 = '';
    this.player2 = '';
    this.friendshipLevel = 2; // 1=刚认识, 2=半年, 3=老朋友
    this.currentRound = 1; // 1-3
    this.currentQuestion = 0; // 0-4 (每轮5题)
    this.totalQuestionsPerRound = 5;

    // 当前题目状态
    this.currentTemplate = null;
    this.currentAnswer = '';
    this.currentOptions = ['', '', '', ''];
    this.currentDepthStar = 1; // 藏题深度 1-3
    this.correctOptionIndex = 0;
    this.selectedOptionIndex = -1;

    // 积分
    this.scores = { player1: 0, player2: 0 };

    // 默契统计
    this.totalCorrectGuesses = 0;
    this.totalQuestions = 0;

    // 连击
    this.streak = 0;

    // 闪光时刻
    this.flashMoments = 0;

    // 本局题目记录
    this.questionRecords = [];

    // 轮次题目预选
    this.roundQuestions = [];

    // 第3轮共同记忆
    this.sharedAnswers = { player1: '', player2: '' };

    // 最高分题目（用于分享卡）
    this.highlightQuestion = null;
    this.highlightAnswer = null;
    this.highlightScore = 0;
  }

  // 获取当前出题方
  getCreator() {
    if (this.currentRound === 1) return this.player1;
    if (this.currentRound === 2) return this.player2;
    return null; // 第3轮特殊
  }

  // 获取当前答题方
  getGuesser() {
    if (this.currentRound === 1) return this.player2;
    if (this.currentRound === 2) return this.player1;
    return null;
  }

  // 初始化轮次题目
  initRound(round) {
    this.currentRound = round;
    this.currentQuestion = 0;
    this.streak = 0;

    if (round <= 2) {
      this.roundQuestions = getRandomQuestions(this.totalQuestionsPerRound, this.friendshipLevel);
    } else {
      // 第3轮：共同记忆题
      this.roundQuestions = getSharedMemoryQuestions(this.totalQuestionsPerRound);
    }
  }

  // 获取当前题目框架
  getCurrentTemplate() {
    if (this.currentQuestion < this.roundQuestions.length) {
      return this.roundQuestions[this.currentQuestion];
    }
    return null;
  }

  // 设置出题数据
  setQuestionData(answer, options, depthStar) {
    this.currentAnswer = answer;
    this.currentDepthStar = depthStar;

    // 把真实答案放入选项并打乱
    const allOptions = [...options];
    // 确保真实答案在列表中
    if (!allOptions.includes(answer)) {
      allOptions[0] = answer;
    }
    // 打乱选项
    for (let i = allOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
    }
    this.currentOptions = allOptions;
    this.correctOptionIndex = allOptions.indexOf(answer);
  }

  // 提交答案，返回结果
  submitAnswer(selectedIndex) {
    this.selectedOptionIndex = selectedIndex;
    const isCorrect = selectedIndex === this.correctOptionIndex;
    const depthMultiplier = [1.0, 1.5, 2.0][this.currentDepthStar - 1];

    let score = 0;
    let scorer = '';
    let bonusText = '';

    if (isCorrect) {
      // 答题方得分
      score = Math.round(10 * depthMultiplier);
      scorer = this.getGuesser();
      this.totalCorrectGuesses++;
      this.streak++;

      // 连击奖励
      if (this.streak === 3) {
        score += 15;
        bonusText = '默契连击 +15';
      }
      if (this.streak >= 3) {
        score = Math.round(score * 1.5);
        bonusText = bonusText || '默契灼烧 ×1.5';
      }

      if (this.currentRound === 1) {
        this.scores.player2 += score;
      } else {
        this.scores.player1 += score;
      }
    } else {
      // 出题方得分（成功藏住）
      score = Math.round(5 * this.currentDepthStar);
      scorer = this.getCreator();
      this.streak = 0;

      if (this.currentRound === 1) {
        this.scores.player1 += score;
      } else {
        this.scores.player2 += score;
      }
    }

    this.totalQuestions++;

    // 记录高光时刻
    if (score > this.highlightScore) {
      this.highlightScore = score;
      this.highlightQuestion = this.getCurrentTemplate()?.template || '';
      this.highlightAnswer = this.currentAnswer;
    }

    const record = {
      round: this.currentRound,
      questionIndex: this.currentQuestion,
      template: this.getCurrentTemplate()?.template || '',
      answer: this.currentAnswer,
      options: [...this.currentOptions],
      selectedIndex: selectedIndex,
      correctIndex: this.correctOptionIndex,
      isCorrect,
      depthStar: this.currentDepthStar,
      score,
      scorer,
    };
    this.questionRecords.push(record);

    return {
      isCorrect,
      score,
      scorer,
      depthStar: this.currentDepthStar,
      correctAnswer: this.currentAnswer,
      selectedAnswer: this.currentOptions[selectedIndex],
      bonusText,
      streak: this.streak,
    };
  }

  // 第3轮：提交共同记忆答案
  submitSharedAnswer(player, answer) {
    if (player === 1) this.sharedAnswers.player1 = answer;
    else this.sharedAnswers.player2 = answer;
  }

  // 第3轮：揭晓共同记忆
  revealSharedMemory() {
    const match = this.sharedAnswers.player1.trim() === this.sharedAnswers.player2.trim();
    this.totalQuestions += 2;

    if (match) {
      // 闪光时刻！
      this.flashMoments++;
      this.scores.player1 += 20;
      this.scores.player2 += 20;
      this.totalCorrectGuesses += 2;
    }

    const record = {
      round: 3,
      questionIndex: this.currentQuestion,
      template: this.getCurrentTemplate()?.template || '',
      answer1: this.sharedAnswers.player1,
      answer2: this.sharedAnswers.player2,
      isMatch: match,
      isShared: true,
    };
    this.questionRecords.push(record);

    // 重置
    this.sharedAnswers = { player1: '', player2: '' };

    return {
      isMatch: match,
      answer1: record.answer1,
      answer2: record.answer2,
    };
  }

  // 进入下一题
  nextQuestion() {
    this.currentQuestion++;
    return this.currentQuestion < this.totalQuestionsPerRound;
  }

  // 获取默契百分比
  getHarmonyPercent() {
    if (this.totalQuestions === 0) return 0;
    return Math.round((this.totalCorrectGuesses / this.totalQuestions) * 100);
  }

  // 获取轮次总结
  getRoundSummary() {
    const roundRecords = this.questionRecords.filter(r => r.round === this.currentRound);
    const correctCount = roundRecords.filter(r => r.isCorrect || r.isMatch).length;
    return {
      round: this.currentRound,
      totalQuestions: roundRecords.length,
      correctCount,
      scores: { ...this.scores },
      harmonyPercent: this.getHarmonyPercent(),
    };
  }

  // 获取最终结算数据
  getFinalResults() {
    const harmonyPercent = this.getHarmonyPercent();
    let winner = null;
    if (this.scores.player1 > this.scores.player2) winner = this.player1;
    else if (this.scores.player2 > this.scores.player1) winner = this.player2;

    return {
      player1: this.player1,
      player2: this.player2,
      scores: { ...this.scores },
      harmonyPercent,
      winner,
      flashMoments: this.flashMoments,
      totalQuestions: this.totalQuestions,
      totalCorrectGuesses: this.totalCorrectGuesses,
      highlightQuestion: this.highlightQuestion,
      highlightAnswer: this.highlightAnswer,
      records: [...this.questionRecords],
    };
  }
}
