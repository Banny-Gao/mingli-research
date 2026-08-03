# API 速查(H3 原生 HTTP + scripts/lib/h3-api 用法)

> 全部原生 HTTP API(不依赖 mmx CLI,ADR 0001)。代码在 `scripts/lib/h3-api/`,统一入口 `index.js`。API key:`LLM_API_KEY`(通用)+ `MINIMAX_H3_API_KEY`(H3 专用,项目 .env)。

## 导入

```js
import { createVideo, waitForVideo, downloadVideo, queryVideo, listVideos, deleteVideo,
  createContextIr, createRegeneration, probeVideo, extractFrames,
  generateImage, generateImageI2I, synthesize, downloadAudio,
  uploadFile, toMmFile } from './scripts/lib/h3-api/index.js'
```

## 视频生成(v2,异步任务制)

### 创建任务 → 轮询 → 下载

```js
const taskId = await createVideo({
  content: [
    { type: 'text', text: '提示词' },
    { type: 'image_url', image_url: { url: 'mm_file://xxx' }, role: 'reference_image' },
    { type: 'audio_url', audio_url: { url: 'mm_file://yyy' }, role: 'reference_audio' },
    { type: 'video_url', video_url: { url: 'mm_file://zzz' }, role: 'reference_video' },
  ],
  resolution: '768P',   // 或 '2K'
  duration: 5,          // 4-15 整数秒
  ratio: '9:16',        // t2va 必填非 adaptive;i2va 强制 adaptive;r2va 默认 adaptive
})
const task = await waitForVideo(taskId, { onStatus: (s) => console.log(s) })
await downloadVideo(task.content.url, 'shots/shot_01_v0.mp4')
```

**模式组合**(`reference_*` 与 `first_frame/last_frame` **互斥**):
- t2va 空镜:`[{type:'text'}]` + ratio 必填
- i2va 无台词:`text` + 1 image(role=first_frame)+ ratio 强制 adaptive
- r2va 有声对话:锁脸 reference_image + 锁声 reference_audio + 可选 reference_video(动作接续)

### Context-IR(提示词增强,按 token 计费)

```js
const taskId = await createContextIr({ content, duration, ratio })
const task = await waitForVideo(taskId)
const enhancedPrompt = task.content.prompt  // 三段式:integrated_multimodal_description / overall_soundscape / non_diegetic_music
```

### regeneration(768P → 2K)

```js
const taskId = await createRegeneration({
  content: [ /* 原样提交:生成 768P 时的全部输入(含最终 prompt)+ base_video */ ],
  resolution: '2K',
})
```

### 任务管理

```js
await listVideos({ pageNum: 1, pageSize: 20, filter: { task_type: 'generation' } })
await deleteVideo(taskId)   // queued→取消;succeeded/failed→删除;running 不可操作
await queryVideo(taskId)    // 7 天内可查
```

### 规格检查(regeneration 前置)

```js
const probe = await probeVideo('shots/shot_01_v0.mp4')
// { width, height, fps, frames, hasAudio }
```

## 图像生成(v1)

```js
// 文生图(角色/场景资产)
const { imageUrls } = await generateImage({ prompt, aspectRatio: '9:16', n: 1, seed })
// 图生图(角色参考,锁一致性)
const { imageUrls } = await generateImageI2I({ prompt, subjectRef: { imageFile: 'ref.png', type: 'character' } })
```

## 语音合成(v1)

```js
// 声音锚/B 轨对白
const { audio, extraInfo } = await synthesize({
  text, voice: 'moss_audio_ce44fc67-7ce3-11f0-8de5-96e35d26fb85',  // 固定 voice_id
  emotion: 'angry',   // happy/sad/angry/fearful/disgusted/surprised/calm/fluent/whisper
  outputFormat: 'url', format: 'mp3',
})
await downloadAudio(audio, 'assets/audio/voice_angry.mp3')
```

## 文件上传(→ mm_file:// 引用)

```js
const { fileId } = await uploadFile({ filePath: 'ref.png', purpose: 'video_generation_input' })
const mmFile = toMmFile(fileId)  // 'mm_file://{fileId}'
```

## 抽帧(验收用)

```js
const frames = await extractFrames('shots/shot_01_v0.mp4', { outDir: 'shots/frames', count: 3 })
```

## 关键约束速查

| 项 | 约束 |
|---|---|
| 模型 | 仅 `MiniMax-H3`(v2)/ `image-01`,`image-01-live`(v1)/ `speech-2.8-hd`(v1) |
| 视频时长 | 4-15 整数秒 |
| 分辨率 | 768P / 2K |
| 参考图 | ≤9(r2va);每镜预算 ≤4 |
| 参考音频 | ≤3 段、每段 2-15s、总 ≤15s |
| 参考视频 | ≤3 个、每个 2-15s、总 ≤15s |
| 文件上传 | 图 ≤30MB / 视频 ≤50MB / 音频 ≤15MB;7 天有效 |
| 任务 | 7 天内可查(list/query) |
| Context-IR | 按 token 计费;黑盒,须意图校验 |
| regeneration | 音轨存在 / 24fps / 32 整除 / 面积≤768×1344 / 帧数∈{107+17k} |
| TTS | ≤10k 字符/请求;无 duration 参数(按字数控制);emotion 9 种 |
| 图片 | n ≤9;seed 近似复现;URL 24h 有效 |
| 错误码 | 1002 限流 / 1004 鉴权 / 1008 余额 / 1026 敏感 / 2013 参数 / 2049 无效 key |

## 定价(实测校准)

- H3 视频:按秒计费(usage.total_seconds);2K 教程估 0.8 元/秒,**768P 待实测**
- 官方定价页确认视频资源包暂不支持 H3 → 按量计费
- TTS:按字符计费(usage_characters)
- Context-IR:按 token 计费(total_tokens)
- 参考音频计费:按 input_seconds

## 已验证(连通性小样 2026-08-03)

- ✅ create → 轮询 → succeeded 全链路(768P/5s/9:16)
- ✅ H3 输出自带音轨(regeneration 前置满足)
- ✅ usage 可读(计费元数据)
- ✅ 规格合规:768x1344 / 24fps / 124 帧(∈{107+17k})/ 有音轨 → regeneration 可提交
