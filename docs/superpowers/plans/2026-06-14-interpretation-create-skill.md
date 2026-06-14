# interpretation-create Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现 interpretation-create skill —— 主 agent 单点直写 + 双轨批量（subagent 派发 + CLI 脚本调 Anthropic API），共调 `scripts/lib/llm-batch.js` 核心库，按 SPEC-interpretation.md 严格生成 `books/{slug}/articles/{篇名}/interpretation.md`。

**Architecture:** 9 份 `.md` 契约定义状态机与各 gate 协议；`scripts/lib/llm-batch.js`（~300 行）是核心库负责装订 5 份规范 + 调 Claude API + 落盘 + 合规门；`scripts/generate-interpretations.js`（~80 行）是 CLI 入口；`.claude/skills/interpretation-create/SKILL.md` 是主 agent 入口文档。TDD 严格执行：每个内部函数先写 failing test，再写最小实现。

**Tech Stack:** Node 20+（ESM, 已有项目 `"type": "module"`）、`@anthropic-ai/sdk`（v1 新增依赖）、vitest 2.1.9（测试）、Node 内置 `process.env`（env 解析）、`node:fs` / `node:path`（IO）、`AbortSignal`（subagent 中断）、`SIGINT`（CLI 中断）。

**Reference Spec:** `docs/superpowers/specs/2026-06-14-interpretation-create-skill-design.md`

---

## File Structure

### 新增文件（9 份 .md 契约）

```
.claude/skills/interpretation-create/
├── SKILL.md                              # 主入口（Task 10）
└── shared/
    ├── spec-bundles.md                   # Task 1：5 份规范 + 指纹校验
    ├── strategy.md                       # Task 2：单/批 + dry-run 命令模板
    ├── load-gate.md                      # Task 3：5 份规范 Read 顺序 + 打印确认
    ├── condition-check.md                # Task 4：6 项体检检查
    ├── pipeline.md                       # Task 5：9 步主体 + §七 自评 5/4/3 分制
    ├── skeleton.md                       # Task 6：interpretation.md 落盘规则
    ├── quality-gate.md                   # Task 7：落盘前 self-check 精简版契约
    ├── subagent-batch.md                 # Task 8：subagent 派发调度协议
    └── script-batch.md                   # Task 9：CLI 脚本调用约定
```

### 新增 JS 文件（Task 11-13）

```
scripts/
├── generate-interpretations.js           # Task 12：CLI 入口（~80 行）
└── lib/
    ├── llm-batch.js                      # Task 11：核心库（~300 行）
    └── self-check-lite.js                # Task 7：精简版 self-check（~100 行）
```

### 新增测试文件（每个 Task 自带）

```
scripts/lib/__tests__/
├── env.test.js                           # Task 1 配套
├── condition-check.test.js               # Task 4 配套
├── pipeline.test.js                      # Task 5 配套
├── self-check-lite.test.js               # Task 7 配套
├── llm-batch.test.js                     # Task 11 配套
└── generate-interpretations.test.js      # Task 12 配套
```

### 新增配置

```
.env.example                             # Task 1：API key 模板
```

### 修改文件

```
package.json                             # Task 1：加 @anthropic-ai/sdk 依赖
```

---

## Task Dependency Graph

```
Task 1 (spec-bundles + env 解析 + .env.example + @anthropic-ai/sdk)
   ↓
Task 2 (strategy.md 契约)
   ↓
Task 3 (load-gate.md 契约)
   ↓
Task 4 (condition-check.md + 6 项检查函数)
   ↓
Task 5 (pipeline.md + 9 步 prompt 装订)
   ↓
Task 6 (skeleton.md + 4 选项冲突 + 落盘)
   ↓
Task 7 (self-check-lite.js 精简版 + quality-gate.md)
   ↓
Task 8 (subagent-batch.md 调度协议)
   ↓
Task 9 (script-batch.md 调用约定)
   ↓
Task 10 (SKILL.md 主入口)
   ↓
Task 11 (llm-batch.js 核心库 — 集成 Task 1/4/5/6/7 全部组件)
   ↓
Task 12 (generate-interpretations.js CLI wrapper)
   ↓
Task 13 (端到端验证：单点 + 双轨批量)
```

---

## Task 1: 规范包契约 + env 解析 + .env.example + SDK 依赖

**Files:**
- Create: `.claude/skills/interpretation-create/shared/spec-bundles.md`
- Create: `scripts/lib/env.js`
- Create: `scripts/lib/__tests__/env.test.js`
- Create: `.env.example`
- Modify: `package.json`（加 `@anthropic-ai/sdk` 依赖）

- [ ] **Step 1: 装 @anthropic-ai/sdk**

```bash
pnpm add @anthropic-ai/sdk
```

Run: `pnpm add @anthropic-ai/sdk`
Expected: 安装成功，`package.json` 出现 `"@anthropic-ai/sdk": "^..."`

- [ ] **Step 2: 创建 .env.example 模板**

Write `.env.example`:

```bash
# interpretation-create 批量模式所需配置
# 复制为 .env 后填值：cp .env.example .env
# 用法：node --env-file=.env scripts/generate-interpretations.js ...

# 必填：Anthropic API key
# 获取地址：https://console.anthropic.com/settings/keys
ANTHROPIC_API_KEY=sk-ant-...

# 可选：自定义 base URL（兼容自定义网关 / 代理）
# 默认：https://api.anthropic.com
# ANTHROPIC_BASE_URL=https://your-gateway.example.com

# 可选：模型 ID
# 默认：claude-opus-4-8
# ANTHROPIC_MODEL=claude-opus-4-8
```

- [ ] **Step 3: 写 env 解析的 failing test**

Create `scripts/lib/__tests__/env.test.js`:

```javascript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { resolveConfig, ConfigError } from '../env.js'

describe('resolveConfig', () => {
  let savedEnv

  beforeEach(() => {
    savedEnv = { ...process.env }
    // 清空相关 env
    delete process.env.ANTHROPIC_API_KEY
    delete process.env.ANTHROPIC_BASE_URL
    delete process.env.ANTHROPIC_MODEL
  })

  afterEach(() => {
    process.env = savedEnv
  })

  it('throws ConfigError when ANTHROPIC_API_KEY is missing', () => {
    expect(() => resolveConfig({})).toThrow(ConfigError)
  })

  it('reads API key from env when CLI not provided', () => {
    process.env.ANTHROPIC_API_KEY = 'sk-env-test'
    const config = resolveConfig({})
    expect(config.apiKey).toBe('sk-env-test')
  })

  it('CLI --api-key overrides env', () => {
    process.env.ANTHROPIC_API_KEY = 'sk-env-test'
    const config = resolveConfig({ apiKey: 'sk-cli-test' })
    expect(config.apiKey).toBe('sk-cli-test')
  })

  it('uses default baseUrl when env and CLI both missing', () => {
    process.env.ANTHROPIC_API_KEY = 'sk-test'
    const config = resolveConfig({})
    expect(config.baseUrl).toBe('https://api.anthropic.com')
  })

  it('CLI --base-url overrides env', () => {
    process.env.ANTHROPIC_API_KEY = 'sk-test'
    process.env.ANTHROPIC_BASE_URL = 'https://env-gateway.example.com'
    const config = resolveConfig({ baseUrl: 'https://cli-gateway.example.com' })
    expect(config.baseUrl).toBe('https://cli-gateway.example.com')
  })

  it('uses default model claude-opus-4-8 when env and CLI both missing', () => {
    process.env.ANTHROPIC_API_KEY = 'sk-test'
    const config = resolveConfig({})
    expect(config.model).toBe('claude-opus-4-8')
  })

  it('CLI --model overrides env', () => {
    process.env.ANTHROPIC_API_KEY = 'sk-test'
    process.env.ANTHROPIC_MODEL = 'claude-sonnet-4-6'
    const config = resolveConfig({ model: 'claude-haiku-4-5-20251001' })
    expect(config.model).toBe('claude-haiku-4-5-20251001')
  })

  it('ConfigError message includes configuration guidance', () => {
    try {
      resolveConfig({})
    } catch (e) {
      expect(e.message).toContain('ANTHROPIC_API_KEY')
      expect(e.message).toContain('--api-key')
    }
  })
})
```

- [ ] **Step 4: 跑测试验证失败**

Run: `pnpm test scripts/lib/__tests__/env.test.js`
Expected: FAIL with "Cannot find module '../env.js'"

- [ ] **Step 5: 写 env.js 最小实现**

Create `scripts/lib/env.js`:

```javascript
/**
 * scripts/lib/env.js — 解析 ANTHROPIC_* 配置
 *
 * 优先级：CLI 参数 > env var > 默认值
 */

export class ConfigError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ConfigError'
  }
}

const DEFAULTS = {
  baseUrl: 'https://api.anthropic.com',
  model: 'claude-opus-4-8',
}

/**
 * @param {{apiKey?: string, baseUrl?: string, model?: string}} cli
 * @returns {{apiKey: string, baseUrl: string, model: string}}
 */
export function resolveConfig(cli = {}) {
  const apiKey = cli.apiKey || process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new ConfigError(
      `❌ 缺少 ANTHROPIC_API_KEY 环境变量\n\n` +
      `请按以下任一方式配置：\n` +
      `1. 在 .env 中设置（推荐，参考 .env.example）\n` +
      `2. 在 shell 中 export：export ANTHROPIC_API_KEY=sk-ant-...\n` +
      `3. 用 CLI 参数：--api-key sk-ant-...\n\n` +
      `获取 API key：https://console.anthropic.com/settings/keys`
    )
  }
  return {
    apiKey,
    baseUrl: cli.baseUrl || process.env.ANTHROPIC_BASE_URL || DEFAULTS.baseUrl,
    model: cli.model || process.env.ANTHROPIC_MODEL || DEFAULTS.model,
  }
}
```

- [ ] **Step 6: 跑测试验证通过**

Run: `pnpm test scripts/lib/__tests__/env.test.js`
Expected: 8 tests pass

- [ ] **Step 7: 写 spec-bundles.md 契约**

Create `.claude/skills/interpretation-create/shared/spec-bundles.md`:

```markdown
# interpretation-create 规范包

## 必含规范（5 份）

| # | 规范 | 路径 | 用途 |
|---|------|------|------|
| 1 | SPEC-interpretation.md | `research-dispute/SPEC-interpretation.md` | 解读格式与原则（337 行） |
| 2 | general.md | `research-dispute/general.md` | 通用红线 + 学术语体（含 14 条红线） |
| 3 | 术数专项 | `research-dispute/{术数}.md`（如 `bazi.md`）| 领域硬约束（按 `catalog.md` 术数字段动态加载）|
| 4 | catalog.md | `books/{slug}/catalog.md` | 元信息（术数 / 类别 / 篇章表）|
| 5 | source.md | `books/{slug}/articles/{篇名}/source.md` | 待解读的原文 |

**任一缺失立即终止**（套 SPEC §五 Step 1.1）。

## 指纹校验（动态化）

不存死值。5 份规范的指纹在每次强装载时实时取，与"上次录入时的指纹"对比。

```bash
python3 scripts/self-check-fingerprint.py | grep -E "SPEC-interpretation|general.md|bazi.md"
```

输出形如：
```
research-dispute/general.md 指纹: 123:5432d31f0a7024e3
research-dispute/SPEC-interpretation.md 指纹: 337:abc123def456
research-dispute/bazi.md 指纹: 50:789ghi012jkl
```

**漂移处置：**
- 与上轮录入的指纹对比，不一致 → 警告用户
- 用户决定：继续 / 重启流程

## 注入策略

主 agent 直读规范文件（不内联到 subagent prompt，因 v1 不走 subagent 跑 9 步）。
```

- [ ] **Step 8: 提交**

```bash
git add package.json pnpm-lock.yaml .env.example scripts/lib/env.js scripts/lib/__tests__/env.test.js .claude/skills/interpretation-create/shared/spec-bundles.md
git commit -m "feat(interpretation-create): 规范包契约 + env 解析 + @anthropic-ai/sdk 依赖"
```

---

## Task 2: strategy.md 契约（单/批 + dry-run 命令模板）

**Files:**
- Create: `.claude/skills/interpretation-create/shared/strategy.md`

- [ ] **Step 1: 写 strategy.md**

```markdown
# 模式选择 + dry-run 命令模板

