/**
 * 教材で使う画像を生成する。
 *
 * 外部ライブラリもネットワークも使わず、Node 標準の zlib だけで PNG を書き出す。
 * 生成物は決定的（何度実行しても同じバイト列）なので、計測値が揺れない。
 *
 *   npm run gen:images
 *
 *  - public/images/thumbs/thumb-00..19.png  一覧のサムネイル（64x64・軽い）
 *  - public/images/photos/photo-0..3.png    LCP / CLS 教材用（1440x1080・非最適フォーマット）
 */
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

// --- PNG エンコーダ -------------------------------------------------------

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

/** rgb(x, y) -> [r, g, b] から 24bit RGB の PNG を作る（行フィルタは Sub 固定） */
function encodePng(width, height, rgb) {
  const stride = width * 3
  const raw = Buffer.alloc(height * (stride + 1))
  const row = Buffer.alloc(stride)
  let p = 0

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const [r, g, b] = rgb(x, y)
      row[x * 3] = r
      row[x * 3 + 1] = g
      row[x * 3 + 2] = b
    }
    // フィルタ種別 1 = Sub（左隣との差分）。なだらかな階調がよく縮む
    raw[p++] = 1
    for (let i = 0; i < stride; i++) {
      raw[p++] = (row[i] - (i >= 3 ? row[i - 3] : 0)) & 0xff
    }
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 2 // color type: truecolor

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 6 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// --- 決定的な擬似乱数（products.ts と同じ mulberry32）---------------------

function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const clamp = (v) => (v < 0 ? 0 : v > 255 ? 255 : v | 0)

// --- サムネイル -----------------------------------------------------------

function writeThumbs() {
  const dir = join(ROOT, 'public/images/thumbs')
  mkdirSync(dir, { recursive: true })

  for (let i = 0; i < 20; i++) {
    const hue = (i * 37) % 360
    const rand = mulberry32(1000 + i)
    const jitter = Array.from({ length: 64 }, () => rand() * 24 - 12)

    const png = encodePng(64, 64, (x, y) => {
      const t = (x + y) / 128
      const base = 90 + t * 110 + jitter[(x * 7 + y * 3) % 64]
      return [
        clamp(base * (1 + Math.cos((hue * Math.PI) / 180) * 0.35)),
        clamp(base * (1 + Math.cos(((hue + 120) * Math.PI) / 180) * 0.35)),
        clamp(base * (1 + Math.cos(((hue + 240) * Math.PI) / 180) * 0.35)),
      ]
    })

    writeFileSync(join(dir, `thumb-${String(i).padStart(2, '0')}.png`), png)
  }
  console.log('thumbs: 20 files')
}

// --- 大きい写真（LCP / CLS 教材用）----------------------------------------

function writePhotos() {
  const dir = join(ROOT, 'public/images/photos')
  mkdirSync(dir, { recursive: true })

  const W = 1280
  const H = 960

  for (let i = 0; i < 4; i++) {
    const rand = mulberry32(500 + i * 17)
    // 写真らしいざらつき。振幅を上げるほどファイルが大きくなる（＝圧縮が効かなくなる）
    const noise = Array.from({ length: 4096 }, () => rand() * 9 - 4.5)
    const phase = i * 1.3

    const png = encodePng(W, H, (x, y) => {
      const u = x / W
      const v = y / H
      const n = noise[(x * 31 + y * 17) & 4095]
      const swirl = Math.sin((u * 6 + phase) * Math.PI) * Math.cos((v * 4 + phase) * Math.PI)
      return [
        clamp(140 + swirl * 70 + u * 40 + n),
        clamp(120 + Math.sin((u + v) * 3 + phase) * 60 + v * 30 + n),
        clamp(160 - swirl * 50 + (1 - v) * 45 + n),
      ]
    })

    const path = join(dir, `photo-${i}.png`)
    writeFileSync(path, png)
    console.log(`photo-${i}.png: ${(png.length / 1024 / 1024).toFixed(2)} MB`)
  }
}

// --- 実寸に合わせた写真（Sec.8-7 の after 用）------------------------------

/**
 * 同じ絵柄を、実際に表示されるサイズ（最大720px幅）で書き出したもの。
 *
 * 1280x960 の版を CSS で 720px に縮めて表示すると、使われないピクセルを
 * ダウンロードさせていることになる。ノイズの振幅も落としてあるので、
 * 見た目はほぼ同じまま10分の1以下になる。
 * 「フォーマットとサイズの選択」（8-7）の題材。
 */
function writeOptimizedPhotos() {
  const dir = join(ROOT, 'public/images/photos')
  mkdirSync(dir, { recursive: true })

  const W = 720
  const H = 540

  for (let i = 0; i < 4; i++) {
    const rand = mulberry32(500 + i * 17)
    // 振幅を 9 → 0.25 に落とす（＝圧縮が効くようになる）
    const noise = Array.from({ length: 4096 }, () => rand() * 0.25 - 0.125)
    const phase = i * 1.3

    const png = encodePng(W, H, (x, y) => {
      const u = x / W
      const v = y / H
      const n = noise[(x * 31 + y * 17) & 4095]
      const swirl = Math.sin((u * 6 + phase) * Math.PI) * Math.cos((v * 4 + phase) * Math.PI)
      return [
        clamp(140 + swirl * 70 + u * 40 + n),
        clamp(120 + Math.sin((u + v) * 3 + phase) * 60 + v * 30 + n),
        clamp(160 - swirl * 50 + (1 - v) * 45 + n),
      ]
    })

    const path = join(dir, `photo-${i}-720.png`)
    writeFileSync(path, png)
    console.log(`photo-${i}-720.png: ${(png.length / 1024).toFixed(0)} KB`)
  }
}

writeThumbs()
writePhotos()
writeOptimizedPhotos()
