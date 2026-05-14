// Auto-generated — do not edit manually
import type { SkillKey } from '../index';

const modules = {
  'bage': () => import('./bage').then(m => m.default as string),
  'bazi-research-dispute-exec': () => import('./bazi-research-dispute-exec').then(m => m.default as string),
  'dizhi': () => import('./dizhi').then(m => m.default as string),
  'kundao': () => import('./kundao').then(m => m.default as string),
  'liqi': () => import('./liqi').then(m => m.default as string),
  'peihe': () => import('./peihe').then(m => m.default as string),
  'rendao': () => import('./rendao').then(m => m.default as string),
  'tiandao': () => import('./tiandao').then(m => m.default as string),
  'tiangan': () => import('./tiangan').then(m => m.default as string),
  'zhiming': () => import('./zhiming').then(m => m.default as string),
} as const;

export const skillKeys = ["bage","bazi-research-dispute-exec","dizhi","kundao","liqi","peihe","rendao","tiandao","tiangan","zhiming"] as const;
export const skillContent: Record<SkillKey, () => Promise<string>> = modules as any;
