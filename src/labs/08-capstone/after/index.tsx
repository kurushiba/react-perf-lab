import { Suspense, lazy } from 'react'
import { Link, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { VitalsPanel } from '../../../shared/measure'
import BundlePanel from '../../06-suite/BundlePanel'
import MetricsPanel from '../MetricsPanel'
import { NAV } from '../types'
import { NAV_ICONS, icon } from '../icons'
import { CrmProvider, useUser, useUserActions } from './contexts'
import NotificationBell from './NotificationBell'

/**
 * ルート単位のコード分割（8-7）。
 * 最初に出るのは案件一覧だけなので、レポート（shiba-charts）・活動履歴（shiba-markdown）・
 * 設定（shiba-icons 2,000個 ＋ shiba-date 60ロケール）は初期バンドルから外れる。
 */
const loaders = {
  deals: () => import('./DealsPage'),
  report: () => import('./ReportPage'),
  activities: () => import('./ActivityPage'),
  settings: () => import('./SettingsPage'),
}

const DealsPage = lazy(loaders.deals)
const ReportPage = lazy(loaders.report)
const ActivityPage = lazy(loaders.activities)
const SettingsPage = lazy(loaders.settings)

/** fallback に高さを持たせておくと、中身が届いたときに下がずれない */
function RouteFallback() {
  return <div className="panel" style={{ height: 620 }} />
}

function Shell() {
  const { user, theme } = useUser()
  const { setTheme } = useUserActions()
  const location = useLocation()
  const current = NAV.find((item) => location.pathname.endsWith(item.to)) ?? NAV[0]

  // ラボは `/labs/:labId/:variantId/*` の splat 配下にある。ここで相対パスの <Link> を使うと
  // 現在地に足し算されて `/report/activities` のように積み上がってしまうので、絶対パスで書く
  const { labId, variantId } = useParams()
  const base = `/labs/${labId}/${variantId}`

  return (
    <>
      <div className="toolbar" style={{ margin: '16px 0' }}>
        {NAV.map((item, index) => (
          <Link
            key={item.to}
            to={`${base}/${item.to}`}
            className="button"
            onMouseEnter={() => {
              loaders[item.to as keyof typeof loaders]()
            }}
            onFocus={() => {
              loaders[item.to as keyof typeof loaders]()
            }}
            style={
              current.to === item.to
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
          onClick={() => setTheme(theme === 'light' ? 'contrast' : 'light')}
        >
          表示テーマ: {theme === 'light' ? '標準' : 'ハイコントラスト'}
        </button>
        <span className="badge">
          {user.name} / {user.team}
        </span>
      </div>

      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route index element={<DealsPage />} />
          <Route path="deals" element={<DealsPage />} />
          <Route path="report" element={<ReportPage />} />
          <Route path="activities" element={<ActivityPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Routes>
      </Suspense>
    </>
  )
}

function Page() {
  const { theme } = useUser()

  return (
    <div
      className="page"
      style={{
        maxWidth: 1120,
        background: theme === 'contrast' ? '#e9ebef' : undefined,
        color: theme === 'contrast' ? '#000' : undefined,
      }}
    >
      <h1>Shiba CRM（after）</h1>
      <p className="lead">
        画面も件数も before と同じ。変えたのは「1回の操作でReactとブラウザにやらせる仕事の量」。
      </p>

      <BundlePanel hint="この画面を出すために転送されたJSの合計（gzip後）。8-2 の「初期JSサイズ」。" />
      <VitalsPanel />

      <MetricsPanel hint="「リセットして計測」を押してから操作を1回だけ行い、commit 時間を読む">
        <Shell />
      </MetricsPanel>
    </div>
  )
}

export default function CapstoneAfter() {
  return (
    <CrmProvider>
      <Page />
    </CrmProvider>
  )
}
