import React from "react"
import { BellRing, CheckCircle2, Clock3, X } from "lucide-react"

export const ReminderTray = ({
  items,
  onDismiss,
  onSnooze,
  onSkip,
  onDone
}) => {
  if (!items.length) {
    return null
  }

  return (
    <aside className="fixed bottom-20 right-4 z-[60] flex w-[min(420px,calc(100vw-2rem))] flex-col gap-3 lg:bottom-6">
      {items.map((item) => (
        <div key={item.id} className="surface-strong rounded-[24px] p-4 sheet-enter">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <BellRing size={20} />
              </div>
              <div>
                <p className="display-font text-base font-semibold">{item.title}</p>
                <p className="mt-1 text-sm" style={{ color: "var(--ink-soft)" }}>
                  {item.categoryEmoji} {item.categoryLabel} • {item.time}
                </p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Dismiss reminder"
              onClick={() => onDismiss(item.id)}
              className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onDone(item.id)}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
            >
              <CheckCircle2 size={16} />
              Mark done
            </button>
            {[5, 15, 30].map((minutes) => (
              <button
                key={minutes}
                type="button"
                onClick={() => onSnooze(item.id, minutes)}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition hover:border-emerald-300 hover:bg-emerald-50"
                style={{ borderColor: "var(--line-strong)" }}
              >
                <Clock3 size={16} />
                {minutes} min
              </button>
            ))}
            <button
              type="button"
              onClick={() => onSnooze(item.id, "within-today")}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition hover:border-blue-300 hover:bg-blue-50"
              style={{ borderColor: "var(--line-strong)" }}
            >
              <Clock3 size={16} />
              Within today
            </button>
            <button
              type="button"
              onClick={() => onSkip(item.id)}
              className="inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-sm font-medium transition hover:border-amber-300 hover:bg-amber-50"
              style={{ borderColor: "var(--line-strong)" }}
            >
              Skip today
            </button>
          </div>
        </div>
      ))}
    </aside>
  )
}
