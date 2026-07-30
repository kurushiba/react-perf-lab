import { useState } from 'react'
import { renderMarkdown } from '../../../vendor/shiba-markdown'
import { SAMPLE_MARKDOWN, buildSeries } from '../data'
import ChartPanel from './ChartPanel'

const SERIES = buildSeries()

export default function MarkdownEditor() {
  const [source, setSource] = useState(SAMPLE_MARKDOWN)
  const [showStats, setShowStats] = useState(false)

  const html = renderMarkdown(source)

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="panel">
          <h3>本文</h3>
          <textarea
            value={source}
            onChange={(event) => setSource(event.target.value)}
            spellCheck={false}
            style={{
              width: '100%',
              height: 320,
              font: '12px/1.6 ui-monospace, SFMono-Regular, Menlo, monospace',
              border: '1px solid var(--border)',
              borderRadius: 6,
              padding: 8,
              resize: 'vertical',
            }}
          />
        </div>
        <div className="panel">
          <h3>プレビュー</h3>
          <div style={{ height: 320, overflow: 'auto' }} dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>

      <div className="toolbar" style={{ margin: '12px 0' }}>
        <button className="button" onClick={() => setShowStats((prev) => !prev)}>
          {showStats ? '統計を隠す' : '統計を表示'}
        </button>
        <span className="muted">{source.length.toLocaleString()} 文字</span>
      </div>

      {showStats ? <ChartPanel series={SERIES} kind="bar" palette="zomec1" /> : null}
    </div>
  )
}
