import React, { useState, useEffect } from "react"
import { Clock, Shield, Flame, AlertTriangle, CheckCircle2, Info } from "lucide-react"
import { getUrgencyStatus, getStreakFlameTier } from "../lib/godmode"

export const StreakUrgencyBar = React.memo(({
  dueCount = 0,
  completedCount = 0,
  streak = 0,
  streakShields = 1
}) => {
  const [urgency, setUrgency] = useState(() => getUrgencyStatus(dueCount, completedCount))
  const [showShieldModal, setShowShieldModal] = useState(false)

  // Live timer ticking only when pending habits exist
  useEffect(() => {
    const update = () => {
      setUrgency(getUrgencyStatus(dueCount, completedCount))
    }
    update()
    if (dueCount > 0 && completedCount >= dueCount) {
      return
    }
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [dueCount, completedCount])

  const flameTier = getStreakFlameTier(streak)

  // Styles based on urgency state
  const getContainerStyle = () => {
    switch (urgency.state) {
      case "triumphant":
        return {
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/40",
          textColor: "text-emerald-800",
          iconColor: "text-emerald-600"
        }
      case "emergency":
        return {
          bg: "bg-rose-500/15",
          border: "border-rose-500/60 shadow-[0_0_15px_rgba(239,68,68,0.3)]",
          textColor: "text-rose-900",
          iconColor: "text-rose-600"
        }
      case "warning":
        return {
          bg: "bg-amber-500/10",
          border: "border-amber-500/40",
          textColor: "text-amber-900",
          iconColor: "text-amber-600"
        }
      default:
        return {
          bg: "bg-slate-100",
          border: "border-slate-200",
          textColor: "text-slate-800",
          iconColor: "text-slate-600"
        }
    }
  }

  const styles = getContainerStyle()

  return (
    <>
      <div
        className={`card-enter flex flex-wrap items-center justify-between gap-3 rounded-[24px] border p-3.5 transition-all sm:p-4 ${styles.bg} ${styles.border}`}
      >
        {/* Left: Flame Tier & Urgency Message */}
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xl select-none"
            style={{
              background: flameTier.gradient,
              boxShadow: `0 0 12px ${flameTier.glowColor}`,
              animation: "flameFlicker 2s infinite ease-in-out"
            }}
          >
            {flameTier.emoji}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider" style={{ color: flameTier.color }}>
                {flameTier.name} • {streak} Day Streak
              </span>
            </div>
            <p className={`text-xs font-bold sm:text-sm ${styles.textColor}`}>
              {urgency.message}
            </p>
          </div>
        </div>

        {/* Right: Countdown Clock & Shield Badge */}
        <div className="flex items-center gap-2">
          {/* Midnight Countdown */}
          <div
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-mono font-bold ${
              urgency.state === "emergency"
                ? "bg-rose-500 text-white animate-pulse"
                : "bg-white/80 text-slate-800 shadow-sm"
            }`}
          >
            <Clock size={13} />
            <span>{urgency.timeString}</span>
          </div>

          {/* Shield Status Button */}
          <button
            type="button"
            onClick={() => setShowShieldModal(true)}
            className="flex items-center gap-1 rounded-full bg-cyan-500/15 px-3 py-1.5 text-xs font-bold text-cyan-700 transition hover:bg-cyan-500/25"
            title="View Streak Shield protection info"
          >
            <Shield size={13} className="text-cyan-500 fill-cyan-500/30" />
            <span>{streakShields} Shield{streakShields === 1 ? "" : "s"}</span>
          </button>
        </div>
      </div>

      {/* Streak Shield Info Modal */}
      {showShieldModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="surface max-w-sm rounded-[32px] p-6 text-center shadow-2xl border border-cyan-500/30">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-500">
              <Shield size={36} className="fill-cyan-500/30" />
            </div>

            <h3 className="display-font mt-4 text-xl font-bold">Streak Freeze Shields</h3>
            <p className="mt-2 text-xs leading-5" style={{ color: "var(--ink-soft)" }}>
              Streak Freeze Shields are your defense against missed days! If you ever miss your habits for a day, a shield automatically absorbs the penalty and <strong>freezes your streak in place</strong> instead of resetting it to zero.
            </p>

            <div className="mt-4 rounded-2xl bg-cyan-500/10 p-3 text-left text-xs text-cyan-900">
              <p className="font-bold">🛡️ Current Inventory: {streakShields} Active Shield{streakShields === 1 ? "" : "s"}</p>
              <p className="mt-1 text-[11px] opacity-80">
                Earn more shields by leveling up or maintaining perfect weekly consistency!
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowShieldModal(false)}
              className="duo-btn duo-btn-emerald mt-5 w-full rounded-2xl py-3 text-sm font-bold uppercase tracking-wider"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      )}
    </>
  )
})
