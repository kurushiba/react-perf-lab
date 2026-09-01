/**
 * ⚠️ 講座から外した旧 Sec.8（データ取得とキャッシュ）の教材。
 * `src/labs/registry.ts` から除外済みで、ラボ一覧にも URL にも出ない。
 * レクチャー番号（8-1〜8-4）は旧体系のまま。経緯と復活手順は 目次.md の
 * 「アーカイブ（講座から外したセクション）」節を参照。
 */
/**
 * before / after で共有する定数（規約14：変えないものだけ共有する）。
 */

export const LIST_PAGE = 0

/**
 * 100件取るのは、モックAPIの遅延が id から決定的に決まるため。
 * この範囲に id=25（600ms）と id=26（200ms）が入っていて、
 * 「先に投げた方が後から返る」組み合わせが毎回同じように再現する（8-2 の事故②）。
 */
export const LIST_SIZE = 100

/** 8-2 のレースコンディションを再現する順番。上から順にクリックする */
export const RACE_PAIR = [25, 26] as const

/** 8-4 の N+1。行ごとに詳細を取りに行く一覧の件数 */
export const NPLUSONE_IDS = Array.from({ length: 24 }, (_, i) => i + 1)

export const formatYen = (value: number): string => `¥${value.toLocaleString()}`
