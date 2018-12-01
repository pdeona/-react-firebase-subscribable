// @flow
import React, { createContext, PureComponent, type Node } from 'react'
import type { Auth } from 'firebase/auth'
import type {
  AuthStateHandler,
  AuthProviderProps,
  AuthProviderState,
} from 'react-firebase-subscribable'
import { diffRequiredProps } from './shared'

export const AuthContext = createContext(null)

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
          predicate: (prop: ?Auth) => (!!prop
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

  render(): Node {
    const { children } = this.props
    const { user } = this.state
    return (
      <AuthContext.Provider value={user}>
        {children}
      </AuthContext.Provider>
    )
  }
}
