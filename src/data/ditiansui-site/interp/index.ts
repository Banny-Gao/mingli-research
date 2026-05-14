// Auto-generated — do not edit manually
import type { InterpKey } from '../index';

const modules = {
  '天道': () => import('./天道').then(m => m.default as string),
  '坤道': () => import('./坤道').then(m => m.default as string),
  '人道': () => import('./人道').then(m => m.default as string),
  '知命': () => import('./知命').then(m => m.default as string),
  '理气': () => import('./理气').then(m => m.default as string),
  '配合': () => import('./配合').then(m => m.default as string),
  '天干': () => import('./天干').then(m => m.default as string),
  '地支': () => import('./地支').then(m => m.default as string),
  '八格': () => import('./八格').then(m => m.default as string),
} as const;

export const interpKeys = ["天道","坤道","人道","知命","理气","配合","天干","地支","八格"] as const;
export const interpContent: Record<InterpKey, () => Promise<string>> = modules as any;
