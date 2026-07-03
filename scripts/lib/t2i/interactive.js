/**
 * scripts/lib/t2i/interactive.js — 交互模式 UI
 *
 * 使用 @inquirer/prompts 提供方向键选择、搜索过滤、输入校验。
 * 10 步引导式问答 + 预设管理入口。
 */

import { input, select, confirm, number, Separator } from '@inquirer/prompts'
import { loadPresets, savePreset, deletePreset, listPresets } from './presets.js'
import {
  VALID_MODELS, VALID_ASPECT_RATIOS, VALID_STYLES, VALID_RESPONSE_FORMATS,
} from './constants.js'

function printSummary(opts) {
  console.log('\n' + '─'.repeat(46))
  console.log('📋 配置摘要')
  console.log('─'.repeat(46))
  console.log(`  Model:            ${opts.model}`)
  console.log(`  Prompt:           ${opts.prompt.slice(0, 60)}${opts.prompt.length > 60 ? '...' : ''}`)
  if (opts.width && opts.height) console.log(`  Resolution:       ${opts.width}x${opts.height}`)
  if (opts.aspectRatio) console.log(`  Aspect Ratio:     ${opts.aspectRatio}`)
  if (opts.style) console.log(`  Style:            ${opts.style}${opts.styleWeight ? ` (weight: ${opts.styleWeight})` : ''}`)
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
  const opts = {}

  // 1. Prompt（必填）
  opts.prompt = await input({
    message: '图片描述（必填，最多 1500 字符）:',
    validate: v => {
      if (!v.trim()) return '描述不能为空'
      if (v.length > 1500) return `当前 ${v.length} 字符，超过 1500 上限`
      return true
    },
  })

  // 2. Model
  opts.model = await select({
    message: '选择模型:',
    choices: VALID_MODELS.map((m, i) => ({ name: m, value: m, description: i === 0 ? '通用模型' : '支持风格化' })),
  })

  // 3. 分辨率 / 宽高比
  if (opts.model === 'image-01') {
    const useCustomRes = await confirm({ message: '自定义分辨率？(否则使用宽高比)', default: false })
    if (useCustomRes) {
      opts.width = await number({ message: '宽度 (px, 512-2048, 8的倍数):', min: 512, max: 2048, default: 1024 })
      opts.width = Math.round(opts.width / 8) * 8
      opts.height = await number({ message: '高度 (px, 512-2048, 8的倍数):', min: 512, max: 2048, default: 1024 })
      opts.height = Math.round(opts.height / 8) * 8
    } else {
      opts.aspectRatio = await select({
        message: '选择宽高比:',
        choices: VALID_ASPECT_RATIOS.slice(0, 7).map((r, i) => ({ name: r, value: r, description: i === 0 ? '方形' : undefined })),
      })
    }
  } else {
    opts.aspectRatio = await select({
      message: '选择宽高比:',
      choices: VALID_ASPECT_RATIOS.slice(0, 7).map((r, i) => ({ name: r, value: r, description: i === 0 ? '方形' : undefined })),
    })
  }

  // 4. Style（仅 image-01-live）
  if (opts.model === 'image-01-live') {
    opts.style = await select({
      message: '选择风格:',
      choices: VALID_STYLES.map(s => ({ name: s, value: s })),
    })
    const customWeight = await confirm({ message: '自定义风格权重？(默认 0.8)', default: false })
    if (customWeight) {
      opts.styleWeight = await number({ message: '风格权重 (0.01-1):', min: 0.01, max: 1, default: 0.8, step: 0.01 })
    }
  }

  // 5. 生成数量
  opts.n = await number({ message: '生成数量:', min: 1, max: 9, default: 1 })

  // 6. Seed
  const useSeed = await confirm({ message: '指定随机种子？(用于复现结果)', default: false })
  if (useSeed) {
    opts.seed = await number({ message: '随机种子 (整数):' })
  }

  // 7. Prompt Optimizer
  opts.promptOptimizer = await confirm({ message: '启用 Prompt 自动优化？', default: false })

  // 8. Watermark
  opts.aigcWatermark = await confirm({ message: '添加水印？', default: false })

  // 9. 输出格式
  opts.responseFormat = await select({
    message: '返回格式:',
    choices: VALID_RESPONSE_FORMATS.map(f => ({ name: f, value: f })),
  })

  // 10. 输出目录
  const customDir = await confirm({
    message: '自定义输出目录？(默认 ./public/images)',
    default: false,
  })
  if (customDir) {
    opts.outputDir = await input({ message: '输出目录:' })
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

      // 仍需输入 prompt
      preset.prompt = await input({
        message: '图片描述（必填，最多 1500 字符）:',
        validate: v => {
          if (!v.trim()) return '描述不能为空'
          if (v.length > 1500) return `当前 ${v.length} 字符，超过 1500 上限`
          return true
        },
      })

      printSummary(preset)
      const go = await confirm({ message: '确认开始生成？', default: true })
      if (!go) { console.log('已取消'); return }
      await executeFn(preset)
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
          choices: [
            { name: '← 返回', value: null },
            ...names.map(n => ({ name: n, value: n })),
          ],
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

  // 文字叠加
  opts.textOverlay = await confirm({ message: '启用文字自动提取与叠加？(推荐)', default: true })

  // 背景复用
  const reuseBg = await confirm({ message: '复用已有背景图？', default: false })
  if (reuseBg) {
    opts.reuseBackground = await input({ message: '背景图路径:' })
  } else {
    opts.saveBackground = await confirm({ message: '保存纯背景图（供后续复用）？', default: false })
  }

  printSummary(opts)

  const go = await confirm({ message: '确认开始生成？', default: true })
  if (!go) { console.log('已取消'); return }

  // 询问是否保存为预设
  const saveAsPreset = await confirm({ message: '将当前配置保存为预设？', default: false })
  if (saveAsPreset) {
    const name = await input({ message: '预设名称:' })
    if (name.trim()) {
      const { prompt, seed, textOverlay, saveBackground, reuseBackground, ...presetConfig } = opts
      savePreset(undefined, name.trim(), presetConfig)
      console.log(`✅ 预设 "${name.trim()}" 已保存 (${Object.keys(presetConfig).length} 项配置)`)
    }
  }

  await executeFn(opts)
}