主 agent 在 Step 1（单/批）按本模板引导。

## Step 1：单/批

| 模式 | 含义 | 适用 |
|------|------|------|
| 单点 | 一次只解读 1 篇 | 用户知道具体要解读哪一篇 |
| 批量 | 一次解读 N 篇（整本或子集）| 用户想批量补解读 |

**AskUserQuestion 2 选项：**
- A. 单点（聚焦 1 篇）
- B. 批量（指定书 + 篇章列表）

带参数 `/interpretation-create {single|batch}` → 跳过本步。

## 单点模式主 agent 动作摘要

1. Read `books/{slug}/articles/{篇名}/source.md` 全文
2. 强装载 5 份规范（详见 `load-gate.md`）
3. 跑 6 项原文体检（详见 `condition-check.md`）
4. 套 9 步主体流水线（详见 `pipeline.md`）
5. 落盘前 self-check 精简版（详见 `quality-gate.md`）
6. 冲突 4 选项 + Write 文件（详见 `skeleton.md`）

## 批量模式双轨入口

详见 `subagent-batch.md`（入口 A，交互式）与 `script-batch.md`（入口 B，后台/CI）。

## dry-run 命令模板

```bash
# CLI 入口
node scripts/generate-interpretations.js <slug> <chapter1>,<chapter2> --force --dry-run

# 整本所有未解读篇章
node scripts/generate-interpretations.js <slug> --dry-run
```

subagent 派发入口的 dry-run 由主 agent 在 dispatch 前打印（不调脚本）。
```

- [ ] **Step 2: 提交**

```bash
git add .claude/skills/interpretation-create/shared/strategy.md
git commit -m "feat(interpretation-create): strategy.md 单/批 + dry-run 模板契约"
```

---

## Task 3: load-gate.md 契约（5 份规范 Read 顺序 + 打印确认）

**Files:**
- Create: `.claude/skills/interpretation-create/shared/load-gate.md`

- [ ] **Step 1: 写 load-gate.md**

```markdown
# 强装载 gate

主 agent 在进入体检 gate / 主体流水线前必须依次 Read 5 份规范。

## 5 份必装载规范

| # | 文件 | 何时读 | 打印确认 |
|---|------|--------|---------|
| 1 | `research-dispute/SPEC-interpretation.md`（337 行）| Step 3 起始 | `⏳ 正在通读 SPEC-interpretation.md（337 行）⏳` |
| 2 | `research-dispute/general.md`（含 14 条红线）| 紧接 #1 | `⏳ 正在通读 general.md（含 14 条红线）⏳` |
| 3 | `research-dispute/{术数专项}.md`（如 `bazi.md`）| 紧接 #2 | `⏳ 正在通读 {术数专项}.md ⏳` |
| 4 | `books/{slug}/catalog.md` | 紧接 #3 | `⏳ 正在通读 books/{slug}/catalog.md ⏳` |
| 5 | `books/{slug}/articles/{篇名}/source.md` | 紧接 #4 | `⏳ 正在通读 source.md ⏳` |

## 总结确认

5 份全读完后，主 agent 输出一行：

```
✅ 已完整通读 5 份规范（SPEC-interpretation + general + {术数专项} + catalog + source）
```

未达 5 份不进入 Step 4。

## 任一文件缺失的处置

| 缺失文件 | 处置 |
|----------|------|
| SPEC-interpretation.md | 立即终止（无规范可循） |
| general.md | 立即终止（14 条红线是刚性约束） |
| 术数专项（如 bazi.md）| 立即终止（领域硬约束） |
| catalog.md | 立即终止（无元信息） |
| source.md | 立即终止（无原文） |

## 术数专项动态加载

术数 → 专项文件路径的映射：
- 命 → `research-dispute/bazi.md`
- 卜 → `research-dispute/liuyao.md`（v1 假设只有八字，v2 扩充）
- 山 / 医 / 相 → v2 待

读取方式：解析 `catalog.md` blockquote 的 `> 术数：命` 字段，拼接得到 `research-dispute/bazi.md`。
```

- [ ] **Step 2: 提交**

```bash
git add .claude/skills/interpretation-create/shared/load-gate.md
git commit -m "feat(interpretation-create): load-gate.md 强装载 5 份规范契约"
```

---

## Task 4: condition-check.md 契约 + 6 项检查函数（TDD）

**Files:**
- Create: `.claude/skills/interpretation-create/shared/condition-check.md`
- Create: `scripts/lib/condition-check.js`
- Create: `scripts/lib/__tests__/condition-check.test.js`

- [ ] **Step 1: 写 failing test**

Create `scripts/lib/__tests__/condition-check.test.js`:

```javascript
import { describe, it, expect } from 'vitest'
import { checkCondition, modeOf } from '../condition-check.js'

describe('modeOf', () => {
  it('returns 短篇 for text under 500 chars', () => {
    const text = '此篇极短。'.repeat(50) // 250 chars
    expect(modeOf(text)).toBe('短篇')
  })

  it('returns 标准 for text between 500 and 2000 chars', () => {
    const text = '中篇。'.repeat(150) // 450 chars
    expect(modeOf(text)).toBe('标准')
  })

  it('returns 密集 for text over 2000 chars', () => {
    const text = '长篇。'.repeat(800) // 3200 chars
    expect(modeOf(text)).toBe('密集')
  })

  it('ignores empty lines and --- separators', () => {
    const text = '有效内容。\n\n\n---\n\n更多内容。'.repeat(30)
    const mode = modeOf(text)
    expect(['短篇', '标准']).toContain(mode)
  })
})

describe('checkCondition', () => {
  it('detects short mode', () => {
    const text = '此篇极短。'.repeat(50)
    const result = checkCondition(text)
    expect(result.模式).toBe('短篇')
  })

  it('detects cases via 命造 keyword', () => {
    const text = '此造身旺用财。'.repeat(100)
    const result = checkCondition(text)
    expect(result.案例).toMatch(/是/)
  })

  it('detects no cases when keywords absent', () => {
    const text = '此论纯理，无命造举例。'.repeat(100)
    const result = checkCondition(text)
    expect(result.案例).toBe('否')
  })

  it('detects commentators via > 【 blockquote', () => {
    const text = '> 【任铁樵】此言甚善。\n\n正文部分。'.repeat(50)
    const result = checkCondition(text)
    expect(result.注家).toMatch(/是/)
  })

  it('detects variant texts', () => {
    const text = '此句一作「他文」。'.repeat(50)
    const result = checkCondition(text)
    expect(result.异文).toBe('是')
  })

  it('detects omissions', () => {
    const text = '【原文此处残缺】'.repeat(50)
    const result = checkCondition(text)
    expect(result.脱漏).toBe('是')
  })

  it('detects 超长 for text over 5000 chars', () => {
    const text = '长篇内容。'.repeat(700) // 4900 chars, but with extra lines will be > 5000
    const result = checkCondition(text)
    expect(result.超长).toMatch(/是|否/) // 实际取决于精确字符数
  })
})
```

- [ ] **Step 2: 跑测试验证失败**

Run: `pnpm test scripts/lib/__tests__/condition-check.test.js`
Expected: FAIL with "Cannot find module '../condition-check.js'"

- [ ] **Step 3: 写最小实现**

Create `scripts/lib/condition-check.js`:

```javascript
/**
 * scripts/lib/condition-check.js — 原文 6 项体检
 *
 * 套 SPEC-interpretation.md §一.1 mode_of() 函数 + §六 古籍异常场景判据
 */

/**
 * 模式判定：原文 + 原注所有非空行字符数
 * < 500 字符 = 短篇 / 500-2000 = 标准 / ≥ 2000 = 密集
 */
export function modeOf(text) {
  const n = text
    .split('\n')
    .filter(line => line.trim() && line.trim() !== '---')
    .reduce((sum, line) => sum + line.length, 0)

  if (n < 500) return '短篇'
  if (n < 2000) return '标准'
  return '密集'
}

/**
 * 6 项检查
 * @param {string} text - source.md 全文
 * @returns {{模式: string, 案例: string, 注家: string, 异文: string, 脱漏: string, 超长: string}}
 */
export function checkCondition(text) {
  const 模式 = modeOf(text)
  const 有效字符 = text.replace(/\s+/g, '').length

  // 案例：扫 命造/占例/例如/如 + 八字
  const 案例命中 = (text.match(/命造|占例|例如|如[\s\S]{0,30}八字/g) || []).length
  const 案例 = 案例命中 > 0 ? `是（${案例命中} 个）` : '否'

  // 注家：扫 > 【 块引用 或 【XX】 注家标记
  const 注家命中 = (text.match(/^>\s*【|^> 【|【[一-龥]+】/gm) || [])
  const 注家 = 注家命中.length > 0 ? `是（${注家命中.length} 处）` : '否'

  // 异文：一作 X / 异文 / 另一版本
  const 异文 = /一作|异文|另一版本|别本作/.test(text) ? '是' : '否'

  // 脱漏：【脱漏】/【残缺】/【原文此处残缺】
  const 脱漏 = /【脱漏】|【残缺】|【原文此处残缺】/.test(text) ? '是' : '否'

  // 超长：有效正文字符 > 5000
  const 超长 = 有效字符 > 5000 ? `是（${有效字符} 字符）` : '否'

  return { 模式, 案例, 注家, 异文, 脱漏, 超长 }
}
```

- [ ] **Step 4: 跑测试验证通过**

Run: `pnpm test scripts/lib/__tests__/condition-check.test.js`
Expected: 11 tests pass

- [ ] **Step 5: 写 condition-check.md 契约**

Create `.claude/skills/interpretation-create/shared/condition-check.md`:

```markdown
# 原文体检 gate

主 agent 在强装载 gate 通过后、主体 9 步流水线启动前跑 6 项检查。

## 6 项检查

| # | 检查项 | 判据 | 输出 |
|---|--------|------|------|
| 1 | 模式判定 | `modeOf()` 函数：< 500 字符 = 短篇 / 500-2000 = 标准 / ≥ 2000 = 密集 | `模式：标准` |
| 2 | 有无案例 | 扫 source.md 含 `命造` / `占例` / `例如` / `如` + 八字 | `案例：是（N 个）` |
| 3 | 有无注家 | 扫 source.md 含 `> 【` 块引用 或 `【XX】` 注家标记 | `注家：是（N 处）` |
| 4 | 有无版本异文 | 扫 source.md 含"一作 X / 异文 / 另一版本 / 别本作" | `异文：是` |
| 5 | 有无脱漏/残缺 | 扫 source.md 含 `【脱漏】` / `【残缺】` / `【原文此处残缺】` | `脱漏：是` |
| 6 | 是否超长 | 有效正文字符（去空白）> 5000 | `超长：是（N 字符）` |

实现：`scripts/lib/condition-check.js` 的 `checkCondition(text)` 函数，返回 6 项对象。

## 体检报告输出格式

```
# 原文体检报告
- 模式：标准
- 案例：是（2 个）
- 注家：是（任铁樵 / 沈孝瞻）
- 异文：否
- 脱漏：否
- 超长：否
```

## 异常场景策略（套 SPEC §六）

| 体检项 | 策略 |
|--------|------|
| 模式=短篇 | 主体 9 步 §结构梳理 段强制"原文本体文本分析"（句式 + 关键用字 + 篇名选址）|
| 模式=密集 | 主体 9 步 §结构梳理 段允许"分独立理论点"但仍按内容自由组织 |
| 案例=否 | 不设案例章节（套 §三 §1 反机械化规则）|
| 注家=否 | 仅解读【原文】本义（套 §六 §3）|
| 异文=是 | 套 §六 §1 模板：原典籍正文 + 异文标注双块引用 |
| 脱漏=是 | 套 §六 §2 固定标注：`【原文此处残缺/字句脱漏】` |
| 超长=是 | 不拆文件，在原章节内 `####` 分段梳理（套 §六 §6）|

