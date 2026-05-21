type AnyObject = Record<string, unknown>

function isPlainObject(v: unknown): v is AnyObject {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

export function deepMerge(target: AnyObject, source: AnyObject): AnyObject {
  for (const [key, value] of Object.entries(source)) {
    const existing = target[key]

    if (isPlainObject(existing) && isPlainObject(value)) {
      target[key] = deepMerge(existing, value)
    } else {
      target[key] = value
    }
  }
  return target
}
