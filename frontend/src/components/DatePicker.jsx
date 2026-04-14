import { useEffect, useRef, useState } from 'react'

const MONTHS_RU = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
]

const WEEKDAYS_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

function parseDate(str) {
  return new Date(str + 'T00:00:00')
}

function formatYMD(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDisplay(str) {
  const date = parseDate(str)
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getCalendarDays(year, month) {
  const first = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0).getDate()
  let startWeekday = first.getDay()
  startWeekday = startWeekday === 0 ? 6 : startWeekday - 1

  const days = []
  const prevMonthLast = new Date(year, month, 0).getDate()
  for (let i = startWeekday - 1; i >= 0; i--) {
    days.push({ day: prevMonthLast - i, current: false, date: new Date(year, month - 1, prevMonthLast - i) })
  }
  for (let d = 1; d <= lastDay; d++) {
    days.push({ day: d, current: true, date: new Date(year, month, d) })
  }
  const remaining = 42 - days.length
  for (let d = 1; d <= remaining; d++) {
    days.push({ day: d, current: false, date: new Date(year, month + 1, d) })
  }
  return days
}

export default function DatePicker({ value, onChange, name }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = parseDate(value)
  const [viewYear, setViewYear] = useState(selected.getFullYear())
  const [viewMonth, setViewMonth] = useState(selected.getMonth())

  useEffect(() => {
    const d = parseDate(value)
    setViewYear(d.getFullYear())
    setViewMonth(d.getMonth())
  }, [value])

  useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1) }
    else setViewMonth(viewMonth - 1)
  }

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1) }
    else setViewMonth(viewMonth + 1)
  }

  const selectDay = (date) => {
    const ymd = formatYMD(date)
    onChange(name ? { target: { name, value: ymd } } : ymd)
    setOpen(false)
  }

  const days = getCalendarDays(viewYear, viewMonth)
  const todayStr = formatYMD(new Date())

  return (
    <div className="datepicker" ref={ref}>
      <button type="button" className="datepicker-trigger" onClick={() => setOpen(!open)}>
        <span>{formatDisplay(value)}</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M5.333 1.333v1.334M10.667 1.333v1.334M2 6h12M3.333 2.667h9.334c.736 0 1.333.597 1.333 1.333v9.333c0 .737-.597 1.334-1.333 1.334H3.333A1.333 1.333 0 0 1 2 13.333V4c0-.736.597-1.333 1.333-1.333Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      {open && (
        <>
          <div className="datepicker-overlay" onClick={() => setOpen(false)} />
          <div className="datepicker-dropdown">
            <div className="datepicker-header">
              <button type="button" className="datepicker-nav" onClick={prevMonth}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M8.75 3.5 5.25 7l3.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <span className="datepicker-title">{MONTHS_RU[viewMonth]} {viewYear}</span>
              <button type="button" className="datepicker-nav" onClick={nextMonth}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5.25 3.5 8.75 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
            <div className="datepicker-weekdays">
              {WEEKDAYS_RU.map((d) => <span key={d}>{d}</span>)}
            </div>
            <div className="datepicker-grid">
              {days.map((d, i) => {
                const ymd = formatYMD(d.date)
                const isSelected = ymd === value
                const isToday = ymd === todayStr
                return (
                  <button
                    key={i}
                    type="button"
                    className={`datepicker-day${d.current ? '' : ' other-month'}${isSelected ? ' selected' : ''}${isToday ? ' today' : ''}`}
                    onClick={() => selectDay(d.date)}
                  >
                    {d.day}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
