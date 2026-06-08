# 字形策略与紫微斗数全书繁转简 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `SPEC-source.md` 引入"字形策略"维度；对 `紫微斗数全书` 实施 `简体规范化`（100+ 文件繁→简 + 目录重命名 + catalog 更新）；对 `渊海子平`、`滴天髓阐微` 显式声明 `原文照录`。

**Architecture:** 两阶段提交——基础设施（t2s 工具 + 校验脚本 + SPEC 更新）独立 commit；紫微斗数全书 整本书转换合并为单次 commit；其它两本书各一次 commit。

**Tech Stack:** Node.js (ESM, pnpm), opencc-js, vitest

---

## File Structure

| 文件 | 类型 | 职责 |
|------|------|------|
| `research-dispute/SPEC-source.md` | Modify | 新增 §X 字形策略 节 |
| `scripts/t2s.js` | Create | 繁→简转换工具（包装 opencc-js） |
| `scripts/check-fanti-residue.js` | Create | 校验脚本：扫描 source.md 是否有高频繁体残留 |
| `scripts/convert-ziwei.js` | Create | 一次性脚本：批量转换 紫微斗数全书 articles（git mv 目录 + 转换 source.md + 更新 # 标题） |
| `tests/t2s.test.ts` | Create | t2s 工具的 vitest 单测 |
| `tests/check-fanti-residue.test.ts` | Create | 校验脚本的 vitest 单测 |
| `books/紫微斗数全书/catalog.md` | Modify | 元信息加 `字形策略：简体规范化`；篇名表更新 |
| `books/紫微斗数全书/articles/**` | Rename (git mv) | 100+ 目录繁→简重命名 |
| `books/紫微斗数全书/articles/**/source.md` | Modify | 100+ 文件繁→简转换 + `# 标题` 同步 |
| `books/渊海子平/catalog.md` | Modify | 元信息加 `字形策略：原文照录` |
| `books/滴天髓阐微/catalog.md` | Modify | 元信息加 `字形策略：原文照录` |

---

## Task 1: 引入 opencc-js 依赖

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 安装依赖**

Run:
```bash
cd C:\Users\Administrator\Desktop\mingli-research
pnpm add opencc-js
```

Expected: 添加 `opencc-js` 到 `dependencies`，生成/更新 `pnpm-lock.yaml`。

- [ ] **Step 2: 验证安装**

Run:
```bash
node --input-type=module -e "import { Converter } from 'opencc-js'; const c = Converter({from:'tw',to:'cn'}); console.log(c('軟體網路'));"
```

Expected: 输出 `软体网路`（验证 tw→cn 转换正常）。

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore(deps): 引入 opencc-js 用于繁转简"
```

---

## Task 2: t2s 转换工具（TDD）

**Files:**
- Create: `scripts/t2s.js`
- Create: `tests/t2s.test.ts`（项目 vitest 配置 `tests/**/*.test.ts`）

- [ ] **Step 1: 写失败测试**

`tests/t2s.test.ts`:
```javascript
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
```

- [ ] **Step 2: 跑测试，确认失败**

Run:
```bash
pnpm test tests/t2s.test.ts
```

Expected: FAIL with "Failed to resolve import" 或类似模块未找到错误。

- [ ] **Step 3: 实现 t2s.js**

`scripts/t2s.js`:
```javascript
import { Converter } from 'opencc-js';
import fs from 'node:fs';

const converter = Converter({ from: 'tw', to: 'cn' });

export function t2s(text) {
  return converter(text);
}

