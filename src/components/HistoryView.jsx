import React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { addMonths } from "date-fns"
import { formatDateHeading, formatMonthHeading, formatTime, getMonthMatrix, todayKey } from "../lib/dates"

export const HistoryView = ({
  monthDate,
  setMonthDate,
  heatmapData,
  weekStartsOn,
  selectedDateKey,
  onSelectDate,
  dayInspection,
  onSaveNote,
  logs
}) => {
  const monthGrid = getMonthMatrix(monthDate, weekStartsOn)
  const heatmapByKey = Object.fromEntries(heatmapData.map((entry) => [entry.dateKey, entry]))

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr,0.9fr]">
      <section className="surface rounded-[30px] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="display-font text-2xl font-bold">History & logs</h2>
            <p className="mt-1 text-sm" style={{ color: "var(--ink-soft)" }}>
              Inspect any day and edit notes after the fact.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMonthDate(addMonths(monthDate, -1))}
              className="rounded-full border p-2 transition hover:bg-slate-100"
              style={{ borderColor: "var(--line-strong)" }}
              aria-label="Previous month"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold">
              {formatMonthHeading(monthDate)}
            </span>
            <button
              type="button"
              onClick={() => setMonthDate(addMonths(monthDate, 1))}
              className="rounded-full border p-2 transition hover:bg-slate-100"
              style={{ borderColor: "var(--line-strong)" }}
              aria-label="Next month"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--ink-soft)" }}>
          {Array.from({ length: 7 }).map((_, index) => (
            <span key={index}>{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][(index + weekStartsOn) % 7]}</span>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-7 gap-2">
          {monthGrid.map((day) => {
            const heat = heatmapByKey[day.key]
            const active = day.key === selectedDateKey
            const today = day.key === todayKey()
            return (
              <button
                key={day.key}
                type="button"
                onClick={() => onSelectDate(day.key)}
                className={`aspect-square rounded-[18px] border text-sm font-semibold transition ${
                  active ? "border-emerald-400 shadow-glow" : ""
                } ${day.currentMonth ? "" : "opacity-45"}`}
                style={{
                  borderColor: active ? "#10b981" : "var(--line)",
                  backgroundColor:
                    heat?.intensity >= 1
                      ? "rgba(245, 158, 11, 0.2)"
                      : heat?.intensity > 0.65
                      ? "rgba(16, 185, 129, 0.18)"
                      : heat?.intensity > 0.35
                      ? "rgba(16, 185, 129, 0.12)"
                      : "transparent"
                }}
              >
                <span className={today ? "rounded-full bg-ink px-2 py-1 text-bg" : ""}>
                  {day.date.getDate()}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="grid gap-6">
        <article className="surface rounded-[30px] p-5 sm:p-6">
          <h2 className="display-font text-2xl font-bold">{formatDateHeading(selectedDateKey)}</h2>
          <div className="mt-4 grid gap-4">
            {dayInspection.length ? (
              dayInspection.map((entry) => (
                <div key={entry.habit.id} className="rounded-[24px] bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">
                        {entry.category.emoji} {entry.habit.name}
                      </p>
                      <p className="mt-1 text-sm" style={{ color: "var(--ink-soft)" }}>
                        {entry.completed
                          ? `Completed at ${entry.completedAt ? formatTime(entry.completedAt) : "unknown time"}`
                          : "Not completed"}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold">
                      {entry.progress}/{entry.habit.goalTarget}
                    </span>
                  </div>
                  <label className="mt-4 block">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--ink-soft)" }}>
                      Daily note
                    </span>
                    <textarea
                      value={entry.note}
                      onChange={(event) => onSaveNote(entry.habit.id, selectedDateKey, event.target.value)}
                      maxLength={200}
                      className="mt-2 min-h-[96px] w-full rounded-[20px] border bg-white/70 px-4 py-3 text-sm outline-none transition"
                      style={{ borderColor: "var(--line-strong)" }}
                    />
                  </label>
                </div>
              ))
            ) : (
              <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
                No scheduled habits on this date.
              </p>
            )}
          </div>
        </article>

        <article className="surface rounded-[30px] p-5 sm:p-6">
          <h2 className="display-font text-2xl font-bold">Completion log</h2>
          <div className="mt-4 grid gap-3">
            {logs.slice(0, 18).map((log) => (
              <div key={`${log.habitId}-${log.completedAt}`} className="rounded-[22px] bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {log.categoryEmoji} {log.habitName}
                    </p>
                    <p className="mt-1 text-sm" style={{ color: "var(--ink-soft)" }}>
                      {formatDateHeading(log.date)} • {log.completedAt ? formatTime(log.completedAt) : ""}
                    </p>
                  </div>
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: log.habitColor }} aria-hidden="true" />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}
