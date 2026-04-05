import { useState, useEffect, useRef } from 'react'
import './PomodoroTimer.css'

const DEFAULT_DURATIONS = {
  pomodoro: 25,
  short:    5,
  long:     15,
}

const PHASE_LABELS = {
  pomodoro: 'focus',
  short:    'short break',
  long:     'long break',
}

const MODE_LABELS = {
  pomodoro: 'Pomodoro',
  short:    'Short Break',
  long:     'Long Break',
}

const CIRCUMFERENCE = 2 * Math.PI * 65

export default function PomodoroTimer({ onSessionComplete }) {
  const [mode, setMode]               = useState('pomodoro')
  const [durations, setDurations]     = useState(DEFAULT_DURATIONS)
  const [remaining, setRemaining]     = useState(DEFAULT_DURATIONS.pomodoro * 60)
  const [running, setRunning]         = useState(false)
  const [round, setRound]             = useState(0)
  const [activity, setActivity]       = useState('Study / Revision')
  const [editingDur, setEditingDur]   = useState(false)
  const [durInput, setDurInput]       = useState(String(DEFAULT_DURATIONS.pomodoro))
  const [log, setLog]                 = useState([])
  const intervalRef                   = useRef(null)

  const totalSecs = durations[mode] * 60

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) {
            clearInterval(intervalRef.current)
            setRunning(false)
            handleComplete()
            return 0
          }
          return r - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  function handleComplete() {
    if (mode === 'pomodoro') {
      const mins  = durations.pomodoro
      const time  = new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })
      const entry = { activity: activity.trim() || 'Focus', mins, time }
      setLog(prev => [...prev, entry])
      onSessionComplete(entry)
      setRound(r => Math.min(r + 1, 4))
    }
  }

  function switchMode(m) {
    clearInterval(intervalRef.current)
    setRunning(false)
    setMode(m)
    setRemaining(durations[m] * 60)
    setDurInput(String(durations[m]))
    setEditingDur(false)
  }

  function toggleTimer() {
    setRunning(r => !r)
  }

  function resetTimer() {
    clearInterval(intervalRef.current)
    setRunning(false)
    setRemaining(durations[mode] * 60)
  }

  function startEditDur() {
    if (running) return
    setDurInput(String(durations[mode]))
    setEditingDur(true)
  }

  function submitDur() {
    const val = parseInt(durInput)
    if (!isNaN(val) && val > 0 && val <= 180) {
      const updated = { ...durations, [mode]: val }
      setDurations(updated)
      setRemaining(val * 60)
    }
    setEditingDur(false)
  }

  const mm     = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss     = String(remaining % 60).padStart(2, '0')
  const pct    = totalSecs > 0 ? remaining / totalSecs : 1
  const offset = CIRCUMFERENCE * (1 - pct)

  return (
    <div className="pom-panel">
      <div className="panel-title">
        <span className="panel-icon">⏱</span>
        Focus Timer
      </div>

      <div className="pom-mode-tabs">
        {Object.keys(MODE_LABELS).map(key => (
          <button
            key={key}
            className={`pom-tab${mode === key ? ' active' : ''}`}
            onClick={() => switchMode(key)}
          >
            {MODE_LABELS[key]}
          </button>
        ))}
      </div>

      {/* Editable duration */}
      <div className="dur-row">
        <span className="dur-label">Duration</span>
        {editingDur
          ? <div className="dur-edit">
              <input
                className="dur-input"
                type="number"
                min="1"
                max="180"
                value={durInput}
                autoFocus
                onChange={e => setDurInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') submitDur()
                  if (e.key === 'Escape') setEditingDur(false)
                }}
                onBlur={submitDur}
              />
              <span className="dur-unit">min</span>
            </div>
          : <button
              className="dur-display"
              onClick={startEditDur}
              title={running ? 'Pause to edit' : 'Click to edit'}
              disabled={running}
            >
              {durations[mode]} min ✏️
            </button>
        }
      </div>

      {/* Editable activity */}
      <input
        className="activity-input"
        placeholder="What are you working on…"
        value={activity}
        onChange={e => setActivity(e.target.value)}
      />

      <div className="pom-ring-wrap">
        <div className="pom-ring">
          <svg width="150" height="150" viewBox="0 0 150 150">
            <circle className="ring-bg"   cx="75" cy="75" r="65" />
            <circle
              className="ring-prog"
              cx="75" cy="75" r="65"
              style={{ strokeDashoffset: offset }}
            />
          </svg>
          <div className="pom-time">
            <div className="pom-digits">{mm}:{ss}</div>
            <div className="pom-phase">{PHASE_LABELS[mode]}</div>
          </div>
        </div>

        <div className="pom-rounds">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className={`round-dot${i < round ? ' done' : ''}`} />
          ))}
        </div>
      </div>

      <div className="pom-controls">
        <button className="pom-btn primary" onClick={toggleTimer}>
          {running ? 'Pause' : remaining === totalSecs ? 'Start' : 'Resume'}
        </button>
        <button className="pom-btn secondary" onClick={resetTimer}>Reset</button>
      </div>

      <div className="session-log">
        <div className="session-log-title">Session log</div>
        {log.length === 0
          ? <div className="no-data">No sessions yet</div>
          : log.map((entry, i) => (
              <div key={i} className="log-item">
                <span className="log-tag">{entry.time}</span>
                <span className="log-activity">{entry.activity}</span>
                <span className="log-dur">{entry.mins}m</span>
              </div>
            ))
        }
      </div>
    </div>
  )
}