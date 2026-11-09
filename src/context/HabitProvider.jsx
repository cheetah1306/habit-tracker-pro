import React, { createContext, useContext, useEffect, useState } from "react"
import { BUILTIN_CATEGORIES } from "../data/categories"
import { evaluateAchievements } from "../lib/analytics"
import { addDaysToKey, todayKey } from "../lib/dates"
import { downloadBackup, readBackupFile } from "../lib/importExport"
import {
  createCompletionEntry,
  createCompletionKey,
  createHabitFromDraft,
  createId,
  getCurrentStreak,
  getDueHabitsForDate,
  getHabitCompletion,
  isHabitCompletedOnDate
} from "../lib/habits"
import { createProfileKey, findMatchingAccount, normalizeProfile } from "../lib/profile"
import {
  calculateCompletionXp,
  getLevelInfo,
  openMysteryChest
} from "../lib/gamification"
import { initNotifications, syncAllScheduledNotifications } from "../lib/notifications"
import {
  createDefaultState,
  createDefaultAuthState,
  loadAllAccounts,
  loadAuthState,
  normalizeStateSnapshot,
  saveAccountBackup,
  saveAuthState,
  saveStorageState
} from "../lib/storage"

const HabitContext = createContext(null)

const mergeAchievementChanges = (state) => {
  const { achievements, newlyUnlocked } = evaluateAchievements(state.habits, state.completions, state.achievements)
  return {
    nextState: {
      ...state,
      achievements
    },
    newlyUnlocked
  }
}

const buildCustomCategory = (draft) => ({
  id: `custom-${createId()}`,
  label: draft.customCategoryLabel.trim(),
  emoji: draft.customCategoryEmoji.trim() || "✨",
  color: draft.color,
  builtin: false
})

