// @flow
import React, { createContext, PureComponent, type Node } from 'react'

export type RefMap = {
  [key: string]: ?FirestoreReference,
}

export type SnapshotStateMap = $ObjMap<RefMap, (s: FirestoreSnapshot) => FirestoreSnapshot>

type FirestoreProviderProps = {
  +refMap: RefMap,
  +children: Node,
}

type FirestoreProviderState = SnapshotStateMap

export const FirestoreContext = createContext<{}>({})

export default class FirestoreProvider extends PureComponent<FirestoreProviderProps, FirestoreProviderState> {
  listeners: {
    [key: string]: ?() => void,
  }

  state = {}

  onSnap: (key: string) => FirestoreSnapHandler = key => snap => {
    this.setState(() => ({ [key]: snap }))
  }

  componentDidMount() {
    const { refMap } = this.props

    this.listeners = Object.keys(refMap).reduce((acc, key) => (refMap[key]
      ? { ...acc, [key]: refMap[key].onSnapshot(this.onSnap(key)) }
      : acc), {})
  }

  componentDidUpdate(prevProps: FirestoreProviderProps) {
    const { refMap } = this.props
    if (prevProps.refMap !== refMap) {
      const oldRefNames = Object.keys(prevProps.refMap)
      const refNames = oldRefNames
        .concat(Object.keys(refMap).filter(name => !oldRefNames.includes(name)))
      refNames.forEach(key => {
        if (refMap[key] !== prevProps.refMap[key]) {
          if (this.listeners[key]) this.listeners[key]()
          this.listeners[key] = refMap[key]
            ? refMap[key].onSnapshot(this.onSnap(key))
            : null
        }
      })
    }
  }

  componentWillUnmount() {
    Object.keys(this.listeners).forEach(key => {
      if (this.listeners[key]) this.listeners[key]()
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
