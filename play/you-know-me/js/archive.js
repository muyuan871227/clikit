// archive.js — Intent archive (localStorage persistence)

const ARCHIVE_KEY = 'ykm_archive';
const STATS_KEY = 'ykm_stats';

export function loadArchive() {
  try {
    return JSON.parse(localStorage.getItem(ARCHIVE_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveToArchive(records) {
  const archive = loadArchive();
  archive.push(...records);
  localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archive));
}

export function loadStats() {
  try {
    return JSON.parse(localStorage.getItem(STATS_KEY)) || {
      totalSessions: 0,
      avgMatchRate: 0,
      maxHeartbeat: 0,
      totalMatches: 0,
      totalQuestions: 0,
      geminiGuideUsed: 0
    };
  } catch {
    return { totalSessions: 0, avgMatchRate: 0, maxHeartbeat: 0, totalMatches: 0, totalQuestions: 0, geminiGuideUsed: 0 };
  }
}

export function updateStats(sessionData) {
  const stats = loadStats();
  stats.totalSessions++;
  stats.totalMatches += sessionData.matches;
  stats.totalQuestions += sessionData.totalQuestions;
  stats.avgMatchRate = stats.totalQuestions > 0
    ? Math.round((stats.totalMatches / stats.totalQuestions) * 100)
    : 0;
  stats.maxHeartbeat = Math.max(stats.maxHeartbeat, sessionData.heartbeat);
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  return stats;
}

export function getArchiveByTag(tag) {
  const archive = loadArchive();
  if (!tag || tag === 'all') return archive;
  return archive.filter(r => r.userTag === tag);
}

export function addTagToRecord(index, tag) {
  const archive = loadArchive();
  if (archive[index]) {
    archive[index].userTag = tag;
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archive));
  }
}

export function addNoteToRecord(index, note) {
  const archive = loadArchive();
  if (archive[index]) {
    archive[index].userNote = note;
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archive));
  }
}

export function clearArchive() {
  localStorage.removeItem(ARCHIVE_KEY);
  localStorage.removeItem(STATS_KEY);
}

export function getRecentArchive(count = 10) {
  const archive = loadArchive();
  return archive.slice(-count);
}
