// ═══ voting_system.js — 投票 ═══
const Voting = (() => {
  let votes = {}; // playerId -> targetId | 'abstain'
  let active = false;

  function init() {
    bindBus();
  }
  function bindBus() {
    Bus.on('phase_changed', ({newPhase}) => {
      if (newPhase === 'voting') start();
      else active = false;
    });
    Bus.on('vote_cast', ({voterId, targetId}) => {
      if (!active) return;
      if (votes[voterId] !== undefined) return;
      votes[voterId] = targetId;
      triggerJuice('juice_vote_cast');
    });
  }

  function start() {
    active = true;
    votes = {};
    // AI自动投票
    const alive = PlayerManager.getAlive();
    for (const p of alive) {
      if (p.isHuman) continue;
      // AI随机时间投出 1-8s
      setTimeout(() => {
        if (!active) return;
        const target = AISystem.aiVote(p);
        Bus.emit('vote_cast', {voterId: p.id, targetId: target});
      }, 1000 + Math.random() * 7000);
    }
  }

  function resolve() {
    active = false;
    // 没投的算abstain
    const alive = PlayerManager.getAlive();
    for (const p of alive) {
      if (votes[p.id] === undefined) votes[p.id] = 'abstain';
    }
    // 统计
    const tally = {};
    let abstainCount = 0;
    for (const [voter, target] of Object.entries(votes)) {
      if (target === 'abstain') { abstainCount++; continue; }
      tally[target] = (tally[target] || 0) + 1;
    }
    const totalVotes = alive.length;
    const abstainPct = (abstainCount / totalVotes) * 100;
    let eliminated = null;
    if (abstainPct < cfg('voting.abstain_threshold_pct', 50)) {
      // find max
      let maxCount = 0, candidates = [];
      for (const [tid, c] of Object.entries(tally)) {
        if (c > maxCount) { maxCount = c; candidates = [tid]; }
        else if (c === maxCount) candidates.push(tid);
      }
      // 多数 = 超过非弃权票的一半
      const nonAbstain = totalVotes - abstainCount;
      if (candidates.length === 1 && maxCount > nonAbstain / 2) {
        eliminated = parseInt(candidates[0], 10);
      }
    }
    Bus.emit('vote_resolved', {eliminated, tally, abstainCount, votes: {...votes}});
    if (eliminated !== null) {
      const target = PlayerManager.getPlayer(eliminated);
      if (target) {
        triggerJuice('juice_elimination', target.x, target.y);
        Bus.emit('player_eliminated', {playerId: eliminated});
        if (target.role === 'killer') {
          Bus.emit('killer_caught', {killerId: eliminated});
        }
      }
    }
  }

  function getVotes() { return {...votes}; }
  function isActive() { return active; }

  return {init, start, resolve, getVotes, isActive};
})();
