/**
 * scripts/lib/h3-api/speech.js — MiniMax 语音合成封装(speech-2.8-hd 等)
 *
 * 用于:
 *   - 声音锚(角色"标志性台词集"音频,固定 voice_id,按情绪分档)
 *   - B 轨对白(每镜台词 TTS 合成确定性音频,固定 voice_id)
 *
 * 同步接口 ≤10k 字符;无 duration 参数,时长由文本长度决定。
 * 参考:docs/short-drama-create-design.md §2、ADR 0002
 */

import { callApi, API_BASE_V1 } from './client.js'

/**
 * 语音合成(TTS)。
 * @param {object} opts {
 *   text, model='speech-2.8-hd', voice, speed=1.0, vol=1.0, pitch=0,
 *   emotion, outputFormat='hex'|'url', format='mp3', sampleRate=32000,
 *   bitrate=128000, channel=1, subtitleEnable=false, aigcWatermark=false
 * }
 * @returns {Promise<{audio: string, extraInfo, usageCharacters}>}
 */
export async function synthesize({ text, model = 'speech-2.8-hd', voice, speed = 1.0, vol = 1.0, pitch = 0, emotion, outputFormat = 'url', format = 'mp3', sampleRate = 32000, bitrate = 128000, channel = 1, subtitleEnable = false, aigcWatermark = false }) {
  const body = {
    model,
    text,
    voice_setting: {
      voice_id: voice || 'moss_audio_ce44fc67-7ce3-11f0-8de5-96e35d26fb85', // 中文示例音色
      speed,
      vol,
      pitch,
      ...(emotion ? { emotion } : {}),
    },
    audio_setting: { sample_rate: sampleRate, bitrate, format, channel },
    ...(outputFormat === 'url' ? { output_format: 'url' } : {}),
    ...(subtitleEnable ? { subtitle_enable: true, subtitle_type: 'sentence' } : {}),
    ...(aigcWatermark ? { aigc_watermark: true } : {}),
  }

  const data = await callApi(API_BASE_V1, '/t2a_v2', { body })
  if (data.base_resp?.status_code !== 0) {
    throw new Error(`TTS 失败: ${data.base_resp?.status_msg || JSON.stringify(data)}`)
  }
  return {
    audio: data.data?.audio || '',
    subtitleFile: data.data?.subtitle_file,
    extraInfo: data.extra_info || {},
    usageCharacters: data.extra_info?.usage_characters,
  }
}

/** 下载音频(URL 输出)到本地 */
export async function downloadAudio(url, outPath) {
  const fs = await import('node:fs')
  const path = await import('node:path')
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  const res = await fetch(url)
  if (!res.ok) throw new Error(`音频下载失败: HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  fs.writeFileSync(outPath, buf)
  return outPath
}
