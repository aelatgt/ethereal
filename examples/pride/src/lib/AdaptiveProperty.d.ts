export interface Zone<T> {
    /**
     * The the state name for this zone
     */
    state: keyof T;
    /**
     * The threshold value for transitioning to this zone
     */
    threshold?: number;
    /**
     * The time in milliseconds until transitioning to this zones
     */
    delay?: number;
}
export interface AdaptivePropertyOptions<T> {
    metric: () => number;
    zones: Array<Zone<T> | number>;
    /**
     * The default threshold for transitioning between zones
     */
    threshold?: number;
    /**
     * The default time in milliseconds until transitioning between zones
     */
    delay?: number;
}
export default class AdaptiveProperty<T> {
    static CompositeState: {
        new <U>(object: U): {
            object: U;
            update(deltaTime: number): void;
            is(stateMap: AdaptivePropertyStateMap<U>): boolean;
            changingTo(stateMap: AdaptivePropertyStateMap<U>): boolean;
            changingFrom(stateMap: AdaptivePropertyStateMap<U>): boolean;
        };
    };
    private _metricValue;
    private _metric;
    private _zones;
    private _threshold;
    private _delay;
    private _pendingZoneChangeTime;
    private _previousZone;
    private _currentZone;
    constructor(options: AdaptivePropertyOptions<T>);
    get state(): keyof T;
    get metricValue(): number;
    /**
     *
     * @param deltaTime time in seconds since last update
     */
    update(deltaTime: number): void;
    is(state: keyof T): boolean;
    was(state: keyof T): boolean;
    changedFrom(state: keyof T): boolean;
    changedTo(state: keyof T): boolean;
    changed(): boolean;
    private _verifyState;
}
export declare type Constructor<T> = new (...args: any[]) => T;
export declare type AdaptivePropertyStateMap<T> = {
    [K in keyof T]?: T[K] extends AdaptiveProperty<infer Z> ? keyof Z : any;
} & {
    constructor: any;
};
export declare const test2: {
    object: {
        bla: AdaptiveProperty<{
            hi: any;
        } & {
            basdf: any;
        }>;
    };
    update(deltaTime: number): void;
    is(stateMap: AdaptivePropertyStateMap<{
        bla: AdaptiveProperty<{
            hi: any;
        } & {
            basdf: any;
        }>;
    }>): boolean;
    changingTo(stateMap: AdaptivePropertyStateMap<{
        bla: AdaptiveProperty<{
            hi: any;
        } & {
            basdf: any;
        }>;
    }>): boolean;
    changingFrom(stateMap: AdaptivePropertyStateMap<{
        bla: AdaptiveProperty<{
            hi: any;
        } & {
            basdf: any;
        }>;
    }>): boolean;
};
