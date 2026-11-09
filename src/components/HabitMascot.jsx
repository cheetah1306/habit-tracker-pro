import React, { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"
import { playMascotTapSound } from "../lib/audio"

export const HabitMascot = React.memo(({
  mood = "ready", // ready | hyped | urgent | panicking | godmode
  quote = "Ready to conquer today? Let's get moving!",
  streak = 0,
  soundEnabled = true
}) => {
  const [displayedQuote, setDisplayedQuote] = useState(quote)
  const [isBouncing, setIsBouncing] = useState(false)
  const [tapIndex, setTapIndex] = useState(0)

  const easterEggQuotes = [
    "Hey! That tickles! Now go check off a habit! 🚀",
    "Your streak is my life fuel! Keep it burning! 🔥",
    "Distracted? Not on my watch! 5 minutes is all you need. ⚡",
    "Legends don't make excuses. They build habits! 👑",
    "Feed me completed habits! Nom nom nom! 😋",
    "I believe in you! Today is going to be flawless! ⭐",
    "One habit at a time, you're becoming unstoppable! 🦾",
    "High five! Let's make today a 100% completion day! 🎯",
    "Champions do daily what others do occasionally! 🏆"
  ]

  useEffect(() => {
    setDisplayedQuote(quote)
  }, [quote])

  const handleTap = () => {
    setIsBouncing(true)
    playMascotTapSound(soundEnabled)
    const quoteToShow = easterEggQuotes[tapIndex % easterEggQuotes.length]
    setTapIndex((prev) => (prev + 1) % easterEggQuotes.length)
    setDisplayedQuote(quoteToShow)
    setTimeout(() => setIsBouncing(false), 500)
  }

  // Colors & styling based on mood
  const getMoodStyles = () => {
    switch (mood) {
      case "godmode":
        return {
          bodyColor: "#FFB800",
          bellyColor: "#FFF3B0",
          featherAura: "drop-shadow(0 0 16px rgba(255, 184, 0, 0.8))",
          animation: "mascotBounce 1.5s infinite ease-in-out",
          crown: true,
          shades: true
        }
      case "hyped":
        return {
          bodyColor: "#F97316",
          bellyColor: "#FDE68A",
          featherAura: "drop-shadow(0 0 12px rgba(249, 115, 22, 0.6))",
          animation: "mascotBounce 1.2s infinite ease-in-out",
          crown: false,
          shades: false
        }
      case "panicking":
        return {
          bodyColor: "#EF4444",
          bellyColor: "#FECACA",
          featherAura: "drop-shadow(0 0 14px rgba(239, 68, 68, 0.6))",
          animation: "mascotPanic 0.4s infinite ease-in-out",
          crown: false,
          sweat: true
        }
      case "urgent":
        return {
          bodyColor: "#F59E0B",
          bellyColor: "#FEF3C7",
          featherAura: "drop-shadow(0 0 10px rgba(245, 158, 11, 0.5))",
          animation: "mascotWobble 2s infinite ease-in-out",
          crown: false,
          sweat: true
        }
      default:
        return {
          bodyColor: "#10B981",
          bellyColor: "#D1FAE5",
          featherAura: "drop-shadow(0 0 8px rgba(16, 185, 129, 0.4))",
          animation: "mascotBounce 2.5s infinite ease-in-out",
          crown: false
        }
    }
  }

  const moodStyle = getMoodStyles()

  return (
    <div
      className="surface relative overflow-hidden rounded-[28px] p-5 transition-all hover:shadow-glow"
      style={{
        border: mood === "godmode" ? "2px solid #F59E0B" : mood === "panicking" ? "2px solid #EF4444" : undefined
      }}
    >
      <div className="flex flex-col sm:flex-row items-center gap-5">
        {/* Interactive Mascot Character & Clean Below Tag */}
        <div className="flex flex-col items-center shrink-0 select-none">
          <button
            type="button"
            onClick={handleTap}
            className="group relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full transition-transform active:scale-95 focus:outline-none"
            title="Tap Habi for motivation!"
            aria-label="Tap Habi mascot"
          >
            {/* Animated Mascot SVG */}
            <svg
              viewBox="0 0 100 100"
              className="h-full w-full transition-transform duration-200 group-hover:scale-110"
              style={{
                filter: moodStyle.featherAura,
                animation: isBouncing ? "mascotBounce 0.4s ease" : moodStyle.animation
              }}
            >
              {/* Body */}
              <circle cx="50" cy="55" r="34" fill={moodStyle.bodyColor} />
              <circle cx="50" cy="62" r="22" fill={moodStyle.bellyColor} opacity="0.9" />

              {/* Wings */}
              <ellipse cx="20" cy="58" rx="8" ry="16" fill={moodStyle.bodyColor} transform="rotate(-15 20 58)" />
              <ellipse cx="80" cy="58" rx="8" ry="16" fill={moodStyle.bodyColor} transform="rotate(15 80 58)" />

              {/* Ears / Feather tufts */}
              <path d="M 28 30 Q 34 14 42 26 Z" fill={moodStyle.bodyColor} />
              <path d="M 72 30 Q 66 14 58 26 Z" fill={moodStyle.bodyColor} />

              {/* Eyes */}
              {mood === "panicking" ? (
                <>
                  <circle cx="38" cy="46" r="9" fill="white" />
                  <circle cx="62" cy="46" r="9" fill="white" />
                  <circle cx="38" cy="46" r="4" fill="#1E293B" />
                  <circle cx="62" cy="46" r="4" fill="#1E293B" />
                </>
              ) : (
                <>
                  <circle cx="38" cy="46" r="8" fill="#1E293B" />
                  <circle cx="62" cy="46" r="8" fill="#1E293B" />
                  <circle cx="36" cy="44" r="2.8" fill="white" />
                  <circle cx="60" cy="44" r="2.8" fill="white" />
                </>
              )}

              {/* Cute Beak */}
              <polygon points="50,49 43,58 57,58" fill="#EA580C" />

              {/* Cheeks */}
              <circle cx="28" cy="54" r="4" fill="#F43F5E" opacity="0.4" />
              <circle cx="72" cy="54" r="4" fill="#F43F5E" opacity="0.4" />

              {/* Sweat drops if panicking/urgent */}
              {moodStyle.sweat && (
                <>
                  <path d="M 76 34 Q 78 28 80 34 Q 82 39 78 39 Q 74 39 76 34 Z" fill="#38BDF8" />
                  <path d="M 22 36 Q 24 30 26 36 Q 28 41 24 41 Q 20 41 22 36 Z" fill="#38BDF8" />
                </>
              )}

              {/* Godmode Crown & Shades */}
              {moodStyle.crown && (
                <polygon
                  points="34,22 40,10 50,18 60,10 66,22"
                  fill="#FFD700"
                  stroke="#B45309"
                  strokeWidth="1.5"
                />
              )}
              {moodStyle.shades && (
                <path
                  d="M 28 44 Q 38 43 48 45 Q 52 45 52 45 Q 62 43 72 44 L 70 51 Q 60 52 50 49 Q 40 52 30 51 Z"
                  fill="#0F172A"
                />
              )}
            </svg>
          </button>

          {/* Clean Prompt Button Below Habi */}
          <button
            type="button"
            onClick={handleTap}
            className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-slate-900/85 px-3 py-1 text-xs font-bold text-white shadow-md backdrop-blur-md transition-all hover:bg-slate-900 hover:scale-105 active:scale-95"
          >
            <span className="text-amber-400 text-xs">✨</span>
            <span>Tap Habi!</span>
          </button>
        </div>

        {/* Speech Bubble */}
        <div className="flex-1 w-full">
          <div className="relative rounded-2xl border border-white/40 bg-white/70 p-4 shadow-sm backdrop-blur-xl">
            {/* Subtle pointer towards mascot on larger screens */}
            <div className="hidden sm:block absolute -left-2 top-6 h-4 w-4 rotate-45 border-b border-l border-white/40 bg-white/70 backdrop-blur-xl" />

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-[var(--teal)]">
                  Habi the Companion
                </span>
                {streak > 0 && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-700">
                    🔥 {streak}d flame
                  </span>
                )}
              </div>
              <span className="text-[10px] font-semibold text-slate-400">
                Tap Habi for advice
              </span>
            </div>

            <p className="mt-2 text-sm sm:text-base font-semibold leading-relaxed transition-all" style={{ color: "var(--ink)" }}>
              &ldquo;{displayedQuote}&rdquo;
            </p>
          </div>
        </div>
      </div>
    </div>
  )
})
