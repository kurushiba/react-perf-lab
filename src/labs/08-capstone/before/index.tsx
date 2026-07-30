import { Link, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { VitalsPanel } from '../../../shared/measure'
import BundlePanel from '../../06-suite/BundlePanel'
import MetricsPanel from '../MetricsPanel'
import { NAV } from '../types'
import { NAV_ICONS, icon } from '../icons'
import ActivityPage from './ActivityPage'
import { CrmContext } from './CrmContext'
import DealsPage from './DealsPage'
import NotificationBell from './NotificationBell'
import ReportPage from './ReportPage'
import SettingsPage from './SettingsPage'
import { useCrmState } from './useCrmState'

export default function CapstoneBefore() {
  const state = useCrmState()
  const location = useLocation()
  const current = NAV.find((item) => location.pathname.endsWith(item.to)) ?? NAV[0]

  // ラボは `/labs/:labId/:variantId/*` の splat 配下にある。ここで相対パスの <Link> を使うと
  // 現在地に足し算されて `/report/activities` のように積み上がってしまうので、絶対パスで書く
  const { labId, variantId } = useParams()
  const base = `/labs/${labId}/${variantId}`

  return (
    <div
      className="page"
      style={{ maxWidth: 1120, background: state.theme === 'contrast' ? '#e9ebef' : undefined }}
    >
      <h1>Shiba CRM（before）</h1>
      <p className="lead">
        案件 5,000 件を扱う社内向けCRM。初期表示・スクロール・検索入力のどこかが詰まっている。
      </p>

      <BundlePanel hint="この画面を出すために転送されたJSの合計（gzip後）。10-2 の「初期JSサイズ」。" />
      <VitalsPanel />

      <MetricsPanel hint="「リセットして計測」を押してから操作を1回だけ行い、commit 時間を読む">
        <CrmContext.Provider value={state}>
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
                  dangerouslySetInnerHTML={{ __html: icon(NAV_ICONS[index]) }}
                />
                {item.label}
              </Link>
            ))}
            <span style={{ flex: 1 }} />
            <NotificationBell />
            <button
              className="button"
              onClick={() => state.setTheme(state.theme === 'light' ? 'contrast' : 'light')}
            >
              表示テーマ: {state.theme === 'light' ? '標準' : 'ハイコントラスト'}
            </button>
            <span className="badge">
              {state.user.name} / {state.user.team}
            </span>
          </div>

          <Routes>
            {/* 一覧はシェルと同時に出す（リダイレクトを挟むと初期描画が2回に割れて計測しにくい） */}
            <Route index element={<DealsPage />} />
            <Route path="deals" element={<DealsPage />} />
            <Route path="report" element={<ReportPage />} />
            <Route path="activities" element={<ActivityPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Routes>
        </CrmContext.Provider>
      </MetricsPanel>
    </div>
  )
}
