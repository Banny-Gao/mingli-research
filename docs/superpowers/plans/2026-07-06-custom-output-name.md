# Custom Output Name (--name) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让用户通过 `--name <text>` 自定义 t2i/i2i 输出文件的基础名称，替代不可读的 timestamp，同时保持向后兼容。

**Architecture:**
- 在 `lib/shared/output-name.js` 新增校验 + 冲突检测 helper（t2i/i2i 共用）
- 两个 downloader.js 的 `generateFilename` 和 `saveMetadata` 新增 `name` 参数
- CLI 解析层添加 `--name`，批量模式做数量校验
- 交互流程插入 "基础名称" 输入步骤
- rerender 模式从 metadata.filename 反推原 name，向后兼容旧 metadata

**Tech Stack:** Node.js ES modules, `node --check` 语法验证, 手动 smoke test

**Spec:** `docs/superpowers/specs/2026-07-06-custom-output-name-design.md`

---

## 文件变更概览

| 文件 | 操作 | 责任 |
|------|------|------|
| `scripts/lib/shared/output-name.js` | **新建** | `validateName()` + `resolveUniqueName()` + 常量 |
| `scripts/lib/t2i/cli.js` | 修改 | 添加 `--name` 解析；批量模式数量校验 |
| `scripts/lib/i2i/cli.js` | 修改 | 同上 |
| `scripts/lib/t2i/downloader.js` | 修改 | `generateFilename(ts, index, name?)` + `saveMetadata` 接受 name |
| `scripts/lib/i2i/downloader.js` | 修改 | 同上 |
| `scripts/t2i.js` | 修改 | executeRequest 接受 name；rerender 从 filename 提取 name |
| `scripts/i2i.js` | 修改 | 同上 |
| `scripts/lib/t2i/interactive.js` | 修改 | 插入 "基础名称" 输入步骤；preset 保存 name |
| `scripts/lib/i2i/interactive.js` | 修改 | 同上 |
| `scripts/lib/t2i/presets.js` | 修改 | runtime 剥离时不剔除 name（已有或新增） |

---

## Task 1: 创建共享模块 output-name.js

**Files:**
- Create: `scripts/lib/shared/output-name.js`

- [ ] **Step 1: 写入完整模块代码**

```js
/**
 * scripts/lib/shared/output-name.js — 输出文件名校验 + 冲突检测
 *
 * 供 t2i/i2i 的 downloader.js 共用。
 */

import fs from 'node:fs'
import path from 'node:path'

/** 最大长度（保护文件系统，避免崩溃） */
export const MAX_NAME_LENGTH = 100

/** 禁止字符：路径分隔符 + Windows 保留字符 */
export const FORBIDDEN_CHARS = /[\/\\:*?"<>|]/

/**
 * 校验名字合法性。
 * @param {string} name
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateName(name) {
  if (typeof name !== 'string') {
    return { valid: false, error: '名字必须为字符串' }
  }
  if (!name.trim()) {
    return { valid: false, error: '名字不能为空' }
  }
  if (name.length > MAX_NAME_LENGTH) {
    return { valid: false, error: `名字长度 ${name.length} 超过最大 ${MAX_NAME_LENGTH} 字符` }
  }
  const match = name.match(FORBIDDEN_CHARS)
  if (match) {
    return { valid: false, error: `名字包含非法字符 "${match[0]}"（禁止 / \\ : * ? " < > |）` }
  }
  return { valid: true }
}

/**
 * 转义正则元字符，用于构造动态正则。
 * @param {string} s
 * @returns {string}
 */
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 在 outputDir 中扫描已有文件，若 baseName 冲突则追加 -N 后缀。
 *
 * 算法：
 * - 匹配 `<safeBase>-NN.<ext>` 与 `<safeBase>-M-NN.<ext>`（已递增过的）
 * - 提取最大 M，无冲突返回 safeBase，有冲突返回 safeBase + '-' + (max + 1)
 *
 * @param {string} outputDir
 * @param {string} baseName
 * @param {string} ext - 不含点的扩展名（png / json）
 * @returns {string} 不冲突的唯一名字（不含扩展名）
 */
