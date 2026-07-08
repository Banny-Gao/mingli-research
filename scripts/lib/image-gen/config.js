/**
 * scripts/lib/image-gen/config.js — T2I / I2I 配置与常量
 *
 * 合并自 t2i/constants.js 与 i2i/constants.js。
 * API 规范约束来自 MiniMax 官方文档。
 */

import { resolveConfig, validateN } from '../env.js'
import {
  VALID_MODELS,
  VALID_ASPECT_RATIOS,
  VALID_RESPONSE_FORMATS,
} from './constants.js'

// ===== API 规范约束 re-export（来自 image-gen/constants.js）=====
export {
  VALID_MODELS,
  VALID_ASPECT_RATIOS,
  VALID_STYLES,
  VALID_RESPONSE_FORMATS,
  IMAGE_DIMENSION,
  STYLE_WEIGHT_RANGE,
  N_RANGE,
  PROMPT_MAX_LENGTH,
} from './constants.js'

// ===== subject_reference 相关（i2i） =====
/**
 * 图片作 "character"（人物主体）参考；其他 type（"object"/"face"/"style" 等）走 i2i 文档
 * Show child attributes 但本页未给出完整枚举（HTML 折叠未展开），保守地只 enum "character"，
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

// ===== T2I Schema（env 命名空间 T2I_*） =====
export const T2I_SCHEMA = {
  baseUrl: { env: 'API_URL', default: 'https://api.minimaxi.com/v1' },
  model: { env: 'T2I_DEFAULT_MODEL', default: VALID_MODELS[0] },
  aspectRatio: { env: 'T2I_DEFAULT_ASPECT_RATIO', default: VALID_ASPECT_RATIOS[0] },
  n: { env: 'T2I_DEFAULT_N', default: 1, validate: validateN },
  styleWeight: { env: 'T2I_DEFAULT_STYLE_WEIGHT', default: 0.8 },
  responseFormat: { env: 'T2I_DEFAULT_RESPONSE_FORMAT', default: VALID_RESPONSE_FORMATS[0] },
  outputDir: { env: 'T2I_DEFAULT_OUTPUT_DIR', default: './public/images' },
  timeoutMs: { env: 'T2I_TIMEOUT_MS', default: 120000 },
  retryMax: { env: 'T2I_RETRY_MAX', default: 3 },
  retryBaseDelayMs: { env: 'T2I_RETRY_BASE_DELAY_MS', default: 1000 },
  presetsFile: { env: 'T2I_PRESETS_FILE', default: 'scripts/lib/image-gen/presets.json' },
}

// ===== I2I Schema（env 命名空间 I2I_*） =====
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
  presetsFile: { env: 'I2I_PRESETS_FILE', default: 'scripts/lib/image-gen/presets.json' },
}

export const t2iConfig = resolveConfig(T2I_SCHEMA)
export const i2iConfig = resolveConfig(I2I_SCHEMA)

// 图生图与文生图共用同一 endpoint（POST {baseUrl}/image_generation）
export const I2I_ENDPOINT = `${t2iConfig.baseUrl}/image_generation`
