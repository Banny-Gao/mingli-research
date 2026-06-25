# fetch-sources / fetch-wikisource 合并重构设计

> **日期**：2026-06-25
> **范围**：`scripts/fetch-sources.js` + `scripts/fetch-wikisource.js` → `scripts/fetch-source.js` + `scripts/fetch-source/`
> **前置规范**：[SPEC-source.md](../../research-dispute/SPEC-source.md)、《开发指南》`docs/DEVELOPMENT_GUIDE.md`
> **关联 skill**：`.claude/skills/source-create/`、`.claude/skills/book-create/`

---

## 一、目标

把 `scripts/fetch-sources.js`(通用典籍抓取,iwzbz + generic)与 `scripts/fetch-wikisource.js`(维基文库全览页抓取)合并到单一 CLI 入口,内部模块化消重,**所有 source.md 产出的字节级行为不变**,但调用语法从两脚本切到 subcommand。

**驱动力(已确认)**：
1. 两个脚本的 `formatSourceMarkdown` / `renderAnnotationBlock` / `cleanContent` 几乎逐字重复,共 ~150 行
2. source-create 模式 D 反复引用 `scripts/fetch-sources.js`,路径硬编码
3. `fetch-wikisource.js` 处于"功能性孤儿"状态(零外部调用),合并后可被同一 skill 调度

**非目标**(显式排除)：
- 不改 source.md 输出内容(字节级不变)
- 不新增 EXTRACTOR(不做 wikisource 收入 EXTRACTORS 数组)
- 不整合到 source-create 的 manifest.json(manifest 仅承载规范文档副本)
- 不修历史 bug(死代码、硬正则等留给后续)
- 不加单元测试(format.js 抽出来后是纯函数 + 零依赖,后续单测成本极低)

---

## 二、最终结构

```
scripts/
├── fetch-source.js                    # 唯一入口(≈120 行,argv 解析 + dispatch)
├── fetch-sources.js                   # 删除
├── fetch-wikisource.js                # 删除
└── fetch-source/                      # 内部模块,外部不直接 require
    ├── format.js                      # 共享纯函数(≈200 行,零依赖)
    ├── run.js                         # run subcommand 主体(≈250 行)
    ├── wiki.js                        # wiki subcommand 主体(≈250 行)
    └── extractors/
        ├── iwzbz.js                   # iwzbz.com 提取器(≈30 行)
        ├── generic.js                 # generic 通用文本提取(≈50 行)
        └── wikisource.js              # wikisource 解析 + 预处理(≈100 行)
```

**模块职责边界：**
- `format.js` 仅放**两模式都用的纯函数**:`normalizeBlankLines` / `cleanContent` / `renderAnnotationBlock` / `formatSourceMarkdown`。**不**包含 wikisource 专有的 `namedComment` / `答曰:` 规则——那是 wikisource 原文特征,放到 `extractors/wikisource.js` 的预处理阶段
- `extractors/wikisource.js` 暴露 2 个函数:`parseFullView(html)` 与 `preprocessWikisourceContent(text)`(新加的一层,把 wikisource 原文里的 `希夷先生曰` / `答曰:` 统一成 `【XX】` 标记后再交给 `format.js`)
- `extractors/iwzbz.js` / `extractors/generic.js` 暴露 `match(url)` / `extract(html, chapterName, bookTitle)`(与原 EXTRACTORS 数组同形,改为 named export)
- `run.js` 静态 import iwzbz + generic,按 `match(url)` 选 extractor(取代 EXTRACTORS 数组扫描)

---

## 三、模块接口签名

### 3.1 入口 `scripts/fetch-source.js`

```javascript
import { runMain } from './fetch-source/run.js'
import { wikiMain } from './fetch-source/wiki.js'

const HELP = `用法:
  node scripts/fetch-source.js run <slug> [chapter1 chapter2 ...] [--force] [--dry-run]
  node scripts/fetch-source.js wiki <slug> [--dry-run]
  node scripts/fetch-source.js --help`

const subcommand = process.argv[2]
const rest = process.argv.slice(3)

if (subcommand === 'run') await runMain(rest)
else if (subcommand === 'wiki') await wikiMain(rest)
else { console.log(HELP); process.exit(subcommand === '--help' || subcommand === '-h' ? 0 : 1) }
```

