// 使うアイコンだけを named import する。
// バレル（shiba-icons/index.ts）を経由していても、名前で取り出している限り
// バンドラは残り 2,000 個を切り落とせる。
//
// before のように `import * as` して `Table[name]` で引くと、
// どの名前が使われるかを静的に判定できないので全部残すしかなくなる。
import {
  IconEditor,
  IconReport,
  IconAssets,
  IconSettings,
  IconShare,
  IconSearch,
  IconBell,
  IconUser,
  IconPlus,
  IconTrash,
  IconCheck,
  IconClose,
  renderIcon,
} from '../../../vendor/shiba-icons'

/** 画面で実際に使うアイコン。before と同じ12個 */
export const UI_ICONS = [
  IconEditor,
  IconReport,
  IconAssets,
  IconSettings,
  IconShare,
  IconSearch,
  IconBell,
  IconUser,
  IconPlus,
  IconTrash,
  IconCheck,
  IconClose,
]

export function icon(path: string, size = 18): string {
  return renderIcon(path, { size })
}
