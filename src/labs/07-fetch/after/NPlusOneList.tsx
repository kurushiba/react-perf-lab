import { useSuspenseQuery } from '@tanstack/react-query'
import { NPLUSONE_IDS, formatYen } from '../config'
import { productBatchQuery } from './queries'

/**
 * before は24行が24本のリクエストを投げていた。
 * 欲しいのは同じ24件なので、まとめて1本で取る（9-4）。
 *
 * キャッシュが効いていても、投げている本数が多ければ速くならない。
 * 「取り直しを減らす」（9-3）と「そもそもの本数を減らす」（9-4）は別の仕事。
 */
export default function NPlusOneList() {
  const { data } = useSuspenseQuery(productBatchQuery(NPLUSONE_IDS))

  return (
    <div>
      <h3>入荷予定（{NPLUSONE_IDS.length}件）</h3>
      <div className="list-scroll">
        {data.map((item) => (
          <div key={item.id} className="row">
            <span className="row__main">
              <span className="row__name">{item.name}</span>
              <span className="row__sub">{item.id}</span>
            </span>
            <span className="row__num">{formatYen(item.price)}</span>
            <span className="row__stock">在庫{item.stock}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
