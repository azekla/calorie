import { useEffect, useState } from 'react'
import DatePicker from './DatePicker'
import { todayString } from '../utils/format'

const defaultState = {
  name: '',
  calories: '',
  protein: '',
  fat: '',
  carbs: '',
  grams: 100,
  mealCategory: 'завтрак',
  entryDate: todayString(),
  isSweet: false,
  notes: '',
}

function createDefaultState(entryDate) {
  return { ...defaultState, entryDate: entryDate || todayString() }
}

function normalizePayload(form) {
  return {
    ...form,
    calories: Number(form.calories),
    protein: Number(form.protein),
    fat: Number(form.fat),
    carbs: Number(form.carbs),
    grams: Number(form.grams),
  }
}

export default function FoodEntryForm({ initialValue, defaultDate, onSubmit, onSaveTemplate, submitLabel = 'Сохранить' }) {
  const [form, setForm] = useState(defaultState)
  const [showMore, setShowMore] = useState(false)
  const [showCalc, setShowCalc] = useState(false)
  const [calc, setCalc] = useState({
    per100Calories: '',
    per100Protein: '',
    per100Fat: '',
    per100Carbs: '',
    consumedGrams: 20,
  })

  const canSubmit = form.name.trim() !== '' && Number(form.calories) > 0 && form.entryDate !== ''

  const calculatedValues = {
    calories: Number(calc.per100Calories || 0) * Number(calc.consumedGrams || 0) / 100,
    protein: Number(calc.per100Protein || 0) * Number(calc.consumedGrams || 0) / 100,
    fat: Number(calc.per100Fat || 0) * Number(calc.consumedGrams || 0) / 100,
    carbs: Number(calc.per100Carbs || 0) * Number(calc.consumedGrams || 0) / 100,
  }

  useEffect(() => {
    setForm(initialValue ? { ...createDefaultState(defaultDate), ...initialValue, entryDate: initialValue.entryDate?.slice(0, 10) || defaultDate || todayString() } : createDefaultState(defaultDate))
    setCalc({
      per100Calories: '',
      per100Protein: '',
      per100Fat: '',
      per100Carbs: '',
      consumedGrams: initialValue?.grams || 20,
    })
    if (initialValue) setShowMore(true)
  }, [defaultDate, initialValue])

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    await onSubmit(normalizePayload(form))
    if (!initialValue) {
      setForm(createDefaultState(defaultDate))
      setShowMore(false)
    }
  }

  const handleCalcChange = (event) => {
    const { name, value } = event.target
    setCalc((prev) => ({ ...prev, [name]: value }))
  }

  const applyCalculatedValues = () => {
    setForm((prev) => ({
      ...prev,
      grams: Number(calc.consumedGrams || 0),
      calories: calculatedValues.calories.toFixed(1),
      protein: calculatedValues.protein.toFixed(1),
      fat: calculatedValues.fat.toFixed(1),
      carbs: calculatedValues.carbs.toFixed(1),
    }))
  }

  const saveTemplate = async () => {
    if (!onSaveTemplate || !canSubmit) return
    await onSaveTemplate(normalizePayload(form))
  }

  return (
    <form className="grid-form" onSubmit={handleSubmit}>
      {/* === QUICK MODE: name + calories + submit === */}
      <div className="quick-entry-row">
        <input name="name" placeholder="Что съел(а)?" value={form.name} onChange={handleChange} required className="quick-entry-name" />
        <input name="calories" type="number" min="0" step="0.1" placeholder="ккал" value={form.calories} onChange={handleChange} required className="quick-entry-kcal" />
        <button className="primary-button quick-entry-btn" type="submit" disabled={!canSubmit}>{submitLabel}</button>
      </div>

      {/* === EXPAND TOGGLE === */}
      <button type="button" className="calculator-toggle" onClick={() => setShowMore(!showMore)}>
        <span className={`toggle-icon ${showMore ? 'open' : ''}`}>&#9662;</span>
        Дополнительно
      </button>

      {/* === EXPANDED FIELDS === */}
      {showMore && (
        <div className="grid-form">
          <div className="form-grid-2">
            <label className="field-label">
              <span>Категория</span>
              <select name="mealCategory" value={form.mealCategory} onChange={handleChange}>
                <option value="завтрак">Завтрак</option>
                <option value="обед">Обед</option>
                <option value="ужин">Ужин</option>
                <option value="перекус">Перекус</option>
                <option value="напитки">Напитки</option>
                <option value="сладкое">Сладкое</option>
              </select>
            </label>
            <label className="field-label">
              <span>Граммы</span>
              <input name="grams" type="number" min="0" step="1" placeholder="100" value={form.grams} onChange={handleChange} />
            </label>
            <label className="field-label">
              <span>Белки</span>
              <input name="protein" type="number" min="0" step="0.1" placeholder="0" value={form.protein} onChange={handleChange} />
            </label>
            <label className="field-label">
              <span>Жиры</span>
              <input name="fat" type="number" min="0" step="0.1" placeholder="0" value={form.fat} onChange={handleChange} />
            </label>
            <label className="field-label">
              <span>Углеводы</span>
              <input name="carbs" type="number" min="0" step="0.1" placeholder="0" value={form.carbs} onChange={handleChange} />
            </label>
            <label className="field-label">
              <span>Дата</span>
              <DatePicker name="entryDate" value={form.entryDate} onChange={handleChange} />
            </label>
          </div>
          <label className="field-label">
            <span>Заметка</span>
            <textarea name="notes" placeholder="Комментарий" value={form.notes} onChange={handleChange} rows={2} />
          </label>
          <label className="check-row"><input name="isSweet" type="checkbox" checked={form.isSweet} onChange={handleChange} /> Это сладкое</label>

          {/* === CALCULATOR === */}
          <button type="button" className="calculator-toggle" onClick={() => setShowCalc(!showCalc)}>
            <span className={`toggle-icon ${showCalc ? 'open' : ''}`}>&#9662;</span>
            Калькулятор по 100 г
          </button>

          {showCalc && (
            <div className="calculator-card">
              <div className="calculator-head">
                <p className="muted-text" style={{ margin: 0, fontSize: 13 }}>Значения на 100 г + вес порции = точные калории.</p>
                <button className="ghost-button accent-soft" type="button" onClick={applyCalculatedValues}>Подставить</button>
              </div>
              <div className="form-grid-2">
                <label className="field-label">
                  <span>Ккал / 100 г</span>
                  <input name="per100Calories" type="number" min="0" step="0.1" placeholder="250" value={calc.per100Calories} onChange={handleCalcChange} />
                </label>
                <label className="field-label">
                  <span>Съедено, г</span>
                  <input name="consumedGrams" type="number" min="0" step="1" placeholder="20" value={calc.consumedGrams} onChange={handleCalcChange} />
                </label>
                <label className="field-label">
                  <span>Белки / 100 г</span>
                  <input name="per100Protein" type="number" min="0" step="0.1" placeholder="0" value={calc.per100Protein} onChange={handleCalcChange} />
                </label>
                <label className="field-label">
                  <span>Жиры / 100 г</span>
                  <input name="per100Fat" type="number" min="0" step="0.1" placeholder="0" value={calc.per100Fat} onChange={handleCalcChange} />
                </label>
                <label className="field-label field-span-2">
                  <span>Углеводы / 100 г</span>
                  <input name="per100Carbs" type="number" min="0" step="0.1" placeholder="0" value={calc.per100Carbs} onChange={handleCalcChange} />
                </label>
              </div>
              <div className="macro-row compact-gap">
                <div className="macro-pill result-pill"><span>Итого</span><strong>{calculatedValues.calories.toFixed(1)} ккал</strong></div>
                <div className="macro-pill result-pill"><span>Б</span><strong>{calculatedValues.protein.toFixed(1)}</strong></div>
                <div className="macro-pill result-pill"><span>Ж</span><strong>{calculatedValues.fat.toFixed(1)}</strong></div>
                <div className="macro-pill result-pill"><span>У</span><strong>{calculatedValues.carbs.toFixed(1)}</strong></div>
              </div>
            </div>
          )}

          {onSaveTemplate && (
            <button className="ghost-button accent-soft" type="button" onClick={saveTemplate} disabled={!canSubmit} style={{ width: '100%' }}>Сохранить как шаблон</button>
          )}
        </div>
      )}
    </form>
  )
}