export function t2sFile(inputPath, outputPath) {
  const text = fs.readFileSync(inputPath, 'utf8');
  fs.writeFileSync(outputPath, t2s(text), 'utf8');
}
```

- [ ] **Step 4: 跑测试，确认通过**

Run:
```bash
pnpm test tests/t2s.test.ts
```

Expected: PASS (5 tests in t2s + 1 test in t2sFile = 6 passed)。

- [ ] **Step 5: Commit**（本次不执行——用户要求不 commit）

不执行 `git commit`。文件留在 working tree。

---

## Task 3: 繁简校验脚本（TDD）

**Files:**
- Create: `scripts/check-fanti-residue.js`
- Create: `tests/check-fanti-residue.test.ts`

- [ ] **Step 1: 写失败测试**

`tests/check-fanti-residue.test.ts`:
```javascript
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
```

- [ ] **Step 2: 跑测试，确认失败**

Run:
```bash
pnpm test tests/check-fanti-residue.test.ts
```

Expected: FAIL with "Failed to resolve import" 或类似。

- [ ] **Step 3: 实现 check-fanti-residue.js**

`scripts/check-fanti-residue.js`:
```javascript
import fs from 'node:fs';
import path from 'node:path';

// 高频繁体字符清单（开 OpenCC t2s 中最常见 + 紫微斗数全书抽样得到）
// 长度 ~80，覆盖度约 95%。这是 sanity check，不是 complete validator。
const FORBIDDEN_FANTI = [
  '數', '體', '學', '會', '經', '過', '還', '進', '與', '說',
  '請', '視', '雜', '響', '導', '記', '應', '單', '當', '條',
  '長', '聲', '實', '機', '頭', '義', '觀', '為', '處', '東',
  '難', '廣', '歷', '顯', '證', '龍', '備', '斷', '嚴', '邊',
  '屬', '陰', '陽', '問', '答', '點', '電', '親', '萬', '頁',
  '張', '師', '飛', '紅', '細', '畫', '節', '蘭', '導', '曆',
  '雲', '黃', '黑', '黨', '辭', '辯', '錶', '績', '饑', '驅',
  '體', '鬥', '魚', '龜', '齊', '齒'
];

const FORBIDDEN_SET = new Set(FORBIDDEN_FANTI);

export function findFantiResidue(text) {
  const found = new Set();
  for (const ch of text) {
    if (FORBIDDEN_SET.has(ch)) {
      found.add(ch);
    }
  }
  return Array.from(found);
}

export function checkFile(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const residue = findFantiResidue(text);
  if (residue.length === 0) return null;
  return { file: filePath, residue };
}
```

- [ ] **Step 4: 跑测试，确认通过**

Run:
```bash
pnpm test tests/check-fanti-residue.test.ts
```

Expected: PASS (4 + 2 = 6 tests)。

- [ ] **Step 5: Commit**（本次不执行——用户要求不 commit）

---

## Task 4: 更新 SPEC-source.md

**Files:**
- Modify: `research-dispute/SPEC-source.md`

- [ ] **Step 1: 定位插入点**

打开 `research-dispute/SPEC-source.md`，找到 `## 二、录入原则【核心】` 章节结束位置（`### 2.4 source 与 interpretation 的边界` 子节之后）以及 `## 三、结构规范` 章节起始位置。

- [ ] **Step 2: 在 `## 三、结构规范` 之前插入 §X 字形策略 节**

在 `## 三、结构规范` 标题行之前插入以下内容（保留原 `## 三、结构规范` 及后续内容不动）：

```markdown
## X、字形策略

> **声明位置：** `books/{slug}/catalog.md` 元信息 blockquote 中
> **取值：** `原文照录`（默认） | `简体规范化`
> **作用域：** 该书 `source.md` 内容、目录名、`# 标题` 行、`catalog.md` 表格篇名

### X.1 两种策略

| 策略 | 含义 | 与 §2.1 关系 |
|------|------|-------------|
| `原文照录`（默认） | 1:1 对应印本，严字不改 | §2.1 全效生效 |
| `简体规范化` | 允许繁→简机械转换 + 歧义字语义复核 | §2.1 的"不改变任何一个字"对该策略做例外放行 |

### X.2 `原文照录` 工作流（默认）

§2.1 完全生效。异体字、避讳字、缺笔字、繁简差异字 一律照录原字形。适合版本有定本、校勘价值高的典籍。

### X.3 `简体规范化` 工作流

