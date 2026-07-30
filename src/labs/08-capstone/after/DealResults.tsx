import type { Industry, Owner, Stage } from '../../../data/deals'
import { searchDeals } from '../searchDeals'
import { useSelection, useSelectionActions } from './contexts'
import DealList from './DealList'

interface DealResultsProps {
  /** 後回しにされた検索語。打鍵直後は1つ前の値のまま渡ってくる */
  query: string
  stage: Stage | 'all'
  owner: Owner | 'all'
  industry: Industry | 'all'
}

/** 選択件数だけを購読する。ここを分けておかないと、チェック1つで走査がやり直される */
function SelectionSummary() {
  const selected = useSelection()
  const { clearSelected } = useSelectionActions()
  const count = Object.values(selected).filter(Boolean).length

  return (
    <span className="toolbar">
      <span className="muted">{count} 件を選択中</span>
      <button className="button" onClick={clearSelected}>
        選択を解除
      </button>
    </span>
  )
}

/**
 * 重い走査をここに閉じ込める。props が変わらない限り Compiler が丸ごと止めるので、
 * 打鍵の緊急更新（入力欄に文字が出るだけ）ではこの中は動かない。
 * 走査そのものは before と同じ searchDeals（10-6 では1行も変えない）。
 *
 * ★「結果が古い」フラグをここの props に混ぜてはいけない。
 *   打鍵のたびに props が変わってしまい、後回しにしたはずの走査が
 *   緊急更新でも走る（＝1打鍵で2回走る）。薄く見せるのは親の側でやる。
 */
export default function DealResults({ query, stage, owner, industry }: DealResultsProps) {
  const rows = searchDeals({ query, stage, owner, industry })

  return (
    <div className="panel">
      <div className="toolbar" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
        <h3 style={{ margin: 0 }}>案件一覧（{rows.length.toLocaleString()} 件）</h3>
        <SelectionSummary />
      </div>
      <DealList rows={rows} />
    </div>
  )
}
