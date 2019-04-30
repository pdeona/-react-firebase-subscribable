import React, {
  useMemo,
  ComponentType,
  forwardRef,
} from 'react'
import hoistNonReactStatics from 'hoist-non-react-statics'
import useInjected from '../hooks/useInjected'
import {
  MapFirestoreFn,
  RefToInj,
  ForwardedRef,
} from '../types'
import { comp2, getProp } from '../shared'

export default function connectFirestore<P extends object>(mapSnapshotsToProps: MapFirestoreFn, ...injectedRefs: RefToInj<P>[]) {
  const mapSnapshots = typeof mapSnapshotsToProps === 'function'
    ? mapSnapshotsToProps : () => ({})
  return function enhance(WrappedComponent: ComponentType<P>) {
    function FirestoreConsumer(props: P & ForwardedRef<ComponentType<P>>) {
      const refs = useMemo(() => injectedRefs.map(({ key, ref }) => ({
        key,
        ref: typeof ref === 'function'
          ? ref(props)
          : ref,
      })).filter(comp2(Boolean, getProp('ref'))), [props])
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
