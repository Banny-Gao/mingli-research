# coding-compliance

前端代码合规审查技能。用于代码规范检查、质量审查和风格修复。

## 快速开始

在对话中（说任意一句即可触发技能）：

> 帮我检查代码规范 / 审查这段代码 / 帮我看看这个文件 / 代码质量 review

技能加载后按流程交互即可。

## 适用场景

| 场景 | 建议 |
|------|------|
| 提交前验证变更 | 快速检查（仅 Error + Warning） |
| PR 前全面审查 | 全面检查（含 Suggestion） |
| 接手老项目清理 | 分批审查 + 逐批确认 |
| 特定文件的深度 review | 指定文件路径 + 全面检查 |

## 文件结构

```
coding-compliance/
├── README.md           ← 本文件
├── SKILL.md            ← 技能主流程（技能入口，定义执行协议）
├── CI.md               ← CI 集成指南
├── PERFORMANCE.md      ← 性能反模式审查表
├── TESTING.md          ← 审查示例（验证技能能否发现预设问题）
└── RULES/
    ├── common.md       ← 通用层：命名/安全/性能/Git/优雅编程/TypeScript/错误处理
    ├── frontend.md     ← 前端通用：组件设计/状态管理/模块组织/可访问性
    ├── react.md        ← React 专项：Hooks/组件组合/性能优化/反模式
    ├── vue.md          ← Vue 专项：Composition API/响应式/Composable
    └── styles.md       ← 样式层：CSS 架构/Less/Tailwind/主题/动画性能
```

## 规则层级

审查时按此层次依次检查：

```
1. common.md     → 通用层（命名、安全、Git……）
2. frontend.md   → 前端通用（组件、状态、资源……）
3. react/vue.md  → 框架专项（根据项目自动检测）
4. styles.md     → 样式层（CSS 变量、嵌套、响应式……）
```

检测到 React 项目则加载 `react.md`，Vue 项目加载 `vue.md`。两者都有则询问指定。

## 审查流程

```
用户触发 → 确认范围和深度 → 上下文检测 → 分批执行 → 逐批确认 → 修复 → Diff 验证
```

每批次最多 3-5 个文件或 5-10 条问题，属于同一模块（安全 → 命名 → Hooks → 样式……）。

详细流程见 `SKILL.md`。

## 三个级别

| 级别 | 含义 |
|------|------|
| Error | 阻塞性，必须修复（如硬编码密钥、XSS 风险） |
| Warning | 建议修复，不阻塞（如 !important 滥用） |
| Suggestion | 改进提示（如路径未常量化） |

## 与其他工具的关系

| 工具 | 定位 | 与本技能区别 |
|------|------|-------------|
| ESLint | 自动检测语法和格式 | 本技能关注 ESLint 覆盖不了的架构、组件设计、命名语义问题 |
| Prettier | 自动格式化代码 | 本技能不做格式化，但会检查格式一致性 |
| TypeScript | 类型检查 | 本技能检查类型设计质量（如是否过度使用 `any`） |

建议先跑 ESLint + 类型检查，再用此技能做架构级审查。

## 例外机制

如某条规则不适合当前代码，可用注释跳过检查：

```tsx
// @compliance-disable F-1 原因：此处的重复是故意的，下个版本会统一重构
```

必须在注释中写明原因。具体规则见 `SKILL.md` → Exception Mechanism 章节。

## 开发与维护

- RULES 目录下的规范文件可按需扩展
- 新增规则时在对应文件的对应章节追加
- 如果规则涉及新框架，在 `SKILL.md` 的 `Framework Detection` 中添加检测逻辑
- `TESTING.md` 的测试用例应与 RULES 保持同步
