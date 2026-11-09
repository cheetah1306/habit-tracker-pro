import React from "react"

export const EmptyState = ({ onCreate, templates, onApplyTemplate }) => (
  <section className="surface-strong card-enter rounded-[32px] p-6 sm:p-8">
    <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
      <div>
        <div className="flex items-center gap-3.5 mb-3">
          <div className="relative shrink-0">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-violet-600/40 to-red-600/40 blur-sm opacity-60" />
            <img
              src="/logo.png"
              alt="Habit Tracker Pro Logo"
              className="relative h-14 w-14 rounded-2xl object-cover shadow-lg ring-2 ring-violet-500/30 shrink-0"
            />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--teal)" }}>
              Habit Tracker Pro
            </p>
            <span className="text-xs font-bold text-slate-400">Master your daily consistency</span>
          </div>
        </div>
        <h2 className="display-font mt-3 text-3xl font-bold sm:text-4xl">
          Build a ritual that feels clear, calm, and rewarding.
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7" style={{ color: "var(--ink-soft)" }}>
          Start from scratch or load a starter pack. Everything stays local on this device, with streaks,
          reminders, insights, and monthly review ready as soon as your first habit is added.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onCreate}
            className="min-h-11 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-bg transition hover:opacity-90"
          >
            Create from scratch
          </button>
          {templates.slice(0, 3).map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => onApplyTemplate(template)}
              className="min-h-11 rounded-full border px-5 py-3 text-sm font-semibold transition hover:border-emerald-300 hover:bg-emerald-50"
              style={{ borderColor: "var(--line-strong)" }}
            >
              Use {template.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
        {templates.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onApplyTemplate(template)}
            className="surface rounded-[24px] p-4 text-left transition hover:-translate-y-1 hover:shadow-glow"
          >
            <p className="display-font text-lg font-semibold">{template.label}</p>
            <p className="mt-2 text-sm leading-6" style={{ color: "var(--ink-soft)" }}>
              {template.description}
            </p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--teal)" }}>
              {template.habits.length} habits
            </p>
          </button>
        ))}
      </div>
    </div>
  </section>
)
