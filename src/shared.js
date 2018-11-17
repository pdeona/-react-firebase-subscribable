// @flow

const requiredPropErrorMsg = (componentName: string, propName: string, message: string): string => `${componentName} did not receive ${propName} as a prop. ${message}`

class RequiredPropError extends Error {
  constructor(componentName, propName, message) {
    super(requiredPropErrorMsg(componentName, propName, message))
  }
}

type TypeofTypes = 'string' 
  | 'function'
  | 'number'
  | 'object'
  | 'boolean'
  | 'undefined'

type RequiredPropWithStdType = $Exact<{
  propName: string,
  propType: TypeofTypes,
}>

type RequiredPropWithPredicate = $Exact<{
  propName: string,
  predicate: (prop: *) => boolean,
  message: string,
}>

type RequiredPropSpec = RequiredPropWithStdType | RequiredPropWithPredicate

export const diffRequiredProps = (
  componentName: string,
  props: *,
  ...requiredProps: RequiredPropSpec[]
): RequiredPropError[] => {
  const errors: Array<string[] | null> = requiredProps.map((spec: RequiredPropSpec): string[] | null => {
    if (spec.predicate) {
      const { propName, predicate, message } = spec
      return !predicate(props[propName]) ? [
        componentName,
        propName,
        message || `${propName} is required`,
      ] : null
    }
    const { propName, propType } = spec
    return typeof props[propName] !== propType ? [
      componentName,
      propName,
      `${propName} is required and should be a ${propType}`,
    ] : null
  })
  return errors
    .filter(e => !!e)
  // $FlowFixMe filtered arrays aren't properly type-checked
    .map(err => new RequiredPropError(...err))
}
