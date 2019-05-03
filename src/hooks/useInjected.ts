import { useEffect, useState } from 'react'
import { map } from 'rxjs/operators'
import { useFSCtx } from '../components/FirestoreProvider'
import { FSState, RefMap } from '../types'
import { injectRefObj } from '../shared'

const useInjected = <S extends object>(
  mapSnaps: (s: FSState) => S,
  injectedRefs: RefMap = {},
) => {
  const { injectRef, store } = useFSCtx()
  const [snaps, setSnaps] = useState({} as S)
  useEffect(() => {
    return injectRefObj(injectRef, injectedRefs)
  }, [injectedRefs])
  useEffect(() => {
    const source = store.pipe(
      map(mapSnaps),
    )
    const sub = source.subscribe({ next: setSnaps })
    return () => { sub.unsubscribe() }
  }, [])
  return snaps
}

export default useInjected
