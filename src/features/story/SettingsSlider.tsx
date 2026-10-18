import { useId } from 'react'
import { displayText } from './displayText'
export function SettingsSlider({ label, value, maximum, labels, onChange }: {
  label: string; value: number; maximum: number; labels?: readonly string[]; onChange: (value: number) => void
}) {
  const id = useId()
  const text = (point: number) => displayText(labels?.[point] ?? `${point}%`)
  return <div className="slider-setting">
    <label htmlFor={id}>{displayText(label)}<output>{text(value)}</output></label>
    <input id={id} aria-label={label} type="range" min={0} max={maximum} step={1} value={value}
      aria-valuetext={text(value)} onChange={event => onChange(Number(event.target.value))} />
    {labels && <div className="slider-stops">{Array.from({ length: maximum + 1 }, (_, point) => <button key={point} type="button"
      aria-label={`${displayText(label)}：${text(point)}`} aria-pressed={point === value} onClick={() => onChange(point)}>
      <span aria-hidden="true">●</span>{labels && <small>{text(point)}</small>}
    </button>)}</div>}
  </div>
}
