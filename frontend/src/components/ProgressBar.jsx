export default function ProgressBar({ value, label, accent = 'var(--pink-500)' }) {
  const safeValue = Math.max(0, Math.min(value, 100))
  return (
    <div className="progress-wrap">
      {label && <div className="progress-header"><span>{label}</span><strong>{safeValue.toFixed(0)}%</strong></div>}
      <div className="progress-track">
        <div className="progress-value" style={{ width: `${safeValue}%`, background: accent }} />
      </div>
    </div>
  )
}
