import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  formatDistanceToNowStrict,
  isToday,
  parse,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays
} from "date-fns"

export const toDate = (value) => {
  if (value instanceof Date) {
    return value
  }

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return parse(value, "yyyy-MM-dd", new Date())
  }

  return new Date(value)
}

export const toDayKey = (value = new Date()) => format(startOfDay(toDate(value)), "yyyy-MM-dd")

export const todayKey = () => toDayKey(new Date())

export const fromDayKey = (value) => parse(value, "yyyy-MM-dd", new Date())

export const listDayKeys = (count, endDate = new Date()) => {
  const keys = []
  const end = toDate(endDate)

  for (let index = count - 1; index >= 0; index -= 1) {
    keys.push(toDayKey(subDays(end, index)))
  }

  return keys
}

export const getMonthMatrix = (dateValue, weekStartsOn = 1) => {
  const date = toDate(dateValue)
  const start = startOfWeek(startOfMonth(date), { weekStartsOn })
  const end = endOfWeek(endOfMonth(date), { weekStartsOn })

  return eachDayOfInterval({ start, end }).map((entry) => ({
    date: entry,
    key: toDayKey(entry),
    currentMonth: format(entry, "M") === format(date, "M")
  }))
}

export const getMonthDayKeys = (dateValue) => {
  const date = toDate(dateValue)
  return eachDayOfInterval({
    start: startOfMonth(date),
    end: endOfMonth(date)
  }).map((entry) => toDayKey(entry))
}

export const combineDateAndTime = (dateKey, timeValue) => {
  if (!timeValue) {
    return null
  }

  return new Date(`${dateKey}T${timeValue}:00`)
}

export const formatDateHeading = (value) => format(toDate(value), "EEEE, MMMM d")

export const formatMonthHeading = (value) => format(toDate(value), "MMMM yyyy")

export const formatWeekday = (value, token = "EEE") => format(toDate(value), token)

export const formatDayNumber = (value) => format(toDate(value), "d")

export const formatTime = (value) => format(toDate(value), "p")

export const formatRelativeCompleted = (value) => {
  if (!value) {
    return "Not completed yet"
  }

  const date = toDate(value)

  if (isToday(date)) {
    return `Completed ${formatDistanceToNowStrict(date, { addSuffix: true })}`
  }

  return `Completed on ${format(date, "MMM d, p")}`
}

export const getWeekdayName = (dayIndex) => {
  const base = new Date(2024, 0, 7 + dayIndex)
  return format(base, "EEEE")
}

export const addDaysToKey = (dateKey, amount) => toDayKey(addDays(fromDayKey(dateKey), amount))

export const isSameMonth = (left, right) => format(toDate(left), "yyyy-MM") === format(toDate(right), "yyyy-MM")
