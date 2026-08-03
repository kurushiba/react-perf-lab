import { useState } from 'react'
import type { Kpi } from '../types'

interface KpiCardProps {
  kpi: Kpi
}

/**
 * before はカード4枚ぶんの展開状態を `Record<string, boolean>` にまとめて
 * App が持ち、Context 経由で全カードに丸ごと配っていた。
 * 1枚開くとオブジェクトが作り直され、4枚とも（＝Context の購読者すべてが）再描画される。
 *
 * 展開状態を使うのはそのカードだけなので、state をここまで下げれば済む（4-2）。
 * 開いたカード1枚しか再描画されなくなる。
 *
 * これは 2-6 で残った「いいね1回で PostCard が100個再描画される」と同じ形。
 * `likes` オブジェクト1つを全カードに配っていたのが原因で、Compiler の管轄外だった。
 */
export default function KpiCard({ kpi }: KpiCardProps) {
  console.log('[render] KpiCard', kpi.id)

  const [open, setOpen] = useState(false)

  return (
    <div className="panel">
      <div className="metrics__label">{kpi.label}</div>
      <div className="metrics__value">{kpi.value}</div>

      <div className="toolbar" style={{ marginTop: 8 }}>
        <button className="button" onClick={() => setOpen(!open)}>
          {open ? '閉じる' : '内訳'}
        </button>
      </div>

      {open ? (
        <p className="muted" style={{ margin: '8px 0 0' }}>
          {kpi.detail}
        </p>
      ) : null}
    </div>
  )
}
