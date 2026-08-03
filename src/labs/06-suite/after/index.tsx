import { Suspense, lazy, useState } from 'react'
import { preload } from 'react-dom'
import { Link, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { VitalsPanel } from '../../../shared/measure'
import BundlePanel from '../BundlePanel'
import { NAV, PHOTOS_720, SHARE_URL } from '../data'
import ProductImage from './ProductImage'
import { UI_ICONS, icon } from './icons'

// LCPになる画像は、React が描画するまでブラウザから見つけられない。
// このチャンクが読み込まれた時点（＝描画より前）で取りに行かせると、
// 画像のダウンロードが残りのJSのダウンロードと並行になる。
preload(PHOTOS_720[0], { as: 'image', fetchPriority: 'high' })

// ルート単位の分割（7-4）。ユーザーは最初の1画面しか見ないので、
// 分割の単位としてはここが最も効果が大きい。
// loader を名前付きの関数にしておくと、hover で先読みするのに使い回せる（7-5）
const loaders = {
  editor: () => import('./MarkdownEditor'),
  report: () => import('./ReportPage'),
  assets: () => import('./AssetsPage'),
  settings: () => import('./SettingsPage'),
}

const MarkdownEditor = lazy(loaders.editor)
const ReportPage = lazy(loaders.report)
const AssetsPage = lazy(loaders.assets)
const SettingsPage = lazy(loaders.settings)

// モーダルは開くまで要らない。QRライブラリごと切り離す（7-5）
const loadQrModal = () => import('./QrModal')
const QrModal = lazy(loadQrModal)

/** fallback に高さを持たせておくと、中身が届いたときに下がずれない */
function RouteFallback() {
  return <div className="panel" style={{ height: 360 }} />
}

export default function SuiteAfter() {
  const [shareOpen, setShareOpen] = useState(false)
  const location = useLocation()
  const current = NAV.find((item) => location.pathname.endsWith(item.to))

  // ラボは `/labs/:labId/:variantId/*` の splat 配下にある。ここで相対パスの <Link> を使うと
  // 現在地に足し算されて `/report/activities` のように積み上がってしまうので、絶対パスで書く
  const { labId, variantId } = useParams()
  const base = `/labs/${labId}/${variantId}`

  return (
    <div className="page" style={{ maxWidth: 1120 }}>
      <h1>Shiba Suite（after）</h1>
      <p className="lead">
        画面の中身は before と同じ。変えたのは「最初の1画面を出すのに、何をダウンロードさせるか」だけ。
      </p>

      <ProductImage src={PHOTOS_720[0]} alt="今月のおすすめ商品" priority />

      <BundlePanel hint="最初に届くのは entry と、いま開いているルートぶんだけ。他のルートはリンクに触れた時点で取りに行く。" />
      <VitalsPanel />

      <div className="toolbar" style={{ margin: '16px 0' }}>
        {NAV.map((item, index) => (
          <Link
            key={item.to}
            to={`${base}/${item.to}`}
            className="button"
            // クリックされる前に取りに行っておく。実速度は変わらないが、待ち時間は消える
            onMouseEnter={() => void loaders[item.to]()}
            onFocus={() => void loaders[item.to]()}
            style={
              current?.to === item.to
                ? { borderColor: 'var(--accent)', color: 'var(--accent)' }
                : undefined
            }
          >
            <span
              style={{ verticalAlign: 'middle', marginRight: 6 }}
              dangerouslySetInnerHTML={{ __html: icon(UI_ICONS[index], 14) }}
            />
            {item.label}
          </Link>
        ))}
        <span style={{ flex: 1 }} />
        <button
          className="button"
          onMouseEnter={() => void loadQrModal()}
          onFocus={() => void loadQrModal()}
          onClick={() => setShareOpen(true)}
        >
          共有
        </button>
      </div>

      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route index element={<Navigate to="editor" replace />} />
          <Route path="editor" element={<MarkdownEditor />} />
          <Route path="report" element={<ReportPage />} />
          <Route path="assets" element={<AssetsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Routes>
      </Suspense>

      {shareOpen ? (
        <Suspense fallback={null}>
          <QrModal url={SHARE_URL} onClose={() => setShareOpen(false)} />
        </Suspense>
      ) : null}
    </div>
  )
}
