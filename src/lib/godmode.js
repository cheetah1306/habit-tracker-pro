import { todayKey } from "./dates"
import { getDueHabitsForDate, isHabitCompletedOnDate, getCurrentStreak } from "./habits"

// --- 1. WEEKLY LEAGUES ---
export const LEAGUE_TIERS = [
  { id: "bronze", name: "Bronze League", emoji: "🥉", color: "#CD7F32", minLeagueXp: 0 },
  { id: "silver", name: "Silver League", emoji: "🥈", color: "#C0C0C0", minLeagueXp: 200 },
  { id: "gold", name: "Gold League", emoji: "🥇", color: "#FFD700", minLeagueXp: 500 },
  { id: "sapphire", name: "Sapphire League", emoji: "🔷", color: "#0066FF", minLeagueXp: 900 },
  { id: "ruby", name: "Ruby League", emoji: "🔴", color: "#E0115F", minLeagueXp: 1400 },
  { id: "emerald", name: "Emerald League", emoji: "💚", color: "#50C878", minLeagueXp: 2000 },
  { id: "diamond", name: "Diamond League", emoji: "💎", color: "#B9F2FF", minLeagueXp: 2800 },
  { id: "master", name: "Master League", emoji: "🔮", color: "#9B51E0", minLeagueXp: 3800 },
  { id: "godmode", name: "Godmode Champions", emoji: "👑", color: "#FFB800", minLeagueXp: 5000 }
]

/**
 * Get current league tier for a given total XP
 */
export const getLeagueTier = (totalXp = 0) => {
  const safeXp = Math.max(0, Math.floor(totalXp || 0))
  let currentTier = LEAGUE_TIERS[0]
  for (let i = LEAGUE_TIERS.length - 1; i >= 0; i--) {
    if (safeXp >= LEAGUE_TIERS[i].minLeagueXp) {
      currentTier = LEAGUE_TIERS[i]
      break
    }
  }
  return currentTier
}

/**
 * Get the user's real personal league progress.
 * Shows only real earned XP — no fake competitors.
 */
export const getWeeklyLeagueProgress = (userWeeklyXp = 0, totalXp = 0) => {
  const safeTotal = Math.max(0, Math.floor(totalXp || 0))
  const safeWeekly = Math.max(0, Math.floor(userWeeklyXp || 0))

  const tier = getLeagueTier(safeTotal)
  const tierIndex = LEAGUE_TIERS.findIndex((t) => t.id === tier.id)
  const nextTier = LEAGUE_TIERS[tierIndex + 1] || null

  const xpIntoCurrentTier = safeTotal - tier.minLeagueXp
  const xpNeededForNext = nextTier ? nextTier.minLeagueXp - tier.minLeagueXp : null
  const progressPercent = nextTier
    ? Math.min(100, Math.round((xpIntoCurrentTier / xpNeededForNext) * 100))
    : 100

  // Days left in current week (Mon=1 … Sun=0 treated as 7)
  const dayOfWeek = new Date().getDay()
  const daysLeftInWeek = dayOfWeek === 0 ? 1 : 8 - dayOfWeek

  return {
    tier,
    nextTier,
    totalXp: safeTotal,
    userWeeklyXp: safeWeekly,
    xpIntoCurrentTier,
    xpNeededForNext,
    progressPercent,
    daysLeftInWeek,
    isMaxTier: !nextTier
  }
}

