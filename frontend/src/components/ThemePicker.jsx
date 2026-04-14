const themes = [
  ['soft-pink', 'Мягкий розовый'],
  ['sakura-pink', 'Сакура'],
  ['strawberry-milk', 'Клубничное молоко'],
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
