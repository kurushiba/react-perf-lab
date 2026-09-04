import { PHOTOS_720 } from '../data'
import ProductImage from './ProductImage'
import { UI_ICONS, icon } from './icons'

export default function AssetsPage() {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div className="panel">
        <h3>アイコン</h3>
        <div className="toolbar">
          {UI_ICONS.map((item) => (
            <span
              key={item}
              style={{ display: 'inline-flex', padding: 6 }}
              dangerouslySetInnerHTML={{ __html: icon(item, 22) }}
            />
          ))}
        </div>
      </div>

      <div className="panel">
        <h3>商品写真</h3>
        <div style={{ display: 'grid', gap: 12 }}>
          {PHOTOS_720.map((src, index) => (
            <ProductImage key={src} src={src} alt={`商品写真 ${index + 1}`} maxWidth={480} />
          ))}
        </div>
      </div>
    </div>
  )
}
