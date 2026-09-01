import { useOptimistic, useState, useTransition } from 'react'
import { toggleFavorite } from '../../../shared/mockApi'

interface FavoriteButtonProps {
  id: number
}

/**
 * before はサーバーの応答を待ってから表示を変えていた（200〜600ms 固まる）。
 *
 * ここでは押した瞬間に「そうなるはずの状態」を先に見せ、
 * 裏で通信する。実際の通信時間は1msも短くなっていないが、体感は別物になる（8-5）。
 * 失敗したら useOptimistic の値は自動で捨てられ、本当の状態に戻る。
 */
export default function FavoriteButton({ id }: FavoriteButtonProps) {
  const [favorite, setFavorite] = useState(false)
  const [optimisticFavorite, setOptimisticFavorite] = useOptimistic(favorite)
  const [, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(async () => {
      // 楽観的な更新はトランジションの中で行う
      setOptimisticFavorite(!favorite)
      await toggleFavorite(id)
      startTransition(() => setFavorite((prev) => !prev))
    })
  }

  return (
    <button className="button" onClick={handleClick}>
      {optimisticFavorite ? '★ お気に入り' : '☆ お気に入り'}
    </button>
  )
}
