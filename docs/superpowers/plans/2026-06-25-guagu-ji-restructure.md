# 呱呱集篇章重构实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `呱呱集` 从 3 个粗粒度篇章重构为 35 个细粒度篇章，分属 3 卷（叙言 / 上集·名人命造 / 下集·命运答客问），并自动重生 `src/data/呱呱集/` 索引。

**Architecture:**
- 卷→篇二级结构通过 catalog.md 的 `##` 二级标题 + 表格编号实现，articles/ 目录平铺（符合 SPEC-catalog §1.1）
- 源文按 spec §四/§五的映射表机械拆分，原 368 行（名人命造）+ 1639 行（命运答客问）无损分到新 source.md
- 索引文件 `src/data/呱呱集/{content.ts,index.ts}` 由 `node scripts/generate.js` 自动重生成

**Tech Stack:** Node.js + Vite + Markdown（沿用项目既有栈，无新增依赖）

**前置文档:** `docs/superpowers/specs/2026-06-25-guagu-ji-restructure-design.md`

---

## 文件结构

| 文件 | 操作 | 职责 |
|---|---|---|
| `books/呱呱集/catalog.md` | Modify | 重写为 3 卷 35 篇结构 |
| `books/呱呱集/articles/小言/source.md` | Keep | 内容不变（仅 3 行） |
| `books/呱呱集/articles/上集：名人命造/` | Delete | 旧粗粒度目录 |
| `books/呱呱集/articles/下集：命运答客问/` | Delete | 旧粗粒度目录 |
| `books/呱呱集/articles/{上集 25 个篇名}/source.md` | Create | 上集按人物拆分的 25 篇 |
| `books/呱呱集/articles/{下集 8 个篇名}/source.md` | Create | 下集按主题归类的 8 篇 |
| `src/data/呱呱集/{content.ts,index.ts}` | Auto | generate.js 自动重生 |

**新 articles 目录（35 个）:**
```
小言/
张氏父子/  陈诚俞大维俞鸿钓/  杜月笙/  邵邨人/  汪希文/
阎锡山/  吴国桢/  甬商王某/  吴乡王翁/  明思宗/  陈孝威/
马票王某/  于右任/  梁二姑/  任伯棠/  陈克锦/  段祺瑞吴光新/
哈同/  叶锦文/  吴子深/  王晓籁程霖生/  燕春瑞冰/
鞋匠医生陈妇王企予文姑娘/
李弘毅孙太太太原生陈经理章太炎冼冠生许世英/
蒋孔宋朱家骅何应钦锺森孙传芳曾左彭关羽/
漫谈贫富徐乐吾十里自造/  婚姻/  财气/  子嗣/  事业/
寿元/  行运流年/  相法杂问/  命学综论/
```

---

## Task 1: 重写 catalog.md

**Files:**
- Modify: `books/呱呱集/catalog.md`

- [ ] **Step 1: 用 Write 覆盖 catalog.md**

写入以下完整内容：

```markdown
# 《呱呱集》

> 作者：[民国] 韦千里
> 版本：据民国韦千里写本（中华民国五二年癸卯 / 1963 年）
> 简介：韦千里继《千里命稿》后所撰命学札记，按「叙言」「上集·名人命造」「下集·命运答客问」三部分，记录作者行道以来所见特殊富贵贫贱之命
> 术数：命
> 类别：八字
> 内容类型：source
> 字形策略：原文照录

## 叙言

| 编号 | 篇名 |
| ---- | ---- |
| 01   | 小言 |

## 上集 · 名人命造

| 编号 | 篇名 |
| ---- | ---- |
| 02   | 张氏父子 |
| 03   | 陈诚俞大维俞鸿钓 |
| 04   | 杜月笙 |
| 05   | 邵邨人 |
| 06   | 汪希文 |
| 07   | 阎锡山 |
| 08   | 吴国桢 |
| 09   | 甬商王某 |
| 10   | 吴乡王翁 |
| 11   | 明思宗 |
| 12   | 陈孝威 |
| 13   | 马票王某 |
| 14   | 于右任 |
| 15   | 梁二姑 |
| 16   | 任伯棠 |
| 17   | 陈克锦 |
| 18   | 段祺瑞吴光新 |
| 19   | 哈同 |
| 20   | 叶锦文 |
| 21   | 吴子深 |
| 22   | 王晓籁程霖生 |
| 23   | 燕春瑞冰 |
| 24   | 鞋匠医生陈妇王企予文姑娘 |
| 25   | 李弘毅孙太太太原生陈经理章太炎冼冠生许世英 |
| 26   | 蒋孔宋朱家骅何应钦锺森孙传芳曾左彭关羽 |
| 27   | 漫谈贫富徐乐吾十里自造 |

## 下集 · 命运答客问

| 编号 | 篇名 |
| ---- | ---- |
| 28   | 婚姻 |
| 29   | 财气 |
| 30   | 子嗣 |
| 31   | 事业 |
| 32   | 寿元 |
| 33   | 行运流年 |
| 34   | 相法杂问 |
| 35   | 命学综论 |
```

