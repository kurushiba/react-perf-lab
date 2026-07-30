import { useState } from 'react'
import { LOCALE_TAGS, formatIn, relativeIn } from './formatDate'

const UPDATED_AT = new Date('2026-03-14T09:24:00')
const NOW = new Date('2026-03-17T09:24:00')

export default function SettingsPage() {
  const [threshold, setThreshold] = useState(25)
  const [notify, setNotify] = useState(true)

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div className="panel">
        <h3>在庫アラート</h3>
        <div className="toolbar">
          <label>
            しきい値{' '}
            <input
              type="number"
              value={threshold}
              onChange={(event) => setThreshold(Number(event.target.value))}
              style={{ width: 80 }}
            />
          </label>
          <label>
            <input
              type="checkbox"
              checked={notify}
              onChange={(event) => setNotify(event.target.checked)}
            />{' '}
            メールで通知する
          </label>
        </div>
      </div>

      <div className="panel">
        <h3>表示形式</h3>
        <table>
          <thead>
            <tr>
              <th>ロケール</th>
              <th>最終更新</th>
              <th>相対表示</th>
            </tr>
          </thead>
          <tbody>
            {LOCALE_TAGS.map((tag) => (
              <tr key={tag}>
                <td>
                  <code>{tag}</code>
                </td>
                <td>{formatIn(UPDATED_AT, tag, 'yyyy/MM/dd HH:mm')}</td>
                <td>{relativeIn(UPDATED_AT, NOW, tag)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
