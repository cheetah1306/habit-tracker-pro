import { useEffect, useState } from "react"

export const usePersistentState = (loadValue, saveValue, fallbackValue) => {
  const [state, setState] = useState(() => {
    const resolved = loadValue?.()
    if (resolved === undefined || resolved === null) {
      return fallbackValue
    }
    return resolved
  })

  useEffect(() => {
    if (!saveValue) {
      return
    }
    saveValue(state)
  }, [saveValue, state])

  return [state, setState]
}