export function resolveUniqueName(outputDir, baseName, ext) {
  if (!fs.existsSync(outputDir)) return baseName

  const safeBase = escapeRegex(baseName)
  // 匹配两种形式：
  //   1) 古籍封面-01.png       (未递增过)
  //   2) 古籍封面-1-01.png     (已递增过)
  const pattern = new RegExp(`^${safeBase}(?:-(\\d+))?-\\d{2}\\.${ext}$`)

  const files = fs.readdirSync(outputDir)
  let maxSuffix = 0
  for (const f of files) {
    const m = f.match(pattern)
    if (m) {
      const n = m[1] ? parseInt(m[1], 10) : 0
      if (n > maxSuffix) maxSuffix = n
    }
  }

  return maxSuffix === 0 ? baseName : `${baseName}-${maxSuffix + 1}`
}
```

- [ ] **Step 2: 语法检查**

Run:
```bash
node --check scripts/lib/shared/output-name.js
```
Expected: 无输出，exit code 0

- [ ] **Step 3: 手动 smoke test**

Run:
```bash
node -e "
import('./scripts/lib/shared/output-name.js').then(m => {
  console.log('validate \"古籍封面\":', m.validateName('古籍封面'))
  console.log('validate empty:', m.validateName(''))
  console.log('validate /:', m.validateName('a/b'))
  console.log('validate long:', m.validateName('a'.repeat(101)))
  console.log('validate ok:', m.validateName('a-b_c.png'))
})
"
```
Expected: 全部返回 `{ valid: true/false, error? }`，非法字符正确报错

- [ ] **Step 4: Commit**

```bash
git add scripts/lib/shared/output-name.js
git commit -m "feat: add shared output-name helper (validate + conflict-resolve)"
```

---

## Task 2: 修改 t2i downloader.js 支持 name

**Files:**
- Modify: `scripts/lib/t2i/downloader.js:11-13, 71-103`

- [ ] **Step 1: 修改 generateFilename 函数签名**

替换 `scripts/lib/t2i/downloader.js:11-13` 的函数体：

```js
import { resolveUniqueName } from '../shared/output-name.js'

