import { Component } from 'react'
import './commandButton.css'
import type { ReactNode } from 'react'

export const COMMAND_HIGHLIGHT_MS = 150

export class CommandButton extends Component<{
  children: ReactNode; onSelect: () => void; paused?: boolean; acquire?: () => boolean; release?: () => void; className?: string
}, { selected: boolean }> {
  state = { selected: false }
  private timer?: ReturnType<typeof setTimeout>
  private cancelled = false
  private attempt = 0
  private ownsGate = false
  private releaseGate() {
    if (this.ownsGate) { this.ownsGate = false; this.props.release?.() }
  }
  componentWillUnmount() { this.cancelled = true; this.attempt++; clearTimeout(this.timer); this.releaseGate() }
  componentDidUpdate() {
    if (this.props.paused && this.state.selected) {
      this.cancelled = true
      this.attempt++
      clearTimeout(this.timer)
      this.timer = undefined
      this.releaseGate()
      this.setState({ selected: false })
    }
  }
  select = () => {
    if (this.timer !== undefined || this.state.selected || this.props.paused) return
    if (this.props.acquire) {
      if (!this.props.acquire()) return
      this.ownsGate = true
    }
    this.cancelled = false
    const attempt = ++this.attempt
    const onSelect = this.props.onSelect
    this.setState({ selected: true })
    this.timer = setTimeout(() => {
      if (this.cancelled || attempt !== this.attempt) return
      this.timer = undefined
      this.releaseGate()
      this.setState({ selected: false })
      if (!this.props.paused) onSelect()
    }, COMMAND_HIGHLIGHT_MS)
  }
  render() {
    return <button type="button" className={['command-image', this.props.className, this.state.selected ? 'is-selected' : undefined].filter(Boolean).join(' ') || undefined} onClick={this.select}>{this.props.children}</button>
  }
}
