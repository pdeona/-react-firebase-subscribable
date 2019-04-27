// @flow
import React, {
  forwardRef,
  useEffect,
  ComponentType,
  Ref,
} from 'react'
import hoistNonReactStatics from 'hoist-non-react-statics'
import { ForwardedRef, FSRef, FSSnap } from '../types'

type FirestoreSubscribableProps<C> = {
  firestoreRef: FSRef | null,
  onSnapshot: (s: FSSnap | null) => void,
} & ForwardedRef<C>

function withFirestoreSubscription<P extends object>(
  WrappedComponent: ComponentType<P>,
) {
  type CProps = P & FirestoreSubscribableProps<ComponentType<P>>
  function WithFSSub({
    firestoreRef,
    onSnapshot,
    forwardedRef,
    ...rest
  }: CProps) {
    useEffect(() => {

    }, [firestoreRef, onSnapshot])

    return <WrappedComponent {...rest as P} />
  }

  const C = hoistNonReactStatics(WithFSSub, WrappedComponent)
  return forwardRef((
    props: CProps,
    ref: Ref<ComponentType<P>>,
  ) => <C {...props} forwardedRef={ref} />)
}

export default withFirestoreSubscription