export function generateFilename(timestamp, index, name = null) {
  const base = name || `t2i-${timestamp}`
  return `${base}-${String(index + 1).padStart(2, '0')}.png`
}
```

确保顶部 imports 块添加：
```js
import { resolveUniqueName } from '../shared/output-name.js'
```

- [ ] **Step 2: 修改 saveMetadata 接受 name 参数**

替换 `scripts/lib/t2i/downloader.js:71-103` 的 saveMetadata 函数体：

```js
export function saveMetadata(outputDir, timestamp, opts, results, name = null) {
  const meta = {
    timestamp: new Date(timestamp).toISOString(),
    prompt: opts.prompt,
    model: opts.model || 'image-01',
    aspectRatio: opts.aspectRatio || null,
    width: opts.width || null,
    height: opts.height || null,
    style: opts.style || null,
    styleWeight: opts.styleWeight ?? null,
    n: opts.n || 1,
    seed: opts.seed ?? null,
    promptOptimizer: opts.promptOptimizer || false,
    aigcWatermark: opts.aigcWatermark || false,
    responseFormat: opts.responseFormat || 'url',
    name: name || null,
    results,
  }
  // 保留文字提取结果（cleanPrompt + reservedAreas + texts）
  if (opts.textSpec) {
    meta.textOverlay = {
      cleanPrompt: opts.textSpec.cleanPrompt,
      reservedAreas: opts.textSpec.reservedAreas || [],
      texts: opts.textSpec.texts,
    }
  }
  // 保存背景路径，方便后续 --rerender
  if (opts.saveBackground) {
    meta.backgroundPath = `t2i-${timestamp}-bg.png`
  }

  // 文件名基 = name ?? `t2i-${timestamp}`
  const base = name || `t2i-${timestamp}`
  const filename = `${base}-metadata.json`
  const filepath = path.join(outputDir, filename)
  // 原子写入：先写 .tmp，再 rename
  const tmpPath = filepath + '.tmp'
  fs.writeFileSync(tmpPath, JSON.stringify(meta, null, 2), 'utf-8')
  fs.renameSync(tmpPath, filepath)
  return filepath
}
```

- [ ] **Step 3: 语法检查**

Run:
```bash
node --check scripts/lib/t2i/downloader.js
```
Expected: 无输出，exit code 0

- [ ] **Step 4: Commit**

```bash
git add scripts/lib/t2i/downloader.js
git commit -m "feat(t2i): support custom --name in downloader"
```

---

## Task 3: 修改 i2i downloader.js 支持 name

**Files:**
- Modify: `scripts/lib/i2i/downloader.js:16-74`

- [ ] **Step 1: 修改 generateFilename 函数签名**

替换 `scripts/lib/i2i/downloader.js:16-18`：

```js
export function generateFilename(timestamp, index, name = null) {
  const base = name || `i2i-${timestamp}`
  return `${base}-${String(index + 1).padStart(2, '0')}.png`
}
```

- [ ] **Step 2: 修改 saveMetadata 接受 name 参数**

替换 `scripts/lib/i2i/downloader.js:26-74`：

```js
export function saveMetadata(outputDir, timestamp, opts, results, extra = {}, name = null) {
  const meta = {
    timestamp: new Date(timestamp).toISOString(),
    type: 'i2i',
    inputImage: extra.inputMeta
      ? {
          absPath: extra.inputMeta.absPath,
          mime: extra.inputMeta.mime,
          size: extra.inputMeta.size,
          sha256: extra.inputMeta.sha256,
          isUrl: extra.inputMeta.isUrl,
        }
      : null,
    subjectType: opts.subjectType || 'character',
    prompt: opts.prompt,
    model: opts.model || 'image-01',
    aspectRatio: opts.aspectRatio || null,
    width: opts.width || null,
    height: opts.height || null,
    style: opts.style || null,
    styleWeight: opts.styleWeight ?? null,
    n: opts.n || 1,
    seed: opts.seed ?? null,
    promptOptimizer: opts.promptOptimizer || false,
    aigcWatermark: opts.aigcWatermark || false,
    responseFormat: opts.responseFormat || 'url',
    name: name || null,
    bgAnalysis: extra.bgInfo
      ? {
          width: extra.bgInfo.width,
          height: extra.bgInfo.height,
          mainRect: extra.bgInfo.mainRect,
          dominantColor: extra.bgInfo.dominantColor,
        }
      : null,
    results,
  }
  if (opts.textSpec && opts.textSpec.texts && opts.textSpec.texts.length > 0) {
    meta.textOverlay = {
      texts: opts.textSpec.texts,
      bgInfo: extra.bgInfo || null,
    }
  }
  if (opts.saveBackground) {
    meta.backgroundPath = `i2i-${timestamp}-bg.png`
  }
  const base = name || `i2i-${timestamp}`
  const filename = `${base}-metadata.json`
  const filepath = path.join(outputDir, filename)
  // 原子写入：先写 .tmp，再 rename
  const tmpPath = filepath + '.tmp'
  fs.writeFileSync(tmpPath, JSON.stringify(meta, null, 2), 'utf-8')
  fs.renameSync(tmpPath, filepath)
  return filepath
}
```

- [ ] **Step 3: 语法检查**

Run:
```bash
node --check scripts/lib/i2i/downloader.js
```
Expected: 无输出，exit code 0

- [ ] **Step 4: Commit**

```bash
git add scripts/lib/i2i/downloader.js
git commit -m "feat(i2i): support custom --name in downloader"
```

---

## Task 4: 修改 t2i cli.js 添加 --name 解析

**Files:**
- Modify: `scripts/lib/t2i/cli.js:34-79`

- [ ] **Step 1: 添加 --name 解析 + 批量模式数量校验**

在 `parseArgs` 函数的最开头（opts = {} 后），添加：

```js
import { validateName } from '../shared/output-name.js'

// parseArgs 函数顶部
export function parseArgs(argv) {
  const opts = {}
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--prompt') opts.prompt = argv[++i]
    else if (arg === '--prompts') opts.prompts = parsePrompts(argv[++i])
    // ... 原有 case ...
    else if (arg === '--name') opts.name = argv[++i]
    // ... 其他 case ...
  }

  // --name 校验
  if (opts.name !== undefined) {
    const v = validateName(opts.name)
    if (!v.valid) {
      console.error(`❌ ${v.error}`)
      process.exit(1)
    }
  }

  // 批量模式：--name 数量校验
  if (opts.prompts && opts.name) {
    const names = parsePrompts(opts.name)
    if (names.length === 1) {
      opts.names = new Array(opts.prompts.length).fill(names[0])
    } else if (names.length === opts.prompts.length) {
      opts.names = names
    } else {
      console.warn(
        `⚠️ --name 数量 (${names.length}) 与 --prompts 数量 (${opts.prompts.length}) 不匹配，回退默认 timestamp`
      )
      opts.names = null
    }
  }

  return opts
}
```

- [ ] **Step 2: 更新 printHelp 添加 --name 文档**

在 printHelp 输出中添加新段（在"输出"之后，"预设"之前）：

```
命名:
  --name <text>           自定义基础名称（替代默认 timestamp）
                          文件命名: <name>-01.png, <name>-02.png, ...
                          元数据: <name>-metadata.json
                          批量模式: 逗号分隔多个，与 --prompts 一一对应；
                                   单个 --name 应用于全部
                          冲突时自动追加 -1 / -2 / -3 后缀
                          禁止字符: / \ : * ? " < > |
                          最大长度 100 字符

