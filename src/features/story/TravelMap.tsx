import { useEffect, useRef, useState } from 'react'
import type { Choice } from '../../types/scenario'
import { resolveBackground } from '../../data/presentation'
import { travelMapDefinition, travelMapImage, travelMapPoint, travelMapSize } from './travelMapGeometry'

const places = [
  { id: 'office', name: '佐伯探偵事務所', background: 'office-before-noon', description: '西新宿七丁目。あかりから兄の捜索依頼を受けた事務所。' },
  { id: 'company', name: '東成ビルサービス', background: 'company-exterior', description: '西新宿六丁目・西新宿セントラルタワー12階に入る直人の勤務先。最後の出勤状況と、会社に残る記録を確認する。' },
  { id: 'building', name: '成子坂共同ビル', background: 'building-entrance', description: '取り壊しを控えた旧ビル。管理人への確認と、残された記録の調査を行う。' },
  { id: 'police', name: '西新宿警察署', background: 'police-exterior', description: '奥村・瀬川に面会し、過去の出来事と調査で分かったことを確認する。' },
]

export function TravelMap({ options, current, onBack, onMove }: { options: Choice[]; current: string; onBack: () => void; onMove: (id: string) => void }) {
  const [selected, setSelected] = useState<string>()
  const [moving, setMoving] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const root = useRef<HTMLDivElement>(null)
  const viewport = useRef<HTMLDivElement>(null)
  const [mapSize, setMapSize] = useState<{ width: number; height: number }>()
  const place = places.find(place => place.id === selected)
  const visiblePlaces = places.filter(place => place.id === current || options.some(option => option.id === place.id))
  const mappedPlaces = visiblePlaces.flatMap(place => {
    const point = travelMapPoint(place.id)
    return point ? [{ ...place, point }] : []
  })
  useEffect(() => {
    const element = viewport.current
    if (!element) return
    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      setMapSize(travelMapSize(width, height))
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    root.current?.querySelector<HTMLButtonElement>('.travel-destination:not(:disabled)')?.focus()
    return () => clearTimeout(timer.current)
  }, [])
  return <div ref={root} className={`travel-map${moving ? ' is-moving' : ''}`} aria-label="移動マップ" onKeyDown={event => {
    if (event.key === 'Escape' && !moving) { event.preventDefault(); onBack() }
  }}>
    <header><div><h1>移動先を選択</h1><p>西新宿周辺</p></div><button type="button" disabled={moving} onClick={onBack}>× 戻る</button></header>
    <div className="travel-body">
      <nav className="travel-canvas" aria-label="地図の移動先">
        <div ref={viewport} className="travel-map-viewport"><div className="travel-map-surface" style={mapSize}>
          <img className="travel-map-image" src={travelMapImage} alt="西新宿周辺の地図" width={travelMapDefinition.asset.width} height={travelMapDefinition.asset.height} />
        {mappedPlaces.map(place => <button key={place.id} type="button"
          className={`travel-destination travel-pin${place.id === current ? ' current' : ''}`} style={{ left: `${place.point.left}%`, top: `${place.point.top}%` }}
          disabled={moving} aria-pressed={selected === place.id} aria-label={`${place.name}${place.id === current ? '（現在地）' : 'を選択'}`}
          onClick={() => setSelected(place.id)}><span aria-hidden="true">●</span><span className="travel-pin-label">{place.name}{place.id === current && <small>現在地</small>}</span></button>)}
        </div></div>
      </nav>
      <aside aria-label="選択した場所">{place ? <>
        <h2>{place.name}</h2><img src={resolveBackground(place.background).imageSrc} alt={place.name} /><p>{place.description}</p>
        <button type="button" disabled={moving || selected === current} onClick={() => {
          if (moving || selected === current) return
          setMoving(true)
          timer.current = setTimeout(() => onMove(place.id), 300)
        }}>{selected === current ? '現在地' : 'ここへ移動 ›'}</button>
      </> : <><h2>行き先を選択</h2><p>地図のピンを選ぶと、場所の情報が表示されます。</p></>}</aside>
    </div>
    {moving && <div className="travel-fade" role="status">移動中</div>}
  </div>
}
