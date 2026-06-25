#!/usr/bin/env node
/**
 * scripts/fetch-source.js — 典籍原文批量抓取统一入口
 *
 * 用法:
 *   node scripts/fetch-source.js run <slug> [chapter1 chapter2 ...] [--force] [--dry-run]
 *   node scripts/fetch-source.js wiki <slug> [--dry-run]
 *   node scripts/fetch-source.js --help
 *
 * run: 通用抓取(iwzbz.com + generic),需已有 catalog.md + catalog.html
 * wiki: 维基文库全览页抓取,首次运行同时建 catalog.md
 */

import { runMain } from './fetch-source/run.js'
import { wikiMain } from './fetch-source/wiki.js'

const HELP = `用法:
  node scripts/fetch-source.js run <slug> [chapter1 chapter2 ...] [--force] [--dry-run]
  node scripts/fetch-source.js wiki <slug> [--dry-run]
  node scripts/fetch-source.js --help

Subcommand:
  run   通用典籍抓取 (需 books/<slug>/catalog.md + catalog.html)
  wiki  维基文库全览页抓取 (首次运行建 catalog.md;已存在则拒绝)`

const subcommand = process.argv[2]
const rest = process.argv.slice(3)

if (subcommand === 'run') {
  await runMain(rest)
} else if (subcommand === 'wiki') {
  await wikiMain(rest)
} else {
  console.log(HELP)
  process.exit(subcommand === '--help' || subcommand === '-h' ? 0 : 1)
}