```

- [ ] **Step 3: 语法检查**

Run:
```bash
node --check scripts/lib/t2i/cli.js
```
Expected: 无输出，exit code 0

- [ ] **Step 4: 手动验证 CLI 解析**

Run:
```bash
node -e "
import('./scripts/lib/t2i/cli.js').then(m => {
  console.log(m.parseArgs(['--name', '古籍封面', '--prompt', 'test']))
  console.log(m.parseArgs(['--prompts', 'p1,p2', '--name', '封面']))
  console.log(m.parseArgs(['--prompts', 'p1,p2', '--name', 'a,b,c']))
  console.log(m.parseArgs(['--name', 'a/b']))
})
"
```
Expected:
- 第一个：`{ name: '古籍封面', prompt: 'test', ... }`
- 第二个：`{ names: ['封面', '封面'], prompts: ['p1','p2'], ... }`
- 第三个：打印警告后 `names: null`
- 第四个：`process.exit(1)` + 错误消息

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/t2i/cli.js
git commit -m "feat(t2i): add --name CLI flag with batch validation"
```

---

## Task 5: 修改 i2i cli.js 添加 --name 解析

**Files:**
- Modify: `scripts/lib/i2i/cli.js:45-117`

- [ ] **Step 1: 添加 --name 解析 + 批量模式数量校验**

与 Task 4 同款改动，添加到 i2i/cli.js。在 parseArgs 函数开头添加 imports：

```js
import { validateName } from '../shared/output-name.js'
```

在 parseArgs 函数体内（opts = {} 之后，pending = {} 之前）添加 `--name` case：

```js
else if (arg === '--name') opts.name = argv[++i]
```

在循环结束之后（return opts 之前）添加：

```js
  // --name 校验
  if (opts.name !== undefined) {
    const v = validateName(opts.name)
    if (!v.valid) {
      console.error(`❌ ${v.error}`)
      process.exit(1)
    }
  }

  // 批量模式：--name 数量校验
  if (opts.prompts && opts.name) {
    const names = parsePrompts(opts.name)
    if (names.length === 1) {
      opts.names = new Array(opts.prompts.length).fill(names[0])
    } else if (names.length === opts.prompts.length) {
      opts.names = names
    } else {
      console.warn(
        `⚠️ --name 数量 (${names.length}) 与 --prompts 数量 (${opts.prompts.length}) 不匹配，回退默认 timestamp`
      )
      opts.names = null
    }
  }
```

- [ ] **Step 2: 更新 printHelp 添加 --name 文档**

在 printHelp 中"输出"之后、"预设"之前添加：

```
命名:
  --name <text>           自定义基础名称（替代默认 timestamp）
                          文件命名: <name>-01.png, <name>-02.png, ...
                          元数据: <name>-metadata.json
                          批量模式: 逗号分隔多个，与 --prompts 一一对应；
                                   单个 --name 应用于全部
                          冲突时自动追加 -1 / -2 / -3 后缀
                          禁止字符: / \ : * ? " < > |
                          最大长度 100 字符

```

- [ ] **Step 3: 语法检查 + 手动验证**

Run:
```bash
node --check scripts/lib/i2i/cli.js && node -e "
import('./scripts/lib/i2i/cli.js').then(m => {
  console.log(m.parseArgs(['--name', '封面', '--input-image', 'ref.png', '--prompt', 'test']))
})
"
```
Expected: 输出 `{ name: '封面', inputImage: 'ref.png', prompt: 'test', ... }`

- [ ] **Step 4: Commit**

```bash
git add scripts/lib/i2i/cli.js
git commit -m "feat(i2i): add --name CLI flag with batch validation"
```

---

## Task 6: 修改 t2i.js 集成 name 到 executeRequest

**Files:**
- Modify: `scripts/t2i.js`

- [ ] **Step 1: 添加 imports**

在 `scripts/t2i.js` 顶部 imports 块添加：

```js
import { resolveUniqueName, validateName } from './lib/shared/output-name.js'
```

- [ ] **Step 2: 在 executeRequest 顶部添加 name 解析**

在 `executeRequest(opts, precomputedTextSpec)` 函数体最开头（dryRun 检查之前）添加：

```js
// 解析 name（opts.name 单值 / opts.names 批量数组）
let name = opts.name || null
if (opts.names && opts.names.length > 0) {
  // executeRequest 单次只处理一个 prompt，从 names 数组取对应索引
  // 调用方需保证 index 正确（批量模式下 i 已传入）
  const idx = opts._nameIndex || 0
  name = opts.names[idx]
}
```

