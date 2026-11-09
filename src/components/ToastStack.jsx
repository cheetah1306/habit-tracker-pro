import React from "react"

const toneClasses = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  danger: "border-rose-200 bg-rose-50 text-rose-900",
  default: "border-slate-200 bg-white/90 text-slate-900"
}

export const ToastStack = ({ toasts }) => {
  if (!toasts.length) {
    return null
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[70] flex flex-col items-center gap-3 px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto w-full max-w-md rounded-2xl border px-4 py-3 shadow-panel sheet-enter ${toneClasses[toast.tone || "default"]}`}
        >
          <div className="flex items-start gap-3">
            <span className="text-lg">{toast.icon || "✓"}</span>
            <div>
              <p className="font-semibold">{toast.title}</p>
              {toast.message ? <p className="mt-1 text-sm opacity-80">{toast.message}</p> : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
