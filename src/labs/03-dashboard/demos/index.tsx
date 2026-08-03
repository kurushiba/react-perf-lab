'use no memo'

import KeyPlayground from './KeyPlayground'

/**
 * 4-10 用のデモ。ダッシュボード本体とは独立している。
 *
 * 手動メモ化のデモ（01-warmup）と同じ理由で 'use no memo' を付けてある。
 * key による再マウントは Compiler と無関係な reconciliation の話なので、
 * ここだけは Compiler の有無で挙動が変わらないことを保証しておく。
 */
export default function DashboardDemos() {
  return <KeyPlayground />
}
