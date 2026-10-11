import { lazy, Suspense, useState } from 'react'
import { freeActionDemo } from '../data/scenario/freeActionDemo'
import { demoScenario } from '../data/scenario/demo'
import { StoryPlayer } from '../features/story/StoryPlayer'
import type { InvestigationRecord } from '../types/investigation'
import type { PreviewMode } from '../dev/investigationPreview'


const ExplorationMock = import.meta.env.DEV
  ? lazy(() => import('../dev/ExplorationMock').then(module => ({ default: module.ExplorationMock })))
  : undefined

export default function App() {
  const [scenario, setScenario] = useState(freeActionDemo)
  const [preview, setPreview] = useState<{ records: InvestigationRecord[]; label: string; invoker: HTMLElement }>()
  const [smokingAllowed, setSmokingAllowed] = useState<boolean>()
  const [explorationMock, setExplorationMock] = useState(false)

  return (
    <>
      <main className="game-shell" aria-label="探偵 佐伯湊 / Detective Saeki Minato">
        <div style={explorationMock ? { display: 'none' } : { display: 'contents' }} inert={explorationMock}>
          <StoryPlayer key={scenario.id} scenario={scenario} preview={preview} smokingAllowed={smokingAllowed} suspended={explorationMock} />
        </div>
        {ExplorationMock && explorationMock && <Suspense fallback={<section className="story" role="status">モックを読み込み中</section>}><ExplorationMock onClose={() => setExplorationMock(false)} /></Suspense>}
      </main>
      <details className="scene-selector">
        <summary><span className="dev-label">DEV</span> 仮シナリオの切替</summary>
      <div className="choices" aria-label="検証用シーン選択">
        <button type="button" onClick={() => { setExplorationMock(false); setPreview(undefined); setScenario(freeActionDemo) }}>第1部「依頼」の仮シナリオ</button>
        <button type="button" onClick={() => { setExplorationMock(false); setPreview(undefined); setScenario(demoScenario) }}>会話・分岐の仮シーン</button>
      </div>
      <p className="story-note">シーン切替時は初期状態に戻ります。ロードは保存したシーンを選んで実行してください。</p>
      </details>
      {import.meta.env.DEV && <details className="scene-selector">
        <summary><span className="dev-label">DEV</span> 調査記録UIプレビュー（本編・セーブとは無関係）</summary>
        <div className="choices">
          {(['normal', 'empty', 'all-empty', 'stress', 'no-images'] as PreviewMode[]).map(mode => <button key={mode} type="button" onClick={async event => {
            setExplorationMock(false)
            const invoker = event.currentTarget
            const module = await import('../dev/investigationPreview')
            document.querySelector('.game-shell')?.scrollIntoView({ block: 'start', behavior: 'instant' })
            setPreview({ records: module.createInvestigationPreview(mode), label: module.previewModes.find(item => item.id === mode)!.label, invoker })
          }}>{({ normal: '通常', empty: '一部空', 'all-empty': '全部空', stress: '多数・長文', 'no-images': '画像なし' })[mode]}</button>)}
        </div>
      </details>}
      {import.meta.env.DEV && <details className="scene-selector">
        <summary><span className="dev-label">DEV</span> 調査・移動UIモック</summary>
        <div className="choices"><button onClick={() => {
          setPreview(undefined); setExplorationMock(true)
          document.querySelector('.game-shell')?.scrollIntoView({ block: 'start', behavior: 'instant' })
        }}>調査・移動モックを開く</button></div>
        <p className="story-note">本編・セーブとは無関係です。閉じると元の本編画面へ戻ります。</p>
      </details>}
      {import.meta.env.DEV && <details className="scene-selector">
        <summary><span className="dev-label">DEV</span> 喫煙演出プレビュー</summary>
        <div className="choices" aria-label="喫煙場所の試作設定">
          <button type="button" aria-pressed={smokingAllowed === undefined} onClick={() => setSmokingAllowed(undefined)}>シーン設定に従う</button>
          <button type="button" aria-pressed={smokingAllowed} onClick={() => setSmokingAllowed(true)}>吸える場所</button>
          <button type="button" aria-pressed={smokingAllowed === false} onClick={() => setSmokingAllowed(false)}>吸えない場所</button>
        </div>
      </details>}
    </>
  )
}
