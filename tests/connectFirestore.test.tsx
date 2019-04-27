import React, { ReactNode } from 'react'
import { render, cleanup } from 'react-testing-library'
import { mockFirestore } from './helpers'
import { connectFirestore, createRefMap, FirestoreProvider } from '../src' // eslint-disable-line import/no-unresolved
import * as snaps from './connectFirestore.snaps'
import { ObservableStore } from '../src/types'

type RootProps = { children: ReactNode, refMap: ObservableStore }
type DummyProps = {
  mock: any,
  user: any,
  [key: string]: any,
}

describe('connectFirestore tests', () => {
  afterEach(cleanup)
  function Root({ children, refMap }: RootProps) {
    return (
      <FirestoreProvider refMap={refMap}>
        {children}
      </FirestoreProvider>
    )
  }

  function Dummy({ mock, mock2, user }: DummyProps) {
    return (
      <div data-testid="connected">
        {mock ? mock.data() : ''}
        {mock2 ? mock2.data() : ''}
        {user ? user.id : ''}
      </div>
    )
  }

  const mockRef = (docID = 'my-pants') => mockFirestore()
    .collection('pants')
    .doc(docID)

  test('it maps snapshots to props', () => {
    const Connected = connectFirestore<DummyProps>(
      ({ mock, mock2 }) => ({
        mock: mock && mock.snap,
        mock2: mock2 && mock2.snap,
      }),
    )(Dummy)
    const { getByTestId } = render(
      <Root refMap={createRefMap({ mock: (mockRef as any)() })}>
        <Connected />
      </Root>
    )
    const node = getByTestId('connected')
    expect(node).toMatchInlineSnapshot(snaps.SNAP_DEFAULT_REF)
  })

  test('it accepts null for map snapshots to props', () => {
    const Connected = connectFirestore<DummyProps>(null)(Dummy)
    const { getByTestId } = render(
      <Root refMap={createRefMap({ mock: (mockRef as any)() })}>
        <Connected />
      </Root>
    )
    const node = getByTestId('connected')
    expect(node).toMatchInlineSnapshot(snaps.SNAP_NULL_REF)
  })

  test('it injects refs into the store', () => {
    const Connected = connectFirestore<DummyProps>(
      ({ mock, mock2 }) => ({ mock: mock && mock.snap, mock2: mock2 && mock2.snap }),
      {
        key: 'mock',
        ref: ({ user }) => (mockRef as any)(user.id),
      },
      {
        key: 'mock2',
        ref: (mockRef as any)(),
      },
    )(Dummy)
    const { getByTestId } = render(
      <Root refMap={createRefMap()}>
        <Connected user={{ id: 1 }} />
      </Root>
    )
    const node = getByTestId('connected')
    expect(node).toMatchInlineSnapshot(snaps.SNAP_INJECTED_FN)
  })

  test('it updates refs with new props', () => {
    const Connected = connectFirestore<DummyProps>(
      ({ mock, mock2 }) => ({ mock: mock && mock.snap, mock2: mock2 && mock2.snap }),
      {
        key: 'mock',
        ref: ({ user }) => user ? (mockRef as any)(user.id) : null,
      },
      {
        key: 'mock2',
        ref: (mockRef as any)(),
      },
    )(Dummy)
    const { getByTestId, rerender } = render(
      <Root refMap={createRefMap()}>
        <Connected user={null} />
      </Root>
    )
    expect(getByTestId('connected')).toMatchInlineSnapshot(snaps.SNAP_NO_USER)
    rerender(
      <Root refMap={createRefMap()}>
        <Connected user={{ id: 1 }} />
      </Root>
    )
    expect(getByTestId('connected')).toMatchInlineSnapshot(snaps.SNAP_INJECTED_FN)
  })
})
