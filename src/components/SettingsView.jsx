import React, { useEffect, useState } from "react"
import {
  checkNotificationPermission,
  requestNotificationPermission,
  triggerTestNotification
} from "../lib/notifications"

export const SettingsView = ({
  settings,
  onUpdateSettings,
  archivedHabits,
  onRestoreHabit,
  onDeleteHabit,
  onClearAllData,
  onTestNotificationResult
}) => {
  const [confirmText, setConfirmText] = useState("")
  const [notifGranted, setNotifGranted] = useState(false)
  const [testingNotif, setTestingNotif] = useState(false)

  useEffect(() => {
    checkNotificationPermission().then(setNotifGranted)
  }, [])

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
      <section className="surface col-span-full flex flex-col sm:flex-row items-center gap-5 rounded-[30px] p-6 shadow-sm">
        <div className="relative shrink-0">
          <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-violet-600/40 via-purple-600/20 to-red-600/40 blur-md opacity-70" />
          <img
            src="/logo.png"
            alt="Habit Tracker Pro Logo"
            className="relative h-20 w-20 rounded-3xl object-cover shadow-xl ring-2 ring-violet-500/30 shrink-0"
          />
        </div>
        <div className="text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <h1 className="display-font text-2xl font-extrabold sm:text-3xl">Habit Tracker Pro</h1>
            <span className="rounded-full bg-violet-500/15 px-3 py-0.5 text-xs font-bold text-violet-700">
              v1.0.0 Pro Edition
            </span>
          </div>
          <p className="mt-1.5 text-sm font-medium" style={{ color: "var(--ink-soft)" }}>
            Built for ultimate habit mastery, streak protection, XP leagues, and offline-first reliability.
          </p>
        </div>
      </section>

      <section className="surface rounded-[30px] p-5 sm:p-6">
        <h2 className="display-font text-2xl font-bold">App settings</h2>
        <div className="mt-5 grid gap-4">
          <label className="flex items-center justify-between gap-4 rounded-[24px] bg-slate-50 p-4">
            <div>
              <p className="font-semibold">High contrast</p>
              <p className="text-sm" style={{ color: "var(--ink-soft)" }}>Increase separation for text and controls.</p>
            </div>
            <input
              type="checkbox"
              checked={settings.highContrast}
              onChange={(event) => onUpdateSettings({ highContrast: event.target.checked })}
              className="h-5 w-5"
            />
          </label>

          <label className="flex items-center justify-between gap-4 rounded-[24px] bg-slate-50 p-4">
            <div>
              <p className="font-semibold">Completion sound</p>
              <p className="text-sm" style={{ color: "var(--ink-soft)" }}>Play a subtle ding on successful check-ins.</p>
            </div>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(event) => onUpdateSettings({ soundEnabled: event.target.checked })}
              className="h-5 w-5"
            />
          </label>

          <div className="rounded-[24px] bg-slate-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">Phone Notifications</p>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      notifGranted
                        ? "bg-emerald-500/15 text-emerald-700"
                        : "bg-amber-500/15 text-amber-700"
                    }`}
                  >
                    {notifGranted ? "Active & Scheduled" : "Action Needed"}
                  </span>
                </div>
                <p className="mt-1 text-sm" style={{ color: "var(--ink-soft)" }}>
                  Receive scheduled habit alarms, evening streak savers, and morning quest alerts on your device.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {!notifGranted ? (
                  <button
                    type="button"
                    onClick={async () => {
                      const granted = await requestNotificationPermission()
                      setNotifGranted(granted)
                    }}
                    className="min-h-10 rounded-full bg-ink px-4 py-2 text-xs font-bold text-bg transition hover:opacity-90"
                  >
                    Enable Alerts
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={async () => {
                    setTestingNotif(true)
                    const res = await triggerTestNotification()
                    setTestingNotif(false)
                    if (onTestNotificationResult) {
                      onTestNotificationResult(res)
                    }
                  }}
                  disabled={testingNotif}
                  className="min-h-10 rounded-full border px-4 py-2 text-xs font-bold transition hover:bg-slate-100"
                  style={{ borderColor: "var(--line-strong)" }}
                >
                  {testingNotif ? "Sending..." : "📲 Test Phone Notification"}
                </button>
              </div>
            </div>
          </div>

          <label className="rounded-[24px] bg-slate-50 p-4">
            <span className="font-semibold">Default reminder time</span>
            <input
              type="time"
              value={settings.defaultReminderTime || ""}
              onChange={(event) => onUpdateSettings({ defaultReminderTime: event.target.value })}
              className="mt-3 min-h-11 w-full rounded-2xl border bg-white px-4 py-3 text-slate-900"
              style={{ borderColor: "var(--line-strong)", colorScheme: "light" }}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="rounded-[24px] bg-slate-50 p-4">
              <span className="font-semibold">Week starts on</span>
              <select
                value={settings.weekStartsOn}
                onChange={(event) => onUpdateSettings({ weekStartsOn: Number(event.target.value) })}
                className="mt-3 min-h-11 w-full rounded-2xl border bg-white px-4 py-3 text-slate-900"
                style={{ borderColor: "var(--line-strong)", colorScheme: "light" }}
              >
                <option value={1}>Monday</option>
                <option value={0}>Sunday</option>
              </select>
            </label>
            <label className="rounded-[24px] bg-slate-50 p-4">
              <span className="font-semibold">Default sort</span>
              <select
                value={settings.habitSort}
                onChange={(event) => onUpdateSettings({ habitSort: event.target.value })}
                className="mt-3 min-h-11 w-full rounded-2xl border bg-white px-4 py-3 text-slate-900"
                style={{ borderColor: "var(--line-strong)", colorScheme: "light" }}
              >
                <option value="streak">Streak</option>
                <option value="name">Name</option>
                <option value="frequency">Frequency</option>
                <option value="difficulty">Difficulty</option>
              </select>
            </label>
          </div>
        </div>
      </section>

      <section className="grid gap-6">
        <article className="surface rounded-[30px] p-5 sm:p-6">
          <h2 className="display-font text-2xl font-bold">Archived habits</h2>
          <div className="mt-4 grid gap-3">
            {archivedHabits.length ? (
              archivedHabits.map((habit) => (
                <div key={habit.id} className="rounded-[22px] bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{habit.name}</p>
                      <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
                        Archived habits stay in analytics and your stored records.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onRestoreHabit(habit.id)}
                        className="min-h-11 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                      >
                        Restore
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteHabit(habit.id)}
                        className="min-h-11 rounded-full border px-4 py-2 text-sm font-semibold text-rose-600"
                        style={{ borderColor: "rgba(239, 68, 68, 0.3)" }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm" style={{ color: "var(--ink-soft)" }}>No archived habits yet.</p>
            )}
          </div>
        </article>

        <article
          className="rounded-[30px] border p-5 sm:p-6"
          style={{
            borderColor: "rgba(190, 24, 93, 0.22)",
            background: "linear-gradient(180deg, rgba(255, 241, 242, 0.98), rgba(255, 228, 230, 0.94))",
            boxShadow: "0 20px 48px rgba(190, 24, 93, 0.08)"
          }}
        >
          <h2 className="display-font text-2xl font-bold" style={{ color: "#881337" }}>
            Danger zone
          </h2>
          <p className="mt-2 text-sm leading-6" style={{ color: "#9f1239" }}>
            Type <span className="font-semibold">CLEAR</span> to confirm before removing all local data.
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
            className="mt-4 min-h-11 w-full rounded-2xl border bg-white/92 px-4 py-3 text-slate-900"
            style={{ borderColor: "rgba(190, 24, 93, 0.22)" }}
          />
          <button
            type="button"
            disabled={confirmText !== "CLEAR"}
            onClick={onClearAllData}
            className="mt-4 min-h-11 rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear all data
          </button>
        </article>
      </section>
    </div>
  )
}
