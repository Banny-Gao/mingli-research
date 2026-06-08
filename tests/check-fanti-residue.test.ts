import { describe, it, expect } from 'vitest';
import { findFantiResidue, checkFile } from '../scripts/check-fanti-residue.js';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

describe('findFantiResidue', () => {
  it('returns empty array for already-simplified text', () => {
    expect(findFantiResidue('简体中文')).toEqual([]);
  });

  it('detects common traditional characters', () => {
    const residue = findFantiResidue('繁體中文');
    expect(residue).toContain('體');
  });

  it('detects multiple traditional characters', () => {
    const residue = findFantiResidue('數 體 學 會 經');
    expect(residue).toEqual(expect.arrayContaining(['數', '體', '學', '會', '經']));
  });

  it('returns unique characters only (no duplicates)', () => {
    const residue = findFantiResidue('數 數 數 體 體');
    expect(residue.filter(c => c === '數').length).toBe(1);
    expect(residue.filter(c => c === '體').length).toBe(1);
  });
});

describe('checkFile', () => {
  it('returns residue for a file with traditional characters', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fanti-test-'));
    const filePath = path.join(tmpDir, 'sample.md');
    fs.writeFileSync(filePath, '繁體中文', 'utf8');
    const result = checkFile(filePath);
    expect(result).not.toBeNull();
    expect(result.file).toBe(filePath);
    expect(result.residue).toContain('體');
  });

  it('returns null for a file without traditional characters', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fanti-test-'));
    const filePath = path.join(tmpDir, 'sample.md');
    fs.writeFileSync(filePath, '简体中文', 'utf8');
    expect(checkFile(filePath)).toBeNull();
  });
});
