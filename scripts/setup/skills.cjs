#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// 递归复制目录
function copyDir(src, dest) {
  try {
    fs.mkdirSync(dest, { recursive: true });
  } catch (err) {
    console.error(`❌ 无法创建目录 ${dest}: ${err.message}`);
    throw err;
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    try {
      if (entry.isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    } catch (err) {
      console.error(`❌ 复制失败 ${srcPath} -> ${destPath}: ${err.message}`);
      throw err;
    }
  }
}

const HOME = process.env.HOME || process.env.USERPROFILE;
const GLOBAL_SKILLS_DIR = path.join(HOME, ".claude", "skills");
const PROJECT_SKILLS_DIR = path.join(__dirname, "..", ".claude", "skills");

console.log("🔧 Skill 同步工具\n");

// Check if project skills directory exists
if (!fs.existsSync(PROJECT_SKILLS_DIR)) {
  console.error("❌ 未找到项目 skills 目录: " + PROJECT_SKILLS_DIR);
  process.exit(1);
}

// Ensure global skills directory exists
if (!fs.existsSync(GLOBAL_SKILLS_DIR)) {
  fs.mkdirSync(GLOBAL_SKILLS_DIR, { recursive: true });
  console.log("✅ 创建全局 skills 目录: " + GLOBAL_SKILLS_DIR);
}

// Read project skills
const projectSkills = fs
  .readdirSync(PROJECT_SKILLS_DIR, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name);

if (projectSkills.length === 0) {
  console.log("📭 项目中没有找到 skills");
  process.exit(0);
}

console.log("📦 发现项目 skills: " + projectSkills.join(", "));

// 由专用 setup 脚本管理的 skill，跳过避免重复同步
const MANAGED_BY_SETUP = ["ccc", "gitnexus"];

// Helper: sync a single skill from source to target
function syncSkill(skillName, sourceDir, targetDir) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
  entries.forEach((entry) => {
    const srcPath = path.join(sourceDir, entry.name);
    const destPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      try {
        fs.copyFileSync(srcPath, destPath);
      } catch (err) {
        console.error(`❌ 复制失败 ${srcPath} -> ${destPath}: ${err.message}`);
        throw err;
      }
    }
  });

  console.log(`  ✅ 同步 skill: ${skillName}`);
}

// Sync each skill
let syncedCount = 0;
let skippedCount = 0;
let containerCount = 0;

const filteredSkills = projectSkills.filter(
  (name) => !MANAGED_BY_SETUP.includes(name)
);
const skippedManaged = projectSkills.length - filteredSkills.length;

filteredSkills.forEach((skillName) => {
  const sourceDir = path.join(PROJECT_SKILLS_DIR, skillName);
  const targetDir = path.join(GLOBAL_SKILLS_DIR, skillName);

  const skillFile = path.join(sourceDir, "SKILL.md");

  if (fs.existsSync(skillFile)) {
    // 普通 skill，直接同步
    syncSkill(skillName, sourceDir, targetDir);
    syncedCount++;
    return;
  }

  // 检查是否是 skill 容器目录（子目录含 SKILL.md）
  const subDirs = fs
    .readdirSync(sourceDir, { withFileTypes: true })
    .filter((d) => d.isDirectory());

  const nestedSkills = subDirs.filter((d) =>
    fs.existsSync(path.join(sourceDir, d.name, "SKILL.md"))
  );

  if (nestedSkills.length > 0) {
    // 是 skill 容器，同步每个子 skill
    console.log(`  📂 ${skillName}/: 发现 ${nestedSkills.length} 个嵌套 skill`);
    nestedSkills.forEach((sub) => {
      const subSource = path.join(sourceDir, sub.name);
      const subTarget = path.join(targetDir, sub.name);
      syncSkill(`${skillName}/${sub.name}`, subSource, subTarget);
    });
    containerCount++;
    syncedCount += nestedSkills.length;
  } else {
    console.log(`  ℹ️  跳过 ${skillName}: 非 skill 目录`);
    skippedCount++;
  }
});

console.log("\n" + "=".repeat(50));
console.log("📊 同步结果汇总:");
console.log(`  ✅ 同步 ${syncedCount} 个 skill`);
if (containerCount > 0) console.log(`  📂 其中 ${containerCount} 个容器目录`);
if (skippedManaged > 0) console.log(`  ⏭️  跳过 ${skippedManaged} 个（由专用 setup 脚本管理）`);
if (skippedCount > 0) console.log(`  ℹ️  跳过 ${skippedCount} 个非 skill 目录`);
console.log("\n📍 全局目录: " + GLOBAL_SKILLS_DIR);
console.log("✨ Skills 同步完成！重启 Claude Code 生效。");
