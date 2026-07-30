/**
 * shiba-date / 型
 *
 * ロケール定義の形。
 *
 * scripts/gen-vendor.mjs による生成物。直接編集しない。
 */
export interface DateLocale {
  tag: string
  months: string[]
  monthsShort: string[]
  weekdays: string[]
  weekdaysShort: string[]
  eras: string[]
  dayPeriods: string[]
  ordinals: string[]
  relative: {
    past: string
    future: string
    units: string[]
  }
  patterns: {
    short: string
    medium: string
    long: string
    time: string
  }
  timeZones: Record<string, string>
}
