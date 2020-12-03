export class MemoizationCache {
    constructor() {
        this.callbacks = [];
    }
    memoize(cb, ...caches) {
        caches.push(this);
        const memoized = memoize(cb);
        for (const cache of caches) {
            cache.callbacks.push(memoized);
        }
        return memoized;
    }
    invalidateAll() {
        const callbacks = this.callbacks;
        for (let i = 0; i < this.callbacks.length; i++) {
            callbacks[i].needsUpdate = true;
        }
    }
    isFullyInvalid() {
        const callbacks = this.callbacks;
        for (let i = 0; i < this.callbacks.length; i++) {
            if (!callbacks[i].needsUpdate)
                return false;
        }
        return true;
    }
}
const UNSET = Symbol('unset');
function memoize(cb) {
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
    return wrapped;
}
