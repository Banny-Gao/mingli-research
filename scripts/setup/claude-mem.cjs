#!/usr/bin/env node

/**
 * Claude-Mem 安装配置脚本
 *
 * 替换 @modelcontextprotocol/server-memory 为 claude-mem，
 * 通过 lifecycle hooks 实现自动记忆捕获、向量检索、会话上下文注入。
 *
 * 前置条件：Node.js ≥ 20
 * 自动安装：Bun（如缺失）、uv（Chroma 向量库依赖）
 */

const { spawn } = require("child_process");

console.log("🧠 Claude-Mem 安装工具\n");
console.log("=".repeat(50));

async function runInstall() {
  console.log("\n📦 正在安装 claude-mem...\n");

  try {
    await new Promise((resolve, reject) => {
      const child = spawn("npx", ["claude-mem", "install"], {
        stdio: "inherit",
        shell: true,
      });

      child.on("close", (code) => {
        code === 0 ? resolve() : reject(new Error(`退出码: ${code}`));
      });

      child.on("error", (err) => reject(err));
    });

    console.log("\n✅ claude-mem 安装完成");
    console.log("\n📋 功能说明:");
    console.log("  - 5 个 lifecycle hooks 自动捕获上下文");
    console.log("  - SQLite + Chroma 向量库存储");
    console.log("  - AI 自动摘要压缩");
    console.log("  - Web 面板: http://localhost:37777");
    console.log("  - 中文模式: code--zh（已默认启用）");
    console.log("  - 隐私保护: <private> 标签排除敏感内容");
    console.log("\n⚠️  请重启 Claude Code 使配置生效。");
  } catch (error) {
    console.error(`\n❌ claude-mem 安装失败: ${error.message}`);
    console.error("\n💡 手动安装: npx claude-mem install");
    process.exit(1);
  }
}

runInstall();
