import { createProfileKey, normalizeProfile } from "./profile"
import { calculateRetroactiveXp } from "./gamification"

export const DATA_STORAGE_KEY = "habit-tracker-pro:data:v1"
export const AUTH_STORAGE_KEY = "habit-tracker-pro:auth:v1"
export const UI_STORAGE_KEY = "habit-tracker-pro:ui:v1"

export const createDefaultSettings = () => ({
  theme: "light",
  highContrast: false,
  soundEnabled: false,
  defaultReminderTime: "08:00",
  weekStartsOn: 1,
  habitSort: "streak",
  dashboardFilter: "all"
})

export const createDefaultGamification = () => ({
  xp: 0,
  weeklyXp: 0,
  weeklyXpWeek: null,
  streakShields: 1,
  claimedDailyChestDate: null,
  claimedQuests: {}, // { [dateKey]: [questId, ...] }
  claimedBossRewards: {}, // { [dateKey]: true }
  frozenDates: {} // { [dateKey]: true }
})

export const createDefaultState = (categories) => ({
  habits: [],
  completions: {},
  categories,
  settings: createDefaultSettings(),
  achievements: [],
  reminderSkips: {},
  profile: null,
  gamification: createDefaultGamification()
})

export const createDefaultAuthState = () => ({
  activeProfileKey: null,
  accounts: {}
})

export const safeJsonParse = (value, fallback) => {
  if (!value) {
    return fallback
  }

  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

export const normalizeStateSnapshot = (stored, categories) => {
  if (!stored || typeof stored !== "object") {
    return createDefaultState(categories)
  }

  const storedSettings = stored.settings ?? {}
  const existingCompletions = stored.completions ?? {}
  const existingHabits = Array.isArray(stored.habits) ? stored.habits : []
  const initialXp =
    typeof stored.gamification?.xp === "number"
      ? stored.gamification.xp
      : calculateRetroactiveXp(existingHabits, existingCompletions)

  const gamification = {
    ...createDefaultGamification(),
    ...(stored.gamification ?? {}),
    xp: initialXp,
    weeklyXp: typeof stored.gamification?.weeklyXp === "number" ? stored.gamification.weeklyXp : 0,
    weeklyXpWeek: stored.gamification?.weeklyXpWeek || null,
    streakShields:
      typeof stored.gamification?.streakShields === "number"
        ? stored.gamification.streakShields
        : 1,
    claimedQuests: stored.gamification?.claimedQuests ?? {},
    claimedBossRewards: stored.gamification?.claimedBossRewards ?? {},
    frozenDates: stored.gamification?.frozenDates ?? {}
  }

  return {
    ...createDefaultState(categories),
    ...stored,
    settings: {
      ...createDefaultSettings(),
      ...storedSettings
    },
    categories: stored.categories?.length ? stored.categories : categories,
    achievements: Array.isArray(stored.achievements) ? stored.achievements : [],
    reminderSkips: stored.reminderSkips ?? {},
    profile: normalizeProfile(stored.profile),
    gamification
  }
}

export const loadStorageState = (categories) => {
  if (typeof window === "undefined") {
    return createDefaultState(categories)
  }

  return normalizeStateSnapshot(safeJsonParse(window.localStorage.getItem(DATA_STORAGE_KEY), null), categories)
}

export const saveStorageState = (state) => {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(state))
}

export const ACCOUNT_STORAGE_PREFIX = "habit-tracker-pro:account:"

export const saveAccountBackup = (profileKey, snapshot) => {
  if (typeof window === "undefined" || !profileKey) {
    return
  }

  try {
    window.localStorage.setItem(`${ACCOUNT_STORAGE_PREFIX}${profileKey}`, JSON.stringify(snapshot))
  } catch (err) {
    console.warn("Failed to backup account data:", err)
  }
}

export const loadAllAccounts = (categories) => {
  if (typeof window === "undefined") {
    return {}
  }

  const accounts = {}

  // 1. Load accounts from AUTH_STORAGE_KEY
  const storedAuth = safeJsonParse(window.localStorage.getItem(AUTH_STORAGE_KEY), null)
  if (storedAuth && typeof storedAuth === "object" && storedAuth.accounts && typeof storedAuth.accounts === "object") {
    Object.entries(storedAuth.accounts).forEach(([key, snapshot]) => {
      if (snapshot && typeof snapshot === "object") {
        accounts[key] = normalizeStateSnapshot(snapshot, categories)
      }
    })
  }

  // 2. Scan all per-account backup keys in localStorage (habit-tracker-pro:account:*)
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const storageKey = window.localStorage.key(i)
      if (storageKey && storageKey.startsWith(ACCOUNT_STORAGE_PREFIX)) {
        const profileKey = storageKey.slice(ACCOUNT_STORAGE_PREFIX.length)
        const accountData = safeJsonParse(window.localStorage.getItem(storageKey), null)
        if (accountData && typeof accountData === "object") {
          accounts[profileKey] = normalizeStateSnapshot(accountData, categories)
        }
      }
    }
  } catch (err) {
    console.warn("Failed scanning account backups:", err)
  }

  // 3. Fallback to DATA_STORAGE_KEY if it has profile data
  const legacy = normalizeStateSnapshot(safeJsonParse(window.localStorage.getItem(DATA_STORAGE_KEY), null), categories)
  const legacyProfileKey = createProfileKey(legacy.profile)
  if (legacyProfileKey && !accounts[legacyProfileKey] && legacy.habits?.length) {
    accounts[legacyProfileKey] = legacy
  }

  return accounts
}

export const loadAuthState = (categories) => {
  if (typeof window === "undefined") {
    return createDefaultAuthState()
  }

  const accounts = loadAllAccounts(categories)
  const stored = safeJsonParse(window.localStorage.getItem(AUTH_STORAGE_KEY), null)

  let activeProfileKey = null
  if (stored && typeof stored.activeProfileKey === "string" && accounts[stored.activeProfileKey]) {
    activeProfileKey = stored.activeProfileKey
  } else if (stored && typeof stored.activeProfileKey === "string") {
    // If active profile exists in accounts by matching
    activeProfileKey = stored.activeProfileKey
  }

  return {
    activeProfileKey,
    accounts
  }
}

export const saveAuthState = (value) => {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(value))

  // Also backup every account individually
  if (value && value.accounts && typeof value.accounts === "object") {
    Object.entries(value.accounts).forEach(([key, snapshot]) => {
      saveAccountBackup(key, snapshot)
    })
  }
}

export const loadUiState = () => {
  if (typeof window === "undefined") {
    return {}
  }

  return safeJsonParse(window.sessionStorage.getItem(UI_STORAGE_KEY), {})
}

export const saveUiState = (value) => {
  if (typeof window === "undefined") {
    return
  }

  window.sessionStorage.setItem(UI_STORAGE_KEY, JSON.stringify(value))
}
