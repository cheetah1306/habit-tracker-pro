import React, { useEffect, useState } from "react"
import { X } from "lucide-react"
import { HabitForm } from "./HabitForm"

export const HabitModal = ({
  open,
  mode,
  draft,
  onChange,
  onClose,
  onSubmit,
  categories,
  templates,
  onApplyTemplate
}) => {
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
      setSubmitting(false)
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  if (!open) {
    return null
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    await Promise.resolve(onSubmit())
    setSubmitting(false)
  }

  const isValid =
    draft.name.trim() &&
    (draft.categoryId !== "custom" || draft.customCategoryLabel.trim()) &&
    (draft.schedule.mode !== "custom" || draft.schedule.weekdays?.length)

  return (
    <div
      className="fixed inset-0 z-[100000] bg-slate-950/50 px-4 py-6 backdrop-blur-md sm:flex sm:items-center sm:justify-center overflow-y-auto"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100000,
        paddingTop: "max(1rem, env(safe-area-inset-top, 1rem))",
        paddingBottom: "max(1rem, env(safe-area-inset-bottom, 1rem))"
      }}
    >
      <div className="surface-strong sheet-enter mx-auto h-full max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[32px] p-5 sm:h-auto sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--teal)" }}>
              {mode === "edit" ? "Edit habit" : "Quick add habit"}
            </p>
            <h2 className="display-font mt-2 text-2xl font-bold sm:text-3xl">
              {mode === "edit" ? "Refine the habit details." : "Create a habit in under a minute."}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border p-2 transition hover:bg-slate-100"
            style={{ borderColor: "var(--line-strong)" }}
            aria-label="Close add habit modal"
          >
            <X size={18} />
          </button>
        </div>

        {mode === "create" ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => onApplyTemplate(template)}
                className="min-h-11 rounded-full border px-4 py-2 text-sm font-semibold transition hover:border-emerald-300 hover:bg-emerald-50"
                style={{ borderColor: "var(--line-strong)" }}
              >
                {template.label}
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-6">
          <HabitForm draft={draft} onChange={onChange} categories={categories} />
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-full border px-5 py-3 text-sm font-semibold transition hover:bg-slate-100"
            style={{ borderColor: "var(--line-strong)" }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!isValid || submitting}
            onClick={handleSubmit}
            className="min-h-11 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-bg transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Saving..." : mode === "edit" ? "Save changes" : "Create habit"}
          </button>
        </div>
      </div>
    </div>
  )
}
