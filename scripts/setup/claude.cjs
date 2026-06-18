#!/usr/bin/env node

/**
 * Claude 环境一键配置工具（同步版）
 *
 * 按固定顺序串行执行所有配置步骤：
 *   1. claude-mem → 2. ccc → 3. gitnexus → 4. skills → 5. mcp
 */

const path = require("path")
const { spawnSync } = require("child_process")

const SCRIPTS_DIR = __dirname

// 固定执行顺序：步骤名 -> 对应的脚本文件名
// 按依赖关系排列：mcp → gitnexus（依赖 mcp），ccc/skills 独立放最后
const STEPS = [
  { name: "claude-mem", script: "setup-claude-mem.cjs" },
  { name: "mcp",        script: "setup-mcp.cjs" },
  { name: "gitnexus",   script: "setup-gitnexus.cjs" },
  { name: "ccc",        script: "setup-ccc.cjs" },
  { name: "skills",     script: "setup-skills.cjs" },
]

console.log("🔧 Claude 环境一键配置工具（同步执行）\n")
console.log("=".repeat(50))
console.log("执行顺序：")
STEPS.forEach((s, i) => console.log(`  ${i + 1}. ${s.name}`))
console.log("=".repeat(50))

function runScript(scriptName) {
  const scriptPath = path.join(SCRIPTS_DIR, scriptName)
  console.log(`\n🚀 执行: ${scriptName}`)
  console.log("-".repeat(50))

  const result = spawnSync("node", [scriptPath], {
    cwd: SCRIPTS_DIR,
    stdio: "inherit",
    shell: true,
  })

  return result.status === 0
}

let successCount = 0
let failCount = 0

for (const step of STEPS) {
  const ok = runScript(step.script)
  if (ok) {
    console.log(`✅ ${step.name} 执行完成\n`)
    successCount++
  } else {
    console.error(`❌ ${step.name} 执行失败\n`)
    failCount++
  }
}

console.log("=".repeat(50))
console.log("📊 执行结果汇总:")
console.log(`  ✅ 成功: ${successCount}`)
console.log(`  ❌ 失败: ${failCount}`)

if (failCount > 0) {
  console.log("\n⚠️  部分步骤执行失败，请检查上方错误信息")
  process.exit(1)
}

console.log("\n✨ 所有配置完成！请重启 Claude Code 使配置生效。")
