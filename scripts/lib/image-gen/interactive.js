/**
 * scripts/lib/image-gen/interactive.js — 共享交互模式 UI
 *
 * 合并自 t2i/interactive.js 与 i2i/interactive.js。
 * 差异通过 modeHooks 注入：
 *   - modeHooks.collectPreSteps(opts)  — 在 prompt 之前注入步骤
 *   - modeHooks.collectPostSteps(opts) — 在 textOverlay 之后注入步骤
 *   - modeHooks.printSummaryExtras(opts) — 打印汇总时注入额外行
 *   - modeHooks.presetKeys — 保存预设时剥离的字段
 *   - modeHooks.presetsFile — 预设文件路径
 *
 * 使用 smartSelect/smartConfirm/smartInput 保证 TTY 和非 TTY 环境兼容。
 */

import { number } from '@inquirer/prompts'
import { smartSelect, smartConfirm, smartInput } from '../shared/prompt.js'
const select = smartSelect
const _confirm = smartConfirm
const input = smartInput
import {
  VALID_MODELS,
  VALID_ASPECT_RATIOS,
  VALID_STYLES,
  VALID_RESPONSE_FORMATS,
} from './config.js'
import { loadPresets, savePreset, deletePreset, listPresets } from './preset.js'
import { pickExistingImage } from '../shared/pick-image.js'
import { validateName, MAX_NAME_PROMPT_ATTEMPTS } from '../shared/output-name.js'

// ===== 默认 t2i hooks =====
const DEFAULT_HOOKS = {
  presetsFile: undefined, // 默认走 t2i
  presetKeys: ['prompt', 'seed', 'reuseBackground', 'saveBackground', 'name'],
  title: 'MiniMax 文生图 · 交互模式',
  subtitle: 'API: image-01 / image-01-live',
  async collectPreSteps(_opts) { /* t2i: no extra pre-steps */ },
  async collectPostSteps(_opts) { /* t2i: no extra post-steps */ },
  printSummaryExtras(_opts) { /* t2i: no extras */ },
  getConfig() { return import('./config.js').then(m => m.t2iConfig) },
}

// ===== i2i hooks =====
async function createI2IHooks() {
  const { i2iConfig, VALID_SUBJECT_TYPES } = await import('./config.js')
  return {
    presetsFile: i2iConfig.presetsFile,
    presetKeys: ['inputImage', 'prompt', 'seed', 'saveBackground', 'reuseBackground', 'name'],
    title: 'MiniMax 图生图 · 交互模式',
    subtitle: 'API: image-01 / image-01-live',
    async collectPreSteps(opts) {
      // 1. 输入图或复用底图
      if (!opts.inputImage && !opts.reuseBackground) {
        const SOURCE_RULES = [
          { match: /^(1|参|参考|input|image|bg|background|pic|图)$/i, value: 'input' },
          { match: /^(2|复|reuse|reused|skip|跳过)$/i, value: 'reuse' },
        ]
        let source = null
        while (!source) {
          const ans = (
            await input({
              message: '底图来源（输入"参考"/"1" = 选择参考图；输入"复用"/"2" = 跳过 I2I API 仅叠加文字）：',
            })
          ).trim()
          const rule = SOURCE_RULES.find(r => r.match.test(ans))
          if (rule) source = rule.value
          else console.log(`   ⚠️  无法识别 "${ans}"，请输入 "参考" / "复用" 或 1 / 2`)
        }
        if (source === 'reuse') {
          const picked = await pickExistingImage({ message: '选择复用底图：' })
          if (picked) {
            opts.reuseBackground = picked
            opts.skipI2I = true
          }
        }
      }
      if (!opts.inputImage && !opts.reuseBackground) {
        while (!opts.inputImage) {
          const picked = await pickExistingImage({ message: '选择参考图（可搜索 / 手动输入 URL 或路径）：' })
          if (!picked) {
            console.log('   请选择一个图片或输入路径')
            continue
          }
          opts.inputImage = picked
        }
      }

      // 2. Subject Type
      if (!opts.subjectType) {
        const customise = await _confirm({
          message: `subject_reference.type 默认 "character"，是否自定义？`,
          default: false,
        })
        if (customise) {
          opts.subjectType = await input({
            message: 'subject_reference.type (I2I_ALLOW_UNKNOWN_SUBJECT_TYPE=1 跳过白名单校验):',
            validate: v => (v.trim() ? true : '不能为空'),
          })
        } else {
          opts.subjectType = VALID_SUBJECT_TYPES[0]
        }
      }
    },
    async collectPostSteps(opts) {
      // 保存背景（i2i 下保存"生成图"——文字叠加前的版本——便于后续 --reuse）
      if (opts.saveBackground == null && !opts.reuseBackground) {
        opts.saveBackground = await _confirm({
          message: '保存生成图为背景副本（供后续复用 / 重渲染）？',
          default: true,
        })
      }
    },
    printSummaryExtras(opts) {
      console.log(`  Input Image:      ${opts.inputImage}`)
      console.log(`  Subject Type:     ${opts.subjectType || 'character'}`)
    },
    getConfig() { return Promise.resolve(i2iConfig) },
  }
}

