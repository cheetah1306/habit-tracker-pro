import React, { useState, useEffect } from "react"
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"
import { Check, ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react"

const chartPanel = "surface rounded-[28px] p-5 sm:p-6"

const DayInspectionEntry = ({
  entry,
  selectedDateKey,
  onToggleHabitAtDate,
  onDecrementHabitAtDate,
  onIncrementHabitAtDate,
  onSaveDayNote
}) => {
  const [noteDraft, setNoteDraft] = useState("")

  useEffect(() => {
    setNoteDraft(entry.note || "")
  }, [entry.note, selectedDateKey])

  return (
    <div className="rounded-[24px] bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">
            {entry.category.emoji} {entry.habit.name}
          </p>
          <p className="mt-1 text-sm" style={{ color: "var(--ink-soft)" }}>
            {entry.completed ? "Completed" : "Not completed"} • {entry.progress}/{entry.habit.goalTarget}
          </p>
        </div>
        {entry.habit.goalType === "boolean" ? (
          <button
            type="button"
            onClick={() => onToggleHabitAtDate(entry.habit.id, selectedDateKey)}
            className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
              entry.completed ? "bg-amber-500 text-white" : "border"
            }`}
            style={entry.completed ? undefined : { borderColor: entry.habit.color, color: entry.habit.color }}
          >
            <Check size={16} />
            {entry.completed ? "Undo" : "Mark finished"}
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onDecrementHabitAtDate(entry.habit.id, selectedDateKey)}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border transition hover:bg-slate-100"
              style={{ borderColor: "var(--line-strong)" }}
            >
              <Minus size={16} />
            </button>
            <button
              type="button"
              onClick={() => onIncrementHabitAtDate(entry.habit.id, selectedDateKey)}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-white transition hover:opacity-90"
              style={{ backgroundColor: entry.completed ? "var(--gold)" : entry.habit.color }}
            >
              <Plus size={16} />
            </button>
          </div>
        )}
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
            className="min-h-[90px] w-full rounded-[20px] border bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500"
            style={{ borderColor: "var(--line-strong)" }}
          />
          <div className="mt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setNoteDraft("")
                onSaveDayNote(entry.habit.id, selectedDateKey, "")
              }}
              className="rounded-full px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={() => onSaveDayNote(entry.habit.id, selectedDateKey, noteDraft)}
              className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-500"
            >
              Save Note
            </button>
          </div>
        </div>
      </label>
    </div>
  )
}

export const AnalyticsView = ({
  weeklyChart,
  monthlyTrend,
  categoryBreakdown,
  heatmapData,
  heatmapMonthLabel,
  canMoveToNextHeatmapMonth,
  onPreviousHeatmapMonth,
  onNextHeatmapMonth,
  onCurrentHeatmapMonth,
  selectedDateKey,
  selectedDateLabel,
  dayInspection,
  onSelectHeatmapDate,
  onToggleHabitAtDate,
  onIncrementHabitAtDate,
  onDecrementHabitAtDate,
  onSaveDayNote,
  averageStreak,
  bestDay,
  trendingHabits,
  bestHabit,
  achievements,
  motivation
}) => (
  <div className="grid gap-6">
    <section className="grid gap-4 lg:grid-cols-4">
      <article className={chartPanel}>
        <p className="text-sm font-semibold" style={{ color: "var(--ink-soft)" }}>
          Average streak
        </p>
        <p className="display-font mt-4 text-3xl font-bold">{averageStreak}</p>
      </article>
      <article className={chartPanel}>
        <p className="text-sm font-semibold" style={{ color: "var(--ink-soft)" }}>
          Best day
        </p>
        <p className="display-font mt-4 text-3xl font-bold">{bestDay}</p>
      </article>
      <article className={chartPanel}>
        <p className="text-sm font-semibold" style={{ color: "var(--ink-soft)" }}>
          Best habit
        </p>
        <p className="display-font mt-4 text-2xl font-bold">{bestHabit?.habit.name || "None yet"}</p>
      </article>
      <article className={chartPanel}>
        <p className="text-sm font-semibold" style={{ color: "var(--ink-soft)" }}>
          Motivation
        </p>
        <p className="mt-4 text-sm leading-6">{motivation.quote}</p>
      </article>
    </section>

    <section className="grid gap-6 xl:grid-cols-[1.3fr,0.7fr]">
      <article className={chartPanel}>
        <div className="mb-4">
          <h2 className="display-font text-2xl font-bold">Weekly progress</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--ink-soft)" }}>
            Daily completion rate across the last seven days.
          </p>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyChart}>
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={36} />
              <Tooltip />
              <Bar dataKey="percentage" radius={[10, 10, 0, 0]}>
                {weeklyChart.map((entry) => (
                  <Cell key={entry.dateKey} fill={entry.percentage >= 100 ? "#f59e0b" : "#10b981"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className={chartPanel}>
        <div className="mb-4">
          <h2 className="display-font text-2xl font-bold">Category breakdown</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--ink-soft)" }}>
            Which kinds of habits you complete most often.
          </p>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip />
              <Pie data={categoryBreakdown} dataKey="value" nameKey="name" innerRadius={56} outerRadius={86}>
                {categoryBreakdown.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </article>
    </section>

    <section className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
      <article className={chartPanel}>
        <div className="mb-4">
          <h2 className="display-font text-2xl font-bold">Monthly trend</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--ink-soft)" }}>
            Daily completion percentage through {heatmapMonthLabel}.
          </p>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyTrend}>
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={36} />
              <Tooltip />
              <Line type="monotone" dataKey="percentage" stroke="#10b981" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className={chartPanel}>
        <div className="mb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="display-font text-2xl font-bold">Heatmap</h2>
              <p className="mt-1 text-sm" style={{ color: "var(--ink-soft)" }}>
                Switch months, then click a date to update that day&apos;s habit completions.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onPreviousHeatmapMonth}
                className="inline-flex min-h-11 items-center justify-center rounded-full border px-3 py-2 transition hover:bg-slate-100"
                style={{ borderColor: "var(--line-strong)" }}
                aria-label="Previous month"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={onCurrentHeatmapMonth}
                className="min-h-11 rounded-full border px-4 py-2 text-sm font-semibold transition hover:bg-slate-100"
                style={{ borderColor: "var(--line-strong)" }}
              >
                Current month
              </button>
              <button
                type="button"
                onClick={onNextHeatmapMonth}
                disabled={!canMoveToNextHeatmapMonth}
                className="inline-flex min-h-11 items-center justify-center rounded-full border px-3 py-2 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                style={{ borderColor: "var(--line-strong)" }}
                aria-label="Next month"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <p className="mt-3 text-sm font-semibold" style={{ color: "var(--teal)" }}>
            {heatmapMonthLabel}
          </p>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {heatmapData.map((day) => (
            <button
              key={day.dateKey}
              type="button"
              title={`${day.dateKey}: ${day.completed}/${day.due}`}
              onClick={() => onSelectHeatmapDate(day.dateKey)}
              className={`aspect-square rounded-2xl border p-2 text-left transition ${
                selectedDateKey === day.dateKey ? "shadow-glow" : ""
              }`}
              style={{
                borderColor: selectedDateKey === day.dateKey ? "#10b981" : "var(--line)",
                backgroundColor:
                  day.intensity >= 1
                    ? "rgba(245, 158, 11, 0.22)"
                    : day.intensity > 0.65
                    ? "rgba(16, 185, 129, 0.2)"
                    : day.intensity > 0.35
                    ? "rgba(16, 185, 129, 0.14)"
                    : "rgba(148, 163, 184, 0.1)"
              }}
            >
              <span className="block text-sm font-semibold">{day.dateKey.slice(-2)}</span>
              <span className="mt-2 block text-[11px]" style={{ color: "var(--ink-soft)" }}>
                {day.completed}/{day.due}
              </span>
            </button>
          ))}
        </div>
      </article>
    </section>

    <section className="grid gap-6 xl:grid-cols-[1fr,1fr]">
      <article className={chartPanel}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="display-font text-2xl font-bold">Selected day</h2>
            <p className="mt-1 text-sm" style={{ color: "var(--ink-soft)" }}>
              {selectedDateLabel}
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
            {dayInspection.length} habit(s)
          </span>
        </div>
        <div className="mt-4 grid gap-3">
          {dayInspection.length ? (
            dayInspection.map((entry) => (
              <DayInspectionEntry
                key={entry.habit.id}
                entry={entry}
                selectedDateKey={selectedDateKey}
                onToggleHabitAtDate={onToggleHabitAtDate}
                onDecrementHabitAtDate={onDecrementHabitAtDate}
                onIncrementHabitAtDate={onIncrementHabitAtDate}
                onSaveDayNote={onSaveDayNote}
              />
            ))
          ) : (
            <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
              No scheduled habits on this date.
            </p>
          )}
        </div>
      </article>

      <article className={chartPanel}>
        <h2 className="display-font text-2xl font-bold">Top habits</h2>
        <p className="mt-1 text-sm" style={{ color: "var(--ink-soft)" }}>Best performing habits by completion rate this fortnight.</p>
        <div className="mt-4 grid gap-3">
          {trendingHabits.map((item) => (
            <div key={item.habit.id} className="rounded-[24px] bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{item.habit.name}</p>
                  <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
                    Recent {item.recentRate}%
                    {item.priorRate > 0 && (
                      <span className={item.trend >= 0 ? "ml-2 text-emerald-600 font-semibold" : "ml-2 text-rose-500 font-semibold"}>
                        {item.trend >= 0 ? "↑" : "↓"}{Math.abs(item.trend)}%
                      </span>
                    )}
                    {item.priorRate === 0 && item.recentRate > 0 && (
                      <span className="ml-2 text-violet-600 font-semibold">✨ New</span>
                    )}
                  </p>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                  🔥 {item.streak}
                </span>
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>

    <section className="grid gap-6 xl:grid-cols-[1fr,1fr]">
      <article className={chartPanel}>
        <h2 className="display-font text-2xl font-bold">Achievements</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`rounded-[24px] border p-4 ${
                achievement.unlocked
                  ? "border-amber-300 bg-amber-50"
                  : "border-slate-200 bg-white/70"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{achievement.icon}</span>
                <div>
                  <p className="font-semibold">{achievement.label}</p>
                  <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
                    {achievement.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 grid gap-2 rounded-[24px] bg-slate-50 p-4 text-sm leading-6">
          <p>{motivation.productivity}</p>
          <p>{motivation.bestHabit}</p>
        </div>
      </article>
    </section>
  </div>
)
