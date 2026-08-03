# 短剧创作状态以项目文件为准(series.md / episode.md / evidence/log),不设独立进度文件

skill 的中断恢复/跨会话续作不依赖额外状态文件——创作进度本身就是 `short-dramas/{slug}/series.md`(整体框架)、`episodes/ep{NN}/episode.md`(剧本+分镜)、`evidence/log.md + log.jsonl`(产出记录)。skill 启动时读这些文件恢复上下文,单一事实源,无同步漂移问题。

取舍:不用 `progress.json` 集中状态(需要与文件双向同步,易漂移),不靠口头确认进度(打断创作流)。代价是"进行到哪一步"需要从文件推断,但这正符合文件即状态的语义——分镜表里每个镜头的状态字段(待生成/已生成/验收中/PASS/FAIL)就是当前快照,证据 log 是流水。
