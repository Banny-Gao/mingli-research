/**
 * scripts/lib/generate-interpretations-cli.js — CLI 参数解析
 */

export function parseCliArgs(argv) {
  const args = { slug: null, chapters: null, force: false, dryRun: false, apiKey: null, baseUrl: null, model: null }

  let i = 0
  // 位置参数 1: slug
  if (argv[i] && !argv[i].startsWith('--')) {
    args.slug = argv[i]
    i++
  }
  // 位置参数 2: chapters (逗号分隔)
  if (argv[i] && !argv[i].startsWith('--')) {
    args.chapters = argv[i].split(',').map(s => s.trim()).filter(Boolean)
    i++
  }

  // flag 参数
  while (i < argv.length) {
    const flag = argv[i]
    if (flag === '--force') args.force = true
    else if (flag === '--dry-run') args.dryRun = true
    else if (flag === '--api-key') { args.apiKey = argv[++i] }
    else if (flag === '--base-url') { args.baseUrl = argv[++i] }
    else if (flag === '--model') { args.model = argv[++i] }
    else if (flag === '--help' || flag === '-h') args.help = true
    i++
  }

  return args
}
