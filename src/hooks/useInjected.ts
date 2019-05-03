import { useEffect, useState, useLayoutEffect } from 'react'
import { map } from 'rxjs/operators'
import { useFSCtx } from '../components/FirestoreProvider'
import { FSState, RefMap } from '../types'
import { injectRefObj } from '../shared'

const useInjected = <P extends object, S extends object>(
  mapSnaps: (s: FSState) => S,
  injectedRefs: RefMap<P> = {},
): S => {
  const { injectRef, store } = useFSCtx()
  const [snaps, setSnaps] = useState({} as S)
  useLayoutEffect(() => {
    const mapSnapshots = mapSnaps || (() => ({} as S))
    const source = store.pipe(
      map(mapSnapshots),
    )
    const sub = source.subscribe({ next: setSnaps })
    return () => { sub.unsubscribe() }
  }, [])
  useEffect(() => {
    return injectRefObj(injectRef, injectedRefs)
  }, [injectedRefs])
  return snaps
}

export default useInjected
