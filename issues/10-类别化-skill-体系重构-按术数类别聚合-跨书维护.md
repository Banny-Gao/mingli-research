# 【架构重构】类别化 Skill 体系：按术数类别聚合 + 跨书维护

> 日期：2026-06-22（创建）/ 2026-06-23（v2 spec 落盘）
> 状态：**设计已完成**——v2 spec 已落盘，进入分阶段实施（PR-1 ~ PR-4）
> 前置 commit：`f16f3c3` clean(skill): 拆除篇章→skill 1:1 体系（旧体系已拆除，回归干净状态）
> 设计交付：`docs/superpowers/specs/2026-06-23-v2-category-skill-system-design.md`（v2 spec，权威）
> 历史对照：`research-dispute/SPEC-skill.md`（1:1 文档导向 SPEC，已加废弃横幅）
> 实施入口：Phase 1 PR（创建 `scripts/lib/category-tree.js` + TS 门面）—— 待启动

---

## 一、问题描述

### 1.1 旧体系已废除

`commit f16f3c3` 拆除了"一篇一 skill"的 1:1 绑定体系：

- `books/{slug}/articles/{篇名}/skill.md` 不再被前端读取
- `generate.js` 不再生成 `skillKeys/skillContent/skillRawContent/skillDisplayNames`
- `ModalReader/useChapterContent/SearchBar/ReadList/ActionBar` 已移除所有 skill 模式分支
- 唯一残留源文件：`books/滴天髓阐微/articles/八格/skill.md`（git tracked，未删，等待新架构承接）

当前 `src/` 下没有任何 skill 入口，整套 skill 渲染管线被清理为零。**这是清理态，不是目标态**。

### 1.2 旧体系的根本缺陷

| 缺陷                                | 后果                                                            |
| ----------------------------------- | --------------------------------------------------------------- |
| **skill 跟着篇章走**                | 同主题散落在多本书里（如"格局判定"在滴天髓/子平真诠/渊海子平/三命通会各有论述），每本书要重复沉淀 |
| **无法跨书聚合**                    | AI/LLM 想调用"八字·格局判定"必须读 4 本书的 skill.md，且互相矛盾时无仲裁 |
| **1:1 重复抽象**                    | 同名篇章（如多本书都叫"八格"）冲突时无注册机制                  |
| **演进不可见**                      | skill 更新无 git 历史维度的归属，多人维护容易脱镜                |
| **域范畴错位**                      | skill 是"判定能力"，却绑在"单一著作"上，与命理学的二级类别（八字/紫微/六爻）不对齐 |

### 1.3 期望的新形态

skill 应归属"**术数 × 二级类别**"（如"命·八字·格局判定"、"命·八字·旺衰判断"、"卜·六爻·用神旺衰"），与 `Landing.tsx` 的 `CATEGORY_TREE` 范畴对齐。

**核心抽象**：

- **类别 skill 是独立模块**，跨多本书沉淀，由对应类别的全部原始文献支撑
- **维护路径按类别**，同类别多本书的原文/解读共同支撑该类别的 skill
- **更新触发按类别**，新增/修订某类别书目的解读时，对应 skill 应被审视是否需要更新

### 1.4 影响面

| 层面           | 影响                                                          |
| -------------- | ------------------------------------------------------------- |
| 内容沉淀       | 17 本书 × 多类别，需要按类别组织 skill                        |
| `books/` 结构  | 类别归属由 `books/{slug}/catalog.md` 的 `> 类别：` 字段决定   |
| `research-dispute/SPEC-skill.md` | 全文重写（当前是 1:1 文档导向）                |
| `src/`         | 新增 skill 入口（首页/书籍页/搜索/独立 skill 路由）          |
| `scripts/`     | `generate.js` 新增类别聚合逻辑，categories skill 加载器       |
| AI 工具链      | `~/.claude/skills/` 下的项目 skill（如 `interpretation-create`）可能需要按新形态调整 |

---

## 二、设计 Prompt

