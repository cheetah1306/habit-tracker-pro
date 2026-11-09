import { BUILTIN_CATEGORIES } from "../data/categories"
import { normalizeProfile } from "./profile"
import { createDefaultSettings } from "./storage"

const isValidHabit = (habit) =>
  habit &&
  typeof habit.id === "string" &&
  typeof habit.name === "string" &&
  typeof habit.categoryId === "string" &&
  typeof habit.color === "string" &&
  typeof habit.goalTarget === "number" &&
  habit.schedule &&
  typeof habit.schedule.mode === "string"

const isValidCompletion = (completion) =>
  completion &&
  typeof completion.habitId === "string" &&
  typeof completion.date === "string" &&
  typeof completion.progressCount === "number" &&
  typeof completion.completed === "boolean"

export const downloadBackup = (state) => {
  const payload = {
    version: 2,
    exportedAt: new Date().toISOString(),
    data: state
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = `habit-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

export const readBackupFile = async (file) => {
  const rawText = await file.text()
  const parsed = JSON.parse(rawText)
  const data = parsed?.data ?? parsed

  if (!data || typeof data !== "object") {
    throw new Error("Backup file is empty or invalid.")
  }

  if (!Array.isArray(data.habits) || !data.habits.every(isValidHabit)) {
    throw new Error("Backup file habits are invalid.")
  }

  if (!data.completions || typeof data.completions !== "object") {
    throw new Error("Backup file completions are invalid.")
  }

  const completionValues = Object.values(data.completions)
  if (!completionValues.every(isValidCompletion)) {
    throw new Error("Backup file completion entries are invalid.")
  }

  return {
    habits: data.habits,
    completions: data.completions,
    categories: Array.isArray(data.categories) && data.categories.length ? data.categories : BUILTIN_CATEGORIES,
    settings: {
      ...createDefaultSettings(),
      ...(data.settings ?? {}),
      theme: "light"
    },
    achievements: Array.isArray(data.achievements) ? data.achievements : [],
    reminderSkips: data.reminderSkips ?? {},
    profile: normalizeProfile(data.profile)
  }
}
