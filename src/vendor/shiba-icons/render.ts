/**
 * shiba-icons / 描画
 *
 * パス文字列を SVG のマークアップに変換する。
 *
 * scripts/gen-vendor.mjs による生成物。直接編集しない。
 */

export interface IconOptions {
  size?: number
  color?: string
  strokeWidth?: number
}

export function renderIcon(path: string, options: IconOptions = {}): string {
  const size = options.size ?? 20
  const color = options.color ?? 'currentColor'
  const strokeWidth = options.strokeWidth ?? 18

  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"' +
    ' width="' + size + '" height="' + size + '" fill="none"' +
    ' stroke="' + color + '" stroke-width="' + strokeWidth + '"' +
    ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="' + path + '"/></svg>'
  )
}
