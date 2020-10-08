export class MemoizationCache {
    constructor() {
        this.callbacks = [];
    }
    memoize(cb, ...otherCaches) {
        return memoize(cb, this, ...otherCaches);
    }
    invalidateAll() {
        const callbacks = this.callbacks;
        for (let i = 0; i < this.callbacks.length; i++) {
            callbacks[i].needsUpdate = true;
        }
    }
    isClean() {
        const callbacks = this.callbacks;
        for (let i = 0; i < this.callbacks.length; i++) {
            if (!callbacks[i].needsUpdate)
                return false;
        }
        return true;
    }
}
const UNSET = Symbol('unset');
export function memoize(cb, ...caches) {
    let value = UNSET;
    const wrapped = () => {
        if (wrapped.needsUpdate) {
            wrapped.needsUpdate = false;
            value = cb();
        }
        if (value === UNSET) {
            throw new Error("Possible recursive memoization detected");
        }
        return value;
    };
    wrapped.needsUpdate = true;
    for (const cache of caches) {
        cache.callbacks.push(wrapped);
    }
    return wrapped;
}
