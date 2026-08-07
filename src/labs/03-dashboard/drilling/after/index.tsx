/**
 * 4-4 after — 同じツリーを Context で配ったもの。
 *
 * state の置き場所は before と変わらない（App のまま）。変えたのは配り方だけで、
 * 通り道のコンポーネントから props を全部落とした。その結果、
 *
 *   - theme を使う3つ（★）は Context の購読者なので、値が変われば再レンダリングされる
 *   - 通り道は props が1つも変わらなくなったので、React Compiler がまとめてスキップする
 *
 * 後半が重要で、Context にしただけでは中間は止まらない。App は再レンダリングされるので、
 * 「props が変わらない子はスキップしてよい」と判断できる仕組み（Compiler、または memo）が
 * あって初めて止まる。`2-6` や `4-3` では「値が実際に変わっている」ので Compiler に手が
 * 出せなかったが、ここは逆で、配り方を変えると Compiler が効くようになる。
 */
import { useState } from 'react'
import { RenderTallyPanel, useRenderTally } from '../RenderTally'
import { cardStyle, CONSUMERS, nextTheme, themeLabel, TREE, type Theme } from '../theme'
import { ThemeContext, useTheme } from './ThemeContext'

// ---------------------------------------------------------------- 左の枝

function ThemeSwitch() {
  console.log('[render] ThemeSwitch')
  useRenderTally('ThemeSwitch')

  const { theme, setTheme } = useTheme()

  return (
    <button className="button" onClick={() => setTheme(nextTheme(theme))}>
      テーマ切替（{themeLabel(theme)}）
    </button>
  )
}

function NavList() {
  console.log('[render] NavList')
  useRenderTally('NavList')

  return (
    <nav style={{ display: 'grid', gap: 6 }}>
      <span className="muted">概要</span>
      <span className="muted">売上</span>
      <span className="muted">設定</span>
      <ThemeSwitch />
    </nav>
  )
}

function Sidebar() {
  console.log('[render] Sidebar')
  useRenderTally('Sidebar')

  return (
    <aside className="panel" style={{ width: 200 }}>
      <h3 style={{ margin: '0 0 8px' }}>メニュー</h3>
      <NavList />
    </aside>
  )
}

// ---------------------------------------------------------------- 中央の枝

function SearchBox() {
  console.log('[render] SearchBox')
  useRenderTally('SearchBox')

  return <input type="search" placeholder="レポートを検索" />
}

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

function ReportCard() {
  console.log('[render] ReportCard')
  useRenderTally('ReportCard')

  const { theme } = useTheme()

  return (
    <div className="panel" style={cardStyle(theme)}>
      <h3 style={{ margin: '0 0 4px' }}>今月の売上</h3>
      <div style={{ fontSize: 28, fontWeight: 700 }}>¥ 12,480,000</div>
    </div>
  )
}

function Content() {
  console.log('[render] Content')
  useRenderTally('Content')

  return (
    <section style={{ flex: 1 }}>
      <Toolbar />
      <ReportCard />
    </section>
  )
}

// ---------------------------------------------------------------- 下の枝

function StatusBar() {
  console.log('[render] StatusBar')
  useRenderTally('StatusBar')

  const { theme } = useTheme()

  return <p className="muted" style={{ margin: 0 }}>表示モード：{themeLabel(theme)}</p>
}

function Footer() {
  console.log('[render] Footer')
  useRenderTally('Footer')

  return (
    <div className="panel" style={{ marginTop: 16 }}>
      <StatusBar />
    </div>
  )
}

// ---------------------------------------------------------------- 骨格

// props が1つも無くなった。theme が変わっても、このコンポーネントは動かない
function Layout() {
  console.log('[render] Layout')
  useRenderTally('Layout')

  return (
    <>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <Sidebar />
        <Content />
      </div>
      <Footer />
    </>
  )
}

export default function DrillingAfter() {
  console.log('[render] App')
  useRenderTally('App')

  // state の置き場所は before と同じ。変えたのは「どう配るか」だけ
  const [theme, setTheme] = useState<Theme>('light')

  return (
    <div className="page" style={{ maxWidth: 900 }}>
      <h1>Context で配る（after）</h1>
      <p className="lead">
        state は App に置いたまま。通り道から props を落として Context に付け替えると、
        再レンダリングされるのは theme を実際に読んでいる ★ の3つと、state を持つ App だけになる。
      </p>

      <RenderTallyPanel names={TREE} consumers={CONSUMERS} />

      <ThemeContext.Provider value={{ theme, setTheme }}>
        <Layout />
      </ThemeContext.Provider>
    </div>
  )
}
