import { demoScenario } from '../data/scenario/demo'
import { StoryPlayer } from '../features/story/StoryPlayer'

export default function App() {
  return (
    <main>
      <h1>探偵 佐伯湊</h1>
      <p className="subtitle" lang="en">Detective Saeki Minato</p>
      <StoryPlayer key={demoScenario.id} scenario={demoScenario} />
    </main>
  )
}
