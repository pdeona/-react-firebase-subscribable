import React, { ReactNode } from 'react'
import { render, cleanup, act } from 'react-testing-library'
import { mockFirestore, connectedNode } from './helpers'
import { useInjected, FirestoreProvider } from '../src'
import * as snaps from './firestore.snaps'
import { RefMap, FSState, IFSRef } from '../src/types'

type RootProps = { children: ReactNode, refMap?: RefMap<RootProps> }
type DummyProps = {
  user: any,
}

function Root({ children, refMap }: RootProps) {
  return (
    <FirestoreProvider initialRefs={refMap}>
      {children}
    </FirestoreProvider>
  )
}

const mapSnaps = (s: FSState) => (s as any)

function makeDummy(injected: RefMap<DummyProps>) {
  return function Dummy({ user }: DummyProps) {
    const { mock, mock2 } = useInjected(
      mapSnaps,
      injected,
    )
    return (
      <div data-testid="connected">
        {mock ? mock.value.data() : ''}
        {mock2 ? mock2.value.data() : ''}
        {user ? user.id : ''}
      </div>
    )
  }
}

describe('useInjected tests', () => {
  afterEach(cleanup)

  const mockRef = (docID = 'my-pants') => mockFirestore()
    .collection('pants')
    .doc(docID)

  test('it accepts null for map snapshots', () => {
    const Connected = () => {
      const snaps = useInjected(null, { mock: mockRef('mock') })
      return (
        <span data-testid="connected">{JSON.stringify(snaps)}</span>
      )
    }
    const { getByTestId } = render(
      <Root>
        <Connected />
      </Root>
    )
    const node = connectedNode(getByTestId)
    expect(node).toMatchInlineSnapshot(`
      <span
        data-testid="connected"
      >
        {}
      </span>
    `)
  })

  test('it injects refs into the store', () => {
    const Connected = makeDummy({
      mock: mockRef('mock'),
      mock2: mockRef('mock2'),
    })
    const { getByTestId } = render(
      <Root>
        <Connected user={{ id: 1 }} />
      </Root>
    )
    const node = connectedNode(getByTestId)
    expect(node).toMatchInlineSnapshot(snaps.SNAP_INJECTED_FN)
  })

  test('it updates refs with new props', () => {
    function Connected({ user }: DummyProps) {
      const injected = {
        mock: user ? mockRef('mock') : null,
        mock2: mockRef('mock2'),
      }
      const { mock, mock2 } = useInjected(
        mapSnaps,
        injected,
      )
      return (
        <div data-testid="connected">
          {mock ? mock.value.data() : ''}
          {mock2 ? mock2.value.data() : ''}
          {user ? user.id : ''}
        </div>
      )
    }
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
