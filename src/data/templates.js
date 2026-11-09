export const HABIT_TEMPLATES = [
  {
    id: "morning-routine",
    label: "Morning Routine",
    description: "Start the day calm, hydrated, and focused.",
    habits: [
      {
        name: "Drink Water",
        description: "Start the day with a full glass of water.",
        categoryId: "nutrition",
        color: "#10b981",
        difficulty: "easy",
        goalType: "count",
        goalTarget: 1,
        schedule: { mode: "daily" },
        reminderTime: "07:00"
      },
      {
        name: "Morning Stretch",
        description: "Loosen up for 10 minutes before work starts.",
        categoryId: "fitness",
        color: "#14b8a6",
        difficulty: "easy",
        goalType: "boolean",
        goalTarget: 1,
        schedule: { mode: "daily" },
        reminderTime: "07:15"
      },
      {
        name: "Plan the Day",
        description: "Write the top three priorities for today.",
        categoryId: "productivity",
        color: "#0ea5e9",
        difficulty: "medium",
        goalType: "boolean",
        goalTarget: 1,
        schedule: { mode: "daily" },
        reminderTime: "07:30"
      }
    ]
  },
  {
    id: "fitness-pack",
    label: "Fitness",
    description: "Build movement consistency all week.",
    habits: [
      {
        name: "Walk 8,000 Steps",
        description: "Track movement through the day.",
        categoryId: "fitness",
        color: "#10b981",
        difficulty: "medium",
        goalType: "count",
        goalTarget: 8,
        schedule: { mode: "daily" },
        reminderTime: "18:00"
      },
      {
        name: "Strength Session",
        description: "Three focused sessions each week.",
        categoryId: "fitness",
        color: "#1f8a70",
        difficulty: "hard",
        goalType: "boolean",
        goalTarget: 1,
        schedule: { mode: "custom", weekdays: [1, 3, 5] },
        reminderTime: "18:30"
      }
    ]
  },
  {
    id: "learning-pack",
    label: "Learning",
    description: "Protect daily study momentum.",
    habits: [
      {
        name: "Read 20 Pages",
        description: "Make tangible progress every day.",
        categoryId: "learning",
        color: "#0ea5e9",
        difficulty: "medium",
        goalType: "count",
        goalTarget: 20,
        schedule: { mode: "daily" },
        reminderTime: "20:00"
      },
      {
        name: "Practice Notes",
        description: "Summarize what you learned in a few lines.",
        categoryId: "learning",
        color: "#8b5cf6",
        difficulty: "easy",
        goalType: "boolean",
        goalTarget: 1,
        schedule: { mode: "daily" },
        reminderTime: "20:30"
      }
    ]
  }
]
