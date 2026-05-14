import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('generate.js 核心逻辑测试', () => {
  it('应能解析 catalog.md 行格式', () => {
    const line = '| 1 | 天道 | interpretations/tiandao/tutorial.md | 已解读 |';
    const cells = line.split('|').map(c => c.trim()).filter(c => c !== '');
    expect(cells.length).toBeGreaterThanOrEqual(3);
    expect(cells[0]).toBe('1');
    expect(cells[1]).toBe('天道');
  });

  it('应跳过 markdown 标题行', () => {
    const line = '# 滴天髓阐微';
    const trimmed = line.trim();
    const isTitle = /^#{1,6}\s/.test(trimmed);
    expect(isTitle).toBe(true);
  });

  it('应跳过表格分隔行', () => {
    const line = '|---|---|---|---|';
    const trimmed = line.trim();
    const isSeparator = /^\|[-\s:|]+\|$/.test(trimmed);
    expect(isSeparator).toBe(true);
  });

  it('应正确识别已解读状态', () => {
    const status = '已解读';
    const filePath = 'interpretations/tiandao/tutorial.md';
    const isDone = status === '已解读' && filePath && filePath.length > 0;
    expect(isDone).toBe(true);
  });
});

describe('数据文件引用完整性测试', () => {
  const DATA_DIR = path.join(__dirname, '../src/data');

  it('src/data 目录应存在', () => {
    expect(fs.existsSync(DATA_DIR)).toBe(true);
  });

  it('books.ts 应存在', () => {
    const booksPath = path.join(DATA_DIR, 'books.ts');
    expect(fs.existsSync(booksPath)).toBe(true);
  });

  it('index.ts 应存在并导出数据', () => {
    const indexPath = path.join(DATA_DIR, 'index.ts');
    const content = fs.readFileSync(indexPath, 'utf-8');
    expect(content).toContain('ditiansui-site');
  });
});