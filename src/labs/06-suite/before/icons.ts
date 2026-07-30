import * as IconPaths from '../../../vendor/shiba-icons/paths'
import { renderIcon } from '../../../vendor/shiba-icons'

const TABLE = IconPaths as Record<string, string>

/** 画面で実際に使うアイコン。ライブラリには2,000個入っている */
export const UI_ICONS = [
  'IconEditor',
  'IconReport',
  'IconAssets',
  'IconSettings',
  'IconShare',
  'IconSearch',
  'IconBell',
  'IconUser',
  'IconPlus',
  'IconTrash',
  'IconCheck',
  'IconClose',
] as const

export function icon(name: string, size = 18): string {
  return renderIcon(TABLE[name] ?? '', { size })
}