> 下面这段 prompt 是**给下一轮 brainstorming / spec 设计 agent 的入口**。直接复用即可，无需改动。

```text
请你基于以下需求设计一个【类别化 Skill 体系】，目标是替代当前被废除的"篇章→skill 1:1"绑定模式。

## 背景
- 项目仓库：mingli-research
- 旧体系已 commit f16f3c3 拆除，当前 `src/` 无 skill 入口
- 唯一残留：`books/滴天髓阐微/articles/八格/skill.md`（git tracked）
- 现有 SPEC：`research-dispute/SPEC-skill.md`（基于旧 1:1 形态，必须全文重写）
- 类别定义：`Landing.tsx` 的 CATEGORY_TREE（命 > 八字/紫微斗数/七政四余；卜 > 易经/六爻/梅花易数/奇门遁甲/大六壬；等）
- 17 本书分布在不同类别下，每本书的 `> 类别：` 在 catalog.md

## 设计目标
1. skill 归属"术数 × 二级类别"，如"命·八字·格局判定"
2. 一个 skill 是独立模块，由该类别下所有书的原文+解读共同支撑
3. skill 有版本/更新时间戳，便于追溯何时由哪本书的解读触发更新
4. 同名 skill（跨类别的同名技法）不冲突（路径天然隔离）
5. AI 工具链（~/.claude/skills/）和 src 前端都能消费同一份 skill 源

## 必须产出的设计决策
1. **存储位置**：skill 文件放在哪里？参考示例：
   - `skills/八字/八格判定/` （与 books/ 平级）
   - `skills/八字/八格判定/SKILL.md` + `rules/` + `shared/`
   - 或 `research-dispute/skills/...` 等其他方案
   请基于项目现有结构（books/, research-dispute/, src/, docs/）评估，权衡 2-3 个方案后给出推荐
2. **目录骨架**：单 SKILL.md vs SKILL.md + rules/ + shared/ 三件套？粒度如何？
3. **生成规则**：scripts/generate.js 如何识别并聚合 skills/ 下的目录？是否需要 categories index 文件？
4. **类别注册**：CATEGORY_TREE 是 skill 路径的 source of truth，还是 skill 路径自发现？两者怎么校验一致性？
5. **src 入口**：
   - 首页 / Landing 是否有 skill 入口？
   - 书籍页 / Reader 是否展示该书所属类别的 skill 列表？
   - SearchBar 是否支持 skill 过滤？
   - 是否需要独立 `/skills/命/八字/八格判定` 路由？
   - 每个入口给出推荐 + 理由
6. **更新触发机制**：
   - 新增/修订某类别书的解读时，对应 skill 如何被提示需审视？
   - skill 文件中是否需要 `## 来源书目` 字段列出支撑文献？
   - 是否需要 git hook / CI 检查？
7. **数据迁移路径**：
   - `books/滴天髓阐微/articles/八格/skill.md`（199 行）如何迁移到新位置？
   - 是否保留旧路径作为兼容层？

## 输出要求
1. 重写后的 `research-dispute/SPEC-skill.md` 全文
2. 简明的架构图（ASCII / Mermaid 任选）
3. 数据流：原书 catalog.md → skill 目录 → generate.js → src/ 前端 → AI 工具链
4. 落地清单：分阶段实施步骤，每步有可验证的成功标准
5. 风险与未决问题：列 3-5 条需要在实施中决策的事项