- [ ] **Step 2: 校验**

```bash
cat "books/呱呱集/catalog.md" | head -50
```

Expected: 看到 `# 《呱呱集》` 标题、3 个 `##` 卷级（叙言 / 上集 · 名人命造 / 下集 · 命运答客问）、35 行编号表。

- [ ] **Step 3: 单独 commit（catalog 重写先行，便于 review）**

```bash
git add "books/呱呱集/catalog.md"
git commit -m "refactor(呱呱集): catalog 重写为 3 卷 35 篇结构"
```

---

## Task 2: 备份原 source 文件 + 删除旧 3 个目录

**Files:**
- Delete: `books/呱呱集/articles/上集：名人命造/source.md`
- Delete: `books/呱呱集/articles/下集：命运答客问/source.md`
- Keep: `books/呱呱集/articles/小言/source.md`（3 行，无需重写）

- [ ] **Step 1: 保留小言目录不动**

小言目录已是单 source.md，3 行内容，无需变更；catalog 已将其编号为 01。

- [ ] **Step 2: 删除旧上集、下集两个目录（不删小言）**

```bash
git rm -r "books/呱呱集/articles/上集：名人命造"
git rm -r "books/呱呱集/articles/下集：命运答客问"
```

Expected: 两目录被 git 标记删除。

- [ ] **Step 3: 校验：articles/ 下仅剩 小言 目录**

```bash
ls "books/呱呱集/articles/"
```

Expected output:
```
小言
```

- [ ] **Step 4: commit**

```bash
git commit -m "refactor(呱呱集): 删除旧上/下集粗粒度目录"
```

---

## Task 3: 创建上集 26 个新目录骨架

**Files:**
- Create: `books/呱呱集/articles/{篇名}/` 共 26 个空目录

- [ ] **Step 1: 一行 mkdir 一次性创建 26 个目录**

```bash
cd "books/呱呱集/articles" && mkdir -p \
  "张氏父子" "陈诚俞大维俞鸿钓" "杜月笙" "邵邨人" "汪希文" \
  "阎锡山" "吴国桢" "甬商王某" "吴乡王翁" "明思宗" "陈孝威" \
  "马票王某" "于右任" "梁二姑" "任伯棠" "陈克锦" "段祺瑞吴光新" \
  "哈同" "叶锦文" "吴子深" "王晓籁程霖生" "燕春瑞冰" \
  "鞋匠医生陈妇王企予文姑娘" \
  "李弘毅孙太太太原生陈经理章太炎冼冠生许世英" \
  "蒋孔宋朱家骅何应钦锺森孙传芳曾左彭关羽" \
  "漫谈贫富徐乐吾十里自造"
cd ../../..
```

Expected: 26 个空目录创建成功。

- [ ] **Step 2: 校验数量**

```bash
ls "books/呱呱集/articles/" | grep -v '^小言$' | wc -l
```

Expected: `26`

- [ ] **Step 3: 不单独 commit（与 Task 4 合并）**

---

## Task 4: 拆分上集 source.md 到 26 个新文件

**Files:**
- Create: `books/呱呱集/articles/{篇名}/source.md` 共 26 个

**源文件读取:** `books/呱呱集/articles/上集：名人命造/source.md` 已通过 Task 2 删除，所以 Task 4 必须先在内存中提取原文。**实操做法：** 执行 Task 2 之前先 cp 一份原文到临时路径 `/tmp/上集-source-snapshot.md`。

**修正执行顺序：** 把 Task 2 Step 2 改为：

