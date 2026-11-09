# 🌟 Habit Tracker Pro

A powerful, gamified habit tracking mobile and web application built with **React**, **Vite**, **Tailwind CSS**, and **Capacitor**. Transform your daily routines into an RPG-like journey with XP, streaks, level-ups, and in-depth analytics.

---

## ✨ Features

- 🧬 **Habit DNA**: Understand your behavioral archetypes and patterns with custom DNA profiling.
- 🎮 **RPG Gamification**:
  - Earn XP for every habit completed.
  - Battle the **Daily Boss** by hitting your daily goals.
  - Complete **Daily Quests** and unlock **Mystery Chests**.
  - Level up and compete across XP leagues.
- 📊 **Deep Analytics & History**: Visual progress charts powered by Recharts, weekly performance breakdowns, and completion heatmaps.
- 📱 **Mobile-Ready**: Cross-platform ready with **Capacitor Android**, native status bar support, haptic feedback, and local notifications.
- ⏰ **Smart Reminders**: Local reminders and audio cues to keep you on schedule.
- 🎨 **Sleek Dark Mode UI**: Built with Tailwind CSS, custom design tokens, and smooth celebratory animations.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite 6, Tailwind CSS
- **Mobile Runtime**: Capacitor 8 (Android)
- **Charts & Data**: Recharts, Date-fns
- **Icons & Effects**: Lucide React, Canvas Confetti
- **Storage**: LocalStorage with persistent state hooks

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/cheetah1306/habit-tracker-pro.git
   cd habit-tracker-pro
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 📱 Android Development

### Build APK
To build and sync for Android:
```bash
npm run cap:sync
npm run android:apk
```

### Live Reload on Android Device
```bash
npm run android:dev
```

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Vite local development server |
| `npm run build` | Builds production bundle into `/dist` |
| `npm run preview` | Previews production build locally |
| `npm run cap:sync` | Builds web app and syncs with Capacitor Android |
| `npm run android:apk`| Compiles debug/release APK |

---

## 📄 License

This project is licensed under the MIT License.
