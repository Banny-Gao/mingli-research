/**
 * scripts/lib/h3-api/index.js — H3 原生 HTTP 统一导出
 *
 * 短剧 skill(short-drama-create)的 MiniMax 调用统一从这里引入。
 * 见 docs/short-drama-create-design.md §4、docs/adr/0001。
 *
 * 用法:
 *   import { createVideo, waitForVideo } from './lib/h3-api/index.js'
 */

export * from './client.js'
export * from './video.js'
export * from './image.js'
export * from './speech.js'
export * from './file.js'
