

interface MemoizedFunction<R> {
    ():R
    needsUpdate: boolean
}

export class MemoizationCache {
    callbacks = [] as MemoizedFunction<any>[]
    memoize<R>(cb:()=>R, ...otherCaches:MemoizationCache[]) : MemoizedFunction<R> {
        return memoize(cb, this, ...otherCaches)
    }
    invalidateAll() {
        const callbacks = this.callbacks
        for (let i=0; i < this.callbacks.length; i++) {
            callbacks[i].needsUpdate = true
        }
    }
    isClean() {
        const callbacks = this.callbacks
        for (let i=0; i < this.callbacks.length; i++) {
            if (!callbacks[i].needsUpdate) return false
        }
        return true
    }
}


const UNSET = Symbol('unset')

export function memoize<R>(cb:()=>R, ...caches:MemoizationCache[]) : MemoizedFunction<R> {
    let value:R = UNSET as any
    const wrapped:MemoizedFunction<R> = () => {
        if (wrapped.needsUpdate) {
            wrapped.needsUpdate = false
            value = cb()
        }
        if (value as any === UNSET) {
            throw new Error("Possible recursive memoization detected")
        }
        return value
    }
    wrapped.needsUpdate = true
    for (const cache of caches) {
        cache.callbacks.push(wrapped)
    }
    return wrapped
}