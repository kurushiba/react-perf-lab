import { useState } from 'react'
import { STAGES, STAGE_LABELS, type Stage } from '../../../data/deals'
import * as ShibaDate from '../../../vendor/shiba-date'
import * as IconPaths from '../../../vendor/shiba-icons/paths'
import { renderIcon } from '../../../vendor/shiba-icons/render'

const ICON_TABLE = IconPaths as unknown as Record<string, string>
const ICON_NAMES = Object.keys(ICON_TABLE)
const PAGE_SIZE = 60

const LOCALE_TABLE = ShibaDate as unknown as Record<string, ShibaDate.DateLocale>
/** 設定に並べるロケール。ライブラリには60ロケール入っている */
const LOCALE_TAGS = ['vasjunEivi0', 'kolynQodtun1', 'uromIbzeb2', 'silstyStyon3'] as const

const UPDATED_AT = new Date('2026-07-27T09:24:00')
const NOW = new Date('2026-07-30T09:24:00')

const DEFAULT_STAGE_ICONS: Record<Stage, string> = {
  lead: ICON_NAMES[12],
  qualified: ICON_NAMES[113],
  proposal: ICON_NAMES[404],
  negotiation: ICON_NAMES[777],
  won: ICON_NAMES[1208],
  lost: ICON_NAMES[1655],
}

export default function SettingsPage() {
  const [stageIcons, setStageIcons] = useState<Record<Stage, string>>(DEFAULT_STAGE_ICONS)
  const [editing, setEditing] = useState<Stage>('lead')
  const [page, setPage] = useState(0)

  const visible = ICON_NAMES.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div className="panel">
        <h3>パイプライン設定</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          ステージごとの表示アイコンを選ぶ。アイコンライブラリには{' '}
          {ICON_NAMES.length.toLocaleString()} 個が入っている。
        </p>
        <div className="toolbar">
          {STAGES.map((stage) => (
            <button
              key={stage}
              className="button"
              onClick={() => setEditing(stage)}
              style={
                editing === stage
                  ? { borderColor: 'var(--accent)', color: 'var(--accent)' }
                  : undefined
              }
            >
              <span
                style={{ verticalAlign: 'middle', marginRight: 6 }}
                dangerouslySetInnerHTML={{
                  __html: renderIcon(ICON_TABLE[stageIcons[stage]] ?? '', { size: 14 }),
                }}
              />
              {STAGE_LABELS[stage]}
            </button>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="toolbar" style={{ justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0 }}>{STAGE_LABELS[editing]} のアイコンを選ぶ</h3>
          <span className="toolbar">
            <button className="button" onClick={() => setPage((prev) => Math.max(0, prev - 1))}>
              前へ
            </button>
            <span className="muted">
              {page * PAGE_SIZE + 1}〜{page * PAGE_SIZE + visible.length}
            </span>
            <button
              className="button"
              onClick={() =>
                setPage((prev) => Math.min(Math.floor(ICON_NAMES.length / PAGE_SIZE), prev + 1))
              }
            >
              次へ
            </button>
          </span>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(48px, 1fr))',
            gap: 6,
            marginTop: 10,
          }}
        >
          {visible.map((name) => (
            <button
              key={name}
              className="button"
              title={name}
              onClick={() => setStageIcons((prev) => ({ ...prev, [editing]: name }))}
              style={{
                padding: 8,
                borderColor: stageIcons[editing] === name ? 'var(--accent)' : undefined,
              }}
              dangerouslySetInnerHTML={{ __html: renderIcon(ICON_TABLE[name], { size: 18 }) }}
            />
          ))}
        </div>
      </div>

      <div className="panel">
        <h3>日付の表示形式</h3>
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
                <td>{ShibaDate.formatDate(UPDATED_AT, 'yyyy/MM/dd HH:mm', LOCALE_TABLE[tag])}</td>
                <td>{ShibaDate.formatRelative(UPDATED_AT, NOW, LOCALE_TABLE[tag])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
