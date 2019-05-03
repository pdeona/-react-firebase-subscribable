import React, { FC } from 'react'
import { render, cleanup } from 'react-testing-library'
import { mockAuth, User, sendNext } from './helpers'
import * as snaps from './auth.snaps'
import { useAuth } from '../src'

type DummyProps = {}

const Dummy: FC<DummyProps> = () => {
  const user = useAuth(mockAuth() as any)
  return (
    <span data-testid="child">{user ? String(user.uid) : null}</span>
  )
}

const newU = new User(1)

describe('useAuth', () => {
  afterEach(cleanup)

  it('accepts an onAuthStateChange function', () => {
    sendNext(null)
    const { getByTestId } = render(
      <Dummy />
    )
    const node = getByTestId('child')
    expect(node).toMatchInlineSnapshot(`
      <span
        data-testid="child"
      />
    `)
    sendNext(newU)
    expect(node).toMatchInlineSnapshot(snaps.USER_1('child'))
  })
})
