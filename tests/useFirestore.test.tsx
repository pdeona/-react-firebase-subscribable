import React from 'react'
import { render, cleanup, act } from 'react-testing-library'
import { firestore } from 'firebase'
import { mockFirestore, connectedNode, mockSnapshot } from './helpers'
import { useFirestore } from '../src'
import * as snaps from './firestore.snaps'
import { IFSRef } from '../src/types'

const mockRef = (docID = 'my-pants') => mockFirestore()
  .collection('pants')
  .doc(docID)

type DProps = {
  user?: { id: number },
  mockRef?: IFSRef,
  mockRef2?: IFSRef,
}

function Dummy({ user, mockRef, mockRef2 }: DProps) {
  const [mock] = useFirestore(mockRef)
  const [mock2] = useFirestore(mockRef2)
  return (
    <div data-testid="connected">
      {mock ? (mock as firestore.DocumentSnapshot).data() : ''}
      {mock2 ? (mock2 as firestore.DocumentSnapshot).data() : ''}
      {user ? user.id : ''}
    </div>
  )
}

describe('connectFirestore tests', () => {
  afterEach(cleanup)

  test('it connects a component to firestore', () => {
    const { getByTestId } = render(
      <Dummy mockRef={mockRef('mock')} />
    )
    const node = connectedNode(getByTestId)
    expect(node).toMatchInlineSnapshot(snaps.SNAP_DEFAULT_REF)
  })

  test('it accepts null for refs that are not needed', () => {
    const { getByTestId } = render(
      <Dummy mockRef={null} />
    )
    const node = connectedNode(getByTestId)
    expect(node).toMatchInlineSnapshot(snaps.SNAP_NULL_REF)
  })

  test('it updates refs on new snapshot value', () => {
    const ref = mockRef('mock')
    const { getByTestId } = render(
      <Dummy mockRef={ref} />
    )
    const node = connectedNode(getByTestId)
    expect(node).toMatchInlineSnapshot(snaps.SNAP_DEFAULT_REF)
    act(() => {
      ref.subscriber(mockSnapshot('next value'))
    })
    expect(node).toMatchInlineSnapshot(snaps.SNAP_NEXT_VALUE)
  })
})
