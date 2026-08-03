import { useState } from 'react'
import ImpureRender from './before/01-ImpureRender'
import MutateProps from './before/02-MutateProps'
import GlobalVariable from './before/04-GlobalVariable'
import RefInRender from './before/05-RefInRender'

/**
 * Sec.3 の違反例4種。Compiler を有効にすると、各タブのコンポーネントには
 * Memo ✨ が付かない。受講者が `before/` の各ファイルを直すと ✨ が付くようになる。
 *
 * 修正後のコードは `after/` にある（答え合わせ用。アプリからは読み込んでいない）。
 * 04 だけは事情が違い、モジュール変数の書き換えがレンダーの外（イベントハンドラー）
 * で起きるため、修正前も修正後も Compiler・ESLint のどちらからも検出されない。
 * ✨ の有無ではなく、実際の挙動で直せたかどうかを確認する必要がある（3-6で扱う）。
 */
const CASES = [
  { id: '01', label: '01 純粋性', Component: ImpureRender },
  { id: '02', label: '02 props の書き換え', Component: MutateProps },
  { id: '04', label: '04 グローバル変数', Component: GlobalVariable },
  { id: '05', label: '05 ref', Component: RefInRender },
] as const

export default function ViolationsLab() {
  const [current, setCurrent] = useState<string>(CASES[0].id)

  const active = CASES.find((item) => item.id === current) ?? CASES[0]
  const Active = active.Component

  return (
    <div>
      <div
        className="toolbar"
        style={{ padding: '12px 20px', background: '#fff', borderBottom: '1px solid var(--border)' }}
      >
        {CASES.map((item) => (
          <button
            key={item.id}
            className="button"
            style={
              item.id === active.id ? { borderColor: 'var(--accent)', color: 'var(--accent)' } : undefined
            }
            onClick={() => setCurrent(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* key を変えて、タブ切り替え時に前のタブの state を持ち越さないようにする */}
      <Active key={active.id} />
    </div>
  )
}