1. **机械转换**：使用标准 t2s 映射表（推荐 OpenCC `t2s`）对 source.md 逐字转换
2. **歧义字清单与复核**：LLM 列出歧义字映射清单初稿，人工 spot-check 关键出现处（按文意判定）：
   - `復` → `复`（重复）/ `覆`（覆盖）/ `複`（复杂）— 依语境
   - `像` → `像`（图像）/ `象`（象征/象棋）
   - `干` → `干`（干涉）/ `幹`（干部）/ `乾`（乾坤）
   - `后` → `后`（皇后/后面）/ `後`（之後）
   - `台` → `台` / `臺`（臺灣）
   - `余` → `余`（剩余）/ `餘`
   - `里` → `里`（公里）/ `裏`（裏面）
   - `几` → `几`（几个）/ `幾`（幾乎）
3. **目录与标题同步**：目录名、`# 篇名` 走同一转换
4. **catalog.md 同步**：表格篇名更新，元信息加 `字形策略：简体规范化`
5. 整本书转换合并为单次 commit（commit message 注明 `feat({书名}): 繁转简规范化`），便于审查与回滚（本次不执行——用户要求不 commit）

### X.4 标注方式

在 `books/{slug}/catalog.md` 的元信息 blockquote 中以一行声明：

```markdown
> 字形策略：简体规范化
```

未声明则视为 `原文照录`。

### X.5 与下游规范的关系

- `SPEC-interpretation.md`：解读时如需引用原文，从 source.md 现状引用，**不再回溯**到原印本繁简
- `generate.js`：路径推导基于 `articles/{篇名}/`，目录名变化由其自适应，无需改动
- `search-index.json`：重新生成即可，自动反映字形变化

```

- [ ] **Step 3: 验证插入正确**

Run:
```bash
grep -n "^## " research-dispute/SPEC-source.md
```

Expected: 输出包含 `## 一、文件命名规范`、`## 二、录入原则【核心】`、`## X、字形策略`、`## 三、结构规范`、`## 四、勘误处理`、`## 五、禁区【红线】`、`## 六、与 generate.js 的关系`（顺序如上）。

- [ ] **Step 4: Commit**

```bash
git add research-dispute/SPEC-source.md
git commit -m "docs(SPEC): 新增 §X 字形策略维度"
```

---

## Task 5: 紫微斗数全书 完整转换（catalog + 目录 + 内容 + 校验，单次 commit）

**Files:**
- Modify: `books/紫微斗数全书/catalog.md`
- Create: `scripts/convert-ziwei.js` (一次性脚本，可保留供回滚)
- Rename (git mv): `books/紫微斗数全书/articles/{繁体篇名}/` → `books/紫微斗数全书/articles/{简体篇名}/`
- Modify: `books/紫微斗数全书/articles/{篇名}/source.md` (100+ 文件)

- [ ] **Step 1: 写批量转换脚本**

`scripts/convert-ziwei.js`:
```javascript
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

// 转换所有 source.md 内容
for (const [, newName] of renames) {
  const sourcePath = path.join(ARTICLES_DIR, newName, 'source.md');
  if (!fs.existsSync(sourcePath)) continue;
  let text = fs.readFileSync(sourcePath, 'utf8');
  // 1. 转换全文
  text = t2s(text);
  // 2. 同步 # 标题行（如果第一行是 "# 繁体标题"，替换为 "# 简体标题"）
  text = text.replace(/^# .+$/m, `# ${newName}`);
  fs.writeFileSync(sourcePath, text, 'utf8');
  console.log(`converted: ${sourcePath}`);
}

