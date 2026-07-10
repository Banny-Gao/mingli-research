# 自定义输出文件名（--name）Design Spec

**日期**：2026-07-06
**适用范围**：`scripts/t2i.js`、`scripts/i2i.js` 及其全部 lib 模块

---

## 目标

让用户自定义生成文件的基础名称（base name），替代当前不可读的 timestamp 命名，同时保持向后兼容。

### 当前问题

```
t2i-1717670000000-01.png      # timestamp 数字长、含义不明
t2i-1717670000000-metadata.json
```

### 目标形态

```
古籍封面-01.png                # 用户自定义 base name
古籍封面-metadata.json
古籍封面-bg.png
```

未传 `--name` 时维持现状 timestamp 行为，零回归。

---

## CLI 接口

### 单 prompt 模式

```bash
# 自定义基础名称
node scripts/t2i.js --name "古籍封面" --prompt "..."

# 不传 --name → 维持现有 timestamp 行为（向后兼容）
node scripts/t2i.js --prompt "..."
```

### 批量模式

```bash
# 一一对应：--name 数量与 --prompts 数量一致
node scripts/t2i.js \
  --prompts "p1,p2,p3" \
  --name "封面1,封面2,封面3"

# 单一 --name 作用于全部（向后兼容写法）
node scripts/t2i.js --prompts "p1,p2,p3" --name "封面"
# → 封面-01.png, 封面-02.png, 封面-03.png

# 数量不匹配 → 警告 + 回退到 timestamp（不阻断）
node scripts/t2i.js --prompts "p1,p2" --name "封面1,封面2,封面3"
# ⚠️ --name 数量 (3) 与 --prompts 数量 (2) 不匹配，回退 timestamp
```

### 交互模式

t2i / i2i 交互流程各增加 1 步（在 prompt 之后、model 之前）：

```
"基础名称（可选，直接回车用默认时间戳）："
  ↓ 用户输入 "古籍封面" → 该次生成的文件以此为前缀
  ↓ 用户回车 → 用默认 timestamp
  ↓ 校验失败 → 重新询问（不退出）
```

i2i 交互流程的"基础名称"步骤位置：与 t2i 对齐，放在 prompt 之后、model 之前。

---

## 命名规则

### 文件命名模板

```
{name}-{index}.png              # 单/多张图（index 2 位补零，从 01 起）
{name}-metadata.json             # 元数据（仅 1 个）
{name}-bg.png                    # 背景图（仅 --save-background 启用时）
```

示例：

```bash
# 单图 + 默认
--name "古籍封面" --prompt "..." --n 1
# → 古籍封面-01.png + 古籍封面-metadata.json

# 3 图
--name "古籍封面" --prompt "..." --n 3
# → 古籍封面-01.png, 古籍封面-02.png, 古籍封面-03.png + 古籍封面-metadata.json

# 保存背景
--name "古籍封面" --save-background
# → 古籍封面-bg.png（额外的副本）

# 不传 --name（向后兼容）
--prompt "..." --n 3
# → t2i-{ts}-01.png, t2i-{ts}-02.png, t2i-{ts}-03.png + t2i-{ts}-metadata.json
```

### 冲突处理：自动递增

`outputDir` 中已存在同名文件时，扫描现有 `*-N.png` / `*-metadata.json` / `*-bg.png`，提取最大 `-N` 后缀，加 1 追加到基础名称。

示例（outputDir 中已有 `古籍封面-01.png` 和 `古籍封面-02.png`）：

```bash
--name "古籍封面" --prompt "..."
# → 古籍封面-1-01.png + 古籍封面-1-metadata.json
# （下一次跑：古籍封面-2-01.png ...）
```

递增单位：每次重跑 +1，与 `--n` 数量无关（即跑第二次时无论 n=1 还是 n=3，都用同一个新前缀）。

### rerender 模式行为

