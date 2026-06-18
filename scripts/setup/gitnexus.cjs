#!/usr/bin/env node

/**
 * GitNexus 初始化脚本
 *
 * 对当前仓库执行 gitnexus analyze，建立代码库索引（符号、调用关系、执行流）、
 * 安装 Agent Skills、注册 Claude Code hooks、生成 AGENTS.md / CLAUDE.md。
 *
 * 优先使用全局安装的 gitnexus，回退到 npx。
 */

const { spawn, execSync } = require("child_process");

console.log("🔍 GitNexus 初始化工具\n");
console.log("=".repeat(50));

function run(cmd, args, label) {
  return new Promise((resolve, reject) => {
    console.log(`\n📦 ${label}...\n`);
    const child = spawn(cmd, args, { stdio: "inherit", shell: true });
    child.on("close", (code) => {
      code === 0 ? resolve() : reject(new Error(`${label} 退出码: ${code}`));
    });
    child.on("error", (err) => reject(err));
  });
}

// 检测是否全局安装，优先用直接路径（避免 npx 冷缓存超时）
function getGitnexusCmd() {
  try {
    execSync("which gitnexus", { stdio: "pipe" });
    return "gitnexus";
  } catch {
    return "npx gitnexus";
  }
}

async function init() {
  const gitnexus = getGitnexusCmd();
  console.log(`📌 使用命令: ${gitnexus}\n`);

  try {
    // 检查是否已索引
    let alreadyIndexed = false;
    try {
      const statusOutput = execSync(`${gitnexus} status`, { encoding: "utf8", stdio: "pipe" });
      if (statusOutput.includes("up-to-date")) {
        alreadyIndexed = true;
        console.log("✅ GitNexus 索引已存在且为最新\n");
      }
    } catch {
      // 未索引或状态检查失败，继续执行 analyze
    }

    if (alreadyIndexed) {
      console.log("💡 如需强制重建索引: gitnexus analyze --force");
      console.log("💡 如需生成嵌入向量: gitnexus analyze --embeddings");
      return;
    }

    // 执行索引分析
    const [cmd, ...args] = gitnexus.split(" ");
    await run(cmd, [...args, "analyze"], "GitNexus 代码库索引分析");

    console.log("\n✅ GitNexus 初始化完成");
    console.log("\n📋 已完成:");
    console.log("  - 代码库索引（符号 + 调用关系 + 执行流）");
    console.log("  - Agent Skills 安装（gitnexus-*）");
    console.log("  - Claude Code hooks 注册");
    console.log("  - AGENTS.md / CLAUDE.md 上下文生成");
    console.log("\n📋 常用命令:");
    console.log("  gitnexus status      查看索引状态");
    console.log("  gitnexus analyze     更新索引");
    console.log("  gitnexus list        列出所有仓库");
    console.log("\n⚠️  请重启 Claude Code 使 hooks 生效。");
  } catch (error) {
    console.error(`\n❌ GitNexus 初始化失败: ${error.message}`);
    console.error("\n💡 手动初始化: gitnexus analyze");
    process.exit(1);
  }
}

init();
