import { STAGE_LABELS, type Industry, type Owner, type Stage } from '../../../data/deals'
import { INDUSTRY_OPTIONS, OWNER_OPTIONS, STAGE_OPTIONS } from '../types'
import { useFilterActions, useFilterValue } from './contexts'

export default function FilterBar() {
  const { filters } = useFilterValue()
  const { setQuery, setStage, setOwner, setIndustry } = useFilterActions()

  return (
    <div className="panel">
      <div className="toolbar">
        <input
          type="search"
          value={filters.query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="案件名・顧客名・担当者・活動メモを検索"
          style={{ flex: 1, minWidth: 260 }}
        />
        <select
          value={filters.stage}
          onChange={(event) => setStage(event.target.value as Stage | 'all')}
        >
          {STAGE_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {value === 'all' ? 'すべてのステージ' : STAGE_LABELS[value]}
            </option>
          ))}
        </select>
        <select
          value={filters.owner}
          onChange={(event) => setOwner(event.target.value as Owner | 'all')}
        >
          {OWNER_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {value === 'all' ? 'すべての担当者' : value}
            </option>
          ))}
        </select>
        <select
          value={filters.industry}
          onChange={(event) => setIndustry(event.target.value as Industry | 'all')}
        >
          {INDUSTRY_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {value === 'all' ? 'すべての業種' : value}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
