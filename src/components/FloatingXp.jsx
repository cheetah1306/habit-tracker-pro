import React from "react"

export const FloatingXp = ({ items = [] }) => {
  if (!items.length) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-bold text-sm shadow-xl"
          style={{
            left: `${item.x ?? 50}%`,
            top: `${item.y ?? 40}%`,
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            color: "#ffffff",
            border: "1px solid rgba(255, 255, 255, 0.4)",
            animation: "floatUpAndFade 1.4s ease-out forwards",
            transform: "translate(-50%, -50%)"
          }}
        >
          <span>✨</span>
          <span>+{item.xp} XP</span>
          {item.multiplier > 1 ? (
            <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-xs">
              x{item.multiplier}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  )
}
