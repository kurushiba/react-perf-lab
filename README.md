# react-perf-lab

Udemy講座「Reactパフォーマンスチューニング」の教材リポジトリです。
**わざと遅く作られたアプリ**が入っています。各セクションで学んだ手法を自分の手で当てて、速くしていきます。

- React 19.2 / TypeScript / Vite
- Next.js は使いません（CSRに絞ってReact本体の話に集中するため）

---

## セットアップ

```bash
npm install
npm run dev
```

ブラウザで http://localhost:5173 を開くと、ラボの一覧が表示されます。

その他のコマンド：

```bash
npm run build       # 型チェック＋本番ビルド（初期JSサイズの確認に使う）
npm run preview     # 本番ビルドをローカルで配信（Lighthouse計測はこちらで行う）
npm run lint        # ESLint（Sec.3-5 でルールを追加する）
npm run typecheck   # 型チェックのみ
npm run gen:images  # 教材用の画像を再生成（通常は不要）
npm run gen:vendor  # 重量ライブラリのモックを再生成（通常は不要）
```

---

## ⚠️ 計測は CPU 4x スロットリング下で行う

改善の幅は開発機のスペックに大きく左右されます。**このリポジトリの目標値はすべて CPU 4x スロットリング下の値**です。

設定方法：

1. Chrome DevTools を開く
2. **Performance** パネル → 歯車アイコン（Capture settings）
3. **CPU** を `4x slowdown` にする

LCP / CLS を Lighthouse で測るときは、Lighthouse 側が独自にスロットリングをかけるので、上の設定は不要です。

---

## ⚠️ Sec.7（バンドルサイズ）での「初期JSサイズ」の定義

このリポジトリは**ラボごとにルート単位で遅延読み込み**しています（`src/labs/registry.ts`）。
そのため `06-suite` は厳密には「アプリの初期バンドル」ではありません。Sec.7 の数値は次の定義で測ります。

> **初期JSサイズ ＝ そのラボの画面を表示するのに実際に転送されたJSの合計（gzip後）**
> ＝ entry チャンク ＋ そのラボのチャンク ＋ 共有チャンク

`06-suite` の画面上部にある `BundlePanel` が、この値を `PerformanceResourceTiming.encodedBodySize`
（＝圧縮された状態での転送量）から実測して表示します。

**必ず本番ビルドで測ってください。** dev サーバは各モジュールを未圧縮・未minifyのまま配るため、数倍に出ます。

```bash
npm run build && npm run preview
```

| 指標 | `06-suite/before` | `06-suite/after` |
|---|---|---|
| 初期JS（転送・gzip後） | 883KB | 176KB |
| LCP | 11,732ms | 2,448ms |
| CLS | 0.422 | 0.000 |

（Slow 4G ＋ CPU 4x ＝ Lighthouse 既定相当のスロットリング下での実測値）

### `08-capstone`（Sec.8）の5指標

Sec.8 で受講者が到達する数値です。`before` は Sec.0-1 のデモ素材も兼ねています。

| 指標 | `08-capstone/before` | `08-capstone/after` | 計測条件 |
|---|---|---|---|
| 初期JS（転送・gzip後） | 805KB（13ファイル） | 103KB（10ファイル） | preview |
| LCP | 5,904ms | 1,308ms | preview ＋ Slow 4G ＋ CPU 4x |
| INP | 1,080ms | 32ms | preview ＋ CPU 4x |
| DOMノード数 | 50,166 | 386 | — |
| 主要操作の commit（チェック1回） | 211ms | 19ms | **dev**（本番ビルドは `<Profiler>` の値が 0 になります） |

`after` の INP 32ms は **React Compiler を有効にした状態**の値です（`8-3` で有効化するので、
Sec.8 を通した最終状態と一致します）。無効のままでも 248ms まで下がります。

---

## ⚠️ Sec.4 以降のラボから始める場合

**このリポジトリは初期状態では React Compiler が無効になっています。**
Sec.2-4 で受講者自身が有効化する流れになっているためです。

