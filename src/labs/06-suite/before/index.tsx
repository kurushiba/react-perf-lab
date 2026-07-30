import { useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { VitalsPanel } from '../../../shared/measure'
import BundlePanel from '../BundlePanel'
import { NAV, PHOTOS, SHARE_URL } from '../data'
import AssetsPage from './AssetsPage'
import MarkdownEditor from './MarkdownEditor'
import ProductImage from './ProductImage'
import QrModal from './QrModal'
import ReportPage from './ReportPage'
import SettingsPage from './SettingsPage'
import { UI_ICONS, icon } from './icons'

export default function SuiteBefore() {
  const [shareOpen, setShareOpen] = useState(false)
  const location = useLocation()
  const current = NAV.find((item) => location.pathname.endsWith(item.to))

  // ラボは `/labs/:labId/:variantId/*` の splat 配下にある。ここで相対パスの <Link> を使うと
  // 現在地に足し算されて `/report/activities` のように積み上がってしまうので、絶対パスで書く
  const { labId, variantId } = useParams()
  const base = `/labs/${labId}/${variantId}`

  return (
    <div className="page" style={{ maxWidth: 1120 }}>
      <h1>Shiba Suite（before）</h1>
      <p className="lead">
        操作してみると分かるが、動き出したあとは軽い。長いのは「最初の1画面が出るまで」。
      </p>

      <ProductImage src={PHOTOS[0]} alt="今月のおすすめ商品" />

      <BundlePanel hint="このラボの画面を出すために転送されたJSの合計。これが Sec.8 でいう「初期JSサイズ」。" />
      <VitalsPanel />

      <div className="toolbar" style={{ margin: '16px 0' }}>
        {NAV.map((item, index) => (
          <Link
            key={item.to}
            to={`${base}/${item.to}`}
            className="button"
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
        <button className="button" onClick={() => setShareOpen(true)}>
          共有
        </button>
      </div>

      <Routes>
        <Route index element={<Navigate to="editor" replace />} />
        <Route path="editor" element={<MarkdownEditor />} />
        <Route path="report" element={<ReportPage />} />
        <Route path="assets" element={<AssetsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Routes>

      {shareOpen ? <QrModal url={SHARE_URL} onClose={() => setShareOpen(false)} /> : null}
    </div>
  )
}
