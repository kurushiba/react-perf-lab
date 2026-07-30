import { useEffect, useRef, useState } from 'react'
import { LegacyPickerWidget, PICKER_CHOICES, type LegacyWidgetOptions } from '../../../shared/legacy-widget'

const INITIAL_OPTIONS: LegacyWidgetOptions = {
  placeholder: 'メンションする人を検索',
  choices: PICKER_CHOICES,
  compact: false,
}

export default function ThirdParty() {
  const [note, setNote] = useState('')
  const [compact, setCompact] = useState(false)

  const hostRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<LegacyPickerWidget | null>(null)

  const options: LegacyWidgetOptions = {
    placeholder: 'メンションする人を検索',
    choices: PICKER_CHOICES,
    compact,
  }

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const widget = new LegacyPickerWidget()
    widget.mount(host, INITIAL_OPTIONS)
    widgetRef.current = widget
    return () => {
      widget.destroy()
      widgetRef.current = null
    }
  }, [])

  useEffect(() => {
    widgetRef.current?.setOptions(options)
  }, [options])

  // このウィジェットには購読の仕組みが無く、現在値を知る手段が getValue() しかない
  const selected = widgetRef.current?.getValue() ?? ''

  return (
    <div className="page">
      <h1>06 参照等価性に依存する外部ウィジェット</h1>
      <p className="muted">
        メンション先を選ぶピッカー。誰かを選んだあとで下のメモ欄に1文字打つと、選択が消える。
      </p>

      <div className="toolbar" style={{ marginBottom: 12 }}>
        <label>
          <input type="checkbox" checked={compact} onChange={(e) => setCompact(e.target.checked)} />{' '}
          コンパクト表示
        </label>
      </div>

      <div className="panel" style={{ marginBottom: 12 }}>
        <h3>メンション先（外部ウィジェット）</h3>
        <div ref={hostRef} />
        <p className="muted" style={{ margin: '10px 0 0' }}>
          選択中: <strong>{selected || '（未選択）'}</strong>
        </p>
      </div>

      <div className="panel">
        <h3>メモ（Reactの通常の入力欄）</h3>
        <input
          type="text"
          value={note}
          placeholder="ここに1文字打つ"
          onChange={(e) => setNote(e.target.value)}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  )
}
