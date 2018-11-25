// @flow
import React, { createContext, PureComponent, type Node } from 'react'
import type {
  ObservableRefMap,
  FirestoreReference,
  SnapshotMap,
} from '@internal/types'

type FirestoreProviderProps = {
  +refMap: ObservableRefMap,
  +children: Node,
}

type FirestoreProviderState = {
  +snapshots: SnapshotMap,
  +injectRef: (key: string, ref: FirestoreReference) => void,
}

export const FirestoreContext = createContext<{}>({
  refMap: {},
  snapshots: {},
  injectRef: () => {},
})

export default class FirestoreProvider extends PureComponent<FirestoreProviderProps, FirestoreProviderState> {
  mounted: boolean;

  listeners: {
    [key: string]: ?(() => void),
  };

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

  subscribe = () => {
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
