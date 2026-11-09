import { Capacitor } from "@capacitor/core"
import { LocalNotifications } from "@capacitor/local-notifications"
import { combineDateAndTime, todayKey } from "./dates"
import { getDueHabitsForDate, isHabitCompletedOnDate } from "./habits"

const NOTIF_CHANNEL_HABITS = "habit-reminders"
const NOTIF_CHANNEL_STREAKS = "streak-savers"

/**
 * Check if the app is running in a native Capacitor mobile container
 */
export const isNativePhone = () => Capacitor.isNativePlatform()

/**
 * Initialize notification channels on Android
 */
export const initNotifications = async () => {
  if (!isNativePhone()) {
    return
  }

  try {
    // Create Android Notification Channels
    await LocalNotifications.createChannel({
      id: NOTIF_CHANNEL_HABITS,
      name: "Habit Reminders",
      description: "Scheduled daily habit alerts to keep you consistent",
      importance: 4,
      visibility: 1,
      vibration: true
    })

    await LocalNotifications.createChannel({
      id: NOTIF_CHANNEL_STREAKS,
      name: "Streak Savers & Quests",
      description: "Evening streak warnings and morning quest notifications",
      importance: 4,
      visibility: 1,
      vibration: true
    })
  } catch (err) {
    console.warn("Could not create notification channels:", err)
  }
}

/**
 * Check permission status
 */
export const checkNotificationPermission = async () => {
  if (isNativePhone()) {
    try {
      const status = await LocalNotifications.checkPermissions()
      return status.display === "granted"
    } catch {
      return false
    }
  }

  if (typeof window !== "undefined" && "Notification" in window) {
    return Notification.permission === "granted"
  }

  return false
}

/**
 * Request notification permissions from phone/browser
 */
export const requestNotificationPermission = async () => {
  if (isNativePhone()) {
    try {
      const result = await LocalNotifications.requestPermissions()
      return result.display === "granted"
    } catch (err) {
      console.warn("Failed to request native notification permissions:", err)
      return false
    }
  }

  if (typeof window !== "undefined" && "Notification" in window) {
    try {
      const permission = await Notification.requestPermission()
      return permission === "granted"
    } catch {
      return false
    }
  }

  return false
}

/**
 * Hash string to a 32-bit positive integer for Capacitor notification IDs
 */
const hashId = (str) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % 2147483647
}

/**
 * Synchronize all outside-phone notifications for scheduled habits & streak savers
 */
