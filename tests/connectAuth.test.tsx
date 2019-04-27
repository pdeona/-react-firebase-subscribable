import React, { ReactNode, FC } from 'react'
import { render, cleanup } from 'react-testing-library'
import { mockAuth, connectedNode, User, sendNext } from './helpers'
import * as snaps from './auth.snaps'
import { connectAuth, FirebaseAuthProvider } from '../src'

type RootProps = {
  children: ReactNode,
}

type DummyProps = {
  user: User | null,
}

const Root: FC<RootProps> = ({ children }) => (
  <FirebaseAuthProvider
    firebaseAuth={(mockAuth as any)() as firebase.auth.Auth}
  >
    {children}
  </FirebaseAuthProvider>
)

const Dummy: FC<DummyProps> = ({ user }) => (
  <span data-testid="connected">{user ? String(user.uid) : null}</span>
)

const newU = new User(1)

describe('connectAuth', () => {
  afterEach(cleanup)

  it('connects child component to firebase auth provider', () => {
    const Connected = connectAuth(user => ({ user }))(Dummy)
    const { getByTestId } = render(
      <Root>
        <Connected />
      </Root>
    )
    sendNext(newU)
    const node = connectedNode(getByTestId)
    expect(node).toMatchInlineSnapshot(snaps.USER_1())
  })

  it('maps updated auth state to props', () => {
    const mockMapState = jest.fn(user => ({ user }))
    const Connected = connectAuth(mockMapState)(Dummy)
    sendNext(null)
    render(
      <Root>
        <Connected />
      </Root>
    )
    expect(mockMapState).toBeCalledTimes(1)
    expect(mockMapState).toBeCalledWith(null)
    sendNext(newU)
    expect(mockMapState).toBeCalledTimes(2)
    expect(mockMapState).toBeCalledWith(newU)
  })
})
