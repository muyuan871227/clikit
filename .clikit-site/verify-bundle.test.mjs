import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const guard = fileURLToPath(new URL('./verify-bundle.mjs', import.meta.url));
const bundle = (count) => Array.from({ length: count }, (_, i) => `{id:"game-${i + 1}"}`).join(',') + ';/* New Release */';

function fixture(t, initialCount) {
  const dir = mkdtempSync(join(tmpdir(), 'clikit-guard-test-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' });
  git('init', '-q');
  git('config', 'user.name', 'Guard Fixture');
  git('config', 'user.email', 'fixture@example.invalid');
  mkdirSync(join(dir, 'assets'));
  mkdirSync(join(dir, '.clikit-site'));
  writeFileSync(join(dir, '.clikit-site/invariant.json'), JSON.stringify({ minGames: 162, requireMarkers: ['New Release'] }));
  writeFileSync(join(dir, 'assets/index-a-old.js'), bundle(162));
  writeFileSync(join(dir, 'assets/index-z-new.js'), bundle(163));
  const pointTo = (name) => writeFileSync(join(dir, 'index.html'), `<script type="module" crossorigin src="/clikit/assets/${name}"></script>`);
  const commit = () => { git('add', '-A'); git('commit', '-qm', 'fixture'); };
  pointTo(initialCount === 162 ? 'index-a-old.js' : 'index-z-new.js');
  commit();
  return { pointTo, commit, run: () => spawnSync(process.execPath, [guard], { cwd: dir, encoding: 'utf8' }) };
}

test('retained old 162-game bundle does not override the HTML-selected 163-game entry', (t) => {
  const f = fixture(t, 162);
  f.pointTo('index-z-new.js');
  f.commit();
  const result = f.run();
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /163 games, superset of previous \(162\)/);
});

test('HTML-selected entry that drops a game fails even if a complete bundle remains on disk', (t) => {
  const f = fixture(t, 163);
  f.pointTo('index-a-old.js');
  f.commit();
  const result = f.run();
  assert.equal(result.status, 1);
  assert.match(result.stderr, /drops 1 live game\(s\): game-163/);
});

test('HTML pointing at a missing entry fails instead of falling back to retained bundles', (t) => {
  const f = fixture(t, 163);
  f.pointTo('index-missing.js');
  f.commit();
  const result = f.run();
  assert.equal(result.status, 1);
  assert.match(result.stderr, /one existing assets\/index-\*\.js entry/);
});
