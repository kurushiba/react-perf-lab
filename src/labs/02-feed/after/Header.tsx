import type { FeedStats } from '../stats'

interface HeaderProps {
  stats: FeedStats
  visibleCount: number
}

export default function Header({ stats, visibleCount }: HeaderProps) {
  // before では割り算1つを useMemo で包んでいた（付けすぎ①）。
  // 返るのは数値1つで、比較コストの方が計算より高い。そのまま書く。
  const commentsPerPost = Math.round((stats.totalComments / 100) * 10) / 10

  return (
    <header className="panel" style={{ marginBottom: 16 }}>
      <div className="toolbar" style={{ justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>Shibagram</h1>
        <span className="muted">表示中 {visibleCount} 件 / 100 件</span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 12,
          marginTop: 12,
        }}
      >
        <Stat label="いいね合計" value={stats.totalLikes.toLocaleString()} />
        <Stat label="コメント合計" value={stats.totalComments.toLocaleString()} />
        <Stat label="1投稿あたり" value={`${commentsPerPost} 件`} />
        <Stat label="投稿している人" value={`${stats.activeAuthors} 人`} />
        <Stat label="集計にかかった時間" value={`${stats.elapsedMs.toFixed(1)} ms`} />
      </div>

      <div className="toolbar" style={{ marginTop: 12 }}>
        <span className="muted">トレンド</span>
        {stats.trendingTags.map((item) => (
          <span key={item.tag} className="badge">
            {item.tag} {item.count}
          </span>
        ))}
        <span className="muted" style={{ marginLeft: 12 }}>
          話題の投稿
        </span>
        {stats.hotPosts.map((item) => (
          <span key={item.id} className="chip" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
            {item.authorName}
          </span>
        ))}
      </div>
    </header>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="muted" style={{ fontSize: 12 }}>
        {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 600 }}>{value}</div>
    </div>
  )
}
