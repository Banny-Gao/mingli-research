# 短剧 skill 技术底座全部原生 HTTP API,视觉验收用 Claude 原生视觉

MiniMax 的 H3 视频模型(异步任务制 `/v2/video_generation`)是短剧出片的核心,但 mmx CLI 目前只封装旧版 Hailuo-2.3,不支持 H3。因此短剧 skill 的所有 MiniMax 调用(文本/图像/视频/语音/文件)统一走原生 HTTP API,封装在项目 `scripts/` 下,API key 复用项目 `.env`(`scripts/lib/env.js` 已有模式),不依赖 mmx CLI。

两个例外/澄清:
1. **视觉能力不依赖 MiniMax**:`mmx vision describe` 是 CLI 封装、`understand_image` 需 Token Plan,均与"原生 HTTP + 不依赖 mmx"冲突,且无公开 REST 接口。而 skill 运行在 Claude Code 内,Claude 自身具备视觉能力,所以成片验收的"LLM 抽帧审"直接用 Claude 原生视觉读帧,不调 MiniMax vision。
2. 教程附录 B 的 `minimax_h3.H3Client` Python SDK 不存在(LLM 幻觉),只有 HTTP API——实现时不要去找这个库。

代价是重复实现 mmx 已有的一些底层能力(文本/图像/语音),但集中在 lib 模块,可测试、可复用。
