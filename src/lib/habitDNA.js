import {
    getCompletionRateForRange,
    getCurrentStreak,
    getDueDateKeys,
    getHabitCategory,
    getLongestStreak,
    isHabitCompletedOnDate,
    isHabitDueOnDate
} from "./habits"
import { addDays } from "date-fns"
import { listDayKeys, todayKey, toDayKey, fromDayKey } from "./dates"

// ─── UTILITY ──────────────────────────────────────────────────────────────────

/**
 * Returns the last `count` day keys ending on today (inclusive).
 */
const last = (count) => listDayKeys(count)

/**
 * Clamp a value between 0 and 100.
 */
const clamp100 = (v) => Math.min(100, Math.max(0, Math.round(v)))

// ─── 1. PERSONALITY TYPE ───────────────────────────────────────────────────

const PERSONALITY_TYPES = {
    disciplined: {
        emoji: "🎯",
        name: "Disciplined",
        description: "Highly consistent and committed — you rarely miss a day",
        gradient: "linear-gradient(135deg, #00D9FF 0%, #0099CC 100%)"
    },
    nightOwl: {
        emoji: "🌙",
        name: "Night Owl",
        description: "Most productive in the evening hours",
        gradient: "linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)"
    },
    earlyBird: {
        emoji: "🌅",
        name: "Early Bird",
        description: "Champion of early mornings — sunrise fuels you",
        gradient: "linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)"
    },
    healthConscious: {
        emoji: "💪",
        name: "Health Conscious",
        description: "Prioritises wellness, fitness and self-care",
        gradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)"
    },
    growthSeeker: {
        emoji: "🧠",
        name: "Growth Seeker",
        description: "Loves learning and personal development",
        gradient: "linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)"
    },
    achievementFocused: {
        emoji: "🚀",
        name: "Achievement Focused",
        description: "Productivity driven and goal oriented",
        gradient: "linear-gradient(135deg, #FF006E 0%, #C026D3 100%)"
    },
    balanced: {
        emoji: "⚖️",
        name: "Balanced",
        description: "Well-rounded approach to life across all areas",
        gradient: "linear-gradient(135deg, #6B7280 0%, #4B5563 100%)"
    }
}

const HEALTH_CATEGORIES = ["fitness", "nutrition", "wellness", "sleep", "mental-health"]
const LEARNING_CATEGORIES = ["learning"]
const WORK_CATEGORIES = ["productivity"]

export function getPersonalityType(habits, completions, categories) {
    const activeHabits = habits.filter((h) => !h.archivedAt)
    if (!activeHabits.length) return PERSONALITY_TYPES.balanced

    const last30Keys = last(30)
    const totalHabits = activeHabits.length

    // ── Consistency: % of due-days completed in last 30 days ──
    let totalDue = 0
    let totalCompleted = 0
    activeHabits.forEach((h) => {
        last30Keys.forEach((dk) => {
            if (isHabitDueOnDate(h, dk)) {
                totalDue++
                if (isHabitCompletedOnDate(h, completions, dk)) totalCompleted++
            }
        })
    })
    const consistency = totalDue > 0 ? (totalCompleted / totalDue) * 100 : 0

    // ── Discipline: based on average current streak relative to habit age ──
    const discipline = getDisciplineLevel(habits, completions)

    // ── Time-window distribution (all completions ever) ──
    const timeCounts = { morning: 0, afternoon: 0, evening: 0, night: 0 }
    Object.values(completions).forEach((entry) => {
        if (!entry.completedAt) return
        const hour = new Date(entry.completedAt).getHours()
        if (hour >= 5 && hour < 12) timeCounts.morning++
        else if (hour >= 12 && hour < 17) timeCounts.afternoon++
        else if (hour >= 17 && hour < 21) timeCounts.evening++
        else timeCounts.night++
    })
    const totalTime = Object.values(timeCounts).reduce((a, b) => a + b, 0)
    const latePct = totalTime ? ((timeCounts.evening + timeCounts.night) / totalTime) * 100 : 0
    const morningPct = totalTime ? (timeCounts.morning / totalTime) * 100 : 0

    // ── Category distribution ──
    const catCounts = {}
    activeHabits.forEach((h) => {
        const cat = getHabitCategory(h, categories)
        catCounts[cat.id] = (catCounts[cat.id] || 0) + 1
    })
    const healthCount = HEALTH_CATEGORIES.reduce((s, id) => s + (catCounts[id] || 0), 0)
    const learningCount = LEARNING_CATEGORIES.reduce((s, id) => s + (catCounts[id] || 0), 0)
    const workCount = WORK_CATEGORIES.reduce((s, id) => s + (catCounts[id] || 0), 0)
    const healthPct = totalHabits ? (healthCount / totalHabits) * 100 : 0
    const learningPct = totalHabits ? (learningCount / totalHabits) * 100 : 0
    const workPct = totalHabits ? (workCount / totalHabits) * 100 : 0

    // ── Priority-ordered personality evaluation ──
    if (consistency >= 65 && discipline >= 50) return PERSONALITY_TYPES.disciplined
    if (totalTime >= 5 && latePct > 55) return PERSONALITY_TYPES.nightOwl
    if (totalTime >= 5 && morningPct > 55) return PERSONALITY_TYPES.earlyBird
    if (healthPct >= 50) return PERSONALITY_TYPES.healthConscious
    if (learningPct >= 40) return PERSONALITY_TYPES.growthSeeker
    if (workPct >= 35) return PERSONALITY_TYPES.achievementFocused
    return PERSONALITY_TYPES.balanced
}

