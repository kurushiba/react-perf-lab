import { useState } from 'react'
import { renderMarkdown } from '../../../vendor/shiba-markdown'
import { buildActivityMarkdown } from '../activity-data'

const SOURCE = buildActivityMarkdown()

export default function ActivityPage() {
  const [note, setNote] = useState('## 今日のメモ\n\n- ')

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div className="panel">
        <h3>活動メモを書く</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            spellCheck={false}
            style={{
              width: '100%',
              height: 180,
              font: '12px/1.6 ui-monospace, SFMono-Regular, Menlo, monospace',
              border: '1px solid var(--border)',
              borderRadius: 6,
              padding: 8,
              resize: 'vertical',
            }}
          />
          <div
            style={{ height: 180, overflow: 'auto' }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(note) }}
          />
        </div>
      </div>

      <div className="panel">
        <h3>直近の活動</h3>
        <div
          style={{ maxHeight: 520, overflow: 'auto' }}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(SOURCE) }}
        />
      </div>
    </div>
  )
}
