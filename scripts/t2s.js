import { Converter } from 'opencc-js';
import fs from 'node:fs';

const converter = Converter({ from: 'tw', to: 'cn' });

export function t2s(text) {
  return converter(text);
}

export function t2sFile(inputPath, outputPath) {
  const text = fs.readFileSync(inputPath, 'utf8');
  fs.writeFileSync(outputPath, t2s(text), 'utf8');
}
