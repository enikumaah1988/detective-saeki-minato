// 結合文字・ZWJ絵文字・国旗などを一つの表示単位として扱う。
const segmenter = new Intl.Segmenter('ja', { granularity: 'grapheme' })
export function graphemes(text: string): string[] {
  return Array.from(segmenter.segment(text), part => part.segment)
}

// fits は実ブラウザーのフォントと表示幅で最大3行に収まるかを測る。
export function paginateText(text: string, fits: (candidate: string) => boolean): string[] {
  const units = graphemes(text)
  if (!units.length) return ['']
  const pages: string[] = []
  let offset = 0
  while (offset < units.length) {
    let low = 1, high = units.length - offset, count = 1
    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      if (fits(units.slice(offset, offset + mid).join(''))) { count = mid; low = mid + 1 }
      else high = mid - 1
    }
    pages.push(units.slice(offset, offset + count).join(''))
    offset += count
  }
  return pages
}

export function measureDialoguePages(text: string, element: HTMLElement): string[] {
  const style = getComputedStyle(element)
  const measure = document.createElement('div')
  const width = element.getBoundingClientRect().width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
  Object.assign(measure.style, {
    position: 'fixed', visibility: 'hidden', pointerEvents: 'none', left: '-10000px', top: '0',
    width: `${width}px`, padding: '0', margin: '0', border: '0', boxSizing: 'content-box',
    font: style.font, fontFamily: style.fontFamily, fontSize: style.fontSize, fontWeight: style.fontWeight,
    lineHeight: style.lineHeight, letterSpacing: style.letterSpacing, whiteSpace: style.whiteSpace,
    overflowWrap: style.overflowWrap, wordBreak: style.wordBreak,
  })
  document.body.append(measure)
  try {
    const maxHeight = parseFloat(style.lineHeight) * 3
    return paginateText(text, candidate => {
      // 終端改行も空行として測る。内容へ計測用文字は保存しない。
      measure.textContent = candidate + '\u200b'
      return measure.getBoundingClientRect().height <= maxHeight + .5
    })
  } finally { measure.remove() }
}
