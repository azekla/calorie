import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function calculateRecommendedCalories(gender, weightKg, heightCm, age, activityLevel, goalType) {
  if (weightKg <= 0 || heightCm <= 0 || age <= 0) return 2000

  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age
  bmr += gender === 'женский' ? -161 : 5

  let multiplier = 1.2
  if (activityLevel === 'низкая') multiplier = 1.375
  if (activityLevel === 'умеренная') multiplier = 1.55
  if (activityLevel === 'высокая') multiplier = 1.725

  let calories = bmr * multiplier
  if (goalType === 'lose') calories -= 300
  if (goalType === 'gain') calories += 250

  return Math.round(calories)
}

export default function RegisterPage() {
  const { register } = useAuth()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    gender: 'женский',
    heightCm: 165,
    weightKg: 58,
    age: 24,
    activityLevel: 'умеренная',
    goalType: 'maintain',
    manualCalorieGoalEnabled: false,
    dailyCalorieGoal: 2000,
  })
  const [error, setError] = useState('')

  const recommendedCalories = useMemo(() => calculateRecommendedCalories(
    form.gender,
    Number(form.weightKg),
    Number(form.heightCm),
    Number(form.age),
    form.activityLevel,
    form.goalType,
  ), [form.activityLevel, form.age, form.gender, form.goalType, form.heightCm, form.weightKg])

  const submit = async (event) => {
    event.preventDefault()
    try {
      setError('')
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        profile: {
          gender: form.gender,
          heightCm: Number(form.heightCm),
          weightKg: Number(form.weightKg),
          age: Number(form.age),
          activityLevel: form.activityLevel,
          goalType: form.goalType,
          manualCalorieGoalEnabled: form.manualCalorieGoalEnabled,
          dailyCalorieGoal: form.manualCalorieGoalEnabled ? Number(form.dailyCalorieGoal) : recommendedCalories,
        },
      })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="auth-page theme-soft-pink">
      <div className="auth-card auth-card-wide card soft-glow">
        <p className="eyebrow">Новый профиль</p>
        <h1>Настрой дневник сразу под себя</h1>
        <p className="muted-text">Сначала вводишь параметры тела, затем приложение сразу подсказывает норму калорий и открывает дневник.</p>
        <form className="grid-form" onSubmit={submit}>
          <div className="form-grid-2">
            <label className="field-label">
              <span>Имя</span>
              <input placeholder="Имя" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
            </label>
            <label className="field-label">
              <span>Email</span>
              <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
            </label>
            <label className="field-label field-span-2">
              <span>Пароль</span>
              <input type="password" placeholder="Пароль" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} />
            </label>
          </div>

          <div className="calculator-card">
            <div>
              <strong>Параметры тела</strong>
              <p className="muted-text">По этим данным считаем твою базовую дневную норму калорий.</p>
            </div>
            <div className="form-grid-2">
              <label className="field-label">
                <span>Пол</span>
                <select value={form.gender} onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value }))}>
                  <option value="женский">Женский</option>
                  <option value="мужской">Мужской</option>
                </select>
              </label>
              <label className="field-label">
                <span>Активность</span>
                <select value={form.activityLevel} onChange={(e) => setForm((prev) => ({ ...prev, activityLevel: e.target.value }))}>
                  <option value="низкая">Низкая активность</option>
                  <option value="умеренная">Умеренная активность</option>
                  <option value="высокая">Высокая активность</option>
                </select>
              </label>
              <label className="field-label">
                <span>Рост</span>
                <input type="number" min="1" value={form.heightCm} onChange={(e) => setForm((prev) => ({ ...prev, heightCm: e.target.value }))} />
              </label>
              <label className="field-label">
                <span>Вес</span>
                <input type="number" min="1" step="0.1" value={form.weightKg} onChange={(e) => setForm((prev) => ({ ...prev, weightKg: e.target.value }))} />
              </label>
              <label className="field-label">
                <span>Возраст</span>
                <input type="number" min="1" value={form.age} onChange={(e) => setForm((prev) => ({ ...prev, age: e.target.value }))} />
              </label>
              <label className="field-label">
                <span>Цель</span>
                <select value={form.goalType} onChange={(e) => setForm((prev) => ({ ...prev, goalType: e.target.value }))}>
                  <option value="lose">Похудение</option>
                  <option value="maintain">Поддержание</option>
                  <option value="gain">Набор массы</option>
                </select>
              </label>
            </div>
            <div className="macro-row">
              <div className="macro-pill result-pill"><span>Рекомендация</span><strong>{recommendedCalories} ккал</strong></div>
              <div className="macro-pill result-pill"><span>Режим</span><strong>{form.manualCalorieGoalEnabled ? 'Ручная цель' : 'Авторасчет'}</strong></div>
            </div>
            <label className="check-row"><input type="checkbox" checked={form.manualCalorieGoalEnabled} onChange={(e) => setForm((prev) => ({ ...prev, manualCalorieGoalEnabled: e.target.checked, dailyCalorieGoal: e.target.checked ? prev.dailyCalorieGoal : recommendedCalories }))} /> Хочу задать норму калорий вручную</label>
            {form.manualCalorieGoalEnabled && (
              <label className="field-label">
                <span>Своя норма калорий</span>
                <input type="number" min="1" value={form.dailyCalorieGoal} onChange={(e) => setForm((prev) => ({ ...prev, dailyCalorieGoal: e.target.value }))} />
              </label>
            )}
          </div>

          <button className="primary-button" type="submit">Создать аккаунт</button>
          {error && <div className="error-box">{error}</div>}
        </form>
        <p className="muted-text">Уже есть вход? <Link to="/login">Вернуться на логин</Link></p>
      </div>
    </div>
  )
}