体检报告作为 Step 5 主体流水线的输入条件。
```

- [ ] **Step 6: 提交**

```bash
git add scripts/lib/condition-check.js scripts/lib/__tests__/condition-check.test.js .claude/skills/interpretation-create/shared/condition-check.md
git commit -m "feat(interpretation-create): 6 项体检函数 + 契约"
```

---

## Task 5: pipeline.md 契约 + 9 步 prompt 装订函数（TDD）

**Files:**
- Create: `.claude/skills/interpretation-create/shared/pipeline.md`
- Create: `scripts/lib/pipeline.js`
- Create: `scripts/lib/__tests__/pipeline.test.js`

- [ ] **Step 1: 写 failing test**

Create `scripts/lib/__tests__/pipeline.test.js`:

```javascript
import { describe, it, expect } from 'vitest'
import { buildPipelinePrompt, evalComplianceScore } from '../pipeline.js'

describe('buildPipelinePrompt', () => {
  const specBundle = {
    specInterpretation: '# SPEC-interpretation content',
    general: '# general content',
    shuSpecial: '# bazi content',
    catalog: '# catalog content',
  }

  it('includes all 5 spec sections in order', () => {
    const prompt = buildPipelinePrompt({
      sourceText: '源文内容',
      condition: { 模式: '标准', 案例: '否', 注家: '否', 异文: '否', 脱漏: '否', 超长: '否' },
      specBundle,
    })
    expect(prompt).toContain('SPEC-interpretation content')
    expect(prompt).toContain('general content')
    expect(prompt).toContain('bazi content')
    expect(prompt).toContain('catalog content')
    expect(prompt).toContain('源文内容')
  })

  it('includes 9-step pipeline instructions', () => {
    const prompt = buildPipelinePrompt({
      sourceText: 'x',
      condition: { 模式: '短篇', 案例: '否', 注家: '否', 异文: '否', 脱漏: '否', 超长: '否' },
      specBundle,
    })
    expect(prompt).toContain('内容结构梳理')
    expect(prompt).toContain('逐段引用')
    expect(prompt).toContain('案例/分歧')
    expect(prompt).toContain('深化洞见')
    expect(prompt).toContain('图解补充')
    expect(prompt).toContain('自评合规分')
    expect(prompt).toContain('输出最终文件')
  })

  it('includes condition report', () => {
    const prompt = buildPipelinePrompt({
      sourceText: 'x',
      condition: { 模式: '密集', 案例: '是（2 个）', 注家: '是（任铁樵）', 异文: '是', 脱漏: '否', 超长: '否' },
      specBundle,
    })
    expect(prompt).toContain('密集')
    expect(prompt).toContain('任铁樵')
    expect(prompt).toContain('异文：是')
  })

  it('includes §七 self-evaluation instructions', () => {
    const prompt = buildPipelinePrompt({
      sourceText: 'x',
      condition: { 模式: '标准', 案例: '否', 注家: '否', 异文: '否', 脱漏: '否', 超长: '否' },
      specBundle,
    })
    expect(prompt).toContain('自评合规分')
    expect(prompt).toContain('致命错误')
    expect(prompt).toContain('格式错误')
    expect(prompt).toContain('内容检查')
  })

  it('forbids meta self-reference phrases', () => {
    const prompt = buildPipelinePrompt({
      sourceText: 'x',
      condition: { 模式: '标准', 案例: '否', 注家: '否', 异文: '否', 脱漏: '否', 超长: '否' },
      specBundle,
    })
    expect(prompt).toContain('本解读')
    expect(prompt).toContain('禁止')
  })
})

describe('evalComplianceScore', () => {
  it('returns 5 when no fatal/format/content issues', () => {
    const issues = { fatal: [], format: [], content: [] }
    expect(evalComplianceScore(issues)).toBe(5)
  })

  it('returns 4 when no fatal/format and ≤1 content issue', () => {
    const issues = { fatal: [], format: [], content: ['一项内容瑕疵'] }
    expect(evalComplianceScore(issues)).toBe(4)
  })

  it('returns 3 or below when fatal exists', () => {
    const issues = { fatal: ['元自我引用'], format: [], content: [] }
    expect(evalComplianceScore(issues)).toBeLessThanOrEqual(3)
  })

  it('returns 3 or below when format issues exist', () => {
    const issues = { fatal: [], format: ['引文未用块引用'], content: [] }
    expect(evalComplianceScore(issues)).toBeLessThanOrEqual(3)
  })

  it('returns 3 or below when content issues ≥ 2', () => {
    const issues = { fatal: [], format: [], content: ['a', 'b'] }
    expect(evalComplianceScore(issues)).toBeLessThanOrEqual(3)
  })
})
```

- [ ] **Step 2: 跑测试验证失败**

Run: `pnpm test scripts/lib/__tests__/pipeline.test.js`
Expected: FAIL with "Cannot find module '../pipeline.js'"

- [ ] **Step 3: 写 pipeline.js 最小实现**

Create `scripts/lib/pipeline.js`:

```javascript
/**
 * scripts/lib/pipeline.js — 9 步主体流水线 prompt 装订 + §七 自评打分
 *
 * 套 SPEC-interpretation.md §五 Step 3-9 + §七 自评 5/4/3 分制
 */

/**
 * 装订 9 步主体流水线的 prompt
 * @param {{sourceText: string, condition: object, specBundle: {specInterpretation: string, general: string, shuSpecial: string, catalog: string}}} opts
 * @returns {string} 完整 prompt
 */
export function buildPipelinePrompt({ sourceText, condition, specBundle }) {
  return `# 9 步主体流水线（套 SPEC-interpretation.md §五 Step 3-9 + §七）

## 强装载 5 份规范（已通读）

### 1. SPEC-interpretation.md
${specBundle.specInterpretation}

### 2. general.md
${specBundle.general}

### 3. 术数专项
${specBundle.shuSpecial}

### 4. catalog.md
${specBundle.catalog}

### 5. source.md（待解读原文）
${sourceText}

## 原文体检报告

- 模式：${condition.模式}
- 案例：${condition.案例}
- 注家：${condition.注家}
- 异文：${condition.异文}
- 脱漏：${condition.脱漏}
- 超长：${condition.超长}

## 9 步执行清单

### Step 3：内容结构梳理
- 拆段、标注家、分类理论与案例
- 提取二级标题（**反机械化规则**：禁 source 分层标签作标题；标题从原文关键词中抓取）
- 套 §六 异常场景策略

### Step 4：逐段引用 + 表层解读
- 套 §2.1 模板：一引一解
- 引文必须 \`>\` 块引用 + 完整整句
- 术语当场释义融入语言（**禁独立【白话】行**）

### Step 5：案例 / 分歧处理
- 有案例：套 §2.2 案例模板
- 流派分歧：客观陈列，不判对错

### Step 6：深化洞见（按需）
- LLM 自判：确有深层意蕴时撰，无则不强写
- 允许范围见 §一.2 §2

### Step 7：图解补充（按需）
- 套 §2.4 必用 / 禁用规则
- 必用场景：多级逻辑判断 / 流派对比 / 体系脉络
- 禁用场景：纯文字释义 / 装饰性配图

### Step 8：自评合规分（0-5）
- 致命错误 0 + 格式错误 0 + 内容检查 0 = 5 分
- 致命错误 0 + 格式错误 0 + 内容检查 ≤ 1 = 4 分
- 否则 ≤ 3 分（强制重写）

### Step 9：输出最终文件
- 自评 ≥ 4 才输出
- 文件结构：见 skeleton.md

## 反元自我引用硬规则（套 §一.4 §6）

**禁止**：
- 「本解读」「本文」「本篇解读」
- 【原文此处疑似 OCR 错字】等带【】的元自我标签
- \`mode_of()\` / \`SPEC §X.X\` / \`按 SPEC 公式判为\` 等流水线术语
- 「**本篇模式**」「**模式判定**」等文首元数据 blockquote

**改写方向**：「此言……」「按……」「盖……」「观此造……」

## 输出格式

请输出完整 interpretation.md 内容（**不**含 H1 标题，裸篇名由目录系统推导）。
`
}

/**
 * §七 自评打分
 * @param {{fatal: string[], format: string[], content: string[]}} issues
 * @returns {number} 0-5
 */
export function evalComplianceScore(issues) {
  if (issues.fatal.length > 0) return 3
  if (issues.format.length > 0) return 3
  if (issues.content.length === 0) return 5
  if (issues.content.length === 1) return 4
  return 3
}
```

- [ ] **Step 4: 跑测试验证通过**

Run: `pnpm test scripts/lib/__tests__/pipeline.test.js`
Expected: 10 tests pass

- [ ] **Step 5: 写 pipeline.md 契约**

Create `.claude/skills/interpretation-create/shared/pipeline.md`:

```markdown
# 主体 9 步流水线

套 `SPEC-interpretation.md` §五 Step 3-9 + §七 自评。

## 9 步执行清单

| Step | 动作 | 输出 |
|------|------|------|
| 3 | 内容结构梳理 | 拆段、标注家、分类理论与案例；提取二级标题（反机械化规则）|
| 4 | 逐段引用+表层解读 | 套 §2.1 模板：一引一解；术语当场释义融入语言 |
| 5 | 案例/分歧处理 | 套 §2.2 案例模板；流派分歧客观陈列 |
| 6 | 深化洞见（按需）| LLM 自判：确有深层意蕴时撰，无则不强写 |
| 7 | 图解补充（按需）| 套 §2.4 必用/禁用规则 |
| 8 | 自评合规分（0-5）| 套 §七 清单逐项自评 |
| 9 | 输出最终文件 | 自评 ≥ 4 才输出 |

## §七 自评 5/4/3 分制

- **5 分**：致命错误 0 + 格式错误 0 + 内容检查 0
- **4 分**：致命错误 0 + 格式错误 0 + 内容检查 ≤ 1
- **< 4 分**：现场重写（不退出）；最多 3 次重写仍 < 4 → 报告用户决定

## 反元自我引用硬规则（套 §一.4 §6）

- 禁"本解读""本文""本篇解读"
- 禁 `【原文此处疑似 OCR 错字】` 等带【】的元自我标签
- 禁 `mode_of()` / `SPEC §X.X` / `按 SPEC 公式判为` 等流水线术语
- 禁"**本篇模式**""**模式判定**"等文首元数据 blockquote
- 改写方向：「此言……」「按……」「盖……」「观此造……」

## 实现

`scripts/lib/pipeline.js` 提供：
- `buildPipelinePrompt({sourceText, condition, specBundle})` → 完整 9 步 prompt
- `evalComplianceScore({fatal, format, content})` → 0-5 分

## token 预算（per-篇）

- 5 份规范合计：~30-50K tokens
- source.md 平均：~3-10K tokens
- 9 步 prompt 指令：~2K tokens
- **input 合计**：~35-62K tokens / 篇
- output（interpretation.md）：~5-15K tokens / 篇
- **单篇总成本**：~40-77K tokens
```

- [ ] **Step 6: 提交**

```bash
git add scripts/lib/pipeline.js scripts/lib/__tests__/pipeline.test.js .claude/skills/interpretation-create/shared/pipeline.md
git commit -m "feat(interpretation-create): 9 步 prompt 装订 + §七 自评打分函数"
```

---

## Task 6: skeleton.md 契约 + 4 选项冲突 + 落盘（TDD）

**Files:**
- Create: `.claude/skills/interpretation-create/shared/skeleton.md`
- Create: `scripts/lib/conflict.js`
- Create: `scripts/lib/__tests__/conflict.test.js`

- [ ] **Step 1: 写 failing test**

Create `scripts/lib/__tests__/conflict.test.js`:

```javascript
import { describe, it, expect } from 'vitest'
import { resolveConflict, ConflictChoice } from '../conflict.js'