- [ ] **Step 3: 在 filename 生成处使用 name**

找到 `executeRequest` 中所有调用 `generateFilename(timestamp, ...)` 的位置，改为 `generateFilename(timestamp, i, name)`。

具体改动（line 280 附近）：

```js
// 改前
const filename = generateFilename(timestamp, 0)
// 改后
const filename = generateFilename(timestamp, 0, name)
```

```js
// 改前（reuse-background 模式）
const filename = generateFilename(timestamp, 0)
// 改后
const filename = generateFilename(timestamp, 0, name)
```

```js
// 改前（normal 模式下载）
const filename = generateFilename(timestamp, i)
// 改后
const filename = generateFilename(timestamp, i, name)
```

```js
// 改前（normal 模式 base64）
const filename = generateFilename(timestamp, i)
// 改后
const filename = generateFilename(timestamp, i, name)
```

共 4 处替换。

- [ ] **Step 4: 在 saveMetadata 调用处传 name + 冲突检测**

找到 `saveMetadata` 调用位置（约 line 350 附近）：

```js
// 改前
const metaPath = saveMetadata(outputDir, timestamp, { ...opts, textSpec }, results)
// 改后
const metaPath = saveMetadata(outputDir, timestamp, { ...opts, textSpec }, results, name)
```

注意：当 name 为 null 时，旧行为保持（metadata 文件名 = `t2i-{ts}-metadata.json`）；当 name 存在时，使用 `<name>-metadata.json`。

- [ ] **Step 5: 在 reuse-background 模式中处理 name 冲突**

找到 `executeRequest` 中 reuse-background 分支（约 line 248-258）：

```js
// 改前
fs.copyFileSync(opts.reuseBackground, filepath)
// 改后
fs.copyFileSync(opts.reuseBackground, filepath)
// （filename 已包含 name 后处理，无需在此做冲突检测 —— 冲突检测在 downloader 层或由调用方负责）
```

冲突检测：在 `executeRequest` 顶部 name 解析之后，添加：

```js
// name 冲突检测（仅在生成图片时检测，metadata 复用 base 相同）
if (name) {
  const uniqueName = resolveUniqueName(outputDir, name, 'png')
  if (uniqueName !== name) {
    console.log(`   🔄 名称冲突，自动追加后缀: ${name} → ${uniqueName}`)
    name = uniqueName
  }
}
```

注意：`resolveUniqueName` 检测 `.png` 后缀，metadata 也用同一 base，所以冲突时 png 和 metadata 文件名一致。

- [ ] **Step 6: rerender 模式从 filename 提取 name**

找到 `--rerender` 分支（约 line 390-442），在 metadata 读取后、outputPath 计算前添加：

```js
// rerender 模式：从 metadata 提取原 name（兼容旧 metadata 无 name 字段）
const originalFilename = meta.results[0]?.filename || ''
const rerenderName = meta.name || originalFilename.replace(/-\d{2}\.png$/, '') || null
const outputPath = metaPath.replace(/-metadata\.json$/, '-rerender.png')
```

如果 metadata 有 `name` 字段，使用该字段；否则从 filename 提取。rerender 输出文件名固定为 `<name>-rerender.png`，不参与冲突检测（rerender 是手动操作）。

- [ ] **Step 7: 语法检查**

Run:
```bash
node --check scripts/t2i.js
```
Expected: 无输出，exit code 0

- [ ] **Step 8: 手动 smoke test**

Run:
```bash
node scripts/t2i.js --name "测试" --prompt "test" --dry-run
```
Expected: 输出包含 `t2i-测试` 之类字样（dry-run 模式不会实际生成，但应展示参数）；或者报错 LLM_API_KEY 缺失（dry-run 不需要 key，但 name 处理应无错）

实际：dry-run 模式打印请求体预览，不调 API。验证文件无语法错误。

- [ ] **Step 9: Commit**

```bash
git add scripts/t2i.js
git commit -m "feat(t2i): integrate --name into executeRequest + rerender"
```

---

## Task 7: 修改 i2i.js 集成 name 到 executeRequest

**Files:**
- Modify: `scripts/i2i.js`

- [ ] **Step 1: 添加 imports**

在 `scripts/i2i.js` 顶部 imports 块添加：

```js
import { resolveUniqueName, validateName } from './lib/shared/output-name.js'
```

- [ ] **Step 2: 在 executeRequest 顶部添加 name 解析**

在 `executeRequest(opts, precomputedTextSpec)` 函数体最开头添加：

