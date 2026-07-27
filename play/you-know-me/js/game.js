// game.js — Core game state machine & logic
import { buildDeck, INTENTION_TYPES } from './questions.js';

export const PHASES = {
  SETUP: 'setup',
  QUESTIONING: 'questioning',    // Asker writes intention (60s)
  PASS_TO_GUESSER: 'pass_to_guesser', // Privacy screen
  ANSWERING: 'answering',        // Guesser answers + guesses intention (30s)
  PASS_TO_REVEAL: 'pass_to_reveal',   // Privacy screen before reveal
  REVEAL: 'reveal',              // Both cards flip
  DIALOGUE: 'dialogue',          // Truth dialogue (on miss)
  REVERSE_PROMPT: 'reverse_prompt',    // Ask if want to reverse
  REVERSE_QUESTIONING: 'reverse_questioning', // Reversed: new asker writes (30s)
  REVERSE_PASS: 'reverse_pass',
  REVERSE_ANSWERING: 'reverse_answering',
  REVERSE_REVEAL: 'reverse_reveal',
  ROUND_END: 'round_end',
  SETTLEMENT: 'settlement'
};

export class Game {
  constructor() {
    this.reset();
  }

  reset() {
    this.phase = PHASES.SETUP;
    this.round = 1;               // 1-3
    this.questionIndex = 0;       // 0-4 within round
    this.questionsPerRound = 5;
    this.heartbeat = 0;           // 0-30
    this.maxHeartbeat = 30;
    this.reverseCount = 3;        // per game
    this.geminiGuideCount = 3;    // per game
    this.consecutiveCorrect = 0;  // for streak bonus
    this.comparisonMode = false;  // triggered by 3-streak

    this.playerA = { name: '', score: 0 };
    this.playerB = { name: '', score: 0 };
    this.currentAsker = 'A';      // 'A' or 'B'

    this.decks = {
      1: buildDeck(1),
      2: buildDeck(2),
      3: buildDeck(3)
    };

    this.currentQuestion = null;
    this.currentIntention = null;  // { type, text }
    this.currentAnswer = null;     // { answer, guessType, guessDirection }
    this.isReversed = false;
    this.reverseIntention = null;
    this.reverseAnswer = null;
    this.originalIntention = null;
    this.lastResult = null;        // 'match', 'partial', 'miss'

    this.history = [];             // all rounds history
    this.geminiQuestions = [];     // AI-generated questions
  }

  setup(playerAName, playerBName) {
    this.playerA.name = playerAName;
    this.playerB.name = playerBName;
    // Randomly choose first asker
    this.currentAsker = Math.random() < 0.5 ? 'A' : 'B';
    this.phase = PHASES.QUESTIONING;
    this.drawQuestion();
  }

  getAsker() {
    return this.currentAsker === 'A' ? this.playerA : this.playerB;
  }

  getGuesser() {
    return this.currentAsker === 'A' ? this.playerB : this.playerA;
  }

  drawQuestion() {
    const deck = this.decks[this.round];
    if (deck.length === 0) {
      // Reshuffle
      this.decks[this.round] = buildDeck(this.round);
    }

    // 10% chance to use gemini question if available
    if (this.geminiQuestions.length > 0 && Math.random() < 0.1) {
      this.currentQuestion = this.geminiQuestions.shift();
    } else {
      this.currentQuestion = this.decks[this.round].pop();
    }
  }

  submitIntention(type, text) {
    // Clamp text to 50 chars
    const clampedText = text.slice(0, 50);
    if (this.isReversed) {
      this.reverseIntention = { type, text: clampedText };
      this.phase = PHASES.REVERSE_PASS;
    } else {
      this.currentIntention = { type, text: clampedText };
      this.phase = PHASES.PASS_TO_GUESSER;
    }
  }

  submitAnswer(answer, guessType, guessDirection) {
    if (this.isReversed) {
      this.reverseAnswer = { answer, guessType, guessDirection };
      this.phase = PHASES.REVERSE_REVEAL;
    } else {
      this.currentAnswer = { answer, guessType, guessDirection };
      this.phase = PHASES.PASS_TO_REVEAL;
    }
  }

  // Evaluate guess result
  evaluate(intention, answer) {
    const typeMatch = intention.type === answer.guessType;
    const directionMatch = answer.guessDirection &&
      intention.text.toLowerCase().includes(answer.guessDirection.toLowerCase());

    if (typeMatch && directionMatch) {
      return 'match';      // +2
    } else if (typeMatch || directionMatch) {
      return 'partial';    // +1
    } else {
      return 'miss';       // +0
    }
  }

  // Simple evaluation: just check type match
  evaluateSimple(intention, answer) {
    const typeMatch = intention.type === answer.guessType;
    if (typeMatch) {
      return 'match';
    }
    return 'miss';
  }

  reveal() {
    const result = this.evaluateSimple(this.currentIntention, this.currentAnswer);
    this.lastResult = result;

    let points = 0;
    if (result === 'match') {
      points = 2;
      this.consecutiveCorrect++;
    } else if (result === 'partial') {
      points = 1;
      this.consecutiveCorrect++;
    } else {
      points = 0;
      this.consecutiveCorrect = 0;
    }

    this.heartbeat = Math.min(this.maxHeartbeat, this.heartbeat + points);

    // Check for comparison mode trigger (3 consecutive correct)
    if (this.consecutiveCorrect >= 3 && !this.comparisonMode) {
      this.comparisonMode = true;
      // Will last for 2 questions
      this.comparisonRemaining = 2;
    }

    // Record to history
    this.recordHistory(result, points);

    if (result === 'miss') {
      this.phase = PHASES.DIALOGUE;
    } else {
      this.phase = PHASES.REVERSE_PROMPT;
    }

    return { result, points };
  }

