#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { syncAuthFromEnvToMcp } = require("./auth-env.cjs");

const HOME = process.env.HOME || process.env.USERPROFILE;
const GLOBAL_CONFIG = path.join(HOME, ".claude.json");

// Find project root (where .claude directory exists)
let projectRoot = __dirname;
while (
  !fs.existsSync(path.join(projectRoot, ".claude", "mcp.local.json")) &&
  !fs.existsSync(path.join(projectRoot, ".claude", "mcp.json")) &&
  projectRoot !== "/"
) {
  projectRoot = path.dirname(projectRoot);
}

const localProjectConfigPath = path.join(projectRoot, ".claude", "mcp.local.json");
const defaultProjectConfigPath = path.join(projectRoot, ".claude", "mcp.json");
const PROJECT_CONFIG = fs.existsSync(localProjectConfigPath) ? localProjectConfigPath : defaultProjectConfigPath;

// Define required API keys that need user input if empty
const REQUIRED_KEYS = [
  {
    mcp: "MiniMax",
    path: ["env", "MINIMAX_API_KEY"],
    label: "MiniMax API Key",
    hint: "从 https://platform.minimaxi.com 获取（用于网络搜索 + 图片分析）",
  },
  {
    mcp: "context7",
    path: ["headers", "CONTEXT7_API_KEY"],
    label: "Context7 API Key",
    hint: "从 https://context7.com 申请（用于组件库文档查询）",
  },
  {
    mcp: "playwright",
    path: ["env", "PLAYWRIGHT_MCP_EXTENSION_TOKEN"],
    label: "Playwright MCP Extension Token",
    hint: "Playwright MCP 扩展密钥（用于 E2E 浏览器测试）",
  },
  {
    mcp: "figma",
    path: ["env", "FIGMA_API_KEY"],
    label: "Figma API Key",
    hint: "从 Figma → Settings → Personal Access Tokens 创建（用于设计稿解析）",
  },
];

console.log("🔧 MCP 配置工具\n");

// ── Interactive prompt ──────────────────────────────────────────
function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// ── Check & fill empty keys ─────────────────────────────────────
async function checkAndFillKeys(config) {
  let updated = false;

  for (const key of REQUIRED_KEYS) {
    const service = config.mcpServers[key.mcp];
    if (!service) continue;

    // Navigate to the value at the specified path
    let current = service;
    for (let i = 0; i < key.path.length - 1; i++) {
      current = current[key.path[i]];
      if (!current) break;
    }
    const value = current ? current[key.path[key.path.length - 1]] : undefined;

    if (!value || value === "") {
      console.log(`\n⚠️  ${key.mcp} → ${key.path.join(".")} 为空`);
      console.log(`   ${key.hint}`);

      const input = await ask(`   请输入 ${key.label}（回车跳过）：`);

      if (input) {
        // Navigate and set
        let target = service;
        for (let i = 0; i < key.path.length - 1; i++) {
          if (!target[key.path[i]]) target[key.path[i]] = {};
          target = target[key.path[i]];
        }
        target[key.path[key.path.length - 1]] = input;
        updated = true;
        console.log(`   ✅ ${key.label} 已更新`);
      } else {
        console.log(`   ⏭️  已跳过，该 MCP 服务可能无法正常使用`);
      }
    }
  }

  if (updated) {
    // Preserve the non-mcpServers fields
    const preserved = {};
    Object.keys(config).forEach((k) => {
      if (k !== "mcpServers") preserved[k] = config[k];
    });

    const newConfig = { ...preserved, mcpServers: config.mcpServers };
    fs.writeFileSync(PROJECT_CONFIG, JSON.stringify(newConfig, null, 2) + "\n");
    console.log(`\n💾 已更新 ${path.basename(PROJECT_CONFIG)}`);
  }

  return updated;
}

// ── Sync to global config ───────────────────────────────────────
function syncToGlobal(config) {
  if (!fs.existsSync(GLOBAL_CONFIG)) {
    console.error("❌ 未找到全局配置文件 ~/.claude.json");
    process.exit(1);
  }

  const globalConfig = JSON.parse(fs.readFileSync(GLOBAL_CONFIG, "utf8"));
  if (!globalConfig.mcpServers) globalConfig.mcpServers = {};

  const mergedConfig = { ...globalConfig.mcpServers };

  Object.keys(config.mcpServers || {}).forEach((key) => {
    const cfg = { ...config.mcpServers[key] };

    // Convert relative paths to absolute
    if (cfg.args && Array.isArray(cfg.args)) {
      cfg.args = cfg.args.map((arg) => {
        if (arg && (arg.startsWith("./") || arg.startsWith("../"))) {
          return path.resolve(projectRoot, arg);
        }
        return arg;
      });
    }
    if (cfg.env) {
      Object.keys(cfg.env).forEach((envKey) => {
        const envVal = cfg.env[envKey];
        if (envVal && !path.isAbsolute(envVal) && envVal.startsWith("./")) {
          cfg.env[envKey] = path.resolve(projectRoot, envVal);
        }
      });
    }

    console.log(`✅ 添加 MCP: ${key}`);
    mergedConfig[key] = cfg;
  });

  globalConfig.mcpServers = mergedConfig;
  fs.writeFileSync(GLOBAL_CONFIG, JSON.stringify(globalConfig, null, 2));

  console.log("\n✨ MCP 配置已同步到 ~/.claude.json");
}

// ── Main ────────────────────────────────────────────────────────
async function main() {
  if (!fs.existsSync(PROJECT_CONFIG)) {
    console.error(`❌ 未找到项目配置文件: ${PROJECT_CONFIG}`);
    process.exit(1);
  }

  let projectConfig = JSON.parse(fs.readFileSync(PROJECT_CONFIG, "utf8"));

  // 0. 从 .env 同步 JIRA/YAPI 认证到 mcp 配置
  const authSync = await syncAuthFromEnvToMcp(projectRoot);
  if (authSync.synced) {
    console.log(`✅ 已从 .env 同步认证到 MCP 配置（${authSync.syncedFiles} 个文件）`);
    if (authSync.jira?.valid) console.log("   JIRA 认证: 已配置");
    if (authSync.yapi?.valid) console.log("   YAPI 认证: 已配置");
    projectConfig = JSON.parse(fs.readFileSync(PROJECT_CONFIG, "utf8"));
  }

  // 1. Check and fill empty keys
  const filled = await checkAndFillKeys(projectConfig);

  if (filled) {
    // Re-read the updated config
    const updated = JSON.parse(fs.readFileSync(PROJECT_CONFIG, "utf8"));
    syncToGlobal(updated);
  } else {
    syncToGlobal(projectConfig);
  }

  console.log("\n⚠️  请重启 Claude Code 使 MCP 配置生效。");

  // Check if any required key is still empty
  let missingCount = 0;
  const finalConfig = JSON.parse(fs.readFileSync(PROJECT_CONFIG, "utf8"));
  for (const key of REQUIRED_KEYS) {
    const service = finalConfig.mcpServers[key.mcp];
    if (!service) continue;
    let current = service;
    for (let i = 0; i < key.path.length - 1; i++) {
      current = current[key.path[i]];
      if (!current) break;
    }
    const value = current ? current[key.path[key.path.length - 1]] : undefined;
    if (!value || value === "") {
      missingCount++;
      console.log(`⚠️  ${key.mcp} 仍缺少 ${key.label}，该服务将不可用`);
    }
  }
  if (missingCount > 0) {
    console.log(`\n💡 稍后可编辑 ${path.basename(PROJECT_CONFIG)} 补充后重新运行: node scripts/setup/mcp.cjs`);
  }
}

main();