### 3.2 `format.js`(零依赖,可单测)

```javascript
export function normalizeBlankLines(text: string): string
export function cleanContent(text: string): string          // 去页码正则,与原两脚本一致
export function renderAnnotationBlock(block: {marker, lines}): string
export function formatSourceMarkdown(chapterName: string, rawContent: string): string
```

`formatSourceMarkdown` 内部正则与原 `fetch-sources.js:262-320` 逐字一致(两脚本本就相同)。

### 3.3 `extractors/wikisource.js`

```javascript
export function parseFullView(html: string): Array<{volume: string, name: string, content: string}>
export function preprocessWikisourceContent(text: string): string
```

`preprocessWikisourceContent` 是新加的一层——原脚本把这逻辑塞在 `formatSourceMarkdown` 里(行 285-303)。抽出来是为了让 `format.js` 真正"通用"。

### 3.4 `extractors/iwzbz.js` / `extractors/generic.js`

```javascript
export function match(url: string): boolean
export function extract(html: string, chapterName: string, bookTitle: string): string | null
```

### 3.5 `run.js`

```javascript
export async function runMain(argv: string[]): Promise<{done: number, skipped: number, failed: number}>
```

行为与原 `fetch-sources.js:362-481` 一致:发现 books/、解析 catalog.md / catalog.html、串提取器、t2s、写 source.md、写 fetch-errors.log、清孤儿目录。

### 3.6 `wiki.js`

```javascript
export async function wikiMain(argv: string[]): Promise<boolean>
```

行为 = 原 `fetch-wikisource.js:337-425` + **catalog 存在性校验**:
- catalog.md 不存在 → 走原行为(从全览页生成 catalog + source)
- catalog.md 存在 → `console.error` + `process.exit(2)`,提示 "catalog.md 已存在,请用 `run` subcommand 追加 source"

---

## 四、数据流

```
                       ┌─────────────────────────────────┐
                       │  scripts/fetch-source.js        │
                       │  (argv 解析 + dispatch)         │
                       └────────┬───────────────┬────────┘
                                │               │
                          runMain(argv)   wikiMain(argv)
                                │               │
                ┌───────────────┘               └────────────────┐
                ▼                                                ▼
        ┌──────────────┐                              ┌──────────────┐
        │   run.js     │                              │   wiki.js    │
        │              │                              │              │
        │ parseCatalog │                              │ checkCatalog │
        │ parseUrlMap  │                              │ 存在? → exit │
        │   loop:      │                              │ 不存在?      │
        │   fetchPage  │                              │ parseFullView│
        │   extractor  │                              │   loop:      │
        │   format ────┼──► format.js (共用)          │   preprocess │
        │   write      │                              │   format ────┼──► format.js (共用)
        └──────┬───────┘                              │   write      │
               │                                      └──────┬───────┘
               │                                             │
               ▼                                             ▼
        extractors/iwzbz                            extractors/wikisource
        extractors/generic                          (parseFullView + preprocess)
```

---

## 五、行为契约

### 5.1 字节级不变(硬约束)

- `books/{slug}/articles/{篇名}/source.md` 路径、文件名、H1 标题、正文、注家块格式与现状**逐字一致**
- t2s 触发条件:run 模式读 catalog.md 的 `字形策略`,仅 `简体规范化` 时启用(wiki 模式不变——维基文库本身简体)
- 跳过已存在:`fs.existsSync(outPath) && !FORCE` → 跳过
- 错误日志:run 模式写 `fetch-errors.log` 到项目根
- 进度条 + ETA:stdout 输出格式不变
- 模糊 URL 匹配:`matchUrl(name, urlMap)` 6 条规则原样保留
- 孤儿目录清理:run 模式遍历 articles/ 删除不在 catalog 篇名集合中的目录
- 重试策略:429 / 5xx 的 3 次指数退避原样
- User-Agent:`Mozilla/5.0 (compatible: BookArchiver/1.0)` 头原样

### 5.2 行为变更(已拍板决策)

