import {
  comp2,
  curry2,
  getProp,
  invariant,
} from '../src/shared'

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
  beforeAll(() => {
    process.env.NODE_ENV = 'development'
  })

  afterAll(() => {
    process.env.NODE_ENV = 'test'
  })

  it('checks an assertion', () => {
    expect(() => invariant(true, 'does not throw')).not.toThrowError()
  })

  it('throws in development', () => {
    expect(() => invariant(false, 'throws')).toThrow(TypeError)
  })

  it('doesn\'t throw outside of development', () => {
    process.env.NODE_ENV = 'not-development'
    expect(
      () => invariant(false, 'will never be logged ever'),
    ).not.toThrowError()
  })
})

describe('getProp', () => {
  const d = {
    one: '1',
    two: null,
    three: '3',
  }

  it('curried', () => {
    expect(getProp.length).toEqual(1)
    expect(getProp('prop').length).toEqual(1)
  })

  it('retrieve property', () => {
    const getOne = getProp('one')
    const getFour = getProp('four')
    expect(getOne(d)).toEqual('1')
    expect(getFour(d)).toBeUndefined()
  })
})
