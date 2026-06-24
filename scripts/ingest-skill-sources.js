#!/usr/bin/env node
/**
 * scripts/ingest-skill-sources.js
 *
 * 通用 skill 录入脚本（运维工具，非 skill 运行时依赖）
 *
 * 职责：按 .claude/skills/<skill>/shared/sources/manifest.json 把真源写入
 *       .claude/skills/<skill>/shared/sources/ 对应副本。
 *
 * 触发：人工 / git pre-push / CI 单独的"规范同步" job。
 * 不做：漂移检测（交给 self-check-fingerprint.py）。
 *
 * 用法：
 *   node scripts/ingest-skill-sources.js                    # 全部 skill（默认）
 *   node scripts/ingest-skill-sources.js --target skill-create
 *   node scripts/ingest-skill-sources.js --skills-dir <path>  # 自定义 skills 目录
 *   node scripts/ingest-skill-sources.js --project-root <path>  # 自定义项目根
 *
 * 路径语义：manifest 中 from 相对"项目根"解析，to 相对 manifest 自身所在目录。
 *           项目根优先级：--project-root > manifest._root > process.cwd()
 *
 * 环境变量：
 *   ALLOW_PARTIAL=1  缺源时不报错，生成空文件占位 + 警告
 *
 * 退出码：
 *   0  全部成功
 *   1  任一 required 源缺失，或读取/解析失败
 *   2  参数解析失败
 */

import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

// ---------- CLI args ----------

function parseArgs(argv) {
  const args = {
    target: null, // 'all' | '<skill-name>' | null（默认 all）
    skillsDir: null,
    projectRoot: null,
  }
  // 需要值的参数；下一个 argv 是另一个 --flag 时视为缺失
  const NEEDS_VALUE = new Set(['--target', '--skills-dir', '--project-root'])
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (NEEDS_VALUE.has(a)) {
      const next = argv[i + 1]
      if (next === undefined || next.startsWith('--')) {
        console.error(`[ingest] ${a} 需要一个值（参数错误）`)
        process.exit(2)
      }
      if (a === '--target') args.target = next
      else if (a === '--skills-dir') args.skillsDir = next
      else if (a === '--project-root') args.projectRoot = next
      i++
    } else if (a === '-h' || a === '--help') {
      printHelp()
      process.exit(0)
    } else {
      console.error(`[ingest] 未知参数：${a}`)
      process.exit(2)
    }
  }
  return args
}

function printHelp() {
  console.log(`用法：node scripts/ingest-skill-sources.js [选项]

选项：
  --target <name|all>  指定 skill（默认：all，扫所有 .claude/skills/*/shared/sources/manifest.json）
  --skills-dir <path>  skills 根目录（默认：<projectRoot>/.claude/skills）
  --project-root <path> 项目根（覆盖 manifest._root；默认：process.cwd()）
  -h, --help          显示本帮助

环境变量：
  ALLOW_PARTIAL=1     缺源时不报错，生成空文件占位

路径语义：manifest 中 from 相对"项目根"解析，to 相对 manifest 自身所在目录。`)
}

// ---------- 路径工具 ----------

function resolveProjectRoot(args, manifest, manifestPath) {
  if (args.projectRoot) return path.resolve(args.projectRoot)
  if (typeof manifest._root === 'string') {
    // _root 相对 manifest 自身所在目录
    return path.resolve(path.dirname(manifestPath), manifest._root)
  }
  return process.cwd()
}

function resolveSkillsDir(args, projectRoot) {
  if (args.skillsDir) return path.resolve(args.skillsDir)
  return path.resolve(projectRoot, '.claude/skills')
}

function resolveManifestPath(skillName, skillsDir) {
  return path.resolve(skillsDir, skillName, 'shared', 'sources', 'manifest.json')
}

