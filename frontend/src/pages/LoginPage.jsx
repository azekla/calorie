import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const [form, setForm] = useState({ email: 'demo@tgcalorie.local', password: 'demo12345' })
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
    <div className="auth-page theme-strawberry-milk">
      <div className="auth-card card soft-glow">
        <p className="eyebrow">Добро пожаловать</p>
        <h1>TG Calorie</h1>
        <p className="muted-text">Минималистичный pink-дневник калорий для обычного сайта с дневником, историей и профилем.</p>
        <div className="auth-badge-row">
          <span className="badge-pill">дневник</span>
          <span className="badge-pill">история</span>
          <span className="badge-pill">профиль</span>
        </div>
        <form className="grid-form" onSubmit={submit}>
          <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
          <input type="password" placeholder="Пароль" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} />
          <button className="primary-button" type="submit">Войти</button>
          {error && <div className="error-box">{error}</div>}
        </form>
        <p className="muted-text">Нет профиля? <Link to="/register">Создать аккаунт</Link></p>
      </div>
    </div>
  )
}