ただし Sec.4 以降のラボは「**Compiler が有効なのに遅い**」ことが前提の教材です。
途中のセクションから始める場合は、先に `vite.config.ts` の以下のコメントを外してください。

```ts
// 冒頭
import { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// plugins 配列の中
babel({ presets: [reactCompilerPreset()] }),
```

コメントを外したら dev サーバを再起動します。
React DevTools の Components タブでコンポーネント名の横に **Memo ✨** が出れば有効になっています。

なお `src/labs/01-warmup/` と `src/labs/02-feed/before/` の各ファイルには `'use no memo'`
が付けてあり、Compiler を有効にしても**これらのラボだけは最適化されません**。
手動メモ化の効果を観察する教材なので、Compiler に先回りされると成立しないためです。

---

## ラボ一覧

| ラボ | 対応セクション | テーマ |
|---|---|---|
| `src/labs/01-warmup/` | Sec.1 | レンダリングの3フェーズ、再描画の連鎖、memo / useMemo / useCallback |
| `src/labs/02-feed/` | Sec.2〜3 | 散らばった手動メモ化を React Compiler に置き換える |
| `src/labs/03-dashboard/` | Sec.4 | コンポーネント設計と状態配置（state を下げる・バケツリレー→Context・Context分割） |
| `src/labs/04-inventory/` | Sec.5 | 10,000行の一覧を仮想化する |
| `src/labs/05-search/` | Sec.6 | 重い計算とメインスレッド、並行機能 |
| `src/labs/06-suite/` | Sec.7 | バンドルサイズと読み込み最適化 |
| `src/labs/08-capstone/` | Sec.0・Sec.8 | 5種のボトルネックが同居した総仕上げアプリ |

ラボ番号とセクション番号は一致しません（ラボは01からの通し番号です）。

### before / after の切り替え

各ラボは `before/` と `after/` を持っています。
ラボ一覧のカードにあるボタン、またはラボ画面上部のタブで切り替えられます。

- `before/` … これから直す対象。「ここが問題です」というコメントは**書いてありません**。自分で見つけるところまでが演習です
- `after/` … 到達地点。なぜそう直したかの解説コメントが入っています

URL で直接開くこともできます：`/labs/04-inventory/before`

`06-suite` と `08-capstone` はラボの中でさらに4画面に分かれていて、URL は
`/labs/08-capstone/before/report` のようになります。

---

## 構成メモ

- `src/data/products.ts` … 10,000件の商品データ。シード付きの決定的な擬似乱数で生成しているので、実行のたびに同じデータになります（計測値の再現性のため）
- `src/data/deals.ts` … `08-capstone`（Shiba CRM）用の 5,000 案件と、そこにぶら下がる活動メモ約 55,000 件（合計およそ1,500万文字）。同じく決定的生成です。検索がこのメモを全件走査するので、この文字数がそのまま Sec.8 の「重い検索」の実体になります
- `plugins/mock-api.ts` … Vite サーバ内のモックAPI。`/api/*` を**実HTTP**で返すので、Network パネルにリクエストがそのまま並びます。教材内で唯一 `setTimeout` による遅延偽装を許可している場所です
- `src/vendor/` … Sec.7 用の「意図的に重い依存」。実在ライブラリのバージョン変動で教材が壊れないよう、自作のモックライブラリを生成して使っています（`shiba-icons` / `shiba-markdown` / `shiba-charts` / `shiba-qr` / `shiba-date` の5つ、合計 raw 約2.2MB）。中身は実際に動く実装＋高エントロピーなデータで、`npm run gen:vendor` で決定的に再生成できます
- `public/images/` … 教材用に生成した画像。`photos/photo-N.png` は非最適な大きいPNG（1280×960 / 約1.33MB）で、LCP / CLS の題材に使います。`photos/photo-N-720.png` は同じ絵柄を実際の表示サイズ（720×540 / 約169KB）で書き出したもので、Sec.7-7 の `after` が使います
