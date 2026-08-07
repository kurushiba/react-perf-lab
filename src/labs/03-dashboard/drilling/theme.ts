import type { Theme } from '../types'

export type { Theme }

/** theme を「実際に使っている」ことが画面で分かるようにするための見た目 */
export function cardStyle(theme: Theme) {
  return theme === 'contrast'
    ? { background: '#172b4d', color: '#ffffff', borderColor: '#172b4d' }
    : undefined
}

export function themeLabel(theme: Theme) {
  return theme === 'light' ? '標準' : '高コントラスト'
}

export function nextTheme(theme: Theme): Theme {
  return theme === 'light' ? 'contrast' : 'light'
}

/** before / after で同じものを並べるため、計測対象のコンポーネント名はここに集約する */
export const TREE = [
  'App',
  'Layout',
  'Sidebar',
  'NavList',
  'ThemeSwitch',
  'Content',
  'Toolbar',
  'SearchBox',
  'ReportCard',
  'Footer',
  'StatusBar',
] as const

/** theme を実際に読んでいるコンポーネント。ここ以外の再レンダリングは全部むだ */
export const CONSUMERS = ['ThemeSwitch', 'ReportCard', 'StatusBar'] as const
