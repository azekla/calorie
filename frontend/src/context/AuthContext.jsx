import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'
import { getTelegramInitData, initTelegramWebApp, isTelegramWebApp } from '../utils/telegram'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')
  const [telegramMode, setTelegramMode] = useState(false)

  const loginWithTelegram = async () => {
    const initData = getTelegramInitData()
    if (!initData) throw new Error('Telegram Web App не передал данные для входа')
    const data = await api.post('/auth/telegram', { initData })
    setUser(data)
    setTelegramMode(true)
    setNotice('Вход через Telegram выполнен.')
    return data
  }

  const loadUser = async () => {
    const insideTelegram = isTelegramWebApp()
    setTelegramMode(insideTelegram)
    if (insideTelegram) {
      initTelegramWebApp()
    }
    try {
      const data = await api.get('/auth/me')
      setUser(data)
    } catch {
      if (insideTelegram) {
        try {
          await loginWithTelegram()
        } catch {
          setUser(null)
        }
      } else {
        setUser(null)
      }
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
  const extendedValue = useMemo(() => ({ ...value, telegramMode, loginWithTelegram }), [value, telegramMode])
  return <AuthContext.Provider value={extendedValue}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
