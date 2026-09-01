/**
 * Sec.8（バンドルサイズ）の教材で使う「意図的に重い依存」を生成する。
 *
 * 実在のライブラリを使うと、バージョンが上がったサイズが変わって教材の数値が壊れる。
 * そこで、実際に動く実装と高エントロピーなデータを持つモックライブラリを自前で生成する。
 *
 *   npm run gen:vendor
 *
 * 方針（scripts/gen-images.mjs と同じ）：
 *  - 外部ライブラリもネットワークも使わない
 *  - mulberry32 のシード付き擬似乱数で決定的に生成する（何度実行しても同じバイト列）
 *  - 生成データは擬似ランダム＝高エントロピーにして、gzip が効きすぎないようにする
 *
 * 生成物は src/vendor/ に出力し、リポジトリにコミットする。
 * （eslint.config.js の ignores で lint 対象からは外してある）
 */
import { gzipSync } from 'node:zlib'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'src/vendor')

// ---------------------------------------------------------------------------
// 生成量のノブ。初期JSサイズの目標（gzip 800KB〜1.2MB）に届かないときはここだけ触る
// ---------------------------------------------------------------------------
const KNOBS = {
  // shiba-icons
  iconFiles: 20,
  iconsPerFile: 100,
  iconSegments: 36,
  // shiba-markdown
  emojiCount: 1800,
  emojiWords: 12,
  syntaxLanguages: 40,
  syntaxKeywords: 130,
  // shiba-charts
  palettes: 700,
  paletteColors: 12,
  chartSymbols: 360,
  symbolSegments: 14,
  chartLocales: 80,
  // shiba-date
  dateLocales: 60,
  dateTimeZones: 55,
}

// --- 決定的な擬似乱数（products.ts / gen-images.mjs と同じ mulberry32）------

function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const SYLLABLES = [
  'ka','ru','shi','ba','to','mi','ne','sa','ko','ra','de','vi','no','ta','me','lu',
  'za','pho','on','ei','ur','ax','yl','om','ib','ec','tra','nis','ver','dal','mor','ken',
  'sil','pra','tun','geo','vex','qui','zom','bra','fen','hol','ist','jun','kle','lyn','mub','nor',
  'opa','pil','qod','rem','sty','tiv','umb','vas','wyn','xen','yor','zeb','cly','dro','esk','fla',
]

/** 擬似単語。数が多く重複しにくいので、識別子にも文章にも使う */
function word(rand, syllables = 3) {
  let out = ''
  for (let i = 0; i < syllables; i++) out += SYLLABLES[(rand() * SYLLABLES.length) | 0]
  return out
}

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1)

// --- 書き出し ---------------------------------------------------------------

const written = new Map()

function write(relPath, contents) {
  const full = join(OUT, relPath)
  mkdirSync(dirname(full), { recursive: true })
  writeFileSync(full, contents)
  const pkg = relPath.split('/')[0]
  const current = written.get(pkg) ?? { files: 0, raw: 0, gzip: 0 }
  current.files += 1
  current.raw += Buffer.byteLength(contents)
  current.gzip += gzipSync(Buffer.from(contents), { level: 6 }).length
  written.set(pkg, current)
}

const HEADER = (title, note) =>
  `/**\n * ${title}\n *\n * ${note}\n *\n * scripts/gen-vendor.mjs による生成物。直接編集しない。\n */\n`

// ===========================================================================
// shiba-icons — 2,000個のSVGアイコン
// ===========================================================================

/**
 * アプリのUIで実際に使う12個。
 * ライブラリの「よく使われるアイコン」に相当し、他の2,000個とは別モジュールに置く。
 * こうしておくと、named import した側は 12 個ぶんのモジュールだけを読めば済む
 * （バンドラの共有チャンクは「モジュール単位」で切り出されるため）。
 */
const UI_ICON_NAMES = [
  'IconEditor',
  'IconReport',
  'IconAssets',
  'IconSettings',
  'IconShare',
  'IconSearch',
  'IconBell',
  'IconUser',
  'IconPlus',
  'IconTrash',
  'IconCheck',
  'IconClose',
]

const round3 = (v) => Number(v.toFixed(3))

/** 24グリッドの円。描画は stroke だけなので、円弧は3次ベジェ4本で近似する */
function circle24(cx, cy, r) {
  const k = r * 0.5523
  const p = (x, y) => `${round3(x)} ${round3(y)}`
  return (
    `M${p(cx + r, cy)}` +
    `C${p(cx + r, cy + k)} ${p(cx + k, cy + r)} ${p(cx, cy + r)}` +
    `C${p(cx - k, cy + r)} ${p(cx - r, cy + k)} ${p(cx - r, cy)}` +
    `C${p(cx - r, cy - k)} ${p(cx - k, cy - r)} ${p(cx, cy - r)}` +
    `C${p(cx + k, cy - r)} ${p(cx + r, cy - k)} ${p(cx + r, cy)}Z`
  )
}

