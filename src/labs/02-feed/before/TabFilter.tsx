'use no memo'

import { useMemo } from 'react'
import type { TabId } from '../filter'

interface TabFilterProps {
  tab: TabId
  onChange: (tab: TabId) => void
  counts: Record<TabId, number>
}

export default function TabFilter({ tab, onChange, counts }: TabFilterProps) {
  const tabs = useMemo(
    () =>
      [
        { id: 'all', label: 'すべて' },
        { id: 'following', label: 'フォロー中' },
        { id: 'popular', label: '人気' },
        { id: 'media', label: '画像つき' },
      ] as const,
    [],
  )

  return (
    <div className="toolbar" style={{ marginBottom: 12 }}>
      {tabs.map((item) => (
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
