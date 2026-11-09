import React, { useState } from "react"
import { Swords, Trophy, Sparkles, Skull, ShieldAlert } from "lucide-react"
import confetti from "canvas-confetti"
import { playBossDefeatedSound } from "../lib/audio"

export const DailyBossCard = React.memo(({
  bossState,
  onClaimBossReward,
  isRewardClaimed = false,
  soundEnabled = true
}) => {
  if (!bossState) return null

  const {
    bossName,
    bossEmoji,
    bossDesc,
    maxHp,
    currentHp,
    hpPercentage,
    isDefeated,
    strikesLanded,
    strikesNeeded,
    bonusXpReward
  } = bossState

  const [claimed, setClaimed] = useState(isRewardClaimed)

  const handleClaim = () => {
    if (claimed) return
    setClaimed(true)
    playBossDefeatedSound(soundEnabled)

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#EF4444", "#F59E0B", "#10B981", "#8B5CF6"]
    })

    if (onClaimBossReward) {
      onClaimBossReward(bonusXpReward)
    }
  }

  return (
    <article
      className="surface card-enter relative overflow-hidden rounded-[28px] p-5 transition hover:shadow-glow"
      style={{
        border: isDefeated ? "2px solid #10B981" : "1px solid rgba(239, 68, 68, 0.3)"
      }}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
            {isDefeated ? <Trophy size={18} className="text-amber-500" /> : <Swords size={18} />}
          </div>
          <div>
            <h3 className="display-font text-base font-bold">
              {isDefeated ? "Daily Boss Defeated!" : "Daily Boss Encounter"}
            </h3>
            <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
              {isDefeated ? "Procrastination crushed today!" : "Complete habits to deal 100 DMG per strike"}
            </p>
          </div>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            isDefeated
              ? "bg-emerald-100 text-emerald-700"
              : "bg-rose-100 text-rose-700"
          }`}
        >
          {isDefeated ? "VICTORY 🏆" : `HP: ${currentHp}/${maxHp}`}
        </span>
      </div>

      {/* Boss Visual & HP Section */}
      <div className="mt-4 flex items-center gap-4 rounded-2xl bg-white/60 p-3.5 backdrop-blur">
        <div
          className="flex h-14 w-14 shrink-0 select-none items-center justify-center rounded-2xl text-3xl shadow-inner"
          style={{
            backgroundColor: isDefeated ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
            animation: isDefeated ? "none" : "bossBreathe 2s infinite ease-in-out"
          }}
        >
          {bossEmoji}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-rose-500">{bossName}</span>
            <span className="font-semibold" style={{ color: "var(--ink-soft)" }}>
              {strikesLanded} of {strikesNeeded} strikes landed
            </span>
          </div>

          {/* Glowing Boss HP Bar */}
          <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${hpPercentage}%`,
                background: isDefeated
                  ? "#10B981"
                  : "linear-gradient(90deg, #EF4444 0%, #DC2626 100%)",
                boxShadow: isDefeated ? "0 0 10px #10B981" : "0 0 10px rgba(239, 68, 68, 0.6)"
              }}
            />
          </div>

          <p className="mt-1.5 text-[11px] leading-snug" style={{ color: "var(--ink-soft)" }}>
            {bossDesc}
          </p>
        </div>
      </div>

      {/* Claim Reward Banner if Defeated */}
      {isDefeated && (
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-amber-500/10 p-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-500" />
            <span className="text-xs font-bold text-amber-900">
              Boss Slayer Bonus: +{bonusXpReward} XP
            </span>
          </div>

          <button
            type="button"
            disabled={claimed}
            onClick={handleClaim}
            className={`duo-btn rounded-xl px-4 py-1.5 text-xs font-black uppercase tracking-wider ${
              claimed ? "bg-slate-300 text-slate-500 cursor-not-allowed" : "duo-btn-amber"
            }`}
          >
            {claimed ? "Claimed ✓" : "Claim Loot 🎁"}
          </button>
        </div>
      )}
    </article>
  )
})
