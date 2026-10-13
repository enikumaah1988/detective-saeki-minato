import { useEffect, useRef, useState } from 'react'
import type { Choice } from '../../types/scenario'
import { resolveBackground } from '../../data/presentation'

const places = [
  { id: 'office', name: '佐伯探偵事務所', x: 66, y: 69, background: 'office-before-noon', description: '西新宿七丁目。あかりから兄の捜索依頼を受けた事務所。' },
  { id: 'company', name: '東成ビルサービス', x: 35, y: 39, background: 'company-reception', description: '直人の勤務先。最後の出勤状況と、会社に残る記録を確認する。' },
  { id: 'building', name: '成子坂共同ビル', x: 20, y: 23, background: 'building-entrance', description: '取り壊しを控えた旧ビル。管理人への確認と、残された記録の調査を行う。' },
  { id: 'police', name: '西新宿警察署', x: 80, y: 28, background: 'police-exterior', description: '奥村・瀬川に面会し、過去の出来事と調査で分かったことを確認する。' },
]

export function TravelMap({ options, current, onBack, onMove }: { options: Choice[]; current: string; onBack: () => void; onMove: (id: string) => void }) {
  const [selected, setSelected] = useState<string>()
  const [moving, setMoving] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const root = useRef<HTMLDivElement>(null)
  const place = places.find(place => place.id === selected)
  useEffect(() => {
    root.current?.querySelector<HTMLButtonElement>('.travel-pin:not(:disabled)')?.focus()
    return () => clearTimeout(timer.current)
  }, [])
  return <div ref={root} className={`travel-map${moving ? ' is-moving' : ''}`} aria-label="移動マップ" onKeyDown={event => {
    if (event.key === 'Escape' && !moving) { event.preventDefault(); onBack() }
  }}>
    <header><div><h1>移動先を選ぶ</h1><p>西新宿 · 今回の訪問先</p></div><button type="button" disabled={moving} onClick={onBack}>× 戻る</button></header>
    <div className="travel-body">
      <nav className="travel-canvas" aria-label="地図の移動先">
        <svg viewBox="0 0 900 650" preserveAspectRatio="none" aria-hidden="true">
          <rect width="900" height="650" fill="#19262c" />
          <g fill="#25373c" stroke="#34484c" strokeWidth="2">{Array.from({ length: 30 }, (_, i) => <rect key={i} x={30 + (i % 6) * 145} y={20 + Math.floor(i / 6) * 125} width="110" height="85" rx="6" />)}</g>
          <g fill="none" stroke="#77877f" strokeWidth="14"><path d="M0 140L900 440M540 0L310 650M0 530L900 150" /></g>
          <g fill="none" stroke="#34494b" strokeWidth="4"><path d="M0 140L900 440M540 0L310 650M0 530L900 150" /></g>
          <g fill="#95a69d" fontSize="22"><text x="85" y="595">西新宿八丁目</text><text x="630" y="590">西新宿七丁目</text><text x="645" y="90">新宿駅方面 →</text></g>
        </svg>
        {places.filter(place => place.id === current || options.some(option => option.id === place.id)).map(place => <button key={place.id} type="button"
          className={`travel-pin${place.id === current ? ' current' : ''}`} style={{ left: `${place.x}%`, top: `${place.y}%` }}
          disabled={moving} aria-pressed={selected === place.id} aria-label={`${place.name}${place.id === current ? '（現在地）' : 'を選択'}`}
          onClick={() => setSelected(place.id)}><span aria-hidden="true">●</span>{place.name}{place.id === current && <small>現在地</small>}</button>)}
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
    <footer>現在地：{places.find(place => place.id === current)?.name}<span>調査エリア案内図</span></footer>
    {moving && <div className="travel-fade" role="status">移動中</div>}
  </div>
}
