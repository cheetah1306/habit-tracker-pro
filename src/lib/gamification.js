import { todayKey } from "./dates"
import { getCurrentStreak, getDueHabitsForDate, isHabitCompletedOnDate } from "./habits"

export const LEVEL_TIERS = [
  { level: 1, title: "Seedling Initiate", emoji: "🌱", minXp: 0 },
  { level: 2, title: "Momentum Spark", emoji: "⚡", minXp: 150 },
  { level: 3, title: "Habit Guardian", emoji: "🛡️", minXp: 350 },
  { level: 4, title: "Consistency Warrior", emoji: "⚔️", minXp: 650 },
  { level: 5, title: "Routine Ranger", emoji: "🏹", minXp: 1050 },
  { level: 6, title: "Discipline Alchemist", emoji: "🔮", minXp: 1550 },
  { level: 7, title: "Focus Champion", emoji: "🦅", minXp: 2150 },
  { level: 8, title: "Iron Will Master", emoji: "💎", minXp: 2900 },
  { level: 9, title: "Quantum Ascendant", emoji: "🌌", minXp: 3800 },
  { level: 10, title: "Habit Deity", emoji: "👑", minXp: 5000 }
]

/**
 * Get Level details from total XP
 */
export const getLevelInfo = (totalXp = 0) => {
  const safeXp = Math.max(0, Math.floor(totalXp || 0))

  if (safeXp >= 5000) {
    const prestige = Math.floor((safeXp - 5000) / 1200)
    const level = 10 + prestige
    const currentTierMin = 5000 + prestige * 1200
    const nextTierMin = currentTierMin + 1200
    const progressXp = safeXp - currentTierMin
    const neededXp = nextTierMin - currentTierMin
    const percentage = Math.min(100, Math.round((progressXp / neededXp) * 100))

    return {
      level,
      title: prestige > 0 ? `Habit Deity Rank ${prestige + 1}` : "Habit Deity",
      emoji: "👑",
      totalXp: safeXp,
      currentLevelXp: progressXp,
      nextLevelXp: neededXp,
      percentage
    }
  }

  let currentTier = LEVEL_TIERS[0]
  let nextTier = LEVEL_TIERS[1]

  for (let i = LEVEL_TIERS.length - 1; i >= 0; i--) {
    if (safeXp >= LEVEL_TIERS[i].minXp) {
      currentTier = LEVEL_TIERS[i]
      nextTier = LEVEL_TIERS[i + 1] || null
      break
    }
  }

  const currentLevelXp = safeXp - currentTier.minXp
  const nextLevelXp = nextTier ? nextTier.minXp - currentTier.minXp : 1000
  const percentage = nextTier
    ? Math.min(100, Math.round((currentLevelXp / nextLevelXp) * 100))
    : 100

  return {
    level: currentTier.level,
    title: currentTier.title,
    emoji: currentTier.emoji,
    totalXp: safeXp,
    currentLevelXp,
    nextLevelXp,
    percentage
  }
}

/**
 * Get streak multiplier for XP calculation
 */
export const getStreakMultiplier = (streak = 0) => {
  if (streak >= 14) return { multiplier: 2.0, label: "2.0x (Legendary)" }
  if (streak >= 7) return { multiplier: 1.5, label: "1.5x (Blazing)" }
  if (streak >= 3) return { multiplier: 1.2, label: "1.2x (Heating Up)" }
  return { multiplier: 1.0, label: "1.0x (Normal)" }
}

/**
 * Calculate XP gained for checking off a habit
 */
export const calculateCompletionXp = (habit, streak = 0) => {
  let base = 20
  if (habit.difficulty === "medium") base += 5
  if (habit.difficulty === "hard") base += 10

  const { multiplier, label } = getStreakMultiplier(streak)
  const earnedXp = Math.round(base * multiplier)

  return {
    earnedXp,
    baseXp: base,
    multiplier,
    multiplierLabel: label
  }
}

