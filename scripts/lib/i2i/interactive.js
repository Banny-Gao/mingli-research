/**
 * scripts/lib/i2i/interactive.js — 图生图交互模式 UI
 *
 * 与 t2i 差异：
 *   - 第 0 步先问"输入图路径"（必填）
 *   - 10 步流程对齐 t2i 但文字叠加 prompt 用 i2i 版本（基于参考图变更）
 *   - "复用背景" 复用 t2i 的逻辑，输入图作为底图无需生成
 *   - "保存背景" 对于图生图相当于存"输入图副本"
 */

import { input, confirm, number } from '@inquirer/prompts'
import { smartSelect, smartConfirm } from '../shared/prompt.js'
const select = smartSelect // alias: 智能降级 select（TUX 下用 inquirer，非 TTY 下用 input + 关键词）
const _confirm = smartConfirm // alias: 同上，confirm 也需要 TTY 降级
import {
  VALID_MODELS,
  VALID_ASPECT_RATIOS,
  VALID_STYLES,
  VALID_RESPONSE_FORMATS,
  VALID_SUBJECT_TYPES,
  i2iConfig,
} from './constants.js'
import { resolveInputImage } from './input.js'
import {
  loadPresets,
  savePreset,
  deletePreset,
  listPresets,
} from '../t2i/presets.js'
import { pickExistingImage } from '../shared/pick-image.js'

function printSummary(opts) {
  console.log('\n' + '─'.repeat(46))
  console.log('📋 配置摘要（i2i）')
  console.log('─'.repeat(46))
  console.log(`  Input Image:      ${opts.inputImage}`)
  console.log(`  Subject Type:     ${opts.subjectType || 'character'}`)
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
  console.log(`  Output:           ${opts.outputDir || i2iConfig.outputDir}`)
  console.log('─'.repeat(46))
}

async function collectOptionsMerged(preset) {
  const opts = { ...preset }

  // 1. 输入图或复用底图——用 input + 关键词匹配，避免 select 在非 TTY 场景（npm scripts、IDE 子进程）失灵。
  // 也接受数字快捷键 1/2。
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
        // 用户在手动输入也回车取消 → 提示后重新问
        console.log('   请选择一个图片或输入路径')
        continue
      }
      // 复用 pickExistingImage 的兜底已校验过文件存在；URL 跳过
      opts.inputImage = picked
    }
  }

  // 2. Subject Type：默认 `character`；用户可显式改其他 type（rare）。
  // 多数用户用不上：上一次 prompt 我们还会显示默认值在汇总里，所以这里只问一次"是否自定义"。
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
      // 显式写入默认，便于用户看到汇总 + 后续保存到 preset 时字段明确
      opts.subjectType = VALID_SUBJECT_TYPES[0]
    }
  }

  // 3. Prompt（必填）
  if (!opts.prompt) {
    opts.prompt = await input({
      message: '参考图变更指令（必填，最多 1500 字符）:',
      validate: v => {
        if (!v.trim()) return '描述不能为空'
        if (v.length > 1500) return `当前 ${v.length} 字符，超过 1500 上限`
        return true
      },
    })
  }

  // 4. Model
  if (!opts.model) {
    opts.model = await select({
      message: '选择模型:',
      choices: VALID_MODELS.map((m, i) => ({
        name: m,
        value: m,
        description: i === 0 ? '通用模型' : '支持风格化',
      })),
    })
  }

  // 5. 分辨率 / 宽高比（与 t2i 同）
  if (opts.width == null && opts.height == null && !opts.aspectRatio) {
    if (opts.model === 'image-01') {
      const useCustomRes = await _confirm({
        message: '自定义分辨率？（否则使用宽高比）',
        default: false,
      })
      if (useCustomRes) {
        opts.width = await number({
          message: '宽度 (px, 512-2048, 8的倍数):',
          min: 512,
          max: 2048,
          default: 1024,
        })
        opts.width = Math.round(opts.width / 8) * 8
        opts.height = await number({
          message: '高度 (px, 512-2048, 8的倍数):',
          min: 512,
          max: 2048,
          default: 1024,
        })
        opts.height = Math.round(opts.height / 8) * 8
      } else {
        opts.aspectRatio = await select({
          message: '选择宽高比:',
          choices: VALID_ASPECT_RATIOS.slice(0, 7).map((r, i) => ({
            name: r,
            value: r,
            description: i === 0 ? '方形' : undefined,
          })),
        })
      }
    } else {
      opts.aspectRatio = await select({
        message: '选择宽高比:',
        choices: VALID_ASPECT_RATIOS.slice(0, 7).map((r, i) => ({
          name: r,
          value: r,
          description: i === 0 ? '方形' : undefined,
        })),
      })
    }
  }

  // 6. Style（仅 image-01-live）
  if (opts.model === 'image-01-live' && !opts.style) {
    opts.style = await select({
      message: '选择风格:',
      choices: VALID_STYLES.map(s => ({ name: s, value: s })),
    })
    const customWeight = await _confirm({ message: '自定义风格权重？（默认 0.8）', default: false })
    if (customWeight) {
      opts.styleWeight = await number({
        message: '风格权重 (0.01-1):',
        min: 0.01,
        max: 1,
        default: 0.8,
        step: 0.01,
      })
    }
  }

  // 7. 生成数量
  if (opts.n == null) {
    opts.n = await number({ message: '生成数量:', min: 1, max: 9, default: 1 })
  }

  // 8. Seed
  if (opts.seed == null) {
    const useSeed = await _confirm({ message: '指定随机种子？', default: false })
    if (useSeed) opts.seed = await number({ message: '随机种子 (整数):' })
  }

  // 9. Prompt Optimizer
  if (opts.promptOptimizer == null) {
    opts.promptOptimizer = await _confirm({ message: '启用 Prompt 自动优化？', default: false })
  }

  // 10. Watermark
  if (opts.aigcWatermark == null) {
    opts.aigcWatermark = await _confirm({ message: '添加水印？', default: false })
  }

  // 11. 输出格式
  if (!opts.responseFormat) {
    opts.responseFormat = await select({
      message: '返回格式:',
      choices: VALID_RESPONSE_FORMATS.map(f => ({ name: f, value: f })),
    })
  }

  // 12. 输出目录
  if (opts.outputDir == null) {
    const customDir = await _confirm({
      message: `自定义输出目录？（默认 ${i2iConfig.outputDir}）`,
      default: false,
    })
    if (customDir) opts.outputDir = await input({ message: '输出目录:' })
  }

  // 13. 文字叠加
  if (opts.textOverlay == null) {
    opts.textOverlay = await _confirm({
      message: '启用文字自动提取与叠加？（推荐）',
      default: true,
    })
  }

  // 14. 保存背景（图生图下即为输入图副本，便于后续 --reuse）
  if (opts.saveBackground == null) {
    opts.saveBackground = await _confirm({
      message: '保存输入图为背景副本（供后续复用 / 重渲染）？',
      default: true,
    })
  }

  return opts
}