```bash
cp "books/呱呱集/articles/上集：名人命造/source.md" /tmp/上集-source-snapshot.md
cp "books/呱呱集/articles/下集：命运答客问/source.md" /tmp/下集-source-snapshot.md
git rm -r "books/呱呱集/articles/上集：名人命造"
git rm -r "books/呱呱集/articles/下集：命运答客问"
```

- [ ] **Step 1: 读取源文快照，按映射表逐个 Write 26 个 source.md**

每个 source.md 第 1 行 = `# {篇名}`，第 2 行起为源文对应段落（保留原空行、保留原文照录字形）。

**映射（篇名 → /tmp/上集-source-snapshot.md 中对应行号）：**

| 篇号 | 篇名 | 源文行号范围 |
|---|---|---|
| 02 | 张氏父子 | L5-L11 |
| 03 | 陈诚俞大维俞鸿钓 | L3 |
| 04 | 杜月笙 | L13-L18 |
| 05 | 邵邨人 | L20-L23 |
| 06 | 汪希文 | L25-L30 |
| 07 | 阎锡山 | L32-L35 |
| 08 | 吴国桢 | L37-L42 |
| 09 | 甬商王某 | L44-L49 |
| 10 | 吴乡王翁 | L51-L56 |
| 11 | 明思宗 | L58-L65 |
| 12 | 陈孝威 | L67-L70 |
| 13 | 马票王某 | L72-L77 |
| 14 | 于右任 | L79-L84 |
| 15 | 梁二姑 | L86-L91 |
| 16 | 任伯棠 | L93-L96 |
| 17 | 陈克锦 | L98-L99 |
| 18 | 段祺瑞吴光新 | L101-L108 |
| 19 | 哈同 | L110-L116 |
| 20 | 叶锦文 | L118-L123 |
| 21 | 吴子深 | L125-L130 |
| 22 | 王晓籁程霖生 | L132-L141 |
| 23 | 燕春瑞冰 | L143-L153 |
| 24 | 鞋匠医生陈妇王企予文姑娘 | L155-L181 |
| 25 | 李弘毅孙太太太原生陈经理章太炎冼冠生许世英 | L183-L229 |
| 26 | 蒋孔宋朱家骅何应钦锺森孙传芳曾左彭关羽 | L231-L326 |
| 27 | 漫谈贫富徐乐吾十里自造 | L328-L368 |

每个文件的格式范例（以篇 02 张氏父子 为例）：

```markdown
# 张氏父子

张作霖命造，为：
乙亥 已卯 庚辰 丁丑。四柱一旬，责气所锺，宜其称王关外矣。...
...
按张氏父子之命造，均有过人之处，但论气概，子逊于父，远矣哉！
```

（首行是 `# 篇名`，之后是从源文相应行号范围内 copy 的原文段落，行号范围内不包含源文 `# 上集：名人命造` 这一标题行。）

- [ ] **Step 2: 行数校验**

```bash
wc -l "books/呱呱集/articles/"*/source.md | tail -1
```

Expected: 接近 `368 books/呱呱集/articles/张氏父子/source.md`（即合计 368 ±5 行）

- [ ] **Step 3: 标题校验**

```bash
for d in "books/呱呱集/articles/"*/; do
  name=$(basename "$d")
  first=$(head -1 "$d/source.md" | tr -d '\r')
  expected="# $name"
  if [ "$first" != "$expected" ]; then
    echo "MISMATCH: $d first='$first' expected='$expected'"
  fi
done
```

Expected: 无 MISMATCH 输出（静默通过）。

- [ ] **Step 4: commit**

```bash
git add "books/呱呱集/articles/"
git commit -m "refactor(呱呱集): 上集 source 按人物拆分为 26 篇"
```

---

## Task 5: 创建下集 8 个新目录骨架

**Files:**
- Create: `books/呱呱集/articles/{主题}/` 共 8 个空目录

- [ ] **Step 1: 创建 8 个主题目录**

```bash
cd "books/呱呱集/articles" && mkdir -p \
  "婚姻" "财气" "子嗣" "事业" "寿元" \
  "行运流年" "相法杂问" "命学综论"
cd ../../..
```

- [ ] **Step 2: 校验**

```bash
ls "books/呱呱集/articles/" | wc -l
```

