import './Insights.css'

const MOODS   = ['😔', '😐', '🙂', '😊', '🤩']
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function Insights({ habits, sessions, weeklyFocus, mood, onMoodSelect }) {

  // ── stats ──
  const totalMins    = sessions.reduce((a, s) => a + s.mins, 0)
  const focusHrs     = (totalMins / 60).toFixed(1)
  const sessionCount = sessions.length

  const bestStreak   = habits.length
    ? Math.max(...habits.map(h => h.streak))
    : 0

  const totalDone    = habits.reduce((a, h) => a + h.done.filter(Boolean).length, 0)
  const totalPossible = habits.length * 7
  const habitRate    = totalPossible ? Math.round(totalDone / totalPossible * 100) : 0

  // ── activity bar chart ──
  const activityMap = {}
  sessions.forEach(s => {
    activityMap[s.activity] = (activityMap[s.activity] || 0) + s.mins
  })
  const activityEntries = Object.entries(activityMap).sort((a, b) => b[1] - a[1])
  const maxMins = activityEntries.length ? activityEntries[0][1] : 1

  // ── weekly bars ──
  const maxHrs = Math.max(...weeklyFocus, 0.1)

  return (
    <div className="ins-panel">
      <div className="panel-title">
        <span className="panel-icon">📊</span>
        Insights
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-val">{focusHrs}h</div>
          <div className="stat-lbl">Focus today</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{sessionCount}</div>
          <div className="stat-lbl">Sessions</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{bestStreak}</div>
          <div className="stat-lbl">Best streak</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{habitRate}%</div>
          <div className="stat-lbl">Habit rate</div>
        </div>
      </div>

      <div className="bar-chart">
        <div className="bar-chart-title">Time by activity</div>
        {activityEntries.length === 0
          ? <div className="no-data">Complete a session to see data</div>
          : activityEntries.map(([name, mins]) => (
              <div key={name} className="bar-row">
                <div className="bar-lbl">{name}</div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ width: `${Math.round(mins / maxMins * 100)}%` }}
                  />
                </div>
                <div className="bar-val">{mins}m</div>
              </div>
            ))
        }
      </div>

      <div className="weekly-summary">
        <div className="ws-title">Weekly focus (hrs)</div>
        <div className="ws-bars-row">
          {weeklyFocus.map((hrs, i) => (
            <div key={i} className="ws-bar-wrap">
              <div
                className="ws-bar"
                style={{ height: `${Math.round(hrs / maxHrs * 38)}px` }}
              />
              <div className="ws-day-lbl">{WEEKDAYS[i].slice(0, 2)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mood-row">
        <span className="mood-lbl">Today's mood</span>
        <div className="mood-emojis">
          {MOODS.map((emoji, i) => (
            <button
              key={i}
              className={`mood-btn${mood === i ? ' selected' : ''}`}
              onClick={() => onMoodSelect(mood === i ? null : i)}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}