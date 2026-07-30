/**
 * shiba-qr / エンコーダ
 *
 * バイトモード・EC レベル M・マスク 0 固定。RS 誤り訂正とマトリクス配置は実際に計算している。
 *
 * scripts/gen-vendor.mjs による生成物。直接編集しない。
 */

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
