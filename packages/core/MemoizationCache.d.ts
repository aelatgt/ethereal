interface MemoizedFunction<R> {
    (): R;
    needsUpdate: boolean;
}
export declare class MemoizationCache {
    callbacks: MemoizedFunction<any>[];
    memoize<R>(cb: () => R, ...caches: MemoizationCache[]): MemoizedFunction<R>;
    invalidateAll(): void;
    isFullyInvalid(): boolean;
}
export {};
