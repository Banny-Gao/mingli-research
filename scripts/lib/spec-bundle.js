/**
 * scripts/lib/spec-bundle.js — 5 份规范装订
 *
 * 输入：书 slug + 篇章名 + 项目根路径
 * 输出：{ specInterpretation, general, shuSpecial, catalog, sourceText }
 */

import fs from 'node:fs'
import path from 'node:path'

const SHU_TO_SPECIAL = {
  命: 'bazi.md',
  // 卜 / 山 / 医 / 相 → v2 待
}

function readOrThrow(filePath, label) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`缺少 ${label}：${filePath}`)
  }
  return fs.readFileSync(filePath, 'utf-8')
}

/**
 * @param {string} slug
 * @param {string} chapter
 * @param {{projectRoot: string}} opts
 * @returns {{specInterpretation: string, general: string, shuSpecial: string, catalog: string, sourceText: string}}
 */
export function loadSpecBundle(slug, chapter, { projectRoot }) {
  const specInterpretation = readOrThrow(
    path.join(projectRoot, 'research-dispute/SPEC-interpretation.md'),
    'SPEC-interpretation.md'
  )
  const general = readOrThrow(
    path.join(projectRoot, 'research-dispute/general.md'),
    'general.md'
  )
  const catalog = readOrThrow(
    path.join(projectRoot, `books/${slug}/catalog.md`),
    `books/${slug}/catalog.md`
  )

  // 解析 catalog.md blockquote 的"术数"字段
  const shuMatch = catalog.match(/^>\s*术数[：:]\s*(\S+)/m)
  const shu = shuMatch ? shuMatch[1] : null
  const specialFile = shu ? SHU_TO_SPECIAL[shu] : null
  if (!specialFile) {
    throw new Error(`catalog.md 术数字段 "${shu}" 无对应专项文件（v1 仅支持 命→bazi.md）`)
  }
  const shuSpecial = readOrThrow(
    path.join(projectRoot, `research-dispute/${specialFile}`),
    `research-dispute/${specialFile}`
  )

  const sourceText = readOrThrow(
    path.join(projectRoot, `books/${slug}/articles/${chapter}/source.md`),
    `books/${slug}/articles/${chapter}/source.md`
  )

  return { specInterpretation, general, shuSpecial, catalog, sourceText }
}