export const HabitProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => loadAuthState(BUILTIN_CATEGORIES))
  const [state, setState] = useState(
    () => auth.accounts[auth.activeProfileKey] ?? createDefaultState(BUILTIN_CATEGORIES)
  )
  const [recentAchievements, setRecentAchievements] = useState([])

  useEffect(() => {
    saveAuthState(auth)
  }, [auth])

  useEffect(() => {
    if (!auth.activeProfileKey) {
      return
    }

    const timer = setTimeout(() => {
      saveStorageState(state)
      saveAccountBackup(auth.activeProfileKey, state)

      setAuth((previous) => {
        const activeKey = previous.activeProfileKey
        if (!activeKey) return previous
        return {
          ...previous,
          accounts: {
            ...previous.accounts,
            [activeKey]: state
          }
        }
      })
    }, 150)

    return () => clearTimeout(timer)
  }, [auth.activeProfileKey, state])

  useEffect(() => {
    initNotifications()
  }, [])

  useEffect(() => {
    if (!state.habits?.length) {
      return
    }
    const timer = setTimeout(() => {
      syncAllScheduledNotifications(state.habits, state.completions).catch(console.warn)
    }, 2000)
    return () => clearTimeout(timer)
  }, [state.habits, state.completions])

  // Auto-protect streak with shield if yesterday had uncompleted habits
  useEffect(() => {
    setState((previous) => {
      const today = todayKey()
      const yesterday = addDaysToKey(today, -1)
      const shields = previous.gamification?.streakShields ?? 0

      if (shields <= 0) {
        return previous
      }

      if (previous.gamification?.frozenDates?.[yesterday]) {
        return previous
      }

      const activeHabits = previous.habits.filter((h) => !h.archivedAt)
      const yesterdayDue = getDueHabitsForDate(activeHabits, yesterday)
      if (!yesterdayDue.length) {
        return previous
      }

      const allCompleted = yesterdayDue.every((h) => isHabitCompletedOnDate(h, previous.completions, yesterday))
      if (allCompleted) {
        return previous
      }

      // Yesterday was missed! Auto-deploy streak shield to freeze yesterday
      return {
        ...previous,
        gamification: {
          ...previous.gamification,
          streakShields: shields - 1,
          frozenDates: {
            ...previous.gamification?.frozenDates,
            [yesterday]: true
          }
        }
      }
    })
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = "light"
    document.documentElement.dataset.contrast = state.settings.highContrast ? "high" : "default"
    document.documentElement.classList.remove("dark")
  }, [state.settings.highContrast])

  const withAchievementEvaluation = (updater) => {
    let actionResult = null
    const next = updater(state, (result) => {
      actionResult = result
    })
    const { nextState, newlyUnlocked } = mergeAchievementChanges(next)

    if (newlyUnlocked.length) {
      setRecentAchievements((current) => [...current, ...newlyUnlocked])
    }

    setState(nextState)
    return actionResult
  }

  const createHabit = (draft) =>
    withAchievementEvaluation((previous, setResult) => {
      const categories = [...previous.categories]
      let categoryId = draft.categoryId

      if (draft.categoryId === "custom" && draft.customCategoryLabel.trim()) {
        const existing = categories.find(
          (category) =>
            !category.builtin &&
            category.label.toLowerCase() === draft.customCategoryLabel.trim().toLowerCase()
        )

        if (existing) {
          categoryId = existing.id
        } else {
          const custom = buildCustomCategory(draft)
          categories.push(custom)
          categoryId = custom.id
        }
      }

      const habit = createHabitFromDraft({ ...draft, categoryId }, previous.settings)
      setResult({ type: "created", habit })
      return {
        ...previous,
        categories,
        habits: [habit, ...previous.habits]
      }
    })

  const updateHabit = (habitId, draft) =>
    withAchievementEvaluation((previous, setResult) => {
      const existingHabit = previous.habits.find((habit) => habit.id === habitId)
      if (!existingHabit) {
        return previous
      }

      const categories = [...previous.categories]
      let categoryId = draft.categoryId

      if (draft.categoryId === "custom" && draft.customCategoryLabel.trim()) {
        const existing = categories.find(
          (category) =>
            !category.builtin &&
            category.label.toLowerCase() === draft.customCategoryLabel.trim().toLowerCase()
        )

        if (existing) {
          categoryId = existing.id
        } else {
          const custom = buildCustomCategory(draft)
          categories.push(custom)
          categoryId = custom.id
        }
      }

      const nextHabit = createHabitFromDraft({ ...draft, categoryId }, previous.settings, existingHabit)
      setResult({ type: "updated", habit: nextHabit })

      return {
        ...previous,
        categories,
        habits: previous.habits.map((habit) => (habit.id === habitId ? nextHabit : habit))
      }
    })

  const archiveHabit = (habitId) =>
    withAchievementEvaluation((previous, setResult) => {
      setResult({ type: "archived", habitId })
      return {
        ...previous,
        habits: previous.habits.map((habit) =>
          habit.id === habitId
            ? { ...habit, archivedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
            : habit
        )
      }
    })

  const restoreHabit = (habitId) =>
    withAchievementEvaluation((previous, setResult) => {
      setResult({ type: "restored", habitId })
      return {
        ...previous,
        habits: previous.habits.map((habit) =>
          habit.id === habitId ? { ...habit, archivedAt: null, updatedAt: new Date().toISOString() } : habit
        )
      }
    })

  const deleteHabit = (habitId) =>
    withAchievementEvaluation((previous, setResult) => {
      const completions = { ...previous.completions }
      Object.keys(completions).forEach((key) => {
        if (key.startsWith(`${habitId}::`)) {
          delete completions[key]
        }
      })
      setResult({ type: "deleted", habitId })
      return {
        ...previous,
        habits: previous.habits.filter((habit) => habit.id !== habitId),
        completions
      }
    })

  const resetHabitStreak = (habitId) =>
    withAchievementEvaluation((previous, setResult) => {
      setResult({ type: "reset", habitId })
      return {
        ...previous,
        habits: previous.habits.map((habit) =>
          habit.id === habitId
            ? { ...habit, streakResetAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
            : habit
        )
      }
    })

const getCurrentWeekKey = () => {
  const d = new Date()
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(((date - yearStart) / 86400000 + 1) / 7)
  return `${date.getUTCFullYear()}-W${weekNo}`
}

const applyXpGain = (gamification, addedXp) => {
  const currentWeek = getCurrentWeekKey()
  const prevXp = gamification?.xp || 0
  const nextXp = prevXp + addedXp

  const isNewWeek = gamification?.weeklyXpWeek !== currentWeek
  const prevWeeklyXp = isNewWeek ? 0 : (gamification?.weeklyXp || 0)
  const nextWeeklyXp = prevWeeklyXp + addedXp

  const prevLevel = getLevelInfo(prevXp).level
  const nextLevelInfo = getLevelInfo(nextXp)
  const levelUp = nextLevelInfo.level > prevLevel

  let nextShields = gamification?.streakShields ?? 1
  if (levelUp) {
    nextShields += 1
  }

  const nextGamification = {
    ...gamification,
    xp: nextXp,
    weeklyXp: nextWeeklyXp,
    weeklyXpWeek: currentWeek,
    streakShields: nextShields
  }

  return {
    nextGamification,
    levelUp,
    nextLevelInfo
  }
}

  const awardCompletionXp = (previous, habit, comboBonusXp = 0) => {
    const habitStreak = getCurrentStreak(
      habit,
      previous.completions,
      todayKey(),
      previous.gamification?.frozenDates || {}
    )
    const { earnedXp, multiplier, multiplierLabel } = calculateCompletionXp(habit, habitStreak)
    const totalEarned = earnedXp + comboBonusXp
    const { nextGamification, levelUp, nextLevelInfo } = applyXpGain(previous.gamification, totalEarned)

    return {
      nextGamification,
      earnedXp: totalEarned,
      baseXp: earnedXp,
      comboBonusXp,
      multiplier,
      multiplierLabel,
      levelUp,
      newLevel: nextLevelInfo.level,
      levelTitle: nextLevelInfo.title,
      levelEmoji: nextLevelInfo.emoji
    }
  }

  const updateCompletionEntry = (previous, habitId, dateKey, updater) => {
    const entryKey = createCompletionKey(habitId, dateKey)
    const existing = getHabitCompletion(previous.completions, habitId, dateKey) ?? createCompletionEntry(habitId, dateKey)
    const nextEntry = updater(existing)
    return {
      ...previous.completions,
      [entryKey]: nextEntry
    }
  }

  const toggleHabit = (habitId, dateKey = todayKey(), comboBonusXp = 0) =>
    withAchievementEvaluation((previous, setResult) => {
      const habit = previous.habits.find((item) => item.id === habitId)
      if (!habit || habit.goalType === "count") {
        return previous
      }

      const completions = updateCompletionEntry(previous, habitId, dateKey, (entry) => {
        const nextCompleted = !entry.completed
        return {
          ...entry,
          progressCount: nextCompleted ? 1 : 0,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString() : null,
          events: [...entry.events, { at: new Date().toISOString(), delta: nextCompleted ? 1 : -1 }]
        }
      })

      const completedNow = completions[createCompletionKey(habitId, dateKey)].completed
      let gamificationData = null
      let nextGamification = previous.gamification

      if (completedNow) {
        const xpInfo = awardCompletionXp(previous, habit, comboBonusXp)
        nextGamification = xpInfo.nextGamification
        gamificationData = xpInfo
      }

      setResult({
        type: completedNow ? "completed" : "unchecked",
        habit,
        dateKey,
        completedNow,
        ...(gamificationData || {})
      })

      const reminderSkips = { ...previous.reminderSkips }
      delete reminderSkips[`${habitId}::${dateKey}`]

      return {
        ...previous,
        completions,
        reminderSkips,
        gamification: nextGamification
      }
    })

  const incrementHabitProgress = (habitId, dateKey = todayKey(), comboBonusXp = 0) =>
    withAchievementEvaluation((previous, setResult) => {
      const habit = previous.habits.find((item) => item.id === habitId)
      if (!habit) {
        return previous
      }

      const existing = getHabitCompletion(previous.completions, habitId, dateKey)
      const completions = updateCompletionEntry(previous, habitId, dateKey, (entry) => {
        const progress = Math.min(habit.goalTarget, entry.progressCount + 1)
        const completed = progress >= habit.goalTarget
        return {
          ...entry,
          progressCount: progress,
          completed,
          completedAt: completed ? entry.completedAt || new Date().toISOString() : null,
          events: [...entry.events, { at: new Date().toISOString(), delta: 1 }]
        }
      })

      const nextEntry = completions[createCompletionKey(habitId, dateKey)]
      const completedNow = nextEntry.completed && (!existing || !existing.completed)
      let gamificationData = null
      let nextGamification = previous.gamification

      if (completedNow) {
        const xpInfo = awardCompletionXp(previous, habit, comboBonusXp)
        nextGamification = xpInfo.nextGamification
        gamificationData = xpInfo
      }

      setResult({
        type: nextEntry.completed ? "completed" : "progress",
        habit,
        dateKey,
        completedNow,
        progress: nextEntry.progressCount,
        ...(gamificationData || {})
      })

      const reminderSkips = { ...previous.reminderSkips }
      delete reminderSkips[`${habitId}::${dateKey}`]

      return {
        ...previous,
        completions,
        reminderSkips,
        gamification: nextGamification
      }
    })

  const decrementHabitProgress = (habitId, dateKey = todayKey()) =>
    withAchievementEvaluation((previous, setResult) => {
      const habit = previous.habits.find((item) => item.id === habitId)
      if (!habit) {
        return previous
      }

      const completions = updateCompletionEntry(previous, habitId, dateKey, (entry) => {
        const progress = Math.max(0, entry.progressCount - 1)
        return {
          ...entry,
          progressCount: progress,
          completed: progress >= habit.goalTarget,
          completedAt: progress >= habit.goalTarget ? entry.completedAt : null,
          events: [...entry.events, { at: new Date().toISOString(), delta: -1 }]
        }
      })

      setResult({ type: "progress", habit, dateKey, completedNow: false })
      return {
        ...previous,
        completions
      }
    })

  const completeHabit = (habitId, dateKey = todayKey()) =>
    withAchievementEvaluation((previous, setResult) => {
      const habit = previous.habits.find((item) => item.id === habitId)
      if (!habit) {
        return previous
      }

      const existing = getHabitCompletion(previous.completions, habitId, dateKey)
      const wasCompleted = Boolean(existing?.completed)

      const completions = updateCompletionEntry(previous, habitId, dateKey, (entry) => ({
        ...entry,
        progressCount: habit.goalTarget,
        completed: true,
        completedAt: entry.completedAt || new Date().toISOString(),
        events: [...entry.events, { at: new Date().toISOString(), delta: 1 }]
      }))

      let gamificationData = null
      let nextGamification = previous.gamification

      if (!wasCompleted) {
        const xpInfo = awardCompletionXp(previous, habit)
        nextGamification = xpInfo.nextGamification
        gamificationData = xpInfo
      }

      const reminderSkips = { ...previous.reminderSkips }
      delete reminderSkips[`${habitId}::${dateKey}`]
      setResult({
        type: "completed",
        habit,
        dateKey,
        completedNow: !wasCompleted,
        ...(gamificationData || {})
      })

      return {
        ...previous,
        completions,
        reminderSkips,
        gamification: nextGamification
      }
    })

  const saveCompletionNote = (habitId, dateKey, note) =>
    withAchievementEvaluation((previous) => ({
      ...previous,
      completions: updateCompletionEntry(previous, habitId, dateKey, (entry) => ({
        ...entry,
        note: note.slice(0, 200)
      }))
    }))

  const skipHabitForToday = (habitId, dateKey = todayKey()) =>
    withAchievementEvaluation((previous, setResult) => {
      setResult({ type: "skipped", habitId, dateKey })
      return {
        ...previous,
        reminderSkips: {
          ...previous.reminderSkips,
          [`${habitId}::${dateKey}`]: true
        }
      }
    })

  const updateSettings = (patch) => {
    setState((previous) => ({
      ...previous,
      settings: {
        ...previous.settings,
        ...patch
      }
    }))
  }

  const authenticate = (profile) => {
    const nextProfile = normalizeProfile(profile)
    if (!nextProfile) {
      return null
    }

    const profileKey = createProfileKey(nextProfile)
    if (!profileKey) {
      return null
    }

    // 1. Reload the freshest accounts from ALL sources: Auth state, localStorage backups, and data keys
    const allAccounts = {
      ...loadAllAccounts(BUILTIN_CATEGORIES),
      ...auth.accounts
    }

    // 2. Find matching account using exact key AND deep 4-field check (name, age, dob, gender)
    const match = findMatchingAccount(allAccounts, nextProfile)

    let nextState
    let isExisting = false

    if (match && match.account) {
      // PREVIOUS DATA FOUND! Restore all habits, completions, XP, levels, achievements, etc.
      nextState = normalizeStateSnapshot(match.account, BUILTIN_CATEGORIES)
      nextState.profile = nextProfile
      isExisting = true
    } else {
      // BRAND NEW USER
      nextState = {
        ...createDefaultState(BUILTIN_CATEGORIES),
        profile: nextProfile
      }
      isExisting = false
    }

    const nextAccounts = {
      ...allAccounts,
      [profileKey]: nextState
    }

    const nextAuth = {
      activeProfileKey: profileKey,
      accounts: nextAccounts
    }

    // 3. Persist synchronously to localStorage and per-account backup immediately
    saveAuthState(nextAuth)
    saveAccountBackup(profileKey, nextState)
    saveStorageState(nextState)

    // 4. Update React states
    setAuth(nextAuth)
    setState(nextState)
    setRecentAchievements([])

    return {
      ...nextState,
      isExisting
    }
  }

  const logout = () => {
    // 1. Get latest auth and active key
    const currentAuth = loadAuthState(BUILTIN_CATEGORIES)
    const activeKey = auth.activeProfileKey ?? (state.profile ? createProfileKey(state.profile) : null)

    // 2. CRITICAL: Save current state to accounts so NO habits/completions/XP/streaks are lost
    let updatedAccounts = {
      ...currentAuth.accounts,
      ...auth.accounts
    }

    if (activeKey) {
      const profileToSave = normalizeProfile(state.profile) || currentAuth.accounts[activeKey]?.profile
      const accountSnapshot = {
        ...state,
        profile: profileToSave
      }
      updatedAccounts[activeKey] = accountSnapshot
      saveAccountBackup(activeKey, accountSnapshot)
    }

    const nextAuth = {
      ...currentAuth,
      activeProfileKey: null,
      accounts: updatedAccounts
    }

    // 3. Immediately persist to localStorage
    saveAuthState(nextAuth)

    // 4. Reset active session state
    setAuth(nextAuth)
    setState(createDefaultState(BUILTIN_CATEGORIES))
    setRecentAchievements([])
  }

  const updateProfile = (profile) => {
    const nextProfile = normalizeProfile(profile)
    if (!nextProfile) {
      return
    }

    const nextKey = createProfileKey(nextProfile)
    if (!nextKey) {
      return
    }

    const previousKey = auth.activeProfileKey ?? createProfileKey(state.profile)
    const nextState = {
      ...state,
      profile: nextProfile
    }

    const storedAuth = loadAuthState(BUILTIN_CATEGORIES)
    const accounts = {
      ...storedAuth.accounts,
      ...auth.accounts
    }

    if (previousKey && previousKey !== nextKey) {
      delete accounts[previousKey]
    }

    accounts[nextKey] = nextState

    const nextAuth = {
      activeProfileKey: nextKey,
      accounts
    }

    saveAuthState(nextAuth)
    saveStorageState(nextState)

    setAuth(nextAuth)
    setState(nextState)
  }

  const applyTemplate = (template) =>
    withAchievementEvaluation((previous, setResult) => {
      const habits = template.habits.map((draft) => createHabitFromDraft(draft, previous.settings))
      setResult({ type: "template", template })
      return {
        ...previous,
        habits: [...habits, ...previous.habits]
      }
    })

  const exportData = () => {
    downloadBackup(state)
  }

  const importData = async (file) => {
    const imported = await readBackupFile(file)
    setState(imported)
  }

  const clearAllData = () => {
    setAuth(createDefaultAuthState())
    setState(createDefaultState(BUILTIN_CATEGORIES))
    setRecentAchievements([])
  }

  const claimQuestReward = (questId, xpReward, dateKey = todayKey()) => {
    const claimedForDate = state.gamification?.claimedQuests?.[dateKey] || []
    if (claimedForDate.includes(questId)) {
      return null
    }

    const { nextGamification, levelUp, nextLevelInfo } = applyXpGain(state.gamification, xpReward)

    const finalGamification = {
      ...nextGamification,
      claimedQuests: {
        ...nextGamification.claimedQuests,
        [dateKey]: [...claimedForDate, questId]
      }
    }

    const actionResult = {
      type: "quest_claimed",
      questId,
      xpReward,
      levelUp,
      newLevel: nextLevelInfo.level,
      levelTitle: nextLevelInfo.title,
      levelEmoji: nextLevelInfo.emoji
    }

    setState((previous) => ({
      ...previous,
      gamification: finalGamification
    }))

    return actionResult
  }

  const openDailyChest = (dateKey = todayKey()) => {
    if (state.gamification?.claimedDailyChestDate === dateKey) {
      return null
    }

    const chestReward = openMysteryChest(dateKey)
    const { nextGamification, levelUp, nextLevelInfo } = applyXpGain(state.gamification, chestReward.xpReward)

    const finalGamification = {
      ...nextGamification,
      claimedDailyChestDate: dateKey
    }

    const actionResult = {
      type: "chest_opened",
      ...chestReward,
      levelUp,
      newLevel: nextLevelInfo.level,
      levelTitle: nextLevelInfo.title,
      levelEmoji: nextLevelInfo.emoji
    }

    setState((previous) => ({
      ...previous,
      gamification: finalGamification
    }))

    return actionResult
  }

  const claimBossReward = (bonusXp = 75, dateKey = todayKey()) => {
    if (state.gamification?.claimedBossRewards?.[dateKey]) {
      return null
    }

    const { nextGamification, levelUp, nextLevelInfo } = applyXpGain(state.gamification, bonusXp)

    const finalGamification = {
      ...nextGamification,
      claimedBossRewards: {
        ...nextGamification.claimedBossRewards,
        [dateKey]: true
      }
    }

    const actionResult = {
      type: "boss_reward_claimed",
      bonusXp,
      levelUp,
      newLevel: nextLevelInfo.level,
      levelTitle: nextLevelInfo.title,
      levelEmoji: nextLevelInfo.emoji
    }

    setState((previous) => ({
      ...previous,
      gamification: finalGamification
    }))

    return actionResult
  }

  const clearRecentAchievement = (achievementId) => {
    setRecentAchievements((current) => current.filter((item) => item.id !== achievementId))
  }

  return (
    <HabitContext.Provider
      value={{
        ...state,
        createHabit,
        updateHabit,
        archiveHabit,
        restoreHabit,
        deleteHabit,
        resetHabitStreak,
        toggleHabit,
        incrementHabitProgress,
        decrementHabitProgress,
        completeHabit,
        saveCompletionNote,
        skipHabitForToday,
        updateSettings,
        authenticate,
        logout,
        updateProfile,
        exportData,
        importData,
        clearAllData,
        applyTemplate,
        claimQuestReward,
        openDailyChest,
        claimBossReward,
        isAuthenticated: Boolean(auth.activeProfileKey),
        activeProfileKey: auth.activeProfileKey,
        recentAchievements,
        clearRecentAchievement
      }}
    >
      {children}
    </HabitContext.Provider>
  )
}

export const useHabitStore = () => {
  const context = useContext(HabitContext)
  if (!context) {
    throw new Error("useHabitStore must be used within HabitProvider")
  }
  return context
}
