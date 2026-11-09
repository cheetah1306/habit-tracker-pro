import React from "react"
import { Zap, Crown } from "lucide-react"
import { getWeeklyLeagueProgress, LEAGUE_TIERS } from "../lib/godmode"

export const XpLeagueCard = React.memo(({ userWeeklyXp = 0, totalXp = 0 }) => {
  const progress = getWeeklyLeagueProgress(userWeeklyXp, totalXp)
  const { tier, nextTier, xpIntoCurrentTier, xpNeededForNext, progressPercent, daysLeftInWeek, isMaxTier } = progress

  return (
    <article className="surface card-enter relative overflow-hidden rounded-[28px] p-5 transition hover:shadow-glow">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-2xl text-2xl shadow-sm"
            style={{ backgroundColor: `${tier.color}20` }}
          >
            {tier.emoji}
          </div>
          <div>
            <h3 className="display-font text-base font-bold">{tier.name}</h3>
            <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
              {isMaxTier
                ? "Maximum rank achieved 👑"
                : `${daysLeftInWeek} day${daysLeftInWeek === 1 ? "" : "s"} left this week`}
            </p>
          </div>
        </div>

        {/* Total XP badge */}
        <div
          className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider"
          style={{ backgroundColor: `${tier.color}18`, color: tier.color }}
        >
          <Zap size={12} />
          <span>{totalXp} XP</span>
        </div>
      </div>

      {/* Tier progress bar */}
      {!isMaxTier && nextTier && (
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
            <span style={{ color: "var(--ink-soft)" }}>
              Progress to {nextTier.emoji} {nextTier.name}
            </span>
            <span className="font-bold" style={{ color: tier.color }}>
              {progressPercent}%
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200/70">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progressPercent}%`,
                background: `linear-gradient(90deg, ${tier.color}, ${nextTier.color})`
              }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px]" style={{ color: "var(--ink-soft)" }}>
            <span>{xpIntoCurrentTier} XP earned in this tier</span>
            <span>{xpNeededForNext - xpIntoCurrentTier} XP to promote</span>
          </div>
        </div>
      )}

      {/* Max tier banner */}
      {isMaxTier && (
        <div
          className="mt-4 flex items-center gap-2 rounded-2xl p-3"
          style={{ background: `${tier.color}15`, border: `1px solid ${tier.color}40` }}
        >
          <Crown size={16} style={{ color: tier.color }} />
          <span className="text-xs font-bold" style={{ color: tier.color }}>
            You have reached the highest league — Godmode Champions! 🏆
          </span>
        </div>
      )}

      {/* Weekly + All-time XP stats */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white/60 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--ink-soft)" }}>
            This Week's XP
          </p>
          <p className="display-font mt-0.5 text-xl font-black" style={{ color: tier.color }}>
            {userWeeklyXp} XP
          </p>
        </div>
        <div className="rounded-2xl bg-white/60 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--ink-soft)" }}>
            All-Time XP
          </p>
          <p className="display-font mt-0.5 text-xl font-black">
            {totalXp} XP
          </p>
        </div>
      </div>

      {/* Tier ladder — all tiers, current one highlighted */}
      <div className="mt-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--ink-soft)" }}>
          League Tiers
        </p>
        <div className="flex flex-wrap gap-1.5">
          {LEAGUE_TIERS.map((t) => {
            const isCurrentTier = t.id === tier.id
            const isUnlocked = totalXp >= t.minLeagueXp
            return (
              <span
                key={t.id}
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold"
                style={{
                  backgroundColor: isCurrentTier ? `${t.color}25` : isUnlocked ? `${t.color}12` : "transparent",
                  color: isCurrentTier ? t.color : isUnlocked ? t.color : "var(--ink-soft)",
                  border: isCurrentTier
                    ? `2px solid ${t.color}`
                    : `1px solid ${isUnlocked ? t.color + "40" : "var(--line)"}`,
                  opacity: isUnlocked ? 1 : 0.4
                }}
                title={`${t.name} — ${t.minLeagueXp} XP required`}
              >
                {t.emoji}
                {isCurrentTier && <span className="ml-0.5 font-black">You</span>}
              </span>
            )
          })}
        </div>
      </div>
    </article>
  )
})

