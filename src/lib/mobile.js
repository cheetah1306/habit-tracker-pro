import { Capacitor } from "@capacitor/core"
import { App as CapApp } from "@capacitor/app"
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics"
import { StatusBar, Style } from "@capacitor/status-bar"

export const isNative = () => Capacitor.isNativePlatform()

/**
 * Trigger subtle tactile haptic vibration
 */
export const triggerHaptic = async (type = "light") => {
  if (isNative()) {
    try {
      if (type === "success") {
        await Haptics.notification({ type: NotificationType.Success })
      } else if (type === "medium") {
        await Haptics.impact({ style: ImpactStyle.Medium })
      } else if (type === "heavy") {
        await Haptics.impact({ style: ImpactStyle.Heavy })
      } else {
        await Haptics.impact({ style: ImpactStyle.Light })
      }
      return
    } catch {}
  }

  // Web mobile browser fallback
  if (typeof window !== "undefined" && "vibrate" in navigator) {
    try {
      if (type === "success") {
        navigator.vibrate([20, 50, 20])
      } else {
        navigator.vibrate(15)
      }
    } catch {}
  }
}

/**
 * Update mobile status bar appearance based on theme
 */
export const updateStatusBarTheme = async (isDark = false) => {
  if (!isNative()) return

  try {
    await StatusBar.setStyle({
      style: isDark ? Style.Dark : Style.Light
    })
    await StatusBar.setBackgroundColor({
      color: isDark ? "#0f172a" : "#ffffff"
    })
  } catch {}
}

/**
 * Register Android hardware back button handler
 */
export const registerBackButtonHandler = (handler) => {
  if (!isNative()) return () => {}

  let listenerPromise = CapApp.addListener("backButton", (event) => {
    handler(event)
  })

  return () => {
    listenerPromise.then((handle) => handle.remove()).catch(() => {})
  }
}

/**
 * Minimize or exit native app
 */
export const exitNativeApp = () => {
  if (isNative()) {
    CapApp.exitApp()
  }
}
