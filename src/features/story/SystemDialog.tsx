import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { displayText } from './displayText'

export function SystemDialog({ title, children, onClose, label = 'OK', dismissible = true, initialFocus, confirmAction }: { title: string; children?: ReactNode; onClose: () => void; label?: string; dismissible?: boolean; initialFocus?: 'close'; confirmAction?: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const element = dialog.current!
    const invoker = document.activeElement as HTMLElement | null
    element.showModal()
    if (initialFocus === 'close') closeButton.current?.focus()
    return () => { element.close(); if (invoker?.isConnected) invoker.focus() }
  }, [])
  return <dialog ref={dialog} className="system-dialog" aria-label={displayText(title)} onKeyDown={event => {
    if(event.key!=='Tab') return
    const targets=[...event.currentTarget.querySelectorAll<HTMLElement>('button,input,[tabindex]')].filter(el=>el.tabIndex>=0&&!el.matches(':disabled')&&el.getClientRects().length)
    const index=targets.indexOf(document.activeElement as HTMLElement)
    if(event.shiftKey?index<=0:index<0||index===targets.length-1){event.preventDefault();targets[event.shiftKey?targets.length-1:0]?.focus()}
  }} onCancel={event => { event.preventDefault(); if (dismissible) onClose() }}>
    <h2>{displayText(title)}</h2>{children}<button ref={closeButton} autoFocus type="button" onClick={onClose}>{displayText(label)}</button>{confirmAction}
  </dialog>
}