/** 24グリッドの座標を viewBox 512 に変換する。使うのは M/L/C/Z だけなので、数値は一律で拡大してよい */
function scaleTo512(d) {
  return d
    .replace(/-?\d+(?:\.\d+)?/g, (v) => ((Number(v) * 512) / 24).toFixed(1))
    .replace(/\s+([MLCZ])/g, '$1')
    .trim()
}

/**
 * UIアイコン12個の実データ。ここだけは擬似乱数ではなく、手で描いた本物の形を使う。
 * 24×24 のグリッドで設計し、書き出すときに viewBox 512 へ拡大する（線幅も 24 換算で 1.5 相当）。
 *
 * 教材の「初期JSサイズ」を支えているのは、あくまでバルクの2,000個（＝擬似乱数の高エントロピーな塊）。
 * 画面に出るこの12個は 7KB ほどしかないので、見た目のためにここだけ実データにしても数字は動かない。
 */
const UI_ICON_SHAPES = {
  // ペン
  IconEditor: 'M4 20L5.2 15.8L16.4 4.6L19.4 7.6L8.2 18.8Z M15.3 5.7L18.3 8.7',
  // 棒グラフ
  IconReport: 'M3.5 20L20.5 20 M7.5 20L7.5 15.5 M12 20L12 11 M16.5 20L16.5 6.5',
  // 画像（枠＋太陽＋山）
  IconAssets:
    'M5 4L19 4C20.1 4 21 4.9 21 6L21 18C21 19.1 20.1 20 19 20L5 20C3.9 20 3 19.1 3 18L3 6C3 4.9 3.9 4 5 4Z ' +
    circle24(8.5, 9, 1.5) +
    ' M4 18L9.5 12.5L13.5 16.5L16 14L20.5 18.5',
  // スライダー3本
  IconSettings:
    'M3 7L21 7 M3 12L21 12 M3 17L21 17 ' +
    circle24(9, 7, 2) +
    ' ' +
    circle24(15, 12, 2) +
    ' ' +
    circle24(7.5, 17, 2),
  // ノード3つ＋接続線
  IconShare:
    circle24(18, 5.5, 2.2) +
    ' ' +
    circle24(6, 12, 2.2) +
    ' ' +
    circle24(18, 18.5, 2.2) +
    ' M7.9 11L16.1 6.6 M7.9 13L16.1 17.4',
  // 虫眼鏡
  IconSearch: circle24(10.5, 10.5, 6.5) + ' M15.2 15.2L20.5 20.5',
  // ベル
  IconBell:
    'M6 16.5C6 16.5 7 15.5 7 13.5L7 10C7 6.7 9.2 4 12 4C14.8 4 17 6.7 17 10L17 13.5C17 15.5 18 16.5 18 16.5Z ' +
    'M10.2 19C10.6 19.9 11.2 20.4 12 20.4C12.8 20.4 13.4 19.9 13.8 19',
  // 人
  IconUser: circle24(12, 8.5, 3.8) + ' M4.5 20C4.5 16.4 7.9 13.5 12 13.5C16.1 13.5 19.5 16.4 19.5 20',
  // ＋
  IconPlus: 'M12 5L12 19 M5 12L19 12',
  // ゴミ箱
  IconTrash:
    'M3.5 6.5L20.5 6.5 ' +
    'M9.5 6.5L9.5 4.2C9.5 3.8 9.8 3.5 10.2 3.5L13.8 3.5C14.2 3.5 14.5 3.8 14.5 4.2L14.5 6.5 ' +
    'M6 6.5L6.9 20C7 20.6 7.5 21 8.1 21L15.9 21C16.5 21 17 20.6 17.1 20L18 6.5 ' +
    'M10 10.5L10.3 17.5 M14 10.5L13.7 17.5',
  // チェック
  IconCheck: 'M4.5 12.5L9.5 17.5L19.5 6.5',
  // ×
  IconClose: 'M6 6L18 18 M18 6L6 18',
}

