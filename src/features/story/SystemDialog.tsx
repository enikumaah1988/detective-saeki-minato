import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

export function SystemDialog({ title, children, onClose, label = 'OK', dismissible = true }: { title: string; children?: ReactNode; onClose: () => void; label?: string; dismissible?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const element = dialog.current!
    const invoker = document.activeElement as HTMLElement | null
    element.showModal()
    return () => { element.close(); if (invoker?.isConnected) invoker.focus() }
  }, [])
  return <dialog ref={dialog} className="system-dialog" aria-label={title} onCancel={event => { event.preventDefault(); if (dismissible) onClose() }}>
    <h2>{title}</h2>{children}<button autoFocus type="button" onClick={onClose}>{label}</button>
  </dialog>
}
