import { CATEGORY_LABELS, products, type Product } from '../../../data/products'

/**
 * 説明文が折り返すので、行の高さが 40〜120px の範囲でばらつく。
 * 仮想化するときに「推定高さ」が使えない典型（5-4）。
 */
export function DescriptionRow({ product }: { product: Product }) {
  return (
    <div className="row row--auto">
      <img src={product.thumbnailUrl} alt="" width={32} height={32} />
      <span className="row__main">
        <span className="row__name">{product.name}</span>
        <span className="row__sub">
          {product.sku} ・ {CATEGORY_LABELS[product.category]}
        </span>
        <span className="row__sub">{product.description}</span>
      </span>
      <span className="row__num">{product.price.toLocaleString()} 円</span>
      <button className="button">編集</button>
    </div>
  )
}

export default function DescriptionListView() {
  return (
    <div className="panel">
      <h3>在庫一覧・説明つき（{products.length.toLocaleString()} 件）</h3>
      <p className="muted" style={{ marginTop: 0 }}>
        説明文の長さが商品ごとに違うため、行の高さが揃っていない。
      </p>
      <div className="list-scroll">
        {products.map((product) => (
          <DescriptionRow key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
