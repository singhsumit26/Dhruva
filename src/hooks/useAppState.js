import { useState, useEffect, useCallback } from 'react'

function load(key, fallback) {
  try {
    const val = localStorage.getItem(key)
    return val ? JSON.parse(val) : fallback
  } catch {
    return fallback
  }
}

function save(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val))
  } catch {}
}

function todayKey() {
  return new Date().toISOString().split('T')[0]
}

function calcStreak(history) {
  let s = 0
  const d = new Date()
  while (true) {
    const key = d.toISOString().split('T')[0]
    if (history[key]) {
      s++
      d.setDate(d.getDate() - 1)
    } else {
      break
    }
  }
  return s
}

function historyToWeekDone(history) {
  // returns 7-slot array for current week Sun–Sat
  const today = new Date()
  const sunday = new Date(today)
  sunday.setDate(today.getDate() - today.getDay())
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday)
    d.setDate(sunday.getDate() + i)
    const key = d.toISOString().split('T')[0]
    return history[key] ? 1 : 0
  })
}

export function useAppState() {
  const [events, setEvents]           = useState(() => load('dhruva_events', {}))
  const [habits, setHabits]           = useState(() => load('dhruva_habits', []))
  const [sessions, setSessions]       = useState(() => load('dhruva_sessions', []))
  const [weeklyFocus, setWeeklyFocus] = useState(() => load('dhruva_weekly', [0,0,0,0,0,0,0]))
  const [mood, setMoodState]          = useState(() => load('dhruva_mood', null))

  useEffect(() => save('dhruva_events', events),      [events])
  useEffect(() => save('dhruva_habits', habits),      [habits])
  useEffect(() => save('dhruva_sessions', sessions),  [sessions])
  useEffect(() => save('dhruva_weekly', weeklyFocus), [weeklyFocus])
  useEffect(() => save('dhruva_mood', mood),          [mood])

  const addEvent = useCallback((dateKey, label) => {
    setEvents(prev => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), { label }]
    }))
  }, [])

  const toggleHabit = useCallback((habitId, dayIdx) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== habitId) return h
      // get the actual date for this dayIdx in current week
      const sunday = new Date()
      sunday.setDate(sunday.getDate() - sunday.getDay())
      const d = new Date(sunday)
      d.setDate(sunday.getDate() + dayIdx)
      const key = d.toISOString().split('T')[0]
      const history = { ...(h.history || {}) }
      if (history[key]) {
        delete history[key]
      } else {
        history[key] = true
      }
      const done   = historyToWeekDone(history)
      const streak = calcStreak(history)
      return { ...h, history, done, streak }
    }))
  }, [])

  const addHabit = useCallback((name) => {
    setHabits(prev => [
      ...prev,
      { id: Date.now(), name, streak: 0, done: [0,0,0,0,0,0,0], history: {} }
    ])
  }, [])

  const renameHabit = useCallback((habitId, newName) => {
    setHabits(prev => prev.map(h =>
      h.id === habitId ? { ...h, name: newName } : h
    ))
  }, [])

  const deleteHabit = useCallback((habitId) => {
    setHabits(prev => prev.filter(h => h.id !== habitId))
  }, [])

  const addSession = useCallback((session) => {
    setSessions(prev => [...prev, { ...session, id: Date.now() }])
    const dayIdx = new Date().getDay()
    setWeeklyFocus(prev => {
      const updated = [...prev]
      updated[dayIdx] = parseFloat((updated[dayIdx] + session.mins / 60).toFixed(2))
      return updated
    })
  }, [])

  const setMood = useCallback((val) => setMoodState(val), [])

  return {
    state:   { events, habits, sessions, weeklyFocus, mood },
    actions: { addEvent, toggleHabit, addHabit, renameHabit, deleteHabit, addSession, setMood }
  }
}