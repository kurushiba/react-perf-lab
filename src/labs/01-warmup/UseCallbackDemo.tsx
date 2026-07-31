'use no memo'

import { memo, useState } from 'react'

/**
 * 1-6 useCallback：依存が同じなら関数の参照を保つ
 *
 * 子は memo 済み。それでも親が毎回新しい関数を作っているので memo が効かない。
 * ここに自分で useCallback を当てて、参照を安定させる。
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

  const handleLike = () => setLikes((v) => v + 1)

  return (
    <div className="page">
      <h1>1-6 useCallback</h1>
      <p className="muted">
        子は memo 済み。それでも親のカウンタを進めるたびに LikeButton の render
        ログが出る。＝ memo が効いていない。
      </p>

      <div className="toolbar" style={{ marginBottom: 16 }}>
        <button className="button" onClick={() => setCount((c) => c + 1)}>
          親のカウンタ: {count}
        </button>
      </div>

      <div className="panel">
        <p>いいね数: {likes}</p>
        <LikeButton onLike={handleLike} />
      </div>
    </div>
  )
}
