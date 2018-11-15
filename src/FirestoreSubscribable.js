// @flow
import React, { PureComponent } from 'react'
import { diffRequiredProps } from './shared'
import type { ComponentType } from 'react'
import type {
  DocumentReference,
  QueryReference,
  DocumentSnapshot,
  QuerySnapshot,
} from 'firebase/firestore'

export type FirestoreSubProps = {
  +firestoreRef: (?DocumentReference | ?QueryReference),
  +onSnapshot: (?DocumentSnapshot | ?QuerySnapshot) => void,
}

export default (WrappedComponent: ComponentType<*>) => class extends PureComponent<FirestoreSubProps> {
  refListener: ?() => void;

  static displayName = `${
    WrappedComponent.displayName || WrappedComponent.name
  }withFirestoreSubscription`

  initRefListener = ({ firestoreRef, onSnapshot }: FirestoreSubProps) => {
    try {
      if (!firestoreRef) return;

      if (this.refListener) this.refListener()
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
        ['onSnapshot', 'function'],
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
