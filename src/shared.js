const requiredPropErrorMsg = (componentName, propName, message) => `${componentName} did not receive ${propName} as a prop. ${message}`

class RequiredPropError extends Error {
  constructor(componentName, propName, message) {
    super(requiredPropErrorMsg(componentName, propName, message))
  }
}

export const diffRequiredProps = (componentName, props, ...requiredProps) => {
  const errors = requiredProps.map(({
    propName,
    propType,
    predicate,
    message = '',
  }) => {
    if (predicate && !predicate(props[propName])) {
      return [
        componentName,
        propName,
        message || `${propName} is required`,
      ]
    }
    if (typeof props[propName] !== propType) {
      return [
        componentName,
        propName,
        `${propName} is required and should be a ${propType}`,
      ]
    }
    return null
  }).filter(e => !!e)
  return errors.map(err => console.error(new RequiredPropError(...err)))
}
