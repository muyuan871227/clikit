// gemini.js — Gemini API integration (4 functions + fallback)

const FALLBACK = {
  intentionSuggestions: null,
  deepGuide: [
    '请说出你的真实意图——不是"随便问问"，是真实的。',
    '听完意图，你有什么感受？',
    '这个意图背后，还有什么没说完的吗？'
  ],
  personalizedQuestions: [],
  annualReport: (stats) =>
    `过去这段时间，你们一起玩了${stats.totalSessions}局《你懂我吗》，平均猜中率${stats.avgMatchRate}%。每一次猜错，都是一扇打开的门。`
};

async function callGemini(apiKey, prompt, maxTokens = 512, temperature = 0.8) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: maxTokens,
            temperature,
            topP: 0.9
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } finally {
    clearTimeout(timeout);
  }
}

// Feature 1: Intent inspiration suggestions
export async function generateIntentionSuggestions(apiKey, questionText, archiveHistory = [], coupleContext = '') {
  if (!apiKey) return FALLBACK.intentionSuggestions;

  const historySnippet = archiveHistory
    .slice(0, 10)
    .map(r => `题:${r.question?.slice(0, 20)}|类型:${r.intention?.type}|结果:${r.result}`)
    .join('\n');

  const prompt = `你是一个帮助情侣深化关系对话的AI助手。
当前题目：「${questionText}」
${coupleContext ? `情侣背景：${coupleContext}` : ''}
${historySnippet ? `最近对话历史：\n${historySnippet}` : ''}

请为出题方生成3条不同类型的「隐藏意图」方向建议，帮助他/她想清楚出这道题背后真正想了解的是什么。

要求：
1. 每条建议10-40字，语气温柔自然
2. 三条分别对应：确认型 / 探索型 / 表达型（各一条）
3. 与历史对话不重复
4. 不要太直白，要有一点深度

请直接输出3条建议，格式：
[确认型] xxx
[探索型] xxx
[表达型] xxx`;

  try {
    const text = await callGemini(apiKey, prompt);
    const lines = text.split('\n').filter(l => l.trim());
    return lines.slice(0, 3).map(line => ({
      type: line.match(/\[(.+?)\]/)?.[1] || '探索型',
      text: line.replace(/\[.+?\]\s*/, '').trim().slice(0, 50)
    }));
  } catch (error) {
    console.warn('Gemini intent suggestions failed:', error);
    return FALLBACK.intentionSuggestions;
  }
}

// Feature 2: Deep guidance questions on miss
export async function generateDeepGuideQuestions(apiKey, questionText, realIntention, guessText, archiveHistory = []) {
  if (!apiKey) return FALLBACK.deepGuide;

  const historyContext = archiveHistory
    .slice(0, 5)
    .map(r => `「${r.question?.slice(0, 15)}...」→ ${r.intention?.type}`)
    .join('；');

  const prompt = `你是一个擅长帮助情侣深度对话的AI助手。

刚刚发生的情况：
- 出题方的框架题：「${questionText}」
- 出题方的真实意图：「${realIntention}」
- 答题方的猜测：「${guessText}」
- 答题方猜错了，但这正是一个深入了解彼此的机会。

${historyContext ? `这对情侣过去讨论过：${historyContext}` : ''}

请生成3条引导问题，帮助他们基于这道题展开更深入的对话。

要求：
1. 问题要自然、温柔，不要审问感
2. 基于「真实意图」的方向，引导更深的探索
3. 三条问题的深度递进（由浅到深）
4. 每条问题15-40字

直接输出3条问题，格式：
1. xxx
2. xxx
3. xxx`;

  try {
    const text = await callGemini(apiKey, prompt);
    const lines = text.split('\n')
      .filter(l => /^\d\./.test(l.trim()))
      .map(l => l.replace(/^\d\.\s*/, '').trim());
    return lines.length >= 3 ? lines.slice(0, 3) : FALLBACK.deepGuide;
  } catch (error) {
    console.warn('Gemini deep guide failed:', error);
    return FALLBACK.deepGuide;
  }
}

