import React, { Ref, ComponentType, forwardRef, useMemo } from 'react'
import hoistNonReactStatics from 'hoist-non-react-statics'
import { UserInfo } from 'firebase'
import { useAuth } from './AuthProvider'
import { ForwardedRef } from '../types'

type MapAuthStateFn = (u?: UserInfo) => ({ [key: string]: any })

export default function connectAuth<P extends object>(mapAuthStateToProps: MapAuthStateFn) {
  type CProps = P & ForwardedRef<ComponentType<P>>
  return function enhance(WrappedComponent: ComponentType<P>) {
    function AuthConsumer({ forwardedRef, ...rest }: CProps) {
      const user = useAuth()
      const authProps = useMemo(() => mapAuthStateToProps(user), [user])
      return (
        <WrappedComponent
          {...rest as P}
          {...authProps}
          ref={forwardedRef}
        />
      )
    }

    const C = hoistNonReactStatics(AuthConsumer, WrappedComponent)
    return forwardRef((props: CProps, ref: Ref<ComponentType<P>>) => (
      <C {...props} forwardedRef={ref} />
    ))
  }
}
