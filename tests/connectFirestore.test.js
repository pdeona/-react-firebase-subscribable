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

  const mockRef = (docID = 'my-pants') => mockFirestore()
    .collection('pants')
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
    const mock = jest.fn(mockRef)
    const Connected = connectFirestore(snaps => snaps, {
      key: 'mock',
      ref: mock,
      memoizedProps: ['user'],
    })(Dummy)
    const user = { id: 1 }
    const App = ({ user }) => (
      <Root refMap={createRefMap()}>
        <Connected user={user} />
      </Root>
    )
    app = mount(
      <App user={user} />
    )
    const wrapper = app.find(App)
    const node = wrapper.find(Dummy).get(0)
    expect(mock).toBeCalledTimes(1)
    app.setProps({ user: { id: 1 } })
    expect(mock).toBeCalledTimes(1)
    app.setProps({ user: { id: 2 } })
    expect(mock).toBeCalledTimes(2)
  })
})
