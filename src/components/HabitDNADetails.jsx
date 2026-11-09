import React, { useMemo } from "react"
import { X, TrendingUp, Flame, Target, Calendar, Zap, BarChart3 } from "lucide-react"
import { useHabitStore } from "../context/HabitProvider"
import { getAllHabitDetails, getHabitDetailStats } from "../lib/habitDNA"

/* ── colour helpers ──────────────────────────────────────────────────────── */

const rateColor = (v) => {
    if (v >= 70) return "#10b981"
    if (v >= 40) return "#f59e0b"
    return "#ef4444"
}

const barGradient = (v) => {
    if (v >= 70) return "linear-gradient(90deg, #10b981, #34d399)"
    if (v >= 40) return "linear-gradient(90deg, #f59e0b, #fbbf24)"
    return "linear-gradient(90deg, #ef4444, #f87171)"
}

/* ── mini bar chart (last 7 days) ────────────────────────────────────────── */

function WeekBars({ weekData, color }) {
    return (
        <div className="flex items-end gap-1.5 h-16">
            {weekData.map((d, i) => {
                const h = d.due ? (d.completed ? 100 : 20) : 8
                return (
                    <div key={i} className="flex flex-1 flex-col items-center gap-1">
                        <div className="relative w-full flex-1 flex items-end">
                            <div
                                className="w-full rounded-t-md transition-all duration-500"
                                style={{
                                    height: `${h}%`,
                                    background: d.due
                                        ? d.completed
                                            ? barGradient(100)
                                            : "rgba(255,255,255,0.08)"
                                        : "rgba(255,255,255,0.03)",
                                    opacity: d.due ? 1 : 0.3
                                }}
                            />
                        </div>
                        <span className="text-[9px] font-medium text-white/35">{d.label}</span>
                    </div>
                )
            })}
        </div>
    )
}

/* ── monthly trend (4-week sparkline) ────────────────────────────────────── */

function MonthTrend({ monthTrend, color }) {
    const maxRate = Math.max(...monthTrend.map((t) => t.rate), 1)
    return (
        <div className="flex items-end gap-2 h-12">
            {monthTrend.map((t, i) => {
                const h = (t.rate / maxRate) * 100
                return (
                    <div key={i} className="flex flex-1 flex-col items-center gap-1">
                        <div className="relative w-full flex-1 flex items-end">
                            <div
                                className="w-full rounded-t-md transition-all duration-500"
                                style={{
                                    height: `${Math.max(h, 4)}%`,
                                    background: barGradient(t.rate)
                                }}
                            />
                        </div>
                        <span className="text-[9px] font-medium text-white/35">{t.label}</span>
                    </div>
                )
            })}
        </div>
    )
}

/* ── single habit card ───────────────────────────────────────────────────── */

