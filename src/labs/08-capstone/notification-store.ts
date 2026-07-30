/**
 * Shiba CRM の通知（Reactの外にある小さなストア）。
 * 購読API（subscribe / getSnapshot）はちゃんと生えている。
 *
 * 02-feed/violations/notification-store.ts と同じ形。
 * 案件が動いたときに通知が積まれる、という想定で before / after 共通で使う。
 */

const MESSAGES = [
  'Northwind Logistics の案件が交渉中に進みました',
  'Summit Works の見積が承認待ちです',
  'Ironwood Systems から資料請求が届いています',
  'Meridian Group の商談が今週で期限を迎えます',
  'Cascade Partners の稟議が差し戻されました',
]

let items: string[] = ['3件の案件が今週クローズ予定です']
const listeners = new Set<() => void>()

function emit(): void {
  for (const listener of listeners) listener()
}

export const notificationStore = {
  /** レンダー中にこれを直接呼ぶと、値は読めても更新に気付けない */
  getSnapshot(): number {
    return items.length
  },

  getItems(): readonly string[] {
    return items
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },

  add(): void {
    items = [...items, MESSAGES[items.length % MESSAGES.length]]
    emit()
  },

  markAllRead(): void {
    items = []
    emit()
  },
}
