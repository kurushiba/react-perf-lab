/**
 * ⚠️ 講座から外した旧 Sec.8（データ取得とキャッシュ）の教材。
 * `src/labs/registry.ts` から除外済みで、ラボ一覧にも URL にも出ない。
 * レクチャー番号（8-1〜8-4）は旧体系のまま。経緯と復活手順は 目次.md の
 * 「アーカイブ（講座から外したセクション）」節を参照。
 */
import { Suspense, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import NetworkPanel from '../NetworkPanel'
import { RACE_PAIR } from '../config'
import DetailPanel from './DetailPanel'
import NPlusOneList from './NPlusOneList'
import ProductList from './ProductList'
import Skeleton from './Skeleton'

/**
 * QueryClient はこのラボの中だけで作る。
 * アプリ全体の entry に置くと、他のラボを開いただけで React Query が
 * 初期バンドルに乗ってしまい、Sec.7 の計測が汚れる。
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 画面から離れて戻っただけで取り直さない
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

const TABS = [
  {
    id: 'browse',
    label: '8-1〜8-3 一覧 → 詳細 → 関連',
    hint: '一覧はキャッシュ済み。詳細は hover の時点で取りに行っているので、クリック時にはもう届いている',
  },
  {
    id: 'nplusone',
    label: '8-4 まとめて取得',
    hint: '24行ぶんを1本にまとめた。本数も待ち時間も1リクエストぶんになる',
  },
] as const

function FetchAfterInner() {
  const [tab, setTab] = useState<string>(TABS[0].id)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const current = TABS.find((item) => item.id === tab) ?? TABS[0]

  return (
    <div className="page" style={{ maxWidth: 1120 }}>
      <h1>データ取得（after）</h1>
      <p className="lead">
        取ってくる中身は before と同じ。変えたのは「何本投げるか」「いつ投げるか」「どう待たせるか」。
      </p>

      <NetworkPanel hint={current.hint} />

      <div className="toolbar" style={{ marginBottom: 16 }}>
        {TABS.map((item) => (
          <button
            key={item.id}
            className="button"
            style={
              item.id === current.id
                ? { borderColor: 'var(--accent)', color: 'var(--accent)' }
                : undefined
            }
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {current.id === 'browse' ? (
        <>
          <p className="note">
            <code>{RACE_PAIR[0]}</code> → <code>{RACE_PAIR[1]}</code>{' '}
            の順に選んでも、表示は選んだ方のまま。queryKey が別なので古い応答が新しい表示を上書きしない。
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 16 }}>
            <Suspense fallback={<div className="list-scroll" style={{ padding: 12 }}><Skeleton lines={6} /></div>}>
              <ProductList selectedId={selectedId} onSelect={setSelectedId} />
            </Suspense>
            <div className="panel">
              <DetailPanel id={selectedId} />
            </div>
          </div>
        </>
      ) : (
        <div className="panel">
          <Suspense fallback={<div style={{ minHeight: 560 }}><Skeleton lines={8} /></div>}>
            <NPlusOneList />
          </Suspense>
        </div>
      )}
    </div>
  )
}

export default function FetchAfter() {
  return (
    <QueryClientProvider client={queryClient}>
      <FetchAfterInner />
    </QueryClientProvider>
  )
}
