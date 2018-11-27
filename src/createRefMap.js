// @flow
import $observable from 'symbol-observable'
import type {
  RefMap,
  ObservableRefMap,
  SnapshotMap,
  SnapshotListenerMap,
  StateObserver,
  Observer,
  Observable,
  Dispatch,
  UpdateSnapshotActn,
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

  const dispatch: Dispatch = ({ key, snap }) => {
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

  function subscribe(observer) {
    const subscription: StateObserver = { id: id++, observer } // eslint-disable-line no-plusplus
    stateSubs = stateSubs.concat(subscription)
    subscription.observer()
    return function unsubscribe() {
      stateSubs.splice(stateSubs.indexOf(subscription), 1)
      // tear down listeners if no subs left
      if (stateSubs.length === 0) {
        Object.keys(snapshotListeners).forEach(key => {
          unsub(snapshotListeners[key])
        })
        snapshotListeners = {}
      }
    }
  }

  function injectRef({ key, ref }) {
    if (Reflect.has(currentRefs, key) && currentRefs[key] === ref) {
      return
    }
    currentRefs = Object.assign({}, initialRefs, { [key]: ref })
    /**
     * the ref has changed, unsubscribe the old listener
     */
    if (Reflect.has(snapshotListeners, key)) {
      unsub(snapshotListeners[key])
    }
    /**
     * clear the snapshot from
     * state if the ref is null
     * but we have a snap stored
     */
    if (Reflect.has(snapshotState, key) && !ref) {
      const action: UpdateSnapshotActn = { key, snap: null }
      dispatch(action)
    }
    snapshotListeners = Object.assign(
      {},
      snapshotListeners,
      { [key]: ref && ref.onSnapshot(snap => dispatch({ key, snap })) },
    )
  }

  /**
   * Interoperability point for observable/reactive libraries.
   */
  function observable() {
    const subs = subscribe
    return {
      subscribe(observer: Observer<SnapshotMap>) {
        if (typeof observer !== 'object' || observer === null) {
          throw new TypeError('Expected the observer to be an object.')
        }

        function observe() {
          if (observer.next) {
            observer.next(getState())
          }
        }

        const unsubscribe = subs(observe)
        return { unsubscribe }
      },
      [$observable](): Observable<SnapshotMap> {
        return this
      }
    }
  }

  return {
    getState,
    subscribe,
    injectRef,
    [$observable]: observable,
  }
}
