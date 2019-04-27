// @flow
import React, { useEffect, ComponentType, forwardRef, Ref } from 'react'
import hoistNonReactStatics from 'hoist-non-react-statics'
import { auth, UserInfo } from 'firebase'
import { ForwardedRef } from '../types'
import { invariant, useMemoizedProps } from '../shared'

type AuthSubscriberProps<C> = {
  firebaseAuth: auth.Auth,
  onAuthStateChanged: (u?: UserInfo) => void,
} & ForwardedRef<C>

function withAuthSubscription<P extends object>(WrappedComponent: ComponentType<P>) {
  type CProps = P & AuthSubscriberProps<ComponentType<P>>
  function WithAuthSub(props: CProps) {
    const {
      firebaseAuth,
      onAuthStateChanged,
      forwardedRef,
      rest
    } = useMemoizedProps(
      props,
      ['firebaseAuth', 'onAuthStateChanged', 'forwardedRef'],
    )
    useEffect(() => {
      invariant(
        firebaseAuth && typeof firebaseAuth.onAuthStateChanged === 'function',
        'withAuthSubscription Props: firebaseAuth is required and should be a firebase app auth instance.',
      )
      return firebaseAuth.onAuthStateChanged(onAuthStateChanged)
    }, [firebaseAuth])
    return <WrappedComponent {...rest as P} ref={forwardedRef} />
  }

  const C = hoistNonReactStatics(WithAuthSub, WrappedComponent)
  return forwardRef((props: CProps, ref) => (
    <C forwardedRef={ref} {...props} />
  ))
}

export default withAuthSubscription
