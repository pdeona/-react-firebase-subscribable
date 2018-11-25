// @flow
import React, { PureComponent, type ComponentType } from 'react'
import hoistNonReactStatics from 'hoist-non-react-statics'
import type { Auth } from 'firebase/auth'
import { diffRequiredProps } from './shared'

export type AuthSubscriberProps = {
  +firebaseAuth: Auth,
  +onAuthStateChanged: AuthStateHandler,
}

export default (WrappedComponent: ComponentType<*>) => {
  class withAuthSub extends PureComponent<AuthSubscriberProps> {
    authListener: ?() => void;

    static displayName = `${
      WrappedComponent.displayName || WrappedComponent.name
    }withFirebaseAuthSubscription`

    componentDidMount() {
      if (process.env.NODE_ENV === 'development') {
        diffRequiredProps(
          'withAuthSubscription',
          this.props,
          {
            propName: 'firebaseAuth',
            predicate: prop => (prop
              && typeof prop.onAuthStateChanged === 'function'),
            message: 'firebaseAuth is required and should be a firebase app auth instance.',
          },
          {
            propName: 'onAuthStateChanged',
            propType: 'function'
          },
        )
      }
      try {
        const { firebaseAuth, onAuthStateChanged } = this.props

        this.authListener = firebaseAuth.onAuthStateChanged(onAuthStateChanged)
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Auth Subscription error: ', error)
        }
      }
    }

    componentWillUnmount() {
      if (this.authListener) this.authListener()
    }

    render() {
      return <WrappedComponent {...this.props} />
    }
  }

  return hoistNonReactStatics(withAuthSub, WrappedComponent)
}
