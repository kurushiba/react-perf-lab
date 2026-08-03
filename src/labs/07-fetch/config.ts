/**
 * before / after で共有する定数（規約14：変えないものだけ共有する）。
 */

export const LIST_PAGE = 0

/**
 * 100件取るのは、モックAPIの遅延が id から決定的に決まるため。
 * この範囲に p-00081（600ms）と p-00082（200ms）が入っていて、
 * 「先に投げた方が後から返る」組み合わせが毎回同じように再現する（8-2 の事故②）。
 */
export const LIST_SIZE = 100

/** 8-2 のレースコンディションを再現する順番。上から順にクリックする */
export const RACE_PAIR = ['p-00081', 'p-00082'] as const

/** 8-4 の N+1。行ごとに詳細を取りに行く一覧の件数 */
export const NPLUSONE_IDS = Array.from(
  { length: 24 },
  (_, i) => `p-${String(i + 1).padStart(5, '0')}`,
)

export const formatYen = (value: number): string => `¥${value.toLocaleString()}`
