#!/usr/bin/env node
/**
 * mingli.js — 《滴天髓》学习进度管理脚本
 * Node.js 版本，跨平台兼容
 *
 * 用法: node mingli.js <command> [chapter]
 * 示例: node mingli.js list / node mingli.js read tiandao
 */
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = path.join(__dirname, '..');

const COMMANDS = {
  list: '查看学习进度总览',
  read: '查看某章节的详细解读教程',
  skill: '查看某章节的技能速查文件',
  raw: '查看某章节的原始提取内容',
  help: '显示帮助',
};

const DONE = ['tiandao', 'kundao', 'rendao', 'zhiming', 'liqi', 'peihe', 'tiangan', 'dizhi', 'bage'];

const cmd = process.argv[2];
const arg = process.argv[3];

switch (cmd) {
  case 'list':
  case 'index': {
    const metaPath = path.join(BASE, 'meta/index.md');
    if (existsSync(metaPath)) {
      console.log(readFileSync(metaPath, 'utf-8'));
    } else {
      console.log('⚠️ 未找到 meta/index.md');
    }
    break;
  }

  case 'read':
    if (!arg) {
      console.log('用法: mingli read <章节名>');
      console.log(`已完成的章节: ${DONE.join(', ')}`);
    } else {
      const filePath = path.join(BASE, `interpretations/${arg}/tutorial.md`);
      if (existsSync(filePath)) {
        console.log(readFileSync(filePath, 'utf-8'));
      } else {
        console.log(`⚠️ 未找到章节: ${arg}`);
        console.log(`已完成的章节: ${DONE.join(', ')}`);
      }
    }
    break;

  case 'skill':
    if (!arg) {
      console.log('用法: mingli skill <章节名>');
      console.log(`已完成的章节: ${DONE.join(', ')}`);
    } else {
      const filePath = path.join(BASE, `skills/${arg}/SKILL.md`);
      if (existsSync(filePath)) {
        console.log(readFileSync(filePath, 'utf-8'));
      } else {
        console.log(`⚠️ 未找到章节: ${arg}`);
        console.log(`已完成的章节: ${DONE.join(', ')}`);
      }
    }
    break;

  case 'raw':
    if (!arg) {
      console.log('用法: mingli raw <章节名>');
    } else {
      const filePath = path.join(BASE, `raw/${arg}.md`);
      if (existsSync(filePath)) {
        console.log(readFileSync(filePath, 'utf-8'));
      } else {
        console.log(`⚠️ 未找到章节: ${arg}`);
      }
    }
    break;

  case 'help':
  default:
    console.log('《滴天髓阐微》学习管理系统');
    console.log('');
    console.log('用法: mingli <command> [章节名]');
    console.log('');
    console.log('命令:');
    for (const [c, d] of Object.entries(COMMANDS)) {
      console.log(`  ${c.padEnd(8)} ${d}`);
    }
    console.log('');
    console.log(`已完成的章节: ${DONE.map(s => `${s}(${['天道','坤道','人道','知命','理气','配合','天干','地支','八格'][DONE.indexOf(s)]})`).join(', ')}`);
    break;
}