  revealReverse() {
    // Evaluate original round
    const origResult = this.evaluateSimple(this.currentIntention, this.currentAnswer);
    // Evaluate reverse round
    const revResult = this.evaluateSimple(this.reverseIntention, this.reverseAnswer);

    let points = 1; // Base reverse bonus
    let dualResonance = false;

    if (origResult === 'match' && revResult === 'match') {
      // Dual Resonance!
      points = 5;
      dualResonance = true;
    }

    this.heartbeat = Math.min(this.maxHeartbeat, this.heartbeat + points);

    // Record reverse
    this.history.push({
      round: this.round,
      question: this.currentQuestion.text,
      intention: this.reverseIntention,
      answer: this.reverseAnswer,
      result: revResult,
      points,
      isReverse: true,
      dualResonance,
      timestamp: Date.now()
    });

    this.isReversed = false;
    this.lastResult = dualResonance ? 'dual_resonance' : revResult;

    if (revResult === 'miss' && !dualResonance) {
      this.phase = PHASES.DIALOGUE;
    } else {
      this.advanceQuestion();
    }

    return { result: revResult, points, dualResonance };
  }

  initiateReverse() {
    if (this.reverseCount <= 0) return false;
    this.reverseCount--;
    this.isReversed = true;
    // Swap asker for the reverse
    this.originalIntention = this.currentIntention;
    this.phase = PHASES.REVERSE_QUESTIONING;
    return true;
  }

  skipReverse() {
    if (this.lastResult === 'miss') {
      this.phase = PHASES.DIALOGUE;
    } else {
      this.advanceQuestion();
    }
  }

  finishDialogue() {
    this.advanceQuestion();
  }

  markGeminiGuideValuable() {
    if (this.geminiGuideCount > 0) {
      this.heartbeat = Math.min(this.maxHeartbeat, this.heartbeat + 1);
    }
  }

  useGeminiGuide() {
    if (this.geminiGuideCount <= 0) return false;
    this.geminiGuideCount--;
    return true;
  }

  advanceQuestion() {
    this.questionIndex++;
    this.isReversed = false;

    // Check comparison mode
    if (this.comparisonMode && this.comparisonRemaining > 0) {
      this.comparisonRemaining--;
      if (this.comparisonRemaining <= 0) {
        this.comparisonMode = false;
      }
    }

    if (this.questionIndex >= this.questionsPerRound) {
      // End of round
      if (this.round >= 3) {
        this.phase = PHASES.SETTLEMENT;
        return;
      }
      this.phase = PHASES.ROUND_END;
      return;
    }

    // Alternate asker
    this.currentAsker = this.currentAsker === 'A' ? 'B' : 'A';
    this.drawQuestion();
    this.phase = PHASES.QUESTIONING;
    this.currentIntention = null;
    this.currentAnswer = null;
    this.reverseIntention = null;
    this.reverseAnswer = null;
  }

  nextRound() {
    this.round++;
    this.questionIndex = 0;
    this.currentAsker = this.currentAsker === 'A' ? 'B' : 'A';
    this.drawQuestion();
    this.phase = PHASES.QUESTIONING;
    this.currentIntention = null;
    this.currentAnswer = null;
  }

  recordHistory(result, points) {
    this.history.push({
      round: this.round,
      question: this.currentQuestion.text,
      questionType: this.currentQuestion.type,
      intention: { ...this.currentIntention },
      answer: { ...this.currentAnswer },
      asker: this.currentAsker === 'A' ? this.playerA.name : this.playerB.name,
      guesser: this.currentAsker === 'A' ? this.playerB.name : this.playerA.name,
      result,
      points,
      isReverse: false,
      timestamp: Date.now()
    });
  }

  getSettlementData() {
    const totalQuestions = this.history.filter(h => !h.isReverse).length;
    const matches = this.history.filter(h => h.result === 'match').length;
    const dualResonances = this.history.filter(h => h.dualResonance).length;
    const matchRate = totalQuestions > 0 ? Math.round((matches / totalQuestions) * 100) : 0;

    let emotionLevel;
    if (this.heartbeat <= 5) emotionLevel = '今天意图难猜，但对话很真实';
    else if (this.heartbeat <= 15) emotionLevel = '你们之间有某种特别的连接';
    else if (this.heartbeat <= 25) emotionLevel = '今天你们找到了彼此的语言';
    else emotionLevel = '最高默契！今天你们心有灵犀';

    // Determine who "knows" better
    const aCorrect = this.history.filter(h =>
      !h.isReverse && h.guesser === this.playerA.name && h.result === 'match'
    ).length;
    const bCorrect = this.history.filter(h =>
      !h.isReverse && h.guesser === this.playerB.name && h.result === 'match'
    ).length;

    let mvp;
    if (aCorrect > bCorrect) mvp = this.playerA.name;
    else if (bCorrect > aCorrect) mvp = this.playerB.name;
    else mvp = null; // tie

    return {
      heartbeat: this.heartbeat,
      matchRate,
      totalQuestions,
      matches,
      dualResonances,
      emotionLevel,
      mvp,
      history: this.history
    };
  }

  addGeminiQuestions(questions) {
    this.geminiQuestions.push(...questions.map(q => ({
      text: q.text || q,
      level: q.level || this.round,
      type: 'gemini',
      source: 'gemini'
    })));
  }
}