// ===== 共享 printSummary =====

function printSummary(opts, hooks, config) {
  console.log('\n' + '─'.repeat(46))
  console.log('📋 配置摘要')
  console.log('─'.repeat(46))
  if (opts.name) console.log(`  Name:              ${opts.name}`)
  hooks.printSummaryExtras(opts)
  console.log(`  Model:            ${opts.model}`)
  console.log(
    `  Prompt:           ${opts.prompt.slice(0, 60)}${opts.prompt.length > 60 ? '...' : ''}`
  )
  if (opts.width && opts.height) console.log(`  Resolution:       ${opts.width}x${opts.height}`)
  if (opts.aspectRatio) console.log(`  Aspect Ratio:     ${opts.aspectRatio}`)
  if (opts.style)
    console.log(
      `  Style:            ${opts.style}${opts.styleWeight ? ` (weight: ${opts.styleWeight})` : ''}`
    )
  console.log(`  Count:            ${opts.n || 1}`)
  if (opts.seed) console.log(`  Seed:             ${opts.seed}`)
  console.log(`  Prompt Optimizer: ${opts.promptOptimizer ? 'on' : 'off'}`)
  console.log(`  Watermark:        ${opts.aigcWatermark ? 'on' : 'off'}`)
  console.log(`  Format:           ${opts.responseFormat || 'url'}`)
  console.log(`  Output:           ${opts.outputDir || config.outputDir}`)
  if (opts.reuseBackground) console.log(`  Reuse BG:         ${opts.reuseBackground}`)
  console.log('─'.repeat(46))
}

// ===== 共享 collectOptions =====

