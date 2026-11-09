import React from "react"
import { Check, Flame, Gift, Sparkles, Swords } from "lucide-react"

export const DailyQuestsCard = React.memo(({
  quests = [],
  onClaimQuest
}) => {
  if (!quests.length) return null

  const completedCount = quests.filter((q) => q.isCompleted).length
  const totalCount = quests.length

  return (
    <section className="surface card-enter rounded-[32px] p-5 sm:p-7">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600">
            <Swords size={22} />
          </div>
          <div>
            <h2 className="display-font text-xl font-bold sm:text-2xl">Daily Quests</h2>
            <p className="text-xs sm:text-sm" style={{ color: "var(--ink-soft)" }}>
              Complete challenges to earn bonus XP and climb rank levels.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700">
            {completedCount}/{totalCount} Completed
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {quests.map((quest) => {
          const progressRatio = Math.min(1, quest.progress / quest.target)
          const isReadyToClaim = quest.isCompleted && !quest.isClaimed

          return (
            <article
              key={quest.id}
              className={`relative flex flex-col justify-between rounded-[24px] p-4 transition-all duration-300 ${
                isReadyToClaim
                  ? "border-2 border-amber-400 bg-amber-50/70 shadow-md"
                  : quest.isClaimed
                  ? "border border-emerald-500/20 bg-emerald-50/40 opacity-85"
                  : "border border-slate-200/60 bg-slate-50/60"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-2xl">{quest.icon}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                    <Sparkles size={11} /> +{quest.xpReward} XP
                  </span>
                </div>

                <h3 className="mt-2 text-sm font-bold sm:text-base">{quest.title}</h3>
                <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                  {quest.description}
                </p>
              </div>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-xs font-semibold">
                  <span style={{ color: "var(--ink-soft)" }}>Progress</span>
                  <span>
                    {quest.progress}/{quest.target}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/70">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progressRatio * 100}%`,
                      background: isReadyToClaim
                        ? "linear-gradient(90deg, #f59e0b, #10b981)"
                        : quest.isClaimed
                        ? "#10b981"
                        : "var(--teal)"
                    }}
                  />
                </div>

                <div className="mt-3">
                  {isReadyToClaim ? (
                    <button
                      type="button"
                      onClick={() => onClaimQuest(quest.id, quest.xpReward)}
                      className="w-full inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold text-white shadow-md transition hover:scale-[1.02] active:scale-[0.98]"
                      style={{
                        background: "linear-gradient(135deg, #f59e0b, #d97706)",
                        animation: "glowPulse 2s infinite"
                      }}
                    >
                      <Gift size={13} />
                      Claim +{quest.xpReward} XP
                    </button>
                  ) : quest.isClaimed ? (
                    <div className="flex items-center justify-center gap-1 text-xs font-bold text-emerald-600 py-1">
                      <Check size={14} />
                      Reward Claimed
                    </div>
                  ) : (
                    <div className="text-center text-xs font-medium text-slate-400 py-1">
                      In Progress
                    </div>
                  )}
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
})
