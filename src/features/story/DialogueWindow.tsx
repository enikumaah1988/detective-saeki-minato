import { Component, createRef } from 'react'
import { graphemes, measureDialoguePages } from './pagination'

export const CHARACTER_INTERVAL_MS = 35

export class DialogueWindow extends Component<{
  speaker: string; text: string; thinking: boolean; interval?: number; paused?: boolean; autoFocus?: boolean; onAdvance: () => void
}, { visible: number; pages: string[]; page: number }> {
  state = { visible: 0, pages: [this.props.text], page: 0 }
  private timer?: ReturnType<typeof setInterval>
  private observer?: ResizeObserver
  private body = createRef<HTMLSpanElement>()
  private mounted = false
  private advanced = false
  private inputPending = false
  private get characters() { return graphemes(this.state.pages[this.state.page] ?? '') }

  componentDidMount() {
    this.mounted = true
    this.advanced = false
    this.inputPending = false
    this.repaginate()
    if (this.body.current) {
      this.observer = new ResizeObserver(this.repaginate)
      this.observer.observe(this.body.current)
      void document.fonts.ready.then(() => { if (this.mounted) this.repaginate() })
    }
    this.startTimer()
  }

  componentDidUpdate(previous: Readonly<DialogueWindow['props']>) {
    if (previous.interval !== this.props.interval) this.startTimer()
  }

  private startTimer() {
    clearInterval(this.timer)
    const interval = this.props.interval ?? CHARACTER_INTERVAL_MS
    this.timer = setInterval(() => {
      if (!this.props.paused && !this.advanced && this.state.visible < this.characters.length) {
        this.setState(({ visible }) => ({ visible: interval === 0 ? this.characters.length : visible + 1 }))
      }
    }, interval || 16)
  }

  repaginate = () => {
    if (!this.body.current) return
    const pages = measureDialoguePages(this.props.text, this.body.current)
    if (JSON.stringify(pages) === JSON.stringify(this.state.pages)) return
    // リサイズ時は既に読んだ文字位置を保ち、未読の文章を飛ばさない。
    const read = this.state.pages.slice(0, this.state.page).reduce((sum, page) => sum + graphemes(page).length, 0) + this.state.visible
    let page = 0, visible = read
    while (page < pages.length - 1 && visible > graphemes(pages[page]).length) {
      visible -= graphemes(pages[page]).length; page++
    }
    this.setState({ pages, page, visible })
  }

  componentWillUnmount() { this.mounted = false; this.advanced = true; clearInterval(this.timer); this.observer?.disconnect() }

  activate = () => {
    if (this.props.paused || this.advanced || this.inputPending) return
    if (this.state.visible < this.characters.length) {
      this.inputPending = true
      this.setState({ visible: this.characters.length }, () => { this.inputPending = false })
    }
    else if (this.state.page < this.state.pages.length - 1) {
      this.inputPending = true
      this.setState(({ page }) => ({ page: page + 1, visible: 0 }), () => { this.inputPending = false })
    }
    else {
      this.advanced = true // Reactの次レンダーを待たず、同じ入力元からの二重進行を防ぐ。
      this.props.onAdvance()
    }
  }

  render() {
    const complete = this.state.visible >= this.characters.length
    return <button type="button" className={`message-window dialogue-button${this.props.thinking ? ' thinking-message' : ''}`}
      data-page={this.state.page + 1} data-pages={this.state.pages.length}
      autoFocus={this.props.autoFocus}
      onClick={this.activate} aria-label="会話を次へ進める">
      {this.props.speaker ? <span className="speaker">{this.props.speaker}</span> : <span className="speaker-space" aria-hidden="true" />}
      <span className="dialogue" ref={this.body}><span aria-hidden="true">{this.characters.slice(0, this.state.visible).join('')}</span><span className="sr-only">{this.state.pages[this.state.page]}</span></span>
      {complete && <span className="next" aria-label="次へ">▼</span>}
    </button>
  }
}