async function collectOptionsMerged(preset, hooks) {
  // 从 preset 中剥离运行期 / 一次性字段，避免：
  //  - name 提前固定导致用户无法自定义
  //  - prompt / seed / reuseBackground 提前锁定导致本次无法调整
  // 与「保存预设」时使用的 presetKeys 保持一致（hooks.presetKeys 已包含 name）
  const opts = {}
  for (const [k, v] of Object.entries(preset || {})) {
    if (hooks.presetKeys.includes(k)) continue
    opts[k] = v
  }

  // mode-specific pre-steps (i2i: inputImage, subjectType)
  await hooks.collectPreSteps(opts)

  // 1. Prompt（必填）
  if (!opts.prompt) {
    opts.prompt = await input({
      message: '图片描述（必填，最多 1500 字符）:',
      validate: v => {
        if (!v.trim()) return '描述不能为空'
        if (v.length > 1500) return `当前 ${v.length} 字符，超过 1500 上限`
        return true
      },
    })
  }

  // 1.5 基础名称（可选）
  if (opts.name === undefined || opts.name === null) {
    let resolved = null
    for (let attempt = 0; attempt < MAX_NAME_PROMPT_ATTEMPTS; attempt++) {
      const ans = await input({
        message: `基础名称（可选，直接回车用默认时间戳）${attempt > 0 ? `[${attempt + 1}/${MAX_NAME_PROMPT_ATTEMPTS}]` : ''}：`,
      })
      const trimmed = ans.trim()
      if (!trimmed) { resolved = null; break }
      const v = validateName(trimmed)
      if (!v.valid) {
        console.log(`   ⚠️  ${v.error}`)
        if (attempt < MAX_NAME_PROMPT_ATTEMPTS - 1) {
          console.log(`   请重新输入（直接回车跳过）`)
        } else {
          console.log(`   已达最大重试次数 ${MAX_NAME_PROMPT_ATTEMPTS}，本次生成将使用默认时间戳`)
        }
        continue
      }
      resolved = trimmed
      break
    }
    opts.name = resolved
  }

  // 2. Model
  if (!opts.model) {
    opts.model = await select({
      message: '选择模型:',
      choices: VALID_MODELS.map((m, i) => ({
        name: m, value: m,
        description: i === 0 ? '通用模型' : '支持风格化',
      })),
    })
  }

  // 3. 分辨率 / 宽高比
  if (opts.width == null && opts.height == null && !opts.aspectRatio) {
    if (opts.model === 'image-01') {
      const useCustomRes = await _confirm({
        message: '自定义分辨率？（否则使用宽高比）',
        default: false,
      })
      if (useCustomRes) {
        opts.width = await number({ message: '宽度 (px, 512-2048, 8的倍数):', min: 512, max: 2048, default: 1024 })
        opts.width = Math.round(opts.width / 8) * 8
        opts.height = await number({ message: '高度 (px, 512-2048, 8的倍数):', min: 512, max: 2048, default: 1024 })
        opts.height = Math.round(opts.height / 8) * 8
      } else {
        opts.aspectRatio = await select({
          message: '选择宽高比:',
          choices: VALID_ASPECT_RATIOS.slice(0, 7).map((r, i) => ({
            name: r, value: r,
            description: i === 0 ? '方形' : undefined,
          })),
        })
      }
    } else {
      opts.aspectRatio = await select({
        message: '选择宽高比:',
        choices: VALID_ASPECT_RATIOS.slice(0, 7).map((r, i) => ({
          name: r, value: r,
          description: i === 0 ? '方形' : undefined,
        })),
      })
    }
  }

  // 4. Style（仅 image-01-live）
  if (opts.model === 'image-01-live' && !opts.style) {
    opts.style = await select({
      message: '选择风格:',
      choices: VALID_STYLES.map(s => ({ name: s, value: s })),
    })
    const customWeight = await _confirm({ message: '自定义风格权重？（默认 0.8）', default: false })
    if (customWeight) {
      opts.styleWeight = await number({ message: '风格权重 (0.01-1):', min: 0.01, max: 1, default: 0.8, step: 0.01 })
    }
  }

  // 5. 生成数量
  if (opts.n == null) {
    opts.n = await number({ message: '生成数量:', min: 1, max: 9, default: 1 })
  }

  // 6. Seed
  if (opts.seed == null) {
    const useSeed = await _confirm({ message: '指定随机种子？', default: false })
    if (useSeed) opts.seed = await number({ message: '随机种子 (整数):' })
  }

  // 7. Prompt Optimizer
  if (opts.promptOptimizer == null) {
    opts.promptOptimizer = await _confirm({ message: '启用 Prompt 自动优化？', default: false })
  }

  // 8. Watermark
  if (opts.aigcWatermark == null) {
    opts.aigcWatermark = await _confirm({ message: '添加水印？', default: false })
  }

  // 9. 输出格式
  if (!opts.responseFormat) {
    opts.responseFormat = await select({
      message: '返回格式:',
      choices: VALID_RESPONSE_FORMATS.map(f => ({ name: f, value: f })),
    })
  }

  // 10. 输出目录
  if (opts.outputDir == null) {
    const config = await hooks.getConfig()
    const customDir = await _confirm({
      message: `自定义输出目录？（默认 ${config.outputDir}）`,
      default: false,
    })
    if (customDir) opts.outputDir = await input({ message: '输出目录:' })
  }

  // 11. 文字叠加
  if (opts.textOverlay == null) {
    opts.textOverlay = await _confirm({
      message: '启用文字自动提取与叠加？（推荐）',
      default: true,
    })
  }

  // mode-specific post-steps (i2i: saveBackground)
  await hooks.collectPostSteps(opts)

  return opts
}

