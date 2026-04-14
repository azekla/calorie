import { useEffect } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  ['diary', 'Дневник'],
  ['history', 'История'],
  ['profile', 'Профиль'],
]

const icons = {
  diary: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      <line x1="8" y1="7" x2="16" y2="7"/>
      <line x1="8" y1="11" x2="13" y2="11"/>
    </svg>
  ),
  history: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  profile: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
}

export default function AppLayout() {
  const { user, logout, notice, setNotice } = useAuth()

  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(''), 3000)
    return () => clearTimeout(timer)
  }, [notice, setNotice])

  return (
    <div className={`app-shell theme-${user?.theme || 'soft-pink'}`}>
      <header className="top-bar">
        <div className="top-bar-left">
          <div className="top-bar-brand">
            <div className="brand-icon">♡</div>
            <span>Pink diary</span>
          </div>
          <nav className="top-bar-nav">
            {links.map(([to, label]) => (
              <NavLink key={to} to={`/${to}`} className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}>
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="top-bar-right">
          <span className="top-bar-user">{user?.name}</span>
          <button className="top-bar-logout" onClick={logout}>Выйти</button>
        </div>
      </header>
      <main className="main-content">
        {notice && (
          <div className="notice-banner" onClick={() => setNotice('')}>
            {notice}
          </div>
        )}
        <Outlet />
      </main>
      <nav className="bottom-nav">
        {links.map(([to, label]) => (
          <NavLink key={to} to={`/${to}`} className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
            {icons[to]}
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
