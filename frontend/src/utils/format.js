export function formatDate(value) {
  return new Date(value + 'T00:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}

export function todayString() {
  return new Date().toISOString().slice(0, 10)
}