`--rerender <metadata.json>` 不传 `--name`：从 metadata 的 `results[0].filename` 提取原 baseName（剥离 `-01.png` 后缀），复用原 metadata 中的 textOverlay 重渲染。

```
metadata.results[0].filename = "古籍封面-01.png"
output = "古籍封面-rerender.png"   # 沿用原 name，输出文件名前缀
```

确保：用户改 base name 重跑后，旧 metadata 仍能用（rerender 不依赖原始 `--name` 参数）。

---

## 名字校验

### 拒绝的字符（视为不安全）

路径分隔符 + Windows 保留字符：
```
/ \ : * ? " < > |
```

### 拒绝的情况

- 空字符串
- 仅空白字符
- 长度超过 100 字符

### 校验失败行为

| 模式 | 行为 |
|------|------|
| CLI 模式 | `console.error` + `process.exit(1)`，错误消息指出非法字符 |
| 批量模式 | 同 CLI（单条 name 不合法会立即退出） |
| 交互模式 | 重新询问，不退出，提示"包含非法字符，请重输" |

### 允许的字符

除上述拒绝字符外，任意 Unicode 字符均可（包括中文、空格、emoji、`- _ .` 等）。

---

## 实现位置

### 新建共享模块

`scripts/lib/shared/output-name.js`

```js
export const MAX_NAME_LENGTH = 100
export const FORBIDDEN_CHARS = /[\/\\:*?"<>|]/

export function validateName(name) { ... }   // 返回 { valid, error }
export function resolveUniqueName(outputDir, baseName, ext) { ... }  // 冲突检测
```

### t2i / i2i 各模块改动

| 文件 | 改动 |
|------|------|
| `lib/t2i/cli.js` | parseArgs 添加 `--name`，批量模式数量校验 |
| `lib/i2i/cli.js` | 同上 |
| `lib/t2i/downloader.js` | `generateFilename(ts, index, name?)` 新增 name 参数；`saveMetadata` 接受 name |
| `lib/i2i/downloader.js` | 同上（逻辑一致，type 前缀 `i2i-` → `i2i-` 保留） |
| `lib/t2i/text-overlay.js` | 无需改动（不涉及文件名） |
| `t2i.js` | executeRequest 接受 opts.name；rerender 从 metadata.results[0].filename 提取 name |
| `i2i.js` | 同上 |
| `lib/t2i/interactive.js` | collectOptionsMerged 在 prompt 之后插入"name 询问"步骤 |
| `lib/i2i/interactive.js` | 同上 |
| `lib/t2i/presets.js` | preset 字段保留 `name`（剥离 runtime 字段时不剔除 name） |
| `lib/t2i/interactive.js` | savePreset 时 name 不剥离 |

---

## 行为细节

### 批量模式数量校验（t2i / i2i 一致）

```js
// parseArgs 中
if (opts.prompts && opts.name) {
  const names = parsePrompts(opts.name)
  if (names.length === 1) {
    // 单一 name → 全部用此前缀
    opts.names = new Array(opts.prompts.length).fill(names[0])
  } else if (names.length === opts.prompts.length) {
    // 一一对应
    opts.names = names
  } else {
    console.warn(`⚠️ --name 数量 (${names.length}) 与 --prompts 数量 (${opts.prompts.length}) 不匹配，回退 timestamp`)
    opts.names = null
  }
}
```

### 冲突检测算法

```js
// resolveUniqueName(outputDir, baseName, ext)
export function resolveUniqueName(outputDir, baseName, ext) {
  const safeBase = sanitizeForFilename(baseName)
  const pattern = new RegExp(`^${escapeRegex(safeBase)}(?:-\\d+)?-\\d{2}\\.${ext}$`)
  // 扫描 outputDir，匹配 prefix + 可选 -N + -NN.<ext>
  // 提取最大 -N，无冲突返回 safeBase，有冲突返回 safeBase + '-' + (max + 1)
}
```