// ─── 2. CONSISTENCY SCORE ──────────────────────────────────────────────────

/**
 * % of due habit-days completed across ALL active habits in the last 30 days.
 * (Not just "days with any completion" — that's misleading if habits vary by schedule.)
 */
export function getConsistencyScore(habits, completions) {
    const activeHabits = habits.filter((h) => !h.archivedAt)
    if (!activeHabits.length) return 0

    const last30Keys = last(30)
    let totalDue = 0
    let totalCompleted = 0

    activeHabits.forEach((h) => {
        last30Keys.forEach((dk) => {
            if (isHabitDueOnDate(h, dk)) {
                totalDue++
                if (isHabitCompletedOnDate(h, completions, dk)) totalCompleted++
            }
        })
    })

    return totalDue > 0 ? clamp100((totalCompleted / totalDue) * 100) : 0
}

// ─── 3. DISCIPLINE LEVEL ───────────────────────────────────────────────────

/**
 * Weighted score combining:
 * - Current streak ratio vs. habit age (50%)
 * - Hard habit completion in last 30 days (30%)
 * - Perfect-day percentage in last 14 days (20%)
 */
export function getDisciplineLevel(habits, completions) {
    const activeHabits = habits.filter((h) => !h.archivedAt)
    if (!activeHabits.length) return 0

    // Streak ratio: currentStreak / max(min(ageInDueDays, 30), 1), averaged across habits
    // Benchmarks against a 30-day streak target so veteran users aren't unfairly penalized by habit age
    const streakRatios = activeHabits.map((h) => {
        const current = getCurrentStreak(h, completions)
        const allDue = getDueDateKeys(h)
        const targetDays = Math.min(allDue.length || 1, 30)
        return Math.min(current / targetDays, 1)
    })
    const avgStreakRatio = streakRatios.reduce((a, b) => a + b, 0) / streakRatios.length

    // Hard habit completion rate in last 30 days
    const hardHabits = activeHabits.filter((h) => h.difficulty === "hard" || h.difficulty === "critical")
    const last30Keys = last(30)
    let hardDue = 0
    let hardDone = 0
    hardHabits.forEach((h) => {
        last30Keys.forEach((dk) => {
            if (isHabitDueOnDate(h, dk)) {
                hardDue++
                if (isHabitCompletedOnDate(h, completions, dk)) hardDone++
            }
        })
    })
    const hardRatio = hardHabits.length && hardDue > 0 ? hardDone / hardDue : 0.7

    // Perfect-day % in last 14 days (evaluated only across days with scheduled habits)
    const last14Keys = last(14)
    let activeDaysCount = 0
    let perfectDays = 0
    last14Keys.forEach((dk) => {
        const dueOnDay = activeHabits.filter((h) => isHabitDueOnDate(h, dk))
        if (dueOnDay.length > 0) {
            activeDaysCount++
            if (dueOnDay.every((h) => isHabitCompletedOnDate(h, completions, dk))) {
                perfectDays++
            }
        }
    })
    const perfectRatio = activeDaysCount > 0 ? perfectDays / activeDaysCount : 0

    const raw = avgStreakRatio * 50 + hardRatio * 30 + perfectRatio * 20
    return clamp100(raw)
}

