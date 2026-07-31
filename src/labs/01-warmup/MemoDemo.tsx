'use no memo'

import { useState } from 'react'

/**
 * 1-6 memo：props が同じならコンポーネントの再描画をスキップする
 *
 * 初期状態はメモ化なし。親のカウンタを進めると、props が固定の子まで巻き込まれる。
 * ここに自分で memo を当てて、連鎖が止まることを確認する。
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

export default function MemoDemo() {
  const [count, setCount] = useState(0)

  return (
    <div className="page">
      <h1>1-6 memo</h1>
      <p className="muted">
        子に渡す props は固定なので、本来は再描画する必要がない。
        それでも親のカウンタを進めるたびに、Console に PriceTag の render ログが出る。
      </p>

      <div className="toolbar" style={{ marginBottom: 16 }}>
        <button className="button" onClick={() => setCount((c) => c + 1)}>
          親のカウンタ: {count}
        </button>
      </div>

      <PriceTag label="ステンレス保温マグ" price={2480} />
    </div>
  )
}
