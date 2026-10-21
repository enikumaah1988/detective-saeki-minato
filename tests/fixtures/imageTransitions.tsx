import { createRoot } from 'react-dom/client'
import { StageView } from '../../src/features/story/StageView'
import type { Stage } from '../../src/types/scenario'

// Loaded only by the browser regression, never by the game bundle.
export function mountTestStage() {
  document.getElementById('root')?.remove()
  const host = document.createElement('div')
  host.className = 'game-shell'
  document.body.append(host)
  const root = createRoot(host)
  return (stage: Stage) => root.render(<div className="story"><StageView stage={stage} /></div>)
}
