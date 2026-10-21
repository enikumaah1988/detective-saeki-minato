import { spawn, spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync, openSync, closeSync, renameSync, linkSync } from 'node:fs';
import { createServer as createHttpServer } from 'node:http';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [action = 'start', rawPort = '5187', ...extra] = process.argv.slice(2);
if (!['start', 'status', 'stop', 'worker'].includes(action) || !/^\d+$/.test(rawPort) || Number(rawPort) < 1 || Number(rawPort) > 65535 || extra.length) {
  console.error('Usage: node tools/local-server.mjs [start|status|stop] [1-65535]');
  process.exit(1);
}
const port = Number(rawPort);
const stateDir = resolve(root, '.local-server');
const statePath = resolve(stateDir, `${port}.json`);
const logPath = resolve(stateDir, `${port}.log`);
const delay = ms => new Promise(r => setTimeout(r, ms));
function readState() {
  try { return JSON.parse(readFileSync(statePath, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return null; throw new Error(`Invalid server state: ${statePath}`); }
}
function alive(pid) {
  if (!Number.isInteger(pid) || pid < 1) return false;
  try { process.kill(pid, 0); return true; } catch (error) { return error.code !== 'ESRCH'; }
}
async function control(state, method = 'GET') {
  if (!state || !Number.isInteger(state.controlPort) || !/^[a-f0-9]{64}$/.test(state.token ?? '')) return false;
  try {
    const response = await fetch(`http://127.0.0.1:${state.controlPort}/`, {
      method, headers: { Authorization: `Bearer ${state.token}` }, signal: AbortSignal.timeout(1500),
    });
    return response.ok && await response.text() === state.token;
  } catch { return false; }
}
function updateState(state, exclusive = false) {
  const temporary = statePath + '.' + process.pid + '.' + randomBytes(8).toString('hex') + '.tmp';
  try {
    writeFileSync(temporary, JSON.stringify(state), { flag: 'wx', mode: 0o600 });
    if (exclusive) linkSync(temporary, statePath);
    else renameSync(temporary, statePath);
  } finally {
    try { unlinkSync(temporary); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
}
function removeOwned(token) {
  if (readState()?.token === token) unlinkSync(statePath);
}
async function worker() {
  const state = readState();
  if (!state || state.pid !== process.ppid) throw new Error('Missing launch ownership.');
  state.pid = process.pid;
  updateState(state);
  const { createServer } = await import('vite');
  let vite;
  const controlServer = createHttpServer((request, response) => {
    if (request.headers.authorization !== `Bearer ${state.token}` || !['GET', 'POST'].includes(request.method)) {
      response.writeHead(403).end(); return;
    }
    response.end(state.token);
    if (request.method === 'POST') setImmediate(shutdown);
  });
  let closing = false;
  async function shutdown() {
    if (closing) return;
    closing = true;
    await vite?.close();
    controlServer.close();
    removeOwned(state.token);
  }
  try {
    vite = await createServer({ root, server: { host: '127.0.0.1', port, strictPort: true, open: false } });
    await vite.listen();
    await new Promise((done, reject) => { controlServer.once('error', reject); controlServer.listen(0, '127.0.0.1', done); });
    state.controlPort = controlServer.address().port;
    updateState(state);
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) { await shutdown(); throw error; }
}
async function main() {
  if (action === 'worker') return worker();
  const state = readState();
  if (await control(state)) {
    if (action === 'stop') {
      if (!await control(state, 'POST')) throw new Error('Stop request failed.');
      for (let i = 0; i < 100 && readState()?.token === state.token; i++) await delay(100);
      if (readState()?.token === state.token) throw new Error('Server has not finished stopping.');
      console.log(`Stopped: http://127.0.0.1:${port}/`);
    } else console.log(`${action === 'start' ? 'Already running' : 'Running'}: http://127.0.0.1:${port}/ (PID ${state.pid})`);
    return;
  }
  if (state && alive(state.pid)) throw new Error('Server is starting or ownership could not be verified. Retry later; no process was stopped.');
  if (state) removeOwned(state.token);
  if (action !== 'start') { console.log(`Stopped: http://127.0.0.1:${port}/`); return; }
  mkdirSync(stateDir, { recursive: true });
  const token = randomBytes(32).toString('hex');
  // Exclusive creation serializes simultaneous starts without killing a PID or a port owner.
  updateState({ token, pid: process.pid }, true);
  try {
    if (!existsSync(resolve(root, 'node_modules/vite/bin/vite.js'))) {
      const install = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['ci'], { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' });
      if (install.status !== 0) throw new Error('npm ci failed.');
    }
    const log = openSync(logPath, 'w');
    const child = spawn(process.execPath, [fileURLToPath(import.meta.url), 'worker', String(port)], {
      cwd: root, detached: true, windowsHide: true, stdio: ['ignore', log, log],
    });
    closeSync(log);
    child.unref();
    let spawnError;
    child.on('error', error => { spawnError = error; });
    for (let i = 0; i < 150; i++) {
      if (spawnError) throw spawnError;
      const current = readState();
      if (current?.token === token && await control(current)) {
        console.log(`Started: http://127.0.0.1:${port}/ (PID ${current.pid})`);
        console.log(process.platform === 'win32' ? `Stop: .\\start-local.cmd -Action stop -Port ${port}` : `Stop: sh ./start-local.sh stop ${port}`);
        return;
      }
      if (!current) throw new Error(`Server failed to start. See ${logPath}`);
      await delay(100);
    }
    throw new Error(`Startup timed out. Check status and ${logPath}`);
  } catch (error) {
    const current = readState();
    if (current?.pid === process.pid) removeOwned(token);
    throw error;
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