// ─── 4. BEST TIME WINDOW ───────────────────────────────────────────────────

const TIME_WINDOW_DEFS = [
    { key: "morning", label: "Morning", startHour: 5, endHour: 12 },
    { key: "afternoon", label: "Afternoon", startHour: 12, endHour: 17 },
    { key: "evening", label: "Evening", startHour: 17, endHour: 21 },
    { key: "night", label: "Night", startHour: 21, endHour: 29 }
]

export function getBestTimeWindow(habits, completions) {
    const counts = { morning: 0, afternoon: 0, evening: 0, night: 0 }
    let total = 0

    Object.values(completions).forEach((entry) => {
        if (!entry.completedAt) return
        total++
        const hour = new Date(entry.completedAt).getHours()
        if (hour >= 5 && hour < 12) counts.morning++
        else if (hour >= 12 && hour < 17) counts.afternoon++
        else if (hour >= 17 && hour < 21) counts.evening++
        else counts.night++
    })

    if (total === 0) return "Morning" // default

    const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
    const def = TIME_WINDOW_DEFS.find((d) => d.key === best?.[0])
    return def ? def.label : "Morning"
}

// ─── 5. TOP 3 CATEGORIES ───────────────────────────────────────────────────

export function getTopCategories(habits, completions = {}, categories = []) {
    const activeHabits = habits.filter((h) => !h.archivedAt)
    if (!activeHabits.length) return []

    // Support both (habits, completions, categories) and legacy (habits, categories)
    let realCompletions = completions
    let realCategories = categories
    if (Array.isArray(completions) && !categories.length) {
        realCategories = completions
        realCompletions = {}
    }

    const last30Keys = last(30)
    const categoryStats = new Map()

    activeHabits.forEach((habit) => {
        const cat = getHabitCategory(habit, realCategories)
        if (!categoryStats.has(cat.id)) {
            categoryStats.set(cat.id, {
                ...cat,
                habitCount: 0,
                totalDue: 0,
                totalCompleted: 0
            })
        }
        const stat = categoryStats.get(cat.id)
        stat.habitCount++

        last30Keys.forEach((dk) => {
            if (isHabitDueOnDate(habit, dk)) {
                stat.totalDue++
                if (isHabitCompletedOnDate(habit, realCompletions, dk)) {
                    stat.totalCompleted++
                }
            }
        })
    })

    return Array.from(categoryStats.values())
        .map((cat) => {
            const percentage = cat.totalDue > 0
                ? clamp100((cat.totalCompleted / cat.totalDue) * 100)
                : 0
            return {
                ...cat,
                count: cat.habitCount,
                percentage
            }
        })
        .sort((a, b) => b.percentage - a.percentage || b.totalCompleted - a.totalCompleted || b.habitCount - a.habitCount)
        .slice(0, 3)
}

// ─── 6. STREAK BEHAVIOR ────────────────────────────────────────────────────

/**
 * Analyses streak patterns across all active habits.
 * Sustainability = % of habits with current streak > 7 days OR longest streak > 21 days.
 */
export function getStreakBehavior(habits, completions) {
    const activeHabits = habits.filter((h) => !h.archivedAt)
    if (!activeHabits.length) {
        return { pattern: "Steady ━━━", avgStreak: 0, longestStreak: 0, sustainability: 0 }
    }

    const currentStreaks = activeHabits.map((h) => getCurrentStreak(h, completions))
    const longestStreaks = activeHabits.map((h) => getLongestStreak(h, completions))

    const avgStreak = Math.round(currentStreaks.reduce((a, b) => a + b, 0) / currentStreaks.length)
    const longestStreak = Math.max(...longestStreaks)

    // Sustainability: habits that have either a current streak ≥7 OR longest streak ≥21
    const sustainableCount = activeHabits.filter((h, i) =>
        currentStreaks[i] >= 7 || longestStreaks[i] >= 21
    ).length
    const sustainability = Math.round((sustainableCount / activeHabits.length) * 100)

    let pattern
    if (sustainability >= 60) pattern = "Explosive ↗️"
    else if (sustainability <= 20 && avgStreak <= 2) pattern = "Volatile ↕️"
    else pattern = "Steady ━━━"

    return { pattern, avgStreak, longestStreak, sustainability }
}

