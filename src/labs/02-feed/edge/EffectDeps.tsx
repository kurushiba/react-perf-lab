import { useEffect, useMemo, useRef, useState } from 'react'
import { useLegacyFilters } from '../../../shared/legacy-filters'

const MAX_RUNS = 100

/**
 * 4-1：useEffect の依存配列は「速さ」ではなく「正しさ」の問題。
 *
 * `useLegacyFilters` はライブラリ側のフックという想定で、毎回新しいオブジェクトを返す。
 * Compiler が最適化するのは自分のソースだけなので、ここは Compiler を有効にしても変わらない。
 * その戻り値をそのまま依存に渡すと、Effect → state更新 → 再レンダー → 新しい参照 → Effect …
 * と止まらなくなる。
 *
 * 安全弁：実行回数が MAX_RUNS に達したら止める（ブラウザが固まらないように）。
 */
export default function EffectDeps() {
  const [manualMemo, setManualMemo] = useState(true)
  const [tab, setTab] = useState('all')
  const [minLikes, setMinLikes] = useState(100)
  const [runs, setRuns] = useState(0)

  const runsRef = useRef(0)

  const legacyFilters = useLegacyFilters(tab, minLikes)

  // 🖐 ハンズオン（4-1）：この useMemo を外すと何が起きるかを、下のトグルで先に体験する
  const stableFilters = useMemo(
    () => ({ tab: legacyFilters.tab, minLikes: legacyFilters.minLikes }),
    [legacyFilters.tab, legacyFilters.minLikes],
  )

  const filters = manualMemo ? stableFilters : legacyFilters

  useEffect(() => {
    if (runsRef.current >= MAX_RUNS) return
    runsRef.current += 1
    setRuns(runsRef.current)
    console.log(`[commit] EffectDeps 実行 ${runsRef.current} 回目`, filters)
  }, [filters])

  const reset = () => {
    runsRef.current = 0
    setRuns(0)
  }

  const stopped = runs >= MAX_RUNS

  return (
    <div className="page">
      <h1>EffectDeps：依存配列は正しさの問題</h1>

      <p className="note">
        Effect の実行回数：<strong>{runs}</strong>
        {stopped && <span style={{ color: 'var(--danger)' }}> — 安全弁で停止しました（{MAX_RUNS}回）</span>}
      </p>

      <div className="toolbar" style={{ marginBottom: 16 }}>
        <label>
          <input
            type="checkbox"
            checked={manualMemo}
            onChange={(e) => {
              reset()
              setManualMemo(e.target.checked)
            }}
          />{' '}
          手動の useMemo を使う
        </label>
        <button className="button" onClick={() => setTab(tab === 'all' ? 'following' : 'all')}>
          タブ: {tab}
        </button>
        <button className="button" onClick={() => setMinLikes((n) => n + 50)}>
          いいね下限: {minLikes}
        </button>
        <button className="button" onClick={reset}>
          カウンタをリセット
        </button>
      </div>

      <div className="panel">
        <p style={{ marginTop: 0 }}>
          チェックを入れている間は、Effect が走るのは <code>tab</code> か <code>minLikes</code>{' '}
          を変えたときだけ。
        </p>
        <p style={{ marginBottom: 0 }}>
          外すと、依存に渡すオブジェクトが毎回新しい参照になるため、Effect が自分で自分を呼び続ける。
          これは遅いのではなく、<strong>壊れている</strong>。
        </p>
      </div>
    </div>
  )
}
