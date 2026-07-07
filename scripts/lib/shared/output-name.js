/**
 * scripts/lib/shared/output-name.js — 输出文件名校验 + 冲突检测 + 解析
 *
 * 供 t2i/i2i 的 cli.js / downloader.js / 入口脚本共用。
 */

import fs from 'node:fs'
import path from 'node:path'
import { parsePrompts } from './parse-prompts.js'

/** 最大长度（保护文件系统，避免崩溃） */
export const MAX_NAME_LENGTH = 100

/** 禁止字符：路径分隔符 + Windows 保留字符 + ASCII 控制字符（含 \0 \n \r \t） */
export const FORBIDDEN_CHARS = /[\/\\:*?"<>|\x00-\x1f]/

/**
 * 校验名字合法性。
 * @param {string} name
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateName(name) {
  if (typeof name !== 'string') {
    return { valid: false, error: '名字必须为字符串' }
  }
  if (!name.trim()) {
    return { valid: false, error: '名字不能为空' }
  }
  if (name.length > MAX_NAME_LENGTH) {
    return { valid: false, error: `名字长度 ${name.length} 超过最大 ${MAX_NAME_LENGTH} 字符` }
  }
  const match = name.match(FORBIDDEN_CHARS)
  if (match) {
    const code = match[0].charCodeAt(0)
    const isControl = code < 0x20
    const desc = isControl ? `控制字符 \\u${code.toString(16).padStart(4, '0')}` : `"${match[0]}"`
    return { valid: false, error: `名字包含非法字符 ${desc}（禁止 / \\ : * ? " < > | 控制字符）` }
  }
  return { valid: true }
}

/**
 * 转义正则元字符，用于构造动态正则。
 * @param {string} s
 * @returns {string}
 */
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 在 outputDir 中扫描已有文件，若 baseName 冲突则追加 -N 后缀。
 *
 * 算法：
 * - 匹配 `<safeBase>.<ext>` / `<safeBase>-NN.<ext>` / `<safeBase>-M-NN.<ext>`
 *   三种图片类形态（包含无尾随索引的探测文件）
 * - 与 `<safeBase>-metadata.json` / `<safeBase>-M-metadata.json` 配套元数据
 * - 提取最大 M；任何形态匹配都算冲突
 * - metadata.json 单独存在也算冲突
 *
 * @param {string} outputDir
 * @param {string} baseName
 * @param {string} ext - 不含点的扩展名（png / json）
 * @returns {string} 不冲突的唯一名字（不含扩展名）
 */
export function resolveUniqueName(outputDir, baseName, ext) {
  if (typeof baseName !== 'string' || !baseName.trim()) return baseName
  if (!fs.existsSync(outputDir)) return baseName

  const safeBase = escapeRegex(baseName)
  // 匹配两种大类（带/不带数字后缀 × png/json）：
  //   1) png:   `<safeBase>(-\d+)?-\d{2}.png`    — 含 writeUniqueFile 抢到的 `<safeBase>.png`
  //   2) json:  `<safeBase>(-\d+)?-metadata.json` — 元数据
  const pattern = new RegExp(
    `^${safeBase}(?:-(\\d+))?(?:\\.${escapeRegex(ext)}|-\\d{2}\\.${escapeRegex(ext)}|-metadata\\.json)$`
  )

  const files = fs.readdirSync(outputDir)
  let maxSuffix = 0
  let hasConflict = false
  const metadataName = `${baseName}-metadata.json`
  for (const f of files) {
    if (f === metadataName) {
      // metadata.json 单独存在也算冲突（避免 base-metadata.json 与新 base-01.png 同 base 共存）
      hasConflict = true
      continue
    }
    const m = f.match(pattern)
    if (m) {
      hasConflict = true
      const n = m[1] ? parseInt(m[1], 10) : 0
      if (n > maxSuffix) maxSuffix = n
    }
  }

  if (!hasConflict) return baseName
  return `${baseName}-${maxSuffix + 1}`
}

/**
 * 批量模式下解析 --name：返回与 prompts 一一对应的 names 数组。
 *
 * 行为：
 * - 未传 --name → 返回 null（调用方回退 timestamp）
 * - 单个 name → 全部用此前缀
 * - 数量与 prompts 一致 → 一一对应
 * - 数量不匹配 → 警告后返回 null（**同时清空 opts.name**，
 *   使 executeRequest 回退到 timestamp 命名；避免警告与实际行为不一致）
 *
 * 注意：本函数会修改传入的 opts 对象（清空 name 字段）以确保调用方行为
 * 与警告消息一致。
 *
 * @param {{ name?: string, prompts?: string[], names?: string[]|null }} opts
 * @returns {string[] | null}
 */
export function parseBatchName(opts) {
  if (!opts.prompts || !opts.name) return null
  const names = parsePrompts(opts.name)
  if (names.length === 1) {
    return new Array(opts.prompts.length).fill(names[0])
  }
  if (names.length === opts.prompts.length) {
    return names
  }
  console.warn(
    `⚠️ --name 数量 (${names.length}) 与 --prompts 数量 (${opts.prompts.length}) 不匹配，回退默认 timestamp`
  )
  // 同时清空 opts.name：确保调用方（如 resolveRequestName）实际使用 timestamp，
  // 而不是把字面字符串 "a,b,c" 用作所有 prompt 的基名。
  opts.name = undefined
  opts.names = null
  return null
}

/**
 * 解析单个请求的最终输出基名（含冲突检测）。
 *
 * 调用方传入完整 opts（opts.name 单值 / opts._resolvedNames 批量预解析数组）和 outputDir，
 * 返回已经过冲突检测、唯一化的基名（null 表示用默认 timestamp）。
 *
 * 注意：批量模式下各 worker 并发调用此函数存在 race（readdir 后到写文件前
 * 可能被其他 worker 抢先写入）。批量 worker 应由 caller 在调用 executeRequest **之前**
 * 串行解析好所有 name（见 resolveBatchNames），或在写入失败时重试。
 *
 * @param {{ name?: string|null, _resolvedNames?: string[]|null, _resolvedIndex?: number }} opts
 * @param {string} outputDir
 * @returns {string|null}
 */
export function resolveRequestName(opts, outputDir) {
  let name = opts.name || null
  if (Array.isArray(opts._resolvedNames) && opts._resolvedNames.length > 0) {
    const idx = opts._resolvedIndex || 0
    name = opts._resolvedNames[idx] || null
  }
  if (!name) return null
  const unique = resolveUniqueName(outputDir, name, 'png')
  if (unique !== name) {
    console.log(`   🔄 名称冲突，自动追加后缀: ${name} → ${unique}`)
  }
  return unique
}

/**
 * 批量场景专用：串行解析 N 个 name，**部分缓解** readdir 互不冲突时的探测竞态。
 *
 * 当各 baseName 互不相同（本函数典型场景）时，串行 readdir 能保证各 name 独立
 * 递增正确。若 baseNames 有重复（如 --name "x" + --prompts 3 个），本函数只能给
 * 第一个 unique 值；后续重复项由调用方的 writeUniqueFile 用 O_EXCL 探测 + 递增
 * 兜底（importer 在 downloader.saveMetadata 内已用 writeUniqueFile 写元数据；
 * 图片本体由 downloadImage/writeBase64 直接 fs.writeFileSync 完成，未走探测层，
 * 重复基名批量并发图片写盘仍可能"最后写赢"，属已知限制，spec 已记）。
 *
 * 本函数返回与 prompts 一一对应的 names 数组。
 *
 * @param {{ prompts: string[], names?: string[]|null }} opts
 * @param {string} outputDir
 * @returns {string[] | null} 与 prompts 等长的 names 数组，null 表示全部用 timestamp
 */
/**
 * 在 outputDir 中单次 readdir 后批量解析 N 个 baseName。
 *
 * 单 readdir 合并所有基名匹配；与逐个 readdir 等价——本函数调用时尚无任何
 * 新文件写入（这是 executeRequest 前的预解析），所以 N 次 readdir 看到的
 * 是同一份状态。合并后从 N 次 syscall 降到 1 次。
 *
 * 注意：本函数对重复 baseName 只能给第一个 unique 值；后续重复项由
 * writeUniqueFile 用 O_EXCL 探测 + 递增兜底。
 *
 * @param {string} outputDir
 * @param {string[]} baseNames
 * @returns {string[]}
 */
function resolveUniqueNamesBatch(outputDir, baseNames) {
  if (!fs.existsSync(outputDir)) return baseNames.slice()
  const files = fs.readdirSync(outputDir)
  // 为每个 baseName 跟踪 maxSuffix 与 hasConflict；regex 也预编译一次避免
  // 循环内重复构造（resolveUniqueName 走的是同一种 regex 模式）。
  const states = baseNames.map(b => ({
    base: b,
    pattern: new RegExp(`^${escapeRegex(b)}(?:-(\\d+))?\\.png$`),
    metadataName: `${b}-metadata.json`,
    maxSuffix: 0,
    hasConflict: false,
  }))
  for (const f of files) {
    for (const s of states) {
      if (f === s.metadataName) {
        s.hasConflict = true
      } else {
        const m = f.match(s.pattern)
        if (m) {
          s.hasConflict = true
          const n = m[1] ? parseInt(m[1], 10) : 0
          if (n > s.maxSuffix) s.maxSuffix = n
        }
      }
    }
  }
  return states.map(s => (s.hasConflict ? `${s.base}-${s.maxSuffix + 1}` : s.base))
}

/**
 * 批量场景专用：解析 N 个 prompt 对应的输出基名。
 *
 * 当各 baseName 互不相同（本函数典型场景）时，能保证各 name 独立递增正确。
 * 若 baseNames 有重复（如 --name "x" + --prompts 3 个），本函数只能给第一个
 * unique 值；后续重复项由调用方的 writeUniqueFile 用 O_EXCL 探测 + 递增
 * 兜底（importer 在 downloader.saveMetadata 内已用 writeUniqueFile 写元数据；
 * 图片本体由 downloadImage/writeBase64 直接 fs.writeFileSync 完成，未走探测层，
 * 重复基名批量并发图片写盘仍可能"最后写赢"，属已知限制，spec 已记）。
 *
 * 本函数返回与 prompts 一一对应的 names 数组。
 *
 * @param {{ prompts: string[], names?: string[]|null }} opts
 * @param {string} outputDir
 * @returns {string[] | null} 与 prompts 等长的 names 数组，null 表示全部用 timestamp
 */
export function resolveBatchNames(opts, outputDir) {
  if (!opts.prompts) return null
  const baseNames = opts.names && opts.names.length === opts.prompts.length ? opts.names : null
  if (!baseNames) return null
  return resolveUniqueNamesBatch(outputDir, baseNames)
}

/** 写入层冲突重试上限 */
export const MAX_WRITE_RETRIES = 50

/** 交互模式询问 name 时的最大重试次数；超过后回退 null（用 timestamp） */
export const MAX_NAME_PROMPT_ATTEMPTS = 3

/**
 * 原子写入：先探测目标文件是否已存在（O_EXCL），存在则按线性递增后缀并重试，
 * 不存在则用 fd 直接写，无需中间 .tmp。
 *
 * 解决了批量模式下并发 worker 写入同一 baseName 时"最后写赢"的竞态：
 * 即使 N 个 worker 同时调用本函数，每个都会拿到唯一的目标文件。
 *
 * 实现要点：
 * - 用 `fs.openSync(path, 'wx')` 探测 + 直接拿到 fd 写入——不必先创建再 unlink
 *   探测用的临时文件，避开"close → unlink → reopen"窗口中其他进程读到空文件的脏状态。
 * - attempt=0 用原 baseName；>=1 时线性递增（candidate-1 / candidate-2 / ...），
 *   不依赖 resolveUniqueName 的 regex（regex 无法覆盖 -bg.png 这类自定义后缀）。
 * - 单次失败无须文件改名，O_EXCL 本身就是原子探测。
 *
 * @param {string} outputDir
 * @param {string} baseName - 不含扩展名的基名（已通过 validateName 校验过）
 * @param {string} ext - 含点的扩展名（.png / -bg.png / -metadata.json）
 * @param {string|Buffer} content - 文件内容
 * @returns {{ filepath: string, finalBase: string }} 实际写入的文件路径与最终基名
 */
export function writeUniqueFile(outputDir, baseName, ext, content) {
  const buf = typeof content === 'string' ? Buffer.from(content, 'utf-8') : content
  for (let attempt = 0; attempt < MAX_WRITE_RETRIES; attempt++) {
    // attempt=0 用原 baseName；>=1 时线性递增 (baseName-1 / baseName-2 / ...)
    const candidate = attempt === 0 ? baseName : `${baseName}-${attempt}`
    const filename = `${candidate}${ext}`
    const filepath = path.join(outputDir, filename)

    // O_EXCL 原子探测：拿到 fd 直接写，没有 .tmp 探针文件生存窗口。
    let fd
    try {
      fd = fs.openSync(filepath, 'wx')
    } catch (err) {
      if (err.code === 'EEXIST') {
        // 目标文件已存在 → 下一轮继续递增
        continue
      }
      throw err
    }

    try {
      fs.writeSync(fd, buf)
    } finally {
      fs.closeSync(fd)
    }
    return { filepath, finalBase: candidate }
  }
  throw new Error(
    `写入失败：${baseName}${ext} 在 ${outputDir} 中经过 ${MAX_WRITE_RETRIES} 次重试仍冲突`
  )
}
