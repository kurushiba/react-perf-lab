/**
 * shiba-date / フォーマッタ
 *
 * パターン文字列に沿って日付を整形する。
 *
 * scripts/gen-vendor.mjs による生成物。直接編集しない。
 */

import type { DateLocale } from './types'

const pad = (value: number, width: number): string => String(value).padStart(width, '0')

/**
 * yyyy / MM / MMM / MMMM / dd / d / HH / mm / ss / EEE / EEEE / a に対応する。
 * ロケールを引数で受け取るので、使うロケールだけ import すれば足りる。
 */
export function formatDate(date: Date, pattern: string, locale: DateLocale): string {
  const tokens: Record<string, string> = {
    yyyy: String(date.getFullYear()),
    yy: pad(date.getFullYear() % 100, 2),
    MMMM: locale.months[date.getMonth()],
    MMM: locale.monthsShort[date.getMonth()],
    MM: pad(date.getMonth() + 1, 2),
    dd: pad(date.getDate(), 2),
    HH: pad(date.getHours(), 2),
    mm: pad(date.getMinutes(), 2),
    ss: pad(date.getSeconds(), 2),
    EEEE: locale.weekdays[date.getDay()],
    EEE: locale.weekdaysShort[date.getDay()],
    a: locale.dayPeriods[date.getHours() < 12 ? 0 : 1],
  }

  return pattern.replace(/yyyy|yy|MMMM|MMM|MM|dd|HH|mm|ss|EEEE|EEE|a/g, (token) => tokens[token])
}

const UNIT_SECONDS = [1, 60, 3600, 86400, 604800, 2592000, 31536000]

/** 「3日前」のような相対表現。ロケールの relative 表を使う */
export function formatRelative(date: Date, base: Date, locale: DateLocale): string {
  const diff = (date.getTime() - base.getTime()) / 1000
  const magnitude = Math.abs(diff)

  let index = 0
  for (let i = UNIT_SECONDS.length - 1; i >= 0; i--) {
    if (magnitude >= UNIT_SECONDS[i]) {
      index = i
      break
    }
  }

  const amount = Math.round(magnitude / UNIT_SECONDS[index])
  const template = diff < 0 ? locale.relative.past : locale.relative.future
  return template.replace('{0}', amount + ' ' + locale.relative.units[index])
}
