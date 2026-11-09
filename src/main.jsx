import React from "react"
import { createRoot } from "react-dom/client"
import App from "./App"
import "./index.css"

// Completely disable pinch-to-zoom, gesture zoom, and accidental multi-touch zoom
if (typeof window !== "undefined" && typeof document !== "undefined") {
  // 1. Block multi-touch pinch gestures
  document.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches && e.touches.length > 1) {
        e.preventDefault()
      }
    },
    { passive: false }
  )

  document.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches && e.touches.length > 1) {
        e.preventDefault()
      }
    },
    { passive: false }
  )

  // 2. Block Safari / WebKit gesture zoom
  document.addEventListener("gesturestart", (e) => e.preventDefault())
  document.addEventListener("gesturechange", (e) => e.preventDefault())
  document.addEventListener("gestureend", (e) => e.preventDefault())

  // 3. Block double-tap to zoom (while preserving taps on buttons/inputs)
  let lastTouchEnd = 0
  document.addEventListener(
    "touchend",
    (e) => {
      const now = Date.now()
      if (now - lastTouchEnd <= 300) {
        const isInteractive = e.target && e.target.closest && e.target.closest("button, a, input, textarea, select, [role='button']")
        if (!isInteractive) {
          e.preventDefault()
        }
      }
      lastTouchEnd = now
    },
    { passive: false }
  )

  // 4. Block Ctrl + wheel/trackpad zoom
  document.addEventListener(
    "wheel",
    (e) => {
      if (e.ctrlKey) {
        e.preventDefault()
      }
    },
    { passive: false }
  )

  // 5. Block Ctrl/Cmd +/-/0 keyboard zoom
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === "+" || e.key === "-" || e.key === "=" || e.key === "0")) {
      e.preventDefault()
    }
  })
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
