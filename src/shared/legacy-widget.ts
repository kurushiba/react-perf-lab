/**
 * `02-feed/violations/06-ThirdParty.tsx` 用の「非Reactなウィジェット」。
 *
 * 実在ライブラリに依存させるとバージョン変動で教材が壊れるので、
 * 現場でよくある作りを最小限で再現した自作モックにしてある。
 *
 * このクラスの非Reactな点は2つ：
 *   1. `setOptions()` は options の **参照** が変わると内部状態を作り直す（＝選択が消える）
 *   2. 現在値を知る手段が `getValue()` しかない（購読APIが無い）
 *
 * どちらも呼び出し側では変えられない。だから `06-ThirdParty.tsx` は
 * 「自分のコードを直しても解決しない」ケースになる（Sec.3-6）。
 */

export interface LegacyWidgetOptions {
  placeholder: string
  choices: string[]
  compact: boolean
}

export class LegacyPickerWidget {
  private host: HTMLElement | null = null
  private options: LegacyWidgetOptions | null = null
  private value = ''
  private keyword = ''

  mount(host: HTMLElement, options: LegacyWidgetOptions): void {
    this.host = host
    this.options = options
    this.draw()
  }

  /** 参照が変わったときだけ作り直す。そのとき選択と入力は失われる */
  setOptions(next: LegacyWidgetOptions): void {
    if (next === this.options) return
    this.options = next
    this.value = ''
    this.keyword = ''
    this.draw()
  }

  /** 現在の選択値。購読の仕組みは無いので、呼び出し側は自分で読みに行くしかない */
  getValue(): string {
    return this.value
  }

  destroy(): void {
    if (this.host) this.host.textContent = ''
    this.host = null
    this.options = null
  }

  private draw(): void {
    const host = this.host
    const options = this.options
    if (!host || !options) return

    host.textContent = ''

    const input = document.createElement('input')
    input.type = 'text'
    input.placeholder = options.placeholder
    input.value = this.keyword
    input.style.width = '100%'
    input.style.marginBottom = '8px'
    input.addEventListener('input', () => {
      this.keyword = input.value
      this.drawList(list, options)
    })
    host.appendChild(input)

    const list = document.createElement('div')
    list.style.display = 'flex'
    list.style.flexWrap = 'wrap'
    list.style.gap = options.compact ? '4px' : '8px'
    host.appendChild(list)

    this.drawList(list, options)
  }

  private drawList(list: HTMLElement, options: LegacyWidgetOptions): void {
    list.textContent = ''

    const keyword = this.keyword.toLowerCase()
    for (const choice of options.choices) {
      if (keyword && !choice.toLowerCase().includes(keyword)) continue

      const button = document.createElement('button')
      button.type = 'button'
      button.textContent = choice
      button.className = 'button'
      if (choice === this.value) {
        button.style.borderColor = 'var(--accent)'
        button.style.color = 'var(--accent)'
      }
      button.addEventListener('click', () => {
        this.value = choice
        this.drawList(list, options)
      })
      list.appendChild(button)
    }
  }
}

export const PICKER_CHOICES = [
  'Mika Aoyama',
  'Ren Fujita',
  'Sara Klein',
  'Tom Okabe',
  'Yui Nakano',
  'Dan Rivera',
]
