import React, { Suspense, lazy, useEffect, useMemo, useState } from "react"
import { addMonths } from "date-fns"
import confetti from "canvas-confetti"
import { BarChart3, Home, Plus, Settings2 } from "lucide-react"
import { HabitProvider, useHabitStore } from "./context/HabitProvider"
import { HABIT_TEMPLATES } from "./data/templates"
import { usePersistentState } from "./hooks/usePersistentState"
import { useReminders } from "./hooks/useReminders"
import {
  getAchievementCards,
  getAverageStreak,
  getBestDayOfWeek,
  getBestHabit,
  getCategoryBreakdown,
  getDayInspection,
  getHeatmapData,
  getMonthlyTrend,
  getMotivationMessage,
  getTodayOverview,
  getTrendingHabits,
  getWeeklyChart
} from "./lib/analytics"
import { formatDateHeading, formatMonthHeading, getMonthDayKeys, isSameMonth, todayKey } from "./lib/dates"
import {
  getCurrentStreak,
  getHabitCategory,
  getHabitStatusForDate,
  getLastCompletedAt,
  getPerfectDayStreak,
  isHabitDueOnDate
} from "./lib/habits"
import { createProfileDraft } from "./lib/profile"
import { loadUiState, saveUiState } from "./lib/storage"
import { createHabitDraft } from "./components/HabitForm"
import { ProfileEditorModal, ProfileSetupScreen, ProfileSummaryButton } from "./components/ProfileUI"
import { ReminderTray } from "./components/ReminderTray"
import { ToastStack } from "./components/ToastStack"
import { TodayView } from "./components/TodayView"
import { FloatingXp } from "./components/FloatingXp"
import { LevelUpModal } from "./components/LevelUpModal"
import { MysteryChestModal } from "./components/MysteryChestModal"
import { GodmodeCelebrationModal } from "./components/GodmodeCelebrationModal"
import { StartupSplash } from "./components/StartupSplash"
import {
  playChestOpenSound,
  playHabitCheckSound,
  playLevelUpSound,
  playQuestCompleteSound,
  playComboSound,
  playBossHitSound,
  playBossDefeatedSound
} from "./lib/audio"
import {
  getDailyQuests,
  getLevelInfo,
  getStreakMultiplier
} from "./lib/gamification"
import {
  getBossBattleState,
  getUrgencyStatus,
  evaluateSessionCombo,
  getComboDetails,
  getMascotState
} from "./lib/godmode"
import {
  checkNotificationPermission,
  requestNotificationPermission
} from "./lib/notifications"
import {
  exitNativeApp,
  registerBackButtonHandler,
  triggerHaptic,
  updateStatusBarTheme
} from "./lib/mobile"

const AnalyticsView = lazy(() => import("./components/AnalyticsView").then((module) => ({ default: module.AnalyticsView })))
const HabitDrawer = lazy(() => import("./components/HabitDrawer").then((module) => ({ default: module.HabitDrawer })))
const HabitModal = lazy(() => import("./components/HabitModal").then((module) => ({ default: module.HabitModal })))
const SettingsView = lazy(() => import("./components/SettingsView").then((module) => ({ default: module.SettingsView })))

const navItems = [
  { id: "today", label: "Today", icon: Home },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings2 }
]

const difficultyRank = {
  hard: 3,
  medium: 2,
  easy: 1
}

const frequencyRank = {
  daily: 0,
  interval: 1,
  weekly: 2,
  custom: 3
}

const draftFromHabit = (habit) => ({
  name: habit.name,
  description: habit.description,
  categoryId: habit.categoryId,
  customCategoryLabel: habit.customCategoryLabel || "",
  customCategoryEmoji: habit.customCategoryEmoji || "",
  color: habit.color,
  difficulty: habit.difficulty,
  goalType: habit.goalType,
  goalTarget: habit.goalTarget,
  schedule: habit.schedule,
  reminderTime: habit.reminderTime || ""
})

const sortHabitCards = (cards, sort) => {
  const list = [...cards]
  list.sort((left, right) => {
    if (sort === "name") {
      return left.habit.name.localeCompare(right.habit.name)
    }
    if (sort === "frequency") {
      return (
        (frequencyRank[left.habit.schedule.mode] ?? 99) - (frequencyRank[right.habit.schedule.mode] ?? 99) ||
        left.habit.name.localeCompare(right.habit.name)
      )
    }
    if (sort === "difficulty") {
      return (
        (difficultyRank[right.habit.difficulty] ?? 0) - (difficultyRank[left.habit.difficulty] ?? 0) ||
        right.streak - left.streak
      )
    }
    return right.streak - left.streak || left.habit.name.localeCompare(right.habit.name)
  })
  return list
}

