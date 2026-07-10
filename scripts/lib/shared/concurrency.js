/**
 * scripts/lib/shared/concurrency.js — 通用并发限流工具
 *
 * 用固定大小 worker 池执行异步任务（简单的 Promise 并发限流）。
 * 任务完成后立刻拉下一个，无需等待整批。
 */

/**
 * @template T
 * @param {Array<T>} items
 * @param {(item: T, index: number) => Promise<any>} worker
 * @param {number} concurrency
 * @returns {Promise<Array<any>>}
 */
export async function runWithConcurrency(items, worker, concurrency) {
  const results = new Array(items.length)
  let next = 0

  async function run() {
    while (true) {
      const idx = next++
      if (idx >= items.length) return
      try {
        results[idx] = await worker(items[idx], idx)
      } catch (err) {
        results[idx] = { success: false, error: err }
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, run)
  await Promise.all(workers)
  return results
}
