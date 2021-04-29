

interface MemoizedFunction<R> {
    ():R
    needsUpdate: boolean
}

export class MemoizationCache {
    callbacks = [] as MemoizedFunction<any>[]
    memoize<R>(cb:()=>R, ...caches:MemoizationCache[]) : MemoizedFunction<R> {
        caches.push(this)
        const memoized = memoize(cb)
        for (const cache of caches) {
            cache.callbacks.push(memoized)
        }
        return memoized
    }
    invalidateAll() {
        const callbacks = this.callbacks
        for (let i=0; i < this.callbacks.length; i++) {
            callbacks[i].needsUpdate = true
        }
    }
    isFullyInvalid() {
        const callbacks = this.callbacks
        for (let i=0; i < this.callbacks.length; i++) {
            if (!callbacks[i].needsUpdate) return false
        }
        return true
    }
}


const UNSET = undefined //Symbol('unset')

function memoize<R>(cb:()=>R) : MemoizedFunction<R> {
    let value:R = UNSET as any
    const wrapped:MemoizedFunction<R> = () => {
        if (wrapped.needsUpdate) {
            wrapped.needsUpdate = false
            value = cb()
        }
        // if (value as any === UNSET) {
        //     throw new Error("Possible recursive memoization detected")
        // }
        return value
    }
    wrapped.needsUpdate = true
    return wrapped
}