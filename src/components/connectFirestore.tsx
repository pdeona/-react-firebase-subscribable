import React, {
  useMemo,
  ComponentType,
  forwardRef,
} from 'react'
import hoistNonReactStatics from 'hoist-non-react-statics'
import useInjected from '../hooks/useInjected'
import {
  MapFirestoreFn,
  RefMap,
  ForwardedRef,
  IFSRef,
} from '../types'
import { comp2, getProp } from '../shared'

export default function connectFirestore<P extends object>(mapSnapshotsToProps: MapFirestoreFn, injectedRefs: RefMap = {}) {
  const mapSnapshots = typeof mapSnapshotsToProps === 'function'
    ? mapSnapshotsToProps : () => ({})
  return function enhance(WrappedComponent: ComponentType<P>) {
    function FirestoreConsumer(props: P & ForwardedRef<ComponentType<P>>) {
      const refs = useMemo(
        () => Object.keys(injectedRefs)
          .map(key => ({
            key,
            ref: typeof injectedRefs[key] === 'function'
              ? (injectedRefs[key] as (p: P) => IFSRef)(props)
              : injectedRefs[key],
          }))
          .filter(comp2(Boolean, getProp('ref')))
          .reduce((acc, { key, ref }) => ({
            ...acc,
            [key]: ref,
          }), {}),
        [props],
      )
      const snaps = useInjected(mapSnapshots, refs)
      const { forwardedRef, ...rest } = props

      return (
        <WrappedComponent
          {...rest as P}
          {...snaps}
          ref={forwardedRef}
        />
      )
    }
    const C = hoistNonReactStatics(FirestoreConsumer, WrappedComponent)

    return forwardRef((props: P, ref) => <C forwardedRef={ref} {...props} />)
  }
}