function HabitDetailCard({ detail, index }) {
    const {
        habit, category, completionRate30, completionRate90,
        currentStreak, longestStreak, totalCompletions, avgPerWeek,
        consistency, weekData, monthTrend, insight
    } = detail

    const rc = rateColor(completionRate30)

    return (
        <div
            className="rounded-2xl p-5 transition-all duration-300"
            style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                animationDelay: `${index * 60}ms`,
                animation: "riseIn 0.4s ease both"
            }}
        >
            {/* ── header ── */}
            <div className="mb-4 flex items-start gap-3">
                <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
                    style={{ background: `${habit.color}22`, color: habit.color }}
                >
                    {category.emoji}
                </span>
                <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-bold text-white">{habit.name}</h3>
                    <p className="text-xs text-white/40">{category.label}</p>
                </div>
                <span
                    className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold"
                    style={{ background: `${rc}22`, color: rc }}
                >
                    {completionRate30}%
                </span>
            </div>

            {/* ── insight banner ── */}
            <div
                className="mb-4 flex items-center gap-2 rounded-xl px-3 py-2"
                style={{ background: "rgba(255,255,255,0.04)" }}
            >
                <span className="text-base">{insight.emoji}</span>
                <p className="text-xs text-white/60">{insight.text}</p>
            </div>

            {/* ── stat row ── */}
            <div className="mb-4 grid grid-cols-4 gap-2">
                {[
                    { icon: Target, label: "30d Rate", value: `${completionRate30}%` },
                    { icon: Flame, label: "Streak", value: `${currentStreak}d` },
                    { icon: TrendingUp, label: "Longest", value: `${longestStreak}d` },
                    { icon: Calendar, label: "Total", value: totalCompletions }
                ].map((s) => {
                    const Icon = s.icon
                    return (
                        <div key={s.label} className="rounded-xl p-2.5 text-center" style={{ background: "rgba(255,255,255,0.04)" }}>
                            <Icon size={12} className="mx-auto mb-1 text-white/30" />
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">{s.label}</p>
                            <p className="display-font text-sm font-bold text-white">{s.value}</p>
                        </div>
                    )
                })}
            </div>

            {/* ── secondary stats ── */}
            <div className="mb-4 grid grid-cols-2 gap-2">
                <div className="rounded-xl p-2.5" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <div className="flex items-center gap-1.5">
                        <Zap size={11} className="text-white/30" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-white/30">Avg / week</span>
                    </div>
                    <p className="display-font mt-1 text-base font-bold text-white">{avgPerWeek}</p>
                </div>
                <div className="rounded-xl p-2.5" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <div className="flex items-center gap-1.5">
                        <BarChart3 size={11} className="text-white/30" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-white/30">Consistency</span>
                    </div>
                    <p className="display-font mt-1 text-base font-bold text-white">{consistency}%</p>
                </div>
            </div>

            {/* ── 90-day comparison ── */}
            <div className="mb-4">
                <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-white/40">30-day rate</span>
                    <span className="font-bold" style={{ color: rc }}>{completionRate30}%</span>
                </div>
                <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/8">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${completionRate30}%`, background: barGradient(completionRate30) }} />
                </div>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-white/40">90-day rate</span>
                    <span className="font-bold" style={{ color: rateColor(completionRate90) }}>{completionRate90}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${completionRate90}%`, background: barGradient(completionRate90) }} />
                </div>
            </div>

            {/* ── weekly bars ── */}
            <div className="mb-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/30">Last 7 days</p>
                <WeekBars weekData={weekData} color={habit.color} />
            </div>

            {/* ── monthly trend ── */}
            <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/30">4-week trend</p>
                <MonthTrend monthTrend={monthTrend} color={habit.color} />
            </div>
        </div>
    )
}

/* ── empty state ─────────────────────────────────────────────────────────── */

function EmptyDetails() {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-5xl mb-4">🌱</span>
            <h3 className="display-font text-lg font-bold text-white">No habits yet</h3>
            <p className="mt-2 text-sm text-white/40 max-w-xs">
                Create your first habit to see detailed analytics and insights here.
            </p>
        </div>
    )
}

/* ── main modal component ────────────────────────────────────────────────── */

export function HabitDNADetails({ open, onClose }) {
    const { habits, completions, categories } = useHabitStore()

    const details = useMemo(
        () => getAllHabitDetails(habits, completions, categories),
        [habits, completions, categories]
    )

    // Aggregate stats for the header
    const avgRate = useMemo(() => {
        if (!details.length) return 0
        return Math.round(details.reduce((s, d) => s + d.completionRate30, 0) / details.length)
    }, [details])

    if (!open) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-8"
            onClick={onClose}
        >
            {/* backdrop */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

            {/* panel */}
            <div
                className="relative z-10 w-full max-w-2xl rounded-3xl p-6 sm:p-8"
                style={{
                    background: "rgba(13, 18, 35, 0.97)",
                    border: "1px solid rgba(0, 217, 255, 0.12)",
                    boxShadow: "0 24px 80px rgba(0,0,0,0.55), 0 0 60px rgba(0,217,255,0.06)",
                    animation: "sheetIn 0.35s ease both"
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── close button ── */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-5 top-5 rounded-full p-2 text-white/40 transition-colors hover:bg-white/8 hover:text-white"
                >
                    <X size={18} />
                </button>

                {/* ── title ── */}
                <div className="mb-6">
                    <h2 className="display-font text-xl font-bold text-white">🧬 Habit DNA Details</h2>
                    <p className="mt-1 text-sm text-white/40">
                        Per-habit analytics — completion rate, streaks, and insights
                    </p>
                </div>

                {/* ── aggregate summary ── */}
                {details.length > 0 && (
                    <div
                        className="mb-6 grid grid-cols-3 gap-3 rounded-2xl p-4"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                        {[
                            { label: "Habits tracked", value: details.length },
                            { label: "Avg 30d rate", value: `${avgRate}%` },
                            { label: "Total completions", value: details.reduce((s, d) => s + d.totalCompletions, 0) }
                        ].map((s) => (
                            <div key={s.label} className="text-center">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">{s.label}</p>
                                <p className="display-font mt-1 text-lg font-bold text-white">{s.value}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── habit list ── */}
                {details.length > 0 ? (
                    <div className="space-y-4">
                        {details.map((d, i) => (
                            <HabitDetailCard key={d.habit.id} detail={d} index={i} />
                        ))}
                    </div>
                ) : (
                    <EmptyDetails />
                )}
            </div>
        </div>
    )
}