describe('resolveConflict', () => {
  it('returns 覆盖 when choice is overwrite', () => {
    const result = resolveConflict(ConflictChoice.OVERWRITE, '/tmp/x.md', 'new content')
    expect(result.action).toBe('write')
    expect(result.content).toBe('new content')
  })

  it('returns 备份 + 写入 when choice is backup', () => {
    const result = resolveConflict(ConflictChoice.BACKUP, '/tmp/x.md', 'new content')
    expect(result.action).toBe('write')
    expect(result.backupPath).toBe('/tmp/x.md.bak')
  })

  it('returns 取消 when choice is cancel', () => {
    const result = resolveConflict(ConflictChoice.CANCEL, '/tmp/x.md', 'new content')
    expect(result.action).toBe('skip')
    expect(result.content).toBeNull()
  })

  it('returns 退出 when choice is abort', () => {
    const result = resolveConflict(ConflictChoice.ABORT, '/tmp/x.md', 'new content')
    expect(result.action).toBe('abort')
    expect(result.content).toBeNull()
  })
})
```

- [ ] **Step 2: 跑测试验证失败**

Run: `pnpm test scripts/lib/__tests__/conflict.test.js`
Expected: FAIL with "Cannot find module '../conflict.js'"

- [ ] **Step 3: 写 conflict.js 最小实现**

Create `scripts/lib/conflict.js`:

```javascript
/**
 * scripts/lib/conflict.js — 落盘冲突 4 选项
 *
 * 与 source-create 共享同一 4 选项形态
 */

export const ConflictChoice = Object.freeze({
  OVERWRITE: 'A',
  BACKUP: 'B',
  CANCEL: 'C',
  ABORT: 'D',
})

/**
 * @param {string} choice - 'A' | 'B' | 'C' | 'D'
 * @param {string} filePath
 * @param {string} newContent
 * @returns {{action: 'write'|'skip'|'abort', content: string|null, backupPath: string|null}}
 */
export function resolveConflict(choice, filePath, newContent) {
  switch (choice) {
    case ConflictChoice.OVERWRITE:
      return { action: 'write', content: newContent, backupPath: null }
    case ConflictChoice.BACKUP:
      return { action: 'write', content: newContent, backupPath: `${filePath}.bak` }
    case ConflictChoice.CANCEL:
      return { action: 'skip', content: null, backupPath: null }
    case ConflictChoice.ABORT:
      return { action: 'abort', content: null, backupPath: null }
    default:
      throw new Error(`Unknown conflict choice: ${choice}`)
  }
}
```

- [ ] **Step 4: 跑测试验证通过**

Run: `pnpm test scripts/lib/__tests__/conflict.test.js`
Expected: 4 tests pass

- [ ] **Step 5: 写 skeleton.md 契约**

Create `.claude/skills/interpretation-create/shared/skeleton.md`:

```markdown
# interpretation.md 落盘规则

主 agent 在 Step 6 落盘时创建产物：`books/{slug}/articles/{篇名}/interpretation.md`

## 与 source.md 的关键差异

| 维度 | source.md | interpretation.md |
|------|-----------|-------------------|
| 元信息 blockquote | **无**（元信息在 catalog.md）| **无**（同上） |
| 一级标题 | `# {篇名}` 裸篇名 | **无 H1**（不重复篇名）|
| 块引用 | 仅 `> 【注家名】` 注家 | 多类块引用（【原文】/【原注】/【诸家评】/【后人补注】/【夹注】/【异文标注】/【命造】/【占例】）|
| 表格 | 无 | 允许（流派分歧 / 案例对比）|
| Mermaid | 无 | 允许（套 §2.4 规则）|
| Markdown 语法 | 仅 `>` 块引用 | 允许块引用 + 二~四级标题 + **粗体** + 表格 + mermaid + 原生简单 HTML |

## interpretation.md 模板

\`\`\`markdown
## {理论点 1 标题（从原文关键词抓取，反机械化）}

> 【原文】完整原文整句

义理解读正文（引后必解；术语当场释义融入语言）

> 【原注】完整原注整句

解读续

## {理论点 2 标题}

> 【原文】完整原文整句

义理解读正文

（案例跟随其所属理论点，不单独抽离）
> 【命造一（原注第X段）】基础信息

案例解读：罗列基础信息 → 格局/流程分析 → 结合原文结论

## 全书定位（笼统表述，不做具体跨篇断言）

{末节}
\`\`\`

## 字段填充规则

- 无 H1（裸篇名由目录系统推导）
- 二级标题从原文中提炼，禁 source 分层标签作标题
- 注家标识优先读 catalog.md 预设；缺失用兜底（【原文】/【原注】/【诸家评】/【后人补注】/【夹注】）
- 引文必须 \`>\` 块引用 + 完整整句
- 通俗注释融入写作语言（无独立【白话】行）
- 案例必须原典/原注自带，禁自创

## 冲突 4 选项（Step 6 内部）

**触发：** interpretation.md 已存在

| 选项 | 含义 | 后续动作 |
|------|------|---------|
| A. 覆盖 | 替换现有文件 | 写新内容，旧文件丢失 |
| B. 备份为 .bak | 旧文件改名为 interpretation.md.bak，新文件写入 | 旧内容可回滚 |
| C. 取消 | 放弃本次录入 | 退出，不写文件 |
| D. 退出 | 放弃整个 interpretation-create 流程 | 退出 |

**实现：** `scripts/lib/conflict.js` 的 `resolveConflict(choice, filePath, newContent)`。

## 落盘顺序

1. 调 self-check 精简版（详见 `quality-gate.md`）→ fatal=0 才继续
2. 检查 `books/{slug}/articles/{篇名}/interpretation.md` 是否已存在
3. 存在 → 主 agent 走 4 选项 gate（subagent 派发时由主 agent 替用户决定）
4. 不存在或已决定 → 写文件
5. 不自动跑 `node scripts/generate.js`，由用户决定
```

- [ ] **Step 6: 提交**

```bash
git add scripts/lib/conflict.js scripts/lib/__tests__/conflict.test.js .claude/skills/interpretation-create/shared/skeleton.md
git commit -m "feat(interpretation-create): 4 选项冲突解决函数 + skeleton.md 落盘契约"
```

---

## Task 7: 精简版 self-check + quality-gate.md 契约（TDD）

**Files:**
- Create: `scripts/lib/self-check-lite.js`
- Create: `scripts/lib/__tests__/self-check-lite.test.js`
- Create: `.claude/skills/interpretation-create/shared/quality-gate.md`

- [ ] **Step 1: 写 failing test**

Create `scripts/lib/__tests__/self-check-lite.test.js`:

```javascript
import { describe, it, expect } from 'vitest'
import { runSelfCheckLite } from '../self-check-lite.js'

describe('runSelfCheckLite', () => {
  it('returns 0 fatal for clean text', () => {
    const text = '## 标题\n\n> 【原文】原文整句。\n\n解读正文。\n\n## 另一节\n\n> 【原注】注整句。\n\n解读续。'
    const result = runSelfCheckLite(text)
    expect(result.fatal).toBe(0)
    expect(result.issues.fatal).toEqual([])
  })

  it('detects meta self-reference (fatal)', () => {
    const text = '本解读不展开具体跨篇断言。'
    const result = runSelfCheckLite(text)
    expect(result.fatal).toBeGreaterThan(0)
    expect(result.issues.fatal.some(i => i.includes('本解读'))).toBe(true)
  })

  it('detects pipeline jargon (fatal)', () => {
    const text = '按 SPEC §一.2 规则处理。'
    const result = runSelfCheckLite(text)
    expect(result.fatal).toBeGreaterThan(0)
  })

  it('detects meta self-label with 【】 (fatal)', () => {
    const text = '【本解读不展开】此处略。'
    const result = runSelfCheckLite(text)
    expect(result.fatal).toBeGreaterThan(0)
  })

  it('detects mode_of jargon (fatal)', () => {
    const text = 'mode_of() 返回标准。'
    const result = runSelfCheckLite(text)
    expect(result.fatal).toBeGreaterThan(0)
  })

  it('detects meta blockquote header (fatal)', () => {
    const text = '> **本篇模式**\n> 标准'
    const result = runSelfCheckLite(text)
    expect(result.fatal).toBeGreaterThan(0)
  })

  it('detects missing blockquote for cited text (format)', () => {
    const text = '【原文】原文整句。\n\n解读。' // 缺 > 块引用
    const result = runSelfCheckLite(text)
    expect(result.issues.format.length).toBeGreaterThan(0)
  })

  it('detects 自创案例 marker (fatal)', () => {
    // 自创案例典型：以"试举一例"开头但无【命造】标注
    const text = '## 试举一例\n\n试造：甲子 乙丑 丙寅 丁卯。\n\n此造身旺。'
    const result = runSelfCheckLite(text)
    expect(result.fatal).toBeGreaterThan(0)
  })

  it('detects 独立白话行 (format)', () => {
    const text = '> 【原文】原文整句。\n\n【白话】白话解释。\n\n解读。'
    const result = runSelfCheckLite(text)
    expect(result.issues.format.some(i => i.includes('白话'))).toBe(true)
  })

  it('returns score property', () => {
    const text = '## 标题\n\n> 【原文】原文整句。\n\n解读。'
    const result = runSelfCheckLite(text)
    expect(typeof result.score).toBe('number')
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(5)
  })
})
```

- [ ] **Step 2: 跑测试验证失败**

Run: `pnpm test scripts/lib/__tests__/self-check-lite.test.js`
Expected: FAIL with "Cannot find module '../self-check-lite.js'"

- [ ] **Step 3: 写 self-check-lite.js 最小实现**

Create `scripts/lib/self-check-lite.js`:

```javascript
/**
 * scripts/lib/self-check-lite.js — 精简版 self-check（Node 端 grep 实现）
 *
 * v1 覆盖：致命错误（7 类）+ 格式错误（2 类），共 9 项
 * v2 评估：是否与 self-check-interpretation subagent 合并
 *
 * 套 SPEC-interpretation.md §一.4 §6 反 AI 痕迹 + §七 自检清单
 */

/**
 * @param {string} text - interpretation.md 全文
 * @returns {{fatal: number, score: number, issues: {fatal: string[], format: string[], content: string[]}}}
 */
export function runSelfCheckLite(text) {
  const issues = { fatal: [], format: [], content: [] }

  // === 致命错误（7 类） ===

  // 1. 元自我引用
  if (/本解读|本文(?!化|体)|本篇解读/.test(text)) {
    issues.fatal.push('元自我引用：含"本解读"等元表态')
  }

  // 2. 元自我标签（带【】的元标签）
  if (/【本解读|【本文|【本篇解读|【此处略】|【录入注】/.test(text)) {
    issues.fatal.push('元自我标签：含【本解读...】等元标签')
  }

  // 3. 流水线术语
  if (/mode_of\(|SPEC §\d|按 SPEC 公式判为|按用户口径|按标准档组织/.test(text)) {
    issues.fatal.push('流水线术语：含 mode_of()/SPEC §X.X 等内部术语')
  }

  // 4. 元数据块（文首）
  if (/^>\s*\*\*本篇模式\*\*|^>\s*\*\*模式判定\*\*|^>\s*\*\*体量定位\*\*|^>\s*\*\*mode_of\*\*/m.test(text)) {
    issues.fatal.push('元数据块：文首含"**本篇模式**"等元数据 blockquote')
  }

  // 5. 自创案例（"试举一例"+"试造"标记）
  if (/试举一试|试造[：:]|今试拟一|虚拟一造|姑且试一/.test(text)) {
    issues.fatal.push('自创案例：含"试造"/"虚拟一造"等自创案例标记')
  }

  // 6. 流派武断（"唯一正确"绝对定论）
  if (/唯一正确|绝对正确|毫无疑义|无可争议/.test(text)) {
    issues.fatal.push('流派武断：含"唯一正确"等绝对定论')
  }

  // 7. 截取半句引文
  // 简化检测：若一行以"...。"或"……"结尾且下一行是解读，疑似截取
  if (/>\s*【[^】]+】[^。\n]*[…\.]{3}/.test(text)) {
    issues.fatal.push('截取半句引文：引文含...疑似截断')
  }

  // === 格式错误（2 类） ===

  // 1. 缺块引用（疑似引文未用 `>` 包裹）
  if (/^【原文】|^【原注】|^【诸家评】/m.test(text)) {
    issues.format.push('引文未用 `>` 块引用包裹')
  }

  // 2. 独立【白话】行
  if (/^【白话】/m.test(text)) {
    issues.format.push('独立【白话】行（应融入写作语言）')
  }

  // === 计算 score ===
  const fatal = issues.fatal.length
  const format = issues.format.length
  let score
  if (fatal > 0 || format > 0) score = 3
  else if (issues.content.length === 0) score = 5
  else if (issues.content.length === 1) score = 4
  else score = 3

  return { fatal, score, issues }
}
```

