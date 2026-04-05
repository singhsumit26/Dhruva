import './App.css'
import Calendar from './components/Calendar/Calendar'
import HabitTracker from './components/HabitTracker/HabitTracker'
import PomodoroTimer from './components/PomodoroTimer/PomodoroTimer'
import Insights from './components/Insights/Insights'
import { useAppState } from './hooks/useAppState'

function App() {
  const { state, actions } = useAppState()

  return (
    <div>
      <header className="app-header">
        <h1>Dhruva</h1>
        <p>ध्रुव — your fixed star, your constant north</p>
      </header>

      <div className="app-grid">
        <Calendar
          events={state.events}
          onAddEvent={actions.addEvent}
        />
        <HabitTracker
          habits={state.habits}
          onToggle={actions.toggleHabit}
          onAdd={actions.addHabit}
          onRename={actions.renameHabit}
          onDelete={actions.deleteHabit}
        />
        <PomodoroTimer
          sessions={state.sessions}
          onSessionComplete={actions.addSession}
        />
        <Insights
          habits={state.habits}
          sessions={state.sessions}
          weeklyFocus={state.weeklyFocus}
          mood={state.mood}
          onMoodSelect={actions.setMood}
        />
      </div>
    </div>
  )
}

export default App