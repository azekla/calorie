import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    try {
      setError('')
      await register(form)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="auth-page theme-soft-pink">
      <div className="auth-card card soft-glow">
        <p className="eyebrow">Новый профиль</p>
        <h1>Создай своё cute-space</h1>
        <p className="muted-text">После регистрации ты сразу попадёшь в готовый pink dashboard с мягкой навигацией и красивыми карточками.</p>
        <form className="grid-form" onSubmit={submit}>
          <input placeholder="Имя" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
          <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
          <input type="password" placeholder="Пароль" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} />
          <button className="primary-button" type="submit">Создать аккаунт</button>
          {error && <div className="error-box">{error}</div>}
        </form>
        <p className="muted-text">Уже есть вход? <Link to="/login">Вернуться на логин</Link></p>
      </div>
    </div>
  )
}
