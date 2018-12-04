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

  const mockRef = () => mockFirestore().collection('pants')
    .doc('my-pants')

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
})