function discoverSkills(skillsDir) {
  if (!fs.existsSync(skillsDir)) return []
  return fs
    .readdirSync(skillsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
}

// ---------- 单条源的处理 ----------

async function ingestMarkdown(entry, projectRoot, manifestDir) {
  const fromAbs = path.resolve(projectRoot, entry.from)
  const toAbs = path.resolve(manifestDir, entry.to)
  if (!fs.existsSync(fromAbs)) {
    return { ok: false, reason: 'missing', fromAbs }
  }
  const content = fs.readFileSync(fromAbs, 'utf8')
  fs.mkdirSync(path.dirname(toAbs), { recursive: true })
  fs.writeFileSync(toAbs, content, 'utf8')
  return { ok: true, fromAbs, toAbs, bytes: Buffer.byteLength(content) }
}

async function ingestCategoryTree(entry, projectRoot, manifestDir) {
  const moduleRel = entry.extract?.module ?? entry.from
  const moduleAbs = path.resolve(projectRoot, moduleRel)
  const exports = entry.extract?.exports ?? ['SECTION_ORDER', 'CATEGORY_TREE']
  if (!fs.existsSync(moduleAbs)) {
    return { ok: false, reason: 'missing', fromAbs: moduleAbs }
  }
  // dynamic import：ESM 仅
  const mod = await import(pathToFileURL(moduleAbs).href)
  const payload = {}
  for (const name of exports) {
    if (!(name in mod)) {
      return { ok: false, reason: `module missing export "${name}"`, fromAbs: moduleAbs }
    }
    payload[name] = mod[name]
  }
  const toAbs = path.resolve(manifestDir, entry.to)
  fs.mkdirSync(path.dirname(toAbs), { recursive: true })
  fs.writeFileSync(toAbs, JSON.stringify(payload, null, 2) + '\n', 'utf8')
  return { ok: true, fromAbs: moduleAbs, toAbs, exports: Object.keys(payload) }
}

async function ingestScript(entry, projectRoot, manifestDir) {
  // 通用脚本：原样复制，并保留可执行位（如有）
  const fromAbs = path.resolve(projectRoot, entry.from)
  const toAbs = path.resolve(manifestDir, entry.to)
  if (!fs.existsSync(fromAbs)) {
    return { ok: false, reason: 'missing', fromAbs }
  }
  const stat = fs.statSync(fromAbs)
  if (!stat.isFile()) {
    return { ok: false, reason: 'not a regular file', fromAbs }
  }
  const content = fs.readFileSync(fromAbs, 'utf8')
  fs.mkdirSync(path.dirname(toAbs), { recursive: true })
  fs.writeFileSync(toAbs, content, 'utf8')
  // 保留可执行位
  try {
    fs.chmodSync(toAbs, stat.mode)
  } catch {
    // 非致命：某些 FS 不支持 chmod
  }
  return { ok: true, fromAbs, toAbs, bytes: Buffer.byteLength(content), executable: !!(stat.mode & 0o111) }
}

async function ingestOne(entry, projectRoot, manifestDir) {
  try {
    if (entry.kind === 'markdown') return await ingestMarkdown(entry, projectRoot, manifestDir)
    if (entry.kind === 'category-tree') return await ingestCategoryTree(entry, projectRoot, manifestDir)
    if (entry.kind === 'script') return await ingestScript(entry, projectRoot, manifestDir)
    return { ok: false, reason: `unknown kind "${entry.kind}"` }
  } catch (err) {
    return { ok: false, reason: `exception: ${err?.message ?? String(err)}` }
  }
}

// ---------- 缺源占位（ALLOW_PARTIAL）----------

function writePlaceholder(entry, manifestDir) {
  const toAbs = path.resolve(manifestDir, entry.to)
  fs.mkdirSync(path.dirname(toAbs), { recursive: true })
  if (entry.kind === 'category-tree') {
    fs.writeFileSync(
      toAbs,
      JSON.stringify(
        { _placeholder: true, _missing: entry.from, _kind: 'category-tree' },
        null,
        2,
      ) + '\n',
      'utf8',
    )
  } else if (entry.kind === 'script') {
    fs.writeFileSync(
      toAbs,
      `#!/usr/bin/env python3\n# placeholder: 源 ${entry.from} 缺失，请运行 npm run ingest-skill-sources\nraise SystemExit("placeholder: source ${entry.from} not ingested")\n`,
      'utf8',
    )
  } else {
    fs.writeFileSync(
      toAbs,
      `<!-- placeholder: 源 ${entry.from} 缺失，请运行 npm run ingest-skill-sources -->\n`,
      'utf8',
    )
  }
  return toAbs
}

// ---------- 单个 target 的处理 ----------

async function processTarget(skillName, args, projectRoot) {
  const skillsDir = resolveSkillsDir(args, projectRoot)
  const manifestPath = resolveManifestPath(skillName, skillsDir)
  const manifestDir = path.dirname(manifestPath)
  const allowPartial = process.env.ALLOW_PARTIAL === '1'

  console.log('')
  console.log(`[ingest] === target: ${skillName} ===`)
  console.log(`[ingest] projectRoot = ${projectRoot}`)
  console.log(`[ingest] skillsDir   = ${skillsDir}`)
  console.log(`[ingest] manifest    = ${path.relative(projectRoot, manifestPath) || manifestPath}`)

  if (!fs.existsSync(manifestPath)) {
    console.error(`[ingest] manifest 不存在：${manifestPath}`)
    return { skill: skillName, ok: 0, placeholder: 0, fail: 1, skipped: true }
  }

  let manifest
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  } catch (e) {
    console.error(`[ingest] manifest JSON 解析失败：${manifestPath}: ${e.message}`)
    return { skill: skillName, ok: 0, placeholder: 0, fail: 1, skipped: true }
  }
  if (!Array.isArray(manifest.sources)) {
    console.error(`[ingest] manifest 格式错误：sources 字段不是数组（${manifestPath}）`)
    return { skill: skillName, ok: 0, placeholder: 0, fail: 1, skipped: true }
  }

  // projectRoot 优先级：args.projectRoot > manifest._root > process.cwd()
  const effectiveProjectRoot = args.projectRoot
    ? path.resolve(args.projectRoot)
    : (typeof manifest._root === 'string'
        ? path.resolve(manifestDir, manifest._root)
        : process.cwd())

  console.log(`[ingest] allowPartial = ${allowPartial}`)
  console.log(`[ingest] 待录入条目数：${manifest.sources.length}`)

  let okCount = 0
  let placeholderCount = 0
  let failCount = 0

  for (const entry of manifest.sources) {
    const tag = `[${entry.id}]`.padEnd(20)
    const result = await ingestOne(entry, effectiveProjectRoot, manifestDir)
    if (result.ok) {
      const target = path.relative(manifestDir, result.toAbs)
      const detail = result.bytes
        ? `${result.bytes} bytes`
        : `exports=[${(result.exports ?? []).join(', ')}]`
      console.log(`✓ ${tag} ${entry.from}  →  ${target}  (${detail})`)
      okCount++
      continue
    }
    const isRequired = entry.required === true
    if (!isRequired || allowPartial) {
      const target = writePlaceholder(entry, manifestDir)
      const relTarget = path.relative(manifestDir, target)
      console.warn(
        `⚠ ${tag} ${entry.from} 缺失（${result.reason}），写入占位：${relTarget}`,
      )
      placeholderCount++
      continue
    }
    console.error(
      `✗ ${tag} ${entry.from} 缺失（${result.reason}），required 源不允许跳过`,
    )
    failCount++
  }

  console.log(
    `[ingest] [${skillName}] 完成：成功 ${okCount}，占位 ${placeholderCount}，失败 ${failCount}`,
  )
  return { skill: skillName, ok: okCount, placeholder: placeholderCount, fail: failCount, skipped: false }
}

