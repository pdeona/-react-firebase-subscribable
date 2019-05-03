import { RefMap, IFSRef } from './types'

export const invariant = (assert: boolean, message: string): void => {
  if (!assert && process.env.NODE_ENV === 'development') {
    console.error('Error: '.concat(message))
  }
}

type Comp2 = <A, B, C>(l: (b: B) => C, r: (a: A) => B) => (a: A) => C

// compose 2 unary functions
export const comp2: Comp2 = (left, right) => x => left(right(x))
// curry a binary function
export const curry2 = <A, B, C>(fn: (x: A, y: B) => C) => (x: A) => (y: B) => fn(x, y)
// retrieve property from object
export const getProp = curry2(
  <O extends object>(prop: keyof O, o: O) => o[prop]
)

export const injectRefObj = (
  injectRef: (key: string, ref: IFSRef) => () => void,
  refs: RefMap,
) => {
  const subs = Object.keys(refs).map(key => {
    return injectRef(key, refs[key] as IFSRef)
  })
  return () => subs.forEach(unsubscribe => {
    unsubscribe()
  })
}
