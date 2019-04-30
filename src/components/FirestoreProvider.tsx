import React, {
  createContext,
  useContext,
  useEffect,
  FC,
  ReactNode,
} from 'react'
import useRefStore, { StateObservable } from '../hooks/useRefStore'
import {
  RefMap,
  IFSRef,
  FSState,
} from '../types'

type FirestoreProviderProps = {
  children: ReactNode,
  initialRefs: RefMap,
}

type FirestoreProviderCtx = {
  store: StateObservable,
  injectRef: (key: string, r: IFSRef) => () => void,
}

const FirestoreContext = createContext<FirestoreProviderCtx>(null)

export const useFSCtx = () => useContext(FirestoreContext)

const FirestoreProvider: FC<FirestoreProviderProps> = ({ children, initialRefs }) => {
  const { store, injectRef } = useRefStore()
  useEffect(() => {
    const subs = Object.keys(initialRefs).map(key => {
      return injectRef(key, initialRefs[key])
    })
    return () => subs.forEach(unsubscribe => {
      unsubscribe()
    })
  }, [initialRefs])
  return (
    <FirestoreContext.Provider value={{
      store,
      injectRef,
    }}>
      {children}
    </FirestoreContext.Provider>
  )
}

export default FirestoreProvider
