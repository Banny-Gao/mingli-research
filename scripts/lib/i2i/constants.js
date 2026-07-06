/**
 * scripts/lib/i2i/constants.js — MiniMax I2I（图生图）API 规范约束 + 默认配置
 *
 * API 文档：https://platform.minimaxi.com/docs/api-reference/image-generation-i2i
 *
 * 图生图与文生图同端点（POST ${baseUrl}/image_generation），差异仅为多一个 subject_reference[] 字段。
 * 因此 endpoint 复用 t2iConfig.baseUrl，仅 subjectType I2I_SCHEMA 独立 env 命名空间。
 */

import path from 'node:path'
import { resolveConfig, validateN } from '../env.js'
import { t2iConfig } from '../t2i/constants.js'

// ===== API 规范约束（不可配置，与 t2i 一致） =====
export const VALID_MODELS = ['image-01', 'image-01-live']
export const VALID_ASPECT_RATIOS = ['1:1', '16:9', '4:3', '3:2', '2:3', '3:4', '9:16', '21:9']
export const VALID_STYLES = ['漫画', '元气', '中世纪', '水彩']
export const VALID_RESPONSE_FORMATS = ['url', 'base64']

export const IMAGE_DIMENSION = { min: 512, max: 2048, step: 8 }
export const STYLE_WEIGHT_RANGE = { min: 0.01, max: 1 }
export const N_RANGE = { min: 1, max: 9 }
export const PROMPT_MAX_LENGTH = 1500

// ===== subject_reference 相关 =====
/**
 * 图片作 "character"（人物主体）参考；其他 type（"object"/"face"/"style" 等）走 i2i 文档 Show child attributes
 * 但本页未给出完整枚举（HTML 折叠未展开），保守地只 enum "character"，
 * 其他可由 --subject-type <string> 手动覆盖。
 */
export const VALID_SUBJECT_TYPES = ['character']
export const SUBJECT_REFERENCE_DEFAULT_TYPE = 'character'

// 输入图约束（保守值；i2i 文档未给出 image_file 大小/MIME 上限，按 LLM/视觉模型常用上限设）
export const INPUT_IMAGE_MAX_BYTES = 10 * 1024 * 1024 // 10MB
export const INPUT_IMAGE_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/jpg',
])

// ===== I2I schema（env 命名空间 I2I_*） =====
export const I2I_SCHEMA = {
  model: { env: 'I2I_DEFAULT_MODEL', default: VALID_MODELS[0] },
  aspectRatio: { env: 'I2I_DEFAULT_ASPECT_RATIO', default: VALID_ASPECT_RATIOS[0] },
  n: { env: 'I2I_DEFAULT_N', default: 1, validate: validateN },
  styleWeight: { env: 'I2I_DEFAULT_STYLE_WEIGHT', default: 0.8 },
  responseFormat: { env: 'I2I_DEFAULT_RESPONSE_FORMAT', default: VALID_RESPONSE_FORMATS[0] },
  outputDir: { env: 'I2I_DEFAULT_OUTPUT_DIR', default: './public/images' },
  timeoutMs: { env: 'I2I_TIMEOUT_MS', default: 120000 },
  retryMax: { env: 'I2I_RETRY_MAX', default: 3 },
  retryBaseDelayMs: { env: 'I2I_RETRY_BASE_DELAY_MS', default: 1000 },
  presetsFile: { env: 'I2I_PRESETS_FILE', default: 'scripts/lib/i2i/presets.json' },
}

export const i2iConfig = resolveConfig(I2I_SCHEMA)

// 图生图与文生图共用同一 endpoint（POST {baseUrl}/image_generation）
export const I2I_ENDPOINT = `${t2iConfig.baseUrl}/image_generation`
