'use no memo'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  LegacyPickerWidget,
  PICKER_CHOICES,
  type LegacyWidgetOptions,
} from '../../../../shared/legacy-widget'

/**
 * 06 修正後：`"use no memo"` が正当化される唯一のケース。
 *
 * このウィジェットが要求しているのは「options の参照を、本当に必要なときだけ変える」こと。
 * ところが値を読む手段が `getValue()` しかないため、レンダー中に ref を読まざるを得ず、
 * Compiler から見ると純粋ではない（＝正しく解析できない）。
 *
 * 直せるのは自分のコードだけで、ライブラリのAPIは変えられない。
 * そこでこのファイルだけ Compiler の対象外にし、
 * **参照の安定性を自分の責任で管理する**（＝ useMemo を手で書く）。
 *
 * ファイル先頭の 'use no memo' は import より前に置くこと（モジュール全体に効く）。
 */
const INITIAL_OPTIONS: LegacyWidgetOptions = {
  placeholder: 'メンションする人を検索',
  choices: PICKER_CHOICES,
  compact: false,
}

export default function ThirdPartyFixed() {
  const [note, setNote] = useState('')
  const [compact, setCompact] = useState(false)

  const hostRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<LegacyPickerWidget | null>(null)

  // 本当に options を作り直すべきなのは compact が変わったときだけ
  const options: LegacyWidgetOptions = useMemo(
    () => ({
      placeholder: 'メンションする人を検索',
      choices: PICKER_CHOICES,
      compact,
    }),
    [compact],
  )

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

  const selected = widgetRef.current?.getValue() ?? ''

  return (
    <div className="page">
      <h1>06 修正後：ここだけ Compiler の対象外にする</h1>
      <p className="muted">
        メモ欄に何文字打っても選択は消えない。「コンパクト表示」を切り替えたときだけ作り直される。
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
