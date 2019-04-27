import React, {
  forwardRef,
  useEffect,
  ComponentType,
  Ref,
} from 'react'
import hoistNonReactStatics from 'hoist-non-react-statics'
import { DBRef, DBSnap, DBEventType, ForwardedRef } from '../types'
import { useMemoizedProps } from '../shared';

type RTDatabaseSubscriberProps<C> = {
  firebaseRef: DBRef,
  eventType: DBEventType,
  onSnapshot: (d: DBSnap) => void,
} & ForwardedRef<C>

function withRTDBSubscription<P extends object>(WrappedComponent: ComponentType<P>) {
  type CProps = P & RTDatabaseSubscriberProps<ComponentType<P>>
  function WithRTDBSub(props: CProps) {
    const {
      firebaseRef,
      onSnapshot,
      eventType = 'value',
      forwardedRef,
      rest
    } = useMemoizedProps(
      props,
      ['firebaseRef', 'onSnapshot', 'eventType', 'forwardedRef'],
    )
    useEffect(() => {
      if (firebaseRef) {
        firebaseRef.on(eventType, onSnapshot)
        return firebaseRef.off(eventType, onSnapshot)
      }
    }, [eventType, firebaseRef, onSnapshot])
    return (
      <WrappedComponent {...rest as P} ref={forwardedRef} />
    )
  }


  const C = hoistNonReactStatics(WithRTDBSub, WrappedComponent)
  return forwardRef((
    props: CProps,
    ref: Ref<ComponentType<P>>,
  ) => <C {...props} forwardedRef={ref} />)
}

export default withRTDBSubscription
