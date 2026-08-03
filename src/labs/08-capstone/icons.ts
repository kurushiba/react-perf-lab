/**
 * シェルのナビゲーションで使う4つ＋ベル。
 * before / after のどちらでも同じものを同じ書き方で使う（Sec.9 で触る対象ではない）。
 *
 * 2,000個入りの `shiba-icons/paths` ではなく、UI用の12個だけが入った
 * `icons-ui` から名前で取っている。
 */
import {
  IconAssets,
  IconBell,
  IconReport,
  IconEditor,
  IconSettings,
} from '../../vendor/shiba-icons/icons-ui'
import { renderIcon } from '../../vendor/shiba-icons/render'

/** NAV と同じ並び（案件一覧 / レポート / 活動履歴 / 設定） */
export const NAV_ICONS = [IconAssets, IconReport, IconEditor, IconSettings]

export const BELL_ICON = IconBell

export function icon(path: string, size = 14): string {
  return renderIcon(path, { size })
}
