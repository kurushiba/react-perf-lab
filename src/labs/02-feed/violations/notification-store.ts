/**
 * 04-ExternalStore 用の、Reactの外にある小さなストア。
 * 購読API（subscribe / getSnapshot）はちゃんと生えている。
 * 違反側はそれを使わず、値を直接読んでしまっているという構図。
 */

let count = 3
const listeners = new Set<() => void>()

function emit(): void {
  for (const listener of listeners) listener()
}

export const notificationStore = {
  /** 違反側はこれをレンダー中に直接呼ぶ（購読しないので更新に気付けない） */
  getSnapshot(): number {
    return count
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },

  add(): void {
    count += 1
    emit()
  },

  reset(): void {
    count = 3
    emit()
  },
}