/**
 * Calculate retroactive XP from all completed habits in history.
 * Uses the same difficulty-aware base XP as calculateCompletionXp.
 */
export const calculateRetroactiveXp = (habits = [], completions = {}) => {
  const habitMap = new Map(habits.map((h) => [h.id, h]))

  let total = Object.values(completions).reduce((sum, entry) => {
    if (!entry.completed) return sum
    const habit = habitMap.get(entry.habitId)
    let base = 20
    if (habit?.difficulty === "medium") base += 5
    if (habit?.difficulty === "hard") base += 10
    return sum + base
  }, 0)

  // Bonus for active streaks (current streak × 5 per habit, capped at 200 per habit)
  habits.forEach((habit) => {
    const streak = getCurrentStreak(habit, completions)
    if (streak >= 3) total += Math.min(streak * 5, 200)
  })

  return total
}

/**
 * Generate daily quests for a given date
 */
export const getDailyQuests = (habits = [], completions = {}, claimedQuestIds = [], dateKey = todayKey()) => {
  const activeHabits = habits.filter((h) => !h.archivedAt)
  const dueHabits = getDueHabitsForDate(activeHabits, dateKey)
  const completedHabits = dueHabits.filter((h) => isHabitCompletedOnDate(h, completions, dateKey))

  // Quest 1: Morning Ignition — at least 1 habit logged before 12:00
  const morningCompletions = completedHabits.filter((h) => {
    const entry = completions[`${h.id}::${dateKey}`]
    if (!entry?.completedAt) return false
    return new Date(entry.completedAt).getHours() < 12
  })
  const morningQuestCompleted = morningCompletions.length > 0

  // Quest 2: Triad Challenge (complete 3 habits or all if fewer than 3 available)
  const triadTarget = Math.min(3, Math.max(1, dueHabits.length))
  const triadCompleted = completedHabits.length >= triadTarget

  // Quest 3: Flawless Focus (complete 100% of due habits, min 1)
  const flawlessCompleted = dueHabits.length > 0 && completedHabits.length === dueHabits.length

  const quests = [
    {
      id: "quest-morning",
      title: "Morning Ignition",
      description: "Log at least 1 habit in the morning to spark your daily momentum.",
      icon: "🌅",
      xpReward: 25,
      progress: morningCompletions.length > 0 ? 1 : 0,
      target: 1,
      isCompleted: morningQuestCompleted,
      isClaimed: claimedQuestIds.includes("quest-morning")
    },
    {
      id: "quest-triad",
      title: "Triad Challenge",
      description: `Complete ${triadTarget} habit${triadTarget > 1 ? "s" : ""} today to build your streak fortress.`,
      icon: "⚡",
      xpReward: 35,
      progress: Math.min(triadTarget, completedHabits.length),
      target: triadTarget,
      isCompleted: triadCompleted,
      isClaimed: claimedQuestIds.includes("quest-triad")
    },
    {
      id: "quest-flawless",
      title: "Flawless Focus",
      description: "Achieve a 100% completion rate across all habits due today.",
      icon: "👑",
      xpReward: 50,
      progress: completedHabits.length,
      target: Math.max(1, dueHabits.length),
      isCompleted: flawlessCompleted,
      isClaimed: claimedQuestIds.includes("quest-flawless")
    }
  ]

  return quests
}

/**
 * Daily mystery chest rewards generator
 */
export const openMysteryChest = (dateKey = todayKey()) => {
  const rewards = [
    { xp: 20, message: "A burst of motivation! May your willpower stay unbreakable." },
    { xp: 30, message: "Lucky discovery! Momentum is on your side today." },
    { xp: 40, message: "Supercharged fortune! Crush your goals today." },
    { xp: 50, message: "Jackpot Chest! Legendary dedication recognized!" }
  ]

  const seed = dateKey.split("-").reduce((acc, part) => acc + parseInt(part, 10), 0)
  const selected = rewards[seed % rewards.length]

  return {
    dateKey,
    xpReward: selected.xp,
    quote: selected.message
  }
}