export async function interactiveMode(executeFn) {
  console.log(`
╔══════════════════════════════════════╗
║     MiniMax 图生图 · 交互模式        ║
║     API: image-01 / image-01-live   ║
╚══════════════════════════════════════╝
`)

  // 步骤 0：选择入口
  const presets = loadPresets(i2iConfig.presetsFile)
  const presetNames = Object.keys(presets)

  if (presetNames.length > 0) {
    const choice = await select({
      message: `检测到 ${presetNames.length} 个 i2i 预设，请选择操作:`,
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

      const opts = await collectOptionsMerged(preset)
      printSummary(opts)
      const go = await _confirm({ message: '确认开始生成？', default: true })
      if (!go) {
        console.log('已取消')
        return
      }
      await executeFn(opts)
      return
    }

    if (choice === 'manage') {
      const names = listPresets(i2iConfig.presetsFile)
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
            deletePreset(i2iConfig.presetsFile, toDelete)
            console.log(`  ✅ 已删除 "${toDelete}"`)
          }
        }
      }
      console.log('')
      return
    }
  }

  // 正常交互流程
  const opts = await collectOptionsMerged({})
  printSummary(opts)
  const go = await _confirm({ message: '确认开始生成？', default: true })
  if (!go) {
    console.log('已取消')
    return
  }

  // 询问是否保存为预设
  const saveAsPreset = await _confirm({ message: '将当前配置保存为预设？', default: false })
  if (saveAsPreset) {
    const name = await input({ message: '预设名称:' })
    if (name.trim()) {
      // 剥离 runtime 字段：inputImage（每次必问）、prompt（每次必问）、seed（运行时）、saveBackground（本次行为）、reuseBackground（本次行为）
      const { inputImage, prompt, seed, saveBackground, reuseBackground, ...presetConfig } = opts
      if (presetConfig.outputDir == null) {
        presetConfig.outputDir = i2iConfig.outputDir
      }
      savePreset(i2iConfig.presetsFile, name.trim(), presetConfig)
      console.log(`✅ 预设 "${name.trim()}" 已保存 (${Object.keys(presetConfig).length} 项配置)`)
    }
  }

  await executeFn(opts)
}
