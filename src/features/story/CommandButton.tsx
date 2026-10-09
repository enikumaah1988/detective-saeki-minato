import { Component } from 'react'
import type { ReactNode } from 'react'

export const COMMAND_HIGHLIGHT_MS = 150

export class CommandButton extends Component<{
  children: ReactNode; onSelect: () => void; paused?: boolean
}, { selected: boolean }> {
  state = { selected: false }
  private timer?: ReturnType<typeof setTimeout>
  componentWillUnmount() { clearTimeout(this.timer) }
  componentDidUpdate() {
    if (this.props.paused && this.state.selected) {
      clearTimeout(this.timer)
      this.timer = undefined
      this.setState({ selected: false })
    }
  }
  select = () => {
    if (this.timer !== undefined || this.state.selected || this.props.paused) return
    this.setState({ selected: true })
    this.timer = setTimeout(() => {
      this.timer = undefined
      this.setState({ selected: false })
      if (!this.props.paused) this.props.onSelect()
    }, COMMAND_HIGHLIGHT_MS)
  }
  render() {
    return <button type="button" className={this.state.selected ? 'is-selected' : undefined} onClick={this.select}>{this.props.children}</button>
  }
}
