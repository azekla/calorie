export function getTelegramWebApp() {
  if (typeof window === 'undefined') return null
  return window.Telegram?.WebApp || null
}

export function isTelegramWebApp() {
  return Boolean(getTelegramWebApp())
}

export function initTelegramWebApp() {
  const app = getTelegramWebApp()
  if (!app) return null
  app.ready()
  app.expand()
  return app
}

export function getTelegramInitData() {
  const app = initTelegramWebApp()
  return app?.initData || ''
}
