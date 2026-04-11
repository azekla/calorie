import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import AppLayout from './layouts/AppLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import DiaryPage from './pages/DiaryPage'
import FavoritesPage from './pages/FavoritesPage'
import MealsPage from './pages/MealsPage'
import HistoryPage from './pages/HistoryPage'
import ProgressPage from './pages/ProgressPage'
import ProfilePage from './pages/ProfilePage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="screen-center">Загружаем розовую магию...</div>
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="screen-center">Загружаем...</div>
  return user ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="diary" element={<DiaryPage />} />
        <Route path="favorites" element={<FavoritesPage />} />
        <Route path="meals" element={<MealsPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  )
}
