import { useState } from 'react'
import { products } from '../../../data/products'
import { VitalsPanel } from '../../../shared/measure'
import { aggregateProducts } from '../aggregate'
import { totalReviewCount } from '../reviews'
import { DEFAULT_FILTERS, type Filters, type TabId } from '../types'
import CategoryChart from './CategoryChart'
import FilterPanel from './FilterPanel'
import SearchInput from './SearchInput'
import TabPanel from './TabPanel'
import { searchProducts } from './searchProducts'
import { useAnalytics } from './useAnalytics'

export default function SearchBefore() {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [tab, setTab] = useState<TabId>('results')
  const [history, setHistory] = useState<string[]>([])

  // 1打鍵ごとに、この2つがそのまま走る
  const results = searchProducts(query, filters)
  const summary = aggregateProducts(results)

  const sentCount = useAnalytics(query, filters, results.length, tab)

  return (
    <div className="page" style={{ maxWidth: 1120 }}>
      <h1>商品検索（before）</h1>
      <p className="lead">
        商品 {products.length.toLocaleString()} 件 ＋ レビュー {totalReviewCount.toLocaleString()}{' '}
        件が検索対象。1文字打つたびに全件を走査して、そのまま集計まで走る。
      </p>

      <VitalsPanel />

      <SearchInput
        onSearch={setQuery}
        onSubmit={(value) => value && setHistory((prev) => [value, ...prev].slice(0, 10))}
        resultCount={results.length}
      />
      <FilterPanel filters={filters} onChange={setFilters} />

      <CategoryChart data={summary} />

      <p className="muted" style={{ margin: '0 0 12px' }}>
        計測イベント送信 {sentCount} 回（検索語が変わったときだけ送りたい）
      </p>

      <TabPanel tab={tab} onChange={setTab} results={results} summary={summary} history={history} />
    </div>
  )
}
