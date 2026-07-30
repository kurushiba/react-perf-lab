interface ProductImageProps {
  src: string
  alt: string
  maxWidth?: number
}

export default function ProductImage({ src, alt, maxWidth = 720 }: ProductImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      style={{ width: '100%', maxWidth, display: 'block', borderRadius: 8 }}
    />
  )
}
