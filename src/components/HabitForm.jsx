import React from "react"
import { COLOR_PRESETS } from "../data/categories"
import { getWeekdayName } from "../lib/dates"

const dayChoices = [0, 1, 2, 3, 4, 5, 6]

export const createHabitDraft = (settings, overrides = {}) => ({
  name: "",
  description: "",
  categoryId: "fitness",
  customCategoryLabel: "",
  customCategoryEmoji: "",
  color: "#10b981",
  difficulty: "medium",
  goalType: "boolean",
  goalTarget: 1,
  schedule: { mode: "daily" },
  reminderTime: settings.defaultReminderTime || "",
  ...overrides
})

const fieldClasses =
  "mt-2 min-h-11 w-full rounded-2xl border bg-[rgba(248,250,252,0.98)] px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-500"

const fieldStyle = {
  borderColor: "var(--line-strong)",
  colorScheme: "light"
}

export const HabitForm = ({ draft, onChange, categories }) => {
  const update = (patch) => onChange({ ...draft, ...patch })

  const updateSchedule = (patch) =>
    update({
      schedule: {
        ...draft.schedule,
        ...patch
      }
    })

  const toggleWeekday = (weekday) => {
    const current = new Set(draft.schedule.weekdays || [])
    if (current.has(weekday)) {
      current.delete(weekday)
    } else {
      current.add(weekday)
    }

    updateSchedule({
      weekdays: [...current].sort((left, right) => left - right)
    })
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold">Habit name</span>
          <input
            type="text"
            maxLength={50}
            value={draft.name}
            onChange={(event) => update({ name: event.target.value.slice(0, 50) })}
            placeholder="Morning pages"
            className={fieldClasses}
            style={fieldStyle}
          />
          <span className="mt-1 block text-right text-xs" style={{ color: "var(--ink-soft)" }}>
            {draft.name.length}/50
          </span>
        </label>

        <label className="block">
          <span className="text-sm font-semibold">Reminder time</span>
          <input
            type="time"
            value={draft.reminderTime || ""}
            onChange={(event) => update({ reminderTime: event.target.value })}
            className={fieldClasses}
            style={fieldStyle}
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-semibold">Description</span>
        <textarea
          maxLength={150}
          value={draft.description}
          onChange={(event) => update({ description: event.target.value.slice(0, 150) })}
          placeholder="Why this habit matters."
          className={`${fieldClasses} min-h-[120px] resize-none`}
          style={fieldStyle}
        />
        <span className="mt-1 block text-right text-xs" style={{ color: "var(--ink-soft)" }}>
          {draft.description.length}/150
        </span>
      </label>

      <div className="grid gap-5 lg:grid-cols-3">
        <label className="block">
          <span className="text-sm font-semibold">Category</span>
          <select
            value={draft.categoryId}
            onChange={(event) => update({ categoryId: event.target.value })}
            className={fieldClasses}
            style={fieldStyle}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.emoji} {category.label}
              </option>
            ))}
            <option value="custom">✨ Custom category</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-semibold">Difficulty</span>
          <select
            value={draft.difficulty}
            onChange={(event) => update({ difficulty: event.target.value })}
            className={fieldClasses}
            style={fieldStyle}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-semibold">Goal type</span>
          <select
            value={draft.goalType}
            onChange={(event) => update({ goalType: event.target.value, goalTarget: event.target.value === "count" ? 8 : 1 })}
            className={fieldClasses}
            style={fieldStyle}
          >
            <option value="boolean">One tap</option>
            <option value="count">Numeric goal</option>
          </select>
        </label>
      </div>

      {draft.categoryId === "custom" ? (
        <div className="grid gap-5 lg:grid-cols-[1fr,160px]">
          <label className="block">
            <span className="text-sm font-semibold">Custom category label</span>
            <input
              type="text"
              value={draft.customCategoryLabel}
              onChange={(event) => update({ customCategoryLabel: event.target.value })}
              placeholder="Creative work"
              className={fieldClasses}
              style={fieldStyle}
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold">Emoji</span>
            <input
              type="text"
              maxLength={2}
              value={draft.customCategoryEmoji}
              onChange={(event) => update({ customCategoryEmoji: event.target.value })}
              placeholder="🎨"
              className={fieldClasses}
              style={fieldStyle}
            />
          </label>
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1fr,220px]">
        <label className="block">
          <span className="text-sm font-semibold">Frequency</span>
          <select
            value={draft.schedule.mode}
            onChange={(event) => {
              const mode = event.target.value
              if (mode === "interval") {
                update({ schedule: { mode, intervalDays: 2 } })
              } else if (mode === "weekly") {
                update({ schedule: { mode, weekday: 1 } })
              } else if (mode === "custom") {
                update({ schedule: { mode, weekdays: [1, 3, 5] } })
              } else {
                update({ schedule: { mode: "daily" } })
              }
            }}
            className={fieldClasses}
            style={fieldStyle}
          >
            <option value="daily">Daily</option>
            <option value="interval">Every 2 days</option>
            <option value="weekly">Weekly</option>
            <option value="custom">Custom weekdays</option>
          </select>
        </label>

        {draft.goalType === "count" ? (
          <label className="block">
            <span className="text-sm font-semibold">Goal target</span>
            <input
              type="number"
              min="1"
              value={draft.goalTarget}
              onChange={(event) => update({ goalTarget: Number(event.target.value) || 1 })}
              className={fieldClasses}
              style={fieldStyle}
            />
          </label>
        ) : null}
      </div>

      {draft.schedule.mode === "interval" ? (
        <label className="block">
          <span className="text-sm font-semibold">Interval days</span>
          <input
            type="number"
            min="2"
            value={draft.schedule.intervalDays || 2}
            onChange={(event) => updateSchedule({ intervalDays: Math.max(2, Number(event.target.value) || 2) })}
            className={fieldClasses}
            style={fieldStyle}
          />
        </label>
      ) : null}

      {draft.schedule.mode === "weekly" ? (
        <label className="block">
          <span className="text-sm font-semibold">Weekly day</span>
          <select
            value={draft.schedule.weekday ?? 1}
            onChange={(event) => updateSchedule({ weekday: Number(event.target.value) })}
            className={fieldClasses}
            style={fieldStyle}
          >
            {dayChoices.map((day) => (
              <option key={day} value={day}>
                {getWeekdayName(day)}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {draft.schedule.mode === "custom" ? (
        <div>
          <span className="text-sm font-semibold">Custom weekdays</span>
          <div className="mt-3 flex flex-wrap gap-2">
            {dayChoices.map((day) => {
              const active = draft.schedule.weekdays?.includes(day)
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleWeekday(day)}
                  className={`min-h-11 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active ? "bg-emerald-600 text-white" : "border hover:bg-emerald-50"
                  }`}
                  style={active ? undefined : { borderColor: "var(--line-strong)" }}
                >
                  {getWeekdayName(day).slice(0, 3)}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      <div>
        <span className="text-sm font-semibold">Color theme</span>
        <div className="mt-3 flex flex-wrap gap-3">
          {COLOR_PRESETS.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={`Select ${color}`}
              onClick={() => update({ color })}
              className={`h-11 w-11 rounded-full border-4 transition ${draft.color === color ? "scale-110" : ""}`}
              style={{
                backgroundColor: color,
                borderColor: draft.color === color ? "white" : "transparent",
                boxShadow: draft.color === color ? `0 0 0 2px ${color}` : "none"
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
