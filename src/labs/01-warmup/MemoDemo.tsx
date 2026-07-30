'use no memo'

import { memo, useState } from 'react'

/**
 * 1-6 memo：props が同じならコンポーネントの再描画をスキップする
 *
 * トグルで memo あり／なしを切り替えて、親のカウンタ更新が子に波及するかを見比べる。
 */
interface PriceTagProps {
  label: string
  price: number
}

function PriceTag({ label, price }: PriceTagProps) {
  console.log('[render] PriceTag')
  return (
    <div className="panel">
      {label}：{price.toLocaleString()} 円
    </div>
  )
}

// 🖐 ハンズオン（1-6）
//   memo でラップした版。まずはこの行をコメントアウトして、
//   自分で `memo(PriceTag)` を書いてから動かしてみる。
const MemoizedPriceTag = memo(PriceTag)

export default function MemoDemo() {
  const [count, setCount] = useState(0)
  const [useMemoized, setUseMemoized] = useState(false)

  // 子に渡す props は固定。親のカウンタとは無関係
  const Child = useMemoized ? MemoizedPriceTag : PriceTag

  return (
    <div className="page">
      <h1>1-6 memo</h1>
      <p className="muted">
        子に渡す props は固定なので、本来は再描画する必要がない。
        memo を有効にすると、親のカウンタを進めても Console に PriceTag の render ログが出なくなる。
      </p>

      <div className="toolbar" style={{ marginBottom: 16 }}>
        <button className="button" onClick={() => setCount((c) => c + 1)}>
          親のカウンタ: {count}
        </button>
        <label>
          <input
            type="checkbox"
            checked={useMemoized}
            onChange={(e) => setUseMemoized(e.target.checked)}
          />{' '}
          memo を使う
        </label>
      </div>

      <Child label="ステンレス保温マグ" price={2480} />
    </div>
  )
}
