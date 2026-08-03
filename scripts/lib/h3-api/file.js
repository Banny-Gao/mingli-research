/**
 * scripts/lib/h3-api/file.js — MiniMax 文件管理封装(上传 → mm_file:// 引用)
 *
 * 上传素材到平台,返回 file_id,生成请求 content 中用 mm_file://{file_id} 引用。
 * 有效期 7 天,过期需重新上传(前置校验中检测)。
 * 规格:图≤30MB / 视频≤50MB / 音频≤15MB。
 *
 * 参考:docs/short-drama-create-design.md §2
 */

import { getApiKey } from './client.js'

/**
 * 上传文件到 MiniMax 存储。
 * @param {object} opts { filePath, purpose='video_generation_input' }
 * @returns {Promise<{fileId, bytes, filename, purpose}>}
 */
export async function uploadFile({ filePath, purpose = 'video_generation_input' }) {
  const fs = await import('node:fs')
  const path = await import('node:path')

  if (!fs.existsSync(filePath)) {
    throw new Error(`文件不存在: ${filePath}`)
  }

  const blob = new Blob([fs.readFileSync(filePath)])
  const form = new FormData()
  form.append('purpose', purpose)
  form.append('file', blob, path.basename(filePath))

  const res = await fetch('https://api.minimaxi.com/v1/files/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${getApiKey()}` },
    body: form,
  })

  if (!res.ok) {
    throw new Error(`文件上传失败: HTTP ${res.status}: ${await res.text()}`)
  }
  const data = await res.json()
  if (data.base_resp?.status_code !== 0) {
    throw new Error(`文件上传失败: ${data.base_resp?.status_msg || JSON.stringify(data)}`)
  }
  return {
    fileId: data.file?.file_id,
    bytes: data.file?.bytes,
    filename: data.file?.filename,
    purpose: data.file?.purpose,
  }
}

/** 生成 mm_file:// 引用 */
export function toMmFile(fileId) {
  return `mm_file://${fileId}`
}
