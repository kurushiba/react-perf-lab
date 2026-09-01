import { useState } from 'react'
import { toggleFavorite } from '../../../shared/mockApi'

interface FavoriteButtonProps {
  id: number
}

export default function FavoriteButton({ id }: FavoriteButtonProps) {
  const [favorite, setFavorite] = useState(false)
  const [sending, setSending] = useState(false)

  const handleClick = async () => {
    setSending(true)
    await toggleFavorite(id)
    setFavorite((prev) => !prev)
    setSending(false)
  }

  return (
    <button className="button" onClick={handleClick} disabled={sending}>
      {sending ? '送信中…' : favorite ? '★ お気に入り' : '☆ お気に入り'}
    </button>
  )
}
