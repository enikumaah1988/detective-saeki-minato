import { useEffect, useRef, useState } from 'react'
import { AssetImage } from '../features/story/StageView'
import { CommandButton } from '../features/story/CommandButton'
import { SelectionMenu } from '../features/story/SelectionMenu'

export const mapImage = new URL('./assets/city-map-mock.png', import.meta.url).href
export const stationImage = new URL('./assets/station-mock.png', import.meta.url).href
export const cafeImage = new URL('./assets/cafe-mock.png', import.meta.url).href
export type OutdoorPlace = 'outside' | 'station' | 'cafe'
const locations = [
  { id: 'outside', name: '探偵事務所', description: '事務所のあるビル。ロビーから事務所へ戻れる。', image: new URL('../assets/backgrounds/office-afternoon.png', import.meta.url).href, x: 22, y: 65 },
  { id: 'station', name: '駅前', description: '駅前の広場。人の往来が多い。', image: stationImage, x: 49, y: 32 },
  { id: 'cafe', name: '喫茶店', description: '静かな通りにある喫茶店。窓から暖かな灯りが漏れている。', image: cafeImage, x: 72, y: 77 },
] as const

export function OutdoorMapMock({ current, onBack, onMove }: { current: OutdoorPlace; onBack: () => void; onMove: (id: OutdoorPlace) => void }) {
  const [selected, setSelected] = useState<OutdoorPlace>()
  const root = useRef<HTMLDivElement>(null)
  const location = locations.find(item => item.id === selected)
  useEffect(() => { root.current?.querySelector<HTMLButtonElement>('.map-marker:not(:disabled)')?.focus() }, [])
  return <div ref={root} className="outdoor-map-mock" aria-label="屋外移動地図" onKeyDown={event => {
    if (event.key === 'Escape') { event.preventDefault(); onBack() }
  }}>
    <header className="map-header"><div><h1>移動先を選ぶ</h1><p>周辺エリア</p></div><button onClick={onBack}>× 戻る</button></header>
    <div className="map-body">
      <nav className="map-canvas" aria-label="地図の移動先">
        <AssetImage src={mapImage} alt="" className="map-background" fallback={<div className="map-background map-image-fallback" />} />
        {locations.map(item => <button key={item.id} type="button" className={`map-marker${current === item.id ? ' is-current' : ''}${selected === item.id ? ' is-selected' : ''}`}
          style={{ left: `${item.x}%`, top: `${item.y}%` }}  aria-pressed={selected === item.id}
          aria-label={`${item.name}${current === item.id ? '（現在地）' : 'を選択'}`} onClick={() => setSelected(item.id)}>
          <svg viewBox="0 0 32 42" aria-hidden="true"><path d="M16 1C7 1 1 7 1 16c0 11 15 25 15 25s15-14 15-25C31 7 25 1 16 1z" fill="currentColor" /><circle cx="16" cy="15" r="6" fill="#101922" /></svg>
          <span className="map-marker-label">{item.name}</span>{current === item.id && <span className="map-current-label">現在地</span>}
        </button>)}
      </nav>
      <aside className="map-location-info" aria-label="選択した場所">
        {location ? <>
          <h2 aria-live="polite">{location.name}</h2>
          <AssetImage key={location.id} src={location.image} alt={`${location.name}の仮イメージ`} className="map-location-photo" fallback={<div className="map-location-photo map-photo-fallback">仮画像</div>} />
          <p>{location.description}</p>
          <SelectionMenu key={`confirm-${location.id}`} className="map-confirm"><CommandButton paused={current === location.id} onSelect={() => { if (current !== location.id) onMove(location.id) }}><span>{current === location.id ? '現在地' : 'ここへ移動'}</span><span aria-hidden="true">›</span></CommandButton></SelectionMenu>
        </> : <div className="map-selection-guide"><h2>移動先を選択</h2><p>地図のピンを選ぶと、場所の情報が表示されます。</p><p className="map-current-note">現在地：{locations.find(item => item.id === current)?.name}</p></div>}
      </aside>
    </div>
    <footer className="map-footer">場所を選んで移動 <span>UIモック・仮地図</span></footer>
  </div>
}
