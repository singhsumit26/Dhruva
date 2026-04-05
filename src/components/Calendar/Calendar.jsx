import { useState } from 'react'
import './Calendar.css'

const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function fmtDate(d) {
  return d.toISOString().split('T')[0]
}

export default function Calendar({ events, onAddEvent }) {
  const [view, setView]               = useState('month')
  const [offset, setOffset]           = useState(0)
  const [selectedDay, setSelectedDay] = useState(new Date())
  const [showModal, setShowModal]     = useState(false)
  const [eventInput, setEventInput]   = useState('')
  const now = new Date()

  function getNavLabel() {
    if (view === 'month') {
      const ref = new Date(now.getFullYear(), now.getMonth() + offset, 1)
      return ref.toLocaleDateString('en', { month: 'long', year: 'numeric' })
    }
    if (view === 'week') {
      const s = new Date(now)
      s.setDate(now.getDate() - now.getDay() + offset * 7)
      const e = new Date(s); e.setDate(s.getDate() + 6)
      return s.toLocaleDateString('en', { month: 'short', day: 'numeric' }) + ' – ' +
             e.toLocaleDateString('en', { month: 'short', day: 'numeric' })
    }
    const d = new Date(now)
    d.setDate(now.getDate() + offset)
    return d.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })
  }

  function getDays() {
    const cells = []
    if (view === 'month') {
      const ref         = new Date(now.getFullYear(), now.getMonth() + offset, 1)
      const startDay    = ref.getDay()
      const daysInMonth = new Date(ref.getFullYear(), ref.getMonth() + 1, 0).getDate()
      const prevDays    = new Date(ref.getFullYear(), ref.getMonth(), 0).getDate()
      for (let i = 0; i < startDay; i++) {
        cells.push({ n: prevDays - startDay + i + 1, cls: 'other-month', date: null })
      }
      for (let d = 1; d <= daysInMonth; d++) {
        const date       = new Date(ref.getFullYear(), ref.getMonth(), d)
        const isToday    = d === now.getDate() && ref.getMonth() === now.getMonth() && ref.getFullYear() === now.getFullYear()
        const isSelected = fmtDate(date) === fmtDate(selectedDay)
        const hasEvent   = !!(events[fmtDate(date)]?.length)
        cells.push({ n: d, cls: (isToday ? 'today' : '') + (isSelected && !isToday ? ' selected' : ''), date, hasEvent })
      }
    } else if (view === 'week') {
      const s = new Date(now)
      s.setDate(now.getDate() - now.getDay() + offset * 7)
      for (let i = 0; i < 7; i++) {
        const date       = new Date(s); date.setDate(s.getDate() + i)
        const isToday    = fmtDate(date) === fmtDate(now)
        const isSelected = fmtDate(date) === fmtDate(selectedDay)
        const hasEvent   = !!(events[fmtDate(date)]?.length)
        cells.push({ n: date.getDate(), cls: (isToday ? 'today' : '') + (isSelected && !isToday ? ' selected' : ''), date, hasEvent })
      }
    } else {
      const base = new Date(now)
      base.setDate(now.getDate() + offset)
      for (let i = -3; i <= 3; i++) {
        const date       = new Date(base); date.setDate(base.getDate() + i)
        const isToday    = i === 0
        const isSelected = fmtDate(date) === fmtDate(selectedDay)
        cells.push({ n: date.getDate(), cls: (isToday ? 'today' : '') + (isSelected && !isToday ? ' selected' : ''), date, hasEvent: false })
      }
    }
    return cells
  }

  function handleAddEvent() {
    setEventInput('')
    setShowModal(true)
  }

  function submitEvent() {
    if (eventInput.trim()) {
      onAddEvent(fmtDate(selectedDay), eventInput.trim())
    }
    setShowModal(false)
    setEventInput('')
  }

  function cancelEvent() {
    setShowModal(false)
    setEventInput('')
  }

  const dayEvents = events[fmtDate(selectedDay)] || []
  const cells     = getDays()

  return (
    <div className="cal-panel">
      <div className="panel-title">
        <span className="panel-icon">📅</span>
        Calendar
      </div>

      <div className="cal-tabs">
        {['day', 'week', 'month'].map(v => (
          <button
            key={v}
            className={`cal-tab${view === v ? ' active' : ''}`}
            onClick={() => { setView(v); setOffset(0) }}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      <div className="cal-nav">
        <button className="cal-nav-btn" onClick={() => setOffset(o => o - 1)}>‹</button>
        <span className="cal-nav-label">{getNavLabel()}</span>
        <button className="cal-nav-btn" onClick={() => setOffset(o => o + 1)}>›</button>
      </div>

      <div className="cal-grid">
        {DAY_NAMES.map(d => (
          <div key={d} className="cal-day-name">{d}</div>
        ))}
        {cells.map((cell, idx) => (
          <div
            key={idx}
            className={`cal-day ${cell.cls}`}
            onClick={() => cell.date && setSelectedDay(cell.date)}
          >
            {cell.n}
            {cell.hasEvent && <div className="cal-dot" />}
          </div>
        ))}
      </div>

      <div className="cal-events-box">
        <div className="cal-events-title">
          {selectedDay.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
        </div>
        {dayEvents.length === 0
          ? <div className="cal-empty">No events scheduled</div>
          : dayEvents.map((e, i) => (
              <div key={i} className="cal-event-item">
                <div className="cal-event-dot" />
                <span>{e.label}</span>
              </div>
            ))
        }
      </div>

      <button className="add-btn" onClick={handleAddEvent}>+ Add event</button>

      {/* Custom modal */}
      {showModal && (
        <div className="cal-modal-overlay" onClick={cancelEvent}>
          <div className="cal-modal" onClick={e => e.stopPropagation()}>
            <div className="cal-modal-title">New Event</div>
            <div className="cal-modal-date">
              {selectedDay.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
            <input
              className="cal-modal-input"
              placeholder="Event name…"
              value={eventInput}
              autoFocus
              onChange={e => setEventInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') submitEvent()
                if (e.key === 'Escape') cancelEvent()
              }}
            />
            <div className="cal-modal-actions">
              <button className="cal-modal-cancel" onClick={cancelEvent}>Cancel</button>
              <button className="cal-modal-submit" onClick={submitEvent}>Add Event</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}