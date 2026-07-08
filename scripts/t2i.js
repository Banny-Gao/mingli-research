#!/usr/bin/env node
/**
 * t2i.js — MiniMax 文生图脚本（兼容入口）
 *
 * 委托到 image-gen.js --mode t2i。
 *
 * 用法：
 *   node scripts/t2i.js                                   交互模式
 *   node scripts/t2i.js --prompt "..."                     命令行模式
 *   node scripts/t2i.js --prompts "猫,狗,鸟" --style 水彩   批量模式
 */

import { main } from './image-gen.js'
main('t2i').catch(err => {
  console.error('❌ 未预期的错误:', err.message)
  process.exit(1)
})
