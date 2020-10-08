interface MemoizedFunction<R> {
    (): R;
    needsUpdate: boolean;
}
export declare class MemoizationCache {
    callbacks: MemoizedFunction<any>[];
    memoize<R>(cb: () => R, ...otherCaches: MemoizationCache[]): MemoizedFunction<R>;
    invalidateAll(): void;
    isClean(): boolean;
}
export declare function memoize<R>(cb: () => R, ...caches: MemoizationCache[]): MemoizedFunction<R>;
export {};
