#!/usr/bin/env node
/**
 * migrate-bazi-tiyao-h2.mjs — 把 bazi-tiyao 120 篇 source.md 的子时柱名升级为 ## H2
 *
 * ⚠️ SPEC 偏离声明：
 *   - SPEC-source.md §3.2 "一级标题仅篇名，无序号、无副标题"
 *   - SPEC-source.md §五 红线 3 "严禁添加现代标点以外的任何标记"
 *   - 本脚本把 11 个时柱名（如 `寅月甲日乙丑时`）从裸行升级为 `## H2`，明确违反以上两条
 *   - 决策背景：2026-06-20 用户明确指令"不管 SPEC，直接迁"
 *   - 影响范围：仅 books/bazi-tiyao/articles/{篇名}/source.md（120 篇）
 *   - 副作用：后续 self-check 会判这些文件 §3.2/红线 3 违规；用户已知情
 *
 * 用法：
 *   node scripts/migrate-bazi-tiyao-h2.mjs --dry-run   # 预览前 5 篇
 *   node scripts/migrate-bazi-tiyao-h2.mjs            # 实跑
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const SLUG = 'bazi-tiyao'
const ARTS_DIR = path.join(ROOT, 'books', SLUG, 'articles')

const DRY_RUN = process.argv.includes('--dry-run')

// 月份 + 天干组合表（与 fetch-sources.js matchUrl 同源）
const MONTHS = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑']
const DAYS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']

// 12 个时辰天干起点表（与原书"时干=日干则跳过该时柱"的体例一致）
// 例如甲日子时为甲子时，跳过；起于乙丑时
const HOUR_STEM_START = {
  甲: '乙',
  乙: '丁',
  丙: '己',
  丁: '辛',
  戊: '癸',
  己: '乙',
  庚: '丁',
  辛: '己',
  壬: '辛',
  癸: '癸',
}

// 12 地支（子丑寅卯辰巳午未申酉戌亥）
const HOURLY_BRANCHES = ['丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子']

/**
 * 构造 11 个时柱名（按子时干=日干则跳过的体例）
 * 例：寅月甲日 → ['寅月甲日乙丑时', '寅月甲日丙寅时', ..., '寅月甲日乙亥时']
 */
function buildSubtitles(month, day) {
  const startStem = HOUR_STEM_START[day]
  const startIdx = '甲乙丙丁戊己庚辛壬癸'.indexOf(startStem)
  const subtitles = []
  for (let i = 0; i < 11; i++) {
    const stemIdx = (startIdx + i) % 10
    const branchIdx = i % 12 // 从丑时起
    const stem = DAYS[stemIdx]
    const branch = HOURLY_BRANCHES[branchIdx]
    subtitles.push(`${month}月${day}日${stem}${branch}时`)
  }
  return subtitles
}

/**
 * 匹配形如 "X月X日X时" 的裸行（行首 + 行尾 + 整行匹配）
 * 月份 ∈ {寅卯辰巳午未申酉戌亥子丑}
 * 天干 ∈ {甲乙丙丁戊己庚辛壬癸}
 */
const RE_SUBTITLE_LINE = new RegExp(
  `^([${MONTHS.join('')}]月[${DAYS.join('')}]日[${DAYS.join('')}][子丑寅卯辰巳午未申酉戌亥]时)$`
)

function migrateFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  let migrated = 0
  const newLines = lines.map(line => {
    const trimmed = line.trim()
    if (RE_SUBTITLE_LINE.test(trimmed)) {
      migrated++
      return `## ${trimmed}`
    }
    return line
  })
  return { content: newLines.join('\n'), migrated }
}