// --- 2. DAILY BOSS BATTLE ("THE SLOTH TITAN") ---
export const getBossBattleState = (habits = [], completions = {}, dateKey = todayKey()) => {
  const active = habits.filter((h) => !h.archivedAt)
  const dueHabits = getDueHabitsForDate(active, dateKey)
  const completedHabits = dueHabits.filter((h) => isHabitCompletedOnDate(h, completions, dateKey))

  const habitCount = Math.max(1, dueHabits.length)
  const hpPerHabit = 100
  const maxHp = habitCount * hpPerHabit
  const damageDealt = completedHabits.length * hpPerHabit
  const currentHp = Math.max(0, maxHp - damageDealt)
  const isDefeated = dueHabits.length > 0 && completedHabits.length >= dueHabits.length

  const bosses = [
    { name: "Gorgon the Procrastinator", emoji: "👹", desc: "Feeds on delayed tasks and excuses." },
    { name: "Sloth Titan Malakor", emoji: "👾", desc: "A colossal beast that lulls willpower to sleep." },
    { name: "Chronos the Distractor", emoji: "⏳", desc: "Steals precious minutes through endless scrolling." },
    { name: "Shadow of Apathy", emoji: "🌑", desc: "Whispers that today's routine doesn't matter." }
  ]
  const dayIndex = new Date().getDay() % bosses.length
  const boss = bosses[dayIndex]

  return {
    bossName: boss.name,
    bossEmoji: isDefeated ? "💀" : boss.emoji,
    bossDesc: boss.desc,
    maxHp,
    currentHp,
    damageDealt,
    hpPercentage: Math.max(0, Math.min(100, Math.round((currentHp / maxHp) * 100))),
    isDefeated,
    strikesLanded: completedHabits.length,
    strikesNeeded: dueHabits.length,
    bonusXpReward: 75
  }
}

// --- 3. MIDNIGHT URGENCY & COUNTDOWN ---
export const getUrgencyStatus = (dueHabitsCount = 0, completedCount = 0) => {
  const now = new Date()
  const midnight = new Date()
  midnight.setHours(24, 0, 0, 0)
  const diffMs = midnight - now

  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const pendingCount = Math.max(0, dueHabitsCount - completedCount)
  const isAllComplete = dueHabitsCount > 0 && pendingCount === 0

  let state = "calm" // calm | warning | emergency | triumphant
  let message = "Keep your momentum alive!"

  if (isAllComplete) {
    state = "triumphant"
    message = "All habits conquered today! Streak 100% secured. 🔥"
  } else if (hours < 3) {
    state = "emergency"
    message = `🚨 CRITICAL: Only ${hours}h ${minutes}m left to save your streak!`
  } else if (hours < 6) {
    state = "warning"
    message = `⚠️ Evening alert: ${pendingCount} habit${pendingCount > 1 ? "s" : ""} pending before midnight.`
  } else {
    state = "calm"
    message = `⏰ ${pendingCount} habit${pendingCount > 1 ? "s" : ""} left to conquer today.`
  }

  return {
    hours,
    minutes,
    seconds,
    totalSeconds,
    timeString: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
    state,
    message,
    pendingCount,
    isAllComplete
  }
}

// --- 4. SESSION COMBO SYSTEM ---
export const evaluateSessionCombo = (lastCompletionTimestamp = null) => {
  const now = Date.now()
  const COMBO_WINDOW_MS = 5 * 60 * 1000 // 5 minute window for combo

  if (!lastCompletionTimestamp) {
    return { isValid: false, windowRemainingMs: 0 }
  }

  const elapsed = now - lastCompletionTimestamp
  if (elapsed <= COMBO_WINDOW_MS) {
    return {
      isValid: true,
      windowRemainingMs: COMBO_WINDOW_MS - elapsed
    }
  }
  return { isValid: false, windowRemainingMs: 0 }
}

export const getComboDetails = (comboCount = 1) => {
  if (comboCount >= 4) {
    return { label: "GODLIKE COMBO! 👑", bonusXp: 30, soundPitchMultiplier: 1.6, color: "#F59E0B" }
  }
  if (comboCount === 3) {
    return { label: "TRIPLE COMBO! ⚡", bonusXp: 20, soundPitchMultiplier: 1.4, color: "#8B5CF6" }
  }
  if (comboCount === 2) {
    return { label: "DOUBLE COMBO! 🔥", bonusXp: 10, soundPitchMultiplier: 1.2, color: "#EF4444" }
  }
  return { label: null, bonusXp: 0, soundPitchMultiplier: 1.0, color: "transparent" }
}

