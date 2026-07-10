/**
 * scripts/lib/image-gen/profile.js — ImageGenProfile 策略对象
 *
 * 每个 mode（t2i / i2i）一个 profile 实例，差异由以下 hook 表达：
 *   - applyRequestExtras(body, opts): 在共享 buildRequestBody 末尾追加业务字段
 *   - applyValidateExtras(errors, opts): 在共享 validateCommon 后追加业务校验
 *   - buildMetadataExtras(opts, extra): 在 saveMetadata 中注入业务字段
 *   - textOverlayPromptSuffix(opts): 在 buildRequestBody 之前追加业务提示
 *     （i2i: 反字提示；t2i: no-op）
 *   - validateRerenderMeta / resolveRerenderBgPath: rerender 钩子
 *
 * inputImage 解析（makeSubjectReference）由 image-gen.js 直接调用，
 * 不经过 profile 中转。
 */

import fs from 'node:fs'
import path from 'node:path'
import { t2iConfig, i2iConfig, VALID_SUBJECT_TYPES } from './config.js'

/**
 * i2i 反字提示：自动追加在 prompt 末尾，告诉 image-01 不要在图中烧字。
 * 文字将由 canvas 叠加，避免双层叠字。
 */
const TEXT_BLOCK_NEGATIVE_HINT =
  '。注意：图中不要出现任何文字、字符、标题、字样、印章、签名；所有文字将由后续处理叠加。'

/**
 * 同步版 inputImage fast-fail（applyValidateExtras 必须是同步函数）：
 * 仅检查"路径是否存在"。完整校验（大小 / MIME / sha256）由 caller 在
 * executeRequest 时 makeSubjectReference 内部完成，那里会抛同样的错。
 *
 * 路径不存在时立即抛错，让用户提前看到错误而不必等到 API 调用前。
 */
