import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  PublicationEditorTab,
  PublicationBlocker,
} from './publication-summary'

interface PublicationEditorState {
  id: string
  label: string
  tab: PublicationEditorTab
  isDirty: boolean
  isInvalid: boolean
  isUploading: boolean
}

interface PublicationReadinessContextValue {
  editorStates: PublicationEditorState[]
  register: (state: PublicationEditorState) => void
  unregister: (id: string) => void
}

const PublicationReadinessContext =
  createContext<PublicationReadinessContextValue | null>(null)

export function PublicationReadinessProvider({
  children,
}: {
  readonly children: ReactNode
}) {
  const [statesById, setStatesById] = useState<
    Record<string, PublicationEditorState>
  >({})
  const register = useCallback((state: PublicationEditorState): void => {
    setStatesById((current) => ({ ...current, [state.id]: state }))
  }, [])
  const unregister = useCallback((id: string): void => {
    setStatesById((current) => {
      if (!Object.hasOwn(current, id)) return current
      const next = { ...current }
      delete next[id]
      return next
    })
  }, [])

  const value = useMemo<PublicationReadinessContextValue>(
    () => ({
      editorStates: Object.values(statesById),
      register,
      unregister,
    }),
    [register, statesById, unregister],
  )

  return (
    <PublicationReadinessContext.Provider value={value}>
      {children}
    </PublicationReadinessContext.Provider>
  )
}

export function useRegisterPublicationEditorState(
  state: PublicationEditorState,
): void {
  const context = useContext(PublicationReadinessContext)
  const { id, isDirty, isInvalid, isUploading, label, tab } = state
  const register = context?.register
  const unregister = context?.unregister

  useEffect(() => {
    if (!register || !unregister) return
    register({
      id,
      isDirty,
      isInvalid,
      isUploading,
      label,
      tab,
    })

    return (): void => {
      unregister(id)
    }
  }, [
    id,
    isDirty,
    isInvalid,
    isUploading,
    label,
    register,
    tab,
    unregister,
  ])
}

export function usePublicationReadinessBlockers(): PublicationBlocker[] {
  const context = useContext(PublicationReadinessContext)
  if (!context) return []

  return context.editorStates.flatMap((state) => {
    const blockers: PublicationBlocker[] = []
    if (state.isUploading) {
      blockers.push({
        id: `${state.id}-uploading`,
        tab: state.tab,
        message: `${state.label}: aguarde o término dos uploads.`,
      })
    }
    if (state.isInvalid) {
      blockers.push({
        id: `${state.id}-invalid`,
        tab: state.tab,
        message: `${state.label}: corrija os campos inválidos.`,
      })
    }
    if (state.isDirty) {
      blockers.push({
        id: `${state.id}-dirty`,
        tab: state.tab,
        message: `${state.label}: salve ou descarte as alterações antes de publicar.`,
      })
    }
    return blockers
  })
}
