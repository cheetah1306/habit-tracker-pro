import React from "react"
import { CalendarDays, Flame, Percent, Plus, Sparkles } from "lucide-react"
import { HabitCard } from "./HabitCard"
import { EmptyState } from "./EmptyState"
import { HabitDNA } from "./HabitDNA"
import { GamificationBanner } from "./GamificationBanner"
import { DailyQuestsCard } from "./DailyQuestsCard"
import { StreakUrgencyBar } from "./StreakUrgencyBar"
import { HabitMascot } from "./HabitMascot"
import { DailyBossCard } from "./DailyBossCard"
import { XpLeagueCard } from "./XpLeagueCard"

const statCards = [
  { key: "due", label: "Due today", icon: CalendarDays },
  { key: "completed", label: "Completed", icon: Sparkles },
  { key: "percentage", label: "Weekly completion", icon: Percent },
  { key: "perfectDayStreak", label: "Perfect-day streak", icon: Flame }
]

export const TodayView = ({
  hasHabits,
  templates,
  onApplyTemplate,
  onCreateHabit,
  dateLabel,
  perfectDayStreak,
  weeklyCompletion,
  todaySummary,
  filter,
  categoryFilter,
  sort,
  onFilterChange,
  onCategoryChange,
  onSortChange,
  habits,
  onOpenHabit,
  onToggleHabit,
  onIncrementHabit,
  onDecrementHabit,
  levelInfo,
  streakMultiplier,
  streakShields,
  isChestAvailable,
  onOpenChestModal,
  notificationGranted,
  onRequestNotification,
  quests,
  onClaimQuest,
  bossState,
  onClaimBossReward,
  isBossRewardClaimed = false,
  mascotMood = "ready",
  mascotQuote,
  userWeeklyXp = 0,
  totalXp = 0,
  soundEnabled = true
}) => {
  if (!hasHabits) {
    return <EmptyState onCreate={onCreateHabit} templates={templates} onApplyTemplate={onApplyTemplate} />
  }

  const stats = {
    due: todaySummary.due,
    completed: todaySummary.completed,
    percentage: `${weeklyCompletion}%`,
    perfectDayStreak
  }

  return (
    <div className="grid gap-6">
      {/* 1. Midnight Urgency & Live Flame Tracker */}
      <StreakUrgencyBar
        dueCount={todaySummary.due}
        completedCount={todaySummary.completed}
        streak={perfectDayStreak}
        streakShields={streakShields}
      />

      {/* 2. Gamification Player HUD */}
      {levelInfo ? (
        <GamificationBanner
          levelInfo={levelInfo}
          streakMultiplier={streakMultiplier}
          streakShields={streakShields}
          isChestAvailable={isChestAvailable}
          onOpenChestModal={onOpenChestModal}
          notificationGranted={notificationGranted}
          onRequestNotification={onRequestNotification}
        />
      ) : null}

      {/* 3. Interactive Habit Companion (Habi the Mascot) */}
      <HabitMascot
        mood={mascotMood}
        quote={mascotQuote}
        streak={perfectDayStreak}
        soundEnabled={soundEnabled}
      />

      {/* 4. Dual Challenge Section: Boss Battle + Daily Quests */}
      <div className="grid gap-6 lg:grid-cols-2">
        {bossState ? (
          <DailyBossCard
            bossState={bossState}
            onClaimBossReward={onClaimBossReward}
            isRewardClaimed={isBossRewardClaimed}
            soundEnabled={soundEnabled}
          />
        ) : null}

        {quests?.length ? (
          <DailyQuestsCard quests={quests} onClaimQuest={onClaimQuest} />
        ) : null}
      </div>

      {/* 5. Weekly XP Division League Leaderboard */}
      <XpLeagueCard userWeeklyXp={userWeeklyXp} totalXp={totalXp} />

      <section className="surface-strong card-enter rounded-[32px] p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--teal)" }}>
              Today
            </p>
            <h1 className="display-font mt-3 text-3xl font-bold sm:text-5xl">{dateLabel}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7" style={{ color: "var(--ink-soft)" }}>
              Quick capture stays the priority: check in habits in a tap, keep streaks alive, and let the dashboard
              show exactly what still needs attention.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onCreateHabit}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-bg transition hover:opacity-90"
              >
                <Plus size={16} />
                Add habit
              </button>
              <span className="inline-flex min-h-11 items-center rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800">
                🔥 {perfectDayStreak} day perfect streak
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {statCards.map((card) => {
              const Icon = card.icon
              return (
                <article key={card.key} className="surface rounded-[24px] p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold" style={{ color: "var(--ink-soft)" }}>
                      {card.label}
                    </p>
                    <div className="rounded-2xl bg-white/70 p-2 text-[var(--teal)]">
                      <Icon size={18} />
                    </div>
                  </div>
                  <p className="display-font mt-4 text-3xl font-bold">{stats[card.key]}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <HabitDNA />

      <section className="grid gap-4 lg:grid-cols-[1fr,auto,auto,auto] lg:items-center">
        <div>
          <h2 className="display-font text-2xl font-bold">Today&apos;s habits</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--ink-soft)" }}>
            Filter by status or category, then sort the list the way you work.
          </p>
        </div>

        <select
          value={filter}
          onChange={(event) => onFilterChange(event.target.value)}
          className="surface min-h-11 rounded-full px-4 py-2"
        >
          <option value="all">All</option>
          <option value="completed">Completed</option>
          <option value="incomplete">Incomplete</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(event) => onCategoryChange(event.target.value)}
          className="surface min-h-11 rounded-full px-4 py-2"
        >
          <option value="all">All categories</option>
          {habits
            .map((item) => item.category)
            .filter((category, index, collection) => collection.findIndex((entry) => entry.id === category.id) === index)
            .map((category) => (
              <option key={category.id} value={category.id}>
                {category.emoji} {category.label}
              </option>
            ))}
        </select>

        <select
          value={sort}
          onChange={(event) => onSortChange(event.target.value)}
          className="surface min-h-11 rounded-full px-4 py-2"
        >
          <option value="streak">Sort by streak</option>
          <option value="name">Sort by name</option>
          <option value="frequency">Sort by frequency</option>
          <option value="difficulty">Sort by difficulty</option>
        </select>
      </section>

      {habits.length ? (
        <section className="grid gap-4 xl:grid-cols-2">
          {habits.map((item) => (
            <HabitCard
              key={item.habit.id}
              habit={item.habit}
              category={item.category}
              status={item.status}
              streak={item.streak}
              lastCompletedLabel={item.lastCompletedLabel}
              onOpen={() => onOpenHabit(item.habit.id)}
              onToggle={() => onToggleHabit(item.habit.id)}
              onIncrement={() => onIncrementHabit(item.habit.id)}
              onDecrement={() => onDecrementHabit(item.habit.id)}
            />
          ))}
        </section>
      ) : (
        <section className="surface rounded-[28px] p-8 text-center">
          <p className="display-font text-2xl font-semibold">No habits match this filter.</p>
          <p className="mt-2 text-sm" style={{ color: "var(--ink-soft)" }}>
            Try another filter or add a new habit to today&apos;s list.
          </p>
        </section>
      )}
    </div>
  )
}
