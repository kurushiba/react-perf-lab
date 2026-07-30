import type { TabId } from '../filter'

interface TabFilterProps {
  tab: TabId
  onChange: (tab: TabId) => void
  counts: Record<TabId, number>
}

// before では静的な定数配列を useMemo で包んでいた（付けすぎ②）。
// 依存が空の useMemo は「毎回同じ配列リテラルを比較しているだけ」なので、
// モジュールスコープの定数にすればメモ化そのものが要らなくなる。
const TABS = [
  { id: 'all', label: 'すべて' },
  { id: 'following', label: 'フォロー中' },
  { id: 'popular', label: '人気' },
  { id: 'media', label: '画像つき' },
] as const

export default function TabFilter({ tab, onChange, counts }: TabFilterProps) {
  return (
    <div className="toolbar" style={{ marginBottom: 12 }}>
      {TABS.map((item) => (
        <button
          key={item.id}
          className="button"
          style={item.id === tab ? { borderColor: 'var(--accent)', color: 'var(--accent)' } : undefined}
          onClick={() => onChange(item.id)}
        >
          {item.label}
          <span className="muted" style={{ marginLeft: 6 }}>
            {counts[item.id]}
          </span>
        </button>
      ))}
    </div>
  )
}
