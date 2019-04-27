import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  FC,
  ReactNode,
} from 'react'
import { ObservableStore, InjectedRef, FSState } from '../types'

type FirestoreProviderProps = {
  children: ReactNode,
  refMap: ObservableStore,
}

type FirestoreProviderState = {
  subscribe: (o: (s: FSState) => void) => () => void,
  injectRef: (r: InjectedRef) => void,
}

const FirestoreContext = createContext<FirestoreProviderState>(null)

export const useFSCtx = () => useContext(FirestoreContext)

const FirestoreProvider: FC<FirestoreProviderProps> = ({ children, refMap }) => {
  const r = useRef(refMap)
  const { injectRef, subscribe: s, getState } = r.current
  const subscribe = (callback: (state: FSState) => void) => s(() => {
    callback(getState())
  })
  useEffect(() => {
    r.current = refMap
  }, [refMap])
  return (
    <FirestoreContext.Provider value={{ injectRef, subscribe }}>
      {children}
    </FirestoreContext.Provider>
  )
}

export default FirestoreProvider
