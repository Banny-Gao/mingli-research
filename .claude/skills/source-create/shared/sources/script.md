# 模式 D：调脚本批量

## 输入契约

- **必填：** 书 slug（与 `books/{slug}/` 一致）
- **可选：** 篇章列表（逗号或空格分隔；缺省 = 整本所有未录篇章）

## 主 agent 动作

1. 收源：书 slug + 篇章列表
2. 拼命令：
   ```bash
   # dry-run 预览
   node scripts/fetch-source.js run <slug> <chapter1>,<chapter2> --force --dry-run

   # 实跑
   node scripts/fetch-source.js run <slug> <chapter1>,<chapter2> --force
   ```
3. **先 dry-run**让用户确认范围
4. 用户确认后**去掉 `--dry-run`**实跑
5. 校验产出：
   - `ls books/<slug>/articles/<篇名>/source.md` 存在性
   - 行数 / 字符数（如 < 100 字标记"过短"）
6. 收尾报告

## fetch-source.js 能力继承（v1 不动内部代码）

- 自动发现 books/ 下含 catalog.md 的书
- EXTRACTORS 数组：iwzbz.com（`book-detail-content` 提取）+ generic（`《书名》第X章` 模式）
- catalog.html + catalog.md 联合解析
- t2s 转换（仅字形策略为"简体规范化"时启用）
- 注家标记 `【XX】` 检测
- 进度条 + 错误日志 + 模糊 URL 匹配
- `--force` 覆盖已存在文件；`--dry-run` 预览

## v1 不扩充的项

- 不加新站点 EXTRACTORS（CText / 国学大师 / 殆知阁 等 v2 待）
- 不改 fetch-source.js 内部代码

## 脚本产出的红线合规

**脚本不豁免红线。** fetch-source.js 只解决"批量抓取 + 已知站点（iwzbz.com / generic）t2s"问题；产出 source.md 后主 agent 仍须按 SPEC-source.md §五 红线 5 条复核：

1. 不混解读
2. 不改字（含 OCR 噪声、t2s 转换后疑似错的字）
3. 不加非 `> 【注家名】` 块引用之外的标记
4. 不分段处理长段原文
5. 不加非空行的任何内容

**复核点：**
- 抽 3-5 篇 source.md 看 t2s 转换是否合理（仅适用字形策略 `简体规范化` 的书）
- 抽 1-2 篇含注家的，看 `【XX】` 是否全部转为 `> 【XX】` 块引用
- 抽 1-2 篇长段，看是否被错误分段

复核发现违规 → 不接受脚本产出，回到 source-create 重录或手工修补。

## 失败兜底

| 异常 | 处置 |
|------|------|
| 调脚本失败（非 0 退出）| 报告 stderr，不重试 |
| 调脚本后产出校验失败（行数过少/缺失篇）| 报告详情，让用户决定 |
| 模糊匹配未命中 | 报告"未匹配篇章名：..."，让用户修正 |
| 网络失败（429 / 5xx）| 脚本内部已重试 3 次；最终失败 → 报告 |

## 与 source-create URL 模式的分工

- URL 模式：单点 + 任意站点（用 LLM 通用能力）
- 脚本模式：批量 + 已知 2 站点（用脚本 EXTRACTORS）
- **不重复造轮子**：v1 单点 LLM、批量脚本，各司其职

## 批量预期耗时

| 篇章数 | 典型耗时 | 网络/站点稳定性依赖 |
|--------|---------|-------------------|
| 1-10 篇 | < 1 分钟 | 低 |
| 10-50 篇 | 1-3 分钟 | 中（脚本内已重试 3 次）|
| 50-200 篇 | 3-10 分钟 | 高（429 / 5xx 概率上升）|
| 200+ 篇 | 10+ 分钟，建议分批 | 高 |

**进度提示：** fetch-source.js 跑时**终端输出**含进度条（用户可见），主 agent 在调用 `Bash` 工具时也**实时捕获** stdout 摘要给用户看（避免用户误以为卡死）。

**v1 限制：** 不支持后台断点续跑，跑失败须整本重跑。
