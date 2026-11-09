import React, { useEffect, useState } from "react"
import { BatteryCharging, ChevronRight, Sparkles, Zap } from "lucide-react"
import { playStartupSound } from "../lib/audio"
import { triggerHaptic } from "../lib/mobile"

/**
 * Cinematic App Startup Splash Screen
 * Features multi-phase energetic animations matching the new violet & crimson battery logo.
 */
export const StartupSplash = ({
  onComplete,
  soundEnabled = true,
  canSkip = true
}) => {
  const [phase, setPhase] = useState(0) // 0: ignite, 1: charging 25%, 2: 50%, 3: 75%, 4: 100% full, 5: exiting
  const [progress, setProgress] = useState(0)
  const [isExiting, setIsExiting] = useState(false)

  // Start sound & initial haptic on mount
  useEffect(() => {
    triggerHaptic("medium")
    playStartupSound(soundEnabled)

    const timer1 = setTimeout(() => {
      setPhase(1)
      setProgress(28)
      triggerHaptic("light")
    }, 450)

    const timer2 = setTimeout(() => {
      setPhase(2)
      setProgress(64)
      triggerHaptic("light")
    }, 950)

    const timer3 = setTimeout(() => {
      setPhase(3)
      setProgress(88)
      triggerHaptic("light")
    }, 1450)

    const timer4 = setTimeout(() => {
      setPhase(4)
      setProgress(100)
      triggerHaptic("success")
    }, 1900)

    const timer5 = setTimeout(() => {
      setIsExiting(true)
    }, 2350)

    const timer6 = setTimeout(() => {
      onComplete?.()
    }, 2950)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
      clearTimeout(timer5)
      clearTimeout(timer6)
    }
  }, [soundEnabled, onComplete])

  // Skip immediately on click or keypress
  const handleSkip = () => {
    if (!canSkip || isExiting) return
    triggerHaptic("light")
    setIsExiting(true)
    setTimeout(() => {
      onComplete?.()
    }, 500)
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        handleSkip()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [canSkip, isExiting])

  const statusMessages = [
    "INITIALIZING CORE MATRIX...",
    "CHARGING STREAK CAPACITORS...",
    "CALIBRATING DAILY RITUALS...",
    "AMPLIFYING MOTIVATION...",
    "MAXIMUM VOLTAGE • ALL SYSTEMS GO!"
  ]

  return (
    <div
      onClick={handleSkip}
      role="dialog"
      aria-label="App Starting Animation"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-between overflow-hidden bg-[#050711] select-none text-white transition-all cursor-pointer ${
        isExiting ? "animate-startup-exit pointer-events-none" : ""
      }`}
      style={{
        paddingTop: "max(1.5rem, env(safe-area-inset-top, 1.5rem))",
        paddingBottom: "max(2rem, env(safe-area-inset-bottom, 2rem))"
      }}
    >
      {/* Dynamic Cosmic Background Glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Purple Nebula Top Left */}
        <div
          className="absolute -top-32 -left-32 h-[480px] w-[480px] rounded-full bg-violet-600/25 blur-[120px] transition-transform duration-1000"
          style={{ transform: `scale(${1 + phase * 0.12})` }}
        />
        {/* Crimson Nebula Bottom Right */}
        <div
          className="absolute -bottom-32 -right-32 h-[520px] w-[520px] rounded-full bg-red-600/20 blur-[130px] transition-transform duration-1000"
          style={{ transform: `scale(${1 + phase * 0.1})` }}
        />
        {/* Central Core Pulse */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[340px] w-[340px] rounded-full bg-purple-500/20 blur-[90px] animate-startup-aura"
        />
        {/* Radial Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,7,17,0.85)_80%,#050711_100%)]" />
      </div>

      {/* Top Header Bar */}
      <div className="relative z-10 w-full max-w-md px-6 flex items-center justify-between text-xs tracking-widest text-slate-400 font-semibold uppercase">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
          </span>
          <span>HABIT TRACKER PRO</span>
        </div>

        {canSkip && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleSkip()
            }}
            className="flex items-center gap-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-1 text-[11px] font-bold text-slate-300 transition backdrop-blur-md active:scale-95"
          >
            <span>SKIP</span>
            <ChevronRight size={13} />
          </button>
        )}
      </div>

      {/* Center Cinematic Logo & Energy Orb */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto px-4">
        {/* Expanding Shockwave Rings */}
        <div className="relative flex items-center justify-center">
          {/* Shockwave ring 1 */}
          <div className="absolute h-48 w-48 sm:h-60 sm:w-60 rounded-full border border-violet-500/40 animate-startup-shockwave pointer-events-none" />
          
          {/* Shockwave ring 2 (Crimson delayed) */}
          <div
            className="absolute h-48 w-48 sm:h-60 sm:w-60 rounded-full border border-red-500/35 animate-startup-shockwave pointer-events-none"
            style={{ animationDelay: "0.6s" }}
          />

          {/* Energy Ring Glow */}
          <div className="absolute -inset-4 sm:-inset-6 rounded-[40px] bg-gradient-to-tr from-violet-600/40 via-purple-500/20 to-red-600/40 blur-xl opacity-90 animate-pulse pointer-events-none" />

          {/* High-Tech Logo Container */}
          <div className="relative animate-startup-logo flex items-center justify-center">
            <div className="relative p-1 rounded-[32px] bg-gradient-to-br from-violet-500 via-red-500 to-purple-600 shadow-[0_0_50px_rgba(139,92,246,0.45),0_0_80px_rgba(239,68,68,0.3)]">
              <div className="overflow-hidden rounded-[30px] bg-black">
                <img
                  src="/logo.png"
                  alt="Habit Tracker Pro"
                  className="h-32 w-32 sm:h-44 sm:w-44 object-cover transform transition-transform duration-700 hover:scale-105"
                />
              </div>
            </div>

            {/* Glowing Lightning Spark Overlay */}
            <div className="pointer-events-none absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-red-600/90 text-white shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-bounce">
              <Zap size={16} className="fill-current text-yellow-300" />
            </div>
          </div>
        </div>

        {/* Brand Name Typography */}
        <div className="mt-8 sm:mt-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
            <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
              HABIT TRACKER
            </span>{" "}
            <span className="text-red-500 font-black">PRO</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm font-semibold tracking-[0.28em] text-slate-300 uppercase">
            Power Your Daily Momentum
          </p>
        </div>

        {/* High-Voltage Battery Charge Indicator */}
        <div className="mt-7 w-64 sm:w-72">
          {/* 4 Battery Cell Segments */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/[0.07] border border-white/10 backdrop-blur-md shadow-inner">
            {[1, 2, 3, 4].map((cell) => {
              const isFilled = phase >= cell
              return (
                <div
                  key={cell}
                  className="relative flex-1 h-3 rounded-lg overflow-hidden transition-all duration-300"
                  style={{
                    backgroundColor: isFilled ? "transparent" : "rgba(255, 255, 255, 0.08)"
                  }}
                >
                  {isFilled && (
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-violet-500 via-pink-500 to-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)] animate-pulse"
                    />
                  )}
                </div>
              )
            })}
            {/* Battery Terminal Tip */}
            <div className="w-1.5 h-2 rounded-r-sm bg-white/20 shrink-0" />
          </div>

          {/* Progress Bar & Percentage */}
          <div className="mt-3 flex items-center justify-between text-[11px] font-bold tracking-wider text-slate-400">
            <div className="flex items-center gap-1.5 text-violet-400">
              <BatteryCharging size={13} className="animate-pulse" />
              <span>{statusMessages[Math.min(phase, 4)]}</span>
            </div>
            <span className="font-mono text-slate-200">{progress}%</span>
          </div>
        </div>
      </div>

      {/* Footer Info / Tap hint */}
      <div className="relative z-10 text-center px-4">
        <p className="text-[11px] font-medium tracking-wide text-slate-500">
          Tap anywhere to continue
        </p>
      </div>
    </div>
  )
}
