import { Suspense } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { formatYen } from '../config'
import FavoriteButton from './FavoriteButton'
import RelatedList from './RelatedList'
import { DetailSkeleton } from './Skeleton'
import { productDetailQuery } from './queries'

function DetailBody({ id }: { id: string }) {
  // 一覧の hover で先読み済みなら、ここは待たずに返る
  const { data } = useSuspenseQuery(productDetailQuery(id))

  return (
    <div>
      <div className="toolbar" style={{ justifyContent: 'space-between' }}>
        <h2>{data.name}</h2>
        <FavoriteButton id={data.id} />
      </div>
      <p className="muted" style={{ margin: '4px 0 12px' }}>
        {data.sku} / {data.category} / {formatYen(data.price)} / 在庫 {data.stock}
      </p>
      <p>{data.description}</p>

      {/*
        関連商品は詳細より一段深い。ここに境界をもう1つ置くと、
        詳細が届いた時点で本文だけ先に出せる（境界の粒度＝8-6）
      */}
      <Suspense fallback={<div style={{ minHeight: 110 }} />}>
        <RelatedList ids={data.relatedIds} />
      </Suspense>
    </div>
  )
}

interface DetailPanelProps {
  id: string | null
}

export default function DetailPanel({ id }: DetailPanelProps) {
  if (!id) return <p className="muted">左の一覧から商品を選ぶ</p>

  // key を id にしておくと、別の商品を選んだときに
  // 「前の商品の内容を出したまま固まる」のではなく、その商品のスケルトンに戻る
  return (
    <Suspense key={id} fallback={<DetailSkeleton />}>
      <DetailBody id={id} />
    </Suspense>
  )
}