// ---------- 主流程 ----------

async function main() {
  const args = parseArgs(process.argv)

  // 决定要跑的 skill 列表
  let skills
  if (args.target === null || args.target === 'all') {
    // 全部：先按 projectRoot 探测
    const probeRoot = args.projectRoot
      ? path.resolve(args.projectRoot)
      : process.cwd()
    const skillsDir = resolveSkillsDir(args, probeRoot)
    skills = discoverSkills(skillsDir).filter((name) => {
      const m = resolveManifestPath(name, skillsDir)
      return fs.existsSync(m)
    })
    if (skills.length === 0) {
      console.error(`[ingest] 在 ${skillsDir} 下未发现任何 manifest.json`)
      console.error(`[ingest] 提示：每个 skill 需在 <skill>/shared/sources/manifest.json 声明录入源`)
      process.exit(1)
    }
  } else {
    skills = [args.target]
  }

  console.log(`[ingest] 待处理 target：${skills.join(', ')}`)

  const summary = []
  for (const skillName of skills) {
    // 单 target 模式：projectRoot 解析在 processTarget 内做
    const probeRoot = args.projectRoot
      ? path.resolve(args.projectRoot)
      : process.cwd()
    const result = await processTarget(skillName, args, probeRoot)
    summary.push(result)
  }

  // 汇总
  console.log('')
  console.log('[ingest] ==================== 汇总 ====================')
  for (const r of summary) {
    const status = r.skipped ? 'SKIP' : r.fail > 0 ? 'FAIL' : 'OK'
    console.log(
      `  [${status}] ${r.skill.padEnd(20)} 成功 ${r.ok}，占位 ${r.placeholder}，失败 ${r.fail}`,
    )
  }

  const totalFail = summary.reduce((sum, r) => sum + r.fail, 0)
  if (totalFail > 0) process.exit(1)
}

main().catch((err) => {
  console.error(`[ingest] 未捕获异常：`, err)
  process.exit(1)
})
