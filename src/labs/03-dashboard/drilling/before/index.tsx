/**
 * 4-4 before — 下げられない state を props で配る（バケツリレー）。
 *
 * `theme` を実際に読んでいるのは ThemeSwitch / ReportCard / StatusBar の3つだけ。
 * ところがこの3つはツリーの別々の枝の先にいるので、共通の親（App）から届けるには
 * 通り道のコンポーネントを全部経由するしかない。経由するということは props を持つ
 * ということで、theme が変わるたびに通り道も props が変わり、再レンダリングされる。
 *
 * Toolbar / SearchBox だけは theme を使う子を持たないので props を受け取っていない。
 * この2つが 0回のままであること＝React Compiler が効いていることの目印になる。
 */
import { useState } from 'react'
import { RenderTallyPanel, useRenderTally } from '../RenderTally'
import { cardStyle, CONSUMERS, nextTheme, themeLabel, TREE, type Theme } from '../theme'

type SetTheme = (theme: Theme) => void

interface ThemeProps {
  theme: Theme
  setTheme: SetTheme
}

// ---------------------------------------------------------------- 左の枝

function ThemeSwitch({ theme, setTheme }: ThemeProps) {
  console.log('[render] ThemeSwitch')
  useRenderTally('ThemeSwitch')

  return (
    <button className="button" onClick={() => setTheme(nextTheme(theme))}>
      テーマ切替（{themeLabel(theme)}）
    </button>
  )
}

// theme は使わない。ThemeSwitch に渡すためだけに受け取っている
function NavList({ theme, setTheme }: ThemeProps) {
  console.log('[render] NavList')
  useRenderTally('NavList')

  return (
    <nav style={{ display: 'grid', gap: 6 }}>
      <span className="muted">概要</span>
      <span className="muted">売上</span>
      <span className="muted">設定</span>
      <ThemeSwitch theme={theme} setTheme={setTheme} />
    </nav>
  )
}

// theme は使わない。NavList に渡すためだけに受け取っている
function Sidebar({ theme, setTheme }: ThemeProps) {
  console.log('[render] Sidebar')
  useRenderTally('Sidebar')

  return (
    <aside className="panel" style={{ width: 200 }}>
      <h3 style={{ margin: '0 0 8px' }}>メニュー</h3>
      <NavList theme={theme} setTheme={setTheme} />
    </aside>
  )
}

// ---------------------------------------------------------------- 中央の枝

// theme を使う子がいないので props を受け取っていない ＝ 再レンダリングされない
function SearchBox() {
  console.log('[render] SearchBox')
  useRenderTally('SearchBox')

  return <input type="search" placeholder="レポートを検索" />
}

// 同上。この枝はバケツリレーの経路から外れている
function Toolbar() {
  console.log('[render] Toolbar')
  useRenderTally('Toolbar')

  return (
    <div className="toolbar" style={{ marginBottom: 12 }}>
      <SearchBox />
      <span className="badge">今月</span>
    </div>
  )
}

function ReportCard({ theme }: { theme: Theme }) {
  console.log('[render] ReportCard')
  useRenderTally('ReportCard')

  return (
    <div className="panel" style={cardStyle(theme)}>
      <h3 style={{ margin: '0 0 4px' }}>今月の売上</h3>
      <div style={{ fontSize: 28, fontWeight: 700 }}>¥ 12,480,000</div>
    </div>
  )
}

// theme は ReportCard に渡すためだけに受け取っている
function Content({ theme }: { theme: Theme }) {
  console.log('[render] Content')
  useRenderTally('Content')

  return (
    <section style={{ flex: 1 }}>
      <Toolbar />
      <ReportCard theme={theme} />
    </section>
  )
}

// ---------------------------------------------------------------- 下の枝

function StatusBar({ theme }: { theme: Theme }) {
  console.log('[render] StatusBar')
  useRenderTally('StatusBar')

  return <p className="muted" style={{ margin: 0 }}>表示モード：{themeLabel(theme)}</p>
}

// theme は StatusBar に渡すためだけに受け取っている
function Footer({ theme }: { theme: Theme }) {
  console.log('[render] Footer')
  useRenderTally('Footer')

  return (
    <div className="panel" style={{ marginTop: 16 }}>
      <StatusBar theme={theme} />
    </div>
  )
}

// ---------------------------------------------------------------- 骨格

// theme はどの子にも自分では使わない。3つの枝に配るためだけに受け取っている
function Layout({ theme, setTheme }: ThemeProps) {
  console.log('[render] Layout')
  useRenderTally('Layout')

  return (
    <>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <Sidebar theme={theme} setTheme={setTheme} />
        <Content theme={theme} />
      </div>
      <Footer theme={theme} />
    </>
  )
}

export default function DrillingBefore() {
  console.log('[render] App')
  useRenderTally('App')

  // ThemeSwitch / ReportCard / StatusBar の共通の親はここしかない。
  // 使う場所が複数ある state は、これ以上は下げられない
  const [theme, setTheme] = useState<Theme>('light')

  return (
    <div className="page" style={{ maxWidth: 900 }}>
      <h1>props で配る（before）</h1>
      <p className="lead">
        theme を読んでいるのは ★ の3つだけ。それでもテーマを切り替えると、値を使わない通り道の
        コンポーネントまで再レンダリングされる。props が変わってしまうからで、メモ化では消せない。
      </p>

      <RenderTallyPanel names={TREE} consumers={CONSUMERS} />

      <Layout theme={theme} setTheme={setTheme} />
    </div>
  )
}
