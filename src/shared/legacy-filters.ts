'use no memo'

/**
 * `02-feed/edge/EffectDeps.tsx` 用。
 *
 * 「フィルタ条件をオブジェクトで返す、外部ライブラリのフック」を想定したスタブ。
 * ファイル先頭に 'use no memo' を置いてあるのは意地悪ではなく、
 * **React Compiler が最適化するのは自分のソースだけで、node_modules の中は最適化しない**
 * という現実をこの1ファイルで再現するため。
 *
 * つまり戻り値のオブジェクトは毎回新しい参照になり、
 * これを `useEffect` の依存に渡すと毎回「変わった」と判定される。
 */
export interface LegacyFilters {
  tab: string
  minLikes: number
}

export function useLegacyFilters(tab: string, minLikes: number): LegacyFilters {
  return { tab, minLikes }
}
