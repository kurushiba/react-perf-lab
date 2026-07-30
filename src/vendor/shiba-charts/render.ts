/**
 * shiba-charts / 描画
 *
 * 折れ線グラフと棒グラフを SVG マークアップとして組み立てる。
 *
 * scripts/gen-vendor.mjs による生成物。直接編集しない。
 */

import { PALETTES } from './palettes'

export interface ChartSeries {
  label: string
  values: number[]
}

export interface ChartOptions {
  width?: number
  height?: number
  palette?: string
  labels?: string[]
  padding?: number
}

interface Layout {
  width: number
  height: number
  padding: number
  colors: string[]
  grid: string
  min: number
  max: number
  span: number
}

function layout(series: ChartSeries[], options: ChartOptions): Layout {
  const width = options.width ?? 640
  const height = options.height ?? 240
  const padding = options.padding ?? 32
  const palette = PALETTES[options.palette ?? ''] ?? PALETTES[Object.keys(PALETTES)[0]]

  let min = Infinity
  let max = -Infinity
  for (const item of series) {
    for (const value of item.values) {
      if (value < min) min = value
      if (value > max) max = value
    }
  }
  if (min === Infinity) {
    min = 0
    max = 1
  }
  if (min === max) max = min + 1

  return {
    width,
    height,
    padding,
    colors: palette.colors,
    grid: palette.grid,
    min,
    max,
    span: max - min,
  }
}

function gridLines(box: Layout): string {
  const parts: string[] = []
  for (let i = 0; i <= 4; i++) {
    const y = box.padding + ((box.height - box.padding * 2) * i) / 4
    parts.push(
      '<line x1="' + box.padding + '" y1="' + y.toFixed(1) +
      '" x2="' + (box.width - box.padding) + '" y2="' + y.toFixed(1) +
      '" stroke="' + box.grid + '" stroke-width="1" opacity="0.35"/>',
    )
  }
  return parts.join('')
}

function open(box: Layout): string {
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + box.width + ' ' + box.height +
    '" width="100%" height="' + box.height + '" role="img">'
  )
}

export function renderLineChart(series: ChartSeries[], options: ChartOptions = {}): string {
  const box = layout(series, options)
  const inner = box.width - box.padding * 2
  const tall = box.height - box.padding * 2
  const parts: string[] = [open(box), gridLines(box)]

  series.forEach((item, index) => {
    const step = item.values.length > 1 ? inner / (item.values.length - 1) : 0
    const points = item.values
      .map((value, i) => {
        const x = box.padding + step * i
        const y = box.padding + tall - ((value - box.min) / box.span) * tall
        return x.toFixed(1) + ',' + y.toFixed(1)
      })
      .join(' ')

    parts.push(
      '<polyline fill="none" stroke="' + box.colors[index % box.colors.length] +
      '" stroke-width="2" stroke-linejoin="round" points="' + points + '"/>',
    )
  })

  parts.push('</svg>')
  return parts.join('')
}

export function renderBarChart(series: ChartSeries[], options: ChartOptions = {}): string {
  const box = layout(series, options)
  const inner = box.width - box.padding * 2
  const tall = box.height - box.padding * 2
  const count = series.reduce((total, item) => Math.max(total, item.values.length), 0)
  const slot = count > 0 ? inner / count : inner
  const barWidth = series.length > 0 ? (slot * 0.7) / series.length : slot

  const parts: string[] = [open(box), gridLines(box)]

  series.forEach((item, index) => {
    item.values.forEach((value, i) => {
      const height = ((value - box.min) / box.span) * tall
      const x = box.padding + slot * i + slot * 0.15 + barWidth * index
      const y = box.padding + tall - height
      parts.push(
        '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) +
        '" width="' + barWidth.toFixed(1) + '" height="' + Math.max(height, 0).toFixed(1) +
        '" fill="' + box.colors[index % box.colors.length] + '" rx="2"/>',
      )
    })
  })

  parts.push('</svg>')
  return parts.join('')
}
