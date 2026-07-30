import * as ShibaDate from '../../../vendor/shiba-date'

type LocaleTable = Record<string, ShibaDate.DateLocale>

const LOCALES = ShibaDate as unknown as LocaleTable

/** 設定画面に並べるロケール。ライブラリには60ロケール入っている */
export const LOCALE_TAGS = ['vasjunEivi0', 'kolynQodtun1', 'uromIbzeb2'] as const

export function formatIn(date: Date, tag: string, pattern: string): string {
  const locale = LOCALES[tag]
  if (!locale) return date.toISOString()
  return ShibaDate.formatDate(date, pattern, locale)
}

export function relativeIn(date: Date, base: Date, tag: string): string {
  const locale = LOCALES[tag]
  if (!locale) return ''
  return ShibaDate.formatRelative(date, base, locale)
}
