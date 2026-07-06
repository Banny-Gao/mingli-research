/**
 * scripts/lib/t2i/interactive.js — 交互模式 UI
 *
 * 使用 @inquirer/prompts 提供方向键选择、搜索过滤、输入校验。
 * 10 步引导式问答 + 预设管理入口。
 */

import { input, select, confirm, number, Separator } from '@inquirer/prompts'
import { loadPresets, savePreset, deletePreset, listPresets } from './presets.js'
import {
  VALID_MODELS,
  VALID_ASPECT_RATIOS,
  VALID_STYLES,
  VALID_RESPONSE_FORMATS,
} from './constants.js'
import { t2iConfig } from './constants.js'
import { pickExistingImage } from '../shared/pick-image.js'

function printSummary(opts) {
  console.log('\n' + '─'.repeat(46))
  console.log('📋 配置摘要')
  console.log('─'.repeat(46))
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
  console.log(`  Output:           ${opts.outputDir || './public/images'}`)
  if (opts.reuseBackground) console.log(`  Reuse BG:         ${opts.reuseBackground}`)
  console.log('─'.repeat(46))
}

async function collectOptions() {
  return collectOptionsMerged({})
}

/**
 * 引导式收集所有生成选项。preset 中已有的字段跳过询问、直接使用 preset 值；
 * 缺失的字段（尤其是 prompt）按交互流程补齐。这样加载预设时用户仍能补全漏项，
 * 同时已被 preset 锁定的参数不会被无关问题打扰。
 */
async function collectOptionsMerged(preset) {
  const opts = { ...preset }

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

  // 2. Model
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

  // 3. 分辨率 / 宽高比
  if (opts.width == null && opts.height == null && !opts.aspectRatio) {
    if (opts.model === 'image-01') {
      const useCustomRes = await confirm({
        message: '自定义分辨率？(否则使用宽高比)',
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

  // 4. Style（仅 image-01-live）
  if (opts.model === 'image-01-live' && !opts.style) {
    opts.style = await select({
      message: '选择风格:',
      choices: VALID_STYLES.map(s => ({ name: s, value: s })),
    })
    const customWeight = await confirm({ message: '自定义风格权重？(默认 0.8)', default: false })
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

  // 5. 生成数量
  if (opts.n == null) {
    opts.n = await number({ message: '生成数量:', min: 1, max: 9, default: 1 })
  }

  // 6. Seed
  if (opts.seed == null) {
    const useSeed = await confirm({ message: '指定随机种子？(用于复现结果)', default: false })
    if (useSeed) {
      opts.seed = await number({ message: '随机种子 (整数):' })
    }
  }

  // 7. Prompt Optimizer
  if (opts.promptOptimizer == null) {
    opts.promptOptimizer = await confirm({ message: '启用 Prompt 自动优化？', default: false })
  }

  // 8. Watermark
  if (opts.aigcWatermark == null) {
    opts.aigcWatermark = await confirm({ message: '添加水印？', default: false })
  }

  // 9. 输出格式
  if (!opts.responseFormat) {
    opts.responseFormat = await select({
      message: '返回格式:',
      choices: VALID_RESPONSE_FORMATS.map(f => ({ name: f, value: f })),
    })
  }

  // 10. 输出目录（仅在缺失时询问，避免覆盖 preset 的设置）
  if (opts.outputDir == null) {
    const customDir = await confirm({
      message: '自定义输出目录？(默认 ./public/images)',
      default: false,
    })
    if (customDir) {
      opts.outputDir = await input({ message: '输出目录:' })
    }
  }

  // 11. 文字叠加：preset 已有则沿用，否则询问（默认开启）
  if (opts.textOverlay == null) {
    opts.textOverlay = await confirm({
      message: '启用文字自动提取与叠加？(推荐)',
      default: true,
    })
  }

  return opts
}

export async function interactiveMode(executeFn) {
  console.log(`
╔══════════════════════════════════════╗
║     MiniMax 文生图 · 交互模式        ║
║     API: image-01 / image-01-live   ║
╚══════════════════════════════════════╝
`)

  // 步骤 0：选择入口
  const presets = loadPresets()
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

      // 用预设值作默认值；preset 中缺失的字段回退到交互询问
      const opts = await collectOptionsMerged(preset)

      // 背景复用 / 保存（与新建流程对齐：本轮操作，preset 不携带）
      const reuseBg = await confirm({ message: '复用已有背景图？', default: false })
      if (reuseBg) {
        opts.reuseBackground = await pickExistingImage({ message: '选择复用背景图：' })
      } else {
        opts.saveBackground = await confirm({
          message: '保存纯背景图（供后续复用）？',
          default: false,
        })
      }

      printSummary(opts)
      const go = await confirm({ message: '确认开始生成？', default: true })
      if (!go) {
        console.log('已取消')
        return
      }
      await executeFn(opts)
      return
    }

    if (choice === 'manage') {
      const presets = loadPresets()
      const names = Object.keys(presets)
      if (names.length === 0) {
        console.log('  (暂无预设)')
      } else {
        const toDelete = await select({
          message: '选择要删除的预设:',
          choices: [{ name: '← 返回', value: null }, ...names.map(n => ({ name: n, value: n }))],
        })
        if (toDelete) {
          const ok = await confirm({ message: `确认删除预设 "${toDelete}"？`, default: false })
          if (ok) {
            deletePreset(undefined, toDelete)
            console.log(`  ✅ 已删除 "${toDelete}"`)
          }
        }
      }
      // 管理操作完成后回到主菜单，不进入后续的图像创建流程
      console.log('')
      return
    }
  }

  // 正常交互流程
  const opts = await collectOptions()

  // 背景复用（textOverlay 已在 collectOptionsMerged 内部询问，preset 加载时跳过）
  const reuseBg = await confirm({ message: '复用已有背景图？', default: false })
  if (reuseBg) {
    opts.reuseBackground = await pickExistingImage({ message: '选择复用背景图：' })
  } else {
    opts.saveBackground = await confirm({ message: '保存纯背景图（供后续复用）？', default: false })
  }

  printSummary(opts)

  const go = await confirm({ message: '确认开始生成？', default: true })
  if (!go) {
    console.log('已取消')
    return
  }

  // 询问是否保存为预设
  const saveAsPreset = await confirm({ message: '将当前配置保存为预设？', default: false })
  if (saveAsPreset) {
    const name = await input({ message: '预设名称:' })
    if (name.trim()) {
      // 仅剥离运行时/临时字段：prompt（每次必问）、seed（复现用）、reuseBackground/saveBackground（本次行为）
      const { prompt, seed, reuseBackground, saveBackground, ...presetConfig } = opts
      // 显式写入默认输出目录，避免下次加载时被反向询问"自定义目录？"
      if (presetConfig.outputDir == null) {
        presetConfig.outputDir = t2iConfig.outputDir
      }
      savePreset(undefined, name.trim(), presetConfig)
      console.log(`✅ 预设 "${name.trim()}" 已保存 (${Object.keys(presetConfig).length} 项配置)`)
    }
  }

  await executeFn(opts)
}
