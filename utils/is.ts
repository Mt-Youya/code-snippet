export const emptyObject: Record<string, any> = Object.freeze({})

export const isArray = Array.isArray

export function isDef<T>(v: T): v is NonNullable<T> {
    return v !== undefined && v !== null
}

export function isPrimitive(value: any): boolean {
    return (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'symbol' ||
        typeof value === 'boolean'
    )
}

export function isFunction(value: any): value is (...args: any[]) => any {
    return typeof value === 'function'
}

export function isObject(obj: any): boolean {
    return obj !== null && typeof obj === 'object'
}

const _toString = Object.prototype.toString

export function toRawType(value: any): string {
    return _toString.call(value).slice(8, -1)
}

export function isPlainObject(obj: any): boolean {
    return _toString.call(obj) === '[object Object]'
}

export function isRegExp(v: any): v is RegExp {
    return _toString.call(v) === '[object RegExp]'
}

export function isValidArrayIndex(val: any): boolean {
    const n = parseFloat(String(val))
    return n >= 0 && Math.floor(n) === n && isFinite(val)
}

export function isPromise(val: any): val is Promise<any> {
    return (
        isDef(val) &&
        typeof val.then === 'function' &&
        typeof val.catch === 'function'
    )
}

export function toString(val: any): string {
    return val == null
        ? ''
        : Array.isArray(val) || (isPlainObject(val) && val.toString === _toString)
            ? JSON.stringify(val, replacer, 2)
            : String(val)
}

function replacer(_key: string, val: any): any {
    // avoid circular deps from v3
    if (val && val.__v_isRef) {
        return val.value
    }
    return val
}

export function toNumber(val: string): number | string {
    const n = parseFloat(val)
    return isNaN(n) ? val : n
}


export function remove(arr: Array<any>, item: any): Array<any> | void {
    const len = arr.length
    if (len) {
        if (item === arr[len - 1]) {
            arr.length = len - 1
            return
        }
        const index = arr.indexOf(item)
        if (index > -1) {
            return arr.splice(index, 1)
        }
    }
}


/**
 * Convert an Array-like object to a real Array.
 */
export function toArray(list: any, start?: number): Array<any> {
    start = start || 0
    let i = list.length - start
    const ret: Array<any> = new Array(i)
    while (i--) {
        ret[i] = list[i + start]
    }
    return ret
}

export function extend(
    to: Record<PropertyKey, any>,
    _from?: Record<PropertyKey, any>
): Record<PropertyKey, any> {
    for (const key in _from) {
        to[key] = _from[key]
    }
    return to
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is#polyfill
export function hasChanged(x: unknown, y: unknown): boolean {
    if (x === y) {
        return x === 0 && 1 / x !== 1 / (y as number)
    } else {
        return x === x || y === y
    }
}
