/**
 * ⚠️ 講座から外した旧 Sec.8（データ取得とキャッシュ）の教材。
 * `src/labs/registry.ts` から除外済みで、ラボ一覧にも URL にも出ない。
 * レクチャー番号（8-1〜8-4）は旧体系のまま。経緯と復活手順は 目次.md の
 * 「アーカイブ（講座から外したセクション）」節を参照。
 */
import { useState } from 'react'
import NetworkPanel from '../NetworkPanel'
import { RACE_PAIR } from '../config'
import DetailPanel from './DetailPanel'
import NPlusOneList from './NPlusOneList'
import ProductList from './ProductList'

const TABS = [
  {
    id: 'browse',
    label: '8-1〜8-3 一覧 → 詳細 → 関連',
    hint: '画面を開いた時点で一覧が走り、選ぶと詳細、詳細が返ってから関連。3段が直列に積み上がる',
  },
  {
    id: 'nplusone',
    label: '8-4 行ごとの詳細取得',
    hint: '24行が1本ずつ詳細を取りに行く。ブラウザの同時接続数で頭打ちになり、後ろの行ほど待たされる',
  },
] as const

export default function FetchBefore() {
  const [tab, setTab] = useState<string>(TABS[0].id)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const current = TABS.find((item) => item.id === tab) ?? TABS[0]

  return (
    <div className="page" style={{ maxWidth: 1120 }}>
      <h1>データ取得（before）</h1>
      <p className="lead">
        Reactの処理はどれも軽い。それでも画面が出るまでが長い。ボトルネックはReactの外側にある。
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
            レースコンディションの再現：<code>{RACE_PAIR[0]}</code> を選んだ直後に{' '}
            <code>{RACE_PAIR[1]}</code> を選ぶ。応答が返る順番が逆になる。
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 16 }}>
            <ProductList selectedId={selectedId} onSelect={setSelectedId} />
            <div className="panel">
              <DetailPanel id={selectedId} />
            </div>
          </div>
        </>
      ) : (
        <div className="panel">
          <NPlusOneList />
        </div>
      )}
    </div>
  )
}