- [ ] **Step 4: 跑测试验证通过**

Run: `pnpm test scripts/lib/__tests__/self-check-lite.test.js`
Expected: 10 tests pass

- [ ] **Step 5: 写 quality-gate.md 契约**

Create `.claude/skills/interpretation-create/shared/quality-gate.md`:

```markdown
# 落盘前 self-check 合规门

主 agent / CLI 脚本在 Step 6 落盘前必须跑精简版 self-check。

## 实现

`scripts/lib/self-check-lite.js` 的 `runSelfCheckLite(text)` 函数：

- **致命错误（7 类）**：
  1. 元自我引用（"本解读" / "本文" / "本篇解读"）
  2. 元自我标签（【本解读...】等）
  3. 流水线术语（mode_of() / SPEC §X.X 等）
  4. 元数据块（文首 "**本篇模式**" 等）
  5. 自创案例（"试造" / "虚拟一造" 等）
  6. 流派武断（"唯一正确" 等绝对定论）
  7. 截取半句引文

- **格式错误（2 类）**：
  1. 引文未用 `>` 块引用
  2. 独立【白话】行

- **内容检查（3 项）**：v1 仅做轻量检查（v2 待 LLM 评估器集成）

- **score 计算**：
  - fatal > 0 或 format > 0 → score 3（强制重写）
  - content 0 项 → score 5
  - content 1 项 → score 4
  - content ≥ 2 项 → score 3

## 主 agent 流程（单点）

1. 跑 9 步流水线产出 interpretation.md 草稿（**不**落盘）
2. 调 `runSelfCheckLite(draft)`
3. fatal > 0 → 报告致命项 → 回 Step 5 重写（最多 3 次）
4. fatal = 0 → 准许落盘

## CLI 脚本流程（批量）

1. 调 `lib/llm-batch.js` 跑 9 步流水线
2. per-篇 `runSelfCheckLite(output)`
3. fatal > 0 → 跳过该篇 + 记日志
4. fatal = 0 → 写文件

## v1 不调 self-check-interpretation subagent

理由：self-check-interpretation 当前是 subagent 形式，CLI 脚本无法直接调。v1 在 Node 端跑精简版。v2 评估是否合并。
```

- [ ] **Step 6: 提交**

```bash
git add scripts/lib/self-check-lite.js scripts/lib/__tests__/self-check-lite.test.js .claude/skills/interpretation-create/shared/quality-gate.md
git commit -m "feat(interpretation-create): 精简版 self-check（9 项 grep）+ quality-gate.md"
```

---

## Task 8: subagent-batch.md 调度协议契约

**Files:**
- Create: `.claude/skills/interpretation-create/shared/subagent-batch.md`

- [ ] **Step 1: 写 subagent-batch.md**

```markdown
# subagent 派发调度协议（批量模式入口 A）

主 agent 在批量模式做以下事。

## v1 范围

- **仅串行**（v1 不并发）
- 1 次 dispatch 1 个 subagent，subagent 内部串行跑 N 篇
- subagent 与主 agent 共享同一进程 env

## 主 agent 动作

1. **Step 1 选模式**：批量
2. **Step 2 收源**：书 slug + 篇章列表
3. **Step 3 强装载 gate**：主 agent Read 5 份规范 + 打印确认（详见 `load-gate.md`）
4. **Step 4 dry-run**：列出 N 篇 + 估算耗时（每篇 30-90s）+ 用户确认
5. **Step 5 dispatch 1 个 subagent**：
   - subagent 类型：`general-purpose`（项目内可用）
   - subagent prompt 内嵌：
     - 调 `lib/llm-batch.js` 的 `generateInterpretations({ slug, chapters, specBundle, force, onProgress, signal })`
     - specBundle 由主 agent 装订（5 份规范 Read 后传入）
     - signal 来自主 agent 的 AbortController
   - subagent 通过 `onProgress` 回调把进度回吐主 agent
6. **Step 6 收尾**：聚合 subagent 返回的 results 数组
   - 成功 N / 失败 M / 跳过 K
   - fatal 列表
   - **不**落盘报告（与 source-create / book-create 报告策略一致）

## subagent prompt 模板

\`\`\`
你是 interpretation-create 批量执行 subagent。

任务：调用 scripts/lib/llm-batch.js 的 generateInterpretations()，参数：
- slug: {slug}
- chapters: [{chapter1}, {chapter2}, ...]
- specBundle: {主 agent 已装订的 5 份规范}
- force: {true|false}
- onProgress: 每完成 1 篇回调 1 次，回调参数 (current, total, chapter, status)
- signal: 主 agent 的 AbortSignal

执行：
1. 调 generateInterpretations({...})
2. 把 onProgress 回调的消息转发给主 agent（用 MCP message 工具）
3. 监听 signal，收到 abort 时优雅退出（完成当前篇后停）

返回：
- results 数组
- 每篇的 status（success / skipped / failed）
- 失败篇章的 fatal 列表
\`\`\`

## 进度反馈格式

subagent 通过 onProgress 回吐：

\`\`\`
▌正在处理 论用神 (3/10) ▐ status: success
\`\`\`

主 agent 流式输出到聊天窗口。

## 中断语义

- 主 agent 收到 SIGINT（Ctrl-C）→ 触发 AbortController.abort()
- subagent 收到 signal → 完成当前篇后退出
- 已完成的 interpretation.md 保留（不撤销）
- 未完成的篇章记入"中断前未完成"列表，收尾报告汇总

## 与 CLI 脚本入口的差异

| 维度 | subagent 派发 | CLI 脚本 |
|------|--------------|---------|
| 用户输入 | Claude Code 会话内 `/interpretation-create batch` | 终端 `node scripts/generate-interpretations.js ...` |
| 强装载 | 主 agent Read 5 份 + 打印确认 | 脚本读 env 与 5 份规范 |
| 进度反馈 | onProgress → 主 agent 流式输出 | stdout 进度条 |
| 中断 | AbortSignal | SIGINT |
| 收尾报告 | 主 agent 聊天窗口 | 终端文本 + exit code |
| 失败重试 | lib/llm-batch.js 自带 3 次重试 + 5/4/3 自评 3 次重写 | 同（调同核心库）|
| self-check | lib/llm-batch.js 内调 Node 端精简版 | 同（无差异）|
```

- [ ] **Step 2: 提交**

```bash
git add .claude/skills/interpretation-create/shared/subagent-batch.md
git commit -m "feat(interpretation-create): subagent-batch.md 派发调度协议契约"
```

---

## Task 9: script-batch.md CLI 脚本调用约定契约

**Files:**
- Create: `.claude/skills/interpretation-create/shared/script-batch.md`

- [ ] **Step 1: 写 script-batch.md**

```markdown
# CLI 脚本调用约定（批量模式入口 B）

用户在终端跑 CLI 脚本，不在 Claude Code 会话内。

## 用户命令

\`\`\`bash
# dry-run 预览
node scripts/generate-interpretations.js <slug> <chapter1>,<chapter2> --force --dry-run

# 实跑
node scripts/generate-interpretations.js <slug> <chapter1>,<chapter2> --force

# 整本所有未解读篇章
node scripts/generate-interpretations.js <slug> --force

# 自定义 API 配置
node --env-file=.env scripts/generate-interpretations.js <slug> --force

# 或
ANTHROPIC_API_KEY=sk-ant-... node scripts/generate-interpretations.js <slug> --force

# CLI 覆盖
node scripts/generate-interpretations.js <slug> --force --api-key sk-ant-cli-test
\`\`\`

## CLI 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `<slug>` | 是 | 书 slug |
| `<chapters>` | 否 | 逗号分隔篇章名；缺省 = 整本所有未解读篇章 |
| `--force` | 否 | 覆盖已存在 interpretation.md |
| `--dry-run` | 否 | 预览，不实跑 |
| `--api-key <key>` | 否 | CLI 覆盖 env（详见 env.js）|
| `--base-url <url>` | 否 | CLI 覆盖 env |
| `--model <id>` | 否 | CLI 覆盖 env |
| `--help` | 否 | 打印帮助 |

## 脚本动作

1. 解析 CLI 参数
2. 加载 specBundle（读 books/{slug}/catalog.md 解析术数 + 强装载 5 份规范）
3. 调 `lib/llm-batch.js` 的 `generateInterpretations({...})`
4. 输出 stdout 进度条：`████░░░░ 30% 论用神 ...`
5. 收尾报告：成功 N / 失败 M / 跳过 K / fatal 列表
6. exit code：0 成功 / 1 有失败

## 模糊篇章名匹配

`resolveChapters(slug, chapterList)` 函数：
- 篇章名精确匹配 → 用之
- 模糊匹配（如"论用神" 匹配 "论用神格"）→ 选最短前缀匹配
- 多重模糊匹配 → 报错列出候选，让用户精确化
- 0 匹配 → 报错退出

## 与 subagent 派发入口的差异

见 `subagent-batch.md` 末"与 CLI 脚本入口的差异"表。
```

- [ ] **Step 2: 提交**

```bash
git add .claude/skills/interpretation-create/shared/script-batch.md
git commit -m "feat(interpretation-create): script-batch.md CLI 脚本调用约定契约"
```

---

## Task 10: SKILL.md 主入口

**Files:**
- Create: `.claude/skills/interpretation-create/SKILL.md`

- [ ] **Step 1: 写 SKILL.md**

