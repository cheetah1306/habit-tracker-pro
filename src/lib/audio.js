// Synthesized Web Audio API sound effects for Habit Tracker Pro gamification
// Zero external mp3/wav files required, zero latency, works on mobile & web

const getAudioContext = () => {
  if (typeof window === "undefined") {
    return null
  }
  const AudioContextClass = window.AudioContext || window.webkitAudioContext
  if (!AudioContextClass) {
    return null
  }
  return new AudioContextClass()
}

/**
 * Satisfying check-in chime (two ascending sine tones)
 */
export const playHabitCheckSound = (enabled = true) => {
  if (!enabled) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const now = ctx.currentTime

    // Tone 1
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = "sine"
    osc1.frequency.setValueAtTime(587.33, now) // D5
    gain1.gain.setValueAtTime(0.08, now)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.14)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.15)

    // Tone 2
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = "sine"
    osc2.frequency.setValueAtTime(880.0, now + 0.08) // A5
    gain2.gain.setValueAtTime(0.1, now + 0.08)
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.28)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.08)
    osc2.stop(now + 0.3)
  } catch {
    // Audio contexts can fail in strict autoplay policies; fail silently
  }
}

/**
 * Daily quest complete reward fanfare (bright 4-note arpeggio)
 */
export const playQuestCompleteSound = (enabled = true) => {
  if (!enabled) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
    const now = ctx.currentTime

    notes.forEach((freq, index) => {
      const startTime = now + index * 0.07
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "triangle"
      osc.frequency.setValueAtTime(freq, startTime)
      gain.gain.setValueAtTime(0.09, startTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.22)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(startTime)
      osc.stop(startTime + 0.24)
    })
  } catch {}
}

/**
 * Triumphant Level-Up Fanfare
 */
export const playLevelUpSound = (enabled = true) => {
  if (!enabled) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const notes = [440.0, 554.37, 659.25, 880.0, 1108.73] // A4, C#5, E5, A5, C#6
    const now = ctx.currentTime

    notes.forEach((freq, index) => {
      const startTime = now + index * 0.08
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(freq, startTime)
      gain.gain.setValueAtTime(0.12, startTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.4)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(startTime)
      osc.stop(startTime + 0.42)
    })
  } catch {}
}

/**
 * Daily mystery chest opening shimmer
 */
export const playChestOpenSound = (enabled = true) => {
  if (!enabled) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const notes = [659.25, 783.99, 987.77, 1174.66, 1318.51] // E5, G5, B5, D6, E6
    const now = ctx.currentTime

    notes.forEach((freq, index) => {
      const startTime = now + index * 0.05
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(freq, startTime)
      gain.gain.setValueAtTime(0.08, startTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.35)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(startTime)
      osc.stop(startTime + 0.38)
    })
  } catch {}
}

/**
 * Combo streak sound - pitch rises with higher combo count!
 */
export const playComboSound = (comboCount = 1, enabled = true) => {
  if (!enabled) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const pitchFactor = Math.min(2.0, 1.0 + (comboCount - 1) * 0.22)
    const baseFreqs = [523.25 * pitchFactor, 659.25 * pitchFactor, 783.99 * pitchFactor]
    const now = ctx.currentTime

    baseFreqs.forEach((freq, idx) => {
      const startTime = now + idx * 0.05
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(freq, startTime)
      gain.gain.setValueAtTime(0.12, startTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.22)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(startTime)
      osc.stop(startTime + 0.24)
    })
  } catch {}
}

/**
 * Boss Hit Impact Sound (heavy punchy hit + crunch)
 */
export const playBossHitSound = (enabled = true) => {
  if (!enabled) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = "sawtooth"
    osc.frequency.setValueAtTime(160, now)
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.18)

    gain.gain.setValueAtTime(0.2, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.24)
  } catch {}
}

/**
 * Boss Defeated Fanfare (grand triumphant descending/ascending chord)
 */
export const playBossDefeatedSound = (enabled = true) => {
  if (!enabled) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const notes = [440.0, 554.37, 659.25, 880.0, 1108.73, 1318.51]
    const now = ctx.currentTime

    notes.forEach((freq, idx) => {
      const startTime = now + idx * 0.06
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "triangle"
      osc.frequency.setValueAtTime(freq, startTime)
      gain.gain.setValueAtTime(0.14, startTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.35)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(startTime)
      osc.stop(startTime + 0.38)
    })
  } catch {}
}

/**
 * Godmode 100% Day Completion Celestial Chime
 */
export const playGodmodeCelebrationSound = (enabled = true) => {
  if (!enabled) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const freqs = [587.33, 739.99, 880.0, 1174.66, 1479.98, 1760.0]
    const now = ctx.currentTime

    freqs.forEach((freq, idx) => {
      const startTime = now + idx * 0.08
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(freq, startTime)
      gain.gain.setValueAtTime(0.15, startTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.6)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(startTime)
      osc.stop(startTime + 0.65)
    })
  } catch {}
}

/**
 * Mascot Tap Playful Chirp
 */
export const playMascotTapSound = (enabled = true) => {
  if (!enabled) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = "sine"
    osc.frequency.setValueAtTime(700, now)
    osc.frequency.exponentialRampToValueAtTime(1050, now + 0.09)

    gain.gain.setValueAtTime(0.09, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.13)
  } catch {}
}

/**
 * High-tech energetic boot/startup sound
 */
export const playStartupSound = (enabled = true) => {
  if (!enabled) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const now = ctx.currentTime
    // Warm synth bass sweep
    const sweep = ctx.createOscillator()
    const sweepGain = ctx.createGain()
    sweep.type = "sine"
    sweep.frequency.setValueAtTime(140, now)
    sweep.frequency.exponentialRampToValueAtTime(440, now + 0.3)
    sweepGain.gain.setValueAtTime(0.08, now)
    sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
    sweep.connect(sweepGain)
    sweepGain.connect(ctx.destination)
    sweep.start(now)
    sweep.stop(now + 0.36)

    // Vibrant energetic chord shimmer
    const chord = [392.00, 587.33, 783.99, 1046.50, 1567.98] // G4, D5, G5, C6, G6
    chord.forEach((freq, idx) => {
      const startTime = now + 0.18 + idx * 0.04
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = idx % 2 === 0 ? "triangle" : "sine"
      osc.frequency.setValueAtTime(freq, startTime)
      gain.gain.setValueAtTime(0.07, startTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.55)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(startTime)
      osc.stop(startTime + 0.6)
    })
  } catch {}
}


