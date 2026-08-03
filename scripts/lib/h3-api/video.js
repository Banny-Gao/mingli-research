/**
 * scripts/lib/h3-api/video.js — MiniMax H3 视频生成封装
 *
 * H3 为异步任务制:POST /v2/video_generation 创建任务 → 轮询 query 任务状态
 * → 成功后下载 content.url。官方文档见 docs/short-drama-create-design.md §2。
 *
 * 模式:
 *   t2va  文生视频(仅文本,ratio 必填且不能 adaptive)
 *   i2va  图生视频(text + first_frame/last_frame 图,ratio 强制 adaptive)
 *   r2va  多模态参考(text + reference_image/video/audio,ratio 默认 adaptive)
 *
 * 注意:reference_* 与 first_frame/last_frame 互斥。
 */

import { callApi, API_BASE_V2 } from './client.js'

/** 校验 duration:4-15 整数秒(API 必填约束) */
function checkDuration(duration) {
  if (!Number.isInteger(duration) || duration < 4 || duration > 15) {
    throw new Error(`❌ duration 必须为 4-15 的整数秒，当前值: ${duration}`)
  }
}

/** 校验 ratio 模式:t2va 必填且不能 adaptive */
function checkRatioForT2va(ratio, hasImages) {
  if (hasImages) return // i2va/r2va:ratio 由输入图决定,可不传
  if (!ratio) throw new Error('❌ t2va 必须传 ratio(且不能为 adaptive)')
  if (ratio === 'adaptive') throw new Error('❌ t2va 不能使用 adaptive ratio')
}

/** 创建视频生成任务(异步,返回 task_id) */
export async function createVideo({ content, resolution = '768P', duration, ratio, model = 'MiniMax-H3', callbackUrl, aigcWatermark = false }) {
  checkDuration(duration)
  const hasImages = content?.some((c) => c.type === 'image_url')
  checkRatioForT2va(ratio, hasImages)
  const body = { model, content, resolution, duration }
  if (ratio) body.ratio = ratio
  if (callbackUrl) body.callback_url = callbackUrl
  if (aigcWatermark) body.aigc_watermark = true
  const data = await callApi(API_BASE_V2, '/video_generation', { body, useH3Key: true })
  if (!data.task_id) throw new Error(`H3 创建任务失败: ${JSON.stringify(data)}`)
  return data.task_id
}

/** 查询视频生成任务状态(7 天内可查) */
export async function queryVideo(taskId) {
  return callApi(API_BASE_V2, `/query/video_generation/${taskId}`, { method: 'GET', retries: 3, useH3Key: true })
}

/** 轮询任务直到 succeeded/failed/cancelled */
export async function waitForVideo(taskId, { pollInterval = 5000, timeoutMs = 600000, onStatus } = {}) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const data = await queryVideo(taskId)
    const task = data.task || {}
    if (onStatus) onStatus(task.status)
    if (task.status === 'succeeded') return task
    if (task.status === 'failed' || task.status === 'cancelled') {
      const err = new Error(`H3 任务 ${task.status}: ${task.error?.message || '未知'}`)
      err.task = task
      throw err
    }
    await new Promise((r) => setTimeout(r, pollInterval))
  }
  throw new Error(`H3 任务轮询超时(${timeoutMs}ms): ${taskId}`)
}

