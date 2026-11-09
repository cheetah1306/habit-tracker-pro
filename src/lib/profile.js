import { format } from "date-fns"
import { toDate } from "./dates"

export const createEmptyProfileDraft = () => ({
  name: "",
  age: "",
  dob: "",
  gender: ""
})

export const createProfileDraft = (profile = null) => {
  if (!profile) {
    return createEmptyProfileDraft()
  }

  return {
    name: typeof profile.name === "string" ? profile.name : "",
    age: profile.age != null ? String(profile.age) : "",
    dob: typeof profile.dob === "string" ? profile.dob : "",
    gender: typeof profile.gender === "string" ? profile.gender : ""
  }
}

/**
 * Parses and normalizes date of birth into canonical 'YYYY-MM-DD' format.
 * Supports:
 * - YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD
 * - DD-MM-YYYY, DD/MM/YYYY, DD.MM.YYYY
 * - 8-digit compact strings: YYYYMMDD or DDMMYYYY
 * - Single digit days/months: 2003-1-5, 5/1/2003
 */
export const parseAndNormalizeDob = (raw) => {
  if (!raw || typeof raw !== "string") return null
  const str = raw.trim()
  if (!str) return null

  let year = null
  let month = null
  let day = null

  // Check with delimiters: -, /, ., space
  const parts = str.split(/[-/.\s]+/)
  if (parts.length === 3) {
    const p0 = parseInt(parts[0], 10)
    const p1 = parseInt(parts[1], 10)
    const p2 = parseInt(parts[2], 10)

    if (parts[0].length === 4) {
      // YYYY-MM-DD
      year = p0
      month = p1
      day = p2
    } else if (parts[2].length === 4) {
      // DD-MM-YYYY
      day = p0
      month = p1
      year = p2
    }
  } else {
    // Digits only
    const digits = str.replace(/\D/g, "")
    if (digits.length === 8) {
      const first4 = parseInt(digits.slice(0, 4), 10)
      const last4 = parseInt(digits.slice(4, 8), 10)

      if (first4 >= 1900 && first4 <= 2099) {
        // YYYYMMDD
        year = first4
        month = parseInt(digits.slice(4, 6), 10)
        day = parseInt(digits.slice(6, 8), 10)
      } else if (last4 >= 1900 && last4 <= 2099) {
        // DDMMYYYY
        day = parseInt(digits.slice(0, 2), 10)
        month = parseInt(digits.slice(2, 4), 10)
        year = last4
      }
    }
  }

  if (!year || !month || !day) return null
  if (month < 1 || month > 12) return null
  if (day < 1 || day > 31) return null
  if (year < 1900 || year > 2099) return null

  const yStr = String(year).padStart(4, "0")
  const mStr = String(month).padStart(2, "0")
  const dStr = String(day).padStart(2, "0")

  return `${yStr}-${mStr}-${dStr}`
}

export const normalizeProfile = (profile) => {
  if (!profile || typeof profile !== "object") {
    return null
  }

  const name = typeof profile.name === "string" ? profile.name.trim().replace(/\s+/g, " ").slice(0, 60) : ""
  const gender = typeof profile.gender === "string" ? profile.gender.trim().slice(0, 40) : ""
  const ageValue = parseInt(String(profile.age).trim(), 10)
  const normalizedDob = parseAndNormalizeDob(profile.dob)

  if (
    !name ||
    !gender ||
    !normalizedDob ||
    !Number.isInteger(ageValue) ||
    ageValue < 1 ||
    ageValue > 130
  ) {
    return null
  }

  return {
    name,
    age: ageValue,
    dob: normalizedDob,
    gender
  }
}

export const isProfileComplete = (profile) => Boolean(normalizeProfile(profile))

/**
 * Creates canonical serialization key for a profile
 */
export const createProfileKey = (profile) => {
  const normalized = normalizeProfile(profile)
  if (!normalized) {
    return null
  }

  return JSON.stringify({
    name: normalized.name.toLowerCase().trim().replace(/\s+/g, " "),
    age: normalized.age,
    dob: normalized.dob,
    gender: normalized.gender.toLowerCase().trim()
  })
}

/**
 * Finds an account matching Name, Age, DOB, and Gender exactly
 */
export const findMatchingAccount = (accounts, profile) => {
  if (!accounts || typeof accounts !== "object") {
    return null
  }

  const target = normalizeProfile(profile)
  if (!target) {
    return null
  }

  const targetKey = createProfileKey(target)
  if (targetKey && accounts[targetKey]) {
    return {
      key: targetKey,
      account: accounts[targetKey]
    }
  }

  // Deep comparison across all stored accounts
  const targetName = target.name.toLowerCase().trim().replace(/\s+/g, " ")
  const targetGender = target.gender.toLowerCase().trim()

  for (const [key, snapshot] of Object.entries(accounts)) {
    if (!snapshot) continue
    let accProfile = normalizeProfile(snapshot.profile)
    if (!accProfile) {
      try {
        const parsed = JSON.parse(key)
        accProfile = normalizeProfile(parsed)
      } catch (err) {
        // Not a JSON key
      }
    }
    if (!accProfile) continue

    const nameMatch = accProfile.name.toLowerCase().trim().replace(/\s+/g, " ") === targetName
    const ageMatch = Number(accProfile.age) === target.age
    const dobMatch = accProfile.dob === target.dob
    const genderMatch = accProfile.gender.toLowerCase().trim() === targetGender

    if (nameMatch && ageMatch && dobMatch && genderMatch) {
      return {
        key,
        account: snapshot
      }
    }
  }

  return null
}

export const formatProfileDob = (dob) => {
  const normalized = parseAndNormalizeDob(dob)
  if (!normalized) {
    return ""
  }

  return format(toDate(normalized), "MMM d, yyyy")
}
