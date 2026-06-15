#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// verify-bundle.mjs — server-side invariant guard for the live clikit bundle.
// Run by .github/workflows/verify-site.yml on every push to main. Exits non-zero
// (→ the workflow AUTO-REVERTS the push, self-healing the live site) when the
// pushed bundle would:
//   • drop a game present in the previous commit's bundle, or
//   • fall below invariant.json's minGames floor, or
//   • lose a required feature marker (e.g. the 🆕 New Release shelf).
// This catches ANY pusher — even one bypassing clikit-app/site/deploy.mjs.
// Escape hatches: `[delist:<id>]` in the commit message to drop a game on purpose;
// remove a marker from invariant.json (same commit) to retire a feature.
// ─────────────────────────────────────────────────────────────────────────────
import { execSync } from 'node:child_process';
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const sh = (c) => execSync(c, { encoding: 'utf8' });
const idsOf = (js) => new Set((js.match(/id:"[a-z0-9][a-z0-9-]+"/g) || []).map((s) => s.slice(4, -1)));

const curBundle = (existsSync('assets') ? readdirSync('assets') : []).find((f) => /^index-.*\.js$/.test(f));
if (!curBundle) { console.error('✗ no assets/index-*.js in this commit — broken deploy'); process.exit(1); }
const cur = readFileSync(`assets/${curBundle}`, 'utf8');
const curIds = idsOf(cur);

let prevIds = new Set();
try {
  const pIdx = sh('git show HEAD~1:index.html');
  const pBundle = (pIdx.match(/assets\/index-[A-Za-z0-9_-]+\.js/) || [])[0];
  if (pBundle) prevIds = idsOf(sh(`git show HEAD~1:${pBundle.replace(/^\//, '')}`));
} catch { /* shallow clone / first commit — nothing to compare */ }

const inv = existsSync('.clikit-site/invariant.json')
  ? JSON.parse(readFileSync('.clikit-site/invariant.json', 'utf8'))
  : { requireMarkers: [], minGames: 0 };
let msg = '';
try { msg = sh('git log -1 --format=%B'); } catch { /* ignore */ }

const violations = [];
const dropped = [...prevIds].filter((id) => !curIds.has(id) && !msg.includes(`[delist:${id}]`));
if (dropped.length) violations.push(`drops ${dropped.length} live game(s): ${dropped.join(', ')}  → add [delist:<id>] to the commit message if intentional`);
if (curIds.size < (inv.minGames || 0)) violations.push(`only ${curIds.size} games (floor is ${inv.minGames})`);
for (const m of inv.requireMarkers || []) if (!cur.includes(m)) violations.push(`missing required feature marker ${JSON.stringify(m)}  → delete it from .clikit-site/invariant.json (same commit) to retire it`);

if (violations.length) {
  console.error('✗ BUNDLE INVARIANT VIOLATED — this push will be auto-reverted:\n' + violations.map((v) => '  - ' + v).join('\n'));
  process.exit(1);
}
console.log(`✓ invariant OK — ${curIds.size} games, superset of previous (${prevIds.size}), all markers present`);
