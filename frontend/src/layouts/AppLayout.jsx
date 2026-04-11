import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  ['diary', 'Дневник'],
  ['history', 'История'],
  ['profile', 'Профиль'],
]

export default function AppLayout() {
  const { user, logout, notice, setNotice } = useAuth()

  return (
    <div className={`app-shell theme-${user?.theme || 'soft-pink'}`}>
      <aside className="sidebar card soft-glow">
        <div className="brand-mark">
          <div className="brand-bow">♡</div>
          <div>
            <p className="eyebrow">TG Calorie</p>
            <h1>Pink diary</h1>
          </div>
        </div>
        <div className="profile-chip">
          <strong>{user?.name}</strong>
          <span>{user?.email}</span>
        </div>
        <nav className="nav-list">
          {links.map(([to, label]) => (
            <NavLink key={to} to={`/${to}`} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-note">
          <strong>Только главное</strong>
          <span>Дневник, история и профиль без лишних вкладок и перегруза.</span>
        </div>
        <button className="ghost-button" onClick={logout}>Выйти</button>
      </aside>
      <main className="main-content">
        {notice && (
          <div className="notice-banner" onClick={() => setNotice('')}>
            {notice}
          </div>
        )}
        <Outlet />
      </main>
    </div>
  )
}
