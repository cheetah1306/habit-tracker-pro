import { addDays, differenceInCalendarDays } from "date-fns"
import { addDaysToKey, fromDayKey, listDayKeys, toDayKey, todayKey } from "./dates"

export const createId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export const createCompletionKey = (habitId, dateKey) => `${habitId}::${dateKey}`

export const createCompletionEntry = (habitId, dateKey) => ({
  habitId,
  date: dateKey,
  progressCount: 0,
  completed: false,
  completedAt: null,
  note: "",
  events: []
})

export const getHabitCompletion = (completions, habitId, dateKey) =>
  completions[createCompletionKey(habitId, dateKey)] ?? null

export const getHabitCategory = (habit, categories) => {
  const builtin = categories.find((category) => category.id === habit.categoryId)

  if (builtin) {
    return builtin
  }

  if (habit.customCategoryLabel) {
    return {
      id: habit.categoryId,
      label: habit.customCategoryLabel,
      emoji: habit.customCategoryEmoji || "✨",
      color: habit.color,
      builtin: false
    }
  }

  return {
    id: "general",
    label: "General",
    emoji: "✨",
    color: habit.color,
    builtin: false
  }
}

export const normalizeSchedule = (draft) => {
  const schedule = draft.schedule ?? { mode: "daily" }

  if (schedule.mode === "interval") {
    return {
      mode: "interval",
      intervalDays: Number(schedule.intervalDays) > 0 ? Number(schedule.intervalDays) : 2
    }
  }

  if (schedule.mode === "weekly") {
    return {
      mode: "weekly",
      weekday: Number.isInteger(schedule.weekday) ? schedule.weekday : 1
    }
  }

  if (schedule.mode === "custom") {
    return {
      mode: "custom",
      weekdays: Array.isArray(schedule.weekdays) && schedule.weekdays.length ? schedule.weekdays : [1, 3, 5]
    }
  }

  return { mode: "daily" }
}

export const createHabitFromDraft = (draft, settings, existingHabit = null) => {
  const timestamp = new Date().toISOString()
  return {
    id: existingHabit?.id ?? createId(),
    name: draft.name.trim().slice(0, 50),
    description: draft.description.trim().slice(0, 150),
    categoryId: draft.categoryId,
    customCategoryLabel: draft.customCategoryLabel?.trim() || "",
    customCategoryEmoji: draft.customCategoryEmoji?.trim() || "",
    color: draft.color,
    difficulty: draft.difficulty,
    goalType: draft.goalType,
    goalTarget: draft.goalType === "count" ? Math.max(1, Number(draft.goalTarget) || 1) : 1,
    schedule: normalizeSchedule(draft),
    reminderTime: draft.reminderTime || settings.defaultReminderTime || null,
    createdAt: existingHabit?.createdAt ?? timestamp,
    updatedAt: timestamp,
    archivedAt: existingHabit?.archivedAt ?? null,
    streakResetAt: existingHabit?.streakResetAt ?? null
  }
}

export const isHabitDueOnDate = (habit, dateValue) => {
  const dateKey = toDayKey(dateValue)
  const createdKey = toDayKey(habit.createdAt)

  if (dateKey < createdKey) {
    return false
  }

  if (habit.archivedAt && dateKey > toDayKey(habit.archivedAt)) {
    return false
  }

  const date = fromDayKey(dateKey)
  const createdDate = fromDayKey(createdKey)
  const weekday = date.getDay()

  if (habit.schedule.mode === "interval") {
    const interval = habit.schedule.intervalDays || 2
    return differenceInCalendarDays(date, createdDate) % interval === 0
  }

  if (habit.schedule.mode === "weekly") {
    return weekday === habit.schedule.weekday
  }

  if (habit.schedule.mode === "custom") {
    return habit.schedule.weekdays?.includes(weekday)
  }

  return true
}

export const getDueHabitsForDate = (habits, dateKey) => habits.filter((habit) => isHabitDueOnDate(habit, dateKey))

export const isHabitCompletedOnDate = (habit, completions, dateKey) => {
  const entry = getHabitCompletion(completions, habit.id, dateKey)
  return Boolean(entry?.completed)
}

export const getGoalProgress = (habit, completions, dateKey) => {
  const entry = getHabitCompletion(completions, habit.id, dateKey)
  return entry?.progressCount ?? 0
}

export const getDueDateKeys = (habit, endDateKey = todayKey()) => {
  const startKey = toDayKey(habit.streakResetAt || habit.createdAt)
  const start = fromDayKey(startKey)
  const end = fromDayKey(endDateKey)
  const keys = []

  for (let cursor = start; cursor <= end; cursor = addDays(cursor, 1)) {
    const key = toDayKey(cursor)
    if (isHabitDueOnDate(habit, key)) {
      keys.push(key)
    }
  }

  return keys
}

export const getCurrentStreak = (habit, completions, referenceKey = todayKey(), frozenDates = {}) => {
  const dueKeys = getDueDateKeys(habit, referenceKey)

  if (!dueKeys.length) {
    return 0
  }

  let index = dueKeys.length - 1

  if (dueKeys[index] === referenceKey && !isHabitCompletedOnDate(habit, completions, referenceKey)) {
    index -= 1
  }

  let streak = 0

  for (; index >= 0; index -= 1) {
    const key = dueKeys[index]
    const completed = isHabitCompletedOnDate(habit, completions, key)
    const isFrozen = Boolean(frozenDates[key])

    if (completed || isFrozen) {
      streak += 1
    } else {
      break
    }
  }

  return streak
}

