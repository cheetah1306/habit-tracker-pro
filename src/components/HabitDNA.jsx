import React, { useMemo, useState, useEffect } from "react"
import { Share2, Info } from "lucide-react"
import { useHabitStore } from "../context/HabitProvider"
import {
    getBestTimeWindow,
    getConsistencyScore,
    getDisciplineLevel,
    getPersonalityType,
    getStreakBehavior,
    getTopCategories
} from "../lib/habitDNA"
import { HabitDNADetails } from "./HabitDNADetails"

/* ── helpers ─────────────────────────────────────────────────────────────── */

const barColor = (value) => {
    if (value < 30) return "#ef4444"
    if (value < 70) return "#f59e0b"
    return "#10b981"
}

const disciplineBarColor = (value) => {
    if (value < 30) return "#ef4444"
    if (value < 60) return "#f97316"
    return "#10b981"
}

/* ── animated progress bar ───────────────────────────────────────────────── */

function AnimatedBar({ value, max = 100, color, delay = 0, height = "h-2" }) {
    const [width, setWidth] = useState(0)

    useEffect(() => {
        const timer = setTimeout(() => setWidth(Math.min((value / max) * 100, 100)), delay)
        return () => clearTimeout(timer)
    }, [value, max, delay])

    return (
        <div className={`w-full ${height} overflow-hidden rounded-full`} style={{ background: "rgba(255,255,255,0.08)" }}>
            <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${width}%`, backgroundColor: color }}
            />
        </div>
    )
}

/* ── stat card ───────────────────────────────────────────────────────────── */

function StatCard({ icon, label, value, barValue, barColor: bc, delay = 0 }) {
    return (
        <div
            className="rounded-2xl p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
            style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                animationDelay: `${delay}ms`,
                animation: "riseIn 0.4s ease both"
            }}
        >
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {label}
                </span>
                <div className="rounded-xl bg-white/8 p-1.5" style={{ color: "#00D9FF" }}>
                    {icon}
                </div>
            </div>
            <p className="display-font mt-2 text-2xl font-bold text-white">{value}</p>
            <div className="mt-2">
                <AnimatedBar value={barValue} color={bc} delay={delay + 100} />
            </div>
        </div>
    )
}

/* ── main component ───────────────────────────────────────────────────────── */

export function HabitDNA() {
    const { habits, completions, categories } = useHabitStore()

    const personality = useMemo(
        () => getPersonalityType(habits, completions, categories),
        [habits, completions, categories]
    )
    const consistency = useMemo(() => getConsistencyScore(habits, completions), [habits, completions])
    const discipline = useMemo(() => getDisciplineLevel(habits, completions), [habits, completions])
    const bestTime = useMemo(() => getBestTimeWindow(habits, completions), [habits, completions])
    const topCategories = useMemo(
        () => getTopCategories(habits, completions, categories),
        [habits, completions, categories]
    )
    const streakInfo = useMemo(() => getStreakBehavior(habits, completions), [habits, completions])

    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])

    const handleShare = async () => {
        const text =
            `🧬 My Habit DNA\n\n` +
            `🎯 Personality: ${personality.emoji} ${personality.name}\n` +
            `   "${personality.description}"\n\n` +
            `📊 Consistency: ${consistency}%\n` +
            `💪 Discipline: ${discipline}%\n` +
            `⏰ Best Time: ${bestTime}\n` +
            `📁 Categories: ${topCategories.length}\n\n` +
            `🔥 Streak Behavior: ${streakInfo.pattern}\n` +
            `   Avg streak: ${streakInfo.avgStreak} days\n` +
            `   Longest: ${streakInfo.longestStreak} days\n` +
            `   Sustainability: ${streakInfo.sustainability}%`

        if (navigator.share) {
            try { await navigator.share({ text }) } catch { /* user cancelled */ }
        } else {
            await navigator.clipboard.writeText(text)
            alert("Habit DNA profile copied to clipboard!")
        }
    }

    const [showDetails, setShowDetails] = useState(false)

    const handleViewDetails = () => {
        setShowDetails(true)
    }

    return (
        <section
            className="glass p-6 rounded-2xl backdrop-blur-xl hover-glow smooth-transition mb-8"
            style={{
                background: "rgba(13, 18, 35, 0.92)",
                border: "1px solid rgba(0, 217, 255, 0.12)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.35), 0 0 60px rgba(0, 217, 255, 0.04)"
            }}
        >
            {/* ── Header ── */}
            <div className="mb-6 flex items-center justify-between">
                <h2 className="display-font text-xl font-bold text-white">🧬 Your Habit DNA</h2>
            </div>

            {/* ── Personality card ── */}
            <div
                className="mb-6 rounded-2xl p-5 transition-all duration-500"
                style={{
                    background: personality.gradient,
                    boxShadow: `0 4px 24px ${personality.gradient.includes("00D9FF") ? "rgba(0,217,255,0.25)" : "rgba(0,0,0,0.2)"}`
                }}
            >
                <div className="flex items-start gap-4">
                    <span className="text-5xl leading-none drop-shadow-lg">{personality.emoji}</span>
                    <div>
                        <h3 className="display-font text-lg font-bold text-white drop-shadow">
                            {personality.name}
                        </h3>
                        <p className="mt-1 text-sm text-white/85 leading-relaxed">{personality.description}</p>
                    </div>
                </div>
            </div>

            {/* ── Stats grid ── */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard
                    icon={<span>📅</span>}
                    label="Consistency"
                    value={`${consistency}%`}
                    barValue={consistency}
                    bc={barColor(consistency)}
                    delay={50}
                />
                <StatCard
                    icon={<span>💪</span>}
                    label="Discipline"
                    value={`${discipline}%`}
                    barValue={discipline}
                    bc={disciplineBarColor(discipline)}
                    delay={100}
                />
                <StatCard
                    icon={<span>⏰</span>}
                    label="Best Time"
                    value={bestTime}
                    barValue={100}
                    bc="#00D9FF"
                    delay={150}
                />
                <StatCard
                    icon={<span>📁</span>}
                    label="Categories"
                    value={topCategories.length}
                    barValue={topCategories.length * 25}
                    bc="#FFD700"
                    delay={200}
                />
            </div>

            {/* ── Streak behavior ── */}
            <div
                className="mb-6 rounded-2xl p-5 transition-all duration-300"
                style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.07)"
                }}
            >
                <div className="mb-3 flex items-center gap-2">
                    <span className="text-lg">🔥</span>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white/70">Streak Behavior</h3>
                </div>

                <div className="mb-4 flex items-center gap-3">
                    <span className="display-font text-2xl font-bold text-white">{streakInfo.pattern}</span>
                    <span
                        className="ml-auto rounded-full px-3 py-1 text-xs font-bold"
                        style={{
                            background: streakInfo.sustainability > 70
                                ? "rgba(16,185,129,0.2)"
                                : streakInfo.sustainability < 20
                                    ? "rgba(239,68,68,0.2)"
                                    : "rgba(245,158,11,0.2)",
                            color: streakInfo.sustainability > 70
                                ? "#39FF14"
                                : streakInfo.sustainability < 20
                                    ? "#ef4444"
                                    : "#f59e0b"
                        }}
                    >
                        {streakInfo.sustainability}% sustainable
                    </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: "Avg Streak", value: `${streakInfo.avgStreak}d` },
                        { label: "Longest", value: `${streakInfo.longestStreak}d` },
                        { label: "Habits", value: `${habits.filter((h) => !h.archivedAt).length}` }
                    ].map((item) => (
                        <div
                            key={item.label}
                            className="rounded-xl p-3 text-center"
                            style={{ background: "rgba(255,255,255,0.04)" }}
                        >
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">{item.label}</p>
                            <p className="display-font mt-1 text-lg font-bold text-white">{item.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Top 3 categories ── */}
            {topCategories.length > 0 && (
                <div className="mb-6">
                    <div className="mb-3 flex items-center gap-2">
                        <span className="text-lg">📊</span>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-white/70">Top Categories</h3>
                    </div>
                    <div className="space-y-3">
                        {topCategories.map((cat, i) => (
                            <div key={cat.id} style={{ animationDelay: `${250 + i * 60}ms`, animation: "riseIn 0.4s ease both" }}>
                                <div className="mb-1 flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-semibold text-white/90">
                                            {cat.emoji} {cat.label}
                                        </span>
                                        {cat.totalDue > 0 && (
                                            <span className="text-[11px] font-normal text-white/40">
                                                ({cat.totalCompleted}/{cat.totalDue})
                                            </span>
                                        )}
                                    </div>
                                    <span className="font-bold text-white/60">{cat.percentage}%</span>
                                </div>
                                <AnimatedBar value={cat.percentage} color={cat.color} delay={300 + i * 60} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Bottom buttons ── */}
            <div className="flex flex-wrap gap-3">
                <button
                    type="button"
                    onClick={handleViewDetails}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold text-white/80 transition-all duration-300 hover:bg-white/5 hover:text-white"
                    style={{ borderColor: "rgba(255,255,255,0.15)" }}
                >
                    <Info size={15} />
                    View Details
                </button>
            </div>

            {/* ── Details modal ── */}
            <HabitDNADetails open={showDetails} onClose={() => setShowDetails(false)} />
        </section>
    )
}
