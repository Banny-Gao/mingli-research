/**
 * scripts/lib/generate-interpretations-cli.js — CLI 参数解析
 */

export function parseCliArgs(argv) {
  const args = {
    slug: null,
    chapters: null,
    force: false,
    dryRun: false,
    apiKey: null,
    baseUrl: null,
    model: null,
    concurrency: null,
  }

  let i = 0
  // 位置参数 1: slug
  if (argv[i] && !argv[i].startsWith('--')) {
    args.slug = argv[i]
    i++
  }
  // 位置参数 2: chapters (逗号分隔)
  if (argv[i] && !argv[i].startsWith('--')) {
    args.chapters = argv[i]
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
    i++
  }

  // flag 参数
  while (i < argv.length) {
    const flag = argv[i]
    if (flag === '--force') args.force = true
    else if (flag === '--dry-run') args.dryRun = true
    else if (flag === '--api-key') {
      if (argv[i + 1] && !argv[i + 1].startsWith('--')) args.apiKey = argv[++i]
      else throw new Error('--api-key 需要参数值')
    } else if (flag === '--base-url') {
      if (argv[i + 1] && !argv[i + 1].startsWith('--')) args.baseUrl = argv[++i]
      else throw new Error('--base-url 需要参数值')
    } else if (flag === '--model') {
      if (argv[i + 1] && !argv[i + 1].startsWith('--')) args.model = argv[++i]
      else throw new Error('--model 需要参数值')
    } else if (flag === '--concurrency' || flag === '-c') {
      if (argv[i + 1] && !argv[i + 1].startsWith('--')) {
        const n = Number(argv[++i])
        if (!Number.isInteger(n) || n < 1) throw new Error('--concurrency 必须是 ≥1 的整数')
        args.concurrency = n
      } else {
        throw new Error('--concurrency 需要参数值')
      }
    } else if (flag === '--help' || flag === '-h') args.help = true
    i++
  }

  return args
}
