#!/usr/bin/env node
/**
 * Starts the YatraGo backend and the Vite dev server together.
 *
 * Why this exists: `npm start` from the frontend directory used to boot Vite
 * alone, so its /api and /socket.io proxies had nothing to connect to and
 * spammed ECONNREFUSED. This boots the API first, waits for it to answer,
 * then starts Vite.
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(here, '..');
const repoRoot = path.resolve(frontendDir, '..');

const API_BASE = process.env.VITE_PROXY_TARGET || 'http://127.0.0.1:5000';
const HEALTH_URL = `${API_BASE}/api/health`;

const children = [];
let shuttingDown = false;

const spawnChild = (command, args, cwd, label) => {
  const child = spawn(command, args, {
    cwd,
    shell: process.platform === 'win32',
    stdio: 'inherit',
    env: process.env
  });
  child.on('exit', (code) => {
    if (shuttingDown) return;
    console.log(`\n[${label}] exited with code ${code}`);
    shutdown(code ?? 0);
  });
  children.push(child);
  return child;
};

const shutdown = (code = 0) => {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) {
      try {
        child.kill();
      } catch {
        /* already gone */
      }
    }
  }
  setTimeout(() => process.exit(code), 300);
};

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

const waitForApi = async (attempts = 40) => {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const res = await fetch(HEALTH_URL, { signal: AbortSignal.timeout(1200) });
      if (res.ok) return true;
    } catch {
      /* backend still booting */
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return false;
};

console.log('▶ Checking YatraGo backend…');

// Reuse an already-running backend instead of spawning a second one, which
// would crash with EADDRINUSE.
const alreadyRunning = await (async () => {
  try {
    const res = await fetch(HEALTH_URL, { signal: AbortSignal.timeout(1200) });
    return res.ok;
  } catch {
    return false;
  }
})();

let apiReady = alreadyRunning;

if (alreadyRunning) {
  console.log(`✔ Backend already running at ${API_BASE} — reusing it`);
} else {
  console.log('▶ Starting YatraGo backend…');
  spawnChild('node', ['backend/server.js'], repoRoot, 'backend');
  apiReady = await waitForApi();
}

if (apiReady) {
  console.log(`✔ Backend ready at ${API_BASE}`);
} else {
  console.warn(
    `⚠ Backend did not answer at ${HEALTH_URL} — starting Vite anyway.\n` +
      '  API and socket calls will retry automatically once it comes online.\n' +
      '  Check that MongoDB/env config in backend/.env is valid.'
  );
}

console.log('▶ Starting Vite dev server…');
spawnChild('npx', ['vite'], frontendDir, 'vite');