```js
// 解析 name（opts.name 单值 / opts.names 批量数组）
let name = opts.name || null
if (opts.names && opts.names.length > 0) {
  const idx = opts._nameIndex || 0
  name = opts.names[idx]
}
```

- [ ] **Step 3: 冲突检测**

在 outputDir 创建后、调用 API 前添加：

```js
if (name) {
  const uniqueName = resolveUniqueName(outputDir, name, 'png')
  if (uniqueName !== name) {
    console.log(`   🔄 名称冲突，自动追加后缀: ${name} → ${uniqueName}`)
    name = uniqueName
  }
}
```

- [ ] **Step 4: 替换 generateFilename 调用**

找到 `executeRequest` 中所有 `generateFilename(timestamp, ...)` 调用，改为 `generateFilename(timestamp, i, name)`。

共 3 处：normal URL 模式下载、normal base64 模式、reuse-background 模式。

- [ ] **Step 5: 替换 saveMetadata 调用**

找到 `saveMetadata` 调用：

```js
// 改前
const metaPath = saveMetadata(outputDir, timestamp, { ...opts, textSpec }, results, extra)
// 改后（normal 模式）
const metaPath = saveMetadata(outputDir, timestamp, { ...opts, textSpec }, results, extra, name)
```

reuse-background 模式同样改为：

```js
// 改前
const metaPath = saveMetadata(outputDir, timestamp, { ...opts, textSpec }, results, extra)
// 改后
const metaPath = saveMetadata(outputDir, timestamp, { ...opts, textSpec }, results, extra, name)
```

- [ ] **Step 6: rerender 模式从 filename 提取 name**

在 `--rerender` 分支中，读取 metadata 后添加：

```js
const originalFilename = meta.results[0]?.filename || ''
const rerenderName = meta.name || originalFilename.replace(/-\d{2}\.png$/, '') || null
```

rerender outputPath 计算沿用：

```js
const outputPath = metaPath.replace(/-metadata\.json$/, '-rerender.png')
```

- [ ] **Step 7: 语法检查 + 手动 smoke test**

Run:
```bash
node --check scripts/i2i.js
```
Expected: 无输出，exit code 0

- [ ] **Step 8: Commit**

```bash
git add scripts/i2i.js
git commit -m "feat(i2i): integrate --name into executeRequest + rerender"
```

---

## Task 8: 批量模式 worker 传入 _nameIndex

**Files:**
- Modify: `scripts/t2i.js` 批量模式 worker
- Modify: `scripts/i2i.js` 批量模式 worker

- [ ] **Step 1: t2i 批量 worker 传递 _nameIndex**

找到 `scripts/t2i.js` 批量模式 worker（约 line 487）：

```js
// 改前
async ({ p, i, textSpec }) => {
  const promptOpts = { ...opts, prompt: p }
// 改后
async ({ p, i, textSpec }) => {
  const promptOpts = { ...opts, prompt: p, _nameIndex: i }
```

- [ ] **Step 2: i2i 批量 worker 传递 _nameIndex**

找到 `scripts/i2i.js` 批量模式 worker（约 line 530）：

```js
// 改前
async ({ p, i, img, textSpec }) => {
  const promptOpts = { ...opts, prompt: p, inputImage: img.absPath }
// 改后
async ({ p, i, img, textSpec }) => {
  const promptOpts = { ...opts, prompt: p, inputImage: img.absPath, _nameIndex: i }
```

- [ ] **Step 3: 语法检查**

Run:
```bash
node --check scripts/t2i.js && node --check scripts/i2i.js
```
Expected: 无输出，exit code 0

- [ ] **Step 4: Commit**

```bash
git add scripts/t2i.js scripts/i2i.js
git commit -m "feat: pass _nameIndex to per-prompt opts in batch mode"
```

---

## Task 9: t2i 交互模式添加基础名称步骤

**Files:**
- Modify: `scripts/lib/t2i/interactive.js`

- [ ] **Step 1: 导入 + 添加询问步骤**

在 `scripts/lib/t2i/interactive.js` 顶部 imports 添加：

```js
import { validateName } from '../shared/output-name.js'
```

在 `collectOptionsMerged(preset)` 函数中，**Prompt（必填）步骤之后**插入：

```js
  // 1.5 基础名称（可选，缺省用 timestamp）
  if (opts.name === undefined || opts.name === null) {
    const ans = await input({
      message: '基础名称（可选，直接回车用默认时间戳）：',
    })
    const trimmed = ans.trim()
    if (!trimmed) {
      opts.name = null
    } else {
      const v = validateName(trimmed)
      if (!v.valid) {
        console.log(`   ⚠️  ${v.error}，已忽略`)
        opts.name = null
      } else {
        opts.name = trimmed
      }
    }
  }
```

