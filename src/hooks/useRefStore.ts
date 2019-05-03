import { useRef, useLayoutEffect, useMemo } from 'react'
import {
  BehaviorSubject,
  Observable,
  Observer,
  Subject,
} from 'rxjs'
import { map } from 'rxjs/operators'
import { curry2, noop } from '../shared'
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
  const refObservables = useRef(new Map<string, Observable<FSSnap>>())
  const stSource = useRef(new BehaviorSubject<FSState>({}))
  const updates = useRef(new Subject<UpdateAction>())

  const { addRef, deleteRef } = useMemo(
    () => mkAddDeleteRef(refObservables.current),
    [refObservables.current],
  )
  const dispatchForKey = useMemo(
    () => mkDispatch(updates.current),
    [updates.current]
  )

  useLayoutEffect(() => {
    const sub = updates.current.pipe(
      map<UpdateAction, FSState>(({ key, ...payload }) => ({
      ...stSource.current.value,
      [key]: payload.error
        ? { value: null, error: payload.error }
        : { value: payload.snapshot, error: null },
      })),
    ).subscribe(stSource.current)
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