Expected: `34`（26 上集 + 8 下集，不含小言）

- [ ] **Step 3: 不单独 commit（与 Task 6 合并）**

---

## Task 6: 拆分下集 source.md 到 8 个新文件

**Files:**
- Create: `books/呱呱集/articles/{主题}/source.md` 共 8 个

**源文件快照：** `/tmp/下集-source-snapshot.md`（Task 2 Step 2 修正后已备份）

下集无内部分组标记，按 spec §五 的主题分类表，逐 `(答XXX君)` 段落归类。

**主题归类（核心分配）：**

| 篇名 | 包含段落 |
|---|---|
| 婚姻 | 答林静、答李欣如、答林严再娶、答林川、答张大通、答马绍夏（婚嫁问题） |
| 财气 | 答金瑞和、答林镜吾、答毋金容、答袁冰文、答刘汉彬、答黄太太等 |
| 子嗣 | 答胡锡珍、答陈绍令郎、答曾耀森（令郎段）、答陈步正令郎、答伍自觉、答林旭初、答何百岸、答陈延孟等 |
| 事业 | 答会耀森、答罗明东、答陈灯、答潘鑛、答曾民、答周龙靑、答王槐、答蔡靑等 |
| 寿元 | 答黄升、答赖壁斋、答王田化、答夏涛令堂、答饶新铭（行年七十五）等 |
| 行运流年 | 答陈子明、答东青流年、答李瑞永、答林严再娶、答沈德雄流年等 |
| 相法杂问 | 答朱曙（人中）、答孟焕如（达摩相书）、答一愚居士（五露）、答奚世尧（痣）、答翟清泉（痣）、答陆秀森（眼）等 |
| 命学综论 | 答林震贤（梅兰芳命造，含千里命稿引用）、韦千里与章太炎徐乐吾段、答林锡、答林严、答林镜吾（涉及学术讨论）等 |

**注意边界判断：**
- `(答曾耀森君)` 出现两次（行 39、134），按主题各分一次（行 39→事业；行 134→子嗣）
- `(答林镜吾)` 含金屋藏娇语，归财气
- 答林静/答张大通/答马绍夏等含婚情但不唯婚情，按主要问点归类

**执行方式（推荐 subagent 派发）：** 因 200+ 条问答的逐条归类是体力活且耗 token，建议用 subagent 派发：
- 派 8 个 subagent，每个负责 1 个主题
- 每个 subagent 输入：源文件快照路径 + 主题定义 + 输出路径
- 每个 subagent 输出：1 个 source.md
- 主 agent 收集后做最终一致性校验

**手工备选（fallback）：** 主 agent 自己 Read 整个下集，按 `(答XXX君)` 起止位置逐段拷贝到对应主题 source.md。

每个下集 source.md 的格式范例：

```markdown
# 婚姻

(答林静女士 )来书谓：「嫁夫十四年，夫妇感情平淡。夫似爱色而非真情,又绝对控制经济权，究能偕老否？」査淑造：
丁卯 庚戌 癸巳 甲寅。木火上林林总总，威胁癸水，本是无依无靠之命。将来运程又都木火，唯有奋图自立，努力事业，关于婚姻之有无前途，任其自然可也。

(答李欣如君)君问：「离家十载，双亲音信断絶，将来能否天伦重叙？」按台造：
...
```

- [ ] **Step 1: 创建 8 个 source.md（按上面归类分配写入）**

- [ ] **Step 2: 行数校验**

```bash
wc -l "books/呱呱集/articles/"*/source.md | tail -1
```

Expected: 接近 `2007 books/呱呱集/articles/...`（368 上集 + 1639 下集 = 2007）

- [ ] **Step 3: 标题校验（与 Task 4 Step 3 同命令）**

```bash
for d in "books/呱呱集/articles/"*/; do
  name=$(basename "$d")
  first=$(head -1 "$d/source.md" | tr -d '\r')
  expected="# $name"
  if [ "$first" != "$expected" ]; then
    echo "MISMATCH: $d first='$first' expected='$expected'"
  fi
done
```

Expected: 无 MISMATCH 输出

- [ ] **Step 4: 抽样校验（每个主题抽 1 段）**

每个下集 source.md 中至少含 1 个 `(答XXX君)` 段落：