放在 `// 2. Model` 注释之前。

- [ ] **Step 2: printSummary 显示 name**

在 `printSummary` 函数中（"Model: ..." 之前）添加：

```js
  if (opts.name) console.log(`  Name:              ${opts.name}`)
```

- [ ] **Step 3: saveAsPreset 保留 name 字段**

找到 `interactiveMode` 末尾的 preset 保存处：

```js
// 改前
const { prompt, seed, reuseBackground, saveBackground, ...presetConfig } = opts
// 改后
const { prompt, seed, reuseBackground, saveBackground, ...presetConfig } = opts
// name 不在剥离列表中，自动保留
```

无需修改，但确认 name 不在剥离列表中。

- [ ] **Step 4: 语法检查**

Run:
```bash
node --check scripts/lib/t2i/interactive.js
```
Expected: 无输出，exit code 0

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/t2i/interactive.js
git commit -m "feat(t2i): interactive mode — ask for custom name"
```

---

## Task 10: i2i 交互模式添加基础名称步骤

**Files:**
- Modify: `scripts/lib/i2i/interactive.js`

- [ ] **Step 1: 导入 + 添加询问步骤**

在 `scripts/lib/i2i/interactive.js` 顶部 imports 添加：

```js
import { validateName } from '../shared/output-name.js'
```

在 `collectOptionsMerged(preset)` 函数中，**Prompt 步骤之后**插入（与 t2i 同款）：

```js
  // 3.5 基础名称（可选）
  if (opts.name === undefined || opts.name === null) {
    const ans = await input({
      message: '基础名称（可选，直接回车用默认时间戳）：',
    })
    const trimmed = ans.trim()
    if (!trimmed) {
      opts.name = null
    } else {
      const v = validateName(trimmed)
      if (!v.valid) {
        console.log(`   ⚠️  ${v.error}，已忽略`)
        opts.name = null
      } else {
        opts.name = trimmed
      }
    }
  }
```

放在 `// 4. Model` 注释之前。

- [ ] **Step 2: printSummary 显示 name**

在 `printSummary` 函数中（"Model: ..." 之前）添加：

```js
  if (opts.name) console.log(`  Name:              ${opts.name}`)
```

- [ ] **Step 3: 语法检查**

Run:
```bash
node --check scripts/lib/i2i/interactive.js
```
Expected: 无输出，exit code 0

- [ ] **Step 4: Commit**

```bash
git add scripts/lib/i2i/interactive.js
git commit -m "feat(i2i): interactive mode — ask for custom name"
```

---

## Task 11: t2i presets.js 不剥离 name 字段

**Files:**
- Modify: `scripts/lib/t2i/presets.js`

- [ ] **Step 1: 检查 savePreset 是否需要过滤 name**

打开 `scripts/lib/t2i/presets.js`，确认 `savePreset` 函数（line 51 附近）不做字段过滤 —— 它只是 `presets[name] = { name: 参数名, ...config, savedAt: ... }`。

确认：name 字段作为 config 的一部分传入保存即可，无需修改 savePreset 函数本身。

如果调用方（interactive.js）在剥离 runtime 字段时需要保留 name，确认剥离逻辑：

```js
// 互动式模式保存时
const { prompt, seed, reuseBackground, saveBackground, ...presetConfig } = opts
savePreset(undefined, name.trim(), presetConfig)
// name 字段在 presetConfig 中（因为它没被剥离），会自动保存
```

无需修改 presets.js 本身。直接 Commit "no changes" 标记任务完成。

- [ ] **Step 2: 验证 savePreset 行为**

Run:
```bash
node -e "
import('./scripts/lib/t2i/presets.js').then(m => {
  m.savePreset(undefined, 'test', { name: '测试', model: 'image-01' })
  const all = m.loadPresets()
  console.log(all.test)
})
"
```
Expected: `{ name: '测试', model: 'image-01', savedAt: '...' }`

- [ ] **Step 3: Commit（如有需要）**

如果发现 presets.js 需要修改（例如增加 name 字段验证），执行：

```bash
git add scripts/lib/t2i/presets.js
git commit -m "feat(t2i): presets — preserve name field"
```

否则不提交，仅文档说明。

---

## Task 12: 整体手动验证 + 收尾

**Files:**
- 无代码改动

- [ ] **Step 1: 语法检查所有修改文件**

