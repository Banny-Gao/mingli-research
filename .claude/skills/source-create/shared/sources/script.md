# 模式 D：调脚本批量

## 输入契约

- **必填：** 书 slug（与 `books/{slug}/` 一致）
- **可选：** 篇章列表（逗号或空格分隔；缺省 = 整本所有未录篇章）

## 主 agent 动作

1. 收源：书 slug + 篇章列表
2. 拼命令：
   ```bash
   # dry-run 预览
   node scripts/fetch-sources.js <slug> <chapter1>,<chapter2> --force --dry-run

   # 实跑
   node scripts/fetch-sources.js <slug> <chapter1>,<chapter2> --force
   ```
3. **先 dry-run**让用户确认范围
4. 用户确认后**去掉 `--dry-run`**实跑
5. 校验产出：
   - `ls books/<slug>/articles/<篇名>/source.md` 存在性
   - 行数 / 字符数（如 < 100 字标记"过短"）
6. 收尾报告

## fetch-sources.js 能力继承（v1 不动内部代码）

- 自动发现 books/ 下含 catalog.md 的书
- EXTRACTORS 数组：iwzbz.com（`book-detail-content` 提取）+ generic（`《书名》第X章` 模式）
- catalog.html + catalog.md 联合解析
- t2s 转换（仅字形策略为"简体规范化"时启用）
- 注家标记 `【XX】` 检测
- 进度条 + 错误日志 + 模糊 URL 匹配
- `--force` 覆盖已存在文件；`--dry-run` 预览

## v1 不扩充的项

- 不加新站点 EXTRACTORS（CText / 国学大师 / 殆知阁 等 v2 待）
- 不改 fetch-sources.js 内部代码

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
