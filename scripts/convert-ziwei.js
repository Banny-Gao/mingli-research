import { t2s } from './t2s.js';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ARTICLES_DIR = 'books/紫微斗数全书/articles';

const entries = fs.readdirSync(ARTICLES_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

const renames = [];
for (const oldName of entries) {
  const newName = t2s(oldName);
  if (newName === oldName) continue;
  const oldPath = path.join(ARTICLES_DIR, oldName);
  const newPath = path.join(ARTICLES_DIR, newName);
  console.log(`git mv "${oldPath}" "${newPath}"`);
  execSync(`git mv "${oldPath}" "${newPath}"`, { stdio: 'inherit' });
  renames.push([oldName, newName]);
}

// 转换所有 source.md 内容（不仅限于被重命名的目录）
const allDirs = fs.readdirSync(ARTICLES_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);
for (const dirName of allDirs) {
  const sourcePath = path.join(ARTICLES_DIR, dirName, 'source.md');
  if (!fs.existsSync(sourcePath)) continue;
  let text = fs.readFileSync(sourcePath, 'utf8');
  // 1. 转换全文
  text = t2s(text);
  // 2. 同步 # 标题行
  text = text.replace(/^# .+$/m, `# ${dirName}`);
  fs.writeFileSync(sourcePath, text, 'utf8');
  console.log(`converted: ${sourcePath}`);
}

console.log(`Done. ${renames.length} directories renamed.`);