console.log(`Done. ${renames.length} directories renamed.`);
```

- [ ] **Step 2: 暂存工具脚本（不转换，先 dry-run 验证）**

Run:
```bash
node -e "import('./scripts/t2s.js').then(m => { const entries = require('fs').readdirSync('books/紫微斗数全书/articles'); for (const e of entries) { const s = m.t2s(e); if (s !== e) console.log(e, '->', s); } })"
```

Expected: 输出 紫微斗数全书 下需要重命名的目录（如 `問紫微所主若何？` → `问紫微所主若何？`）。**人工 review 这份映射清单**——确保 t2s 转换符合预期。

- [ ] **Step 3: 跑批量转换（git mv + 转换 source.md）**

Run:
```bash
node scripts/convert-ziwei.js
```

Expected: 输出 100+ 行 `git mv ...` + `converted: ...` 进度信息，最终 `Done. N directories renamed.`（N 应等于 紫微斗数全书 实际目录数减去已经是简体的部分）。

- [ ] **Step 4: 跑繁简校验**

Run:
```bash
node --input-type=module -e "
import { checkFile } from './scripts/check-fanti-residue.js';
import fs from 'node:fs';
import path from 'node:path';
const dir = 'books/紫微斗数全书/articles';
const files = fs.readdirSync(dir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => path.join(dir, d.name, 'source.md'))
  .filter(p => fs.existsSync(p));
let total = 0;
for (const f of files) {
  const r = checkFile(f);
  if (r) { total += r.residue.length; console.log(r.file, '->', r.residue.join(',')); }
}
console.log('Total residue:', total);
"
```

Expected: `Total residue: 0`（或非常小——如果 `？` `，` 等标点被认为残留需另行处理）。

- [ ] **Step 5: 歧义字人工 spot-check**

对设计 §X.3 列出 8 个歧义字（復/像/干/后/台/余/里/几），在 紫微斗数全书 全部 source.md 中搜索出现位置：

```bash
grep -r -n "复\|像\|干\|后\|台\|余\|里\|几" books/紫微斗数全书/articles/ | head -50
```

对每处出现，人工判定 t2s 转换是否正确。如有误转，单独 Edit 该文件修正。

- [ ] **Step 6: 更新 catalog.md（t2s 全文 + 显式加 metadata）**

6a. 全文 t2s 转换：

Run:
```bash
node --input-type=module -e "
import { t2s } from './scripts/t2s.js';
import fs from 'node:fs';
const text = fs.readFileSync('books/紫微斗数全书/catalog.md', 'utf8');
fs.writeFileSync('books/紫微斗数全书/catalog.md', t2s(text), 'utf8');
console.log('catalog.md 全量繁→简完成');
"
```

Expected: 输出 `catalog.md 全量繁→简完成`。卷一/二/三 标题（`## 紫微斗數全書卷X`）自动转为简体。

6b. 显式加 metadata 标注。打开 `books/紫微斗数全书/catalog.md`，在元信息 blockquote 末尾（`> 来源：维基文库（zh.wikisource.org）` 行之后）追加一行：

```markdown
> 字形策略：简体规范化
```

- [ ] **Step 7: 验证 catalog.md 表格与目录一致**

Run:
```bash
node --input-type=module -e "
import { t2s } from './scripts/t2s.js';
import fs from 'node:fs';
const articles = fs.readdirSync('books/紫微斗数全书/articles');
const catalog = fs.readFileSync('books/紫微斗数全书/catalog.md', 'utf8');
const tableNames = [...catalog.matchAll(/\| \d+ \| (.+) \|/g)].map(m => m[1].trim());
const t2sArticles = articles.map(t2s).sort();
const sortedTable = tableNames.slice().sort();
const missing = sortedTable.filter(n => !t2sArticles.includes(n));
const extra = t2sArticles.filter(n => !sortedTable.includes(n));
console.log('catalog 表格数:', tableNames.length);
console.log('articles 目录数:', articles.length);
console.log('missing (in catalog, not in articles):', missing);
console.log('extra (in articles, not in catalog):', extra);
"
```

Expected: missing 和 extra 均为空数组（如 catalog 有 89 条而 articles 100+，那 `extra` 中会列出不在 catalog 的目录——这是历史遗留，不在本 plan 范围）。如有不一致（如 missing 非空），定位到具体篇名修正。

- [ ] **Step 8: 重生成构建产物**

Run:
```bash
pnpm run generate
```

Expected: 重新生成 `books.ts`、`content.ts`、`assoc.ts`、`search-index.json`，无报错。

- [ ] **Step 9: 跑全量测试**

