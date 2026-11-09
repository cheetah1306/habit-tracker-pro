import React, { useEffect, useRef, useState } from "react"
import { BadgeInfo, Calendar, LogOut, PencilLine, UserRound, X } from "lucide-react"
import { createEmptyProfileDraft, formatProfileDob, normalizeProfile, parseAndNormalizeDob } from "../lib/profile"

const glassPanelClasses =
  "relative overflow-hidden rounded-[34px] border border-slate-200/90 bg-white/95 p-6 shadow-[0_20px_50px_-10px_rgba(15,23,42,0.12)] backdrop-blur-3xl sm:p-8"

const glassButtonClasses =
  "rounded-full border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition hover:bg-slate-100 hover:text-slate-900"

const lightFieldClasses =
  "mt-2 min-h-11 w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none shadow-sm transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"

const ProfileField = ({ label, children }) => (
  <label className="block">
    <span className="text-sm font-bold text-slate-800">{label}</span>
    {children}
  </label>
)

export const ProfileEditorCard = ({
  eyebrow,
  heading,
  description,
  draft,
  onChange,
  onSubmit,
  submitLabel,
  onCancel,
  onLogout,
  logoutLabel = "Log out",
  cancelLabel = "Cancel",
  showClose = false,
  onClose,
  footerNote = "Your details stay stored locally in this browser.",
  submitting = false
}) => {
  const currentDraft = draft ?? createEmptyProfileDraft()
  const isValid = Boolean(normalizeProfile(currentDraft))
  const [isSaving, setIsSaving] = useState(false)
  const dateInputRef = useRef(null)

  useEffect(() => {
    if (!submitting) {
      setIsSaving(false)
    }
  }, [submitting])

  const update = (patch) => onChange({ ...currentDraft, ...patch })

  const handleSubmit = async () => {
    const nextProfile = normalizeProfile(currentDraft)
    if (!nextProfile) {
      return
    }

    setIsSaving(true)
    try {
      await Promise.resolve(onSubmit(nextProfile))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className={`${glassPanelClasses} sheet-enter`}>
      <div className="pointer-events-none absolute -right-12 top-0 h-40 w-40 rounded-full bg-violet-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-12 bottom-0 h-44 w-44 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-violet-600/40 to-indigo-600/40 blur-sm opacity-60" />
            <img
              src="/logo.png"
              alt="Habit Tracker Pro Logo"
              className="relative h-16 w-16 rounded-2xl object-cover shadow-lg ring-2 ring-violet-500/30 shrink-0"
            />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-violet-600">
              {eyebrow}
            </p>
            <h2 className="display-font mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">{heading}</h2>
            {description ? (
              <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {showClose && onClose ? (
          <button
            type="button"
            onClick={onClose}
            className={glassButtonClasses}
            aria-label="Close profile editor"
          >
            <X size={18} />
          </button>
        ) : null}
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <ProfileField label="Name">
          <input
            type="text"
            maxLength={60}
            value={currentDraft.name}
            onChange={(event) => update({ name: event.target.value.slice(0, 60) })}
            placeholder="e.g. Alex"
            autoComplete="name"
            className={lightFieldClasses}
          />
        </ProfileField>

        <ProfileField label="Age">
          <input
            type="number"
            min="1"
            max="130"
            value={currentDraft.age}
            onChange={(event) => update({ age: event.target.value.slice(0, 3) })}
            placeholder="e.g. 25"
            inputMode="numeric"
            className={lightFieldClasses}
          />
        </ProfileField>

        <ProfileField label="Date of birth">
          <div className="relative mt-2">
            <input
              type="text"
              maxLength={10}
              value={currentDraft.dob}
              onChange={(event) => {
                const input = event.target.value.replace(/\//g, "-").replace(/[^0-9-]/g, "").slice(0, 10)
                const normalized = parseAndNormalizeDob(input)
                let agePatch = {}
                if (normalized && !currentDraft.age) {
                  const birthYear = parseInt(normalized.split("-")[0], 10)
                  const thisYear = new Date().getFullYear()
                  const calculatedAge = thisYear - birthYear
                  if (calculatedAge >= 1 && calculatedAge <= 120) {
                    agePatch = { age: String(calculatedAge) }
                  }
                }
                update({ dob: input, ...agePatch })
              }}
              placeholder="YYYY-MM-DD or DD-MM-YYYY"
              autoComplete="off"
              className={`${lightFieldClasses} !mt-0 pr-12`}
            />

            {/* Calendar picker option */}
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center">
              <div
                className="relative flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                title="Choose date from calendar"
                aria-label="Choose date from calendar"
              >
                <Calendar size={18} />
                <input
                  ref={dateInputRef}
                  type="date"
                  max={new Date().toISOString().split("T")[0]}
                  min="1900-01-01"
                  value={parseAndNormalizeDob(currentDraft.dob) || ""}
                  onChange={(event) => {
                    const picked = event.target.value
                    if (picked) {
                      let agePatch = {}
                      const birthYear = parseInt(picked.split("-")[0], 10)
                      const thisYear = new Date().getFullYear()
                      const calculatedAge = thisYear - birthYear
                      if (calculatedAge >= 1 && calculatedAge <= 120) {
                        agePatch = { age: String(calculatedAge) }
                      }
                      update({ dob: picked, ...agePatch })
                    }
                  }}
                  className="absolute inset-0 cursor-pointer opacity-0"
                  tabIndex={-1}
                />
              </div>
            </div>
          </div>
        </ProfileField>

        <ProfileField label="Gender">
          <select
            value={currentDraft.gender}
            onChange={(event) => update({ gender: event.target.value })}
            className={lightFieldClasses}
          >
            <option value="" disabled className="text-slate-400">Select gender</option>
            <option value="Man" className="text-slate-900">Man</option>
            <option value="Woman" className="text-slate-900">Woman</option>
            <option value="Prefer not to say" className="text-slate-900">Prefer not to say</option>
          </select>
        </ProfileField>
      </div>

      <div
        className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100/90 px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm"
      >
        <BadgeInfo size={14} className="text-slate-500" />
        {footerNote}
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
        {onLogout ? (
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700 shadow-sm transition hover:bg-rose-100"
          >
            <LogOut size={16} />
            {logoutLabel}
          </button>
        ) : null}
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="min-h-11 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
          >
            {cancelLabel}
          </button>
        ) : null}
        <button
          type="button"
          disabled={!isValid || submitting || isSaving}
          onClick={handleSubmit}
          className="min-h-11 rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 px-7 py-3 text-sm font-bold text-white shadow-[0_10px_25px_rgba(124,58,237,0.35)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting || isSaving ? "Saving..." : submitLabel}
        </button>
      </div>
    </div>
  )
}

export const ProfileSetupScreen = ({ draft, onChange, onSubmit, submitting = false }) => (
  <div className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8 bg-slate-50">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.08),_transparent_38%),radial-gradient(circle_at_20%_30%,_rgba(16,185,129,0.08),_transparent_32%),radial-gradient(circle_at_80%_20%,_rgba(14,165,233,0.08),_transparent_32%)]" />
    <div className="pointer-events-none absolute left-0 top-10 h-72 w-72 rounded-full bg-violet-400/10 blur-3xl" />
    <div className="pointer-events-none absolute right-0 top-1/3 h-80 w-80 rounded-full bg-indigo-400/10 blur-3xl" />
    <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-purple-400/10 blur-3xl" />

    <div className="relative mx-auto flex min-h-[calc(100vh-2rem)] max-w-4xl flex-col items-center justify-center">
      <div className="mb-8 mt-4 flex justify-center">
        <div className="relative">
          <div className="absolute -inset-2.5 rounded-[36px] bg-gradient-to-r from-violet-600/30 via-purple-600/20 to-indigo-600/30 blur-xl opacity-70 animate-pulse" />
          <div className="relative overflow-hidden rounded-[32px] p-1 bg-gradient-to-br from-violet-500/40 via-purple-500/30 to-indigo-600/40 shadow-xl">
            <img
              src="/logo.png"
              alt="Habit Tracker Pro"
              className="h-36 w-36 sm:h-48 sm:w-48 rounded-[28px] object-cover"
            />
          </div>
        </div>
      </div>
      <div className="w-full">
        <ProfileEditorCard
          eyebrow="Welcome to Habit Tracker pro"
          heading="Let's begin!!"
          description="Enter your Name, Age, DOB, and Gender. If you have logged in before with these details, all your habits, streaks, XP, and history will be automatically restored!"
          draft={draft}
          onChange={onChange}
          onSubmit={onSubmit}
          submitLabel="Continue"
          submitting={submitting}
        />
      </div>
    </div>
  </div>
)

export const ProfileEditorModal = ({
  open,
  draft,
  onChange,
  onSubmit,
  onClose,
  onLogout,
  submitting = false
}) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  if (!open) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-[100000] bg-slate-900/40 px-4 py-6 backdrop-blur-md sm:flex sm:items-center sm:justify-center overflow-y-auto"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100000,
        paddingTop: "max(1rem, env(safe-area-inset-top, 1rem))",
        paddingBottom: "max(1rem, env(safe-area-inset-bottom, 1rem))"
      }}
    >
      <div className="mx-auto h-full max-h-[92vh] w-full max-w-3xl overflow-y-auto">
        <ProfileEditorCard
          eyebrow="Edit profile"
          heading="Update your details"
          description="Any changes you save here will update the profile card across the app."
          draft={draft}
          onChange={onChange}
          onSubmit={onSubmit}
          submitLabel="Save changes"
          onCancel={onClose}
          onLogout={onLogout}
          cancelLabel="Close"
          showClose
          onClose={onClose}
          footerNote="This stays in local storage on this device."
          submitting={submitting}
        />
      </div>
    </div>
  )
}

const getProfileInitials = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()

export const ProfileSummaryButton = ({ profile, onEdit }) => {
  if (!profile) {
    return null
  }

  const initials = getProfileInitials(profile.name)
  const summary = `Age ${profile.age} | ${formatProfileDob(profile.dob)} | ${profile.gender}`

  return (
    <button
      type="button"
      onClick={onEdit}
      title={summary}
      className="group flex w-full max-w-full items-center gap-3 rounded-[24px] border border-slate-200/90 bg-white/95 px-4 py-2.5 text-left shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-md sm:w-auto sm:max-w-[360px]"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-sm font-bold text-white shadow-md">
        {initials || <UserRound size={18} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-slate-900">{profile.name}</span>
        <span className="block truncate text-xs font-medium text-slate-500">
          {summary}
        </span>
      </span>
      <span className="rounded-full bg-slate-100 p-2 text-slate-500 transition group-hover:bg-slate-200 group-hover:text-slate-800">
        <PencilLine size={15} />
      </span>
    </button>
  )
}