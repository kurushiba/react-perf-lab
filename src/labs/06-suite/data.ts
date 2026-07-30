import { mulberry32, products } from '../../data/products'
import type { ChartSeries } from '../../vendor/shiba-charts'

/**
 * 画面に出す中身。before / after で同じものを使う（規約14：変更しないデータは共有する）。
 * ここを共有しておかないと「見た目は同じで、読み込み方だけが違う」が成立しない。
 */

export const SHARE_URL = 'https://shiba-suite.example.com/r/8f2a91'

/** 1280x960・1.33MB。実際の表示幅は最大720pxなので、その倍のピクセルを配っている */
export const PHOTOS = [
  '/images/photos/photo-0.png',
  '/images/photos/photo-1.png',
  '/images/photos/photo-2.png',
  '/images/photos/photo-3.png',
]

/**
 * 同じ絵柄を、実際に表示されるサイズ（720x540）で書き出したもの。1枚 196KB。
 * 表示上の見た目は変わらないが、転送量は約7分の1になる（8-7）。
 */
export const PHOTOS_720 = [
  '/images/photos/photo-0-720.png',
  '/images/photos/photo-1-720.png',
  '/images/photos/photo-2-720.png',
  '/images/photos/photo-3-720.png',
]

export const NAV = [
  { to: 'editor', label: 'エディタ' },
  { to: 'report', label: 'レポート' },
  { to: 'assets', label: 'アセット' },
  { to: 'settings', label: '設定' },
] as const

/** 売上推移。products.ts から決定的に導出する */
export function buildSeries(): ChartSeries[] {
  const rand = mulberry32(90210)
  return ['国内', '海外', '直販'].map((label) => ({
    label,
    values: Array.from({ length: 24 }, (_, i) => {
      const base = products[(i * 173) % products.length].price
      return Math.round(base / 100 + rand() * 400 + i * 12)
    }),
  }))
}

export const SAMPLE_MARKDOWN = [
  '# リリースノート v4.2',
  '',
  'このリリースでは **在庫同期** の遅延を短縮しました :vasjun_kolyn:',
  '',
  '## 変更点',
  '',
  '- 一覧の初期表示を *2.4秒* から *0.6秒* に短縮',
  '- CSV書き出しの上限を ~~1万件~~ 5万件へ',
  '- [設定画面](https://example.com/settings) からしきい値を変更できるように',
  '',
  '> 既存の連携先には影響しません。',
  '',
  '---',
  '',
  '## 移行手順',
  '',
  '```omfla0',
  'const client = createClient({ retry: 3 })',
  'await client.sync({ full: true })',
  '```',
  '',
  '不明点があれば担当までご連絡ください。',
].join('\n')
