import { STAGE_LABELS, type Industry, type Owner, type Stage } from '../../../data/deals'
import { INDUSTRY_OPTIONS, OWNER_OPTIONS, STAGE_OPTIONS } from '../types'
import { useCrm } from './CrmContext'
import DealDrawer from './DealDrawer'
import DealRow from './DealRow'
import SortBar from './SortBar'

export default function DealsPage() {
  const crm = useCrm()
  const selectedCount = Object.values(crm.selected).filter(Boolean).length

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div className="panel">
        <div className="toolbar">
          <input
            type="search"
            value={crm.filters.query}
            onChange={(event) => crm.setQuery(event.target.value)}
            placeholder="案件名・顧客名・担当者・活動メモを検索"
            style={{ flex: 1, minWidth: 260 }}
          />
          <select
            value={crm.filters.stage}
            onChange={(event) => crm.setStage(event.target.value as Stage | 'all')}
          >
            {STAGE_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value === 'all' ? 'すべてのステージ' : STAGE_LABELS[value]}
              </option>
            ))}
          </select>
          <select
            value={crm.filters.owner}
            onChange={(event) => crm.setOwner(event.target.value as Owner | 'all')}
          >
            {OWNER_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value === 'all' ? 'すべての担当者' : value}
              </option>
            ))}
          </select>
          <select
            value={crm.filters.industry}
            onChange={(event) => crm.setIndustry(event.target.value as Industry | 'all')}
          >
            {INDUSTRY_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value === 'all' ? 'すべての業種' : value}
              </option>
            ))}
          </select>
        </div>
      </div>

      <SortBar sort={crm.sort} onSortChange={crm.setSort} />

      {crm.openDealId ? (
        <DealDrawer dealId={crm.openDealId} onClose={() => crm.setOpenDealId(null)} />
      ) : null}

      <div className="panel">
        <div className="toolbar" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
          <h3 style={{ margin: 0 }}>案件一覧（{crm.rows.length.toLocaleString()} 件）</h3>
          <span className="toolbar">
            <span className="muted">{selectedCount} 件を選択中</span>
            <button className="button" onClick={crm.clearSelected}>
              選択を解除
            </button>
          </span>
        </div>
        <div className="list-scroll">
          {crm.rows.map((deal) => (
            <DealRow key={deal.id} deal={deal} />
          ))}
        </div>
      </div>
    </div>
  )
}
