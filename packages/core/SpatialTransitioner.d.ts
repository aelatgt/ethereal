import { MathType } from './math';
import { EtherealSystem } from './EtherealSystem';
export declare type Easing = (v: number) => number;
export declare type EasingModifier = (easing: Easing) => Easing;
export interface EasingModule {
    reversed: EasingModifier;
    mirrored: EasingModifier;
    createReversedEasing: EasingModifier;
    createMirroredEasing: EasingModifier;
    createExpoIn: (power: number) => Easing;
    createBackIn: (power: number) => Easing;
    createAnticipateEasing: (power: number) => Easing;
    linear: Easing;
    easeIn: Easing;
    easeOut: Easing;
    easeInOut: Easing;
    circIn: Easing;
    circOut: Easing;
    circInOut: Easing;
    backIn: Easing;
    backOut: Easing;
    backInOut: Easing;
    anticipate: Easing;
    bounceOut: (p: number) => number;
    bounceIn: (p: number) => number;
    bounceInOut: (p: number) => number;
    cubicBezier(mX1: number, mY1: number, mX2: number, mY2: number): (aX: number) => number;
}
export declare const easing: EasingModule;
export declare type TransitionableType<T extends MathType> = T extends number ? number : T;
export declare class Transition<T extends MathType = MathType> {
    constructor(options?: Partial<Transition>);
    target?: TransitionableType<T>;
    duration?: number;
    easing?: Easing;
    blend?: boolean;
    elapsed?: number;
}
export declare class TransitionConfig {
    constructor(config?: TransitionConfig);
    /**
     * A multiplier to influence the speed of the transition
     */
    multiplier?: number;
    /**
     * The duration of the easing function
     */
    duration?: number;
    /**
     * The easing function
     */
    easing?: (alpha: number) => number;
    /**
     * The relative difference required to "stage" a transition.
     *
     * A threshold of 0 means any difference will trigger a transition.
     *
     * A threshold of 0.1 can be interpreted as a relative difference of 10%.
     */
    threshold?: number;
    /**s
     * The number of seconds the `target` must be maintained
     * beyond the `threshold` to automatically "stage" a transition
     */
    delay?: number;
    /**
     * The number of seconds that the `stagedTarget` must remain
     * stable to automatically "commit" a transition
     */
    debounce?: number;
    /**
     * The maximum number of seconds before the `stagedTarget`
     * is committed
     */
    maxWait?: number;
    /**
     * If true, blend transitions together
     */
    blend?: boolean;
}
export declare class SpatialTransitioner<T extends MathType = MathType> extends TransitionConfig {
    system: EtherealSystem;
    parentConfig: TransitionConfig;
    constructor(system: EtherealSystem, startValue: MathType, config?: TransitionConfig, parentConfig?: TransitionConfig);
    /** */
    needsUpdate: boolean;
    private _copy;
    private _isEqual;
    /**
     * Reset all states to the specified value,
     * and remove all ongoing transitions
     */
    reset(v: TransitionableType<T>): void;
    /**
     * The starting value for currently ongoing transitions
     */
    set start(value: TransitionableType<T>);
    get start(): TransitionableType<T>;
    private _start;
    /**
     * The current value.
     */
    set current(value: TransitionableType<T>);
    get current(): TransitionableType<T>;
    private _current;
    /**
     * The "changed" reference value
     */
    set reference(value: TransitionableType<T> | undefined);
    get reference(): TransitionableType<T> | undefined;
    private _reference?;
    /**
     * The target value.
     */
    set target(value: TransitionableType<T>);
    get target(): TransitionableType<T>;
    private _target;
    /**
     * The queue of committed transitions that are still influencing the `current` value
     * (whose durations have not yet been exceeded)
     */
    readonly queue: Required<Transition<T>>[];
    /**
     * If false, this transitionable is inert
     */
    get active(): boolean;
    set active(val: boolean);
    private _active;
    /**
     * Force the next update to commit the target value,
     * or the specified transition
     */
    get forceCommit(): boolean | Transition<T>;
    set forceCommit(val: boolean | Transition<T>);
    private _forceCommit;
    /**
     * The relative difference between the target and last committed value.
     */
    get relativeDifference(): number;
    /**
     * The relative difference between the target and reference value
     */
    get referenceRelativeDifference(): number;
    /**
     * The transition config after accounting for adapter and system defaults
     */
    get resolvedConfig(): Required<TransitionConfig>;
    private _resolvedConfig;
    delayTime: number;
    debounceTime: number;
    waitTime: number;
    /**
     * Describes the status of the target value
     *
     * "unchanged" - the target value is unchanged relative to the last committed value
     * "changed" - the target value has changed relative to the `reference` value or last committed value
     * "settling" - the target value has changed, pending stabalization/timeout, or reversion to "unchanged" state
     * "committing" - the target value will be accepted as a new transition targets
     */
    get status(): string;
    private _status;
    private _computeStatus;
    /**
     *
     */
    private _updateTransitionable;
    private _scratchV2;
    private _scratchV3;
    private _scratchQ;
    private _scratchBox;
    private _scratchColor;
    private _blackColor;
    private _addTransitionToCurrent;
    /**
     *
     */
    update(force?: boolean): void;
    private _previousTarget;
    set syncGroup(group: Set<any> | undefined);
    get syncGroup(): Set<any> | undefined;
    private _syncGroup?;
}
