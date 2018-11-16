// @flow
import React, { PureComponent } from 'react'
import { diffRequiredProps } from './shared'
import type { ComponentType } from 'react'
import type { FirebaseUser } from 'firebase/app'
import type { Auth } from 'firebase/auth'


export type AuthSubscriberProps = {
  +firebaseAuth: Auth,
  +onAuthStateChanged: (?FirebaseUser) => void,
}

export default (WrappedComponent: ComponentType<*>) => class extends PureComponent<AuthSubscriberProps> {
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
          predicate: prop => typeof prop.onAuthStateChanged === 'function',
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