// --- 5. HABI MASCOT DIALOGUE & MOOD ENGINE ---
export const getMascotState = ({
  dueHabitsCount = 0,
  completedCount = 0,
  streak = 0,
  urgencyState = "calm",
  comboCount = 1
}) => {
  const pendingCount = Math.max(0, dueHabitsCount - completedCount)
  const isAllComplete = dueHabitsCount > 0 && pendingCount === 0

  // 1. Mood
  let mood = "ready" // ready | hyped | panicking | urgent | godmode
  let quote = "Ready to conquer today? Let's get moving!"

  if (isAllComplete) {
    mood = "godmode"
    const godmodeQuotes = [
      "UNSTOPPABLE! 100% of habits crushed today! You are in absolute Godmode! 👑",
      "Look at that discipline! You didn't leave a single habit behind. Pure greatness!",
      "Sloth Titan defeated, streak secured, and crown earned! Take a bow!",
      "Perfection achieved! Your future self is cheering for you right now!"
    ]
    quote = godmodeQuotes[Math.floor(Math.random() * godmodeQuotes.length)]
  } else if (comboCount >= 2) {
    mood = "hyped"
    quote = `COMBO x${comboCount}! You are in the zone! Keep this fire going! 🔥`
  } else if (urgencyState === "emergency") {
    mood = "panicking"
    const emergencyQuotes = [
      "DUDE! Don't let our streak die tonight! You can do this in 5 minutes! 🚨",
      "I'm sweating feathers here! Midnight is creeping up fast! Save the flame!",
      "You came too far to lose your streak now! Knock out one habit right now!"
    ]
    quote = emergencyQuotes[Math.floor(Math.random() * emergencyQuotes.length)]
  } else if (urgencyState === "warning") {
    mood = "urgent"
    quote = `Evening is here! ${pendingCount} habit${pendingCount > 1 ? "s" : ""} left. Let's finish strong before night falls!`
  } else if (completedCount > 0) {
    mood = "hyped"
    quote = `Great check-in! ${completedCount}/${dueHabitsCount} done. Momentum is building! ⚡`
  } else {
    mood = "ready"
    if (streak >= 7) {
      quote = `A ${streak}-day streak! That's legendary! Let's make it ${streak + 1} today!`
    } else {
      quote = "Small steps every day create massive transformations. Which habit is first?"
    }
  }

  return { mood, quote }
}

// --- 6. MULTI-TIER STREAK FLAME RESOLVER ---
export const getStreakFlameTier = (streak = 0) => {
  if (streak >= 30) {
    return {
      tier: "godmode",
      name: "Godmode Sun Aura",
      color: "#F59E0B",
      gradient: "linear-gradient(135deg, #FFB800 0%, #FF4500 100%)",
      glowColor: "rgba(255, 184, 0, 0.6)",
      emoji: "☀️👑",
      badge: "Godmode Aura"
    }
  }
  if (streak >= 14) {
    return {
      tier: "plasma",
      name: "Violet Plasma Flame",
      color: "#8B5CF6",
      gradient: "linear-gradient(135deg, #A855F7 0%, #EC4899 100%)",
      glowColor: "rgba(139, 92, 246, 0.5)",
      emoji: "⚡💜",
      badge: "Plasma Flame"
    }
  }
  if (streak >= 7) {
    return {
      tier: "mystic",
      name: "Mystic Blue Fire",
      color: "#06B6D4",
      gradient: "linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)",
      glowColor: "rgba(6, 182, 212, 0.5)",
      emoji: "💠💙",
      badge: "Mystic Fire"
    }
  }
  if (streak >= 3) {
    return {
      tier: "blaze",
      name: "Blazing Flame",
      color: "#F97316",
      gradient: "linear-gradient(135deg, #F97316 0%, #EF4444 100%)",
      glowColor: "rgba(249, 115, 22, 0.4)",
      emoji: "🔥🔥",
      badge: "Blaze"
    }
  }
  return {
    tier: "spark",
    name: "Ignition Spark",
    color: "#EAB308",
    gradient: "linear-gradient(135deg, #FACC15 0%, #F97316 100%)",
    glowColor: "rgba(234, 179, 8, 0.3)",
    emoji: "🔥",
    badge: "Spark"
  }
}