const formatRelativeLabel = (value) => {
  if (!value) {
    return "Not completed yet"
  }

  return new Date(value).toDateString() === new Date().toDateString()
    ? `Completed ${new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
    : `Completed on ${new Date(value).toLocaleDateString()}`
}

const PanelFallback = () => (
  <div className="surface rounded-[28px] p-6">
    <p className="text-sm font-semibold" style={{ color: "var(--ink-soft)" }}>
      Loading view...
    </p>
  </div>
)

const createInitialUiState = (settings) => {
  const stored = loadUiState()
  const initialMonth = new Date(stored.heatmapMonth ?? stored.historyMonth ?? new Date().toISOString())
  const fallbackDateKey = isSameMonth(initialMonth, new Date()) ? todayKey() : getMonthDayKeys(initialMonth)[0] ?? todayKey()
  const selectedDateKey =
    stored.selectedDateKey && isSameMonth(stored.selectedDateKey, initialMonth)
      ? stored.selectedDateKey
      : fallbackDateKey

  return {
    activeTab: "today",
    filter: stored.filter ?? settings.dashboardFilter,
    categoryFilter: stored.categoryFilter ?? "all",
    sort: stored.sort ?? settings.habitSort,
    selectedHabitId: null,
    modalMode: null,
    selectedDateKey,
    heatmapMonth: initialMonth.toISOString(),
    draft: stored.draft ?? createHabitDraft(settings)
  }
}

const AuthenticatedHabitApp = ({ store, showSplash, pushToast }) => {
  const [uiState, setUiState] = usePersistentState(
    () => createInitialUiState(store.settings),
    saveUiState,
    createInitialUiState(store.settings)
  )
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [profileDraft, setProfileDraft] = useState(() => createProfileDraft(store.profile))
  const [floatingXpItems, setFloatingXpItems] = useState([])
  const [levelUpModalInfo, setLevelUpModalInfo] = useState(null)
  const [chestModalOpen, setChestModalOpen] = useState(false)
  const [notificationGranted, setNotificationGranted] = useState(true)
  const [comboState, setComboState] = useState({ count: 0, lastTime: null })
  const [godmodeCelebrationOpen, setGodmodeCelebrationOpen] = useState(false)
  const [godmodeCelebratedDate, setGodmodeCelebratedDate] = useState(null)



  useEffect(() => {
    checkNotificationPermission().then(setNotificationGranted)
  }, [])

  useEffect(() => {
    updateStatusBarTheme(false)
  }, [])

  useEffect(() => {
    const unbind = registerBackButtonHandler(() => {
      if (godmodeCelebrationOpen) {
        setGodmodeCelebrationOpen(false)
        return
      }
      if (levelUpModalInfo) {
        setLevelUpModalInfo(null)
        return
      }
      if (chestModalOpen) {
        setChestModalOpen(false)
        return
      }
      if (profileModalOpen) {
        setProfileModalOpen(false)
        return
      }
      if (uiState.selectedHabitId) {
        setUiState((c) => ({ ...c, selectedHabitId: null }))
        return
      }
      if (uiState.modalMode) {
        setUiState((c) => ({ ...c, modalMode: null }))
        return
      }
      if (uiState.activeTab !== "today") {
        setUiState((c) => ({ ...c, activeTab: "today" }))
        return
      }
      exitNativeApp()
    })
    return unbind
  }, [chestModalOpen, godmodeCelebrationOpen, levelUpModalInfo, profileModalOpen, uiState.activeTab, uiState.modalMode, uiState.selectedHabitId, setUiState])

  useEffect(() => {
    if (!store.recentAchievements.length) {
      return
    }

    const achievement = store.recentAchievements[0]
    pushToast({
      title: `${achievement.icon} ${achievement.label} unlocked`,
      message: achievement.description,
      tone: "success",
      icon: achievement.icon
    })
    store.clearRecentAchievement(achievement.id)
  }, [store.recentAchievements, pushToast])

  useEffect(() => {
    if (!profileModalOpen) {
      setProfileDraft(createProfileDraft(store.profile))
    }
  }, [profileModalOpen, store.profile])

  useEffect(() => {
    setUiState(createInitialUiState(store.settings))
    setProfileDraft(createProfileDraft(store.profile))
    setProfileModalOpen(false)
  }, [store.activeProfileKey])

  useEffect(() => {
    if (!store.habits.some((habit) => habit.id === uiState.selectedHabitId)) {
      setUiState((current) => ({ ...current, selectedHabitId: null }))
    }
  }, [store.habits, uiState.selectedHabitId, setUiState])

  const celebrateCompletion = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return
    }
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.18 },
      colors: ["#10b981", "#f59e0b", "#1a1f3a"]
    })
  }

  const handleActionResult = (result, comboCount = 1, comboDetails = null) => {
    if (!result) {
      return
    }

    if (result.earnedXp) {
      const xpId = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      setFloatingXpItems((curr) => [
        ...curr,
        { id: xpId, xp: result.earnedXp, multiplier: result.multiplier }
      ])
      window.setTimeout(() => {
        setFloatingXpItems((curr) => curr.filter((i) => i.id !== xpId))
      }, 1400)
    }

    if (result.levelUp) {
      triggerHaptic("heavy")
      setLevelUpModalInfo({
        level: result.newLevel,
        title: result.levelTitle,
        emoji: result.levelEmoji,
        totalXp: (store.gamification?.xp || 0) + (result.earnedXp || result.xpReward || 0)
      })
      playLevelUpSound(store.settings.soundEnabled)
    }

    if (result.type === "quest_claimed") {
      triggerHaptic("success")
      playQuestCompleteSound(store.settings.soundEnabled)
      celebrateCompletion()
      pushToast({
        title: "Quest Completed!",
        message: `+${result.xpReward} XP claimed successfully`,
        tone: "success",
        icon: "⚔️"
      })
      return result
    }

    if (result.type === "chest_opened") {
      triggerHaptic("medium")
      playChestOpenSound(store.settings.soundEnabled)
      pushToast({
        title: "Daily Chest Opened!",
        message: `+${result.xpReward} XP bonus granted`,
        tone: "success",
        icon: "🎁"
      })
      return result
    }

    if (result.type === "boss_reward_claimed") {
      triggerHaptic("heavy")
      playBossDefeatedSound(store.settings.soundEnabled)
      celebrateCompletion()
      pushToast({
        title: "Boss Slayer Loot Claimed! 💀💥",
        message: `+${result.bonusXp} Boss Slayer XP awarded!`,
        tone: "success",
        icon: "🏆"
      })
      return result
    }

    if (result.type === "completed" && result.completedNow) {
      triggerHaptic("success")
      celebrateCompletion()
      playBossHitSound(store.settings.soundEnabled)

      if (comboCount >= 2) {
        playComboSound(comboCount, store.settings.soundEnabled)
        pushToast({
          title: comboDetails?.label || `COMBO x${comboCount}!`,
          message: `Logged at ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} • +${result.earnedXp} XP (Combo bonus!)`,
          tone: "success",
          icon: "🔥"
        })
      } else {
        playHabitCheckSound(store.settings.soundEnabled)
        pushToast({
          title: "Habit logged",
          message: `Logged at ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} • +${result.earnedXp || 20} XP`,
          tone: "success",
          icon: "✓"
        })
      }

      // Check if all habits due today are completed for Godmode celebration!
      const activeDue = store.habits.filter((h) => !h.archivedAt && isHabitDueOnDate(h, currentDateKey))
      const doneCount = activeDue.filter((h) => {
        if (h.id === result.habit.id) return true
        const entry = store.completions[`${h.id}::${currentDateKey}`]
        return entry?.completed
      }).length

      if (activeDue.length > 0 && doneCount >= activeDue.length && godmodeCelebratedDate !== currentDateKey) {
        setGodmodeCelebratedDate(currentDateKey)
        setGodmodeCelebrationOpen(true)
      }
      return
    }

    if (result.type === "unchecked" || result.type === "progress") {
      triggerHaptic("light")
    }

    if (result.type === "created") {
      pushToast({ title: "Habit created", message: result.habit.name, tone: "success", icon: "✨" })
    } else if (result.type === "updated") {
      pushToast({ title: "Habit updated", message: result.habit.name, icon: "✎" })
    } else if (result.type === "template") {
      pushToast({ title: "Template applied", message: result.template.label, tone: "success", icon: "📦" })
    } else if (result.type === "archived") {
      pushToast({ title: "Habit archived", tone: "warning", icon: "🗂️" })
    } else if (result.type === "restored") {
      pushToast({ title: "Habit restored", tone: "success", icon: "♻️" })
    } else if (result.type === "deleted") {
      pushToast({ title: "Habit deleted", tone: "danger", icon: "🗑️" })
    } else if (result.type === "reset") {
      pushToast({ title: "Streak reset", tone: "warning", icon: "🔥" })
    } else if (result.type === "skipped") {
      pushToast({ title: "Reminder skipped for today", tone: "warning", icon: "⏭️" })
    }
    return result
  }



  const handleProfileSave = (nextProfile) => {
    store.updateProfile(nextProfile)
    setProfileDraft(createProfileDraft(nextProfile))
    setProfileModalOpen(false)
    pushToast({
      title: "Profile updated",
      message: nextProfile.name,
      tone: "success",
      icon: "✎"
    })
  }

  const handleLogout = () => {
    store.logout()
    setProfileDraft(createProfileDraft())
    setProfileModalOpen(false)
    pushToast({
      title: "Logged out",
      message: "Your profile is safely saved on this device.",
      tone: "warning",
      icon: "⎋"
    })
  }

  const openProfileEditor = () => {
    setProfileDraft(createProfileDraft(store.profile))
    setProfileModalOpen(true)
  }

  const closeProfileEditor = () => {
    setProfileModalOpen(false)
  }

  const reminders = useReminders({
    habits: store.habits,
    categories: store.categories,
    completions: store.completions,
    reminderSkips: store.reminderSkips,
    completeHabit: (habitId) => {
      const isCombo = evaluateSessionCombo(comboState.lastTime)
      const nextCount = isCombo.isValid ? comboState.count + 1 : 1
      const combo = getComboDetails(nextCount)
      setComboState({ count: nextCount, lastTime: Date.now() })
      handleActionResult(store.completeHabit(habitId), nextCount, combo)
    },
    skipHabitForToday: (habitId) => handleActionResult(store.skipHabitForToday(habitId))
  })

  const currentDateKey = todayKey()
  const heatmapMonthDate = useMemo(() => new Date(uiState.heatmapMonth), [uiState.heatmapMonth])
  const todaySummary = useMemo(() => getTodayOverview(store.habits, store.completions, currentDateKey), [store.habits, store.completions, currentDateKey])
  const perfectDayStreak = useMemo(() => getPerfectDayStreak(store.habits, store.completions), [store.habits, store.completions])
  const levelInfo = useMemo(() => getLevelInfo(store.gamification?.xp || 0), [store.gamification?.xp])
  const streakMultiplier = useMemo(() => getStreakMultiplier(perfectDayStreak), [perfectDayStreak])
  const quests = useMemo(() => getDailyQuests(
    store.habits,
    store.completions,
    store.gamification?.claimedQuests?.[currentDateKey] || [],
    currentDateKey
  ), [store.habits, store.completions, store.gamification?.claimedQuests, currentDateKey])
  const bossState = useMemo(() => getBossBattleState(store.habits, store.completions, currentDateKey), [store.habits, store.completions, currentDateKey])
  const isBossRewardClaimed = Boolean(store.gamification?.claimedBossRewards?.[currentDateKey])
  const urgencyStatus = useMemo(() => getUrgencyStatus(todaySummary.due, todaySummary.completed), [todaySummary.due, todaySummary.completed])
  const mascotState = useMemo(() => getMascotState({
    dueHabitsCount: todaySummary.due,
    completedCount: todaySummary.completed,
    streak: perfectDayStreak,
    urgencyState: urgencyStatus.state,
    comboCount: comboState.count
  }), [todaySummary.due, todaySummary.completed, perfectDayStreak, urgencyStatus.state, comboState.count])

  // Weekly chart
  const weeklyChart = useMemo(() => getWeeklyChart(store.habits, store.completions), [store.habits, store.completions])
  const weeklyCompletion = useMemo(() => {
    const totalDue = weeklyChart.reduce((sum, day) => sum + day.due, 0)
    const totalCompleted = weeklyChart.reduce((sum, day) => sum + day.completed, 0)
    return totalDue > 0 ? Math.round((totalCompleted / totalDue) * 100) : 0
  }, [weeklyChart])

  const userWeeklyXp = Math.max(0, store.gamification?.weeklyXp || 0)

  // ONLY compute heavy analytics when on the analytics tab!
  const isAnalyticsTab = uiState.activeTab === "analytics"
  const analyticsMonthKeys = useMemo(() => isAnalyticsTab ? getMonthDayKeys(heatmapMonthDate) : [], [isAnalyticsTab, heatmapMonthDate])
  const analyticsHeatmapData = useMemo(() => isAnalyticsTab ? getHeatmapData(store.habits, store.completions, analyticsMonthKeys) : [], [isAnalyticsTab, store.habits, store.completions, analyticsMonthKeys])
  const monthlyTrend = useMemo(() => isAnalyticsTab ? getMonthlyTrend(store.habits, store.completions, analyticsMonthKeys) : [], [isAnalyticsTab, store.habits, store.completions, analyticsMonthKeys])
  const categoryBreakdown = useMemo(() => isAnalyticsTab ? getCategoryBreakdown(store.habits, store.completions, store.categories) : [], [isAnalyticsTab, store.habits, store.completions, store.categories])
  const averageStreak = useMemo(() => isAnalyticsTab ? getAverageStreak(store.habits, store.completions) : 0, [isAnalyticsTab, store.habits, store.completions])
  const bestDay = useMemo(() => isAnalyticsTab ? getBestDayOfWeek(store.habits, store.completions) : "", [isAnalyticsTab, store.habits, store.completions])
  const trendingHabits = useMemo(() => isAnalyticsTab ? getTrendingHabits(store.habits, store.completions) : [], [isAnalyticsTab, store.habits, store.completions])
  const bestHabit = useMemo(() => isAnalyticsTab ? getBestHabit(store.habits, store.completions) : null, [isAnalyticsTab, store.habits, store.completions])
  const achievements = useMemo(() => isAnalyticsTab ? getAchievementCards(store.habits, store.completions, store.achievements) : [], [isAnalyticsTab, store.habits, store.completions, store.achievements])
  const motivation = useMemo(() => isAnalyticsTab ? getMotivationMessage(store.habits, store.completions) : "", [isAnalyticsTab, store.habits, store.completions])
  const dayInspection = useMemo(() => isAnalyticsTab ? getDayInspection(
    store.habits.filter((habit) => !habit.archivedAt),
    store.completions,
    store.categories,
    uiState.selectedDateKey
  ) : null, [isAnalyticsTab, store.habits, store.completions, store.categories, uiState.selectedDateKey])

  const selectedHabit = useMemo(() => store.habits.find((habit) => habit.id === uiState.selectedHabitId) || null, [store.habits, uiState.selectedHabitId])
  const selectedCategory = useMemo(() => selectedHabit ? getHabitCategory(selectedHabit, store.categories) : null, [selectedHabit, store.categories])
  const archivedHabits = useMemo(() => store.habits.filter((habit) => habit.archivedAt), [store.habits])

  const sortedDueCards = useMemo(() => {
    const cards = store.habits
      .filter((habit) => !habit.archivedAt && isHabitDueOnDate(habit, currentDateKey))
      .map((habit) => {
        const category = getHabitCategory(habit, store.categories)
        const status = getHabitStatusForDate(habit, store.completions, currentDateKey)
        return {
          habit,
          category,
          status,
          streak: getCurrentStreak(habit, store.completions),
          lastCompletedLabel: formatRelativeLabel(getLastCompletedAt(habit, store.completions))
        }
      })
      .filter((item) => {
        if (uiState.filter === "completed" && !item.status.completed) {
          return false
        }
        if (uiState.filter === "incomplete" && item.status.completed) {
          return false
        }
        if (uiState.categoryFilter !== "all" && item.category.id !== uiState.categoryFilter) {
          return false
        }
        return true
      })

    return sortHabitCards(cards, uiState.sort)
  }, [store.habits, store.completions, store.categories, currentDateKey, uiState.filter, uiState.categoryFilter, uiState.sort])

  const setActiveTab = (activeTab) => {
    triggerHaptic("light")
    setUiState((current) => ({ ...current, activeTab }))
  }
  const setHeatmapMonth = (nextDate, selectedDateKey = getMonthDayKeys(nextDate)[0] ?? todayKey()) =>
    setUiState((current) => ({
      ...current,
      heatmapMonth: nextDate.toISOString(),
      selectedDateKey
    }))
  const moveToPreviousHeatmapMonth = () => {
    const nextDate = addMonths(heatmapMonthDate, -1)
    setHeatmapMonth(nextDate)
  }
  const moveToNextHeatmapMonth = () => {
    const nextDate = addMonths(heatmapMonthDate, 1)
    if (!isSameMonth(nextDate, new Date()) && nextDate > new Date()) {
      return
    }
    setHeatmapMonth(nextDate)
  }
  const resetToCurrentHeatmapMonth = () => setHeatmapMonth(new Date(), todayKey())
  const canMoveToNextHeatmapMonth = !isSameMonth(heatmapMonthDate, new Date())

  const openCreateModal = () =>
    setUiState((current) => ({
      ...current,
      modalMode: "create",
      draft: createHabitDraft(store.settings)
    }))

  const openEditModal = (habit) =>
    setUiState((current) => ({
      ...current,
      modalMode: "edit",
      draft: draftFromHabit(habit)
    }))

  const closeModal = () => setUiState((current) => ({ ...current, modalMode: null }))

  const submitModal = () => {
    if (uiState.modalMode === "edit" && selectedHabit) {
      handleActionResult(store.updateHabit(selectedHabit.id, uiState.draft))
    } else {
      handleActionResult(store.createHabit(uiState.draft))
    }
    closeModal()
  }

  const applyTemplate = (template) => {
    handleActionResult(store.applyTemplate(template))
    closeModal()
  }

  const handleImport = async (file) => {
    if (!window.confirm("Import backup and replace current local data?")) {
      return
    }

    try {
      await store.importData(file)
      closeProfileEditor()
      pushToast({ title: "Backup imported", tone: "success", icon: "📥" })
    } catch (error) {
      pushToast({ title: "Import failed", message: error.message, tone: "danger", icon: "!" })
    }
  }

  return (
    <>
      <div className={`grain relative transition-opacity duration-500 ${showSplash ? "opacity-0 pointer-events-none" : "animate-startup-reveal"}`}>
      <ReminderTray
        items={reminders.trayItems}
        onDismiss={reminders.dismissReminder}
        onSnooze={reminders.snoozeReminder}
        onSkip={reminders.skipReminder}
        onDone={reminders.markDone}
      />

      <div className="relative z-10 flex" style={{ minHeight: "100dvh" }}>
        <aside className="surface-strong hidden w-[280px] shrink-0 border-r px-5 py-6 lg:flex lg:flex-col sticky top-0 h-screen overflow-y-auto" style={{ borderColor: "var(--line)" }}>
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-4">
              <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-violet-600/40 via-purple-600/20 to-red-600/40 blur-lg opacity-70" />
              <img
                src="/logo.png"
                alt="Habit Tracker Pro Logo"
                className="relative h-24 w-24 rounded-3xl object-cover shadow-2xl ring-2 ring-violet-500/30"
              />
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-center" style={{ color: "var(--teal)" }}>
              Habit Tracker Pro
            </p>
            <h1 className="display-font mt-3 text-3xl font-bold text-center">A beautiful ritual for consistency.</h1>
          </div>
          <nav className="mt-8 relative grid gap-2">
            {/* Sliding background indicator */}
            <div
              className="absolute left-0 right-0 h-12 rounded-[22px] bg-ink transition-transform duration-300 ease-out z-0"
              style={{
                transform: `translateY(${navItems.findIndex(item => item.id === uiState.activeTab) * 56}px)`
              }}
            />
            {navItems.map((item) => {
              const Icon = item.icon
              const active = uiState.activeTab === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`relative z-10 flex h-12 items-center gap-3 rounded-[22px] px-4 py-3 text-left text-sm font-semibold transition duration-300 ${
                    !active ? "hover:bg-slate-100 text-slate-600" : ""
                  }`}
                  style={active ? { color: "var(--bg)" } : undefined}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              )
            })}
          </nav>
          <div className="mt-auto rounded-[28px] bg-emerald-50 p-5">
            <p className="text-sm font-semibold" style={{ color: "var(--teal)" }}>
              Quick capture
            </p>
            <p className="mt-2 text-sm leading-6" style={{ color: "var(--ink-soft)" }}>
              Add or complete habits in under two seconds without leaving the dashboard flow.
            </p>
          </div>
        </aside>

        <main
          className="min-w-0 flex-1 px-4 pt-4 sm:px-6 lg:px-8 lg:py-6"
          style={{ paddingBottom: "max(7rem, calc(6rem + env(safe-area-inset-bottom, 1rem)))" }}
        >
          <header className="surface-strong mb-5 rounded-[28px] px-5 py-4 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3.5">
                <div className="relative shrink-0">
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-violet-600/40 to-red-600/40 blur-sm opacity-50" />
                  <img
                    src="/logo.png"
                    alt="Habit Tracker Pro Logo"
                    className="relative h-12 w-12 rounded-2xl object-cover shadow-md ring-2 ring-violet-500/30"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: "var(--teal)" }}>
                      Habit Tracker Pro
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-semibold text-slate-400">
                      {navItems.find((item) => item.id === uiState.activeTab)?.label}
                    </span>
                  </div>
                  <h2 className="display-font mt-0.5 text-xl sm:text-2xl font-bold">{formatDateHeading(new Date())}</h2>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <ProfileSummaryButton profile={store.profile} onEdit={openProfileEditor} />

                <button
                  type="button"
                  onClick={openCreateModal}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-bg"
                >
                  <Plus size={16} />
                  Add habit
                </button>
              </div>
            </div>
          </header>

          {uiState.activeTab === "today" ? (
            <TodayView
              hasHabits={store.habits.some((habit) => !habit.archivedAt)}
              templates={HABIT_TEMPLATES}
              onApplyTemplate={applyTemplate}
              onCreateHabit={openCreateModal}
              dateLabel={formatDateHeading(new Date())}
              perfectDayStreak={perfectDayStreak}
              weeklyCompletion={weeklyCompletion}
              todaySummary={todaySummary}
              filter={uiState.filter}
              categoryFilter={uiState.categoryFilter}
              sort={uiState.sort}
              onFilterChange={(filter) => setUiState((current) => ({ ...current, filter }))}
              onCategoryChange={(categoryFilter) => setUiState((current) => ({ ...current, categoryFilter }))}
              onSortChange={(sort) => setUiState((current) => ({ ...current, sort }))}
              habits={sortedDueCards}
              onOpenHabit={(habitId) => setUiState((current) => ({ ...current, selectedHabitId: habitId }))}
              onToggleHabit={(habitId) => {
                const isCombo = evaluateSessionCombo(comboState.lastTime)
                const nextCount = isCombo.isValid ? comboState.count + 1 : 1
                const combo = getComboDetails(nextCount)
                setComboState({ count: nextCount, lastTime: Date.now() })
                handleActionResult(store.toggleHabit(habitId, currentDateKey, combo.bonusXp), nextCount, combo)
              }}
              onIncrementHabit={(habitId) => {
                const isCombo = evaluateSessionCombo(comboState.lastTime)
                const nextCount = isCombo.isValid ? comboState.count + 1 : 1
                const combo = getComboDetails(nextCount)
                setComboState({ count: nextCount, lastTime: Date.now() })
                handleActionResult(store.incrementHabitProgress(habitId, currentDateKey, combo.bonusXp), nextCount, combo)
              }}
              onDecrementHabit={(habitId) => handleActionResult(store.decrementHabitProgress(habitId))}
              levelInfo={levelInfo}
              streakMultiplier={streakMultiplier}
              streakShields={store.gamification?.streakShields ?? 1}
              isChestAvailable={store.gamification?.claimedDailyChestDate !== currentDateKey}
              onOpenChestModal={() => setChestModalOpen(true)}
              notificationGranted={notificationGranted}
              onRequestNotification={async () => {
                const granted = await requestNotificationPermission()
                setNotificationGranted(granted)
                if (granted) {
                  pushToast({
                    title: "Alerts Enabled!",
                    message: "You'll receive habit alarms & streak savers on your phone.",
                    tone: "success",
                    icon: "🔔"
                  })
                }
              }}
              quests={quests}
              onClaimQuest={(questId, xpReward) => handleActionResult(store.claimQuestReward(questId, xpReward))}
              bossState={bossState}
              onClaimBossReward={(bonusXp) => handleActionResult(store.claimBossReward(bonusXp))}
              isBossRewardClaimed={isBossRewardClaimed}
              mascotMood={mascotState.mood}
              mascotQuote={mascotState.quote}
              userWeeklyXp={userWeeklyXp}
              totalXp={store.gamification?.xp || 0}
              soundEnabled={store.settings.soundEnabled}
            />
          ) : null}

          {uiState.activeTab === "analytics" ? (
            <Suspense fallback={<PanelFallback />}>
              <AnalyticsView
                weeklyChart={weeklyChart}
                monthlyTrend={monthlyTrend}
                categoryBreakdown={categoryBreakdown}
                heatmapData={analyticsHeatmapData}
                heatmapMonthLabel={formatMonthHeading(heatmapMonthDate)}
                canMoveToNextHeatmapMonth={canMoveToNextHeatmapMonth}
                onPreviousHeatmapMonth={moveToPreviousHeatmapMonth}
                onNextHeatmapMonth={moveToNextHeatmapMonth}
                onCurrentHeatmapMonth={resetToCurrentHeatmapMonth}
                selectedDateKey={uiState.selectedDateKey}
                selectedDateLabel={formatDateHeading(uiState.selectedDateKey)}
                dayInspection={dayInspection}
                onSelectHeatmapDate={(selectedDateKey) => setUiState((current) => ({ ...current, selectedDateKey }))}
                onToggleHabitAtDate={(habitId, dateKey) => handleActionResult(store.toggleHabit(habitId, dateKey))}
                onIncrementHabitAtDate={(habitId, dateKey) =>
                  handleActionResult(store.incrementHabitProgress(habitId, dateKey))
                }
                onDecrementHabitAtDate={(habitId, dateKey) =>
                  handleActionResult(store.decrementHabitProgress(habitId, dateKey))
                }
                onSaveDayNote={(habitId, dateKey, note) => store.saveCompletionNote(habitId, dateKey, note)}
                averageStreak={averageStreak}
                bestDay={bestDay}
                trendingHabits={trendingHabits}
                bestHabit={bestHabit}
                achievements={achievements}
                motivation={motivation}
              />
            </Suspense>
          ) : null}

          {uiState.activeTab === "settings" ? (
            <Suspense fallback={<PanelFallback />}>
              <SettingsView
                settings={store.settings}
                onUpdateSettings={store.updateSettings}
                archivedHabits={archivedHabits}
                onRestoreHabit={(habitId) => handleActionResult(store.restoreHabit(habitId))}
                onDeleteHabit={(habitId) => {
                  if (window.confirm("Delete this habit and all its history?")) {
                    handleActionResult(store.deleteHabit(habitId))
                  }
                }}
                onTestNotificationResult={(res) =>
                  pushToast({
                    title: res.success ? "Test Alert Sent!" : "Notification Error",
                    message: res.success
                      ? "Look for the alert outside the app on your phone in 2 seconds!"
                      : res.reason,
                    tone: res.success ? "success" : "danger",
                    icon: "📲"
                  })
                }
                onClearAllData={() => {
                  store.clearAllData()
                  closeProfileEditor()
                  setProfileDraft(createProfileDraft())
                  pushToast({ title: "All data cleared", tone: "danger", icon: "🧹" })
                }}
              />
            </Suspense>
          ) : null}
        </main>
      </div>

      </div>

      <Suspense fallback={null}>
        <HabitModal
          open={Boolean(uiState.modalMode)}
          mode={uiState.modalMode || "create"}
          draft={uiState.draft}
          onChange={(draft) => setUiState((current) => ({ ...current, draft }))}
          onClose={closeModal}
          onSubmit={submitModal}
          categories={store.categories}
          templates={HABIT_TEMPLATES}
          onApplyTemplate={applyTemplate}
        />

        <ProfileEditorModal
          open={profileModalOpen}
          draft={profileDraft}
          onChange={setProfileDraft}
          onSubmit={handleProfileSave}
          onClose={closeProfileEditor}
          onLogout={handleLogout}
        />

        <HabitDrawer
          habit={selectedHabit}
          category={selectedCategory}
          completions={store.completions}
          weekStartsOn={store.settings.weekStartsOn}
          onClose={() => setUiState((current) => ({ ...current, selectedHabitId: null }))}
          onEdit={() => selectedHabit && openEditModal(selectedHabit)}
          onArchive={() => {
            if (selectedHabit && window.confirm("Archive this habit?")) {
              handleActionResult(store.archiveHabit(selectedHabit.id))
              setUiState((current) => ({ ...current, selectedHabitId: null }))
            }
          }}
          onDelete={() => {
            if (selectedHabit && window.confirm("Delete this habit and all completion history?")) {
              handleActionResult(store.deleteHabit(selectedHabit.id))
              setUiState((current) => ({ ...current, selectedHabitId: null }))
            }
          }}
          onReset={() => {
            if (selectedHabit && window.confirm("Reset this habit streak but keep history?")) {
              handleActionResult(store.resetHabitStreak(selectedHabit.id))
            }
          }}
          onComplete={(habitId, dateKey) => handleActionResult(store.completeHabit(habitId, dateKey))}
          onSaveNote={(habitId, dateKey, note) => store.saveCompletionNote(habitId, dateKey, note)}
        />
      </Suspense>

      <FloatingXp items={floatingXpItems} />

      <LevelUpModal
        open={Boolean(levelUpModalInfo)}
        onClose={() => setLevelUpModalInfo(null)}
        levelInfo={levelUpModalInfo}
        soundEnabled={store.settings.soundEnabled}
      />

      <MysteryChestModal
        open={chestModalOpen}
        onClose={() => setChestModalOpen(false)}
        isAvailableToday={store.gamification?.claimedDailyChestDate !== currentDateKey}
        onOpenChest={() => handleActionResult(store.openDailyChest())}
        soundEnabled={store.settings.soundEnabled}
      />

      <GodmodeCelebrationModal
        isOpen={godmodeCelebrationOpen}
        onClose={() => setGodmodeCelebrationOpen(false)}
        habitsCount={todaySummary.due}
        streak={perfectDayStreak}
        soundEnabled={store.settings.soundEnabled}
      />

      {/* Bottom nav rendered OUTSIDE the grain overflow wrapper so position:fixed works correctly on mobile */}
      {!showSplash && (
        <nav
          className="surface-strong fixed z-[9999] rounded-[26px] lg:hidden shadow-2xl border backdrop-blur-xl"
          style={{
            position: "fixed",
            left: "50%",
            transform: "translate3d(-50%, 0, 0)",
            WebkitTransform: "translate3d(-50%, 0, 0)",
            bottom: "max(0.75rem, env(safe-area-inset-bottom, 0.75rem))",
            width: "calc(100% - 1rem)",
            maxWidth: "480px",
            zIndex: 9999,
            WebkitBackfaceVisibility: "hidden",
            backfaceVisibility: "hidden",
            touchAction: "none",
          }}
        >
        <div className="relative flex w-full items-center p-2">
          {/* Sliding background indicator for mobile */}
          <div className="absolute left-2 right-2 top-2 bottom-2 z-0 pointer-events-none">
            <div
              className="h-full rounded-[20px] bg-ink transition-transform duration-300 ease-out"
              style={{
                width: `${100 / navItems.length}%`,
                transform: `translateX(${navItems.findIndex(item => item.id === uiState.activeTab) * 100}%)`
              }}
            />
          </div>
          {navItems.map((item) => {
            const Icon = item.icon
            const active = uiState.activeTab === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`relative z-10 flex min-h-[58px] flex-1 flex-col items-center justify-center rounded-[20px] px-2 py-2 text-[13px] font-bold transition duration-300 whitespace-nowrap ${
                  !active ? "text-slate-600" : ""
                }`}
                style={active ? { color: "var(--bg)" } : undefined}
              >
                <Icon size={22} className="shrink-0" />
                <span className="mt-1 leading-none">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
      )}
    </>
  )
}

const HabitApp = () => {
  const store = useHabitStore()
  const [toasts, setToasts] = useState([])
  const [showSplash, setShowSplash] = useState(true)
  const [profileDraft, setProfileDraft] = useState(() => createProfileDraft(store.profile))

  const pushToast = ({ title, message = "", tone = "default", icon = "✓" }) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    setToasts((current) => [...current, { id, title, message, tone, icon }])
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 3200)
  }

  useEffect(() => {
    updateStatusBarTheme(false)
  }, [])

  useEffect(() => {
    if (!store.isAuthenticated) {
      setProfileDraft(createProfileDraft(null))
    }
  }, [store.isAuthenticated])

  const handleProfileLogin = (nextProfile) => {
    const result = store.authenticate(nextProfile)
    if (!result) {
      return
    }

    setProfileDraft(createProfileDraft(nextProfile))
    pushToast({
      title: result.isExisting ? "Welcome back!" : "Profile created",
      message: result.isExisting
        ? `${nextProfile.name} — all habits, streaks & history restored!`
        : `Welcome, ${nextProfile.name}! Your journey begins today.`,
      tone: "success",
      icon: result.isExisting ? "↩" : "✓"
    })
  }

  return (
    <>
      {showSplash && (
        <StartupSplash
          soundEnabled={store?.settings?.soundEnabled ?? true}
          onComplete={() => setShowSplash(false)}
        />
      )}
      <ToastStack toasts={toasts} />
      {!store.isAuthenticated ? (
        <div className={`transition-opacity duration-500 ${showSplash ? "opacity-0 pointer-events-none" : "animate-startup-reveal"}`}>
          <ProfileSetupScreen
            draft={profileDraft}
            onChange={setProfileDraft}
            onSubmit={handleProfileLogin}
          />
        </div>
      ) : (
        <AuthenticatedHabitApp
          store={store}
          showSplash={showSplash}
          pushToast={pushToast}
        />
      )}
    </>
  )
}

export default function App() {
  return (
    <HabitProvider>
      <HabitApp />
    </HabitProvider>
  )
}

