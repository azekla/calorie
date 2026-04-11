export function formatDate(value) {
  return new Date(value).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}

export function todayString() {
  return new Date().toISOString().slice(0, 10)
}

export function mealLabel(key) {
  return key?.charAt(0).toUpperCase() + key?.slice(1)
}