## 不要做的事
- 不要只描述概念不给方案——每个设计点必须给出具体推荐 + 理由
- 不要重复旧 SPEC 的"1:1 文档导向"框架——这是要替换的目标
- 不要引入新的 npm 依赖，除非确实必要
- 不要修改 src/ 下任何代码（设计完成后再开实施 issue）
```

---

## 三、关联上下文

### 3.1 现状文件参考

| 文件                                                     | 状态     | 作用                              |
| -------------------------------------------------------- | -------- | --------------------------------- |
| `research-dispute/SPEC-skill.md`                         | 待重写   | 当前是 1:1 文档导向 SPEC          |
| `research-dispute/SPEC-catalog.md`                       | 参考     | `> 类别：` 字段定义已支持         |
| `research-dispute/general.md`                            | 参考     | 类别判定通用规则                  |
| `src/pages/Landing.tsx`                                  | 参考     | CATEGORY_TREE 当前位置            |
| `scripts/generate.js`                                    | 待扩展   | 需新增 skill 聚合生成             |
| `books/滴天髓阐微/articles/八格/skill.md`                | 已存     | 唯一 skill 源，等待迁移           |

### 3.2 类别样例（来自现有 catalog.md）

```
命 / 八字    → 滴天髓阐微、子平真诠、渊海子平、三命通会、千里命稿、神峰通考、
              穷通宝鉴、五行精纪、命理探原、玉照定真经、李虚中命书、八字提要
命 / 紫微斗数 → 紫微斗数全书
医 / 中医    → 五行大义
山 / 拳法    → （暂无）
相 / 地相    → （暂无）
卜 / 易经    → （暂无）
卜 / 六爻    → （暂无）
```

**仅"八字"类别就有 12 本书共享**——这就是为什么要类别聚合的最直接证据。

### 3.3 已有相关 issue / commit

- `issues/06-产品审视-知识库现状问题报告.md`（提及"AI/开发者调用技能做命理工具，有框架但无实质内容"——本次 issue 是该问题的直接后续）
- `commit f16f3c3`（前置清理）

---

## 四、验收标准

本次 issue 的"完成"不意味着实施完成，而是 **设计 prompt 被消费并产出 SPEC.md + 落地清单**。后续实施（src 改造 / scripts 扩展 / 数据迁移）应拆为独立 issue。

### 4.1 设计交付验收（本期完成）

| 验收项                                              | 判定方式                       | v2 spec 定位 | 状态 |
| --------------------------------------------------- | ------------------------------ | ------------ | ---- |
| 重写后的 `research-dispute/SPEC-skill.md` 提交并 tracked | git log 显示对应 commit    | 已被 v2 替代，保留为历史快照 | ✓ |
| 设计 prompt 回答完整（7 个必答设计点）              | 检查 SPEC 是否逐一回应         | v2 spec 全面回应（§三、§四、§五、§六、§七） | ✓ |
| 数据迁移路径明确                                    | SPEC 含"从旧到新"的具体操作步骤 | v2 spec §七 详述一 skill 一 PR | ✓ |
| 风险与未决问题清单                                  | SPEC 含 ≥3 条                  | v2 spec §十 列出 8 项未决风险 | ✓ |
| 实施步骤分阶段，每阶段有可验证标准                  | SPEC 含清单                    | v2 spec §九 Phase 1-4 | ✓ |

### 4.2 实施验收（后续 PR）

实施按 v2 spec §九 落地清单分 4 个 PR：

| PR | 内容 | 验收命令 |
|----|------|---------|
| PR-1 | Phase 1 基础设施（CATEGORY_TREE 真源抽取） | `npm run build` + `npm run dev` + `npm run generate -- --audit` exit 0 |
| PR-2 | Phase 2 首个 skill 迁移（八格判定） + generate.js 扩展 | `npm run generate` 后 `src/data/skills.json` 含 1 条；旧 `books/.../八格/skill.md` 已删 |
| PR-3 | Phase 3 Skills.tsx 列表页 + 路由 | 浏览器能进入 `/skills` 看到"命·八字·八格判定"卡 |
| PR-4 | Phase 3 SkillDetail.tsx 详情页 + search-index 决策 | 浏览器能进入 `/skills/命/八字/八格判定` 看正文 + 输入表单 |

PR 全部合并后，本 issue 验收状态从"设计已完成"升为"实施已完成"。

---

_本 issue 是 skill 体系重构的"启动闸门"——回答清楚 §二 的 7 个设计点后，方可进入实施阶段。_