function main() {
  console.log(`🔧 migrate-bazi-tiyao-h2.mjs`)
  console.log(`   DRY_RUN=${DRY_RUN}`)
  console.log(`   ARTS_DIR=${ARTS_DIR}\n`)

  if (!fs.existsSync(ARTS_DIR)) {
    console.error(`❌ 目录不存在: ${ARTS_DIR}`)
    process.exit(1)
  }

  const articles = fs.readdirSync(ARTS_DIR).filter(name => {
    const p = path.join(ARTS_DIR, name)
    return fs.statSync(p).isDirectory()
  })

  console.log(`📚 发现 ${articles.length} 篇 articles\n`)

  // 按月分组汇总预期改动数
  const expectedByMonth = {}
  for (const month of MONTHS) {
    let count = 0
    for (const day of DAYS) {
      count += buildSubtitles(month, day).length // 11
    }
    expectedByMonth[month] = count // 11
  }
  const totalExpected = Object.values(expectedByMonth).reduce((a, b) => a + b, 0) * 1 // 12 月 × 11 个 = 1320

  console.log(`🎯 预期每篇 11 个 H2 升级 × 120 篇 = ${totalExpected} 处\n`)

  if (DRY_RUN) {
    console.log(`📖 [dry-run] 预览前 5 篇:\n`)
    for (const art of articles.slice(0, 5)) {
      const fp = path.join(ARTS_DIR, art, 'source.md')
      if (!fs.existsSync(fp)) {
        console.log(`  ⚠️ ${art}/source.md 不存在，跳过`)
        continue
      }
      const { content: newContent, migrated } = migrateFile(fp)
      console.log(`  === ${art} (迁移 ${migrated} 处) ===`)
      const oldLines = fs
        .readFileSync(fp, 'utf-8')
        .split('\n')
        .filter(l => RE_SUBTITLE_LINE.test(l.trim()))
      const newLines = newContent
        .split('\n')
        .filter(l => l.startsWith('## ') && RE_SUBTITLE_LINE.test(l.replace(/^## /, '').trim()))
      console.log(`  旧版前 3 行:`)
      oldLines.slice(0, 3).forEach(l => console.log(`    ${l}`))
      console.log(`  新版前 3 行:`)
      newLines.slice(0, 3).forEach(l => console.log(`    ${l}`))
      console.log()
    }
    console.log(`✅ [dry-run] 完成。预览仅展示，未写盘。`)
    console.log(`   实跑: node scripts/migrate-bazi-tiyao-h2.mjs`)
    return
  }

  // 实跑
  let totalMigrated = 0
  let totalFiles = 0
  let failedFiles = []
  const monthTally = {}

  for (const art of articles) {
    const fp = path.join(ARTS_DIR, art, 'source.md')
    if (!fs.existsSync(fp)) {
      console.log(`  ⚠️ ${art}/source.md 不存在，跳过`)
      failedFiles.push(art)
      continue
    }
    try {
      const { content, migrated } = migrateFile(fp)
      fs.writeFileSync(fp, content, 'utf-8')
      totalMigrated += migrated
      totalFiles++
      // 按月统计
      const monthChar = art[0]
      monthTally[monthChar] = (monthTally[monthChar] || 0) + migrated
    } catch (err) {
      console.error(`  ❌ ${art} 失败: ${err.message}`)
      failedFiles.push(art)
    }
  }

  console.log(`📊 迁移汇总:`)
  console.log(`   文件: ${totalFiles}/${articles.length}`)
  console.log(`   H2 升级总数: ${totalMigrated}`)
  console.log(`   按月分布:`)
  for (const [month, count] of Object.entries(monthTally)) {
    console.log(`     ${month}月: ${count}`)
  }
  if (failedFiles.length > 0) {
    console.log(`\n   ⚠️ 失败文件 (${failedFiles.length}):`)
    failedFiles.forEach(f => console.log(`     - ${f}`))
  }

  if (totalMigrated === totalExpected && failedFiles.length === 0) {
    console.log(`\n✅ 完成。全部 ${totalExpected} 处子时柱名升级为 H2。`)
    console.log(`   ⚠️ 注意：本次迁移违反 SPEC-source.md §3.2 + §五 红线 3`)
    console.log(`   后续 self-check source 类型会将 120 篇全部判定为 fatal`)
    console.log(`   请在 catalog.md「审校存疑条目」段追加决策记录`)
  } else {
    console.log(`\n⚠️ 完成但未达预期:`)
    console.log(
      `   预期 ${totalExpected}，实际 ${totalMigrated}，差 ${totalExpected - totalMigrated}`
    )
  }
}

main()
