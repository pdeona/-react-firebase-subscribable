// @flow
import React, { createContext, PureComponent } from 'react'
import type {
  FirestoreReference,
  FirestoreProviderProps,
  FirestoreProviderState,
  FirestoreCtx,
} from 'react-firebase-subscribable'

export const FirestoreContext = createContext<FirestoreCtx>({
  snapshots: {},
  injectRef: () => {},
})

export default class FirestoreProvider extends PureComponent<FirestoreProviderProps, FirestoreProviderState> {
  mounted: boolean;

  unsubscribe: () => void;

  constructor(props: FirestoreProviderProps) {
    super(props)
    this.mounted = false
    this.state = {
      snapshots: {}, // eslint-disable-line react/no-unused-state
      injectRef: this.injectRef, // eslint-disable-line react/no-unused-state
    }
  }

  injectRef = (key: string, ref: FirestoreReference): void => {
    const { refMap } = this.props
    refMap.injectRef({ key, ref })
  }

  componentDidMount() {
    this.mounted = true
    this.subscribe()
  }

  componentDidUpdate(prevProps: FirestoreProviderProps) {
    const { refMap } = this.props
    if (refMap !== prevProps.refMap) {
      if (this.unsubscribe) this.unsubscribe()

      this.subscribe()
    }
  }

  componentWillUnmount() {
    if (this.unsubscribe) this.unsubscribe()
    this.mounted = false
  }

  subscribe = (): void => {
    const { refMap } = this.props

    this.unsubscribe = refMap.subscribe(() => {
      if (!this.mounted) return

      const newSnapshotState = refMap.getState()
      this.setState(state => {
        if (newSnapshotState === state.snapshots) {
          return null
        }
        return { snapshots: newSnapshotState }
      })

      // handle dispatches sent since we updated
      const postUpdateState = refMap.getState()
      this.setState(state => {
        if (postUpdateState === state.snapshots) {
          return null
        }
        return { snapshots: postUpdateState }
      })
    })
  }

  render() {
    const { children } = this.props
    return (
      <FirestoreContext.Provider value={this.state}>
        {children}
      </FirestoreContext.Provider>
    )
  }
}
