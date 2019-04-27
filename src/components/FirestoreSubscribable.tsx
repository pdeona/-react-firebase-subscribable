// @flow
import React, {
  forwardRef,
  useEffect,
  useMemo,
  ComponentType,
  Ref,
} from 'react'
import hoistNonReactStatics from 'hoist-non-react-statics'
import { ForwardedRef, FSRef, FSSnap } from '../types'
import { firestore } from 'firebase'
import { useMemoizedProps } from '../shared';

type FirestoreSubscribableProps<C> = {
  firestoreRef: FSRef | null,
  onSnapshot: (s: FSSnap | null) => void,
  onError: (e: Error) => void,
} & ForwardedRef<C>

function withFirestoreSubscription<P extends object>(
  WrappedComponent: ComponentType<P>,
) {
  type CProps = P & FirestoreSubscribableProps<ComponentType<P>>
  function WithFSSub(props: CProps) {
    const {
      firestoreRef,
      onError,
      onSnapshot,
      forwardedRef,
      rest,
    } = useMemoizedProps(
      props,
      ['firestoreRef', 'onError', 'onSnapshot', 'forwardedRef'],
    )
    useEffect(() => {
      return (firestoreRef as firestore.DocumentReference)
        .onSnapshot(onSnapshot, onError)
    }, [firestoreRef, onSnapshot])

    return <WrappedComponent {...rest as P} ref={forwardedRef} />
  }

  const C = hoistNonReactStatics(WithFSSub, WrappedComponent)
  return forwardRef((
    props: CProps,
    ref: Ref<ComponentType<P>>,
  ) => <C {...props} forwardedRef={ref} />)
}

export default withFirestoreSubscription