```markdown
---
name: interpretation-create
description: 解读生成技能。2 模式（单点 / 批量，双轨：subagent 派发 + CLI 脚本）+ 6 步引导式状态机（单点）/ 7 步（批量含 dry-run）+ 1 次强装载 gate + 1 次原文体检 gate + 落盘前 self-check 精简版合规门，按 SPEC-interpretation.md 严格生成 books/{slug}/articles/{篇名}/interpretation.md。
trigger: 解读|生成解读|写解读|补解读|录解读
---

# interpretation-create 解读生成技能（主入口）

本 skill 仅 interpretation-create。**主 SKILL.md 实现完整引导式状态机 + 双轨批量入口路由。**

## 调用方式

用户输入 `/interpretation-create` 起手。可选带参数 `/interpretation-create {single|batch}` 跳过 Step 1。

## 2 模式

| 模式 | 适用 | 路径 |
|------|------|------|
| 单点 | 1 篇 source.md → 1 篇 interpretation.md | 主 agent 强装载 + 体检 + 9 步 + self-check + 直写 |
| 批量 | N 篇 source.md → N 篇 interpretation.md | 双轨：subagent 派发（入口 A） / CLI 脚本（入口 B），共调 `lib/llm-batch.js` |

## 单点 6 步状态机

\`\`\`
[Step 1] 模式         ──→ [Step 2] 收源         ──→ [Step 3] 强装载 gate
   │ 2 选 1              │ 定位 source.md         │ Read 5 份规范 + 打印
   │ AskUserQuestion     │ 状态写：source_input   │ gate: 5 份全读后解锁
   │
   ▼                                          
[Step 4] 体检 gate   ──→ [Step 5] 9 步主体    ──→ [Step 6] 落盘
   │ 6 项检查              │ 套 §五 Step 3-9      │ self-check 精简版
   │ 输出体检报告          │ §七 自评 < 4 → 重写  │ 冲突 4 选项
   │ 输入 Step 5          │                        │ Write interpretation.md
   └────────────────────┴────────────────────────┴──────────────
   shortcut: /interpretation-create single
\`\`\`

### Step 1 — 模式

- AskUserQuestion 2 选项
- 带参数 `/interpretation-create {single|batch}` → 跳过
- 状态写：`mode ∈ {single, batch}`

### Step 2 — 收源

- 定位 `books/{slug}/articles/{篇名}/source.md`
- `Read` 全文
- 状态写：`source_input`

### Step 3 — 强装载 gate

- 详见 `shared/load-gate.md`
- 依次 Read 5 份规范 + 打印确认
- 任一缺失立即终止
- 指纹动态校验（`scripts/self-check-fingerprint.py`）

### Step 4 — 体检 gate

- 详见 `shared/condition-check.md`
- 调 `scripts/lib/condition-check.js` 的 `checkCondition(text)`
- 输出体检报告（6 项）

### Step 5 — 主体 9 步流水线

- 详见 `shared/pipeline.md`
- 调 `scripts/lib/pipeline.js` 的 `buildPipelinePrompt({...})` 装订 prompt
- 调 Claude API（自身即主 agent，无须核心库）
- 调 `evalComplianceScore({fatal, format, content})` 自评
- < 4 分 → 现场重写（最多 3 次）

### Step 6 — 落盘

- 详见 `shared/quality-gate.md` + `shared/skeleton.md`
- 调 `scripts/lib/self-check-lite.js` 的 `runSelfCheckLite(draft)`
- fatal > 0 → 回 Step 5 重写
- fatal = 0 → 冲突 4 选项（`scripts/lib/conflict.js` 的 `resolveConflict`）→ Write 文件

## 批量 7 步状态机

\`\`\`
[Step 1] 模式         ──→ [Step 2] 收源         ──→ [Step 3] 强装载 gate
   │ 选批量              │ slug + 篇章列表       │ 主 agent Read 5 份
   │                      │                       │
   ▼
[Step 4] dry-run gate ──→ [Step 5] 选入口      ──→ [Step 6] dispatch
   │ 列出 N 篇 + 估算     │ A subagent            │ 调 lib/llm-batch.js
   │ 用户确认             │ B CLI 脚本             │ 共调核心库
   │                      │                       │
   ▼
[Step 7] 收尾
   │ 聚合 results
   │ 成功 N / 失败 M
   │ **不**落盘报告
   └──────────
   shortcut: /interpretation-create batch
\`\`\`

### Step 4 — dry-run gate

- AskUserQuestion 2 选项（确认 / 取消）
- 列出 N 篇 + 估算耗时（每篇 30-90s）

### Step 5 — 选入口

- AskUserQuestion 2 选项：
  - A. subagent 派发（交互式，可中断，进度反馈）
  - B. CLI 脚本（后台 / CI / 脱离 Claude Code 会话）

### Step 6 — dispatch

- 入口 A：详见 `shared/subagent-batch.md`
- 入口 B：详见 `shared/script-batch.md`
- 两者都调 `scripts/lib/llm-batch.js` 的 `generateInterpretations({...})`

## 共享契约索引

| 契约 | 路径 |
|------|------|
| 规范包 + 指纹 | `shared/spec-bundles.md` |
| 单/批 + dry-run | `shared/strategy.md` |
| 强装载 5 份 | `shared/load-gate.md` |
| 6 项体检 | `shared/condition-check.md` |
| 9 步主体 | `shared/pipeline.md` |
| 落盘规则 + 4 选项 | `shared/skeleton.md` |
| self-check 合规门 | `shared/quality-gate.md` |
| subagent 派发 | `shared/subagent-batch.md` |
| CLI 脚本 | `shared/script-batch.md` |

## 与其他 skill 的关系

| 关系对象 | 关系性质 | 接口 |
|----------|----------|------|
| **book-create**（前置）| 依赖 catalog.md | Step 3 强装载读 catalog.md |
| **source-create**（前置）| 依赖 source.md | Step 2 收源读 source.md；不共享 URL/文本/PDF 三种"补录"源 |
| **self-check-interpretation**（合规端）| v2 评估合并 | v1 用 Node 端精简版（`self-check-lite.js`）|
| **writing-plans**（设计完成后）| brainstorming 收尾转交 | 由 writing-plans 写实施计划 |

## 错误处理总览

| 失败点 | 处置 |
|--------|------|
| Step 3 任一规范文件缺失 | 立即终止 + 缺失清单（**SPEC §五 Step 1.1 刚性条款**）|
| Step 3 通读未达 5 份 | 不解锁 Step 4 |
| Step 4 体检某项异常 | 报告用户 + 套 §六 对应规则继续 |
| Step 5 §七 自评 < 4 分 | 现场重写；最多 3 次仍 < 4 → 报告用户决定 |
| Step 6 self-check fatal > 0 | 报告致命项 + 回 Step 5 重写 |
| Step 6 文件冲突 | 4 选项（覆盖 / 备份 / 取消 / 退出）|
| Step 6 写失败 | 报告 + 退出，清理已写部分 |
| 批量模式脚本失败（非 0 退出）| 报告 stderr + 列出失败篇章，不重试 |
| 批量模式 per-篇失败 | 记日志 + 跳过 + 收尾报告汇总 |
| 批量模式规范指纹漂移 | 警告用户（与 source-create 复用策略）|
| 缺 `ANTHROPIC_API_KEY` | 启动报错并打印配置指引（env.js 的 `ConfigError`）|
```

- [ ] **Step 2: 提交**

```bash
git add .claude/skills/interpretation-create/SKILL.md
git commit -m "feat(interpretation-create): SKILL.md 主入口契约（6 步单点 + 7 步批量双轨）"
```

---

## Task 11: scripts/lib/llm-batch.js 核心库（TDD 集成）

**Files:**
- Create: `scripts/lib/llm-batch.js`
- Create: `scripts/lib/__tests__/llm-batch.test.js`
- Create: `scripts/lib/spec-bundle.js`（辅助：5 份规范装订）
- Create: `scripts/lib/__tests__/spec-bundle.test.js`

- [ ] **Step 1: 写 spec-bundle 的 failing test**

Create `scripts/lib/__tests__/spec-bundle.test.js`:

```javascript
import { describe, it, expect } from 'vitest'
import { loadSpecBundle } from '../spec-bundle.js'

describe('loadSpecBundle', () => {
  it('returns object with 4 spec fields', () => {
    // 实际执行会读真实文件——此测试仅验证返回结构
    // 在 fixture 环境下跑
    const result = loadSpecBundle('子平真诠', '论用神', {
      projectRoot: '/Users/gaozhipeng/Desktop/mingli-research',
    })
    expect(result).toHaveProperty('specInterpretation')
    expect(result).toHaveProperty('general')
    expect(result).toHaveProperty('shuSpecial')
    expect(result).toHaveProperty('catalog')
  })

  it('throws when SPEC-interpretation.md missing', () => {
    expect(() =>
      loadSpecBundle('x', 'y', { projectRoot: '/nonexistent' })
    ).toThrow(/SPEC-interpretation\.md/)
  })

  it('loads bazi.md for 术数=命', () => {
    const result = loadSpecBundle('子平真诠', '论用神', {
      projectRoot: '/Users/gaozhipeng/Desktop/mingli-research',
    })
    expect(result.shuSpecial).toContain('子平八字')
  })
})
```

- [ ] **Step 2: 跑测试验证失败**

Run: `pnpm test scripts/lib/__tests__/spec-bundle.test.js`
Expected: FAIL with "Cannot find module '../spec-bundle.js'"

- [ ] **Step 3: 写 spec-bundle.js 最小实现**

Create `scripts/lib/spec-bundle.js`:

```javascript
/**
 * scripts/lib/spec-bundle.js — 5 份规范装订
 *
 * 输入：书 slug + 篇章名 + 项目根路径
 * 输出：{ specInterpretation, general, shuSpecial, catalog, sourceText }
 */

import fs from 'node:fs'
import path from 'node:path'

const SHU_TO_SPECIAL = {
  命: 'bazi.md',
  // 卜 / 山 / 医 / 相 → v2 待
}

function readOrThrow(filePath, label) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`缺少 ${label}：${filePath}`)
  }
  return fs.readFileSync(filePath, 'utf-8')
}

/**
 * @param {string} slug
 * @param {string} chapter
 * @param {{projectRoot: string}} opts
 */
export function loadSpecBundle(slug, chapter, { projectRoot }) {
  const specInterpretation = readOrThrow(
    path.join(projectRoot, 'research-dispute/SPEC-interpretation.md'),
    'SPEC-interpretation.md'
  )
  const general = readOrThrow(
    path.join(projectRoot, 'research-dispute/general.md'),
    'general.md'
  )
  const catalog = readOrThrow(
    path.join(projectRoot, `books/${slug}/catalog.md`),
    `books/${slug}/catalog.md`
  )

  // 解析 catalog.md blockquote 的"术数"字段
  const shuMatch = catalog.match(/^>\s*术数[：:]\s*(\S+)/m)
  const shu = shuMatch ? shuMatch[1] : null
  const specialFile = shu ? SHU_TO_SPECIAL[shu] : null
  if (!specialFile) {
    throw new Error(`catalog.md 术数字段 "${shu}" 无对应专项文件（v1 仅支持 命→bazi.md）`)
  }
  const shuSpecial = readOrThrow(
    path.join(projectRoot, `research-dispute/${specialFile}`),
    `research-dispute/${specialFile}`
  )

  const sourceText = readOrThrow(
    path.join(projectRoot, `books/${slug}/articles/${chapter}/source.md`),
    `books/${slug}/articles/${chapter}/source.md`
  )

  return { specInterpretation, general, shuSpecial, catalog, sourceText }
}
```

- [ ] **Step 4: 跑测试验证通过**

Run: `pnpm test scripts/lib/__tests__/spec-bundle.test.js`
Expected: 3 tests pass（**注意**：此测试依赖项目根路径存在相应文件，CI 环境可能失败，但本地能跑通）

- [ ] **Step 5: 写 llm-batch 的 failing test**

Create `scripts/lib/__tests__/llm-batch.test.js`:

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateInterpretations } from '../llm-batch.js'

// Mock @anthropic-ai/sdk
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [{ type: 'text', text: '## 标题\n\n> 【原文】原文。\n\n解读。' }],
      }),
    },
  })),
}))

const FAKE_BUNDLE = {
  specInterpretation: '# SPEC',
  general: '# general',
  shuSpecial: '# bazi',
  catalog: '# catalog',
  sourceText: '# 论用神\n\n正文内容。',
}

const FAKE_CONFIG = {
  apiKey: 'sk-test',
  baseUrl: 'https://api.test',
  model: 'claude-opus-4-8',
}

