import React, { PureComponent, type ComponentType } from 'react'
import hoistNonReactStatics from 'hoist-non-react-statics'
import type { FirebaseUser } from 'firebase/app'
import { AuthContext } from './AuthProvider'

type MapAuthStateFn = (u: ?FirebaseUser) => ({ [key: string]: * })

export default (mapAuthStateToProps: MapAuthStateFn) => (WrappedComponent: ComponentType<*>) => {
  class AuthConsumerHOC extends PureComponent {
    static displayName = `authStateConnected${
      WrappedComponent.displayName || WrappedComponent.name
    }`

    static contextType = AuthContext

    render() {
      return (
        <AuthContext.Consumer>
          {user => (
            <WrappedComponent {...mapAuthStateToProps(user)} {...this.props} />
          )}
        </AuthContext.Consumer>
      )
    }
  }

  return hoistNonReactStatics(AuthConsumerHOC, WrappedComponent)
}
