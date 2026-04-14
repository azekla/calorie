import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    try {
      setError('')
      await login(form)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <p className="eyebrow">Вход</p>
        <h1>Pink diary</h1>
        <p className="muted-text" style={{ marginTop: 4 }}>Калории, БЖУ и дневник в одном месте.</p>
        <form className="grid-form" style={{ marginTop: 16 }} onSubmit={submit}>
          <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} required autoComplete="email" />
          <input type="password" placeholder="Пароль" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} required autoComplete="current-password" />
          {error && <div className="error-box">{error}</div>}
          <button className="primary-button" type="submit">Войти</button>
        </form>
        <p className="muted-text" style={{ marginTop: 12 }}>Нет аккаунта? <Link to="/register">Создать</Link></p>
      </div>
    </div>
  )
}