function quickCheckInputImage(inputImage) {
  if (!inputImage || /^https?:\/\//i.test(inputImage)) return
  const absPath = path.resolve(inputImage)
  if (!fs.existsSync(absPath)) {
    throw new Error(`❌ 输入图不存在: ${absPath}`)
  }
}

// ===== T2I Profile =====

/** @type {import('./profile.js').ImageGenProfile} */
export const T2I_PROFILE = {
  mode: 't2i',
  metadataType: 't2i',
  filenamePrefix: 't2i',
  defaultModel: t2iConfig.model,
  defaultOutputDir: t2iConfig.outputDir,
  presetsFile: t2iConfig.presetsFile,
  timeoutMs: t2iConfig.timeoutMs,
  retryMax: t2iConfig.retryMax,
  retryBaseDelayMs: t2iConfig.retryBaseDelayMs,

  // t2i 是"父"逻辑：所有 hook 默认无操作
  applyRequestExtras: (body, _opts) => body,
  applyValidateExtras: (_errors, _opts) => {},
  buildMetadataExtras: (_opts, _extra) => ({}),
  textOverlayPromptSuffix: _opts => '',

  // rerender 钩子
  validateRerenderMeta: meta => {
    if (meta.type && meta.type !== 't2i') {
      return `❌ metadata.type="${meta.type}"，不是 t2i metadata；请用 scripts/${meta.type}.js --rerender 处理`
    }
    return null
  },
  resolveRerenderBgPath: (meta, metaPath) => {
    // backgroundPath 在 --save-background 副本下是相对路径（相对 metaPath 所在目录），
    // 在 --reuse-background 下是绝对路径（用户传入的源图）。path.join 不会去除前缀，
    // 所以绝对路径必须直传，否则会被重复拼成 "<dir>/<abs path>"。
    const joinOrPass = relOrAbs =>
      path.isAbsolute(relOrAbs) ? relOrAbs : path.join(path.dirname(metaPath), relOrAbs)
    return meta.backgroundPath
      ? joinOrPass(meta.backgroundPath)
      : path.join(path.dirname(metaPath), meta.results[0]?.filename)
  },
}

// ===== I2I Profile =====

/**
 * I2I 专属校验（同步）：inputImage 必填 / reuseBackground 路径存在 / subjectType 白名单。
 *
 * subjectType 白名单直接读顶层 import 的 VALID_SUBJECT_TYPES（无循环风险：
 * i2i/constants.js 中 VALID_SUBJECT_TYPES 是字面量，不依赖 image-gen 运行期值）。
 *
 * inputImage 路径存在性 + MIME 校验由 caller 在 executeRequest 时
 * makeSubjectReference 完成；这里只做 fast-fail（路径不存在立即报错）。
 */
function i2iApplyValidateExtras(errors, opts) {
  const inputImage = opts.inputImage
  const reuseBackground = opts.reuseBackground
  if (!inputImage && !reuseBackground) {
    errors.push('❌ 必须提供 --input-image 或 --reuse-background <path>')
  }
  // 复用背景的路径存在性（同步）
  if (reuseBackground && !fs.existsSync(reuseBackground)) {
    errors.push(`❌ --reuse-background 路径不存在: ${path.resolve(reuseBackground)}`)
  }
  // inputImage 快速路径校验（仅 fast-fail，不替代完整 resolveInputImage）
  if (inputImage) {
    try {
      quickCheckInputImage(inputImage)
    } catch (err) {
      errors.push(err.message)
    }
  }
  if (
    opts.subjectType &&
    !VALID_SUBJECT_TYPES.includes(opts.subjectType) &&
    process.env.I2I_ALLOW_UNKNOWN_SUBJECT_TYPE !== '1'
  ) {
    errors.push(
      `❌ 不支持的 subject-type: "${opts.subjectType}"（合法值: ${VALID_SUBJECT_TYPES.join(', ')}）。\n` +
        `   若服务端确实支持其他类型，请设置环境变量 I2I_ALLOW_UNKNOWN_SUBJECT_TYPE=1 跳过此校验。`
    )
  }
}

/** @type {import('./profile.js').ImageGenProfile} */
export const I2I_PROFILE = {
  mode: 'i2i',
  metadataType: 'i2i',
  filenamePrefix: 'i2i',
  defaultModel: i2iConfig.model,
  defaultOutputDir: i2iConfig.outputDir,
  presetsFile: i2iConfig.presetsFile,
  timeoutMs: i2iConfig.timeoutMs,
  retryMax: i2iConfig.retryMax,
  retryBaseDelayMs: i2iConfig.retryBaseDelayMs,

  /**
   * 注入 subject_reference[]。调用方必须在 opts.subjectReference 注入后传入
   * （由 resolveInputAsset 或 caller 提前 makeSubjectReference 完成）。
   */
  applyRequestExtras: (body, opts) => {
    if (!opts.subjectReference) {
      throw new Error(
        `❌ buildRequestBody 调用方必须提供 opts.subjectReference（来自 makeSubjectReference）`
      )
    }
    body.subject_reference = [opts.subjectReference]
    return body
  },

  /**
   * 同步追加 i2i 专属校验。
   */
  applyValidateExtras: i2iApplyValidateExtras,

  /**
   * saveMetadata 注入 inputImage / bgAnalysis。
   */
  buildMetadataExtras: (_opts, extra) => ({
    inputImage: extra.inputMeta
      ? {
          absPath: extra.inputMeta.absPath,
          mime: extra.inputMeta.mime,
          size: extra.inputMeta.size,
          sha256: extra.inputMeta.sha256,
          isUrl: extra.inputMeta.isUrl,
        }
      : null,
    subjectType: _opts.subjectType || 'character',
    bgAnalysis: extra.bgInfo
      ? {
          width: extra.bgInfo.width,
          height: extra.bgInfo.height,
          mainRect: extra.bgInfo.mainRect,
          dominantColor: extra.bgInfo.dominantColor,
        }
      : null,
  }),

  /**
   * i2i 在 textOverlay 启用时自动追加反字提示。
   */
  textOverlayPromptSuffix: opts => {
    const useTextOverlay = opts.textOverlay !== false
    const userPrompt = opts.prompt || ''
    if (
      useTextOverlay &&
      !userPrompt.includes('不要在图中') &&
      !userPrompt.includes(TEXT_BLOCK_NEGATIVE_HINT)
    ) {
      return TEXT_BLOCK_NEGATIVE_HINT
    }
    return ''
  },

  // rerender 钩子
  validateRerenderMeta: meta => {
    if (meta.type !== 'i2i') {
      return `❌ metadata.type="${meta.type}"，不是 i2i metadata，拒绝处理`
    }
    return null
  },
  resolveRerenderBgPath: (meta, metaPath) => {
    // 底图优先级：1) inputImage.absPath  2) backgroundPath  3) results[0].filename
    // backgroundPath 在 --reuse-background 下是绝对路径，直接传；相对路径才需要 join。
    const joinOrPass = relOrAbs =>
      path.isAbsolute(relOrAbs) ? relOrAbs : path.join(path.dirname(metaPath), relOrAbs)
    const candidates = [
      meta.inputImage?.absPath,
      meta.backgroundPath && joinOrPass(meta.backgroundPath),
      meta.results[0]?.filename && path.join(path.dirname(metaPath), meta.results[0].filename),
    ].filter(Boolean)
    return candidates.find(p => fs.existsSync(p)) || null
  },
}

// 给 image-gen 内部 hooks 一些 internal helper（仅供 execute.js / cli-shared.js 调）
export { TEXT_BLOCK_NEGATIVE_HINT }