function genIcons() {
  const rand = mulberry32(20250801)
  const names = []

  {
    const lines = [
      HEADER(
        'shiba-icons / UIアイコン',
        'アプリのUIでよく使う12個。ここだけは手で描いた実データで、バルクのアイコン群とは別モジュールにしてある。',
      ),
    ]
    for (const name of UI_ICON_NAMES) {
      // バルクと同じ回数だけ乱数を引いて捨てる。
      // ここで引くのをやめると乱数列がずれ、あとに続く2,000個の名前とパスが丸ごと変わってしまう
      const coord = () => (rand() * 512).toFixed(1)
      coord()
      coord()
      for (let s = 0; s < KNOBS.iconSegments; s++) {
        const draws = s % 5 === 4 ? 6 : 2
        for (let i = 0; i < draws; i++) coord()
      }

      lines.push(`export const ${name} = '${scaleTo512(UI_ICON_SHAPES[name])}'`)
    }
    write('shiba-icons/icons-ui.ts', lines.join('\n') + '\n')
  }

  for (let f = 0; f < KNOBS.iconFiles; f++) {
    const lines = [
      HEADER(
        `shiba-icons / パス定義 ${String(f).padStart(2, '0')}`,
        'アイコン1つ＝1つの named export。個別に export しているので、named import すれば tree shaking が効く。',
      ),
    ]

    for (let i = 0; i < KNOBS.iconsPerFile; i++) {
      const index = f * KNOBS.iconsPerFile + i
      const name = `Icon${capitalize(word(rand, 3))}${String(index).padStart(4, '0')}`
      names.push(name)

      const coord = () => (rand() * 512).toFixed(1)
      let d = `M${coord()} ${coord()}`
      for (let s = 0; s < KNOBS.iconSegments; s++) {
        d +=
          s % 5 === 4
            ? `C${coord()} ${coord()} ${coord()} ${coord()} ${coord()} ${coord()}`
            : `L${coord()} ${coord()}`
      }
      d += 'Z'

      lines.push(`export const ${name} = '${d}'`)
    }

    write(`shiba-icons/icons-${String(f).padStart(2, '0')}.ts`, lines.join('\n') + '\n')
  }

  const barrel = [
    HEADER(
      'shiba-icons / パスのバレル',
      "全アイコンを1箇所に集めた再 export。`import * as` で丸ごと読むとバンドルから消せなくなる（7-6）。",
    ),
    "export * from './icons-ui'",
    ...Array.from(
      { length: KNOBS.iconFiles },
      (_, f) => `export * from './icons-${String(f).padStart(2, '0')}'`,
    ),
  ]
  write('shiba-icons/paths.ts', barrel.join('\n') + '\n')

  write(
    'shiba-icons/render.ts',
    HEADER('shiba-icons / 描画', 'パス文字列を SVG のマークアップに変換する。') +
      String.raw`
export interface IconOptions {
  size?: number
  color?: string
  strokeWidth?: number
}

export function renderIcon(path: string, options: IconOptions = {}): string {
  const size = options.size ?? 20
  const color = options.color ?? 'currentColor'
  const strokeWidth = options.strokeWidth ?? 32

  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"' +
    ' width="' + size + '" height="' + size + '" fill="none"' +
    ' stroke="' + color + '" stroke-width="' + strokeWidth + '"' +
    ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="' + path + '"/></svg>'
  )
}
`,
  )

  write(
    'shiba-icons/index.ts',
    HEADER('shiba-icons', `${names.length}個のアイコンを持つアイコンライブラリ（モック）。`) +
      "export * from './paths'\nexport * from './render'\n",
  )

  return names
}

// ===========================================================================
// shiba-markdown — パーサ ＋ 絵文字表 ＋ シンタックス定義
// ===========================================================================