// Feature 3: Dynamic personalized questions
export async function generatePersonalizedQuestions(apiKey, fullArchive, targetLevel = 1, count = 3) {
  if (!apiKey || fullArchive.length < 5) return FALLBACK.personalizedQuestions;

  const intentionDistribution = fullArchive.reduce((acc, r) => {
    const t = r.intention?.type || 'unknown';
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  const mostUsedType = Object.entries(intentionDistribution)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || '探索';

  const missTopics = fullArchive
    .filter(r => r.result === 'miss')
    .map(r => r.question?.slice(0, 20))
    .slice(0, 5)
    .join('、');

  const levelNames = {
    1: '表层（偏好习惯日常）',
    2: '中层（感受想法未说出口的话）',
    3: '深层（关系秘密共同未来）'
  };

  const prompt = `你是一个专为情侣设计对话问题的AI。

这对情侣的对话特征：
- 最常见的意图类型：${mostUsedType}
- 曾经猜错的题目方向：${missTopics || '暂无'}
- 目标深度：${levelNames[targetLevel]}

请生成${count}道适合这对情侣的框架题。

要求：
1. 问题开放性强，没有标准答案
2. 适合情侣之间互问，有温度有深度
3. 符合${levelNames[targetLevel]}的定位
4. 避免过于敏感或会引发争论的话题
5. 每道题20-60字

直接输出${count}道题目，每题一行，不加编号。`;

  try {
    const text = await callGemini(apiKey, prompt);
    const questions = text.split('\n')
      .map(l => l.trim())
      .filter(l => l.length >= 10 && l.length <= 80)
      .slice(0, count);

    return questions.map(q => ({
      text: q,
      level: targetLevel,
      type: 'gemini',
      source: 'gemini',
      generatedAt: new Date().toISOString()
    }));
  } catch (error) {
    console.warn('Gemini question generation failed:', error);
    return FALLBACK.personalizedQuestions;
  }
}

// Feature 4: Annual/milestone relationship report
export async function generateReport(apiKey, archive, stats, nameA = 'TA', nameB = '你') {
  if (!apiKey) {
    const fn = FALLBACK.annualReport;
    return typeof fn === 'function' ? fn(stats) : fn;
  }

  const topMatches = archive
    .filter(r => r.result === 'match')
    .slice(0, 10)
    .map(r => `「${r.question?.slice(0, 30)}」→ 意图：${r.intention?.text?.slice(0, 30)}`)
    .join('\n');

  const topMisses = archive
    .filter(r => r.result === 'miss' && r.userNote)
    .slice(0, 5)
    .map(r => `「${r.question?.slice(0, 20)}」→ ${r.userNote?.slice(0, 30)}`)
    .join('\n');

  const prompt = `你是一位擅长写情侣关系洞察的作家。

这对情侣（${nameB}和${nameA}）的游戏数据：
- 总共玩了${stats.totalSessions}局《你懂我吗》
- 平均意图猜中率：${stats.avgMatchRate}%
- 最高默契读数：${stats.maxHeartbeat}格（满分30格）

猜中率最高的一些时刻：
${topMatches || '（暂无）'}

某些猜错后产生了珍贵的对话：
${topMisses || '（暂无笔记）'}

请为他们写一段「关系洞察」，150-250字，要求：
1. 温柔、有深度，像一封写给他们关系的信
2. 从数据中提炼出这对情侣的关系特质
3. 指出一个你们共同成长的地方
4. 结尾要有一句让人想分享的话
5. 直接写正文，不要标题`;

  try {
    const text = await callGemini(apiKey, prompt, 1024, 0.7);
    return text.trim();
  } catch (error) {
    console.warn('Gemini report generation failed:', error);
    const fn = FALLBACK.annualReport;
    return typeof fn === 'function' ? fn(stats) : fn;
  }
}

export function isGeminiEnabled() {
  return !!localStorage.getItem('ykm_gemini_key');
}

export function getGeminiKey() {
  return localStorage.getItem('ykm_gemini_key') || '';
}

export function setGeminiKey(key) {
  if (key) {
    localStorage.setItem('ykm_gemini_key', key);
  } else {
    localStorage.removeItem('ykm_gemini_key');
  }
}
