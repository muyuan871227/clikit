// 友情档案 - localStorage 存储

class FriendshipArchive {
  constructor() {
    this.storageKey = 'knowmebest_archive';
  }

  // 获取所有记录
  getAll() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    } catch {
      return [];
    }
  }

  // 保存一局记录
  saveSession(sessionData) {
    const records = this.getAll();
    records.push({
      ...sessionData,
      timestamp: Date.now(),
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    });
    localStorage.setItem(this.storageKey, JSON.stringify(records));
  }

  // 获取统计数据
  getStats() {
    const records = this.getAll();
    if (records.length === 0) {
      return { totalSessions: 0, avgHarmony: 0, bestHarmony: 0, flashMoments: 0 };
    }
    const harmonies = records.map(r => r.harmonyPercent || 0);
    return {
      totalSessions: records.length,
      avgHarmony: Math.round(harmonies.reduce((a, b) => a + b, 0) / harmonies.length),
      bestHarmony: Math.max(...harmonies),
      flashMoments: records.reduce((sum, r) => sum + (r.flashMoments || 0), 0),
    };
  }
}

const archive = new FriendshipArchive();