function genMarkdown() {
  const rand = mulberry32(20250802)

  // --- 絵文字ショートコード表 ---
  const emojiLines = [
    HEADER(
      'shiba-markdown / 絵文字ショートコード表',
      ':shortcode: を説明文に対応づける表。パーサ本体から常に参照される。',
    ),
    'export const EMOJI: Record<string, string> = {',
  ]
  const usedShortcodes = new Set()
  for (let i = 0; i < KNOBS.emojiCount; i++) {
    let code = word(rand, 2) + '_' + word(rand, 2)
    while (usedShortcodes.has(code)) code += (rand() * 10) | 0
    usedShortcodes.add(code)
    const desc = Array.from({ length: KNOBS.emojiWords }, () => word(rand, 2)).join(' ')
    emojiLines.push(`  ${code}: '${desc}',`)
  }
  emojiLines.push('}')
  write('shiba-markdown/emoji.ts', emojiLines.join('\n') + '\n')

  // --- シンタックス定義 ---
  const syntaxLines = [
    HEADER(
      'shiba-markdown / シンタックス定義',
      'コードフェンスの言語ごとの予約語・演算子・トークン配色。',
    ),
    String.raw`export interface SyntaxDefinition {
  name: string
  aliases: string[]
  keywords: string[]
  operators: string[]
  lineComment: string
  blockComment: [string, string]
  tokenColors: Record<string, string>
}
`,
    'export const SYNTAX: Record<string, SyntaxDefinition> = {',
  ]
  for (let l = 0; l < KNOBS.syntaxLanguages; l++) {
    const lang = word(rand, 2) + String(l)
    const keywords = Array.from({ length: KNOBS.syntaxKeywords }, () => word(rand, 2))
    const operators = Array.from({ length: 24 }, () => word(rand, 1))
    const colors = Array.from({ length: 10 }, () => {
      const key = word(rand, 2)
      const hex = ((rand() * 0xffffff) | 0).toString(16).padStart(6, '0')
      return `${key}: '#${hex}'`
    })
    syntaxLines.push(`  ${lang}: {`)
    syntaxLines.push(`    name: '${capitalize(lang)}',`)
    syntaxLines.push(`    aliases: ['${word(rand, 2)}', '${word(rand, 2)}'],`)
    syntaxLines.push(`    keywords: ${JSON.stringify(keywords)},`)
    syntaxLines.push(`    operators: ${JSON.stringify(operators)},`)
    syntaxLines.push(`    lineComment: '//',`)
    syntaxLines.push(`    blockComment: ['/*', '*/'],`)
    syntaxLines.push(`    tokenColors: { ${colors.join(', ')} },`)
    syntaxLines.push('  },')
  }
  syntaxLines.push('}')
  syntaxLines.push('')
  syntaxLines.push('export const LANGUAGES = Object.keys(SYNTAX)')
  write('shiba-markdown/syntax.ts', syntaxLines.join('\n') + '\n')

  // --- パーサ本体（実際に動く）---
  write(
    'shiba-markdown/parser.ts',
    HEADER(
      'shiba-markdown / パーサ',
      'マークダウンを HTML 文字列に変換する。見出し・強調・コード・リスト・引用・表に対応。',
    ) +
      String.raw`
import { EMOJI } from './emoji'
import { SYNTAX } from './syntax'

const BACKTICK = String.fromCharCode(96)

export interface RenderOptions {
  emoji?: boolean
  highlight?: boolean
}

function escapeHtml(src: string): string {
  return src
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function highlight(code: string, lang: string): string {
  const definition = SYNTAX[lang]
  const escaped = escapeHtml(code)
  if (!definition) return escaped

  const keywords = new Set(definition.keywords)
  return escaped.replace(/[A-Za-z_][A-Za-z0-9_]*/g, (token) =>
    keywords.has(token) ? '<span class="tok-keyword">' + token + '</span>' : token,
  )
}

function inline(src: string, options: RenderOptions): string {
  let out = escapeHtml(src)

  const codeSpan = new RegExp(BACKTICK + '([^' + BACKTICK + ']+)' + BACKTICK, 'g')
  out = out.replace(codeSpan, '<code>$1</code>')
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  out = out.replace(/~~([^~]+)~~/g, '<del>$1</del>')
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" rel="noreferrer">$1</a>')

  if (options.emoji !== false) {
    out = out.replace(/:([a-z0-9_]+):/g, (whole: string, name: string) => {
      const description = EMOJI[name]
      if (!description) return whole
      return '<span class="emoji" title="' + description + '">:' + name + ':</span>'
    })
  }

  return out
}

export function renderMarkdown(source: string, options: RenderOptions = {}): string {
  const lines = source.split('\n')
  const html: string[] = []
  let listBuffer: string[] = []
  let paragraphBuffer: string[] = []

  const flushList = () => {
    if (listBuffer.length === 0) return
    html.push('<ul>' + listBuffer.map((item) => '<li>' + item + '</li>').join('') + '</ul>')
    listBuffer = []
  }

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) return
    html.push('<p>' + paragraphBuffer.join(' ') + '</p>')
    paragraphBuffer = []
  }

  const flushAll = () => {
    flushList()
    flushParagraph()
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.trim() === '') {
      flushAll()
      continue
    }

    // フェンスされたコードブロック
    if (line.startsWith(BACKTICK + BACKTICK + BACKTICK)) {
      flushAll()
      const lang = line.slice(3).trim()
      const body: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith(BACKTICK + BACKTICK + BACKTICK)) {
        body.push(lines[i])
        i++
      }
      const code =
        options.highlight === false
          ? escapeHtml(body.join('\n'))
          : highlight(body.join('\n'), lang)
      html.push('<pre class="md-code" data-lang="' + escapeHtml(lang) + '"><code>' + code + '</code></pre>')
      continue
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line)
    if (heading) {
      flushAll()
      const level = heading[1].length
      html.push('<h' + level + '>' + inline(heading[2], options) + '</h' + level + '>')
      continue
    }

    if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
      flushAll()
      html.push('<hr/>')
      continue
    }

    const quote = /^>\s?(.*)$/.exec(line)
    if (quote) {
      flushAll()
      html.push('<blockquote>' + inline(quote[1], options) + '</blockquote>')
      continue
    }

    const listItem = /^\s*[-*+]\s+(.*)$/.exec(line)
    if (listItem) {
      flushParagraph()
      listBuffer.push(inline(listItem[1], options))
      continue
    }

    flushList()
    paragraphBuffer.push(inline(line, options))
  }

  flushAll()
  return html.join('')
}
`,
  )

  write(
    'shiba-markdown/index.ts',
    HEADER('shiba-markdown', 'マークダウンパーサ（モック）。絵文字表と40言語のシンタックス定義を同梱。') +
      "export * from './parser'\nexport * from './emoji'\nexport * from './syntax'\n",
  )
}

// ===========================================================================
// shiba-charts — SVG描画 ＋ 配色 ＋ マーカー ＋ ロケール
// ===========================================================================

