#!/usr/bin/env node

const fs = require("fs")
const { spawn } = require("child_process")
const path = require("path")

// 找到项目根目录（向上查找含 package.json 的目录）
let projectRoot = __dirname
while (!fs.existsSync(path.join(projectRoot, "package.json")) && projectRoot !== "/") {
  projectRoot = path.dirname(projectRoot)
}

console.log("🔍 初始化 cocoindex-code...\n")

function runCommand(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd: projectRoot,
      stdio: "inherit",
      shell: true,
    })
    child.on("close", (code) => {
      if (code === 0) resolve()
      else reject(new Error(`"${cmd} ${args.join(" ")}" 退出码: ${code}`))
    })
    child.on("error", reject)
  })
}

async function main() {
  // 检查 ccc 是否可用（--help 始终可用，退出码 0 表示命令存在）
  try {
    await runCommand("ccc", ["--help"])
  } catch {
    console.error(
      `❌ 未找到 ccc 命令或检查失败，请先安装: pipx install cocoindex-code\n`
      + `📎 https://github.com/cocoindex-io/cocoindex-code`,
    )
    process.exit(1)
  }

  // ccc init + ccc index
  await runCommand("ccc", ["init"])
  await runCommand("ccc", ["index"])

  console.log("\n✨ ccc 初始化完成！")
}

main()
