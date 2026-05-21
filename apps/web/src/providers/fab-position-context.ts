import { createContext, useContext } from 'react'

export type FabPosition = 'left' | 'center' | 'right'

export type FabPositionContextValue = {
  position: FabPosition
  setPosition: (value: FabPosition) => void
}

export const FabPositionContext = createContext<FabPositionContextValue | null>(
  null,
)

export function useFabPosition() {
  const context = useContext(FabPositionContext)

  if (!context) {
    throw new Error('useFabPosition must be used within FabPositionProvider')
  }

  return context
}