Run:
```bash
for f in \
  scripts/lib/shared/output-name.js \
  scripts/lib/t2i/cli.js \
  scripts/lib/i2i/cli.js \
  scripts/lib/t2i/downloader.js \
  scripts/lib/i2i/downloader.js \
  scripts/t2i.js \
  scripts/i2i.js \
  scripts/lib/t2i/interactive.js \
  scripts/lib/i2i/interactive.js \
  scripts/lib/t2i/presets.js; do
  node --check "/Users/gaozhipeng/Desktop/mingli-research/$f" 2>&1 && echo "$f OK" || echo "$f FAIL"
done
```
Expected: 全部 `OK`

- [ ] **Step 2: 手动验证清单（dry-run 模式）**

Run:
```bash
# t2i 单图 + name
node scripts/t2i.js --name "古籍封面" --prompt "test" --dry-run

# t2i 批量 + 一一对应 name
node scripts/t2i.js --name "封面1,封面2" --prompts "p1,p2" --dry-run

# t2i 批量 + 单一 name
node scripts/t2i.js --name "封面" --prompts "p1,p2,p3" --dry-run

# t2i 批量 + name 数量不匹配（应该警告）
node scripts/t2i.js --name "a,b,c" --prompts "p1,p2" --dry-run

# t2i 非法字符（应该报错退出）
node scripts/t2i.js --name "a/b" --prompt "test" --dry-run

# i2i 同上类似
node scripts/i2i.js --name "封面" --input-image ./ref.png --prompt "test" --dry-run
```

- [ ] **Step 3: 冲突检测验证**

Run:
```bash
mkdir -p /tmp/test-output
# 第一次：生成
# 手动模拟：用 touch 创建空文件模拟已有输出
touch /tmp/test-output/测试-01.png
touch /tmp/test-output/测试-metadata.json

# 第二次：执行应检测到冲突，自动用 "测试-1-01.png"
node -e "
import('./scripts/lib/shared/output-name.js').then(m => {
  console.log('resolve:', m.resolveUniqueName('/tmp/test-output', '测试', 'png'))
})
"
```
Expected: 输出 `测试-1`

- [ ] **Step 4: 清理**

```bash
rm -rf /tmp/test-output
```

- [ ] **Step 5: 提交最终状态（如有遗漏）**

```bash
git status
# 若无未提交修改，跳过
# 若有：
git add -A
git commit -m "chore: --name feature complete"
```

---

## Self-Review Checklist

### Spec 覆盖检查

- ✅ 自定义前缀 → Task 1 (validateName), Task 2-3 (generateFilename)
- ✅ 批量模式 3 种分支（1 / N / 不匹配回退）→ Task 4-5 (parseArgs), Task 8 (_nameIndex)
- ✅ 冲突自动递增 → Task 1 (resolveUniqueName), Task 6-7 (在 executeRequest 调用)
- ✅ rerender 兼容旧 metadata → Task 6-7 (从 filename 反推 name)
- ✅ 字符校验（禁止路径分隔符）→ Task 1 (FORBIDDEN_CHARS)
- ✅ 长度校验（100 字符上限）→ Task 1 (MAX_NAME_LENGTH)
- ✅ CLI + 批量 + 交互三种入口 → Task 4-5 (CLI), Task 9-10 (interactive)
- ✅ t2i + i2i 对称 → 所有任务都包含两个文件的改动
- ✅ preset 保留 name → Task 11 (无需修改验证)
- ✅ 不传 --name 向后兼容 → 所有 Task 中 `name = null` 默认参数

### Placeholder 扫描

- 无 "TBD" / "TODO" / "fill in details"
- 每个 Task 都有完整代码块
- 所有命令有预期输出

### Type 一致性

- `generateFilename(timestamp, index, name?)` 在 t2i/i2i downloader 中签名一致
- `saveMetadata` 在 t2i 是 `(outputDir, timestamp, opts, results, name?)`，i2i 是 `(outputDir, timestamp, opts, results, extra, name?)` —— 注意 i2i 有 extra 参数，name 放在最后
- `validateName(input)` 返回 `{ valid, error? }` 形状一致
- `resolveUniqueName(outputDir, baseName, ext)` 签名一致
- `_nameIndex` 在两个入口文件命名一致

### 风险点

- ⚠️ **saveMetadata 签名不一致**：t2i 是 5 参，i2i 是 6 参（多了 extra）。Task 2 和 Task 3 中已分别标注，确保调用方传对位置
- ⚠️ **resolveUniqueName 只检查 .png**：metadata 文件也用同一 base，冲突检测应一致。已在 Task 6-7 中说明
- ⚠️ **rerender 输出文件名固定为 `<name>-rerender.png`**：不参与冲突检测，因为 rerender 是手动操作而非新生成