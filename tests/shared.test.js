import { invariant, comp2, curry2 } from '../src/shared'

describe('curry2', () => {
  const fn = (x, y) => x + y
  it('takes a binary function and returns a unary function', () => {
    expect(fn.length).toEqual(2)
    const curried = curry2(fn)
    expect(curried.length).toEqual(1)
  })

  it('allows partial application over binary functions', () => {
    const curried = curry2(fn)
    const add1 = curried(1)
    expect(add1(2)).toEqual(3)
    expect(add1(3)).toEqual(4)
  })
})

describe('comp2', () => {
  const f = str => str.concat('left')
  const g = str => str.concat('right')
  it('composes 2 functions f . g so that (f . g) x = f (g x)', () => {
    const fog = comp2(f, g)
    expect(fog('p')).toEqual(f(g('p')))
  })
})

describe('invariant', () => {
  const oldErr = console.error
  let mockErr

  beforeAll(() => {
    process.env.NODE_ENV = 'development'
  })

  beforeEach(() => {
    mockErr = jest.fn()
    console.error = mockErr
  })

  afterAll(() => {
    process.env.NODE_ENV = 'test'
    console.error = oldErr
  })

  it('checks an assertion', () => {
    invariant(true, 'will not be logged')
    expect(mockErr).not.toBeCalled()
  })

  it('logs in development', () => {
    const message = 'this will be logged'
    invariant(false, message)
    expect(mockErr).toBeCalledWith(`Error: ${message}`)
  })

  it('doesn\'t log outside of development', () => {
    process.env.NODE_ENV = 'not-development'
    invariant(false, 'will never be logged ever')
    expect(mockErr).not.toBeCalled()
  })
})
