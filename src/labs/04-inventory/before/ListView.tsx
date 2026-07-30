import { CATEGORY_LABELS, products, type Product } from '../../../data/products'

/** 1行あたり10要素ノード。10,000行で約10万ノードになる */
function ProductRow({ product }: { product: Product }) {
  return (
    <div className="row">
      <img src={product.thumbnailUrl} alt="" width={32} height={32} />
      <span className="row__main">
        <span className="row__name">{product.name}</span>
        <span className="row__sub">{product.sku}</span>
      </span>
      <span className="badge">{CATEGORY_LABELS[product.category]}</span>
      <span className="row__num">{product.price.toLocaleString()} 円</span>
      <span className={product.stock === 0 ? 'row__stock row__stock--out' : 'row__stock'}>
        在庫 {product.stock}
      </span>
      <button className="button">編集</button>
    </div>
  )
}

export default function ListView() {
  return (
    <div className="panel">
      <h3>在庫一覧（{products.length.toLocaleString()} 件）</h3>
      <div className="list-scroll">
        {products.map((product) => (
          <ProductRow key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
