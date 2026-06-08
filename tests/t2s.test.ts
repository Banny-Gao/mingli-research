import { describe, it, expect } from 'vitest';
import { t2s, t2sFile } from '../scripts/t2s.js';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

describe('t2s', () => {
  it('converts 繁體 to 繁体', () => {
    expect(t2s('繁體')).toBe('繁体');
  });

  it('returns empty string for empty input', () => {
    expect(t2s('')).toBe('');
  });

  it('is idempotent on already-simplified text', () => {
    const input = '简体中文';
    expect(t2s(input)).toBe(input);
  });

  it('handles a full sentence', () => {
    expect(t2s('斗數至玄至微')).toBe('斗数至玄至微');
  });

  it('preserves punctuation and non-CJK characters', () => {
    expect(t2s('問紫微所主若何？')).toBe('问紫微所主若何？');
  });
});

describe('t2sFile', () => {
  it('reads file, converts, and writes to output', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 't2s-test-'));
    const inputPath = path.join(tmpDir, 'in.md');
    const outputPath = path.join(tmpDir, 'out.md');
    fs.writeFileSync(inputPath, '繁體中文', 'utf8');
    t2sFile(inputPath, outputPath);
    expect(fs.readFileSync(outputPath, 'utf8')).toBe('繁体中文');
  });
});