// ===== 背景复用/保存 =====

async function askReuseOrSave(opts, hooks) {
  const reuseBg = await _confirm({ message: '复用已有背景图？', default: false })
  if (reuseBg) {
    opts.reuseBackground = await pickExistingImage({ message: '选择复用背景图：' })
  } else if (opts.saveBackground == null && !opts.reuseBackground) {
    opts.saveBackground = await _confirm({
      message: '保存纯背景图（供后续复用）？',
      default: false,
    })
  }
}

// ===== 共享 interactiveMode =====

/**
 * 交互模式入口。
 *
 * @param {Function} executeFn - (opts) => Promise<void>
 * @param {'t2i'|'i2i'} [mode='t2i']
 */
export async function interactiveMode(executeFn, mode = 't2i') {
  const hooks = mode === 'i2i' ? await createI2IHooks() : DEFAULT_HOOKS

  console.log(`
╔══════════════════════════════════════╗
║     ${hooks.title}        ║
║     ${hooks.subtitle}   ║
╚══════════════════════════════════════╝
`)

  // 步骤 0：选择入口
  const presets = loadPresets(hooks.presetsFile)
  const presetNames = Object.keys(presets)

  if (presetNames.length > 0) {
    const choice = await select({
      message: `检测到 ${presetNames.length} 个预设，请选择操作:`,
      choices: [
        { name: '✨ 新建生成', value: 'new' },
        { name: '📂 加载预设', value: 'load' },
        { name: '🗑️  管理预设', value: 'manage' },
      ],
    })

    if (choice === 'load') {
      const name = await select({
        message: '选择预设:',
        choices: presetNames.map(n => ({ name: n, value: n })),
      })
      const preset = presets[name]
      console.log(`\n✅ 已加载预设 "${name}"`)

      const opts = await collectOptionsMerged(preset, hooks)
      await askReuseOrSave(opts, hooks)

      const config = await hooks.getConfig()
      printSummary(opts, hooks, config)
      const go = await _confirm({ message: '确认开始生成？', default: true })
      if (!go) { console.log('已取消'); return }
      await executeFn(opts)
      return
    }

    if (choice === 'manage') {
      const names = listPresets(hooks.presetsFile)
      if (names.length === 0) {
        console.log('  (暂无预设)')
      } else {
        const toDelete = await select({
          message: '选择要删除的预设:',
          choices: [{ name: '← 返回', value: null }, ...names.map(n => ({ name: n, value: n }))],
        })
        if (toDelete) {
          const ok = await _confirm({ message: `确认删除预设 "${toDelete}"？`, default: false })
          if (ok) {
            deletePreset(hooks.presetsFile, toDelete)
            console.log(`  ✅ 已删除 "${toDelete}"`)
          }
        }
      }
      console.log('')
      return
    }
  }

  // 正常交互流程
  const opts = await collectOptionsMerged({}, hooks)
  await askReuseOrSave(opts, hooks)

  const config = await hooks.getConfig()
  printSummary(opts, hooks, config)

  const go = await _confirm({ message: '确认开始生成？', default: true })
  if (!go) { console.log('已取消'); return }

  // 询问是否保存为预设
  const saveAsPreset = await _confirm({ message: '将当前配置保存为预设？', default: false })
  if (saveAsPreset) {
    const name = await input({ message: '预设名称:' })
    if (name.trim()) {
      const stripped = { ...opts }
      for (const key of hooks.presetKeys) delete stripped[key]
      if (stripped.outputDir == null) stripped.outputDir = config.outputDir
      savePreset(hooks.presetsFile, name.trim(), stripped)
      console.log(`✅ 预设 "${name.trim()}" 已保存 (${Object.keys(stripped).length} 项配置)`)
    }
  }

  await executeFn(opts)
}
