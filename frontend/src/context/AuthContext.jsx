import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')

  const loadUser = async () => {
    try {
      const data = await api.get('/auth/me')
      setUser(data)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUser()
  }, [])

  const login = async (payload) => {
    const data = await api.post('/auth/login', payload)
    setUser(data)
    setNotice('С возвращением, котёнок.')
  }

  const register = async (payload) => {
    const data = await api.post('/auth/register', payload)
    setUser(data)
    setNotice('Профиль создан. Всё готово к красивому старту.')
  }

  const logout = async () => {
    await api.post('/auth/logout', {})
    setUser(null)
    setNotice('До встречи. Возвращайся за мягким балансом.')
  }

  const value = useMemo(() => ({ user, setUser, loading, login, register, logout, notice, setNotice, refresh: loadUser }), [user, loading, notice])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
