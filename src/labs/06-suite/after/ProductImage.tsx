interface ProductImageProps {
  src: string
  alt: string
  maxWidth?: number
  /** 最初の1枚（LCP候補）だけ true。残りは遅延読み込みにする */
  priority?: boolean
}

/** 配っている画像の実寸（scripts/gen-images.mjs の photo-N-720.png） */
const NATURAL_WIDTH = 720
const NATURAL_HEIGHT = 540

export default function ProductImage({
  src,
  alt,
  maxWidth = 720,
  priority = false,
}: ProductImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      // width / height を渡すと、ブラウザは画像が届く前に縦幅を計算できる。
      // aspect-ratio と height:auto を添えるのは、CSS 側で幅を伸縮させても
      // 確保した比率が崩れないようにするため（これが無いとCLSが戻ってくる）
      width={NATURAL_WIDTH}
      height={NATURAL_HEIGHT}
      // LCP候補を lazy にすると発見が遅れて逆効果になる。優先度で振り分ける
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      style={{
        width: '100%',
        maxWidth,
        height: 'auto',
        aspectRatio: `${NATURAL_WIDTH} / ${NATURAL_HEIGHT}`,
        display: 'block',
        borderRadius: 8,
        background: 'var(--border)',
      }}
    />
  )
}
