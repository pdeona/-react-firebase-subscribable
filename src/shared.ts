import { useMemo } from "react"

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

// annoying fix for typescript not seeing Object.values
declare global {
  interface Object {
    values: <P extends object>(o: P) => Array<P[keyof P]>
  }
}

type Destructured<O> = {
  [P in keyof O]?: O[P];
} & { rest?: { [P in keyof O]?: O[P] | undefined; } }

export function useMemoizedProps<P extends object>(
  props: P,
  propsToDestructure: Array<keyof P>,
): Destructured<P> {
  return useMemo(() => {
    return propsToDestructure.reduce(
      (acc: Destructured<P>, name: keyof P): Destructured<P> => ({
        [name]: props[name],
        rest: {
          ...acc.rest,
          [name]: undefined,
        }
      }) as Destructured<P>,
      {},
    )
  }, [props])
}
