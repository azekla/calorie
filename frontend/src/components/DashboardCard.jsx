export default function DashboardCard({ title, value, subtitle, children, className = '' }) {
  return (
    <section className={`card dashboard-card ${className}`}>
      <div className="card-head">
        <p className="eyebrow">{title}</p>
        {value && <h3 className="card-value">{value}</h3>}
      </div>
      {subtitle && <p className="muted-text">{subtitle}</p>}
      {children}
    </section>
  )
}
