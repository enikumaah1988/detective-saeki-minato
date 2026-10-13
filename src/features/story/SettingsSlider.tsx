import { useId } from 'react'
export function SettingsSlider({ label, value, maximum, labels, onChange }: {
  label: string; value: number; maximum: number; labels?: readonly string[]; onChange: (value: number) => void
}) {
  const id = useId()
  return <div className="slider-setting">
    <label htmlFor={id}>{label}<output>{labels?.[value] ?? `${value * 10}%`}</output></label>
    <input id={id} aria-label={label} type="range" min={0} max={maximum} step={1} value={value}
      aria-valuetext={labels?.[value] ?? `${value * 10}%`} onChange={event => onChange(Number(event.target.value))} />
    <div className="slider-stops">{Array.from({ length: maximum + 1 }, (_, point) => <button key={point} type="button"
      aria-label={`${label}：${labels?.[point] ?? `${point * 10}%`}`} aria-pressed={point === value} onClick={() => onChange(point)}>
      <span aria-hidden="true">●</span>{labels && <small>{labels[point]}</small>}
    </button>)}</div>
  </div>
}
