import React, {
  useState,
  useEffect,
  ComponentType,
  forwardRef
} from 'react'
import hoistNonReactStatics from 'hoist-non-react-statics'
import { useFSCtx } from './FirestoreProvider'
import { comp2, curry2 } from '../shared'
import { FSState, FSRef, InjectedRef } from '../types'

type MapFirestoreFn = (s: FSState) => ({ [key: string]: any })

type FnRef<P> = (p: P) => (FSRef | null)
type PlainRefToInj = { key: string, ref: FSRef }
type FnRefToInj<P> = { key: string, ref: (p: P) => FSRef }
type RefToInj<P> = PlainRefToInj | FnRefToInj<P>

function _cleanup<P>(
  injectRef: (r: InjectedRef) => void,
  refs: RefToInj<P>[],
) {
  refs.forEach(({ key }) => {
    injectRef({ key, ref: null })
  })
}

const cleanupRefs = curry2(_cleanup)

export default function connectFirestore<P extends object>(mapSnapshotsToProps: MapFirestoreFn, ...injectedRefs: RefToInj<P>[]) {
  const mapSnapshots = typeof mapSnapshotsToProps === 'function'
    ? mapSnapshotsToProps : () => ({})
  return function enhance(WrappedComponent: ComponentType<P>) {
    function FirestoreConsumer(props: P) {
      const { subscribe, injectRef } = useFSCtx()
      const [snaps, setSnaps] = useState({})
      let fnRefs: FnRefToInj<P>[] = []
      let cleanupFn: (rs: RefToInj<P>[]) => void
      useEffect(() => {
        const setState = comp2(setSnaps, mapSnapshots)
        return subscribe(setState)
      }, [mapSnapshots, setSnaps, subscribe])
      // first inject static refs, collect fn refs
      // to be injected in another side-effect
      useEffect(() => {
        cleanupFn = cleanupRefs(injectRef)
        injectedRefs.forEach((r) => {
          if (typeof r.ref === 'function') fnRefs = fnRefs.concat(r as FnRefToInj<P>)
          else injectRef(r as PlainRefToInj)
        })

        return () => cleanupFn(injectedRefs)
      }, [])
      // this effect re-runs whenever props change, so we will only
      // re-inject refs that rely on props (fn refs)
      useEffect(() => {
        fnRefs.forEach(({ key, ref }) => {
          injectRef({ key, ref: ref(props) })
        })
        return () => cleanupFn(fnRefs)
      }, [props])
      return (
        <WrappedComponent {...props} {...snaps} />
      )
    }
    const C = hoistNonReactStatics(FirestoreConsumer, WrappedComponent)

    return forwardRef((props: P, ref) => <C forwardedRef={ref} {...props} />)
  }
}
