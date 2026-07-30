import { useEffect, useState } from 'react'

export interface FetchState<T> {
  data: T | null
  loading: boolean
}

/**
 * URL を渡すと中身を取ってくるフック。
 * 一覧・詳細・関連のどこからでも使えるように汎用にしてある。
 */
export function useFetch<T>(url: string | null): FetchState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!url) {
      setData(null)
      return
    }

    setLoading(true)
    fetch(url)
      .then((res) => res.json())
      .then((json: T) => {
        setData(json)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [url])

  return { data, loading }
}
