export function deepCopy<O>(oldObj: O): O {
  let newObj = oldObj as any
  if (oldObj && typeof oldObj === 'object') {
    newObj = Object.prototype.toString.call(oldObj) === "[object Array]" ? [] : {}
    for (let i in oldObj) {
      newObj[i] = deepCopy(oldObj[i])
    }
  }
  return newObj
}

export function genUniqueId(name: string) {
  let dt = new Date().getTime();

  const id = `${name}${dt.toString(36)}${Math.random().toString(36)}`
  return id
}
