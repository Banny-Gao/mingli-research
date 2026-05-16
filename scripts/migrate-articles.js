#!/usr/bin/env node
/**
 * migrate-articles.js — 将书籍文件从平级目录迁移到 articles/ 结构
 *
 * 旧结构:
 *   books/{slug}/
 *     source/{篇名}.md
 *     interpretations/{skill}/tutorial.md
 *     skills/{skill}/SKILL.md
 *
 * 新结构:
 *   books/{slug}/
 *     articles/{篇名}/
 *       source.md
 *       interpretation.md
 *       skill.md
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BOOKS_DIR = path.join(__dirname, '../books')

function parseCatalogForMigration(catalogPath) {
  const content = fs.readFileSync(catalogPath, 'utf-8')
  const articles = []

  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || /^#/.test(trimmed) || /^\|[-:\s|]+\|$/.test(trimmed)) continue

    const cells = trimmed.split('|').map(c => c.trim()).filter(c => c !== '')
    if (cells.length < 3 || !/^\d+$/.test(cells[0])) continue

    // 6列格式: [num, title, sourcePath, interpPath, status, skills]
    let sourcePath = ''
    let interpPath = ''
    let status = ''
    let skills = ''

    if (cells.length >= 6) {
      sourcePath = cells[2]
      interpPath = cells[3]
      status = cells[4]
      skills = cells[5]
    } else if (cells.length === 5) {
      sourcePath = cells[2]
      status = cells[3]
      skills = cells[4]
    }

    articles.push({
      num: cells[0],
      title: cells[1],
      sourcePath,
      interpPath,
      status,
      skills,
    })
  }
  return articles
}

function getOldInterpPath(bookRoot, skillName) {
  const p = path.join(bookRoot, 'interpretations', skillName, 'tutorial.md')
  return fs.existsSync(p) ? p : null
}

function getOldSkillPath(bookRoot, skillName) {
  const p = path.join(bookRoot, 'skills', skillName, 'SKILL.md')
  return fs.existsSync(p) ? p : null
}

function getOldSourcePath(bookRoot, title) {
  const p = path.join(bookRoot, 'source', `${title}.md`)
  return fs.existsSync(p) ? p : null
}

function migrateBook(bookSlug) {
  const bookRoot = path.join(BOOKS_DIR, bookSlug)
  const catalogPath = path.join(bookRoot, 'catalog.md')
  const articlesDir = path.join(bookRoot, 'articles')

  if (!fs.existsSync(catalogPath)) {
    console.log(`  ⏭️  跳过 ${bookSlug}: 无 catalog.md`)
    return false
  }

  if (fs.existsSync(articlesDir)) {
    console.log(`  ⏭️  跳过 ${bookSlug}: articles/ 已存在`)
    return false
  }

  const articles = parseCatalogForMigration(catalogPath)
  console.log(`\n📚 ${bookSlug}: 发现 ${articles.length} 篇文章`)

  let migratedCount = 0
  let warnings = []

  for (const art of articles) {
    const artDir = path.join(articlesDir, art.title)
    fs.mkdirSync(artDir, { recursive: true })

    // 迁移 source
    const oldSource = getOldSourcePath(bookRoot, art.title)
    if (oldSource) {
      fs.renameSync(oldSource, path.join(artDir, 'source.md'))
      migratedCount++
    }

    // 迁移 interpretation: 通过 skills 列中的 skill_name 查找
    const skillNames = art.skills ? art.skills.split(',').map(s => s.trim()).filter(Boolean) : []
    for (const sk of skillNames) {
      const oldInterp = getOldInterpPath(bookRoot, sk)
      if (oldInterp) {
        fs.renameSync(oldInterp, path.join(artDir, 'interpretation.md'))
        migratedCount++
        break
      }
    }

    // 迁移 skill: 通过 skills 列中的 skill_name 查找
    for (const sk of skillNames) {
      const oldSkill = getOldSkillPath(bookRoot, sk)
      if (oldSkill) {
        fs.renameSync(oldSkill, path.join(artDir, 'skill.md'))
        migratedCount++
        break
      }
    }

    // 检查未找到的文件
    if (oldSource === null) {
      warnings.push(`⚠️  ${art.title}: source.md 不存在（原文缺失）`)
    }
    if (skillNames.length > 0) {
      let foundInterp = false
      let foundSkill = false
      for (const sk of skillNames) {
        if (getOldInterpPath(bookRoot, sk)) foundInterp = true
        if (getOldSkillPath(bookRoot, sk)) foundSkill = true
      }
      if (!foundInterp) warnings.push(`⚠️  ${art.title}: interpretation.md 不存在`)
      if (!foundSkill) warnings.push(`⚠️  ${art.title}: skill.md 不存在`)
    }
  }

  console.log(`  迁移文件数: ${migratedCount}`)
  for (const w of warnings) console.log(`  ${w}`)

  // 清理空目录
  const oldDirs = ['source', 'interpretations', 'skills']
  for (const dir of oldDirs) {
    const fullPath = path.join(bookRoot, dir)
    if (fs.existsSync(fullPath)) {
      const remaining = fs.readdirSync(fullPath)
      if (remaining.length === 0 || remaining.every(e => e === 'README.md')) {
        // 保留 README.md
        for (const e of remaining) {
          if (e !== 'README.md') {
            const p = path.join(fullPath, e)
            if (fs.statSync(p).isDirectory()) {
              const sub = fs.readdirSync(p)
              if (sub.length === 0) fs.rmdirSync(p)
            }
          }
        }
      }
    }
  }

  return true
}

// 主流程
const bookDirs = fs.readdirSync(BOOKS_DIR).filter(f =>
  fs.statSync(path.join(BOOKS_DIR, f)).isDirectory() &&
  fs.existsSync(path.join(BOOKS_DIR, f, 'catalog.md'))
)

console.log(`找到 ${bookDirs.length} 本书`)
for (const slug of bookDirs) {
  migrateBook(slug)
}

console.log('\n✅ 全部迁移完成')
