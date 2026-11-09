import { ACHIEVEMENTS } from "../data/achievements"
import { DAILY_QUOTES } from "../data/quotes"
import { formatWeekday, listDayKeys, todayKey } from "./dates"
import {
  getCompletionRateForRange,
  getCurrentStreak,
  getDueHabitsForDate,
  getGoalProgress,
  getHabitCategory,
  getHabitCompletion,
  getLongestStreak,
  getPerfectDayCount,
  getPerfectDayStreak,
  isHabitCompletedOnDate,
  isHabitDueOnDate
} from "./habits"

export const getTodayOverview = (habits, completions, dateKey = todayKey()) => {
  const activeHabits = habits.filter((habit) => !habit.archivedAt)
  const dueHabits = getDueHabitsForDate(activeHabits, dateKey)
  const completed = dueHabits.filter((habit) => isHabitCompletedOnDate(habit, completions, dateKey)).length

  return {
    due: dueHabits.length,
    completed,
    percentage: dueHabits.length ? Math.round((completed / dueHabits.length) * 100) : 0
  }
}

export const getWeeklyChart = (habits, completions) =>
  listDayKeys(7).map((dateKey) => {
    const summary = getTodayOverview(habits, completions, dateKey)
    return {
      dateKey,
      label: formatWeekday(dateKey),
      completed: summary.completed,
      due: summary.due,
      percentage: summary.percentage
    }
  })

export const getMonthlyTrend = (habits, completions, monthKeys) =>
  monthKeys.map((dateKey) => {
    const summary = getTodayOverview(habits, completions, dateKey)
    return {
      dateKey,
      label: dateKey.slice(-2),
      percentage: summary.percentage
    }
  })

/**
 * Category breakdown — based on completion RATE (not raw count) so schedules are fair.
 * Each habit contributes its 30-day completion rate, averaged per category.
 */
export const getCategoryBreakdown = (habits, completions, categories, dateKeys = listDayKeys(30)) => {
  const activeHabits = habits.filter((habit) => !habit.archivedAt)
  const buckets = new Map()

  activeHabits.forEach((habit) => {
    const category = getHabitCategory(habit, categories)
    // Only count due days — completion rate out of days the habit was actually scheduled
    const dueDays = dateKeys.filter((dk) => isHabitDueOnDate(habit, dk))
    const completedDays = dueDays.filter((dk) => isHabitCompletedOnDate(habit, completions, dk)).length
    const rate = dueDays.length > 0 ? (completedDays / dueDays.length) * 100 : 0

    const current = buckets.get(category.id) ?? {
      name: `${category.emoji} ${category.label}`,
      value: 0,
      count: 0,
      color: category.color
    }

    current.value += rate   // accumulate rates
    current.count += 1      // count habits in category
    buckets.set(category.id, current)
  })

  // Average the rate per category, round to whole number, filter out zero-rate categories
  return [...buckets.values()]
    .map((item) => ({ ...item, value: Math.round(item.value / item.count) }))
    .filter((item) => item.value > 0)
}

export const getHeatmapData = (habits, completions, monthKeys) =>
  monthKeys.map((dateKey) => {
    const { due, completed } = getTodayOverview(habits, completions, dateKey)
    return {
      dateKey,
      due,
      completed,
      intensity: due ? completed / due : 0
    }
  })

export const getAverageStreak = (habits, completions) => {
  const activeHabits = habits.filter((habit) => !habit.archivedAt)
  if (!activeHabits.length) {
    return 0
  }

  const total = activeHabits.reduce((sum, habit) => sum + getCurrentStreak(habit, completions), 0)
  return Math.round(total / activeHabits.length)
}

/**
 * Best day of week — only averages across days that had at least 1 habit due,
 * preventing zero-due days (e.g., no weekly habits on a certain weekday) from skewing results.
 */
export const getBestDayOfWeek = (habits, completions) => {
  const buckets = new Map()

  listDayKeys(56).forEach((dateKey) => {
    const summary = getTodayOverview(habits, completions, dateKey)
    if (summary.due === 0) return // skip days with nothing scheduled
    const label = formatWeekday(dateKey, "EEEE")
    const current = buckets.get(label) ?? { total: 0, count: 0 }
    current.total += summary.percentage
    current.count += 1
    buckets.set(label, current)
  })

  let winner = "Monday"
  let bestScore = -1
  buckets.forEach((bucket, label) => {
    const score = bucket.count ? bucket.total / bucket.count : 0
    if (score > bestScore) {
      bestScore = score
      winner = label
    }
  })

  return winner
}