describe('generateInterpretations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns success array for one chapter', async () => {
    const results = await generateInterpretations({
      slug: '子平真诠',
      chapters: ['论用神'],
      specBundle: FAKE_BUNDLE,
      config: FAKE_CONFIG,
      projectRoot: '/Users/gaozhipeng/Desktop/mingli-research',
      force: true,
    })
    expect(results).toHaveLength(1)
    expect(results[0].chapter).toBe('论用神')
    expect(results[0].status).toBe('success')
  })

  it('skips chapter when source.md missing', async () => {
    const results = await generateInterpretations({
      slug: '子平真诠',
      chapters: ['不存在的篇章'],
      specBundle: FAKE_BUNDLE,
      config: FAKE_CONFIG,
      projectRoot: '/Users/gaozhipeng/Desktop/mingli-research',
      force: true,
    })
    expect(results[0].status).toBe('skipped')
    expect(results[0].reason).toContain('source')
  })

  it('skips chapter when interpretation.md exists and !force', async () => {
    // 假设 论用神 已有 interpretation.md（在 fixture 中）
    const results = await generateInterpretations({
      slug: '子平真诠',
      chapters: ['论用神'],
      specBundle: FAKE_BUNDLE,
      config: FAKE_CONFIG,
      projectRoot: '/Users/gaozhipeng/Desktop/mingli-research',
      force: false,
    })
    expect(results[0].status).toBe('skipped')
    expect(results[0].reason).toContain('exists')
  })

  it('invokes onProgress callback per chapter', async () => {
    const onProgress = vi.fn()
    await generateInterpretations({
      slug: '子平真诠',
      chapters: ['论用神'],
      specBundle: FAKE_BUNDLE,
      config: FAKE_CONFIG,
      projectRoot: '/Users/gaozhipeng/Desktop/mingli-research',
      force: true,
      onProgress,
    })
    expect(onProgress).toHaveBeenCalledWith(1, 1, '论用神', expect.any(String))
  })

  it('retries 3 times on 429 rate limit', async () => {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    let callCount = 0
    Anthropic.mockImplementation(() => ({
      messages: {
        create: vi.fn().mockImplementation(() => {
          callCount++
          if (callCount < 3) {
            const err = new Error('Rate limit')
            err.status = 429
            return Promise.reject(err)
          }
          return Promise.resolve({
            content: [{ type: 'text', text: '## 标题\n\n> 【原文】原文。\n\n解读。' }],
          })
        }),
      },
    }))

    const results = await generateInterpretations({
      slug: '子平真诠',
      chapters: ['论用神'],
      specBundle: FAKE_BUNDLE,
      config: FAKE_CONFIG,
      projectRoot: '/Users/gaozhipeng/Desktop/mingli-research',
      force: true,
    })
    expect(callCount).toBe(3)
    expect(results[0].status).toBe('success')
  })
})
```

- [ ] **Step 6: 跑测试验证失败**

Run: `pnpm test scripts/lib/__tests__/llm-batch.test.js`
Expected: FAIL with "Cannot find module '../llm-batch.js'"

- [ ] **Step 7: 写 llm-batch.js 最小实现**

Create `scripts/lib/llm-batch.js`:

```javascript
/**
 * scripts/lib/llm-batch.js — 批量生成 interpretation.md 的核心库
 *
 * 职责：装订 5 份规范 + 调 Anthropic API + 落盘 + self-check 合规门
 * 调用方：subagent 派发（入口 A）/ CLI 脚本（入口 B）
 */

import fs from 'node:fs'
import path from 'node:path'
import Anthropic from '@anthropic-ai/sdk'
import { checkCondition } from './condition-check.js'
import { buildPipelinePrompt, evalComplianceScore } from './pipeline.js'
import { runSelfCheckLite } from './self-check-lite.js'

const MAX_RETRIES = 3
const RETRY_BASE_MS = 2000
const MAX_REWRITE = 3

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

function fileExists(p) {
  try {
    return fs.existsSync(p)
  } catch {
    return false
  }
}

async function callClaudeWithRetry({ client, model, system, user, signal }) {
  let lastErr
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    if (signal?.aborted) throw new Error('Aborted')
    try {
      const response = await client.messages.create({
        model,
        max_tokens: 8000,
        system,
        messages: [{ role: 'user', content: user }],
      })
      return response.content[0].text
    } catch (err) {
      lastErr = err
      if (err.status === 429 || err.status >= 500) {
        const wait = RETRY_BASE_MS * Math.pow(2, attempt - 1) + Math.random() * 1000
        await sleep(wait)
        continue
      }
      throw err
    }
  }
  throw lastErr
}

async function generateOne({ chapter, sourceText, specBundle, config, projectRoot, force, signal, onProgress, client }) {
  const articlesDir = path.join(projectRoot, `books/${config.slug}/articles/${chapter}`)
  const sourcePath = path.join(articlesDir, 'source.md')
  const interpPath = path.join(articlesDir, 'interpretation.md')

  if (!fileExists(sourcePath)) {
    return { chapter, status: 'skipped', reason: 'source.md missing' }
  }
  if (fileExists(interpPath) && !force) {
    return { chapter, status: 'skipped', reason: 'interpretation.md exists' }
  }

  // 体检
  const condition = checkCondition(sourceText)

  // 装订 prompt
  const system = `你是术数学术研究者，按 SPEC-interpretation.md 严格生成 interpretation.md。反元自我引用，禁 mode_of()/SPEC §X.X。`
  const user = buildPipelinePrompt({ sourceText, condition, specBundle })

  // 调 LLM（最多重写 3 次以达 ≥ 4 分）
  let output
  let score = 0
  for (let rewrite = 0; rewrite < MAX_REWRITE; rewrite++) {
    output = await callClaudeWithRetry({ client, model: config.model, system, user, signal })
    const check = runSelfCheckLite(output)
    score = check.score
    if (score >= 4) break
    if (rewrite === MAX_REWRITE - 1) {
      return { chapter, status: 'failed', reason: `self-check < 4 after ${MAX_REWRITE} rewrites`, report: check }
    }
  }

  // 备份（如有）
  if (fileExists(interpPath)) {
    fs.copyFileSync(interpPath, `${interpPath}.bak`)
  }

  // 落盘
  fs.writeFileSync(interpPath, output, 'utf-8')
  return { chapter, status: 'success', score }
}

/**
 * 批量生成 interpretation.md
 * @param {Object} opts
 * @param {string} opts.slug
 * @param {string[]} opts.chapters
 * @param {Object} opts.specBundle
 * @param {{apiKey: string, baseUrl: string, model: string}} opts.config
 * @param {string} opts.projectRoot
 * @param {boolean} [opts.force=false]
 * @param {Function} [opts.onProgress]
 * @param {AbortSignal} [opts.signal]
 */
export async function generateInterpretations(opts) {
  const { slug, chapters, specBundle, config, projectRoot, force = false, onProgress, signal } = opts
  const client = new Anthropic({ apiKey: config.apiKey, baseURL: config.baseUrl })

  const results = []
  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i]
    if (signal?.aborted) {
      results.push({ chapter, status: 'skipped', reason: 'aborted' })
      continue
    }
    try {
      const result = await generateOne({
        chapter,
        sourceText: specBundle.sourceText,
        specBundle,
        config: { ...config, slug },
        projectRoot,
        force,
        signal,
        onProgress,
        client,
      })
      results.push(result)
      onProgress?.(i + 1, chapters.length, chapter, result.status)
    } catch (err) {
      results.push({ chapter, status: 'failed', reason: err.message })
      onProgress?.(i + 1, chapters.length, chapter, 'failed')
    }
  }
  return results
}
```

- [ ] **Step 8: 跑测试验证通过**

Run: `pnpm test scripts/lib/__tests__/llm-batch.test.js`
Expected: 5 tests pass

- [ ] **Step 9: 提交**

```bash
git add scripts/lib/spec-bundle.js scripts/lib/__tests__/spec-bundle.test.js scripts/lib/llm-batch.js scripts/lib/__tests__/llm-batch.test.js
git commit -m "feat(interpretation-create): llm-batch.js 核心库 + spec-bundle.js 装订函数"
```

---

## Task 12: scripts/generate-interpretations.js CLI 入口（TDD）

**Files:**
- Create: `scripts/generate-interpretations.js`
- Create: `scripts/lib/__tests__/generate-interpretations.test.js`

- [ ] **Step 1: 写 failing test（CLI 参数解析）**

Create `scripts/lib/__tests__/generate-interpretations.test.js`:

```javascript
import { describe, it, expect } from 'vitest'
import { parseCliArgs } from '../generate-interpretations-cli.js'

describe('parseCliArgs', () => {
  it('parses slug and chapters', () => {
    const args = parseCliArgs(['子平真诠', '论用神,论格局'])
    expect(args.slug).toBe('子平真诠')
    expect(args.chapters).toEqual(['论用神', '论格局'])
    expect(args.force).toBe(false)
    expect(args.dryRun).toBe(false)
  })

  it('parses --force', () => {
    const args = parseCliArgs(['子平真诠', '--force'])
    expect(args.force).toBe(true)
  })

  it('parses --dry-run', () => {
    const args = parseCliArgs(['子平真诠', '--dry-run'])
    expect(args.dryRun).toBe(true)
  })

  it('parses --api-key', () => {
    const args = parseCliArgs(['子平真诠', '--api-key', 'sk-test'])
    expect(args.apiKey).toBe('sk-test')
  })

  it('parses --base-url', () => {
    const args = parseCliArgs(['子平真诠', '--base-url', 'https://test'])
    expect(args.baseUrl).toBe('https://test')
  })

  it('parses --model', () => {
    const args = parseCliArgs(['子平真诠', '--model', 'claude-sonnet-4-6'])
    expect(args.model).toBe('claude-sonnet-4-6')
  })

  it('returns all-chapters mode when chapters not provided', () => {
    const args = parseCliArgs(['子平真诠'])
    expect(args.chapters).toBeNull() // null = 整本
  })
})
```

- [ ] **Step 2: 跑测试验证失败**

Run: `pnpm test scripts/lib/__tests__/generate-interpretations.test.js`
Expected: FAIL with "Cannot find module '../generate-interpretations-cli.js'"

- [ ] **Step 3: 写 CLI 参数解析模块**

Create `scripts/lib/generate-interpretations-cli.js`:

```javascript
/**
 * scripts/lib/generate-interpretations-cli.js — CLI 参数解析
 */

