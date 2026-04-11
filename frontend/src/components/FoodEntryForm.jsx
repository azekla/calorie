import { useEffect, useState } from 'react'
import { todayString } from '../utils/format'

const defaultState = {
  name: '',
  calories: 0,
  protein: 0,
  fat: 0,
  carbs: 0,
  grams: 100,
  mealCategory: 'завтрак',
  entryDate: todayString(),
  isSweet: false,
  notes: '',
}

export default function FoodEntryForm({ initialValue, onSubmit, submitLabel = 'Сохранить' }) {
  const [form, setForm] = useState(defaultState)
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
    setForm(initialValue ? { ...defaultState, ...initialValue, entryDate: initialValue.entryDate?.slice(0, 10) || todayString() } : defaultState)
    setCalc({
      per100Calories: '',
      per100Protein: '',
      per100Fat: '',
      per100Carbs: '',
      consumedGrams: initialValue?.grams || 20,
    })
  }, [initialValue])

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    await onSubmit({
      ...form,
      calories: Number(form.calories),
      protein: Number(form.protein),
      fat: Number(form.fat),
      carbs: Number(form.carbs),
      grams: Number(form.grams),
    })
    if (!initialValue) setForm(defaultState)
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

  return (
    <form className="grid-form" onSubmit={handleSubmit}>
      <div className="form-hint-box panel-tint">
        <strong>Что обязательно заполнить</strong>
        <span>Название продукта, дату и калории. Остальные поля можно добавить для более точного БЖУ.</span>
      </div>

      <div className="calculator-card">
        <div className="row-space calculator-head">
          <div>
            <strong>Калькулятор блюда по 100 г</strong>
            <span className="muted-text">Например: блюдо 250 ккал на 100 г, а ты съел(а) 20 г. Мы сразу посчитаем точные калории.</span>
          </div>
          <button className="ghost-button accent-soft" type="button" onClick={applyCalculatedValues}>Подставить в форму</button>
        </div>
        <div className="form-grid-2">
          <label className="field-label">
            <span>Ккал на 100 г</span>
            <input name="per100Calories" type="number" min="0" step="0.1" placeholder="Например, 250" value={calc.per100Calories} onChange={handleCalcChange} />
          </label>
          <label className="field-label">
            <span>Съедено грамм</span>
            <input name="consumedGrams" type="number" min="0" step="1" placeholder="Например, 20" value={calc.consumedGrams} onChange={handleCalcChange} />
          </label>
          <label className="field-label">
            <span>Белки на 100 г</span>
            <input name="per100Protein" type="number" min="0" step="0.1" placeholder="0" value={calc.per100Protein} onChange={handleCalcChange} />
          </label>
          <label className="field-label">
            <span>Жиры на 100 г</span>
            <input name="per100Fat" type="number" min="0" step="0.1" placeholder="0" value={calc.per100Fat} onChange={handleCalcChange} />
          </label>
          <label className="field-label field-span-2">
            <span>Углеводы на 100 г</span>
            <input name="per100Carbs" type="number" min="0" step="0.1" placeholder="0" value={calc.per100Carbs} onChange={handleCalcChange} />
          </label>
        </div>
        <div className="macro-row compact-gap">
          <div className="macro-pill result-pill"><span>Получится</span><strong>{calculatedValues.calories.toFixed(1)} ккал</strong></div>
          <div className="macro-pill result-pill"><span>Белки</span><strong>{calculatedValues.protein.toFixed(1)} г</strong></div>
          <div className="macro-pill result-pill"><span>Жиры</span><strong>{calculatedValues.fat.toFixed(1)} г</strong></div>
          <div className="macro-pill result-pill"><span>Углеводы</span><strong>{calculatedValues.carbs.toFixed(1)} г</strong></div>
        </div>
      </div>

      <div className="form-grid-2">
        <label className="field-label">
          <span>Название продукта <b>*</b></span>
          <input name="name" placeholder="Например, банан или омлет" value={form.name} onChange={handleChange} required />
        </label>

        <label className="field-label">
          <span>Категория</span>
          <select name="mealCategory" value={form.mealCategory} onChange={handleChange}>
            <option>завтрак</option>
            <option>обед</option>
            <option>ужин</option>
            <option>перекус</option>
            <option>напитки</option>
            <option>сладкое</option>
          </select>
        </label>

        <label className="field-label">
          <span>Дата <b>*</b></span>
          <input name="entryDate" type="date" value={form.entryDate} onChange={handleChange} required />
        </label>

        <label className="field-label">
          <span>Вес / порция</span>
          <input name="grams" type="number" min="0" step="1" placeholder="Граммы" value={form.grams} onChange={handleChange} />
        </label>

        <label className="field-label">
          <span>Калории <b>*</b></span>
          <input name="calories" type="number" min="0" step="0.1" placeholder="Например, 120" value={form.calories} onChange={handleChange} required />
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
      </div>

      <label className="field-label">
        <span>Заметка</span>
        <textarea name="notes" placeholder="Например, домашняя порция или комментарий к блюду" value={form.notes} onChange={handleChange} />
      </label>
      <label className="check-row"><input name="isSweet" type="checkbox" checked={form.isSweet} onChange={handleChange} /> Это сладкое</label>
      <button className="submit-button" type="submit" disabled={!canSubmit}>{submitLabel}</button>
    </form>
  )
}
