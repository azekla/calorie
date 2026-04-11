import { useMemo, useState } from 'react'

const blankItem = { name: '', grams: 100, calories: 0, protein: 0, fat: 0, carbs: 0 }

export default function MealBuilder({ onSave }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [items, setItems] = useState([{ ...blankItem }])

  const totals = useMemo(() => items.reduce((acc, item) => ({
    calories: acc.calories + Number(item.calories || 0),
    protein: acc.protein + Number(item.protein || 0),
    fat: acc.fat + Number(item.fat || 0),
    carbs: acc.carbs + Number(item.carbs || 0),
  }), { calories: 0, protein: 0, fat: 0, carbs: 0 }), [items])

  const updateItem = (index, field, value) => {
    setItems((prev) => prev.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item))
  }

  const addRow = () => setItems((prev) => [...prev, { ...blankItem }])

  const handleSubmit = async (event) => {
    event.preventDefault()
    await onSave({
      name,
      description,
      items: items.map((item) => ({
        ...item,
        grams: Number(item.grams),
        calories: Number(item.calories),
        protein: Number(item.protein),
        fat: Number(item.fat),
        carbs: Number(item.carbs),
      })).filter((item) => item.name),
    })
    setName('')
    setDescription('')
    setItems([{ ...blankItem }])
  }

  return (
    <form className="card meal-builder" onSubmit={handleSubmit}>
      <p className="eyebrow">Конструктор блюда</p>
      <h3>Собери шаблон из нескольких ингредиентов</h3>
      <p className="muted-text">Подходит для завтраков, боулов, тостов и любых блюд, которые удобно повторять.</p>
      <input placeholder="Название блюда" value={name} onChange={(e) => setName(e.target.value)} required />
      <textarea placeholder="Описание или настроение блюда" value={description} onChange={(e) => setDescription(e.target.value)} />
      <div className="ingredient-list">
        {items.map((item, index) => (
          <div key={index} className="ingredient-row">
            <input placeholder="Ингредиент" value={item.name} onChange={(e) => updateItem(index, 'name', e.target.value)} />
            <input type="number" min="0" placeholder="г" value={item.grams} onChange={(e) => updateItem(index, 'grams', e.target.value)} />
            <input type="number" min="0" placeholder="ккал" value={item.calories} onChange={(e) => updateItem(index, 'calories', e.target.value)} />
            <input type="number" min="0" placeholder="Б" value={item.protein} onChange={(e) => updateItem(index, 'protein', e.target.value)} />
            <input type="number" min="0" placeholder="Ж" value={item.fat} onChange={(e) => updateItem(index, 'fat', e.target.value)} />
            <input type="number" min="0" placeholder="У" value={item.carbs} onChange={(e) => updateItem(index, 'carbs', e.target.value)} />
          </div>
        ))}
      </div>
      <div className="row-actions">
        <button className="ghost-button accent-soft" type="button" onClick={addRow}>+ ингредиент</button>
        <div className="totals-chip">Итого: {totals.calories.toFixed(0)} ккал / Б {totals.protein.toFixed(1)} / Ж {totals.fat.toFixed(1)} / У {totals.carbs.toFixed(1)}</div>
      </div>
      <button className="primary-button" type="submit">Сохранить шаблон</button>
    </form>
  )
}
