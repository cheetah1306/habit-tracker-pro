import React, { useEffect } from "react"
import confetti from "canvas-confetti"
import { Award, ChevronRight, Sparkles, X } from "lucide-react"

export const LevelUpModal = ({
  open,
  onClose,
  levelInfo,
  soundEnabled = false
}) => {
  useEffect(() => {
    if (open && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.4 },
        colors: ["#f59e0b", "#10b981", "#6366f1", "#ec4899", "#fbbf24"]
      })
    }
  }, [open])

  if (!open || !levelInfo) return null

  return (
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center p-4 overflow-y-auto"
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
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
        style={{ position: "fixed", inset: 0 }}
      />

      <div
        className="relative z-10 w-full max-w-md overflow-hidden rounded-[36px] p-6 text-center text-slate-900 shadow-2xl transition-all sm:p-8"
        style={{
          background: "linear-gradient(180deg, var(--glass-panel), var(--bg))",
          border: "2px solid rgba(245, 158, 11, 0.4)",
          boxShadow: "0 25px 70px -10px rgba(245, 158, 11, 0.3)"
        }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100"
        >
          <X size={20} />
        </button>

        <div className="my-2 flex flex-col items-center">
          <div
            className="my-3 flex h-32 w-32 items-center justify-center rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(245, 158, 11, 0.35), transparent 70%)",
              animation: "levelUpPulse 2s infinite"
            }}
          >
            <span className="text-7xl">{levelInfo.emoji || "👑"}</span>
          </div>

          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-4 py-1 text-xs font-bold uppercase tracking-widest text-amber-500">
            <Sparkles size={14} /> Level Up Achieved!
          </span>

          <h2 className="display-font mt-3 text-3xl font-extrabold sm:text-4xl">
            Level {levelInfo.level}
          </h2>

          <p className="mt-1 text-lg font-bold" style={{ color: "var(--teal)" }}>
            {levelInfo.title}
          </p>

          <p className="mt-4 max-w-xs text-sm leading-6 text-slate-600">
            Your persistence is forging unbreakable habits. Keep checking in daily to reach higher ranks!
          </p>

          <div className="mt-6 flex w-full items-center justify-between rounded-2xl bg-slate-100/70 p-4">
            <div className="text-left">
              <p className="text-xs font-semibold text-slate-400">Total Experience</p>
              <p className="text-lg font-bold text-slate-800">
                {levelInfo.totalXp} XP
              </p>
            </div>
            <div className="rounded-xl bg-amber-500/10 p-2 text-amber-500">
              <Award size={24} />
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 font-bold text-bg transition hover:opacity-90"
          >
            <span>Continue Journey</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
