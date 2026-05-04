#!/usr/bin/env node
import { run } from '../src/index.js';
import { runInit } from '../src/init.js';

const args = process.argv.slice(2);

if (args[0] === 'init') {
  const exitCode = await runInit(args.slice(1));
  process.exit(exitCode);
}

const dir = args[0] ?? 'dist';
const exitCode = await run({ dir, cwd: process.cwd() });
process.exit(exitCode);
