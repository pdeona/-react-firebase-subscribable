// @flow
import React, { createContext, PureComponent, type Node } from 'react'
import type { FirebaseUser } from 'firebase/app'
import type { Auth } from 'firebase/auth'
import { diffRequiredProps } from './shared'

type AuthProviderProps = {
  +firebaseAuth: Auth,
  +onAuthStateChanged: ?AuthStateHandler,
  +children: Node,
}

type AuthProviderState = {
  +user: ?FirebaseUser,
}

export const AuthContext = createContext<?FirebaseUser>(null)

export default class FirebaseAuthProvider extends PureComponent<AuthProviderProps, AuthProviderState> {
  unsubscribe: ?() => void;

  state = {
    user: null,
  }

  onAuthStateChanged: AuthStateHandler = user => {
    const { onAuthStateChanged } = this.props
    this.setState(
      () => ({ user }),
      () => onAuthStateChanged && onAuthStateChanged(user),
    )
  }

  componentDidMount() {
    if (process.env.NODE_ENV === 'development') {
      diffRequiredProps(
        'AuthProvider',
        this.props,
        {
          propName: 'firebaseAuth',
          predicate: prop => (prop
            && typeof prop.onAuthStateChanged === 'function'),
          message: 'firebaseAuth is required and should be a firebase app auth instance.',
        },
      )
    }
    try {
      const { firebaseAuth } = this.props

      this.unsubscribe = firebaseAuth.onAuthStateChanged(this.onAuthStateChanged)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Auth Subscription error: ', error)
      }
    }
  }

  componentWillUnmount() {
    if (this.unsubscribe) this.unsubscribe()
  }

  render() {
    const { children } = this.props
    const { user } = this.state
    return (
      <AuthContext.Provider value={user}>
        {children}
      </AuthContext.Provider>
    )
  }
}