export const getLongestStreak = (habit, completions, referenceKey = todayKey(), frozenDates = {}) => {
  const dueKeys = getDueDateKeys(habit, referenceKey)
  let longest = 0
  let current = 0

  dueKeys.forEach((dateKey) => {
    const completed = isHabitCompletedOnDate(habit, completions, dateKey)
    const isFrozen = Boolean(frozenDates[dateKey])

    if (completed || isFrozen) {
      current += 1
      longest = Math.max(longest, current)
    } else {
      current = 0
    }
  })

  return longest
}

export const getLatestMissedDate = (habit, completions, referenceKey = todayKey()) => {
  const dueKeys = getDueDateKeys(habit, referenceKey)

  for (let index = dueKeys.length - 1; index >= 0; index -= 1) {
    if (!isHabitCompletedOnDate(habit, completions, dueKeys[index])) {
      if (dueKeys[index] === referenceKey) {
        continue
      }
      return dueKeys[index]
    }
  }

  return null
}

export const getLastCompletedAt = (habit, completions) => {
  const entries = Object.values(completions)
    .filter((entry) => entry.habitId === habit.id && entry.completedAt)
    .sort((left, right) => new Date(right.completedAt) - new Date(left.completedAt))

  return entries[0]?.completedAt ?? null
}

export const getSevenDayHistory = (habit, completions, referenceKey = todayKey()) =>
  listDayKeys(7, fromDayKey(referenceKey)).map((dateKey) => ({
    dateKey,
    due: isHabitDueOnDate(habit, dateKey),
    completed: isHabitCompletedOnDate(habit, completions, dateKey),
    progress: getGoalProgress(habit, completions, dateKey)
  }))

export const getCompletionRateForRange = (habit, completions, dateKeys) => {
  const dueDays = dateKeys.filter((dateKey) => isHabitDueOnDate(habit, dateKey))

  if (!dueDays.length) {
    return 0
  }

  const completed = dueDays.filter((dateKey) => isHabitCompletedOnDate(habit, completions, dateKey)).length
  return Math.round((completed / dueDays.length) * 100)
}

export const getPerfectDayStreak = (habits, completions, referenceKey = todayKey(), frozenDates = {}) => {
  const activeHabits = habits.filter((habit) => !habit.archivedAt)
  if (!activeHabits.length) {
    return 0
  }

  // Find the earliest date any active habit was created or reset
  const earliestTimestamp = activeHabits.reduce((earliest, h) => {
    const key = toDayKey(h.streakResetAt || h.createdAt)
    return key < earliest ? key : earliest
  }, referenceKey)

  let streak = 0
  let pointer = referenceKey

  const todayDue = getDueHabitsForDate(activeHabits, referenceKey)
  const todayComplete = todayDue.length > 0 && todayDue.every((h) => isHabitCompletedOnDate(h, completions, referenceKey))

  // If today has habits due and not all are completed yet, start from yesterday so streak doesn't drop to 0 during the day!
  if (todayDue.length > 0 && !todayComplete) {
    pointer = addDaysToKey(pointer, -1)
  }

  let safetyLimit = 730 // max 2 years
  while (pointer >= earliestTimestamp && safetyLimit-- > 0) {
    const dueHabits = getDueHabitsForDate(activeHabits, pointer)
    if (!dueHabits.length) {
      // Rest day: no habits were scheduled on this date. Don't break streak, continue to previous day
      pointer = addDaysToKey(pointer, -1)
      continue
    }

    const complete = dueHabits.every((habit) => isHabitCompletedOnDate(habit, completions, pointer))
    const isFrozen = Boolean(frozenDates[pointer])

    if (complete || isFrozen) {
      streak += 1
      pointer = addDaysToKey(pointer, -1)
    } else {
      break
    }
  }

  return streak
}

export const getPerfectDayCount = (habits, completions, dateKey) => {
  const dueHabits = getDueHabitsForDate(habits.filter((habit) => !habit.archivedAt), dateKey)
  const completedCount = dueHabits.filter((habit) => isHabitCompletedOnDate(habit, completions, dateKey)).length

  return {
    due: dueHabits.length,
    completed: completedCount,
    perfect: dueHabits.length > 0 && completedCount === dueHabits.length
  }
}

export const getHabitStatusForDate = (habit, completions, dateKey) => {
  const entry = getHabitCompletion(completions, habit.id, dateKey)
  return {
    progress: entry?.progressCount ?? 0,
    completed: Boolean(entry?.completed),
    note: entry?.note ?? "",
    completedAt: entry?.completedAt ?? null
  }
}

export const getScheduleLabel = (habit) => {
  if (habit.schedule.mode === "interval") {
    return `Every ${habit.schedule.intervalDays || 2} days`
  }

  if (habit.schedule.mode === "weekly") {
    return "Weekly"
  }

  if (habit.schedule.mode === "custom") {
    return "Custom days"
  }

  return "Daily"
}

export const getDifficultyLabel = (difficulty) => {
  if (difficulty === "hard") {
    return "Hard"
  }

  if (difficulty === "medium") {
    return "Medium"
  }

  return "Easy"
}
