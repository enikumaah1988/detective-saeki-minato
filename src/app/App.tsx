import { useState } from 'react'
import { freeActionDemo } from '../data/scenario/freeActionDemo'
import { demoScenario } from '../data/scenario/demo'
import { StoryPlayer } from '../features/story/StoryPlayer'

export default function App() {
  const [scenario, setScenario] = useState(freeActionDemo)
  return (
    <>
      <main className="game-shell" aria-label="探偵 佐伯湊 / Detective Saeki Minato">
        <StoryPlayer key={scenario.id} scenario={scenario} />
      </main>
      <details className="scene-selector">
        <summary><span className="dev-label">DEV</span> 仮シナリオの切替</summary>
      <div className="choices" aria-label="検証用シーン選択">
        <button type="button" onClick={() => setScenario(freeActionDemo)}>第1部「依頼」の仮シナリオ</button>
        <button type="button" onClick={() => setScenario(demoScenario)}>会話・分岐の仮シーン</button>
      </div>
      <p className="story-note">シーン切替時は初期状態に戻ります。ロードは保存したシーンを選んで実行してください。</p>
      </details>
    </>
  )
}
