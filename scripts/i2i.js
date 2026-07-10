#!/usr/bin/env node
/**
 * i2i.js — MiniMax 图生图脚本（兼容入口）
 *
 * 委托到 image-gen.js --mode i2i。
 *
 * 用法：
 *   node scripts/i2i.js                                                      交互模式
 *   node scripts/i2i.js --input-image ./ref.png --prompt "把背景换成夜晚"       命令行模式
 *   node scripts/i2i.js --prompts "p1,p2" --input-images "img1.png,img2.png"  批量模式
 */

import { main } from './image-gen.js'
main('i2i').catch(err => {
  console.error('❌ 未预期的错误:', err.message)
  process.exit(1)
})
