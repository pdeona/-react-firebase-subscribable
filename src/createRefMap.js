// @flow
import type {
  RefMap,
  ObservableRefMap,
  InjectedRef,
  SnapshotMap,
  StateObserver,
  SnapshotListenerMap,
} from '@internal/types'

/**
 * Implement a basic observable ref snapshot store, to allow for dynamic ref
 * injection
 */
export default function createObservableRefMap(
  initialRefs: RefMap = {}
): ObservableRefMap {
  let id = 0
  let currentRefs: RefMap = initialRefs
  let snapshotState: SnapshotMap = {}
  let stateSubs: StateObserver[] = []
  let snapshotListeners: SnapshotListenerMap = {}

  function dispatch({ key, snap }) {
    const newState = Object.assign({}, snapshotState, { [key]: snap })
    snapshotState = newState
    stateSubs.forEach(listener => {
      listener.observer()
    })
  }

  function unsub(unsubscribe: ?() => void) {
    if (typeof unsubscribe === 'function') {
      unsubscribe()
    }
  }

  snapshotListeners = Object.keys(initialRefs)
    .reduce((acc, key) => Object.assign(acc, {
      [key]: initialRefs[key]
        && initialRefs[key].onSnapshot(snap => dispatch({ key, snap })),
    }), {})

  function getState() {
    return snapshotState
  }

  function subscribe(observer: () => void) {
    const subscription = { id: id++, observer } // eslint-disable-line no-plusplus
    stateSubs = stateSubs.concat(subscription)
    return function unsubscribe() {
      stateSubs = stateSubs.splice(stateSubs.indexOf(subscription), 1)
      // tear down listeners if no subs left
      if (stateSubs.length === 0) {
        Object.keys(snapshotListeners).forEach(key => {
          unsub(snapshotListeners[key])
        })
        snapshotListeners = {}
      }
    }
  }

  function injectRef({ key, ref }: InjectedRef) {
    if (Reflect.has(currentRefs, key) && currentRefs[key] === ref) {
      return
    }
    currentRefs = Object.assign({}, initialRefs, { [key]: ref })
    if (Reflect.has(snapshotListeners, key)) {
      unsub(snapshotListeners[key])
    }
    snapshotListeners = Object.assign(
      {},
      snapshotListeners,
      { [key]: ref && ref.onSnapshot(snap => dispatch({ key, snap })) },
    )
  }

  return {
    getState,
    subscribe,
    injectRef,
  }
}
