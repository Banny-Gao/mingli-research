#!/usr/bin/env node
/**
 * deploy.js — 一键生成 + 构建 + 部署
 * 用法: node scripts/deploy.js
 */
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

// Step 1: generate data
console.log('\n=== Step 1: Generate data ===');
spawnSync('node', ['scripts/generate.js'], { cwd: root, stdio: 'inherit' });

// Step 2: build
console.log('\n=== Step 2: Build ===');
spawnSync('pnpm', ['run', 'build'], { cwd: root, stdio: 'inherit' });

console.log('\n=== Build complete ===');
console.log('Dist dir:', path.join(root, 'dist'));
console.log('Run deploy command to deploy.');