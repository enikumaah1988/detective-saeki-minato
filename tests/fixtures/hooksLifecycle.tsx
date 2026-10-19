import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { StoryPlayer } from '../../src/features/story/StoryPlayer'
import { SystemDialog } from '../../src/features/story/SystemDialog'
import { freeActionDemo } from '../../src/data/scenario/freeActionDemo'

function Harness() {
  const [preview, setPreview] = useState<{ records: []; label: string; invoker: HTMLElement }>()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [initialFocus, setInitialFocus] = useState<'close'>()
  return <>
    <button onClick={event => setPreview({ records: [], label: '回帰検証', invoker: event.currentTarget })}>プレビュー要求</button>
    <button onClick={() => setDialogOpen(true)}>フォーカス検証</button>
    <StoryPlayer scenario={freeActionDemo} preview={preview} />
    {dialogOpen && <SystemDialog title="フォーカス検証" initialFocus={initialFocus} onClose={() => setDialogOpen(false)}>
      <input aria-label="入力欄" />
      <button onClick={() => setInitialFocus('close')}>初期設定を更新</button>
    </SystemDialog>}
  </>
}

export function mountHarness() {
  const host = document.createElement('div')
  host.dataset.hooksRegression = ''
  document.body.append(host)
  createRoot(host).render(<StrictMode><Harness /></StrictMode>)
}