export const syncAllScheduledNotifications = async (habits = [], completions = {}) => {
  const granted = await checkNotificationPermission()
  if (!granted) {
    return
  }

  if (!isNativePhone()) {
    return
  }

  try {
    const dateKey = todayKey()
    const activeHabits = habits.filter((h) => !h.archivedAt)
    const dueHabits = getDueHabitsForDate(activeHabits, dateKey)
    const pendingHabits = dueHabits.filter((h) => !isHabitCompletedOnDate(h, completions, dateKey))

    const notificationsToSchedule = []

    // 1. Schedule habit reminders
    activeHabits.forEach((habit) => {
      if (!habit.reminderTime) return

      const scheduledAt = combineDateAndTime(dateKey, habit.reminderTime)
      if (!scheduledAt) return

      const isCompleted = isHabitCompletedOnDate(habit, completions, dateKey)
      const now = new Date()

      // If scheduled time has passed today and not completed, or is upcoming
      let targetDate = scheduledAt
      if (scheduledAt.getTime() <= now.getTime()) {
        if (isCompleted) {
          // Schedule for tomorrow same time
          targetDate = new Date(scheduledAt.getTime() + 24 * 60 * 60 * 1000)
        } else {
          // Already passed today and pending, don't schedule a past alarm
          return
        }
      }

      notificationsToSchedule.push({
        id: hashId(`habit-${habit.id}`),
        title: `⏰ Time for: ${habit.name}`,
        body: `Build your streak! Tap to log your progress for ${habit.name}.`,
        channelId: NOTIF_CHANNEL_HABITS,
        schedule: {
          at: targetDate,
          allowWhileIdle: true
        },
        sound: "beep.wav",
        smallIcon: "ic_stat_icon",
        largeIcon: "ic_notification_large",
        iconColor: "#f59e0b",
        extra: {
          habitId: habit.id,
          type: "habit-reminder"
        }
      })
    })

    // 2. Schedule 8:00 PM Streak Saver if pending habits exist
    if (pendingHabits.length > 0) {
      const now = new Date()
      const eveningAlert = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20, 0, 0)

      if (eveningAlert.getTime() > now.getTime()) {
        notificationsToSchedule.push({
          id: hashId("streak-saver-evening"),
          title: "🔥 Don't lose your streak!",
          body: `Habi: You still have ${pendingHabits.length} habit${pendingHabits.length > 1 ? "s" : ""} left. Keep our streak flame burning!`,
          channelId: NOTIF_CHANNEL_STREAKS,
          schedule: {
            at: eveningAlert,
            allowWhileIdle: true
          },
          smallIcon: "ic_stat_icon",
          largeIcon: "ic_notification_large",
          iconColor: "#f59e0b",
          extra: {
            type: "streak-saver"
          }
        })
      }

      // Late night Emergency alert at 22:00 (10:00 PM)
      const lateAlert = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 22, 0, 0)
      if (lateAlert.getTime() > now.getTime()) {
        notificationsToSchedule.push({
          id: hashId("streak-saver-emergency"),
          title: "🚨 EMERGENCY: Habi is sweating feathers!",
          body: `Only 2 hours before midnight! Log your pending habits now to protect your streak flame!`,
          channelId: NOTIF_CHANNEL_STREAKS,
          schedule: {
            at: lateAlert,
            allowWhileIdle: true
          },
          smallIcon: "ic_stat_icon",
          largeIcon: "ic_notification_large",
          iconColor: "#f59e0b",
          extra: {
            type: "streak-emergency"
          }
        })
      }
    }

    // 3. Morning Daily Quests Alert at 8:30 AM
    const now = new Date()
    const morningAlert = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 30, 0)
    let targetMorning = morningAlert
    if (morningAlert.getTime() <= now.getTime()) {
      targetMorning = new Date(morningAlert.getTime() + 24 * 60 * 60 * 1000)
    }

    notificationsToSchedule.push({
      id: hashId("morning-quests-ready"),
      title: "⚔️ Daily Quests are Ready!",
      body: "3 fresh challenges are waiting for you in Habit Tracker Pro. Start your morning strong!",
      channelId: NOTIF_CHANNEL_STREAKS,
      schedule: {
        at: targetMorning,
        allowWhileIdle: true
      },
      smallIcon: "ic_stat_icon",
      largeIcon: "ic_notification_large",
      iconColor: "#f59e0b",
      extra: {
        type: "daily-quest"
      }
    })

    // Cancel existing scheduled notifications to avoid duplicates, then reschedule
    const pending = await LocalNotifications.getPending()
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({
        notifications: pending.notifications.map((n) => ({ id: n.id }))
      })
    }

    if (notificationsToSchedule.length > 0) {
      await LocalNotifications.schedule({
        notifications: notificationsToSchedule
      })
    }
  } catch (err) {
    console.warn("Error scheduling notifications:", err)
  }
}

/**
 * Trigger an immediate test notification outside the phone (fires in 2 seconds)
 */
export const triggerTestNotification = async () => {
  const granted = await checkNotificationPermission()
  if (!granted) {
    const ok = await requestNotificationPermission()
    if (!ok) {
      return { success: false, reason: "Permission denied by user" }
    }
  }

  if (isNativePhone()) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: hashId(`test-${Date.now()}`),
            title: "✨ Habit Tracker Pro Notification",
            body: "Outside-phone notifications are working perfectly! You will receive daily habit alarms and streak reminders.",
            channelId: NOTIF_CHANNEL_HABITS,
            schedule: {
              at: new Date(Date.now() + 2000),
              allowWhileIdle: true
            },
            smallIcon: "ic_stat_icon",
            largeIcon: "ic_notification_large",
            iconColor: "#f59e0b"
          }
        ]
      })
      return { success: true, platform: "phone" }
    } catch (err) {
      return { success: false, reason: err.message }
    }
  }

  // Web fallback
  if (typeof window !== "undefined" && "Notification" in window) {
    setTimeout(() => {
      try {
        new Notification("✨ Habit Tracker Pro Notification", {
          body: "Notifications are working! You'll receive daily habit alarms and streak reminders.",
          icon: "/logo.png"
        })
      } catch (err) {
        console.warn("Browser notification failed:", err)
      }
    }, 2000)
    return { success: true, platform: "web" }
  }

  return { success: false, reason: "Notification API not available in this environment" }
}
