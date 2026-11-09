import { useEffect, useRef, useState } from "react"
import { combineDateAndTime, todayKey } from "../lib/dates"
import { getDueHabitsForDate, isHabitCompletedOnDate } from "../lib/habits"

const SESSION_SNOOZE_KEY = "habit-tracker-pro:snoozes:v1"

const loadSessionSnoozes = () => {
  if (typeof window === "undefined") {
    return {}
  }

  try {
    return JSON.parse(window.sessionStorage.getItem(SESSION_SNOOZE_KEY) || "{}")
  } catch {
    return {}
  }
}

const saveSessionSnoozes = (value) => {
  if (typeof window === "undefined") {
    return
  }

  window.sessionStorage.setItem(SESSION_SNOOZE_KEY, JSON.stringify(value))
}

export const useReminders = ({
  habits,
  categories,
  completions,
  reminderSkips,
  completeHabit,
  skipHabitForToday
}) => {
  const [trayItems, setTrayItems] = useState([])
  const [snoozes, setSnoozes] = useState(loadSessionSnoozes)
  const timersRef = useRef([])

  useEffect(() => {
    saveSessionSnoozes(snoozes)
  }, [snoozes])

  useEffect(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer))
    timersRef.current = []

    const dateKey = todayKey()
    const dueHabits = getDueHabitsForDate(habits.filter((habit) => !habit.archivedAt), dateKey).filter(
      (habit) =>
        habit.reminderTime &&
        !isHabitCompletedOnDate(habit, completions, dateKey) &&
        !reminderSkips[`${habit.id}::${dateKey}`]
    )

    dueHabits.forEach((habit) => {
      const reminderId = `${habit.id}::${dateKey}`
      const scheduledAt = combineDateAndTime(dateKey, habit.reminderTime)

      if (!scheduledAt) {
        return
      }

      const snoozeTargetTime = snoozes[reminderId] || 0
      const targetTime = Math.max(scheduledAt.getTime(), snoozeTargetTime)
      const target = new Date(targetTime)
      const delay = target.getTime() - Date.now()

      const fire = () => {
        const category = categories.find((entry) => entry.id === habit.categoryId)
        setTrayItems((current) => {
          if (current.some((item) => item.id === reminderId)) {
            return current
          }

          return [
            {
              id: reminderId,
              habitId: habit.id,
              title: habit.name,
              time: habit.reminderTime,
              categoryLabel: category?.label || habit.customCategoryLabel || "Custom",
              categoryEmoji: category?.emoji || habit.customCategoryEmoji || "✨"
            },
            ...current
          ]
        })
      }

      if (delay <= 0) {
        fire()
      } else {
        timersRef.current.push(window.setTimeout(fire, delay))
      }
    })

    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer))
      timersRef.current = []
    }
  }, [categories, completions, habits, reminderSkips, snoozes])

  const dismissReminder = (reminderId) => {
    setTrayItems((current) => current.filter((item) => item.id !== reminderId))
  }

  const snoozeReminder = (reminderId, minutes) => {
    let targetTime
    if (minutes === "within-today") {
      const now = new Date()
      targetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).getTime()
    } else {
      targetTime = Date.now() + minutes * 60 * 1000
    }

    setSnoozes((current) => ({
      ...current,
      [reminderId]: targetTime
    }))
    dismissReminder(reminderId)
  }

  const skipReminder = (reminderId) => {
    const habitId = reminderId.split("::")[0]
    skipHabitForToday(habitId)
    dismissReminder(reminderId)
  }

  const markDone = (reminderId) => {
    const habitId = reminderId.split("::")[0]
    completeHabit(habitId)
    dismissReminder(reminderId)
  }

  return {
    trayItems,
    dismissReminder,
    snoozeReminder,
    skipReminder,
    markDone
  }
}
