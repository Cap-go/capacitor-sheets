#!/usr/bin/env bun

import { existsSync } from 'node:fs';

type Framework = 'angular' | 'react' | 'solid' | 'svelte' | 'vue';

type FrameworkConfig = {
  cwd: string;
  port: number;
  bin: string;
  args: (port: number) => string[];
};

const FRAMEWORKS: Record<Framework, FrameworkConfig> = {
  angular: {
    cwd: 'examples/angular-app',
    port: 4301,
    bin: 'ng',
    args: (port) => ['run', 'dev', '--', '--host', '0.0.0.0', '--port', String(port)],
  },
  react: {
    cwd: 'examples/react-app',
    port: 5181,
    bin: 'vite',
    args: (port) => ['run', 'dev', '--', '--host', '0.0.0.0', '--port', String(port)],
  },
  solid: {
    cwd: 'examples/solid-app',
    port: 5182,
    bin: 'vite',
    args: (port) => ['run', 'dev', '--', '--host', '0.0.0.0', '--port', String(port)],
  },
  svelte: {
    cwd: 'examples/svelte-app',
    port: 5183,
    bin: 'vite',
    args: (port) => ['run', 'dev', '--', '--host', '0.0.0.0', '--port', String(port)],
  },
  vue: {
    cwd: 'examples/vue-app',
    port: 5184,
    bin: 'vite',
    args: (port) => ['run', 'dev', '--', '--host', '0.0.0.0', '--port', String(port)],
  },
};

const DEFAULT_FRAMEWORKS: Framework[] = ['react', 'vue', 'svelte'];
const rawArgs = process.argv.slice(2).map((arg) => arg.trim().toLowerCase());
const wantsAll = rawArgs.includes('--all') || rawArgs.includes('all');
const installMissing = rawArgs.includes('--install');
const requested = rawArgs.filter((arg) => !arg.startsWith('-') && arg !== 'all') as Framework[];
const selected = wantsAll
  ? (Object.keys(FRAMEWORKS) as Framework[])
  : requested.length > 0
    ? requested
    : DEFAULT_FRAMEWORKS;
const running: { name: Framework; proc: Bun.Subprocess }[] = [];

for (const name of selected) {
  const config = FRAMEWORKS[name];
  if (!config) {
    console.error(`Unknown framework: ${name}`);
    process.exitCode = 1;
    continue;
  }

  if (!existsSync(`${config.cwd}/node_modules/.bin/${config.bin}`)) {
    if (!installMissing) {
      console.warn(`[${name}] missing dependencies, skipped. Run with --install to install first.`);
      continue;
    }

    const install = Bun.spawn({
      cmd: ['bun', 'install', '--no-progress'],
      cwd: config.cwd,
      stdout: 'inherit',
      stderr: 'inherit',
      stdin: 'ignore',
    });
    const code = await install.exited;
    if (code !== 0) {
      console.error(`[${name}] dependency install failed`);
      process.exitCode = code;
      continue;
    }
  }

  const proc = Bun.spawn({
    cmd: ['bun', ...config.args(config.port)],
    cwd: config.cwd,
    stdout: 'inherit',
    stderr: 'inherit',
    stdin: 'ignore',
  });

  running.push({ name, proc });
  console.log(`[${name}] http://localhost:${config.port}`);
}

if (running.length === 0) process.exit(process.exitCode || 0);

const shutdown = (): void => {
  for (const { proc } of running) {
    proc.kill();
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

await Promise.race(running.map(({ proc }) => proc.exited));
shutdown();
