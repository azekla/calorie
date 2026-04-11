const themes = [
  ['soft-pink', 'Soft pink'],
  ['sakura-pink', 'Sakura pink'],
  ['strawberry-milk', 'Strawberry milk'],
]

export default function ThemePicker({ value, onChange }) {
  return (
    <div className="theme-picker">
      {themes.map(([key, label]) => (
        <button key={key} type="button" className={`theme-swatch ${value === key ? 'active' : ''}`} onClick={() => onChange(key)}>
          <span className={`swatch-dot ${key}`} />
          {label}
        </button>
      ))}
    </div>
  )
}
