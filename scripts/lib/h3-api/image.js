/**
 * scripts/lib/h3-api/image.js — MiniMax 图像生成封装(image-01 / image-01-live)
 *
 * t2i:  POST /v1/image_generation
 * i2i:  同端点,带 subject_reference(type=character,锁角色一致性)
 *
 * 参考:docs/short-drama-create-design.md §2
 */

import { callApi, API_BASE_V1 } from './client.js'

/**
 * 文生图(t2i)。
 * @param {object} opts { prompt, model='image-01', aspectRatio='9:16', n=1, seed, promptOptimizer, aigcWatermark }
 * @returns {Promise<{imageUrls: string[], imageBase64: string[], metadata}>}
 */
export async function generateImage({ prompt, model = 'image-01', aspectRatio = '9:16', width, height, n = 1, seed, promptOptimizer = false, aigcWatermark = false, responseFormat = 'url' }) {
  const body = { model, prompt, aspect_ratio: aspectRatio, n, response_format: responseFormat }
  if (width && height) {
    body.width = width
    body.height = height
  }
  if (seed !== undefined) body.seed = seed
  if (promptOptimizer) body.prompt_optimizer = true
  if (aigcWatermark) body.aigc_watermark = true
  const data = await callApi(API_BASE_V1, '/image_generation', { body })
  if (data.base_resp?.status_code !== 0) {
    throw new Error(`image 失败: ${data.base_resp?.status_msg || JSON.stringify(data)}`)
  }
  return {
    imageUrls: data.data?.image_urls || [],
    imageBase64: data.data?.image_base64 || [],
    metadata: data.metadata,
  }
}

/**
 * 图生图(i2i,带角色参考)。image_file 支持本地路径或 URL,本地自动 base64。
 * @param {object} opts { prompt, subjectRef: {imageFile, type='character'}, ... }
 */
export async function generateImageI2I({ prompt, subjectRef, model = 'image-01', aspectRatio = '9:16', width, height, n = 1, seed, promptOptimizer = false, aigcWatermark = false, responseFormat = 'url' }) {
  const body = { model, prompt, aspect_ratio: aspectRatio, n, response_format: responseFormat }
  if (width && height) {
    body.width = width
    body.height = height
  }
  if (seed !== undefined) body.seed = seed
  if (promptOptimizer) body.prompt_optimizer = true
  if (aigcWatermark) body.aigc_watermark = true

  if (subjectRef) {
    const { imageFile, type = 'character' } = subjectRef
    let image_file = imageFile
    if (!/^https?:\/\//.test(imageFile) && !imageFile.startsWith('data:')) {
      // 本地文件 → base64
      const fs = await import('node:fs')
      const ext = imageFile.split('.').pop().toLowerCase()
      const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg'
      image_file = `data:${mime};base64,${fs.readFileSync(imageFile).toString('base64')}`
    }
    body.subject_reference = [{ type, image_file }]
  }

  const data = await callApi(API_BASE_V1, '/image_generation', { body })
  if (data.base_resp?.status_code !== 0) {
    throw new Error(`i2i 失败: ${data.base_resp?.status_msg || JSON.stringify(data)}`)
  }
  return {
    imageUrls: data.data?.image_urls || [],
    imageBase64: data.data?.image_base64 || [],
    metadata: data.metadata,
  }
}
