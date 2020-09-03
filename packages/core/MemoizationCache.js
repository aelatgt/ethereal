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
export function memoize(cb, ...caches) {
    let value;
    const wrapped = () => {
        if (wrapped.needsUpdate) {
            wrapped.needsUpdate = false;
            value = cb();
        }
        return value;
    };
    wrapped.needsUpdate = true;
    for (const cache of caches) {
        cache.callbacks.push(wrapped);
    }
    return wrapped;
}
