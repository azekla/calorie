import { useEffect, useState } from 'react'
import ThemePicker from '../components/ThemePicker'
import { api } from '../api/client'
import { useAsyncData } from '../hooks/useAsyncData'
import { useAuth } from '../context/AuthContext'

export default function ProfilePage() {
  const { refresh } = useAuth()
  const { data, loading, error, reload } = useAsyncData(() => api.get('/profile'), [])
  const [canIEat, setCanIEat] = useState(null)
  const [formState, setFormState] = useState(null)

  useEffect(() => {
    if (!data) return
    setFormState({
      name: data.user.name,
      gender: data.profile.gender,
      heightCm: data.profile.heightCm,
      weightKg: data.profile.weightKg,
      age: data.profile.age,
      activityLevel: data.profile.activityLevel,
      goalType: data.profile.goalType,
      manualCalorieGoalEnabled: data.profile.manualCalorieGoalEnabled,
      dailyCalorieGoal: data.profile.dailyCalorieGoal,
      waterGoalMl: data.profile.waterGoalMl,
      stepsGoal: data.profile.stepsGoal,
      theme: data.user.theme,
    })
  }, [data])

  if (loading) return <div className="card">Загружаем профиль...</div>
  if (error) return <div className="error-box">{error}</div>
  if (!formState) return null

  const updateField = (name, value) => setFormState((prev) => ({ ...prev, [name]: value }))

  const save = async (event) => {
    event.preventDefault()
    await api.put('/profile', {
      user: {
        name: formState.name,
        theme: formState.theme,
      },
      profile: {
        gender: formState.gender,
        heightCm: Number(formState.heightCm),
        weightKg: Number(formState.weightKg),
        age: Number(formState.age),
        activityLevel: formState.activityLevel,
        goalType: formState.goalType,
        manualCalorieGoalEnabled: formState.manualCalorieGoalEnabled,
        dailyCalorieGoal: Number(formState.dailyCalorieGoal),
        waterGoalMl: Number(formState.waterGoalMl),
        stepsGoal: Number(formState.stepsGoal),
      },
    })
    await Promise.all([reload(), refresh()])
    alert('Профиль обновлён')
  }

  const askCanIEat = async () => {
    const calories = window.prompt('Сколько калорий в продукте?')
    if (!calories) return
    const result = await api.post('/stats/can-i-eat', { calories: Number(calories) })
    setCanIEat(result)
  }

  const recommendedCalories = data.recommendedCalories
  const activeCalories = formState.manualCalorieGoalEnabled ? Number(formState.dailyCalorieGoal || 0) : recommendedCalories

  return (
    <div className="page-stack two-columns">
      <form className="card grid-form" onSubmit={save}>
        <p className="eyebrow">Профиль</p>
        <h2>Твой красивый pink-space</h2>
        <p className="muted-text">Настрой цели, личные параметры и любимую тему приложения.</p>
        <div className="form-grid-2">
          <label className="field-label">
            <span>Имя</span>
            <input value={formState.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Имя" />
          </label>
          <label className="field-label">
            <span>Пол</span>
            <select value={formState.gender} onChange={(e) => updateField('gender', e.target.value)}>
              <option value="женский">Женский</option>
              <option value="мужской">Мужской</option>
            </select>
          </label>
          <label className="field-label">
            <span>Рост</span>
            <input type="number" value={formState.heightCm} onChange={(e) => updateField('heightCm', e.target.value)} placeholder="Рост" />
          </label>
          <label className="field-label">
            <span>Вес</span>
            <input type="number" step="0.1" value={formState.weightKg} onChange={(e) => updateField('weightKg', e.target.value)} placeholder="Вес" />
          </label>
          <label className="field-label">
            <span>Возраст</span>
            <input type="number" value={formState.age} onChange={(e) => updateField('age', e.target.value)} placeholder="Возраст" />
          </label>
          <label className="field-label">
            <span>Активность</span>
            <select value={formState.activityLevel} onChange={(e) => updateField('activityLevel', e.target.value)}>
              {data.activityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </div>

        <div className="calculator-card">
          <div className="row-space calculator-head">
            <div>
              <strong>Цель и калории</strong>
              <span className="muted-text">Выбери цель из списка, посмотри рекомендацию и при желании задай свою норму на день.</span>
            </div>
          </div>
          <div className="form-grid-2">
            <label className="field-label">
              <span>Цель</span>
              <select value={formState.goalType} onChange={(e) => updateField('goalType', e.target.value)}>
                {data.goalOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label className="field-label">
              <span>Рекомендуемая норма</span>
              <input value={`${recommendedCalories} ккал`} disabled />
            </label>
            <label className="field-label field-span-2">
              <span>Активная дневная цель</span>
              <input type="number" value={formState.manualCalorieGoalEnabled ? formState.dailyCalorieGoal : activeCalories} onChange={(e) => updateField('dailyCalorieGoal', e.target.value)} disabled={!formState.manualCalorieGoalEnabled} />
            </label>
          </div>
          <label className="check-row"><input type="checkbox" checked={formState.manualCalorieGoalEnabled} onChange={(e) => updateField('manualCalorieGoalEnabled', e.target.checked)} /> Хочу задать норму калорий вручную</label>
        </div>

        <div className="form-grid-2">
          <label className="field-label">
            <span>Цель воды</span>
            <input type="number" value={formState.waterGoalMl} onChange={(e) => updateField('waterGoalMl', e.target.value)} placeholder="Цель воды" />
          </label>
          <label className="field-label">
            <span>Цель шагов</span>
            <input type="number" value={formState.stepsGoal} onChange={(e) => updateField('stepsGoal', e.target.value)} placeholder="Цель шагов" />
          </label>
        </div>
        <ThemePicker value={formState.theme} onChange={(theme) => updateField('theme', theme)} />
        <button className="primary-button" type="submit">Сохранить профиль</button>
      </form>

      <section className="page-stack">
        <div className="card">
          <p className="eyebrow">Можно ли мне это съесть?</p>
          <h3>Мини-калькулятор остатка</h3>
          <button className="primary-button" onClick={askCanIEat}>Проверить продукт</button>
          {canIEat && (
            <div className="summary-line">
              <strong>{canIEat.fit ? 'Да' : 'Лучше не сейчас'}</strong>
              <p>{canIEat.message}</p>
            </div>
          )}
        </div>
        <div className="card">
          <p className="eyebrow">Оформление</p>
          <p className="muted-text">Три мягкие темы внутри одного стиля: soft pink, sakura pink и strawberry milk.</p>
        </div>
      </section>
    </div>
  )
}
