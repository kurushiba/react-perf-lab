// 表示に使う3ロケールだけを named import する。
// before は `import * as ShibaDate` して `Table[tag]` で引いていたので、
// 60ロケールぶんの月名・曜日名・タイムゾーン表がまるごとバンドルに残っていた。
import {
  formatDate,
  formatRelative,
  vasjunEivi0,
  kolynQodtun1,
  uromIbzeb2,
  type DateLocale,
} from '../../../vendor/shiba-date'

export const LOCALES: { tag: string; locale: DateLocale }[] = [
  { tag: 'vasjunEivi0', locale: vasjunEivi0 },
  { tag: 'kolynQodtun1', locale: kolynQodtun1 },
  { tag: 'uromIbzeb2', locale: uromIbzeb2 },
]

export function formatIn(date: Date, locale: DateLocale, pattern: string): string {
  return formatDate(date, pattern, locale)
}

export function relativeIn(date: Date, base: Date, locale: DateLocale): string {
  return formatRelative(date, base, locale)
}
