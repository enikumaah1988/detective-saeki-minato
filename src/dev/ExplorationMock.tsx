import { useEffect, useRef, useState } from 'react'
import { StageView } from '../features/story/StageView'
import { DialogueWindow } from '../features/story/DialogueWindow'
import { CommandButton } from '../features/story/CommandButton'
import { SelectionMenu } from '../features/story/SelectionMenu'
import { UiIcon } from '../features/story/UiIcon'
import { OutdoorMapMock, mapImage, stationImage, cafeImage } from './OutdoorMapMock'
import type { OutdoorPlace } from './OutdoorMapMock'
import './explorationMock.css'

type Place = 'office' | 'lobby' | OutdoorPlace
type Screen = 'actions' | 'targets' | 'detail' | 'destinations' | 'map' | 'travel' | 'arrival'
const places = { office: '探偵事務所', lobby: 'ビルのロビー', outside: '探偵事務所前', station: '駅前', cafe: '喫茶店' }
const indoorMoves = { office: ['lobby'], lobby: ['office', 'outside'], outside: [], station: [], cafe: [] } as const
const outdoorImages = { outside: mapImage, station: stationImage, cafe: cafeImage }
const targets = {
  office: [{ id: 'desk', name: '机の上', text: '机の上に、書き込みのあるメモが置かれている。内容を確認しておこう。' }, { id: 'window', name: '窓の外', text: '窓から街の様子が見える。今は特に気になるものはない。' }],
  lobby: [{ id: 'notice', name: '案内板', text: '案内板には、各階の部屋が記されている。行き先を確認できそうだ。' }, { id: 'entrance', name: '出入口', text: '出入口の向こうに通りが見える。ここから外へ出られそうだ。' }],
  outside: [{ id: 'building', name: 'ビルの入口', text: '事務所のあるビルだ。入口からロビーへ戻れる。' }],
  station: [{ id: 'station-entrance', name: '駅の入口', text: '駅の入口には、人が行き交っている。今は周囲の様子を確認しておこう。' }],
  cafe: [{ id: 'cafe-window', name: '店の窓', text: '窓越しに、落ち着いた店内が見える。ここは仮の調査対象だ。' }],
}
const officeImage = new URL('../assets/images/backgrounds/office-afternoon.png', import.meta.url).href

