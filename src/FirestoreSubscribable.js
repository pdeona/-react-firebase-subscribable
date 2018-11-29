// @flow
import React, { PureComponent, type ComponentType } from 'react'
import hoistNonReactStatics from 'hoist-non-react-statics'
import type {
  FirestoreReference,
  FirestoreSnapHandler,
} from 'react-firebase-subscribable'
import { diffRequiredProps } from './shared'

export type FirestoreSubProps = {
  +firestoreRef: ?FirestoreReference,
  +onSnapshot: FirestoreSnapHandler,
}

export default (WrappedComponent: ComponentType<*>) => {
  class withFirestoreSub extends PureComponent<FirestoreSubProps> {
    refListener: ?() => void;

    static displayName = `${
      WrappedComponent.displayName || WrappedComponent.name
    }withFirestoreSubscription`

    initRefListener = ({ firestoreRef, onSnapshot }: FirestoreSubProps) => {
      try {
        if (this.refListener) this.refListener()
        if (!firestoreRef) return

        this.refListener = firestoreRef.onSnapshot(onSnapshot)
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Firestore Subscription error: ', error)
        }
      }
    }

    componentDidMount() {
      if (process.env.NODE_ENV === 'development') {
        diffRequiredProps(
          'withFirestoreSubscription',
          this.props,
          {
            propName: 'onSnapshot',
            propType: 'function',
          },
        )
      }
      const { firestoreRef, onSnapshot } = this.props
      this.initRefListener({ firestoreRef, onSnapshot })
    }

    componentDidUpdate(prevProps: FirestoreSubProps) {
      const { firestoreRef, onSnapshot } = this.props
      if (prevProps.firestoreRef !== firestoreRef) {
        this.initRefListener({ firestoreRef, onSnapshot })
      }
    }

    componentWillUnmount() {
      if (this.refListener) this.refListener()
    }

    render() {
      return <WrappedComponent {...this.props} />
    }
  }

  return hoistNonReactStatics(withFirestoreSub, WrappedComponent)
}
