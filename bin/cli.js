#!/usr/bin/env node
import { run } from '../src/index.js';

const dir = process.argv[2] ?? 'dist';
const exitCode = await run({ dir, cwd: process.cwd() });
process.exit(exitCode);
