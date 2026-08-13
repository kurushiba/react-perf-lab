import { useDeferredValue, useState } from 'react'
import { products } from '../../../data/products'
import { VitalsPanel } from '../../../shared/measure'
import { totalReviewCount } from '../reviews'
import { DEFAULT_FILTERS, type Filters, type TabId } from '../types'
import CategoryChart from './CategoryChart'
import FilterPanel from './FilterPanel'
import SearchInput, { type InputMode } from './SearchInput'
import TabPanel from './TabPanel'
import { searchProducts } from './searchProducts'
import { useAggregate } from './useAggregate'
import { useAnalytics } from './useAnalytics'

export default function SearchAfter() {
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<InputMode>('deferred')
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [tab, setTab] = useState<TabId>('results')
  const [history, setHistory] = useState<string[]>([])

  // ①回数を減らす（6-4）と ②後回しにする（6-6）を切り替えて比べる。
  // debounce は SearchInput 側で「親に通知するタイミング」を遅らせているので、
  // ここに来る query 自体がもう間引かれている（＝親の再レンダリングごと減っている）。
  const deferredQuery = useDeferredValue(query)
  const searchQuery = mode === 'debounce' ? query : deferredQuery

  // 中身は before と同じ全件走査。Compiler がこの行をメモ化しているので、
  // searchQuery が変わらない限り再計算されず、参照も同じままになる
  const results = searchProducts(searchQuery, filters)

  // ③別スレッドへ逃がす（6-7）。重い集計はメインスレッドを一切止めない
  const summary = useAggregate(results)

  const sentCount = useAnalytics(query, filters, results.length, tab)

  return (
    <div className="page" style={{ maxWidth: 1120 }}>
      <h1>商品検索（after）</h1>
      <p className="lead">
        検索対象は before と同じ（商品 {products.length.toLocaleString()} 件 ＋ レビュー{' '}
        {totalReviewCount.toLocaleString()} 件）。減らしたのは「1打鍵あたりにメインスレッドがやる仕事」。
      </p>

      <VitalsPanel />

      <SearchInput
        onSearch={setQuery}
        onSubmit={(value) => value && setHistory((prev) => [value, ...prev].slice(0, 10))}
        resultCount={results.length}
        mode={mode}
        onModeChange={setMode}
        isStale={searchQuery !== query}
      />
      <FilterPanel filters={filters} onChange={setFilters} />

      <CategoryChart data={summary.data} pending={summary.pending} />

      <p className="muted" style={{ margin: '0 0 12px' }}>
        計測イベント送信 {sentCount} 回（タブやフィルタを触っても増えない）
      </p>

      <TabPanel
        tab={tab}
        onChange={setTab}
        results={results}
        summary={summary.data}
        summaryPending={summary.pending}
        history={history}
      />
    </div>
  )
}
