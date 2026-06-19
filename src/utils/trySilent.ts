// src/utils/trySilent.ts

/**
 * 同步 try/catch 包装：fn 抛错时返回 fallback（默认 null），不重新抛出。
 *
 * 设计动机：消除"try { ... } catch { /* 忽略 *\/ }" 反模式，集中表达"我知道这步
 * 可能失败，失败时做 X" 的意图。典型场景：清理 DOM、page-flip 实例销毁等。
 *
 * **不处理 async 异常** —— async fn 抛错需由调用方 .catch() 或 try/catch 显式处理。
 * 这是有意约束：trySilent 不掩盖 async 错误，避免 unhandled rejection。
 */
export function trySilent<T>(fn: () => T): T | null
export function trySilent<T, F>(fn: () => T, fallback: F): T | F
export function trySilent<T, F>(fn: () => T, fallback?: F): T | F | null {
  try {
    return fn()
  } catch {
    return fallback ?? null
  }
}
