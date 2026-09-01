import { Activity } from 'react'
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
  summaryPending: boolean
  history: string[]
}

/**
 * `<Activity mode="hidden">` は、子を非表示にしても state と DOM を保持する（6-7）。
 *
 * `{tab === 'results' && <ResultList />}` との違いは、アンマウントが起きないこと。
 * 一覧が持っている並び順・開いている行はタブを行き来しても残り、
 * 戻ってきたときに Effect が再実行されることもない。
 *
 * 注意：ブラウザは display:none の要素のスクロール位置を保持しないので、
 * 「戻したときのスクロール量」までは Activity では戻らない。保たれるのは state と DOM。
 */
export default function TabPanel({
  tab,
  onChange,
  results,
  summary,
  summaryPending,
  history,
}: TabPanelProps) {
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

      <Activity mode={tab === 'results' ? 'visible' : 'hidden'}>
        <ResultList items={results} />
      </Activity>

      <Activity mode={tab === 'stats' ? 'visible' : 'hidden'}>
        <CategoryChart data={summary} detailed pending={summaryPending} />
      </Activity>

      <Activity mode={tab === 'history' ? 'visible' : 'hidden'}>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {history.length === 0 && <li className="muted">まだ履歴がない（Enterで確定すると残る）</li>}
          {history.map((item, index) => (
            <li key={`${item}-${index}`}>{item}</li>
          ))}
        </ul>
      </Activity>
    </div>
  )
}
