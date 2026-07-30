/**
 * shiba-markdown / パーサ
 *
 * マークダウンを HTML 文字列に変換する。見出し・強調・コード・リスト・引用・表に対応。
 *
 * scripts/gen-vendor.mjs による生成物。直接編集しない。
 */

import { EMOJI } from './emoji'
import { SYNTAX } from './syntax'

const BACKTICK = String.fromCharCode(96)

export interface RenderOptions {
  emoji?: boolean
  highlight?: boolean
}

function escapeHtml(src: string): string {
  return src
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function highlight(code: string, lang: string): string {
  const definition = SYNTAX[lang]
  const escaped = escapeHtml(code)
  if (!definition) return escaped

  const keywords = new Set(definition.keywords)
  return escaped.replace(/[A-Za-z_][A-Za-z0-9_]*/g, (token) =>
    keywords.has(token) ? '<span class="tok-keyword">' + token + '</span>' : token,
  )
}

function inline(src: string, options: RenderOptions): string {
  let out = escapeHtml(src)

  const codeSpan = new RegExp(BACKTICK + '([^' + BACKTICK + ']+)' + BACKTICK, 'g')
  out = out.replace(codeSpan, '<code>$1</code>')
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  out = out.replace(/~~([^~]+)~~/g, '<del>$1</del>')
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" rel="noreferrer">$1</a>')

  if (options.emoji !== false) {
    out = out.replace(/:([a-z0-9_]+):/g, (whole: string, name: string) => {
      const description = EMOJI[name]
      if (!description) return whole
      return '<span class="emoji" title="' + description + '">:' + name + ':</span>'
    })
  }

  return out
}

export function renderMarkdown(source: string, options: RenderOptions = {}): string {
  const lines = source.split('\n')
  const html: string[] = []
  let listBuffer: string[] = []
  let paragraphBuffer: string[] = []

  const flushList = () => {
    if (listBuffer.length === 0) return
    html.push('<ul>' + listBuffer.map((item) => '<li>' + item + '</li>').join('') + '</ul>')
    listBuffer = []
  }

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) return
    html.push('<p>' + paragraphBuffer.join(' ') + '</p>')
    paragraphBuffer = []
  }

  const flushAll = () => {
    flushList()
    flushParagraph()
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.trim() === '') {
      flushAll()
      continue
    }

    // フェンスされたコードブロック
    if (line.startsWith(BACKTICK + BACKTICK + BACKTICK)) {
      flushAll()
      const lang = line.slice(3).trim()
      const body: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith(BACKTICK + BACKTICK + BACKTICK)) {
        body.push(lines[i])
        i++
      }
      const code =
        options.highlight === false
          ? escapeHtml(body.join('\n'))
          : highlight(body.join('\n'), lang)
      html.push('<pre class="md-code" data-lang="' + escapeHtml(lang) + '"><code>' + code + '</code></pre>')
      continue
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line)
    if (heading) {
      flushAll()
      const level = heading[1].length
      html.push('<h' + level + '>' + inline(heading[2], options) + '</h' + level + '>')
      continue
    }

    if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
      flushAll()
      html.push('<hr/>')
      continue
    }

    const quote = /^>\s?(.*)$/.exec(line)
    if (quote) {
      flushAll()
      html.push('<blockquote>' + inline(quote[1], options) + '</blockquote>')
      continue
    }

    const listItem = /^\s*[-*+]\s+(.*)$/.exec(line)
    if (listItem) {
      flushParagraph()
      listBuffer.push(inline(listItem[1], options))
      continue
    }

    flushList()
    paragraphBuffer.push(inline(line, options))
  }

  flushAll()
  return html.join('')
}
