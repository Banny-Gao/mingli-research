/**
 * scripts/lib/t2i/constants.js — MiniMax T2I API 规范约束 + 默认配置
 *
 * API 规范约束（不可配置）来自 MiniMax 官方文档。
 * 默认配置通过 resolveConfig(T2I_SCHEMA) 从 env / 默认值解析，与 lib/env.js 共享同一 schema。
 */

import path from 'node:path'
import { resolveConfig, validateN } from '../env.js'

// ===== API 规范约束（不可配置） =====
export const VALID_MODELS = ['image-01', 'image-01-live']
export const VALID_ASPECT_RATIOS = ['1:1', '16:9', '4:3', '3:2', '2:3', '3:4', '9:16', '21:9']
export const VALID_STYLES = ['漫画', '元气', '中世纪', '水彩']
export const VALID_RESPONSE_FORMATS = ['url', 'base64']

export const IMAGE_DIMENSION = { min: 512, max: 2048, step: 8 }
export const STYLE_WEIGHT_RANGE = { min: 0.01, max: 1 }
export const N_RANGE = { min: 1, max: 9 }
export const PROMPT_MAX_LENGTH = 1500

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
  presetsFile: { env: 'T2I_PRESETS_FILE', default: 'scripts/lib/t2i/presets.json' },
}

export const t2iConfig = resolveConfig(T2I_SCHEMA)

export const T2I_ENDPOINT = `${t2iConfig.baseUrl}/image_generation`
