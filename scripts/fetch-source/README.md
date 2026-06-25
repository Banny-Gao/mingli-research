# fetch-source — 典籍原文抓取工具集

`scripts/fetch-source.js` 是统一入口,两个 subcommand:

- `run` — 通用抓取(iwzbz.com + generic),需已有 `catalog.md` + `catalog.html`
- `wiki` — 维基文库全览页抓取,首次运行建 `catalog.md`;已存在则拒绝

## 用法

```bash
node scripts/fetch-source.js run <slug> [chapter1 chapter2 ...] [--force] [--dry-run]
node scripts/fetch-source.js wiki <slug> [--dry-run]
```

## 内部模块

```
scripts/fetch-source/
├── format.js                 # 共享 source.md 格式化纯函数
├── run.js                    # run subcommand 主体
├── wiki.js                   # wiki subcommand 主体
└── extractors/
    ├── iwzbz.js              # iwzbz.com 提取器
    ├── generic.js            # generic 通用文本提取
    └── wikisource.js         # wikisource 解析 + 预处理
```

## 行为契约

`run` 模式读 `catalog.md` 的 `字形策略` 字段,仅 `简体规范化` 时启用 t2s。
`wiki` 模式不再使用 t2s(维基文库本身简体)。
所有 `source.md` 产出的字节级行为与重构前完全一致,只改调用语法。