| 维度 | 旧 | 新 |
|------|---|---|
| 命令语法 | `scripts/fetch-sources.js <slug> [ch] [--force] [--dry-run]` | `scripts/fetch-source.js run <slug> [ch] [--force] [--dry-run]` |
| 命令语法 | `scripts/fetch-wikisource.js <slug> [--dry-run]` | `scripts/fetch-source.js wiki <slug> [--dry-run]` |
| wiki 模式 catalog | 总生成 | 缺失则建(原行为),存在则报错退出(退出码 2) |
| WIKI_BOOKS 配置位置 | fetch-wikisource.js 内部 | wiki.js 内部(只搬位置,内容不动) |

### 5.3 红线(不做)

1. 不改任何 source.md 输出内容的字、格式、t2s 转换结果
2. 不新增 EXTRACTOR
3. 不改 fetch-errors.log 的位置和内容格式
4. 不改 utils.js(lib/)的接口
5. 不改 t2s.js 的接口
6. 不重命名 `books/{slug}/` 下的任何目录或文件
7. 不改 catalog.md 的生成格式
8. 不加新依赖(package.json 不动)
9. 不加单元测试(范围外,format.js 后续单测成本极低)

---

## 六、文档同步(本任务必做)

| 文件 | 位置 | 改法 |
|------|------|------|
| `.claude/skills/source-create/shared/sources/script.md` | 行 14, 17 | 命令替换 + 加 subcommand |
| `.claude/skills/source-create/shared/strategy.md` | 行 23, 49, 52, 55 | 同上 |
| `.claude/skills/source-create/shared/gate.md` | 行 14 | 文字提及"fetch-sources.js" → 新路径 |
| `.claude/skills/source-create/SKILL.md` | 行 18, 64 | 表格 D 行 + 文字 |
| `.claude/skills/book-create/shared/sources/url.md` | 行 24 | 文字提及 |
| `docs/DEVELOPMENT_GUIDE.md` | 行 150-151, 166 | 目录树注释 |
| `docs/TECH_STACK.md` | 行 461-462 | 表格行 |
| `README.md` | 行 115-116 | 目录树注释 |

**注**:`.claude/skills/*/shared/sources/` 下文件是 manifest.json 管理的"规范副本",但本次改的全是 `node scripts/...` 调用语法引用,**不在 manifest 收录范围内**,不触发 manifest 重同步。

---

## 七、验收标准

| # | 验证项 | 命令 / 方式 | 预期 |
|---|--------|------------|------|
| 1 | 旧脚本删除 | `ls scripts/fetch-sources.js scripts/fetch-wikisource.js` | 均不存在 |
| 2 | 新入口可执行 | `node scripts/fetch-source.js --help` | 打印 HELP |
| 3 | run 模式 dry-run 命中 | `node scripts/fetch-source.js run 滴天髓阐微 --dry-run` | 至少 1 本书打印计划 |
| 4 | wiki 模式 dry-run 命中 | `node scripts/fetch-source.js wiki 紫微斗数全书 --dry-run` | 打印前 10 章 |
| 5 | wiki 模式拒绝重复建库 | 先 wiki 跑一次,再 wiki 跑同书 | 第二次 exit 2,提示用 run 模式 |
| 6 | 实际产出 | `node scripts/fetch-source.js run 滴天髓阐微 <某篇> --force` | source.md 写入 |
| 7 | 产出字节级一致 | 抽出 1 篇未录篇章,跑前/后 diff | diff 为 0 |
| 8 | 旧路径引用清零 | `grep -rn "scripts/fetch-sources\.js\|scripts/fetch-wikisource\.js" --include="*.md" --include="*.js" --include="*.json"` | 0 命中 |
| 9 | t2s 行为不变 | 字形策略=简体规范化的书跑 1 篇 | 输出仍是简体 |
| 10 | wiki 产出字节级一致 | 抽 1 篇紫微斗数全书 source.md 与历史 commit 对比 diff | diff 为 0 |

---

## 八、风险与回滚

- **风险点**:`format.js` 抽取时 `formatSourceMarkdown` 行为漂移——通过验收 #7/#10 的 diff 抓出
- **回滚**:`git revert <commit>` 一次,5 处文档+6 个新文件全删
- **不影响**:`books/{slug}/` 下已存在的 source.md(本任务不改内容,只新建)
