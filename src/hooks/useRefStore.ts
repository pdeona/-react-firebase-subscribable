import { useRef, useLayoutEffect, useMemo } from 'react'
import {
  BehaviorSubject,
  Observable,
  Observer,
  Subject,
} from 'rxjs'
import { curry2 } from '../shared'
import {
  IFSRef,
  FSSnap,
  FSState,
  UpdateAction,
} from '../types'

export type StateObservable = BehaviorSubject<FSState>

function mkAddDeleteRef(refMap: Map<string, Observable<FSSnap>>) {
  return {
    addRef(key: string, ref: IFSRef) {
      const source = Observable.create((subscriber: Observer<FSSnap>) => {
        const unsubscribe = ref.onSnapshot(subscriber)
        return { unsubscribe }
      })

      refMap.set(key, source)
    },
    deleteRef(key: string) {
      refMap.delete(key)
    },
  }
}

function _mkDispatch(state: Observer<UpdateAction>, key: string) {
  return {
    next: (snapshot: FSSnap): void => state.next({ key, snapshot }),
    error: (error: Error): void => state.next({ key, error })
  }
}

const mkDispatch = curry2(_mkDispatch)

export default function useRefStore() {
  // a map of observables corresponding to ref snapshot events
  const refObservables = useRef(new Map<string, Observable<FSSnap>>())
  // observable state for multicasting
  const stSource = useRef(new BehaviorSubject<FSState>({}))
  // observable subject for receiving
  // dispatches from snapshot observers
  const updates = useRef(new Subject())

  const { addRef, deleteRef } = useMemo(
    () => mkAddDeleteRef(refObservables.current),
    [refObservables.current],
  )
  const dispatchForKey = useMemo(
    () => mkDispatch(updates.current),
    [updates.current]
  )

  // subscribe to dispatched snapshots so state is updated
  useLayoutEffect(() => {
    const sub = updates.current.subscribe({
      next: ({ key, ...payload }) => stSource.current.next({
      ...stSource.current.value,
      [key]: payload.error
        ? { value: payload.error, error: true }
        : { value: payload.snapshot, error: false },
      }),
    })
    return () => { sub.unsubscribe() }
  }, [])

  function injectRef(key: string, ref: IFSRef) {
    addRef(key, ref)
    const observable = refObservables.current.get(key)
    const subscription = observable.subscribe(dispatchForKey(key))
    return () => {
      subscription.unsubscribe()
      deleteRef(key)
    }
  }

  return {
    store: stSource.current,
    injectRef,
  }
}
