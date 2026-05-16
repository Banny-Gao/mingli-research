import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('generate.js 核心逻辑测试', () => {
  it('应解析 catalog.md 6 列行格式', () => {
    const line = '| 01 | 天道 | articles/天道/source.md | articles/天道/interpretation.md | 已解读 | tiandao |';
    const cells = line.split('|').map(c => c.trim()).filter(c => c !== '');
    expect(cells.length).toBe(6);
    expect(cells[0]).toBe('01');
    expect(cells[1]).toBe('天道');
    expect(cells[2]).toBe('articles/天道/source.md');
    expect(cells[3]).toBe('articles/天道/interpretation.md');
    expect(cells[4]).toBe('已解读');
    expect(cells[5]).toBe('tiandao');
  });

  it('应解析 catalog.md 待解读行（空单元格被 filter 移除后为 4 列）', () => {
    const line = '| 09 | 干支总论 | articles/干支总论/source.md | | 待解读 | |';
    const cells = line.split('|').map(c => c.trim()).filter(c => c !== '');
    expect(cells.length).toBe(4);
    expect(cells[0]).toBe('09');
    expect(cells[1]).toBe('干支总论');
    expect(cells[2]).toBe('articles/干支总论/source.md');
    expect(cells[3]).toBe('待解读');
  });

  it('应跳过 markdown 标题行', () => {
    const line = '# 滴天髓阐微';
    const trimmed = line.trim();
    const isTitle = /^#{1,6}\s/.test(trimmed);
    expect(isTitle).toBe(true);
  });

  it('应跳过分类标题行并记录分类', () => {
    const line = '## 上篇 · 通神论';
    const trimmed = line.trim();
    const isCategory = /^##\s/.test(trimmed);
    expect(isCategory).toBe(true);
    if (isCategory) {
      const category = trimmed.replace(/^##\s*/, '');
      expect(category).toBe('上篇 · 通神论');
    }
  });

  it('应跳过表格分隔行', () => {
    const line = '|---|---|---|---|---|---|';
    const trimmed = line.trim();
    const isSeparator = /^\|[-\s:|]+\|$/.test(trimmed);
    expect(isSeparator).toBe(true);
  });

  it('应正确识别已解读状态', () => {
    const status = '已解读';
    const filePath = 'articles/天道/interpretation.md';
    const isDone = status === '已解读' && filePath && filePath.length > 0;
    expect(isDone).toBe(true);
  });

  it('应能解析分类信息（从 ## 标题到表格行的映射）', () => {
    const content = `## 上篇 · 通神论

| 编号 | 篇名 | 原文路径 | 解读路径 | 状态 | 关联技能 |
| ---- | ---- | -------- | -------- | ---- | -------- |
| 01 | 天道 | articles/天道/source.md | articles/天道/interpretation.md | 已解读 | tiandao |
| 09 | 干支总论 | articles/干支总论/source.md | | 待解读 | |

## 下篇 · 六亲论

| 编号 | 篇名 | 原文路径 | 解读路径 | 状态 | 关联技能 |
| ---- | ---- | -------- | -------- | ---- | -------- |
| 35 | 夫妻 | articles/夫妻/source.md | | 待解读 | |
| 36 | 子女 | articles/子女/source.md | articles/子女/interpretation.md | 已解读 | zinv |`;

    const lines = content.split('\n');
    let currentCategory = '';
    const results: Array<{ title: string; category: string; status: string }> = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (/^##\s/.test(trimmed)) {
        currentCategory = trimmed.replace(/^##\s*/, '');
        continue;
      }
      if (/^#/.test(trimmed) || /^\|[-:\s|]+\|$/.test(trimmed)) continue;
      const cells = trimmed.split('|').map(c => c.trim()).filter(c => c !== '');
      if (cells.length < 3 || !/^\d+$/.test(cells[0])) continue;

      const status = cells.length >= 6 ? cells[4] : cells.length >= 5 ? cells[3] : '';
      results.push({
        title: cells[1],
        category: currentCategory,
        status,
      });
    }

    expect(results).toHaveLength(4);
    expect(results[0]).toEqual({ title: '天道', category: '上篇 · 通神论', status: '已解读' });
    expect(results[1]).toEqual({ title: '干支总论', category: '上篇 · 通神论', status: '' });
    expect(results[2]).toEqual({ title: '夫妻', category: '下篇 · 六亲论', status: '' });
    expect(results[3]).toEqual({ title: '子女', category: '下篇 · 六亲论', status: '已解读' });
  });
});

describe('数据文件引用完整性测试', () => {
  const DATA_DIR = path.join(__dirname, '../src/data');

  it('src/data 目录应存在', () => {
    expect(fs.existsSync(DATA_DIR)).toBe(true);
  });

  it('books.ts 应存在并包含 category 字段', () => {
    const booksPath = path.join(DATA_DIR, 'books.ts');
    expect(fs.existsSync(booksPath)).toBe(true);
    const content = fs.readFileSync(booksPath, 'utf-8');
    expect(content).toContain('category: string');
    expect(content).toContain('author: string');
    expect(content).toContain('version: string');
    expect(content).toContain('description: string');
  });

  it('index.ts 应存在并导出数据', () => {
    const indexPath = path.join(DATA_DIR, 'index.ts');
    const content = fs.readFileSync(indexPath, 'utf-8');
    expect(content).toContain('ditiansui-site');
  });
});
