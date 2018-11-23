// @flow
import React, { PureComponent } from 'react'
import type { ComponentType } from 'react'
import type {
  DocumentReference,
  CollectionReference,
  DocumentSnapshot,
  QuerySnapshot,
} from 'firebase/firestore'
import { diffRequiredProps } from './shared'

export type FirestoreSubProps = {
  +firestoreRef: (?DocumentReference | ?CollectionReference),
  +onSnapshot: (?DocumentSnapshot | ?QuerySnapshot) => void,
}

export default (WrappedComponent: ComponentType<*>) => class extends PureComponent<FirestoreSubProps> {
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
