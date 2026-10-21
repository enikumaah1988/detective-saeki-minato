import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';
const exec = promisify(execFile);
const root = resolve(import.meta.dirname, '..');
const manager = resolve(root, 'tools/local-server.mjs');
const run = (...args) => exec(process.execPath, [manager, ...args.map(String)], { cwd: root, timeout: 30000 });
async function listener() {
  const server = createServer((request, response) => response.end('foreign'));
  await new Promise(done => server.listen(0, '127.0.0.1', done));
  return server;
}
test('local server owns its lifecycle and preserves foreign processes', { timeout: 90000 }, async () => {
  const foreign = await listener();
  const foreignPort = foreign.address().port;
  try {
    await assert.rejects(run('start', foreignPort));
    assert.match((await run('stop', foreignPort)).stdout, /Stopped/);
    assert.equal(await (await fetch(`http://127.0.0.1:${foreignPort}`)).text(), 'foreign');
  } finally { await new Promise(done => foreign.close(done)); }
  const reservation = await listener();
  const port = reservation.address().port;
  await new Promise(done => reservation.close(done));
  const statePath = resolve(root, '.local-server', `${port}.json`);
  try {
    const starts = await Promise.allSettled([run('start', port), run('start', port)]);
    assert.ok(starts.some(result => result.status === 'fulfilled' && /Started|Already running/.test(result.value.stdout)));
    assert.equal(starts.filter(result => result.status === 'fulfilled' && /Started:/.test(result.value.stdout)).length, 1);
    const state = JSON.parse(readFileSync(statePath));
    assert.match((await run('start', port)).stdout, /Already running/);
    assert.equal(JSON.parse(readFileSync(statePath)).pid, state.pid);
    assert.match((await run('status', port)).stdout, /Running/);
    const unauthorized = await fetch(`http://127.0.0.1:${state.controlPort}/`, { method: 'POST' });
    assert.equal(unauthorized.status, 403);
    assert.match((await run('status', port)).stdout, /Running/);
    assert.equal((await fetch(`http://127.0.0.1:${port}`)).status, 200);
    assert.match((await run('stop', port)).stdout, /Stopped/);
    assert.equal(existsSync(statePath), false);
    assert.match((await run('stop', port)).stdout, /Stopped/);
    writeFileSync(statePath, JSON.stringify({ pid: 2147483647, token: 'a'.repeat(64) }));
    assert.match((await run('status', port)).stdout, /Stopped/);
    assert.equal(existsSync(statePath), false);
    // An unverifiable live PID must never be stopped, even if the state is stale.
    writeFileSync(statePath, JSON.stringify({ pid: process.pid, token: 'b'.repeat(64) }));
    await assert.rejects(run('stop', port), /ownership could not be verified/);
    assert.equal(existsSync(statePath), true);
    unlinkSync(statePath);
    writeFileSync(statePath, '{broken');
    await assert.rejects(run('stop', port), /Invalid server state/);
    assert.equal(readFileSync(statePath, 'utf8'), '{broken');
    unlinkSync(statePath);
    for (const args of [['start', '0'], ['start', '65536'], ['start', '12x'], ['delete', port], ['start', port, 'extra']]) {
      await assert.rejects(run(...args), /Usage:/);
    }
  } finally { await run('stop', port).catch(() => {}); }
});

test('concurrent state publication never exposes partial JSON', { timeout: 90000 }, async () => {
  const reservation = await listener();
  const port = reservation.address().port;
  await new Promise(done => reservation.close(done));
  const statePath = resolve(root, '.local-server', `${port}.json`);
  try {
    for (let round = 0; round < 3; round++) {
      const starts = Array.from({ length: 6 }, () => run('start', port));
      let watching = true;
      let snapshots = 0;
      const observer = (async () => {
        while (watching) {
          try {
            const state = JSON.parse(readFileSync(statePath, 'utf8'));
            assert.match(state.token, /^[a-f0-9]{64}$/);
            assert.ok(Number.isInteger(state.pid));
            snapshots++;
          } catch (error) {
            if (error.code !== 'ENOENT') throw error;
          }
          await new Promise(done => setTimeout(done, 1));
        }
      })();
      let results;
      try { results = await Promise.allSettled(starts); }
      finally { watching = false; await observer; }
      assert.ok(snapshots > 0);
      assert.equal(results.filter(result => result.status === 'fulfilled' && /Started:/.test(result.value.stdout)).length, 1);
      for (const result of results) {
        if (result.status === 'rejected') assert.doesNotMatch(result.reason.stderr, /Invalid server state/);
      }
      assert.match((await run('stop', port)).stdout, /Stopped/);
    }
  } finally { await run('stop', port).catch(() => {}); }
});