function genCharts() {
  const rand = mulberry32(20250803)

  // --- 配色パレット ---
  const paletteLines = [
    HEADER('shiba-charts / 配色パレット', `${KNOBS.palettes}種類の配色。`),
    String.raw`export interface Palette {
  name: string
  colors: string[]
  background: string
  grid: string
}
`,
    'export const PALETTES: Record<string, Palette> = {',
  ]
  for (let p = 0; p < KNOBS.palettes; p++) {
    const name = word(rand, 2) + String(p)
    const hex = () => '#' + ((rand() * 0xffffff) | 0).toString(16).padStart(6, '0')
    const colors = Array.from({ length: KNOBS.paletteColors }, hex)
    paletteLines.push(
      `  ${name}: { name: '${capitalize(name)}', colors: ${JSON.stringify(colors)}, background: '${hex()}', grid: '${hex()}' },`,
    )
  }
  paletteLines.push('}')
  write('shiba-charts/palettes.ts', paletteLines.join('\n') + '\n')

  // --- マーカー形状 ---
  const symbolLines = [
    HEADER('shiba-charts / マーカー形状', '折れ線のデータ点に置く記号のパス定義。'),
    'export const SYMBOLS: Record<string, string> = {',
  ]
  for (let s = 0; s < KNOBS.chartSymbols; s++) {
    const name = word(rand, 2) + String(s)
    const coord = () => (rand() * 64).toFixed(2)
    let d = `M${coord()} ${coord()}`
    for (let i = 0; i < KNOBS.symbolSegments; i++) d += `L${coord()} ${coord()}`
    symbolLines.push(`  ${name}: '${d}Z',`)
  }
  symbolLines.push('}')
  write('shiba-charts/symbols.ts', symbolLines.join('\n') + '\n')

  // --- 軸のロケール表 ---
  const localeLines = [
    HEADER('shiba-charts / 軸ロケール', '軸ラベルの数値・単位・省略表記。'),
    String.raw`export interface AxisLocale {
  decimal: string
  group: string
  currency: string
  percent: string
  units: string[]
  shortUnits: string[]
  quarters: string[]
}
`,
    'export const AXIS_LOCALES: Record<string, AxisLocale> = {',
  ]
  for (let l = 0; l < KNOBS.chartLocales; l++) {
    const tag = word(rand, 2) + String(l)
    const units = Array.from({ length: 26 }, () => word(rand, 3))
    const shortUnits = Array.from({ length: 26 }, () => word(rand, 2))
    const quarters = Array.from({ length: 4 }, () => word(rand, 3))
    localeLines.push(
      `  ${tag}: { decimal: '.', group: ',', currency: '${word(rand, 2)}', percent: '%', units: ${JSON.stringify(units)}, shortUnits: ${JSON.stringify(shortUnits)}, quarters: ${JSON.stringify(quarters)} },`,
    )
  }
  localeLines.push('}')
  write('shiba-charts/locales.ts', localeLines.join('\n') + '\n')

  // --- 描画本体（実際に動く）---
  write(
    'shiba-charts/render.ts',
    HEADER('shiba-charts / 描画', '折れ線グラフと棒グラフを SVG マークアップとして組み立てる。') +
      String.raw`
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
`,
  )

  write(
    'shiba-charts/index.ts',
    HEADER('shiba-charts', 'SVGチャート描画ライブラリ（モック）。配色・マーカー・ロケール表を同梱。') +
      "export * from './render'\nexport * from './palettes'\nexport * from './symbols'\nexport * from './locales'\n",
  )
}

// ===========================================================================
// shiba-qr — Reed–Solomon を含む QR エンコーダ
// ===========================================================================