// ─── 7. PER-HABIT DETAILED STATS ────────────────────────────────────────────

const INSIGHT_MESSAGES = {
    excellent: { emoji: "🌟", text: "Excellent performance — keep the momentum going!" },
    great: { emoji: "🔥", text: "Great work! You're building a strong habit." },
    good: { emoji: "👍", text: "Good progress — stay consistent to level up." },
    improving: { emoji: "📈", text: "Improving! A few more consistent days will help." },
    needsWork: { emoji: "💡", text: "Needs attention — try a smaller daily goal." },
    inactive: { emoji: "🌱", text: "Not started yet — begin with one small step today." }
}

function getInsight(rate, streak) {
    if (rate >= 80 && streak >= 14) return INSIGHT_MESSAGES.excellent
    if (rate >= 65 && streak >= 7) return INSIGHT_MESSAGES.great
    if (rate >= 50) return INSIGHT_MESSAGES.good
    if (rate >= 30 || streak >= 3) return INSIGHT_MESSAGES.improving
    if (rate > 0) return INSIGHT_MESSAGES.needsWork
    return INSIGHT_MESSAGES.inactive
}

export function getHabitDetailStats(habit, completions, categories) {
    if (!habit || habit.archivedAt) return null

    const cat = getHabitCategory(habit, categories)
    const last30Keys = last(30)
    const last90Keys = last(90)

    // ── Completion rates (only counts due days) ──
    const completionRate30 = getCompletionRateForRange(habit, completions, last30Keys)
    const completionRate90 = getCompletionRateForRange(habit, completions, last90Keys)

    // ── Streak info ──
    const currentStreak = getCurrentStreak(habit, completions)
    const longestStreak = getLongestStreak(habit, completions)

    // ── Total completions (all time) ──
    const allDue = getDueDateKeys(habit)
    const totalCompletions = allDue.filter((dk) => isHabitCompletedOnDate(habit, completions, dk)).length

    // ── Avg completions per week in last 30 days (based on actual due-days per week) ──
    const due30 = last30Keys.filter((dk) => isHabitDueOnDate(habit, dk))
    const completed30 = due30.filter((dk) => isHabitCompletedOnDate(habit, completions, dk)).length
    // Annualise to per-week: due30 / 30 * 7 = expected due per week; scale completed by same ratio
    const duePerWeek = (due30.length / 30) * 7
    const avgPerWeek = duePerWeek > 0 ? Math.round((completed30 / due30.length) * duePerWeek * 10) / 10 : 0

    // ── Consistency: completed due-days / total due-days in last 30 ──
    const consistency = due30.length > 0
        ? clamp100((completed30 / due30.length) * 100)
        : 0

    const last7Keys = last(7)
    const WEEKDAY_SHORT = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
    const weekData = last7Keys.map((dk) => ({
        label: WEEKDAY_SHORT[fromDayKey(dk).getDay()],
        completed: isHabitCompletedOnDate(habit, completions, dk),
        due: isHabitDueOnDate(habit, dk)
    }))

    // ── Monthly trend: 4 weeks, oldest first (W1 = 4 weeks ago, W4 = this week) ──
    const monthTrend = []
    for (let w = 3; w >= 0; w--) {
        // Week ending `w * 7` days ago (w=0 → this week, w=3 → 4 weeks ago)
        const weekEnd = addDays(new Date(), -(w * 7))
        const weekKeys = listDayKeys(7, weekEnd)
        const due = weekKeys.filter((dk) => isHabitDueOnDate(habit, dk)).length
        const done = weekKeys.filter((dk) => isHabitCompletedOnDate(habit, completions, dk)).length
        monthTrend.push({
            label: `W${4 - w}`,
            rate: due > 0 ? Math.round((done / due) * 100) : 0
        })
    }

    const insight = getInsight(completionRate30, currentStreak)

    return {
        habit,
        category: cat,
        completionRate30,
        completionRate90,
        currentStreak,
        longestStreak,
        totalCompletions,
        avgPerWeek,
        consistency,
        weekData,
        monthTrend,
        insight
    }
}

export function getAllHabitDetails(habits, completions, categories) {
    return habits
        .filter((h) => !h.archivedAt)
        .map((h) => getHabitDetailStats(h, completions, categories))
        .filter(Boolean)
        .sort((a, b) => b.completionRate30 - a.completionRate30)
}
