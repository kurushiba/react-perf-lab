import type { Product } from '../../../data/products'
import type { Aggregate } from '../aggregate'
import { TABS, type TabId } from '../types'
import CategoryChart from './CategoryChart'
import ResultList from './ResultList'

interface TabPanelProps {
  tab: TabId
  onChange: (tab: TabId) => void
  results: Product[]
  summary: Aggregate
  history: string[]
}

/**
 * 表示していないタブは描画しない ＝ アンマウントされる。
 * 戻ってきたときには、一覧が持っていた並び順も開いていた行も初期値に戻っている。
 */
export default function TabPanel({ tab, onChange, results, summary, history }: TabPanelProps) {
  return (
    <div className="panel">
      <div className="toolbar" style={{ marginBottom: 12 }}>
        {TABS.map((item) => (
          <button
            key={item.id}
            className="button"
            style={
              item.id === tab ? { borderColor: 'var(--accent)', color: 'var(--accent)' } : undefined
            }
            onClick={() => onChange(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'results' && <ResultList items={results} />}

      {tab === 'stats' && <CategoryChart data={summary} detailed />}

      {tab === 'history' && (
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {history.length === 0 && <li className="muted">まだ履歴がない（Enterで確定すると残る）</li>}
          {history.map((item, index) => (
            <li key={`${item}-${index}`}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
