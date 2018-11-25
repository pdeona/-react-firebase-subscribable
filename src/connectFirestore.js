import React, { PureComponent, type ComponentType } from 'react'
import hoistNonReactStatics from 'hoist-non-react-statics'
import { FirestoreContext, type SnapshotStateMap } from './FirestoreProvider'

type MapFirestoreFn = (s: SnapshotStateMap) => ({ [key: string]: * })

export default (mapSnapshotsToProps: MapFirestoreFn) => (WrappedComponent: ComponentType<*>) => {
  class FirestoreConsumerHOC extends PureComponent {
    static displayName = `firestoreConnected${
      WrappedComponent.displayName || WrappedComponent.name
    }`

    render() {
      return (
        <FirestoreContext.Consumer>
          {snaps => (
            <WrappedComponent {...mapSnapshotsToProps(snaps)} {...this.props} />
          )}
        </FirestoreContext.Consumer>
      )
    }
  }

  return hoistNonReactStatics(FirestoreConsumerHOC, WrappedComponent)
}