// 閲覧用のローカル状態だけを持つ。本編のGameState・保存処理とは接続しない。
export function ExplorationMock({ onClose }: { onClose: () => void }) {
  const [place, setPlace] = useState<Place>('office')
  const [screen, setScreen] = useState<Screen>('actions')
  const [targetId, setTargetId] = useState('desk')
  const [visited, setVisited] = useState<string[]>([])
  const [destination, setDestination] = useState<Place>('lobby')
  const dialogue = useRef<DialogueWindow>(null)
  const panel = useRef<HTMLElement>(null)
  const target = targets[place].find(item => item.id === targetId) ?? targets[place][0]
  const hasDialogue = screen === 'detail' || screen === 'arrival'
  const isOutdoor = place !== 'office' && place !== 'lobby'
  const startTravel = (id: Place) => { setDestination(id); setScreen('travel') }
  useEffect(() => {
    if (screen !== 'travel') return
    const timer = setTimeout(() => { setPlace(destination); setScreen('arrival') }, 300)
    return () => clearTimeout(timer)
  }, [screen, destination])
  useEffect(() => {
    panel.current?.querySelector<HTMLButtonElement>('button')?.focus()
  }, [screen])
  if (screen === 'map' && isOutdoor) return <section className="story exploration-mock" aria-label="調査・移動UIモック" data-screen={screen} data-place={place}>
    <OutdoorMapMock current={place as OutdoorPlace} onBack={() => setScreen('actions')} onMove={startTravel} />
  </section>
  return <section className={`story exploration-mock mock-place-${place}`} aria-label="調査・移動UIモック" data-screen={screen} data-place={place}
    onKeyDown={event => {
      if (event.key === 'Escape' && screen !== 'travel') { event.preventDefault(); setScreen(screen === 'detail' ? 'targets' : 'actions') }
    }}>
    <div className="stage-wrapper">
      <div className="stage-input-area" onClick={() => hasDialogue && dialogue.current?.activate()}>
        {place === 'office' ? <StageView stage={{ backgroundId: 'office-afternoon', characters: hasDialogue ? [] : [{ characterId: 'minato', expression: 'normal', position: 'left' }] }} />
          : place === 'lobby' ? <div className="mock-lobby" role="img" aria-label="ビルのロビーの仮背景"><div className="mock-lobby-door" /><div className="mock-lobby-sign">案内板</div></div>
            : <div className="mock-outdoor" role="img" aria-label={`${places[place]}の仮背景`} style={{ backgroundImage: `url(${outdoorImages[place]})` }} />}
        {screen === 'detail' && <figure className={`mock-detail-art mock-detail-${target.id}`} aria-label={`${target.name}の仮拡大表示`}>
          {place === 'office' ? <img src={officeImage} alt="" /> : <div className="mock-detail-placeholder">{target.name}</div>}
          <figcaption>{target.name}<span>仮素材</span></figcaption>
        </figure>}
      </div>
    </div>
    <header className="story-toolbar">
      <div className="toolbar-actions"><button onClick={onClose} disabled={screen === 'travel'}>モックを閉じる</button><span className="mock-badge">UIモック</span></div>
      <div className="scene-context"><span>{places[place]}</span><span>仮の場所・日時未設定</span></div>
    </header>
    {!hasDialogue && screen !== 'travel' && <nav ref={panel} key={`${place}:${screen}`} className={`command-panel${screen === 'actions' ? ' free-action-panel' : ''}`} aria-label={screen === 'targets' ? '調査対象' : screen === 'destinations' ? '移動先' : 'モックFree Action'}>
      {screen !== 'actions' && <p className="command-heading">{screen === 'targets' ? '調べる' : '移動'}</p>}
      <SelectionMenu className={screen === 'actions' ? 'command-list' : 'item-list'}>
        {screen === 'actions' ? [
          <CommandButton key="look" onSelect={() => setScreen('targets')}><UiIcon name="look" /><span className="command-name">調べる</span><span className="command-arrow" aria-hidden="true">›</span></CommandButton>,
          <CommandButton key="move" onSelect={() => setScreen(isOutdoor ? 'map' : 'destinations')}><span className="command-name">移動</span><span className="command-arrow" aria-hidden="true">›</span></CommandButton>,
          ...(place === 'outside' ? [<CommandButton key="enter" onSelect={() => startTravel('lobby')}><span className="command-name">建物に入る</span><span className="command-arrow" aria-hidden="true">›</span></CommandButton>] : []),
        ] : screen === 'targets' ? targets[place].map(item => <CommandButton key={item.id} onSelect={() => { setTargetId(item.id); setScreen('detail') }}><span className="command-name">{item.name}</span><span className="item-status">{visited.includes(item.id) ? '確認済' : '未確認'}</span></CommandButton>)
          : indoorMoves[place].map(id => <CommandButton key={id} onSelect={() => startTravel(id)}><span className="command-name">{id === 'outside' ? '建物の外へ' : places[id]}</span><span className="command-arrow" aria-hidden="true">›</span></CommandButton>)}
        {screen !== 'actions' && <CommandButton onSelect={() => setScreen('actions')}><span className="command-name">戻る</span><span className="command-arrow" aria-hidden="true">›</span></CommandButton>}
      </SelectionMenu>
    </nav>}
    {hasDialogue && <DialogueWindow ref={dialogue} key={`${screen}:${target.id}:${place}`} autoFocus speaker={screen === 'detail' ? '佐伯湊' : ''} thinking={false}
      text={screen === 'detail' ? target.text : `${places[place]}に着いた。周囲を確認してみよう。`}
      onAdvance={() => {
        if (screen === 'detail') { setVisited(ids => ids.includes(target.id) ? ids : [...ids, target.id]); setScreen('targets') }
        else setScreen('actions')
      }} />}
    {screen === 'travel' && <div className="mock-travel" role="status"><span>{places[destination]}へ移動中</span></div>}
  </section>
}
