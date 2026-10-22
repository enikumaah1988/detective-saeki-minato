import { createRoot } from 'react-dom/client'
import { StoryPlayer } from '../../src/features/story/StoryPlayer'
import { episode1Part1 as scenario } from '../../src/data/scenario/episode1Part1'
import { TravelMap } from '../../src/features/story/TravelMap'
import type { GameState } from '../../src/types/gameState'

// Isolated production components, mounted only by the browser regression.
export function mountStory(state: GameState) {
  document.getElementById('root')?.remove()
  const host = document.createElement('div')
  host.className = 'game-shell'
  document.body.append(host)
  const root = createRoot(host)
  root.render(<StoryPlayer scenario={scenario} initialSession={{ state, history: [] }} />)
}

export function mountMap(onMove: (id: string) => void, onBack: () => void) {
  document.getElementById('root')?.remove()
  const host = document.createElement('div')
  host.className = 'game-shell'
  document.body.append(host)
  const root = createRoot(host)
  root.render(<div className="story"><TravelMap current="office" options={[{ id: 'company', label: '会社', next: 'unused' }]}
    onBack={onBack} onMove={onMove} /></div>)
  return () => { root.unmount(); host.remove() }
}
