import React, { ReactNode } from 'react'
import { render, cleanup } from 'react-testing-library'
import { mockFirestore, connectedNode } from './helpers'
import { connectFirestore, FirestoreProvider } from '../src'
import * as snaps from './firestore.snaps'
import { RefMap } from '../src/types'

type RootProps = { children: ReactNode, refMap?: RefMap }
type DummyProps = {
  mock: any,
  user: any,
  [key: string]: any,
}

function Root({ children, refMap = {} }: RootProps) {
  return (
    <FirestoreProvider initialRefs={refMap}>
      {children}
    </FirestoreProvider>
  )
}

function Dummy({ mock, mock2, user }: DummyProps) {
  return (
    <div data-testid="connected">
      {mock ? mock.value.data() : ''}
      {mock2 ? mock2.value.data() : ''}
      {user ? user.id : ''}
    </div>
  )
}

const mapSnaps = s => s

describe('connectFirestore tests', () => {
  afterEach(cleanup)

  const mockRef = (docID = 'my-pants') => mockFirestore()
    .collection('pants')
    .doc(docID)

  test('it maps snapshots to props', () => {
    const Connected = connectFirestore<DummyProps>(
      mapSnaps,
    )(Dummy)
    const { getByTestId } = render(
      <Root refMap={{ mock: mockRef('mock') }}>
        <Connected />
      </Root>
    )
    const node = connectedNode(getByTestId)
    expect(node).toMatchInlineSnapshot(snaps.SNAP_DEFAULT_REF)
  })

  test('it accepts null for map snapshots to props', () => {
    const Connected = connectFirestore<DummyProps>(null)(Dummy)
    const { getByTestId } = render(
      <Root refMap={{ mock: mockRef('mock') }}>
        <Connected />
      </Root>
    )
    const node = connectedNode(getByTestId)
    expect(node).toMatchInlineSnapshot(snaps.SNAP_NULL_REF)
  })

  test('it injects refs into the store', () => {
    const Connected = connectFirestore<DummyProps>(
      mapSnaps,
      {
        key: 'mock',
        ref: () => mockRef('mock'),
      },
      {
        key: 'mock2',
        ref: mockRef('mock2'),
      },
    )(Dummy)
    const { getByTestId, rerender } = render(
      <Root>
        <Connected user={{ id: 1 }} />
      </Root>
    )
    const node = connectedNode(getByTestId)
    expect(node).toMatchInlineSnapshot(snaps.SNAP_INJECTED_FN)
  })

  test('it updates refs with new props', () => {
    const Connected = connectFirestore<DummyProps>(
      mapSnaps,
      {
        key: 'mock',
        ref: ({ user }) => user ? mockRef('mock') : null,
      },
      {
        key: 'mock2',
        ref: mockRef('mock2'),
      },
    )(Dummy)
    const { getByTestId, rerender } = render(
      <Root>
        <Connected user={null} />
      </Root>
    )
    expect(connectedNode(getByTestId)).toMatchInlineSnapshot(snaps.SNAP_NO_USER)
    rerender(
      <Root>
        <Connected user={{ id: 1 }} />
      </Root>
    )
    expect(connectedNode(getByTestId)).toMatchInlineSnapshot(snaps.SNAP_INJECTED_FN)
  })
})