function genQr() {
  // GF(256) の乗算表を事前計算して持つのは、実際の QR ライブラリでもよく行われる。
  // 原始多項式 0x11d、生成元 2。
  const exp = new Array(512).fill(0)
  const log = new Array(256).fill(0)
  let x = 1
  for (let i = 0; i < 255; i++) {
    exp[i] = x
    log[x] = i
    x <<= 1
    if (x & 0x100) x ^= 0x11d
  }
  for (let i = 255; i < 512; i++) exp[i] = exp[i - 255]

  const mul = (a, b) => (a === 0 || b === 0 ? 0 : exp[log[a] + log[b]])

  // 256x256 の乗算表を4ファイルに分けて出す（tsc の負荷を分散するため）
  const rowsPerFile = 64
  const fileCount = 256 / rowsPerFile
  for (let f = 0; f < fileCount; f++) {
    const rows = []
    for (let r = 0; r < rowsPerFile; r++) {
      const a = f * rowsPerFile + r
      const row = Array.from({ length: 256 }, (_, b) => mul(a, b))
      rows.push(`  [${row.join(',')}],`)
    }
    write(
      `shiba-qr/mul-${f}.ts`,
      HEADER(
        `shiba-qr / GF(256) 乗算表 ${f}`,
        `${f * rowsPerFile} 〜 ${(f + 1) * rowsPerFile - 1} 行ぶん。ガロア体の乗算をループなしで引くための表。`,
      ) + `export const MUL_${f}: number[][] = [\n${rows.join('\n')}\n]\n`,
    )
  }

  write(
    'shiba-qr/tables.ts',
    HEADER('shiba-qr / 各種表', 'ガロア体の指数・対数表、乗算表の結合、版ごとの容量表。') +
      Array.from({ length: fileCount }, (_, f) => `import { MUL_${f} } from './mul-${f}'`).join('\n') +
      '\n\n' +
      `export const EXP: number[] = [${exp.join(',')}]\n\n` +
      `export const LOG: number[] = [${log.join(',')}]\n\n` +
      `export const MUL: number[][] = [${Array.from({ length: fileCount }, (_, f) => `...MUL_${f}`).join(', ')}]\n\n` +
      String.raw`export interface VersionSpec {
  version: number
  size: number
  /** データ符号語数（EC レベル M） */
  dataCodewords: number
  /** ブロックあたりの誤り訂正符号語数 */
  ecCodewords: number
  blocks: number
  /** バイトモードで入る最大文字数 */
  capacity: number
  alignment: number[]
}

/**
 * EC レベル M・バイトモードの版1〜4。
 * 短い文字列（URL・SKU）をエンコードする用途に絞ってある。
 */
export const VERSIONS: VersionSpec[] = [
  { version: 1, size: 21, dataCodewords: 16, ecCodewords: 10, blocks: 1, capacity: 14, alignment: [] },
  { version: 2, size: 25, dataCodewords: 28, ecCodewords: 16, blocks: 1, capacity: 26, alignment: [6, 18] },
  { version: 3, size: 29, dataCodewords: 44, ecCodewords: 26, blocks: 1, capacity: 42, alignment: [6, 22] },
  { version: 4, size: 33, dataCodewords: 64, ecCodewords: 18, blocks: 2, capacity: 62, alignment: [6, 26] },
]
`,
  )

  write(
    'shiba-qr/encode.ts',
    HEADER(
      'shiba-qr / エンコーダ',
      'バイトモード・EC レベル M・マスク 0 固定。RS 誤り訂正とマトリクス配置は実際に計算している。',
    ) +
      String.raw`
import { EXP, LOG, MUL, VERSIONS, type VersionSpec } from './tables'

export interface QrMatrix {
  size: number
  version: number
  modules: boolean[][]
}

function gfMul(a: number, b: number): number {
  return MUL[a][b]
}

/** 誤り訂正符号語数 n に対する生成多項式を作る */
function generatorPolynomial(n: number): number[] {
  let poly = [1]
  for (let i = 0; i < n; i++) {
    const next = new Array<number>(poly.length + 1).fill(0)
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j]
      next[j + 1] ^= gfMul(poly[j], EXP[i])
    }
    poly = next
  }
  return poly
}

/** Reed–Solomon 誤り訂正符号語を求める */
export function reedSolomon(data: number[], ecCount: number): number[] {
  const generator = generatorPolynomial(ecCount)
  const remainder = new Array<number>(ecCount).fill(0)

  for (const byte of data) {
    const factor = byte ^ remainder[0]
    remainder.shift()
    remainder.push(0)
    if (factor !== 0) {
      const logFactor = LOG[factor]
      for (let i = 0; i < ecCount; i++) {
        remainder[i] ^= EXP[LOG[generator[i + 1]] + logFactor]
      }
    }
  }

  return remainder
}

function pickVersion(length: number): VersionSpec {
  for (const spec of VERSIONS) {
    if (length <= spec.capacity) return spec
  }
  return VERSIONS[VERSIONS.length - 1]
}

/** バイトモードのビット列 → 符号語 */
function toCodewords(text: string, spec: VersionSpec): number[] {
  const bytes: number[] = []
  for (const char of text) {
    const code = char.codePointAt(0) ?? 63
    if (code < 128) bytes.push(code)
    else bytes.push(63)
  }
  const truncated = bytes.slice(0, spec.capacity)

  const bits: number[] = []
  const push = (value: number, width: number) => {
    for (let i = width - 1; i >= 0; i--) bits.push((value >> i) & 1)
  }

  push(4, 4) // モード指示子：バイトモード
  push(truncated.length, 8)
  for (const byte of truncated) push(byte, 8)

  const capacityBits = spec.dataCodewords * 8
  push(0, Math.min(4, capacityBits - bits.length)) // 終端パターン
  while (bits.length % 8 !== 0) bits.push(0)

  const codewords: number[] = []
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0
    for (let j = 0; j < 8; j++) byte = (byte << 1) | bits[i + j]
    codewords.push(byte)
  }

  // 埋め草符号語 0xEC / 0x11 の交互
  const padding = [0xec, 0x11]
  let p = 0
  while (codewords.length < spec.dataCodewords) {
    codewords.push(padding[p % 2])
    p++
  }

  return codewords
}

function interleave(codewords: number[], spec: VersionSpec): number[] {
  const perBlock = spec.dataCodewords / spec.blocks
  const dataBlocks: number[][] = []
  const ecBlocks: number[][] = []

  for (let b = 0; b < spec.blocks; b++) {
    const block = codewords.slice(b * perBlock, (b + 1) * perBlock)
    dataBlocks.push(block)
    ecBlocks.push(reedSolomon(block, spec.ecCodewords))
  }

  const out: number[] = []
  for (let i = 0; i < perBlock; i++) {
    for (const block of dataBlocks) out.push(block[i])
  }
  for (let i = 0; i < spec.ecCodewords; i++) {
    for (const block of ecBlocks) out.push(block[i])
  }
  return out
}

function placeFunctionPatterns(modules: boolean[][], reserved: boolean[][], spec: VersionSpec): void {
  const size = spec.size

  const finder = (row: number, col: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const y = row + r
        const cx = col + c
        if (y < 0 || y >= size || cx < 0 || cx >= size) continue
        const edge = r === 0 || r === 6 || c === 0 || c === 6
        const core = r >= 2 && r <= 4 && c >= 2 && c <= 4
        modules[y][cx] = edge || core
        reserved[y][cx] = true
      }
    }
  }

  finder(0, 0)
  finder(0, size - 7)
  finder(size - 7, 0)

  // タイミングパターン
  for (let i = 8; i < size - 8; i++) {
    modules[6][i] = i % 2 === 0
    modules[i][6] = i % 2 === 0
    reserved[6][i] = true
    reserved[i][6] = true
  }

  // 位置合わせパターン
  if (spec.alignment.length > 0) {
    const center = spec.alignment[1]
    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        modules[center + r][center + c] = Math.max(Math.abs(r), Math.abs(c)) !== 1
        reserved[center + r][center + c] = true
      }
    }
  }

  // 常に黒のモジュール
  modules[size - 8][8] = true
  reserved[size - 8][8] = true

  // 形式情報の領域を予約する
  for (let i = 0; i < 9; i++) {
    if (!reserved[8][i]) reserved[8][i] = true
    if (!reserved[i][8]) reserved[i][8] = true
  }
  for (let i = 0; i < 8; i++) {
    reserved[8][size - 1 - i] = true
    reserved[size - 1 - i][8] = true
  }
}

/** BCH(15,5) による形式情報。EC レベル M（0b00）＋ マスク 0 */
function formatBits(): number[] {
  let value = 0b00000 // レベル M + マスク 0
  let bch = value << 10
  for (let i = 14; i >= 10; i--) {
    if ((bch >> i) & 1) bch ^= 0b10100110111 << (i - 10)
  }
  value = ((value << 10) | bch) ^ 0b101010000010010

  const bits: number[] = []
  for (let i = 14; i >= 0; i--) bits.push((value >> i) & 1)
  return bits
}

function placeFormat(modules: boolean[][], size: number): void {
  const bits = formatBits()

  for (let i = 0; i <= 5; i++) modules[8][i] = bits[i] === 1
  modules[8][7] = bits[6] === 1
  modules[8][8] = bits[7] === 1
  modules[7][8] = bits[8] === 1
  for (let i = 9; i <= 14; i++) modules[14 - i][8] = bits[i] === 1

  for (let i = 0; i <= 7; i++) modules[size - 1 - i][8] = bits[i] === 1
  for (let i = 8; i <= 14; i++) modules[8][size - 15 + i] = bits[i] === 1
}

/** マスク 0：(row + col) % 2 === 0 を反転する */
function maskAt(row: number, col: number): boolean {
  return (row + col) % 2 === 0
}

export function encodeQr(text: string): QrMatrix {
  const spec = pickVersion([...text].length)
  const size = spec.size
  const stream = interleave(toCodewords(text, spec), spec)

  const modules: boolean[][] = Array.from({ length: size }, () =>
    new Array<boolean>(size).fill(false),
  )
  const reserved: boolean[][] = Array.from({ length: size }, () =>
    new Array<boolean>(size).fill(false),
  )

  placeFunctionPatterns(modules, reserved, spec)

  // 右下から2列ずつジグザグに埋める
  let bitIndex = 0
  let upward = true
  for (let right = size - 1; right >= 1; right -= 2) {
    const column = right === 6 ? right - 1 : right
    for (let step = 0; step < size; step++) {
      const row = upward ? size - 1 - step : step
      for (let c = 0; c < 2; c++) {
        const col = column - c
        if (reserved[row][col]) continue
        const byte = stream[bitIndex >> 3] ?? 0
        const bit = (byte >> (7 - (bitIndex & 7))) & 1
        modules[row][col] = (bit === 1) !== maskAt(row, col)
        bitIndex++
      }
    }
    upward = !upward
  }

  placeFormat(modules, size)

  return { size, version: spec.version, modules }
}

export interface QrRenderOptions {
  scale?: number
  quiet?: number
  dark?: string
  light?: string
}

export function renderQrSvg(text: string, options: QrRenderOptions = {}): string {
  const { size, modules } = encodeQr(text)
  const scale = options.scale ?? 6
  const quiet = options.quiet ?? 4
  const dark = options.dark ?? '#172b4d'
  const light = options.light ?? '#ffffff'
  const total = (size + quiet * 2) * scale

  const rects: string[] = []
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (!modules[row][col]) continue
      rects.push(
        '<rect x="' + ((col + quiet) * scale) + '" y="' + ((row + quiet) * scale) +
        '" width="' + scale + '" height="' + scale + '"/>',
      )
    }
  }

  return (
    '<svg xmlns="http://www.w3.org/2000/svg" width="' + total + '" height="' + total +
    '" viewBox="0 0 ' + total + ' ' + total + '" role="img">' +
    '<rect width="' + total + '" height="' + total + '" fill="' + light + '"/>' +
    '<g fill="' + dark + '">' + rects.join('') + '</g></svg>'
  )
}
`,
  )

  write(
    'shiba-qr/index.ts',
    HEADER('shiba-qr', 'QRコード生成ライブラリ（モック）。Reed–Solomon の実装と乗算表を同梱。') +
      "export * from './encode'\nexport * from './tables'\n",
  )
}

