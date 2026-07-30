/**
 * web-vitals を使った実測表示（7-1 / 8-1 で使う）。
 *
 * INP は「入力遅延 → イベント処理 → 次の描画までの遅延」の3区間に分かれる。
 * attribution 版の onINP はその内訳をそのまま返してくれるので、
 * 「遅いのは分かった。では3区間のどこが長いのか」まで画面で読める。
 *
 * 値は操作しないと出ない（INP は interaction が1つも無ければ報告されない）。
 */
import { useEffect, useState } from 'react'
import { onCLS, onINP, onLCP } from 'web-vitals/attribution'

export interface Vitals {
  inp: number | null
  inputDelay: number
  processingDuration: number
  presentationDelay: number
  interactionType: string
  lcp: number | null
  cls: number | null
}

const INITIAL: Vitals = {
  inp: null,
  inputDelay: 0,
  processingDuration: 0,
  presentationDelay: 0,
  interactionType: '',
  lcp: null,
  cls: null,
}

export function useVitals(): Vitals {
  const [vitals, setVitals] = useState<Vitals>(INITIAL)

  useEffect(() => {
    // reportAllChanges: 値が更新されるたびに受け取る（既定はページを離れるときだけ）
    onINP(
      (metric) =>
        setVitals((prev) => ({
          ...prev,
          inp: metric.value,
          inputDelay: metric.attribution.inputDelay,
          processingDuration: metric.attribution.processingDuration,
          presentationDelay: metric.attribution.presentationDelay,
          interactionType: metric.attribution.interactionType ?? '',
        })),
      { reportAllChanges: true },
    )
    onLCP((metric) => setVitals((prev) => ({ ...prev, lcp: metric.value })), {
      reportAllChanges: true,
    })
    onCLS((metric) => setVitals((prev) => ({ ...prev, cls: metric.value })), {
      reportAllChanges: true,
    })
  }, [])

  return vitals
}

function rating(inp: number | null): { text: string; color: string } {
  if (inp === null) return { text: '未計測', color: 'var(--muted)' }
  if (inp <= 200) return { text: 'Good', color: 'var(--ok)' }
  if (inp <= 500) return { text: '要改善', color: '#b06a00' }
  return { text: '不良', color: 'var(--danger)' }
}

/** INP の実測値と3区間の内訳を出すパネル */
export function VitalsPanel() {
  const vitals = useVitals()
  const inpRating = rating(vitals.inp)

  return (
    <div className="panel" style={{ marginBottom: 16 }}>
      <div className="metrics">
        <div>
          <div className="metrics__value" style={{ color: inpRating.color }}>
            {vitals.inp === null ? '—' : `${vitals.inp.toFixed(0)} ms`}
          </div>
          <div className="metrics__label">INP（{inpRating.text}／200ms以下がGood）</div>
        </div>
        <div>
          <div className="metrics__value">{vitals.inputDelay.toFixed(0)} ms</div>
          <div className="metrics__label">① 入力遅延</div>
        </div>
        <div>
          <div className="metrics__value">{vitals.processingDuration.toFixed(0)} ms</div>
          <div className="metrics__label">② イベント処理</div>
        </div>
        <div>
          <div className="metrics__value">{vitals.presentationDelay.toFixed(0)} ms</div>
          <div className="metrics__label">③ 次の描画まで</div>
        </div>
        <div>
          <div className="metrics__value">{vitals.lcp === null ? '—' : `${vitals.lcp.toFixed(0)} ms`}</div>
          <div className="metrics__label">LCP</div>
        </div>
        <div>
          <div className="metrics__value">{vitals.cls === null ? '—' : vitals.cls.toFixed(3)}</div>
          <div className="metrics__label">CLS</div>
        </div>
      </div>
      <p className="muted" style={{ margin: '8px 0 0' }}>
        INP は操作するまで出ない。検索欄に何文字か打ってから読む
        {vitals.interactionType ? `（直近の操作: ${vitals.interactionType}）` : ''}。
      </p>
    </div>
  )
}
