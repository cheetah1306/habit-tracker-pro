import React from "react"
import { Flame, Minus, Plus, Check } from "lucide-react"
import { getDifficultyLabel, getScheduleLabel } from "../lib/habits"
import { getStreakFlameTier } from "../lib/godmode"

const difficultyClasses = {
  easy: "bg-emerald-50 text-emerald-700",
  medium: "bg-amber-50 text-amber-700",
  hard: "bg-rose-50 text-rose-700"
}

export const HabitCard = React.memo(({
  habit,
  category,
  status,
  streak,
  lastCompletedLabel,
  onOpen,
  onToggle,
  onIncrement,
  onDecrement
}) => {
  const completed = status.completed
  const progressText =
    habit.goalType === "count" ? `${status.progress}/${habit.goalTarget}` : completed ? "Done" : "Open"
  const flameTier = getStreakFlameTier(streak)

  return (
    <article
      className={`surface card-enter cursor-pointer rounded-[28px] p-5 transition hover:-translate-y-1 hover:shadow-glow ${
        completed ? "border-amber-300/60 shadow-glow" : ""
      }`}
      onClick={onOpen}
      aria-label={`Open ${habit.name} details`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-[20px] text-2xl shadow-sm"
            style={{ backgroundColor: `${habit.color}18`, color: habit.color }}
          >
            {category.emoji}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className={`display-font text-xl font-semibold ${completed ? "opacity-80 line-through" : ""}`}>
                {habit.name}
              </h3>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${difficultyClasses[habit.difficulty]}`}>
                {getDifficultyLabel(habit.difficulty)}
              </span>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6" style={{ color: "var(--ink-soft)" }}>
              {habit.description || "No description added yet."}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium">
              <span className="rounded-full bg-slate-100 px-3 py-1">
                {category.emoji} {category.label}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1">{getScheduleLabel(habit)}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">{progressText}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black select-none shadow-sm"
            style={{
              background: streak > 0 ? flameTier.gradient : undefined,
              color: streak > 0 ? "#FFFFFF" : undefined,
              boxShadow: streak > 0 ? `0 0 10px ${flameTier.glowColor}` : undefined
            }}
          >
            <span>{streak > 0 ? flameTier.emoji : "🔥"}</span>
            <span>{streak}</span>
          </div>
          <p className="text-xs text-right leading-5" style={{ color: "var(--ink-soft)" }}>
            {lastCompletedLabel}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <div
          className="h-2.5 flex-1 overflow-hidden rounded-full"
          style={{ backgroundColor: `${habit.color}1f` }}
          aria-hidden="true"
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${Math.min(100, Math.round((status.progress / habit.goalTarget) * 100))}%`,
              backgroundColor: completed ? "var(--gold)" : habit.color
            }}
          />
        </div>

        {habit.goalType === "boolean" ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onToggle()
            }}
            className={`duo-btn min-h-11 rounded-2xl px-5 py-2 text-xs font-black uppercase tracking-wider transition ${
              completed
                ? "duo-btn-amber"
                : "duo-btn-emerald"
            }`}
          >
            {completed ? (
              <span className="flex items-center gap-1.5">
                <Check size={14} /> Completed
              </span>
            ) : (
              "Check In ⚡"
            )}
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onDecrement()
              }}
              className="duo-btn inline-flex min-h-11 min-w-11 items-center justify-center rounded-2xl border transition hover:bg-slate-100"
              style={{ borderColor: "var(--line-strong)" }}
              aria-label={`Decrease progress for ${habit.name}`}
            >
              <Minus size={16} />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onIncrement()
              }}
              className={`duo-btn inline-flex min-h-11 min-w-11 items-center justify-center rounded-2xl font-black text-white ${
                completed ? "duo-btn-amber" : "duo-btn-emerald"
              }`}
              aria-label={`Increase progress for ${habit.name}`}
            >
              <Plus size={16} />
            </button>
          </div>
        )}
      </div>
    </article>
  )
})

