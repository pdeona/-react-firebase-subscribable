import React from 'react'
import { mount } from 'enzyme'
import {
  mockFirestore,
  mockSnapshot,
} from './helpers'
import { connectFirestore, createRefMap, FirestoreProvider } from '../src'

describe('connectFirestore tests', () => {
  let app
  function Root({ children, refMap }) {
    return (
      <FirestoreProvider refMap={refMap}>
        {children}
      </FirestoreProvider>
    )
  }

  function Dummy() {
    return (<div></div>)
  }

  const mockRef = (docID = 'my-pants') => mockFirestore().collection('pants')
    .doc(docID)

  test('it maps snapshots to props', () => {
    const Connected = connectFirestore(s => s)(Dummy)
    app = mount(
      <Root refMap={createRefMap({ reference: mockRef() })}>
        <Connected />
      </Root>
    )
    const node = app.find(Connected).find(Dummy).get(0)
    expect(node.props).toHaveProperty('reference', mockSnapshot)
  })

  test('it accepts null for map snapshots to props', () => {
    const Connected = connectFirestore(null)(Dummy)
    app = mount(
      <Root refMap={createRefMap({ reference: mockRef() })}>
        <Connected />
      </Root>
    )
    const node = app.find(Connected).find(Dummy).get(0)
    expect(node.props).toEqual({})
  })

  test('it injects refs into the store', () => {
    const Connected = connectFirestore(snaps => snaps, {
      key: 'mock',
      ref: ({ user }) => mockRef(user.id),
    })(Dummy)
    app = mount(
      <Root refMap={createRefMap()}>
        <Connected user={{ id: 1 }} />
      </Root>
    )
    const node = app.find(Connected).find(Dummy).get(0)
    expect(node.props).toEqual({ mock: mockSnapshot, user: { id: 1 } })
  })

  test('it memoizes props when specified', () => {
    const mockRefFn = jest.fn(id => mockRef(id))
    const Connected = connectFirestore(snaps => snaps, {
      key: 'mock',
      ref: mockRefFn,
      memoizedProps: ['user'],
    })(Dummy)
    const user = { id: 1 }
    app = mount(
      <Root refMap={createRefMap()}>
        <Connected user={user} />
      </Root>
    )
    expect(mockRefFn).toBeCalledTimes(1)
    user.id = 1
    expect(mockRefFn).toBeCalledTimes(1)
    const node = app.find(Connected).find(Dummy).get(0)
    expect(node.props).toEqual({ mock: mockSnapshot, user: { id: 1 } })
  })
})