// ===========================================================================
// shiba-date — フォーマッタ ＋ 60ロケール
// ===========================================================================

function genDate() {
  const rand = mulberry32(20250804)
  const localeNames = []

  for (let l = 0; l < KNOBS.dateLocales; l++) {
    const base = word(rand, 2)
    const name = base + capitalize(word(rand, 2)) + String(l)
    localeNames.push(name)

    const list = (count, syllables) =>
      JSON.stringify(Array.from({ length: count }, () => word(rand, syllables)))

    const zones = Array.from({ length: KNOBS.dateTimeZones }, () => {
      const zone = word(rand, 3) + '/' + capitalize(word(rand, 3))
      return `    '${zone}': '${word(rand, 4)} ${word(rand, 3)}',`
    })

    write(
      `shiba-date/locales/${name}.ts`,
      HEADER(`shiba-date / ロケール ${name}`, '月名・曜日名・相対表現・タイムゾーン名の対応表。') +
        String.raw`import type { DateLocale } from '../types'

export const ` +
        name +
        `: DateLocale = {
  tag: '${name}',
  months: ${list(12, 3)},
  monthsShort: ${list(12, 2)},
  weekdays: ${list(7, 3)},
  weekdaysShort: ${list(7, 2)},
  eras: ${list(2, 2)},
  dayPeriods: ${list(2, 2)},
  ordinals: ${list(31, 2)},
  relative: {
    past: '${word(rand, 3)} {0} ${word(rand, 2)}',
    future: '${word(rand, 3)} {0} ${word(rand, 2)}',
    units: ${list(7, 3)},
  },
  patterns: {
    short: 'yyyy/MM/dd',
    medium: 'MMM d, yyyy',
    long: 'MMMM d, yyyy HH:mm',
    time: 'HH:mm:ss',
  },
  timeZones: {
${zones.join('\n')}
  },
}
`,
    )
  }

  write(
    'shiba-date/types.ts',
    HEADER('shiba-date / 型', 'ロケール定義の形。') +
      String.raw`export interface DateLocale {
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
`,
  )

  write(
    'shiba-date/format.ts',
    HEADER('shiba-date / フォーマッタ', 'パターン文字列に沿って日付を整形する。') +
      String.raw`
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
`,
  )

  write(
    'shiba-date/index.ts',
    HEADER(
      'shiba-date',
      `日付フォーマットライブラリ（モック）。${localeNames.length}ロケールぶんの表を同梱。`,
    ) +
      "export * from './format'\nexport type { DateLocale } from './types'\n" +
      localeNames.map((name) => `export { ${name} } from './locales/${name}'`).join('\n') +
      '\n',
  )

  return localeNames
}

// ===========================================================================

rmSync(OUT, { recursive: true, force: true })

const iconNames = genIcons()
genMarkdown()
genCharts()
genQr()
const localeNames = genDate()

let totalRaw = 0
let totalGzip = 0
console.log('module            files      raw     gzip')
for (const [pkg, stat] of [...written].sort()) {
  totalRaw += stat.raw
  totalGzip += stat.gzip
  console.log(
    pkg.padEnd(18) +
      String(stat.files).padStart(5) +
      (stat.raw / 1024).toFixed(0).padStart(8) +
      'KB' +
      (stat.gzip / 1024).toFixed(0).padStart(7) +
      'KB',
  )
}
console.log(
  'TOTAL'.padEnd(18) +
    ''.padStart(5) +
    (totalRaw / 1024 / 1024).toFixed(2).padStart(8) +
    'MB' +
    (totalGzip / 1024).toFixed(0).padStart(7) +
    'KB',
)
console.log(`\nicons: ${iconNames.length} / date locales: ${localeNames.length}`)
console.log('※ 実際の初期JSサイズは npm run build のチャンクサイズで確認する')
