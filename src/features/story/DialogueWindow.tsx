import { Component } from 'react'

export const CHARACTER_INTERVAL_MS = 35

export class DialogueWindow extends Component<{
  speaker: string; text: string; thinking: boolean; paused?: boolean; onAdvance: () => void
}, { visible: number }> {
  state = { visible: 0 }
  private timer?: ReturnType<typeof setInterval>
  private get characters() { return Array.from(this.props.text) }

  componentDidMount() {
    this.timer = setInterval(() => {
      if (!this.props.paused && this.state.visible < this.characters.length) {
        this.setState(({ visible }) => ({ visible: visible + 1 }))
      }
    }, CHARACTER_INTERVAL_MS)
  }
  componentWillUnmount() { clearInterval(this.timer) }

  activate = () => {
    if (this.props.paused) return
    if (this.state.visible < this.characters.length) this.setState({ visible: this.characters.length })
    else this.props.onAdvance()
  }

  render() {
    const complete = this.state.visible >= this.characters.length
    return <button type="button" className={`message-window dialogue-button${this.props.thinking ? ' thinking-message' : ''}`}
      onClick={this.activate} aria-label="会話を次へ進める">
      <span className="speaker">{this.props.speaker}</span>
      <span className="dialogue"><span aria-hidden="true">{this.characters.slice(0, this.state.visible).join('')}</span><span className="sr-only">{this.props.text}</span></span>
      {complete && <span className="next" aria-label="次へ">▼</span>}
    </button>
  }
}