扫描范围：`outputDir` 下的所有 `<base>(?:-N)?-NN.<ext>` 文件。批量模式时，每个 prompt 用不同的 name（一一对应模式），各自独立递增。

### metadata.textOverlay 兼容性

新生成的 metadata 包含 `name` 字段（baseName）。旧 metadata（无 name 字段）rerender 时：

```js
const metaName = meta.name || extractBaseName(meta.results[0]?.filename, 't2i')
// extractBaseName("t2i-1717670000000-01.png") = "t2i-1717670000000"
// → rerender 输出 "t2i-1717670000000-rerender.png"（保留 timestamp 风格）
```

完全向后兼容。

---

## 测试策略

### 自动化测试（本次不实现，标记为后续工作）

当前项目无自动化测试。本次只做手动验证。后续补 vitest 时覆盖：

- `validateName()`：合法/非法字符边界
- `resolveUniqueName()`：冲突检测 + 递增
- `parseArgs()`：批量数量校验三种分支（1 / N / 不匹配）
- `generateFilename(ts, index, name)`：单/批量 + name 缺失

### 手动验证清单

- [ ] `--name "古籍封面"` 单图生成，文件名正确
- [ ] `--name "古籍封面" --n 3` 多图，3 个文件 + 1 个 metadata
- [ ] `--save-background` 与 `--name` 同时启用，bg 文件名正确
- [ ] 不传 `--name`，维持 timestamp 行为（向后兼容）
- [ ] 冲突检测：连续跑 2 次同名，第二次用 `-1` 后缀
- [ ] 批量模式 `--prompts "p1,p2" --name "封面1,封面2"` 一一对应
- [ ] 批量模式 `--prompts "p1,p2,p3" --name "封面"` 单一前缀
- [ ] 批量模式数量不匹配，警告 + 回退
- [ ] CLI 模式非法字符立即报错退出
- [ ] 交互模式非法字符重新询问
- [ ] t2i / i2i 行为对称
- [ ] rerender 旧 metadata（无 name 字段）仍能工作
- [ ] rerender 新 metadata（有 name 字段）使用新 name

---

## 边界与不做的事（YAGNI）

### 不做的事

1. **模板占位符语法**（如 `--name "{date}-{prompt:slug}"`）：当前不需要，用户表达 "古籍封面" 已足够清晰
2. **全局配置持久化**（写到 `~/.config/t2i/name-format.json`）：用户可以传 `--name` 或保存到 preset，无需全局配置
3. **运行时 prompt slug 自动生成**：依赖 LLM 输出，引入不可控延迟
4. **多文件类型后缀自定义**：固定 `.png` + `.json`，与现状一致

### 保留的灵活性

- `--name` 可省略（向后兼容 timestamp）
- 批量模式支持单一/一一对应/不匹配回退三种
- preset 保存 name 字段，下次复用

---

## 风险评估

| 风险 | 等级 | 缓解措施 |
|------|------|----------|
| 旧 metadata rerender 兼容 | 低 | rerender 从 filename 反推 name 字段 |
| 字符集导致文件系统错误 | 中 | 100 字符上限 + 严格字符校验 |
| 冲突检测扫描开销 | 低 | 仅扫描 outputDir 顶层，单次 fs.readdirSync |
| 批量模式数量不匹配静默回退导致混淆 | 低 | 明确警告消息 + log |
| t2i/i2i 不对称 | 中 | 所有逻辑在 shared/ 模块；两个 downloader 共用同一 helper |

---

## 验收标准

1. ✅ `node scripts/t2i.js --name "test" --prompt "..." --dry-run` 显示正确文件名
2. ✅ `node scripts/i2i.js --name "test" --input-image ./ref.png --prompt "..."` 生成 `test-01.png`
3. ✅ 交互模式中可输入 name，重新询问非法字符
4. ✅ 冲突时自动递增
5. ✅ 批量模式三种分支行为正确
6. ✅ rerender 旧/新 metadata 都正常
7. ✅ 所有修改文件通过 `node --check`