/** 下载已完成视频到本地(拿 content.url) */
export async function downloadVideo(url, outPath) {
  const fs = await import('node:fs')
  const path = await import('node:path')
  fs.mkdirSync(path.dirname(outPath), { recursive: true }) // 确保目录存在,否则下载到不存在的目录静默失败
  const res = await fetch(url)
  if (!res.ok) throw new Error(`H3 下载失败: HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  fs.writeFileSync(outPath, buf)
  return outPath
}

/** 创建 H3-Context-IR 提示词增强任务(返回 task_id,查询后 content.prompt 为增强提示词) */
export async function createContextIr({ content, duration, ratio, model = 'MiniMax-H3', callbackUrl }) {
  checkDuration(duration)
  const hasImages = content?.some((c) => c.type === 'image_url')
  checkRatioForT2va(ratio, hasImages)
  const body = { model, content, duration }
  if (ratio) body.ratio = ratio
  if (callbackUrl) body.callback_url = callbackUrl
  const data = await callApi(API_BASE_V2, '/h3_context_ir', { body, useH3Key: true })
  if (!data.task_id) throw new Error(`Context-IR 创建失败: ${JSON.stringify(data)}`)
  return data.task_id
}

/** 768P → 2K 再生成(须原样提交原始输入 + 最终 prompt) */
export async function createRegeneration({ content, resolution = '2K', model = 'MiniMax-H3', callbackUrl, aigcWatermark = false }) {
  const body = { model, content, resolution }
  if (callbackUrl) body.callback_url = callbackUrl
  if (aigcWatermark) body.aigc_watermark = true
  const data = await callApi(API_BASE_V2, '/video_regeneration', { body, useH3Key: true })
  if (!data.task_id) throw new Error(`Regeneration 创建失败: ${JSON.stringify(data)}`)
  return data.task_id
}

/** 查询任务列表(7 天内,分页) */
export async function listVideos({ pageNum = 1, pageSize = 20, filter = {} } = {}) {
  const params = new URLSearchParams({ page_num: pageNum, page_size: pageSize })
  if (filter.status) params.set('filter.status', filter.status)
  if (filter.task_ids?.length) params.set('filter.task_ids', JSON.stringify(filter.task_ids))
  if (filter.model) params.set('filter.model', filter.model)
  if (filter.task_type) params.set('filter.task_type', filter.task_type)
  return callApi(API_BASE_V2, `/query/video_generation?${params}`, { method: 'GET', useH3Key: true })
}

/** 取消/删除任务(queued→cancelled;succeeded/failed→deleted;running/cancelled 不可操作) */
export async function deleteVideo(taskId) {
  return callApi(API_BASE_V2, `/video_generation/${taskId}`, { method: 'DELETE', useH3Key: true })
}

/** 用 ffmpeg 抽帧(验收/审阅用),返回帧文件路径 */
export async function extractFrames(videoPath, { outDir, count = 3 } = {}) {
  const { execSync } = await import('node:child_process')
  const fs = await import('node:fs')
  const path = await import('node:path')
  const outDirAbs = outDir || path.join(path.dirname(videoPath), 'frames')
  fs.mkdirSync(outDirAbs, { recursive: true })
  const base = path.basename(videoPath, path.extname(videoPath))
  const files = []
  for (let i = 0; i < count; i++) {
    const out = path.join(outDirAbs, `${base}_f${i}.jpg`)
    // 均匀抽帧:先查时长再按比例定位
    try {
      execSync(
        `ffmpeg -y -i "${videoPath}" -vf "select=eq(n\\,${Math.floor(i * 10)})" -vframes 1 -q:v 2 "${out}" 2>/dev/null || ` +
          `ffmpeg -y -ss ${i} -i "${videoPath}" -vframes 1 -q:v 2 "${out}" 2>/dev/null`,
        { shell: '/bin/bash' }
      )
    } catch {
      // 失败则跳过该帧
    }
    if (fs.existsSync(out)) files.push(out)
  }
  return files
}

/** 用 ffprobe 检查视频规格(regeneration 前置:音轨/帧率/宽高/面积/帧数) */
export async function probeVideo(videoPath) {
  const { execSync } = await import('node:child_process')
  const out = execSync(
    `ffprobe -v error -show_entries stream=codec_type,width,height,r_frame_rate,nb_frames -show_entries format=duration -of json "${videoPath}"`,
    { encoding: 'utf-8' }
  )
  const info = JSON.parse(out)
  const vstream = info.streams.find((s) => s.codec_type === 'video')
  const astream = info.streams.find((s) => s.codec_type === 'audio')
  if (!vstream) throw new Error(`无视频流: ${videoPath}`)
  const [num, den] = String(vstream.r_frame_rate || '0/1').split('/').map(Number)
  const frames = Number(vstream.nb_frames) || null
  const duration = Number(info.format?.duration) || 0
  return {
    width: vstream.width,
    height: vstream.height,
    fps: den ? num / den : 0,
    frames,
    framesEst: frames ?? (duration && den ? Math.round(duration * num / den) : null), // 估算帧数(兜底)
    duration,
    hasAudio: !!astream,
  }
}
