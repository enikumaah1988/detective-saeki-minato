import { Children, Component, cloneElement, isValidElement } from 'react'
import type { ReactNode } from 'react'
import { SelectionGate } from './playback'

export class SelectionMenu extends Component<{ children: ReactNode; className?: string; paused?: boolean }> {
  private gate = new SelectionGate()
  render() {
    return <div className={this.props.className ?? 'command-list'}>
      {Children.map(this.props.children, child => isValidElement(child)
        ? cloneElement(child as React.ReactElement<{ acquire: () => boolean; release: () => void; paused?: boolean }>, { acquire: this.gate.acquire, release: this.gate.release, paused: this.props.paused }) : child)}
    </div>
  }
}
