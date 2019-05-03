import React, {
  useMemo,
  useEffect,
  useState,
  ComponentType,
  forwardRef,
  Ref,
} from 'react'
import { map } from 'rxjs/operators'
import hoistNonReactStatics from 'hoist-non-react-statics'
import { useFSCtx } from '../components/FirestoreProvider'
import {
  MapFirestoreFn,
  RefMap,
  ForwardedRef,
  IFSRef,
} from '../types'
import { noop } from '../shared'

export default function connectFirestore<P extends object>(mapSnapshotsToProps: MapFirestoreFn, injectedRefs: RefMap<P> = {}) {
  const mapSnapshots = typeof mapSnapshotsToProps === 'function'
    ? mapSnapshotsToProps : () => ({})
  type CProps = P & ForwardedRef<ComponentType<P>>
  return function enhance(WrappedComponent: ComponentType<P>) {
    function FirestoreConsumer({ forwardedRef, ...rest }: CProps) {
      const { store, injectRef } = useFSCtx()
      const [snaps, setSnaps] = useState({})
      const { staticRefs, fnRefs } = useMemo(() => Object.keys(injectedRefs)
        .reduce(splitStaticAndFnRefs(injectedRefs), { fnRefs: {}, staticRefs: {} }), [])
      useEffect(() => {
        const subs = Object.keys(staticRefs)
          .map(key => injectRef(key, injectedRefs[key] as IFSRef))
        return () => subs.forEach(unsubscribe => unsubscribe())
      }, [])
      useEffect(() => {
        const subs = Object.keys(fnRefs).map(key => ({
            key,
            ref: (injectedRefs[key] as (p: P) => IFSRef)(rest as P)
          }))
          .map(({ key, ref }) => ref ? injectRef(key, ref) : noop)
        return () => subs.forEach(unsubscribe => unsubscribe())
      }, [rest])
      useEffect(() => {
        const stateSub = store.pipe(
          map(mapSnapshots),
        ).subscribe({ next: setSnaps })
        return () => { stateSub.unsubscribe() }
      }, [])

      return (
        <WrappedComponent
          {...rest as P}
          {...snaps}
          ref={forwardedRef}
        />
      )
    }
    const C = hoistNonReactStatics(FirestoreConsumer, WrappedComponent)

    return forwardRef((props: CProps, ref: Ref<ComponentType<P>>) =>
      <C {...props} forwardedRef={ref} />
    )
  }
}

type StaticAndFnRefs<P> = {
  staticRefs: {
    [key: string]: IFSRef,
  },
  fnRefs: {
    [key: string]: (p: P) => IFSRef,
  },
}

function splitStaticAndFnRefs<P>(injectedRefs: RefMap<P>) {
  return function reducer(acc: StaticAndFnRefs<P>, key: keyof RefMap<P>): StaticAndFnRefs<P> {
    const ref = injectedRefs[key]
    if (typeof ref === 'function') return {
      ...acc,
      fnRefs: {
        ...acc.fnRefs,
        [key]: ref,
      }
    }
    return {
      ...acc,
      staticRefs: {
        ...acc.staticRefs,
        [key]: ref,
      }
    }
  }
}
