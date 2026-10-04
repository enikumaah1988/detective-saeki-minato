import { useState } from 'react'
import type { Scenario } from '../../types/scenario'
import { getNode, transition } from './progression'
import './story.css'

export function StoryPlayer({ scenario }: { scenario: Scenario }) {
  const [nodeId, setNodeId] = useState(scenario.start)
  const node = getNode(scenario, nodeId)
  const advance = () => setNodeId((current) => transition(scenario, current, { type: 'advance' }))

  return (
    <section className="story" aria-label="会話シーン">
      <p className="story-note">{scenario.title}</p>
      <div className="stage" aria-label="背景領域">
        <p className="background-label">{node.stage.background}</p>
        <div className="character" aria-label="キャラクター領域">
          <span>人物プレースホルダー</span>
          <strong>{node.stage.character}</strong>
        </div>
      </div>
      <div className="message-window">
        <div aria-live="polite" aria-atomic="true">
          {node.type === 'dialogue' && <h2 className="speaker">{node.speaker}</h2>}
          <p className="dialogue">{node.type === 'choice' ? node.prompt : node.text}</p>
        </div>
        {node.type === 'dialogue' && (
          <button className="next" type="button" onClick={advance}>次へ ▸</button>
        )}
        {node.type === 'choice' && (
          <div className="choices" aria-label="選択肢">
            {node.options.map((option) => (
              <button key={option.id} type="button" onClick={() => setNodeId((current) =>
                transition(scenario, current, { type: 'choose', choiceId: option.id }))}>
                {option.label}
              </button>
            ))}
          </div>
        )}
        {node.type === 'end' && (
          <button type="button" onClick={() => setNodeId(scenario.start)}>最初から</button>
        )}
      </div>
    </section>
  )
}
