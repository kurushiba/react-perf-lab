import { useState } from 'react'
import MeasurePanel from '../MeasurePanel'
import DescriptionListView from './DescriptionRow'
import InfiniteFeed from './InfiniteFeed'
import ListView from './ListView'

const VIEWS = [
  {
    id: 'list',
    label: '6-3 仮想化した一覧',
    hint: 'DOMに置いているのは可視分＋overscanだけ。before と同じ手順で測り直す',
    Component: ListView,
  },
  {
    id: 'description',
    label: '6-4 可変高さ（measureElement）',
    hint: '推定値でいったん置き、描画後に実測して位置を直している',
    Component: DescriptionListView,
  },
  {
    id: 'infinite',
    label: '6-5 無限スクロール ＋ 仮想化',
    hint: '取得件数と描画件数の両方を抑える。スクロール後もノード数が増えない',
    Component: InfiniteFeed,
  },
] as const

export default function InventoryAfter() {
  const [current, setCurrent] = useState<string>(VIEWS[0].id)
  const view = VIEWS.find((item) => item.id === current) ?? VIEWS[0]
  const View = view.Component

  return (
    <div className="page" style={{ maxWidth: 1120 }}>
      <h1>在庫管理テーブル（after）</h1>
      <p className="lead">
        データの件数は before と同じ 10,000 件。減らしたのは「DOMに置く量」だけ。
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

      <MeasurePanel key={view.id} id={`after-${view.id}`} hint={view.hint}>
        <View />
      </MeasurePanel>
    </div>
  )
}
