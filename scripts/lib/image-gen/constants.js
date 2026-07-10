/**
 * scripts/lib/image-gen/constants.js — 共享 API 规范约束
 *
 * t2i 与 i2i 共享的 API 规范（来自 MiniMax 官方文档）上移至此。
 * 各自的 SCHEMA（env 命名空间 + 默认配置）仍保留在 t2i/constants.js 与 i2i/constants.js。
 */

export const VALID_MODELS = ['image-01', 'image-01-live']
export const VALID_ASPECT_RATIOS = ['1:1', '16:9', '4:3', '3:2', '2:3', '3:4', '9:16', '21:9']
export const VALID_STYLES = ['漫画', '元气', '中世纪', '水彩']
export const VALID_RESPONSE_FORMATS = ['url', 'base64']

export const IMAGE_DIMENSION = { min: 512, max: 2048, step: 8 }
export const STYLE_WEIGHT_RANGE = { min: 0.01, max: 1 }
export const N_RANGE = { min: 1, max: 9 }
export const PROMPT_MAX_LENGTH = 1500

// 图生图与文生图共用同一 endpoint（POST {baseUrl}/image_generation）
// baseUrl 由 t2iConfig 提供（共享 env：API_URL）
export const IMAGE_GEN_ENDPOINT_SUFFIX = '/image_generation'