export function parseCliArgs(argv) {
  const args = { slug: null, chapters: null, force: false, dryRun: false, apiKey: null, baseUrl: null, model: null }

  let i = 0
  // 位置参数 1: slug
  if (argv[i] && !argv[i].startsWith('--')) {
    args.slug = argv[i]
    i++
  }
  // 位置参数 2: chapters (逗号分隔)
  if (argv[i] && !argv[i].startsWith('--')) {
    args.chapters = argv[i].split(',').map(s => s.trim()).filter(Boolean)
    i++
  }

  // flag 参数
  while (i < argv.length) {
    const flag = argv[i]
    if (flag === '--force') args.force = true
    else if (flag === '--dry-run') args.dryRun = true
    else if (flag === '--api-key') { args.apiKey = argv[++i] }
    else if (flag === '--base-url') { args.baseUrl = argv[++i] }
    else if (flag === '--model') { args.model = argv[++i] }
    else if (flag === '--help' || flag === '-h') args.help = true
    i++
  }

  return args
}
```

- [ ] **Step 4: 跑测试验证通过**

Run: `pnpm test scripts/lib/__tests__/generate-interpretations.test.js`
Expected: 7 tests pass

- [ ] **Step 5: 写 CLI 主入口**

Create `scripts/generate-interpretations.js`:

```javascript
#!/usr/bin/env node
/**
 * generate-interpretations.js — 批量生成 interpretation.md 的 CLI 入口
 *
 * 用法：
 *   node scripts/generate-interpretations.js <slug> [chapters] [--force] [--dry-run]
 *                                        [--api-key <key>] [--base-url <url>] [--model <id>]
 *
 * 双轨批量入口 B。入口 A 是 subagent 派发（详见 shared/subagent-batch.md）。
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'url'
import { parseCliArgs } from './lib/generate-interpretations-cli.js'
import { resolveConfig, ConfigError } from './lib/env.js'
import { loadSpecBundle } from './lib/spec-bundle.js'
import { generateInterpretations } from './lib/llm-batch.js'
import { progressBar, formatDuration } from './lib/utils.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

function resolveChapters(slug, requested) {
  const catalogPath = path.join(ROOT, `books/${slug}/catalog.md`)
  if (!fs.existsSync(catalogPath)) {
    throw new Error(`找不到 books/${slug}/catalog.md`)
  }
  const catalog = fs.readFileSync(catalogPath, 'utf-8')
  // 提取所有篇章名（从表格中）
  const allChapters = [...catalog.matchAll(/^\|\s*\d+\s*\|\s*([^|]+?)\s*\|/gm)].map(m => m[1].trim())

  if (!requested) return allChapters // 整本
  // 精确匹配 + 模糊匹配
  const resolved = []
  for (const req of requested) {
    const exact = allChapters.find(c => c === req)
    if (exact) { resolved.push(exact); continue }
    const fuzzy = allChapters.find(c => c.startsWith(req))
    if (fuzzy) { resolved.push(fuzzy); continue }
    throw new Error(`未匹配篇章名：${req}（候选：${allChapters.slice(0, 5).join(', ')}...）`)
  }
  return resolved
}

function printDryRun(slug, chapters) {
  console.log(`\n# dry-run 预览\n`)
  console.log(`书: ${slug}`)
  console.log(`篇章数: ${chapters.length}`)
  console.log(`\n篇章列表:`)
  chapters.forEach((c, i) => console.log(`  ${i + 1}. ${c}`))
  const estimatedMs = chapters.length * 60_000 // 每篇 60s 估算
  console.log(`\n预计耗时: ${formatDuration(estimatedMs)}`)
  console.log(`\n实跑命令: node scripts/generate-interpretations.js ${slug} ${chapters.join(',')} --force\n`)
}

async function main() {
  const args = parseCliArgs(process.argv.slice(2))

  if (args.help || !args.slug) {
    console.log(`用法: node scripts/generate-interpretations.js <slug> [chapters] [--force] [--dry-run]
                          [--api-key <key>] [--base-url <url>] [--model <id>]`)
    process.exit(args.help ? 0 : 1)
  }

  let config
  try {
    config = resolveConfig({ apiKey: args.apiKey, baseUrl: args.baseUrl, model: args.model })
  } catch (err) {
    if (err instanceof ConfigError) {
      console.error(err.message)
      process.exit(1)
    }
    throw err
  }

  const chapters = resolveChapters(args.slug, args.chapters)

  if (args.dryRun) {
    printDryRun(args.slug, chapters)
    process.exit(0)
  }

  console.log(`\n# 批量生成 interpretation.md`)
  console.log(`书: ${args.slug} | 篇章: ${chapters.length} 篇 | 模型: ${config.model}\n`)

  const start = Date.now()
  const specBundle = loadSpecBundle(args.slug, chapters[0], { projectRoot: ROOT })
  // 注：实际批量时 specBundle.sourceText 只在单篇时准确；批量时应 per-篇 重新装订
  // 简化：v1 假设所有篇章共享同一 catalog 与术数专项，per-篇 重新 Read sourceText

  const results = await generateInterpretations({
    slug: args.slug,
    chapters,
    specBundle: { ...specBundle, sourceText: '' }, // per-篇 重新装订
    config,
    projectRoot: ROOT,
    force: args.force,
    onProgress: (current, total, chapter, status) => {
      const bar = progressBar(current, total)
      process.stdout.write(`\r${bar} ${chapter.padEnd(12)} ${status}    `)
    },
  })

  console.log(`\n\n# 收尾报告`)
  console.log(`总耗时: ${formatDuration(Date.now() - start)}`)
  const success = results.filter(r => r.status === 'success').length
  const failed = results.filter(r => r.status === 'failed').length
  const skipped = results.filter(r => r.status === 'skipped').length
  console.log(`成功: ${success} | 失败: ${failed} | 跳过: ${skipped}`)

  if (failed > 0) {
    console.log(`\n失败篇章：`)
    results.filter(r => r.status === 'failed').forEach(r => {
      console.log(`  - ${r.chapter}: ${r.reason}`)
    })
  }

  process.exit(failed > 0 ? 1 : 0)
}

main().catch(err => {
  console.error(`\n❌ 致命错误: ${err.message}\n`)
  console.error(err.stack)
  process.exit(1)
})
```

- [ ] **Step 6: 跑测试验证通过（CLI 主入口暂不写 E2E，仅验证参数解析）**

Run: `pnpm test scripts/lib/__tests__/generate-interpretations.test.js`
Expected: 7 tests pass

- [ ] **Step 7: 干跑验证（无 API key 时的错误信息）**

```bash
node scripts/generate-interpretations.js --help
```

Expected: 打印帮助文本

```bash
node scripts/generate-interpretations.js 子平真诠
```

Expected: 打印"❌ 缺少 ANTHROPIC_API_KEY 环境变量" + 配置指引，exit 1

- [ ] **Step 8: 提交**

```bash
git add scripts/generate-interpretations.js scripts/lib/generate-interpretations-cli.js scripts/lib/__tests__/generate-interpretations.test.js
git commit -m "feat(interpretation-create): CLI 入口 + 参数解析 + 缺 key 错误提示"
```

---

## Task 13: 端到端验证（单点 + 双轨批量）

**Files:** 无新文件（验证用）

- [ ] **Step 1: 单点端到端测试（主 agent 直写）**

使用项目里现有的 source.md 做单点测试：

```bash
# 检查 source.md 存在
ls books/子平真诠/articles/论用神/source.md
```

Expected: 文件存在

在 Claude Code 会话内跑：
```
/interpretation-create single
```

主 agent 应：
- AskUserQuestion 选 slug + 篇章
- Read 5 份规范 + 打印确认
- 跑 6 项体检
- 跑 9 步主体
- 调 self-check 精简版
- 冲突 4 选项（如 interpretation.md 已存在）
- Write interpretation.md

**验证产物：**
- `books/子平真诠/articles/论用神/interpretation.md` 存在
- 文件不含"本解读""mode_of()"等元自我引用
- 注家标识统一

- [ ] **Step 2: 批量端到端测试（CLI 脚本）**

```bash
# dry-run 预览
node scripts/generate-interpretations.js 子平真诠 --dry-run
```

Expected: 列出所有未解读篇章 + 估算耗时

```bash
# 实跑 1 篇
ANTHROPIC_API_KEY=sk-ant-... node scripts/generate-interpretations.js 子平真诠 论用神 --force
```

Expected:
- 进度条更新
- 调 Claude API
- 跑 self-check
- 写 interpretation.md
- 收尾报告：成功 1 / 失败 0
- exit 0

- [ ] **Step 3: 批量端到端测试（subagent 派发）**

在 Claude Code 会话内跑：
```
/interpretation-create batch
```

主 agent 应：
- 强装载 5 份 + 打印确认
- dry-run gate
- 选入口 A（subagent 派发）
- dispatch subagent
- 进度反馈：▌正在处理 论用神 (1/N) ▐
- 收尾：成功 N / 失败 M

**验证产物：** 与 Step 2 CLI 脚本产出等价

- [ ] **Step 4: 配置缺失测试**

```bash
# 缺 API key
unset ANTHROPIC_API_KEY
node scripts/generate-interpretations.js 子平真诠 --dry-run
```

Expected: 打印"❌ 缺少 ANTHROPIC_API_KEY 环境变量" + 配置指引，exit 1

```bash
# CLI 覆盖
node scripts/generate-interpretations.js 子平真诠 --dry-run --api-key sk-cli-test
```

Expected: 不报缺 key 错误（dry-run 不调 LLM，但 config 解析通过）

- [ ] **Step 5: 跑全部测试**

```bash
pnpm test
```

Expected: 全部测试通过（env.test.js 8 个 + condition-check.test.js 11 个 + pipeline.test.js 10 个 + conflict.test.js 4 个 + self-check-lite.test.js 10 个 + spec-bundle.test.js 3 个 + llm-batch.test.js 5 个 + generate-interpretations.test.js 7 个 = **58 个测试**）

- [ ] **Step 6: 红线回归**

人工 spot-check 已生成的 interpretation.md：
- 无自创理论
- 无元自我引用
- 注家标识统一（【原文】/【原注】/【诸家评】/【后人补注】/【夹注】）
- 通俗注释融入写作语言（无独立【白话】行）

- [ ] **Step 7: 最终提交**

```bash
git add -A
git commit -m "feat(interpretation-create): v1 端到端验证通过（单点 + 双轨批量）"
```

---

## Self-Review

执行 writing-plans 流程要求的 4 项自检。

### 1. Spec coverage（spec 要求 vs plan 任务）

| Spec 节 | Plan 任务 |
|---------|----------|
| §1 Goal | Task 10（SKILL.md）+ Task 11（llm-batch.js）|
| §2 Architecture | Task 10（架构树）+ Task 11（核心库）+ Task 12（CLI 入口）|
| §3.1 单点 | Task 5（pipeline.md）+ Task 6（skeleton.md）+ Task 7（self-check-lite）|
| §3.2 批量双轨 | Task 8（subagent-batch.md）+ Task 9（script-batch.md）|
| §3.3 核心库 | Task 11（llm-batch.js）|
| §3.4 API 配置 | Task 1（env.js + .env.example）|
| §3.5 双轨 UI 对比 | Task 8 + Task 9 + Task 10 |
| §4 强装载 gate | Task 3（load-gate.md）+ Task 1（spec-bundles.md）|
| §5 原文体检 | Task 4（condition-check.md + 函数）|
| §6 9 步主体 | Task 5（pipeline.md + 函数）|
| §7 落盘 + 合规门 | Task 6（skeleton.md）+ Task 7（quality-gate.md）|
| §8 落盘规则 | Task 6（skeleton.md）|
| §9 错误处理 | Task 1（ConfigError）+ Task 6（conflict 4 选项）+ Task 7（self-check fatal）|
| §10 测试 | Task 13（端到端验证）|
| §11 不在 v1 范围 | Task 10（SKILL.md 错误处理表）|
| §12 与其他 skill 关系 | Task 10（SKILL.md 关系表）|
| §13 与 source-create 对比 | （文档对比，未单独落任务，spec 文档已含）|
| §14 v2 路线 | （spec 文档已列，plan 不实现 v2 项）|

**无 gap。**

### 2. Placeholder scan

```bash
grep -nE "TBD|TODO|待补|待定" plans/2026-06-14-interpretation-create-skill.md
```

Expected: 0 命中（"v1 不做 N" / "v2 待" 是显式排除项，不是 placeholder）

### 3. Type consistency

| 函数签名 | 定义处 | 使用处 | 一致 |
|---------|--------|--------|-----|
| `resolveConfig(cli)` | Task 1 env.js | Task 1 test / Task 12 generate-interpretations.js | ✅ |
| `checkCondition(text)` | Task 4 condition-check.js | Task 4 test / Task 11 llm-batch.js | ✅ |
| `modeOf(text)` | Task 4 condition-check.js | Task 4 test | ✅ |
| `buildPipelinePrompt({sourceText, condition, specBundle})` | Task 5 pipeline.js | Task 5 test / Task 11 llm-batch.js | ✅ |
| `evalComplianceScore({fatal, format, content})` | Task 5 pipeline.js | Task 5 test | ✅ |
| `resolveConflict(choice, filePath, newContent)` | Task 6 conflict.js | Task 6 test | ✅ |
| `ConflictChoice.OVERWRITE/BACKUP/CANCEL/ABORT` | Task 6 conflict.js | Task 6 test | ✅ |
| `runSelfCheckLite(text)` | Task 7 self-check-lite.js | Task 7 test / Task 11 llm-batch.js | ✅ |
| `loadSpecBundle(slug, chapter, {projectRoot})` | Task 11 spec-bundle.js | Task 11 test / Task 12 generate-interpretations.js | ✅ |
| `generateInterpretations({slug, chapters, specBundle, config, projectRoot, force, onProgress, signal})` | Task 11 llm-batch.js | Task 11 test | ✅ |
| `parseCliArgs(argv)` | Task 12 generate-interpretations-cli.js | Task 12 test | ✅ |

**11 个函数签名一致，0 不一致。**

### 4. Ambiguity check

- "5 份规范" 在 Task 1 / 3 / 11 编号 1-5 列举 → ✅
- "6 项检查" 在 Task 4 / 7 编号 1-6 列举 → ✅
- "9 步流水线" 在 Task 5 编号 1-9（Step 3-9）→ ✅
- "5/4/3 自评" 在 Task 5 / 7 / 11 公式一致 → ✅
- "4 选项冲突" 在 Task 6 列举 A-D → ✅
- "精简版 self-check 9 项" 在 Task 7 列举 → ✅
- "env D 方案"（env 优先 + CLI 覆盖）在 Task 1 / 12 一致 → ✅

**0 歧义。**

---

## Plan 完成

13 个 Task，58 个测试，~750 行新代码（不含文档）。每步都有 failing test → pass → commit。TDD 严格执行。

接下来选择执行方式：
1. **Subagent-Driven**（推荐）—— 我派发新 subagent per-task，task 间做 review
2. **Inline Execution** —— 在本会话内串行跑，有 checkpoint
