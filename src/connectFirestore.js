import React, { PureComponent, type ComponentType } from 'react'
import hoistNonReactStatics from 'hoist-non-react-statics'
import { FirestoreContext } from './FirestoreProvider'

type MapFirestoreFn = (s: SnapshotMap) => ({ [key: string]: * })

export default (mapSnapshotsToProps: MapFirestoreFn, ...injectedRefs: InjectedRef[]) => (WrappedComponent: ComponentType<*>) => {
  /**
   * allow ref injection without mapping snaps to props
   */
  const mapSnapshots = typeof mapSnapshotsToProps === 'function'
    ? mapSnapshotsToProps : () => ({})
  class FirestoreConsumerHOC extends PureComponent {
    static displayName = `firestoreConnected${
      WrappedComponent.displayName || WrappedComponent.name
    }`

    static contextType = FirestoreContext

    injectRef = ({ key, ref }) => {
      const { injectRef } = this.context
      if (typeof ref === 'function') injectRef(key, ref(this.props))
      else injectRef(key, ref)
    }

    removeInjected = ({ key }) => {
      const { injectRef } = this.context
      injectRef(key, null)
    }

    updateInjected = ({ key, ref }) => {
      if (typeof ref === 'function') this.injectRef({ key, ref })
    }

    componentDidMount() {
      injectedRefs.forEach(this.injectRef)
    }

    componentDidUpdate(prevProps) {
      if (prevProps !== this.props) injectedRefs.forEach(this.updateInjected)
    }

    componentWillUnmount() {
      injectedRefs.forEach(this.removeInjected)
    }

    render() {
      return (
        <FirestoreContext.Consumer>
          {({ snapshots: snaps }) => (
            <WrappedComponent {...mapSnapshots(snaps)} {...this.props} />
          )}
        </FirestoreContext.Consumer>
      )
    }
  }

  return hoistNonReactStatics(FirestoreConsumerHOC, WrappedComponent)
}
