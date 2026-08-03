import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

export interface LabVariant {
  id: string
  label: string
  /** 未実装のバリアントは load を持たない */
  load?: LazyExoticComponent<ComponentType>
}

export interface LabDef {
  id: string
  title: string
  section: string
  summary: string
  variants: LabVariant[]
}

/**
 * 各ラボはルート単位で遅延読み込みする。
 * こうしておくと、ビルド出力のチャンクサイズがそのまま「そのラボの重さ」になり、
 * Sec.6 のバンドル計測が他のラボに汚染されない。
 */
export const labs: LabDef[] = [
  {
    id: '01-warmup',
    title: 'ウォームアップ：レンダリングとメモ化',
    section: 'Sec.1',
    summary: '3フェーズ・再描画の連鎖・memo / useMemo / useCallback を最小構成で観察する',
    variants: [{ id: 'demos', label: 'デモ', load: lazy(() => import('./01-warmup/index')) }],
  },
  {
    id: '02-feed',
    title: 'Shibagram：SNSフィード',
    section: 'Sec.2〜4',
    summary: '散らばった手動メモ化を React Compiler に置き換える',
    variants: [
      { id: 'before', label: 'before', load: lazy(() => import('./02-feed/before/index')) },
      { id: 'after', label: 'after', load: lazy(() => import('./02-feed/after/index')) },
      {
        id: 'violations',
        label: 'violations（Sec.3）',
        load: lazy(() => import('./02-feed/violations/index')),
      },
      { id: 'edge', label: 'edge（Sec.4）', load: lazy(() => import('./02-feed/edge/index')) },
    ],
  },
  {
    id: '03-dashboard',
    title: 'Shiba Analytics：分析ダッシュボード',
    section: 'Sec.4',
    summary: 'Context地獄と state の置き場所を、設計で解体する',
    variants: [
      { id: 'before', label: 'before', load: lazy(() => import('./03-dashboard/before/index')) },
      { id: 'after', label: 'after', load: lazy(() => import('./03-dashboard/after/index')) },
      {
        id: 'store',
        label: 'Zustand版（4-6）',
        load: lazy(() => import('./03-dashboard/store/index')),
      },
      { id: 'demos', label: 'key デモ（4-10）', load: lazy(() => import('./03-dashboard/demos/index')) },
    ],
  },
  {
    id: '04-inventory',
    title: '在庫管理テーブル',
    section: 'Sec.4',
    summary: '10,000行の一覧を仮想化する',
    variants: [
      { id: 'before', label: 'before', load: lazy(() => import('./04-inventory/before/index')) },
      { id: 'after', label: 'after', load: lazy(() => import('./04-inventory/after/index')) },
    ],
  },
  {
    id: '05-search',
    title: '商品検索・フィルタ・集計',
    section: 'Sec.5',
    summary: '入力の引っかかりを、回数・優先度・別スレッドの3方向で解消する',
    variants: [
      { id: 'before', label: 'before', load: lazy(() => import('./05-search/before/index')) },
      { id: 'after', label: 'after', load: lazy(() => import('./05-search/after/index')) },
    ],
  },
  {
    id: '06-suite',
    title: 'Shiba Suite：多機能アプリ',
    section: 'Sec.6',
    summary: '重い依存を積んだ初期バンドルを削る',
    variants: [
      { id: 'before', label: 'before', load: lazy(() => import('./06-suite/before/index')) },
      { id: 'after', label: 'after', load: lazy(() => import('./06-suite/after/index')) },
    ],
  },
  {
    id: '07-fetch',
    title: '一覧＋詳細のデータ取得',
    section: 'Sec.7',
    summary: 'ウォーターフォールとキャッシュなし取得を直す',
    variants: [
      { id: 'before', label: 'before', load: lazy(() => import('./07-fetch/before/index')) },
      { id: 'after', label: 'after', load: lazy(() => import('./07-fetch/after/index')) },
    ],
  },
  {
    id: '08-capstone',
    title: 'Shiba CRM：総仕上げ',
    section: 'Sec.0・Sec.8',
    summary: '5種のボトルネックが同居したアプリを、自力で診断して直す',
    variants: [
      { id: 'before', label: 'before', load: lazy(() => import('./08-capstone/before/index')) },
      { id: 'after', label: 'after', load: lazy(() => import('./08-capstone/after/index')) },
    ],
  },
]

export function findLab(labId: string | undefined): LabDef | undefined {
  return labs.find((lab) => lab.id === labId)
}
