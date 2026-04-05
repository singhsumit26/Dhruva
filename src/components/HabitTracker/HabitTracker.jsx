import { useState } from 'react'
import './HabitTracker.css'

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const DAY_NAMES   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function buildHeatmap(habits) {
  return Array.from({ length: 28 }, (_, i) => {
    const weekIdx = Math.floor(i / 7)
    const dayIdx  = i % 7
    // only the most recent week (weekIdx === 3) has real data
    // older weeks show empty for now since we don't store historical data
    if (weekIdx < 3) return ''
    const score = habits.reduce((acc, h) => acc + (h.done[dayIdx] || 0), 0)
    const pct   = habits.length ? score / habits.length : 0
    if (pct === 0)  return ''
    if (pct < 0.33) return 'l1'
    if (pct < 0.66) return 'l2'
    return 'l3'
  })
}

function HabitItem({ habit, onToggle, onRename, onDelete }) {
  const [editing, setEditing]   = useState(false)
  const [nameVal, setNameVal]   = useState(habit.name)

  function submitRename() {
    if (nameVal.trim()) onRename(habit.id, nameVal.trim())
    setEditing(false)
  }

  return (
    <div className="habit-item">
      <div className="habit-header">
        {editing
          ? <input
              className="habit-name-input"
              value={nameVal}
              autoFocus
              onChange={e => setNameVal(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') submitRename()
                if (e.key === 'Escape') setEditing(false)
              }}
              onBlur={submitRename}
            />
          : <span
              className="habit-name"
              title="Click to rename"
              onClick={() => setEditing(true)}
            >
              {habit.name}
            </span>
        }
        <div className="habit-actions">
          <span className="streak-badge">🔥 {habit.streak}d</span>
          <button
            className="habit-edit-btn"
            title="Rename"
            onClick={() => setEditing(true)}
          >✏️</button>
          <button
            className="habit-delete-btn"
            title="Delete"
            onClick={() => onDelete(habit.id)}
          >×</button>
        </div>
      </div>
      <div className="habit-dots">
        {habit.done.map((done, i) => (
          <div
            key={i}
            className={`h-dot${done ? ' done' : ''}${i === 6 ? ' today-dot' : ''}`}
            title={DAY_NAMES[i]}
            onClick={() => onToggle(habit.id, i)}
          >
            {done ? '✓' : DAY_LETTERS[i]}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function HabitTracker({ habits, onToggle, onAdd, onRename, onDelete }) {
  const [inputVal, setInputVal] = useState('')

  function handleAdd() {
    if (!inputVal.trim()) return
    onAdd(inputVal.trim())
    setInputVal('')
  }

  const heatmap = buildHeatmap(habits)

  return (
    <div className="hab-panel">
      <div className="panel-title">
        <span className="panel-icon">🔥</span>
        Habits
      </div>

      <div className="habit-list">
        {habits.length === 0
          ? <div className="no-habits">No habits yet — add one below</div>
          : habits.map(habit => (
              <HabitItem
                key={habit.id}
                habit={habit}
                onToggle={onToggle}
                onRename={onRename}
                onDelete={onDelete}
              />
            ))
        }
      </div>

      <div className="add-habit-row">
        <input
          className="hab-input"
          placeholder="New habit…"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />
        <button className="hab-add-btn" onClick={handleAdd}>+</button>
      </div>

      <div className="hm-label">Activity heatmap · last 4 weeks</div>
      <div className="heatmap-grid">
        {heatmap.map((lvl, i) => (
          <div key={i} className={`hm-cell ${lvl}`} />
        ))}
      </div>
    </div>
  )
}