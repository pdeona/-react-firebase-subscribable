import { useEffect, useState } from 'react'
import { map } from 'rxjs/operators'
import { useFSCtx } from '../components/FirestoreProvider'
import { FSState, PlainRefToInj } from '../types'
import { comp2 } from '../shared'

const useInjected = <S extends object>(
  mapSnaps: (s: FSState) => S,
  injectedRefs: PlainRefToInj[],
) => {
  const { injectRef, store } = useFSCtx()
  const [snaps, setSnaps] = useState({} as S)
  useEffect(() => {
    const refs = injectedRefs.map(({ key, ref }) => injectRef(key, ref))
    return () => {
      refs.forEach(unsub => {
        unsub()
      })
    }
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
