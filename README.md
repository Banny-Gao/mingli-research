# 命理学术研究站点

基于《渊海子平》《滴天髓》等正统子平经典，对经典著作进行系统性学术解读，并构建配套 AI 执行技能体系，用于学术研究与质疑处置。

## 项目结构

```
mingli-research/
├── books/                      # 书籍源码目录
│   ├── ditiansui-site/         # 《滴天髓阐微》站点
│   │   ├── interpretations/    # 已解读篇章（10/64）
│   │   ├── skills/            # Claude Code 执行技能（9个）
│   │   ├── components/        # React 组件
│   │   ├── pages/            # 页面组件
│   │   ├── catalog.md         # 64篇总表（自动生成数据源）
│   │   ├── meta/             # 元数据
│   │   ├── scripts/          # 生成脚本
│   │   └── deploy.js*        # 部署脚本
│   └── yuanhaiziping/         # 《渊海子平》站点
├── src/                        # 根目录 React 入口
├── scripts/                    # 内容生成脚本（generate.js / postbuild.js）
├── dist/                       # 构建产物
├── SKILL-bazi-research-dispute.md  # 全局学术研究技能（v2.0）
├── AGENTS.md                   # GitNexus 代码索引配置
├── CLAUDE.md                   # 项目行为准则
├── PROGRESS.md                 # 解读进度追踪
└── README.md                   # 本文件
```

## 技术栈

| 层级     | 技术                                     |
| -------- | ---------------------------------------- |
| 站点框架 | React 19 + React Router 7                |
| 构建工具 | Vite 5 + TypeScript 5                    |
| 样式     | Tailwind CSS 4 + @tailwindcss/typography |
| 内容处理 | marked（Markdown → HTML）                |
| 动画     | GSAP 3                                   |

## 核心规范

学术研究遵循 **14 条绝对红线禁令**，以经典原文为唯一判准：

- 经典原文 > 一切名家注解 > 个人观点 > 网络杂论
- 禁止自创理论、禁止传播网络伪论
- 禁止武断流派争议，争议问题客观陈列多方依据
- 错误观点按四步流程指正（正面回应→溯源经典→拆解逻辑→开放探讨）

详见 `SKILL-bazi-research-dispute.md`。

## 开发命令

```bash
pnpm dev          # 启动开发服务器
pnpm build        # 构建生产版本（tsc + vite build + postbuild）
pnpm generate     # 仅运行内容生成脚本
pnpm all          # generate + build
pnpm preview      # 预览构建产物
```

## 内容生成机制

`scripts/generate.js` 从外部数据源 `/root/.hermes/mingli/` 读取各书籍的 `catalog.md`，根据"已解读"状态提取对应 `tutorial.md` 内容，生成 `src/data/` 下的类型文件供 React 使用。

详见 `scripts/generate.js`。

## 解读进度

- **滴天髓阐微**：10 / 64 篇（15.6%）
- **渊海子平**：进行中

详见 `PROGRESS.md`。

## 内容来源

经典依据（按优先级）：

1. **至高核心**：《渊海子平》《滴天髓》
2. **辅助权威**：《子平真诠》《三命通会》《穷通宝鉴》《滴天髓阐微》《神峰通考》《千里命稿》《八字提要》《命理探源》《子平概要》
