import React, { useEffect, useState } from "react"
import confetti from "canvas-confetti"
import { Sparkles, X } from "lucide-react"

export const MysteryChestModal = ({
  open,
  onClose,
  isAvailableToday,
  onOpenChest,
  soundEnabled = false
}) => {
  const [openedReward, setOpenedReward] = useState(null)
  const [isOpening, setIsOpening] = useState(false)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
      setOpenedReward(null)
      setIsOpening(false)
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  if (!open) return null

  const handleUnlock = () => {
    if (isOpening || openedReward || !isAvailableToday) return
    setIsOpening(true)

    setTimeout(() => {
      const reward = onOpenChest()
      setOpenedReward(reward || { xpReward: 35, quote: "Momentum is on your side today!" })
      setIsOpening(false)

      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.5 },
          colors: ["#f59e0b", "#10b981", "#3b82f6", "#ec4899"]
        })
      }
    }, 600)
  }

  const handleFinish = () => {
    setOpenedReward(null)
    onClose()
  }

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
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
        onClick={handleFinish}
        style={{ position: "fixed", inset: 0 }}
      />

      <div
        className="relative z-10 w-full max-w-md overflow-hidden rounded-[32px] p-6 text-center text-slate-900 shadow-2xl transition-all sm:p-8"
        style={{
          background: "linear-gradient(180deg, var(--glass-panel), var(--bg))",
          border: "1px solid var(--glass-border)",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.5)"
        }}
      >
        <button
          type="button"
          onClick={handleFinish}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100"
        >
          <X size={20} />
        </button>

        <p className="text-xs font-bold uppercase tracking-[0.24em]" style={{ color: "var(--teal)" }}>
          Daily Engagement Bonus
        </p>
        <h2 className="display-font mt-2 text-2xl font-bold sm:text-3xl">Mystery Treasure Chest</h2>

        {!openedReward ? (
          <div className="mt-6 flex flex-col items-center">
            {isAvailableToday ? (
              <>
                <button
                  type="button"
                  onClick={handleUnlock}
                  disabled={isOpening}
                  className="group relative my-4 flex h-36 w-36 items-center justify-center rounded-3xl transition-transform hover:scale-105 active:scale-95"
                  style={{
                    background: "radial-gradient(circle, rgba(245, 158, 11, 0.25), transparent 70%)"
                  }}
                >
                  <span
                    className="text-7xl select-none"
                    style={{
                      display: "inline-block",
                      animation: isOpening ? "chestShake 0.6s infinite" : "chestShake 2s infinite ease-in-out"
                    }}
                  >
                    🎁
                  </span>
                  <div className="absolute inset-0 rounded-3xl border-2 border-amber-400/40 animate-pulse pointer-events-none" />
                </button>

                <p className="text-sm font-semibold text-slate-600">
                  {isOpening ? "Unlocking magical fortune..." : "Tap the chest to claim your daily bonus!"}
                </p>

                <button
                  type="button"
                  onClick={handleUnlock}
                  disabled={isOpening}
                  className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-6 py-3 font-bold text-white shadow-lg transition hover:opacity-95"
                  style={{
                    background: "linear-gradient(135deg, #f59e0b, #d97706)",
                    boxShadow: "0 10px 25px rgba(245, 158, 11, 0.4)"
                  }}
                >
                  <Sparkles size={18} />
                  {isOpening ? "Opening..." : "Open Chest Now"}
                </button>
              </>
            ) : (
              <div className="my-6">
                <span className="text-6xl">✨</span>
                <p className="mt-4 text-base font-semibold">Chest already claimed today!</p>
                <p className="mt-1 text-sm text-slate-500">
                  Come back tomorrow to unlock your next daily bonus and keep your streak strong.
                </p>
                <button
                  type="button"
                  onClick={handleFinish}
                  className="mt-6 inline-flex min-h-11 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-bg"
                >
                  Awesome
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center">
            <div
              className="my-3 flex h-28 w-28 items-center justify-center rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(245, 158, 11, 0.3), transparent 70%)",
                animation: "levelUpPulse 2s infinite"
              }}
            >
              <span className="text-6xl">🌟</span>
            </div>

            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-4 py-1.5 text-base font-bold text-amber-900">
              +{openedReward.xpReward} XP Awarded!
            </span>

            <p className="mt-4 text-sm italic leading-relaxed text-slate-600">
              &ldquo;{openedReward.quote}&rdquo;
            </p>

            <button
              type="button"
              onClick={handleFinish}
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-ink px-6 py-3 font-bold text-bg transition hover:opacity-90"
            >
              Claim & Continue
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
