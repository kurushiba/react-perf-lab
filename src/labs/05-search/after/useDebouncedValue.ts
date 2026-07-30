import { useEffect, useState } from 'react'

/**
 * 入力が止まってから delayMs 後の値を返す（7-4）。
 *
 * ここでの setTimeout は「遅延の偽装」ではなく debounce の実装そのもの。
 *
 * throttle との違い：
 *   debounce = 止まるまで実行しない（検索・入力補完のように、途中経過に意味がない処理向き）
 *   throttle = 一定間隔で必ず実行する（スクロール追従のように、途中経過にも意味がある処理向き）
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
