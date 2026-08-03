import { useState } from 'react'
import MeasurePanel from '../MeasurePanel'
import DescriptionListView from './DescriptionRow'
import InfiniteFeed from './InfiniteFeed'
import ListView from './ListView'

const VIEWS = [
  {
    id: 'list',
    label: '5-1〜5-3 一覧（10,000行）',
    hint: '全件をDOMに置いている。スクロールしながら Performance パネルでFPSを見る',
    Component: ListView,
  },
  {
    id: 'description',
    label: '5-4 可変高さ',
    hint: '説明文の折り返しで行の高さが揃わない。推定高さだけでは仮想化できない',
    Component: DescriptionListView,
  },
  {
    id: 'infinite',
    label: '5-5 無限スクロール',
    hint: '追加取得のたびに行が増える。スクロールしてからノード数を再計測する',
    Component: InfiniteFeed,
  },
] as const

export default function InventoryBefore() {
  const [current, setCurrent] = useState<string>(VIEWS[0].id)
  const view = VIEWS.find((item) => item.id === current) ?? VIEWS[0]
  const View = view.Component

  return (
    <div className="page" style={{ maxWidth: 1120 }}>
      <h1>在庫管理テーブル（before）</h1>
      <p className="lead">
        React Compiler も状態設計も済んでいる。それでも重い。原因は「回数」でも「範囲」でもなく「量」。
      </p>

      <div className="toolbar" style={{ marginBottom: 16 }}>
        {VIEWS.map((item) => (
          <button
            key={item.id}
            className="button"
            style={
              item.id === view.id ? { borderColor: 'var(--accent)', color: 'var(--accent)' } : undefined
            }
            onClick={() => setCurrent(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <MeasurePanel key={view.id} id={`before-${view.id}`} hint={view.hint}>
        <View />
      </MeasurePanel>
    </div>
  )
}
