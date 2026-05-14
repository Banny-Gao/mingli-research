import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '../dist');
const indexPath = join(distDir, 'index.html');

const assetsDir = join(distDir, 'assets');
let jsFile = '', cssFile = '';

if (existsSync(assetsDir)) {
  for (const f of readdirSync(assetsDir)) {
    if (f.endsWith('.js')) jsFile = f;
    if (f.endsWith('.css')) cssFile = f;
  }
}

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>命理学术中心</title>
<link rel="stylesheet" href="./assets/${cssFile}">
</head>
<body>
<div id="root"></div>
<script type="module" src="./assets/${jsFile}"></script>
</body>
</html>`;

writeFileSync(indexPath, html, 'utf-8');
console.log(`postbuild OK — js: ${jsFile} css: ${cssFile}`);