```bash
for d in 婚姻 财气 子嗣 事业 寿元 行运流年 相法杂问 命学综论; do
  count=$(grep -c "(答" "books/呱呱集/articles/$d/source.md" || true)
  echo "$d: $count 答"
done
```

Expected: 每个主题 ≥ 1 条答（实际多数会 > 5）

- [ ] **Step 5: commit**

```bash
git add "books/呱呱集/articles/"
git commit -m "refactor(呱呱集): 下集 source 按主题归类为 8 篇"
```

---

## Task 7: 重跑 generate.js 验证索引重生成

**Files:**
- Modify (auto): `src/data/呱呱集/{content.ts,index.ts}`
- Modify (auto): `src/data/呱呱集/registry.ts`（若有）

- [ ] **Step 1: 运行 generate.js**

```bash
node scripts/generate.js
```

Expected: 无报错，正常退出（exit code 0）。可能输出若干行处理日志。

- [ ] **Step 2: 校验 content.ts 包含 35 个 ChapterKey**

```bash
grep "sourceKeys = \[" "src/data/呱呱集/content.ts"
```

Expected output: `export const sourceKeys = ["小言","张氏父子","陈诚俞大维俞鸿钓","杜月笙",...]` （共 35 项，含所有篇名）

- [ ] **Step 3: 校验 index.ts 含 35 个联合类型**

```bash
grep "ChapterKey =" "src/data/呱呱集/index.ts"
```

Expected: `export type ChapterKey = "小言" | "张氏父子" | "陈诚俞大维俞鸿钓" | ... | "命学综论";` （35 项）

- [ ] **Step 4: lint + build 烟囱测试**

```bash
npm run lint
npm run build
```

Expected: 两者都通过（无 error，warning 可接受）

- [ ] **Step 5: commit 索引变更**

```bash
git add "src/data/呱呱集/"
git commit -m "chore(呱呱集): generate.js 重生 35 篇 ChapterKey 索引"
```

---

## Task 8: 清理临时快照 + 最终验证

**Files:**
- Delete (local): `/tmp/上集-source-snapshot.md`、`/tmp/下集-source-snapshot.md`

- [ ] **Step 1: 删除临时快照**

```bash
rm /tmp/上集-source-snapshot.md /tmp/下集-source-snapshot.md
```

- [ ] **Step 2: 最终结构验证**

```bash
echo "=== 顶层 articles 目录 ==="
ls "books/呱呱集/articles/" | wc -l
echo "应输出 35"

echo "=== catalog 卷级标题 ==="
grep "^## " "books/呱呱集/catalog.md"

echo "=== catalog 篇名计数 ==="
grep -c "^| 0" "books/呱呱集/catalog.md"
echo "应输出 35"

echo "=== source.md 数量 ==="
find "books/呱呱集/articles/" -name "source.md" | wc -l
echo "应输出 35"
```

Expected: 35 / 3 个卷级标题 / 35 / 35

- [ ] **Step 3: 行数合计校验**

```bash
echo "=== 总行数 ==="
find "books/呱呱集/articles/" -name "source.md" -exec wc -l {} + | tail -1
```

Expected: 约 `2007 total`（原 368 + 1639 = 2007，允许 ±10 行）

- [ ] **Step 4: git status 检查**

```bash
git status
```

Expected: 工作区干净（无未跟踪文件、无未提交修改）

---

## 范围外（后续任务）

- 35 篇 `interpretation.md` 生成（走 `interpretation-create` 技能，批量模式）
- 35 篇 `skill.md` 沉淀（走 `skill-create` 技能）
- `search-index.json` 重生成（`generate.js` 已包含，但本次未 commit 其变化；后续单独走）
- 前端路由验证（在浏览器中打开 /book/呱呱集 路径，验证 35 篇可访问）

## 风险与回滚

| 风险 | 缓解 |
|---|---|
| source.md 拆分错位（行号偏移） | 每个 Task 都有行数合计校验（±10 行）+ 标题校验 |
| 下集归类边界争议 | Task 6 抽样校验 + 后续 interpretation 阶段可重新审视 |
| generate.js 输出破坏其他书的索引 | 备份 `src/data/` 后再运行 |
| 旧目录误删（无 git 备份） | 已 git rm（保留 git 历史），可 `git checkout HEAD~ -- books/呱呱集/articles/` 回滚 |