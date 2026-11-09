import React, { useEffect } from "react"
import { Crown, Sparkles, Flame, Shield, X } from "lucide-react"
import confetti from "canvas-confetti"
import { playGodmodeCelebrationSound } from "../lib/audio"

export const GodmodeCelebrationModal = ({
  isOpen = false,
  onClose,
  habitsCount = 0,
  streak = 0,
  soundEnabled = true
}) => {
  useEffect(() => {
    if (isOpen) {
      playGodmodeCelebrationSound(soundEnabled)

      // Dual-cannon confetti burst
      const end = Date.now() + 1800
      const colors = ["#FFD700", "#FFA500", "#FF4500", "#00FFFF", "#FF1493"]

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 65,
          origin: { x: 0, y: 0.7 },
          colors
        })
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 65,
          origin: { x: 1, y: 0.7 },
          colors
        })

        if (Date.now() < end) {
          requestAnimationFrame(frame)
        }
      }
      frame()
    }
  }, [isOpen, soundEnabled])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md overflow-y-auto"
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 100000 }}
    >
      <div
        className="surface relative max-w-md w-full overflow-hidden rounded-[36px] p-6 sm:p-8 text-center shadow-2xl border-2 border-amber-400"
        style={{ animation: "godmodeAuraPulse 2s infinite ease-in-out" }}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Crown Icon & Aura */}
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-5xl shadow-lg">
          👑
        </div>

        {/* Heading */}
        <p className="mt-5 text-xs font-black uppercase tracking-[0.28em] text-amber-500">
          Daily Perfection Attained
        </p>
        <h2 className="display-font mt-2 text-3xl font-black sm:text-4xl text-amber-900">
          ABSOLUTE GODMODE!
        </h2>

        <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
          You crushed every single habit due today without missing a beat. Your discipline is completely unbreakable.
        </p>

        {/* Stats Showcase */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-amber-500/10 p-3.5">
            <div className="flex items-center justify-center gap-1 text-amber-600">
              <Sparkles size={16} />
              <span className="text-xs font-bold uppercase">Habits Done</span>
            </div>
            <p className="display-font mt-1 text-2xl font-black">{habitsCount}/{habitsCount}</p>
          </div>

          <div className="rounded-2xl bg-orange-500/10 p-3.5">
            <div className="flex items-center justify-center gap-1 text-orange-600">
              <Flame size={16} />
              <span className="text-xs font-bold uppercase">Streak Secured</span>
            </div>
            <p className="display-font mt-1 text-2xl font-black">{streak} Days 🔥</p>
          </div>
        </div>

        {/* Tactile 3D Action Button */}
        <button
          type="button"
          onClick={onClose}
          className="duo-btn duo-btn-amber mt-7 w-full rounded-2xl py-3.5 text-sm font-black uppercase tracking-wider shadow-lg"
        >
          Claim Godmode Glory ⚡
        </button>
      </div>
    </div>
  )
}