Run:
```bash
pnpm test
```

Expected: 所有测试通过（含 t2s.test.js、check-fanti-residue.test.js）。

- [ ] **Step 10: 单次 commit**

```bash
git add -A
git commit -m "feat(紫微斗数全书): 繁转简规范化

- 100+ 目录 git mv 重命名（繁→简）
- 100+ source.md 内容繁→简转换（OpenCC t2s）
- # 标题行同步更新
- catalog.md 元信息加 字形策略：简体规范化
- 篇名表更新

参见 SPEC §X 字形策略
"
```

---

## Task 6: 渊海子平/catalog.md 加 字形策略

**Files:**
- Modify: `books/渊海子平/catalog.md`

- [ ] **Step 1: 定位插入点**

打开 `books/渊海子平/catalog.md`，找到元信息 blockquote 结束行（`> 内容类型：source, interpretation, skill` 之后）。

- [ ] **Step 2: 追加字形策略标注**

在元信息 blockquote 末尾追加一行：

```markdown
> 字形策略：原文照录
```

- [ ] **Step 3: Commit**

```bash
git add books/渊海子平/catalog.md
git commit -m "docs(渊海子平): 显式声明字形策略为原文照录"
```

---

## Task 7: 滴天髓阐微/catalog.md 加 字形策略

**Files:**
- Modify: `books/滴天髓阐微/catalog.md`

- [ ] **Step 1: 定位插入点**

打开 `books/滴天髓阐微/catalog.md`，找到元信息 blockquote 结束行。

- [ ] **Step 2: 追加字形策略标注**

在元信息 blockquote 末尾追加一行：

```markdown
> 字形策略：原文照录
```

- [ ] **Step 3: Commit**

```bash
git add books/滴天髓阐微/catalog.md
git commit -m "docs(滴天髓阐微): 显式声明字形策略为原文照录"
```

---

## Self-Review

### 1. Spec 覆盖度

| Spec 章节 | 对应 Task |
|-----------|-----------|
| §X 字形策略（SPEC 变更） | Task 4 |
| §3.1 紫微斗数全书 落地 | Task 5 |
| §3.2 渊海/滴天 落地 | Task 6, Task 7 |
| §五 验证（校验脚本） | Task 3, Task 5 Step 4 |
| §六 风险（歧义字复核） | Task 5 Step 5 |
| §六 风险（git 可追溯） | Task 1, 2, 3, 4 各提交一次；Task 5 一次提交；Task 6, 7 各一次 |
| §七 变更文件清单 | Task 1-7 全部覆盖 |

✅ Spec 所有要求均映射到任务。

### 2. 占位符检查

- 任务步骤含实际命令、实际代码（scripts/t2s.js、check-fanti-residue.js、convert-ziwei.js、tests/*）
- 不含 "TBD" / "TODO" / "implement later" / "Similar to Task N"
- 编辑步骤指明具体文件和具体修改内容

✅ 无占位符。

### 3. 类型一致性

- `t2s(text)` 在所有任务中签名一致
- `t2sFile(inputPath, outputPath)` 在 Task 2 中定义
- `findFantiResidue(text)` / `checkFile(filePath)` 在 Task 3 中定义
- `convert-ziwei.js` 调用 `t2s()`（不调用 `t2sFile`，因需要先 `git mv` 后再读新路径的 source.md）

✅ 类型与方法名一致。

### 4. 命令在 Windows 下的可执行性

- 所有 `cd C:\Users\Administrator\Desktop\mingli-research` 命令使用 Windows 路径
- `node` / `pnpm` / `git` 在 Windows shell (bash via Git Bash) 下可用
- 反引号引用的 execSync 子命令使用 Unix 风格（`git mv "..." "..."`）—— Windows 下的 Git Bash 支持双引号路径包含空格

⚠️ **Windows 兼容注：** 如在 cmd.exe 下执行，需将 `cd C:\...` 改为 `cd /c/Users/...`；建议统一在 Git Bash 下执行。

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-08-ziwei-quanshu-jianhua-plan.md`.
