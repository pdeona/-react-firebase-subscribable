import React, { Component } from 'react'
import renderer from 'react-test-renderer'
import { AuthSubscriber } from './helpers'

const realConsole = console.log

global.console = {
  error: jest.fn(),
  log: jest.fn(),
}

const cleanup = jest.fn()

const firebase = {
  auth: jest.fn(() => ({
    onAuthStateChanged: jest.fn((cb) => {
      cb('user')
      return cleanup
    }),
  }))
}

describe('test withAuthSubscription', () => {
  it('checks for required props', () => {
    /**
     * logs only in development
     */
    process.env.NODE_ENV = 'development'
    const invalid = renderer.create(<AuthSubscriber />)
    const string = invalid.toJSON()

    expect(console.error).toBeCalledTimes(3)
    // still renders without required props - no raised exception
    expect(string).toEqual('Not signed in')
    process.env.NODE_ENV = 'test'
  })

  it('receives updates from firebase', () => {
    const listener = jest.fn()
    const auth = firebase.auth()
    const p = renderer.create(
      <AuthSubscriber onSnapshot={listener} firebaseAuth={auth} />
    )
    const tree = p.toTree()
    tree.instance.componentDidMount()
    expect(auth.onAuthStateChanged).toBeCalledWith(listener)
    expect(listener).toBeCalled()
    tree.instance.componentWillUnmount()
  })

  it('cleans up firebase auth listener on unmount', () => {
    const cleanup = jest.fn()
    const listener = jest.fn(() => cleanup)
    const auth = firebase.auth()
    const valid = renderer.create(
      <AuthSubscriber 
        onAuthStateChanged={listener}
        firebaseAuth={auth}
      />
    )
    const tree = valid.toTree()

    const instance = tree.instance
    expect(auth.onAuthStateChanged).toBeCalledWith(listener)
    expect(typeof instance.authListener).toBe('function')
    instance.componentWillUnmount()
    expect(instance.authListener).toBeCalled()
  })
})
