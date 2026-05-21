import { useMemo, useState, type ReactNode } from 'react'
import {
  FabPositionContext,
  type FabPosition,
  type FabPositionContextValue,
} from './fab-position-context'

const STORAGE_KEY = 'zapisi.fab-position'

function getStoredPosition(): FabPosition {
  const value = window.localStorage.getItem(STORAGE_KEY)

  if (value === 'left' || value === 'center' || value === 'right') {
    return value
  }

  return 'center'
}

export function FabPositionProvider({ children }: { children: ReactNode }) {
  const [position, setPositionState] = useState<FabPosition>(getStoredPosition)

  function setPosition(value: FabPosition) {
    setPositionState(value)
    window.localStorage.setItem(STORAGE_KEY, value)
  }

  const value = useMemo<FabPositionContextValue>(
    () => ({
      position,
      setPosition,
    }),
    [position],
  )

  return (
    <FabPositionContext.Provider value={value}>
      {children}
    </FabPositionContext.Provider>
  )
}
