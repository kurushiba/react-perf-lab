/**
 * 4-4 after — 下げられない state を配るための Context。
 *
 * Context は「通り道を飛ばして、必要な場所に直接届ける」ための道具。
 * ここでは theme と setTheme を1つの Context にまとめている。
 * この「1つにまとめる」がどこまで通用するかは `4-5`・`4-6` で扱う。
 */
import { createContext, useContext } from 'react'
import type { Theme } from '../theme'

export interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext)
  if (value === null) throw new Error('ThemeContext.Provider の外側で使われています')
  return value
}
