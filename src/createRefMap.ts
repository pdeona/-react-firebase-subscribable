// @flow
import $observable from 'symbol-observable'
import {
  RefMap,
  ObservableStore,
  FSState,
  UpdateSnapshot,
  UpdateError,
  SnapshotListenerMap,
  StateObserver,
  FirestoreSnapHandler,
  ObserverFn,
  InjectedRef,
} from './types'
import { firestore } from 'firebase'

/**
 * Implement a basic observable ref snapshot store, to allow for dynamic ref
 * injection
 */

export default function createObservableRefMap(
  initialRefs: RefMap = {},
): ObservableStore {
  let id = 0
  let currentRefs: RefMap = initialRefs
  let snapshotState: FSState = {}
  let stateSubs: StateObserver[] = []
  let snapshotListeners: SnapshotListenerMap = {}

  // prevents issues where the stateSubscriptions array 
  // is mutated during dispatch iteration. see redux/create-store.js
  function ensureStateSubscribers() {
    return stateSubs.slice(0)
  }

  function dispatch({ key, ...payload }: UpdateSnapshot | UpdateError): void {
    const newState: FSState = { ...snapshotState, [key]: payload }
    snapshotState = newState
    const subscribers = ensureStateSubscribers()
    subscribers.forEach(sub => {
      sub.observer()
    })
  }

  function dispatchSnapshotUpdate(key: string): FirestoreSnapHandler {
    return function onSnap(snapshot) {
      const action: UpdateSnapshot = { key, snap: snapshot }
      dispatch(action)
    }
  }

  function dispatchErrorUpdate(key: string): (e: Error) => void {
    return function onError(error: Error) {
      const action: UpdateError = { key, error }
      dispatch(action)
    }
  }

  function reduceInitialRefs(refs: RefMap) {
    return (acc: SnapshotListenerMap, key: string) => {
      const ref = refs[key]
      const onSnapshot = dispatchSnapshotUpdate(key)
      const onError = dispatchErrorUpdate(key)
      return (ref ?
        {
          ...acc,
          [key]: (ref as firestore.CollectionReference).onSnapshot(onSnapshot),
        } : acc)
    }
  }

  function unsub(unsubscribe?: () => void) {
    if (typeof unsubscribe === 'function') {
      unsubscribe()
    }
  }

  snapshotListeners = Object.keys(initialRefs)
    .reduce(reduceInitialRefs(initialRefs), {})

  function getState() {
    return snapshotState
  }

  function subscribe(observer: () => void): () => void {
    const subscription: StateObserver = { id: id++, observer }
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

  function injectRef({ key, ref }: InjectedRef) {
    if (!key || typeof key !== 'string') {
      throw new TypeError('injectRef: "key" argument should be a string')
    }
    if (key in currentRefs && currentRefs[key] === ref) {
      return
    }
    currentRefs = { ...currentRefs, [key]: ref }
    /**
     * the ref has changed, unsubscribe the old listener
     */
    if (key in snapshotListeners) {
      unsub(snapshotListeners[key])
    }
    /**
     * clear the snapshot from
     * state if the ref is null
     * but we have a snap stored
     */
    if (!ref) {
      snapshotListeners = {
        ...snapshotListeners,
        [key]: null,
      }
      if (key in snapshotState) {
        const action: UpdateSnapshot = { key, snap: null }
        dispatch(action)
      }
    } else {
      snapshotListeners = {
        ...snapshotListeners,
        [key]: (ref as firestore.CollectionReference)
          .onSnapshot(dispatchSnapshotUpdate(key)),
      }
    }
  }

  /**
   * Interoperability point for observable/reactive libraries.
   */
  function observable() {
    const subs = subscribe
    return {
      subscribe(observer: { next: ObserverFn<FSState> }) {
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
      [$observable](): ObservableStore {
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
