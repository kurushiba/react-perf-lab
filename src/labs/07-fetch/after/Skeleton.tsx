/**
 * ローディング表示。before のスピナーと違って、
 * 「あとから入る中身と同じ高さ」を先に確保しておく。
 *
 * 待ち時間は同じでも、届いた瞬間に下の要素が飛び跳ねなくなる。
 * ＝ 待たせ方の設計（8-6）。
 */

interface SkeletonProps {
  lines?: number
  height?: number
}

function Bar({ width, height = 12 }: { width: string; height?: number }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 4,
        background: 'var(--border)',
        opacity: 0.8,
      }}
    />
  )
}

export default function Skeleton({ lines = 3, height }: SkeletonProps) {
  return (
    <div aria-busy="true" aria-label="読み込み中" style={{ display: 'grid', gap: 10, minHeight: height }}>
      <Bar width="45%" height={20} />
      <Bar width="70%" />
      {Array.from({ length: lines }, (_, i) => (
        <Bar key={i} width={i % 2 === 0 ? '100%' : '85%'} />
      ))}
    </div>
  )
}

/** 詳細パネルぶんの高さを確保した版 */
export function DetailSkeleton() {
  return (
    <div style={{ minHeight: 260 }}>
      <Skeleton lines={4} />
      <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="panel" style={{ padding: 8, minHeight: 74 }} />
        ))}
      </div>
    </div>
  )
}
