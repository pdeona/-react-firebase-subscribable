// @flow
import React, { useEffect } from 'react'
import type { ComponentType, StatelessFunctionalComponent } from 'react'
import type { FirebaseUser } from 'firebase/app'
import type { Auth } from 'firebase/auth'
import { diffRequiredProps } from './shared'


export type AuthSubscriberProps = {
  +firebaseAuth: Auth,
  +onAuthStateChanged: (?FirebaseUser) => void,
  +[key: string]: *, // additional props are passed through to WrappedComponent
}

// export default (WrappedComponent: ComponentType<*>) => class extends PureComponent<AuthSubscriberProps> {
//   authListener: ?() => void;

//   static displayName = `${
//     WrappedComponent.displayName || WrappedComponent.name
//   }withFirebaseAuthSubscription`

//   componentDidMount() {
//     if (process.env.NODE_ENV === 'development') {
      // diffRequiredProps(
      //   'withAuthSubscription',
      //   this.props,
      //   {
      //     propName: 'firebaseAuth',
      //     predicate: prop => typeof prop.onAuthStateChanged === 'function',
      //     message: 'firebaseAuth is required and should be a firebase app auth instance.',
      //   },
      //   {
      //     propName: 'onAuthStateChanged',
      //     propType: 'function'
      //   },
      // )
//     }
//     try {
//       const { firebaseAuth, onAuthStateChanged } = this.props

//       this.authListener = firebaseAuth.onAuthStateChanged(onAuthStateChanged)
//     } catch (error) {
//       if (process.env.NODE_ENV === 'development') {
//         console.error('Auth Subscription error: ', error)
//       }
//     }
//   }

//   componentWillUnmount() {
//     if (this.authListener) this.authListener()
//   }

//   render() {
//     return <WrappedComponent {...this.props} />
//   }
// }

/**
 * rewrite with React Hooks API
 */
export default function (WrappedComponent: ComponentType<*>): StatelessFunctionalComponent<AuthSubscriberProps> {
  return function (props: AuthSubscriberProps): Element<AuthSubscriberProps> {
    diffRequiredProps(
      'withAuthSubscription',
      props,
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
    const { firebaseAuth, onAuthStateChanged } = props
    useEffect(
      // useEffect hooks that return a function are invoked on unmount,
      // just like componentWillUnmount
      () => firebaseAuth.onAuthStateChanged(onAuthStateChanged),
      [],
    )

    return <WrappedComponent {...props} />
  }
}
