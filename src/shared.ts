import { useMemo } from 'react'
import { Destructured } from './types'

export const invariant = (assert: boolean, message: string): void => {
  if (!assert && process.env.NODE_ENV === 'development') {
    console.error('Error: '.concat(message))
  }
}

type Comp2 = <A, B, C>(l: (b: B) => C, r: (a: A) => B) => (a: A) => C

// compose 2 unary functions
export const comp2: Comp2 = (left, right) => x => left(right(x))
// curry a binary function
export const curry2 = <A, B>(fn: (x: A, y: B) => any) => (x: A) => (y: B) => fn(x, y)

const destructureProps = <P extends object>(props: P) => 
  (acc: P, name: keyof P): Destructured<P> => ({
    ...acc,
    [name]: props[name],
    rest: {
      ...(acc as Destructured<P>).rest || {},
      [name]: undefined,
    }
  }) as Destructured<P>

export function useMemoizedProps<P extends object>(
  props: P,
  propsToDestructure: Array<keyof P>,
): Destructured<P> {
  return useMemo(() => {
    const destructured: Destructured<P> = propsToDestructure.reduce(
      destructureProps(props),
      {},
    )
    return {
      ...destructured,
      rest: {
        ...props,
        ...destructured.rest,
      }
    } as Destructured<P>
  }, [props])
}
