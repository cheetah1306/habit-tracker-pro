import React, { useEffect, useState } from "react"
import { differenceInCalendarDays } from "date-fns"
import { Calendar, CheckCircle2, Flame, PencilLine, RotateCcw, Trash2, X } from "lucide-react"
import {
  formatDateHeading,
  formatMonthHeading,
  formatRelativeCompleted,
  formatTime,
  getMonthMatrix,
  todayKey
} from "../lib/dates"
import {
  getCompletionRateForRange,
  getCurrentStreak,
  getHabitStatusForDate,
  getLastCompletedAt,
  getLatestMissedDate,
  getLongestStreak,
  getSevenDayHistory
} from "../lib/habits"

export const HabitDrawer = ({
  habit,
  category,
  completions,
  weekStartsOn,
  onClose,
  onEdit,
  onArchive,
  onDelete,
  onReset,
  onSaveNote,
  onComplete
}) => {
  const [selectedDateKey, setSelectedDateKey] = useState(todayKey())
  const [noteDraft, setNoteDraft] = useState("")
  const monthGrid = getMonthMatrix(new Date(), weekStartsOn)

  useEffect(() => {
    setSelectedDateKey(todayKey())
  }, [habit?.id])

  useEffect(() => {
    if (habit) {
      const status = getHabitStatusForDate(habit, completions, selectedDateKey)
      setNoteDraft(status.note || "")
    }
  }, [habit, completions, selectedDateKey])

  useEffect(() => {
    if (habit) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [habit])

  if (!habit) {
    return null
  }

  const currentStreak = getCurrentStreak(habit, completions)
  const longestStreak = getLongestStreak(habit, completions)
  const latestMissed = getLatestMissedDate(habit, completions)
  const daysSinceBroken = latestMissed ? differenceInCalendarDays(new Date(), new Date(latestMissed)) : null
  const lastCompletedAt = getLastCompletedAt(habit, completions)
  const weekHistory = getSevenDayHistory(habit, completions)
  const weekRate = getCompletionRateForRange(
    habit,
    completions,
    weekHistory.filter((entry) => entry.due).map((entry) => entry.dateKey)
  )
  const donutOffset = 283 * (1 - weekRate / 100)
  const selectedStatus = getHabitStatusForDate(habit, completions, selectedDateKey)

  return (
    <div
      className="fixed inset-0 z-[100000] bg-slate-950/50 backdrop-blur-md lg:flex lg:justify-end"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100000
      }}
    >
      <div
        className="surface-strong drawer-enter ml-auto h-full w-full max-w-2xl overflow-y-auto rounded-t-[32px] p-5 lg:rounded-none lg:rounded-l-[32px] lg:p-8"
        style={{
          paddingTop: "max(1.25rem, env(safe-area-inset-top, 1.25rem))",
          paddingBottom: "max(1.5rem, env(safe-area-inset-bottom, 1.5rem))"
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-[24px] text-3xl"
              style={{ backgroundColor: `${habit.color}20`, color: habit.color }}
            >
              {category.emoji}
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--teal)" }}>
                Habit details
              </p>
              <h2 className="display-font mt-2 text-3xl font-bold">{habit.name}</h2>
              <p className="mt-2 text-sm" style={{ color: "var(--ink-soft)" }}>
                {habit.description || "No description added yet."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border p-2 transition hover:bg-slate-100"
            style={{ borderColor: "var(--line-strong)" }}
            aria-label="Close habit details"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <article className="rounded-[26px] bg-slate-50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--ink-soft)" }}>
                  Current streak
                </p>
                <p className="display-font mt-3 text-4xl font-bold">{currentStreak}</p>
              </div>
              <Flame className="text-amber-500" size={26} />
            </div>
            <p className="mt-3 text-sm" style={{ color: "var(--ink-soft)" }}>
              Longest streak: {longestStreak}
            </p>
            <p className="mt-1 text-sm" style={{ color: "var(--ink-soft)" }}>
              {daysSinceBroken !== null ? `${daysSinceBroken} day(s) since the last break.` : "No break recorded yet."}
            </p>
          </article>

          <article className="rounded-[26px] bg-slate-50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--ink-soft)" }}>
                  Weekly completion
                </p>
                <p className="display-font mt-3 text-4xl font-bold">{weekRate}%</p>
              </div>
              <svg width="96" height="96">
                <circle cx="48" cy="48" r="45" stroke="rgba(148, 163, 184, 0.2)" strokeWidth="6" fill="none" />
                <circle
                  cx="48"
                  cy="48"
                  r="45"
                  stroke="var(--teal)"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="283"
                  strokeDashoffset={donutOffset}
                  transform="rotate(-90 48 48)"
                />
              </svg>
            </div>
            <p className="mt-3 text-sm" style={{ color: "var(--ink-soft)" }}>
              {formatRelativeCompleted(lastCompletedAt)}
            </p>
          </article>
        </div>

        <section className="mt-6 rounded-[30px] bg-slate-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="display-font text-2xl font-bold">Last 7 days</h3>
              <p className="mt-1 text-sm" style={{ color: "var(--ink-soft)" }}>
                Due days count toward the streak.
              </p>
            </div>
            <Calendar size={20} className="text-slate-500" />
          </div>
          <div className="mt-4 grid grid-cols-7 gap-2">
            {weekHistory.map((entry) => (
              <div
                key={entry.dateKey}
                className={`rounded-[22px] border p-3 text-center ${
                  entry.completed ? "border-amber-300 bg-amber-50" : ""
                }`}
                style={{ borderColor: entry.completed ? undefined : "var(--line)" }}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--ink-soft)" }}>
                  {entry.dateKey.slice(8)}
                </p>
                <p className="mt-3 text-lg">{entry.completed ? "✓" : entry.due ? "•" : "—"}</p>
                <p className="mt-2 text-xs" style={{ color: "var(--ink-soft)" }}>
                  {entry.progress}/{habit.goalTarget}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-[30px] bg-slate-50 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="display-font text-2xl font-bold">{formatMonthHeading(new Date())}</h3>
              <p className="mt-1 text-sm" style={{ color: "var(--ink-soft)" }}>
                Select any day to review notes and completion details.
              </p>
            </div>
            <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold">{category.label}</div>
          </div>
          <div className="mt-5 grid grid-cols-7 gap-2">
            {monthGrid.map((day) => {
              const status = getHabitStatusForDate(habit, completions, day.key)
              return (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => setSelectedDateKey(day.key)}
                  className={`rounded-[18px] border p-2 text-center text-sm font-semibold transition ${
                    day.key === selectedDateKey ? "border-emerald-400" : ""
                  } ${day.currentMonth ? "" : "opacity-45"}`}
                  style={{
                    borderColor: day.key === selectedDateKey ? "#10b981" : "var(--line)",
                    backgroundColor: status.completed ? "rgba(16, 185, 129, 0.14)" : "transparent"
                  }}
                >
                  <span>{day.date.getDate()}</span>
                  <span className="mt-1 block text-[11px]" style={{ color: "var(--ink-soft)" }}>
                    {status.progress}
                  </span>
                </button>
              )
            })}
          </div>
          <div className="mt-5 rounded-[24px] bg-white/80 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{formatDateHeading(selectedDateKey)}</p>
                <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
                  {selectedStatus.completed
                    ? `Logged at ${selectedStatus.completedAt ? formatTime(selectedStatus.completedAt) : "unknown time"}`
                    : "No completion logged"}
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
                {selectedStatus.progress}/{habit.goalTarget}
              </span>
            </div>
            <label className="mt-4 block">
              <span className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--ink-soft)" }}>
                Note
              </span>
              <div className="mt-2 relative">
                <textarea
                  value={noteDraft}
                  onChange={(event) => setNoteDraft(event.target.value)}
                  maxLength={200}
                  placeholder="Add a note for this day..."
                  className="min-h-[110px] w-full rounded-[20px] border bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
                  style={{ borderColor: "var(--line-strong)" }}
                />
                <div className="mt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNoteDraft("")
                      onSaveNote(habit.id, selectedDateKey, "")
                    }}
                    className="rounded-full px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => onSaveNote(habit.id, selectedDateKey, noteDraft)}
                    className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-500"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            </label>
          </div>
        </section>

        <div className="mt-6 flex flex-wrap gap-3 pt-4">
          {!selectedStatus.completed && selectedDateKey <= todayKey() && (
            <button
              type="button"
              onClick={() => onComplete(habit.id, selectedDateKey)}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
            >
              <CheckCircle2 size={16} />
              Mark as done
            </button>
          )}
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-bg"
          >
            <PencilLine size={16} />
            Edit habit
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold"
            style={{ borderColor: "var(--line-strong)" }}
          >
            <RotateCcw size={16} />
            Reset streak
          </button>
          <button
            type="button"
            onClick={onArchive}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold"
            style={{ borderColor: "var(--line-strong)" }}
          >
            Archive
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-rose-300 px-5 py-3 text-sm font-semibold text-rose-700"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
