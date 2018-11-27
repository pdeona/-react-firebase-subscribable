import $observable from 'symbol-observable'
import {
  mockFirestore,
  mockCleanup,
  mockSnapshot,
} from './helpers'
import { createRefMap } from '../src'

describe('createRefMap tests', () => {
  const emitter = jest.fn()
  let refMap
  let unsubscribe
  const subscribe = (emit, store = refMap) => () => {
    emit(store.getState())
  }
  let ref

  beforeEach(() => {
    ref = mockFirestore().collection('pants')
      .doc('my-pants')
    refMap = createRefMap()
    unsubscribe = refMap.subscribe(subscribe(emitter))
  })

  afterEach(() => {
    if (typeof unsubscribe === 'function') unsubscribe()
  })

  test('it sends a state update on subscription', () => {
    unsubscribe()
    const unsub = refMap.subscribe(subscribe(emitter))
    expect(emitter).toBeCalledWith({})
    unsub()
  })

  test('it sends a state update on snapshot', () => {
    unsubscribe()
    const thisEmitter = jest.fn()
    const unsub = refMap.subscribe(subscribe(thisEmitter))
    expect(thisEmitter).toBeCalledWith({})
    const onSnap = jest.fn(cb => {
      cb(mockSnapshot)
      return mockCleanup
    })
    const thisRef = {
      onSnapshot: onSnap,
    }
    refMap.injectRef({ key: 'mockRef', ref: thisRef })
    expect(onSnap).toBeCalledTimes(1)
    expect(thisEmitter).toBeCalledWith({ mockRef: mockSnapshot })
    unsub()
  })

  test('it can be initialized with refs', () => {
    unsubscribe()
    const thisRefMap = createRefMap({
      mockRef: ref,
    })
    expect(ref.onSnapshot).toBeCalled()
    expect(thisRefMap.getState()).toEqual({
      mockRef: mockSnapshot,
    })
    const thisEmitter = jest.fn()
    const unsub = thisRefMap.subscribe(subscribe(thisEmitter, thisRefMap))
    expect(thisEmitter).toBeCalledWith(thisRefMap.getState())
    unsub()
  })

  test('it updates subscribers whenever a ref is injected', () => {
    refMap.injectRef({ key: 'emptyRef', ref: null })
    expect(emitter).toBeCalledWith({})
    refMap.injectRef({ key: 'mockRef', ref })
    expect(ref.onSnapshot).toBeCalled()
    expect(emitter).toBeCalledWith({ mockRef: mockSnapshot })
  })

  test('does nothing if ref exists already on inject', () => {
    unsubscribe()
    let lastState
    const thisEmitter = jest.fn(() => {
      lastState = refMap.getState()
    })
    const thisRef = mockFirestore().collection('different-pants')
      .doc('my-pants')
    unsubscribe = refMap.subscribe(subscribe(thisEmitter))
    refMap.injectRef({ key: 'mockRef', ref: thisRef })
    expect(lastState).toEqual({ mockRef: mockSnapshot })
    refMap.injectRef({ key: 'mockRef', ref: thisRef })
    expect(thisRef.onSnapshot).toBeCalledTimes(1)
    expect(lastState).toEqual({ mockRef: mockSnapshot })
  })

  test(
    'it tears down/reinits listeners on reinjection of new ref at same key',
    () => {
      const cleanup = jest.fn()
      const thisRef = () => ({
        onSnapshot: () => cleanup,
      })
      refMap.injectRef({ key: 'mockRef', ref: thisRef() })
      refMap.injectRef({ key: 'mockRef', ref: thisRef() })
      expect(cleanup).toBeCalledTimes(1)
    },
  )

  test('it doesnt try to unsubscribe from null refs', () => {
    refMap.injectRef({
      key: 'mockRef',
      ref: null,
    })
    expect(unsubscribe).not.toThrow()
  })

  test('it clears state for refs when they are removed', () => {
    refMap.injectRef({ key: 'mockRef', ref })
    expect(ref.onSnapshot).toBeCalled()
    expect(emitter).toBeCalledWith({ mockRef: mockSnapshot })
    refMap.injectRef({ key: 'mockRef', ref: null })
    expect(emitter).toBeCalledWith({ mockRef: null })
  })

  test('it tears down all listeners when last subscriber unsubs', () => {
    const cleanup = jest.fn()
    const thisRef = () => ({
      onSnapshot: () => cleanup,
    })
    refMap.injectRef({ key: 'mockRef', ref: thisRef() })
    unsubscribe()
    expect(cleanup).toBeCalled()
  })

  test('listeners stay up on unsub if other subs exist', () => {
    unsubscribe()
    const cleanup = jest.fn()
    const thisEmitter = jest.fn()
    const thisRef = () => ({
      onSnapshot: () => cleanup,
    })
    refMap.injectRef({ key: 'mockRef', ref: thisRef() })
    const unsub1 = refMap.subscribe(subscribe(emitter))
    const unsub2 = refMap.subscribe(subscribe(thisEmitter))
    unsub1()
    expect(cleanup).not.toBeCalled()
    unsub2()
  })

  test('it exposes an $observable interface', () => {
    unsubscribe()
    const observable = refMap[$observable]()
    expect(observable.subscribe).toBeInstanceOf(Function)
    expect(observable[$observable]).toBeInstanceOf(Function)
    expect(observable[$observable]()).toEqual(observable)
    const next = jest.fn()
    const { unsubscribe: unsub } = observable.subscribe({ next })
    expect(next).toBeCalledWith({})
    expect(unsub).toBeInstanceOf(Function)
    unsub()
  })

  test('$observable throws typeerror if observer is not an object', () => {
    unsubscribe()
    const observable = refMap[$observable]()
    const delayedCall = (fn, arg) => () => fn(arg)
    expect(delayedCall(observable.subscribe, null)).toThrowError(TypeError)
    expect(delayedCall(observable.subscribe, v => v)).toThrowError(TypeError)
    expect(delayedCall(observable.subscribe, {})).not.toThrowError(TypeError)
  })
})
