// @flow
import React, { PureComponent } from 'react'
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
    const { firebaseAuth, onAuthStateChanged } = this.props
    this.authListener = firebaseAuth.onAuthStateChanged(onAuthStateChanged)
  }

  componentWillUnmount() {
    if (this.authListener) this.authListener()
  }

  render() {
    return <WrappedComponent {...this.props} />
  }
}