/**
 * Trending habits — sorted by IMPROVEMENT (recentRate - priorRate), not just recent rate.
 * Shows habits that are gaining the most momentum, with streak as tiebreaker.
 */
export const getTrendingHabits = (habits, completions) => {
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)

  return habits
    .filter((habit) => !habit.archivedAt)
    .map((habit) => {
      const recentKeys = listDayKeys(14)          // last 14 days ending today
      const priorKeys = listDayKeys(14, twoWeeksAgo) // 14 days before that
      const recentRate = getCompletionRateForRange(habit, completions, recentKeys)
      const priorRate = getCompletionRateForRange(habit, completions, priorKeys)
      const trend = recentRate - priorRate         // positive = improving
      return {
        habit,
        recentRate,
        priorRate,
        trend,
        streak: getCurrentStreak(habit, completions)
      }
    })
    // Show habits with highest recent rate, then by momentum gain, then streak
    .sort((a, b) => b.recentRate - a.recentRate || b.trend - a.trend || b.streak - a.streak)
    .slice(0, 3)
}

export const getBestHabit = (habits, completions) =>
  habits
    .filter((habit) => !habit.archivedAt)
    .map((habit) => ({
      habit,
      streak: getCurrentStreak(habit, completions),
      longest: getLongestStreak(habit, completions)
    }))
    .sort((a, b) => b.streak - a.streak || b.longest - a.longest)[0] ?? null

export const getCompletionLogs = (habits, completions, categories) => {
  const habitMap = new Map(habits.map((habit) => [habit.id, habit]))

  return Object.values(completions)
    .filter((entry) => entry.completedAt)
    .map((entry) => {
      const habit = habitMap.get(entry.habitId)
      if (!habit) {
        return null
      }
      const category = getHabitCategory(habit, categories)
      return {
        ...entry,
        habitName: habit.name,
        habitColor: habit.color,
        categoryLabel: category.label,
        categoryEmoji: category.emoji
      }
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
}

export const getDayInspection = (habits, completions, categories, dateKey) => {
  const dueHabits = getDueHabitsForDate(habits, dateKey)
  return dueHabits.map((habit) => {
    const category = getHabitCategory(habit, categories)
    const entry = getHabitCompletion(completions, habit.id, dateKey)
    return {
      habit,
      category,
      progress: getGoalProgress(habit, completions, dateKey),
      completed: Boolean(entry?.completed),
      note: entry?.note ?? "",
      completedAt: entry?.completedAt ?? null
    }
  })
}

export const evaluateAchievements = (habits, completions, existingAchievements) => {
  const unlockedIds = new Set(existingAchievements.map((achievement) => achievement.id))
  const newlyUnlocked = []

  const maxLongestStreak = habits.reduce(
    (best, habit) => Math.max(best, getLongestStreak(habit, completions)),
    0
  )

  const recentDays = listDayKeys(120)
  const anyFiveCompleteDay = recentDays.some((dateKey) => getPerfectDayCount(habits, completions, dateKey).completed >= 5)
  const perfectStreak = getPerfectDayStreak(habits, completions)

  const conditions = {
    "week-warrior": maxLongestStreak >= 7,
    "consistency-king": maxLongestStreak >= 30,
    legend: maxLongestStreak >= 100,
    "perfect-day": anyFiveCompleteDay,
    unbreakable: perfectStreak >= 14
  }

  const achievements = [...existingAchievements]

  ACHIEVEMENTS.forEach((achievement) => {
    if (!conditions[achievement.id] || unlockedIds.has(achievement.id)) {
      return
    }

    const unlocked = {
      id: achievement.id,
      unlockedAt: new Date().toISOString()
    }
    achievements.push(unlocked)
    newlyUnlocked.push({ ...achievement, ...unlocked })
  })

  return { achievements, newlyUnlocked }
}

export const getAchievementCards = (habits, completions, achievements) =>
  ACHIEVEMENTS.map((achievement) => ({
    ...achievement,
    unlocked: achievements.some((item) => item.id === achievement.id),
    unlockedAt: achievements.find((item) => item.id === achievement.id)?.unlockedAt ?? null
  }))

export const getMotivationMessage = (habits, completions) => {
  const winner = getBestDayOfWeek(habits, completions)
  const bestHabit = getBestHabit(habits, completions)
  const quote = DAILY_QUOTES[Math.abs(habits.length + Object.keys(completions).length) % DAILY_QUOTES.length]

  return {
    productivity: `You're most productive on ${winner}.`,
    bestHabit: bestHabit ? `Your best habit: ${bestHabit.habit.name}.` : "Your best habit will appear once you start logging.",
    quote
  }
}
