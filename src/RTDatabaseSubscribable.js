// @flow
import React, { PureComponent } from 'react'
import { diffRequiredProps } from './shared'
import type { ComponentType } from 'react'
import type {
  DataSnapshot,
  Reference,
} from 'firebase/database'

type RTDBEventType = 'value' 
  | 'child_added'
  | 'child_changed'
  | 'child_removed'
  | 'child_moved'

type RTDatabaseSubscriberProps = {
  firebaseRef: Reference,
  eventType: RTDBEventType,
  onSnapshot: (d: DataSnapshot) => void,
}

export default (WrappedComponent: ComponentType<*>) => class extends PureComponent<RTDatabaseSubscriberProps> {
  refListener: ?() => void;

  static displayName = `${
    WrappedComponent.displayName || WrappedComponent.name
  }withRTDBSubscription`

  initRefListener = ({ firebaseRef, onSnapshot, eventType = 'value' }: RTDatabaseSubscriberProps) => {
    try {
      if (!firebaseRef) return;

      firebaseRef.on(eventType, onSnapshot)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Firebase RTDB Subscription error: ', error)
      }
    }
  }

  componentDidMount(): void {
    if (process.env.NODE_ENV === 'development') {
      diffRequiredProps(
        'withRTDBSubscription',
        this.props,
        {
          propName: 'onSnapshot',
          propType: 'function',
        },
      )
    }
    const { firebaseRef, onSnapshot, eventType } = this.props
    this.initRefListener({ firebaseRef, onSnapshot, eventType })
  }

  componentDidUpdate(prevProps: RTDatabaseSubscriberProps): void {
    const { firebaseRef, onSnapshot, eventType } = this.props
    if (prevProps.firebaseRef !== firebaseRef) {
      if (prevProps.firebaseRef) prevProps.firebaseRef.off(eventType, onSnapshot)
      this.initRefListener({ firebaseRef, onSnapshot, eventType })
    }
  }

  componentWillUnmount(): void {
    const { firebaseRef, onSnapshot, eventType } = this.props
    if (firebaseRef) firebaseRef.off(eventType, onSnapshot)
  }

  render() {
    return <WrappedComponent {...this.props} />
  }
}