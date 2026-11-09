import React from "react"
import { Award, Bell, Flame, Gift, Shield, Sparkles, Zap } from "lucide-react"

export const GamificationBanner = ({
  levelInfo,
  streakMultiplier,
  streakShields = 1,
  isChestAvailable = false,
  onOpenChestModal,
  notificationGranted = true,
  onRequestNotification
}) => {
  return (
    <div className="surface rounded-[32px] p-5 sm:p-7 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Player Profile & Level Progress */}
        <div className="flex items-center gap-4">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl shadow-inner sm:h-18 sm:w-18"
            style={{
              background: "linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(16, 185, 129, 0.2))",
              border: "1px solid rgba(245, 158, 11, 0.3)"
            }}
          >
            <span className="text-3xl sm:text-4xl">{levelInfo.emoji}</span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-amber-500/15 px-3 py-0.5 text-xs font-extrabold uppercase tracking-wider text-amber-600">
                Level {levelInfo.level}
              </span>
              <span className="text-sm font-bold sm:text-base">{levelInfo.title}</span>
            </div>

            {/* Level XP Bar */}
            <div className="mt-2.5 flex items-center gap-3">
              <div className="h-2.5 w-44 max-w-[200px] overflow-hidden rounded-full bg-slate-200/70 sm:w-56">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${levelInfo.percentage}%`,
                    background: "linear-gradient(90deg, #10b981, #f59e0b)"
                  }}
                />
              </div>
              <span className="text-xs font-bold" style={{ color: "var(--ink-soft)" }}>
                {levelInfo.currentLevelXp}/{levelInfo.nextLevelXp} XP ({levelInfo.percentage}%)
              </span>
            </div>
          </div>
        </div>

        {/* Right: Gamification Badges & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Streak multiplier */}
          <div
            className="inline-flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs font-bold text-amber-900"
            style={{
              background: "rgba(245, 158, 11, 0.12)",
              border: "1px solid rgba(245, 158, 11, 0.25)"
            }}
            title="Earn more XP with higher streaks!"
          >
            <Flame size={15} className="text-amber-500" />
            <span>{streakMultiplier.label}</span>
          </div>

          {/* Streak shield */}
          <div
            className="inline-flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs font-bold text-emerald-900"
            style={{
              background: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.25)"
            }}
            title="Protects your streak from breaking on missed days"
          >
            <Shield size={15} className="text-emerald-500" />
            <span>{streakShields} Shield{streakShields === 1 ? "" : "s"}</span>
          </div>

          {/* Daily Mystery Chest Button */}
          <button
            type="button"
            onClick={onOpenChestModal}
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition duration-300 hover:scale-105 active:scale-95 ${
              isChestAvailable
                ? "text-white shadow-lg"
                : "bg-slate-100 text-slate-500"
            }`}
            style={
              isChestAvailable
                ? {
                    background: "linear-gradient(135deg, #f59e0b, #d97706)",
                    boxShadow: "0 8px 20px rgba(245, 158, 11, 0.35)",
                    animation: "glowPulse 2s infinite"
                  }
                : undefined
            }
          >
            <span
              style={{
                display: "inline-block",
                animation: isChestAvailable ? "chestShake 1.8s infinite ease-in-out" : "none"
              }}
            >
              🎁
            </span>
            <span>{isChestAvailable ? "Daily Chest Ready!" : "Chest Claimed"}</span>
          </button>

          {/* Phone Notification Prompt (if not yet granted) */}
          {!notificationGranted && (
            <button
              type="button"
              onClick={onRequestNotification}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-sky-400/30 bg-sky-500/10 px-3 py-2 text-xs font-bold text-sky-700 transition hover:bg-sky-500/20"
              title="Enable habit alerts & streak warnings on your phone"
            >
              <Bell size={14} />
              <span>Enable Alerts</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
