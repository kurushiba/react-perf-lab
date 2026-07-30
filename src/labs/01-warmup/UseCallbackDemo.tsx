'use no memo'

import { memo, useCallback, useState } from 'react'

/**
 * 1-6 useCallback：依存が同じなら関数の参照を保つ
 *
 * memo した子に関数を渡すとき、親が毎回新しい関数を作っていると memo は無意味になる。
 * これは 02-feed/before に仕込んである「書き忘れ」とまったく同じ形。
 */
interface LikeButtonProps {
  onLike: () => void
}

const LikeButton = memo(function LikeButton({ onLike }: LikeButtonProps) {
  console.log('[render] LikeButton（memo済み）')
  return (
    <button className="button" onClick={onLike}>
      いいね
    </button>
  )
})

export default function UseCallbackDemo() {
  const [count, setCount] = useState(0)
  const [likes, setLikes] = useState(0)
  const [stable, setStable] = useState(false)

  // 🖐 ハンズオン（1-6）
  //   下の handleLikeUnstable は、親が再描画されるたびに新しい関数になる。
  //   そのため memo した LikeButton の props が毎回変わり、memo が効かない。
  const handleLikeUnstable = () => setLikes((v) => v + 1)
  const handleLikeStable = useCallback(() => setLikes((v) => v + 1), [])

  return (
    <div className="page">
      <h1>1-6 useCallback</h1>
      <p className="muted">
        子は memo 済み。それでも useCallback を外すと、親のカウンタを進めるたびに
        LikeButton の render ログが出る。＝ memo が効いていない。
      </p>

      <div className="toolbar" style={{ marginBottom: 16 }}>
        <button className="button" onClick={() => setCount((c) => c + 1)}>
          親のカウンタ: {count}
        </button>
        <label>
          <input type="checkbox" checked={stable} onChange={(e) => setStable(e.target.checked)} />{' '}
          useCallback を使う
        </label>
      </div>

      <div className="panel">
        <p>いいね数: {likes}</p>
        <LikeButton onLike={stable ? handleLikeStable : handleLikeUnstable} />
      </div>
    </div>
  )
}
