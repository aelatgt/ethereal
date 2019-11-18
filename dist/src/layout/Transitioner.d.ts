import * as THREE from 'three';
/**
 * Easing functions from '@popmotion/easing'
 */
declare namespace Easings {
    type Easing = (v: number) => number;
    type EasingModifier = (easing: Easing) => Easing;
    const reversed: EasingModifier;
    const mirrored: EasingModifier;
    const createReversedEasing: EasingModifier;
    const createMirroredEasing: EasingModifier;
    const createExpoIn: (power: number) => Easing;
    const createBackIn: (power: number) => Easing;
    const createAnticipateEasing: (power: number) => Easing;
    const linear: Easing;
    const easeIn: Easing;
    const easeOut: Easing;
    const easeInOut: Easing;
    const circIn: Easing;
    const circOut: Easing;
    const circInOut: Easing;
    const backIn: Easing;
    const backOut: Easing;
    const backInOut: Easing;
    const anticipate: Easing;
    const bounceOut: (p: number) => number;
    const bounceIn: (p: number) => number;
    const bounceInOut: (p: number) => number;
    function cubicBezier(mX1: number, mY1: number, mX2: number, mY2: number): (aX: number) => number;
}
declare const easing: typeof Easings;
export { easing };
declare type WidenLiteral<T> = T extends number ? number : T;
export declare type Multiplier<T> = number | (T extends THREE.Matrix4 ? {
    position?: number;
    scale?: number;
    quaternion?: number;
} : never);
export declare class TransitionTarget<T extends ValueType = ValueType> {
    value: T;
    duration: number;
    easing: (number: any) => number;
    constructor(value: T, duration: number, easing: (number: any) => number);
    elapsed: 0;
}
declare type ValueTypes = number | THREE.Vector2 | THREE.Vector3 | THREE.Quaternion | THREE.Color | THREE.Matrix4 | THREE.Box3;
export declare type ValueType<T extends ValueTypes = ValueTypes> = WidenLiteral<T>;
export declare type ValueRange<T> = T extends THREE.Vector2 | THREE.Vector3 ? T : T extends THREE.Matrix4 | THREE.Box3 ? THREE.Vector3 : T extends number ? number : never;
export declare type TransitionableConstructorKeys = 'target' | 'multiplier' | 'duration' | 'easing' | 'threshold' | 'delay' | 'debounce' | 'maxWait' | 'path';
export declare type TransitionerConstructOptions<T extends ValueType> = Pick<Transitionable<T>, TransitionableConstructorKeys>;
export declare type TransitionableConfig = Pick<Transitionable<ValueType>, 'delay' | 'debounce' | 'maxWait' | 'multiplier' | 'duration' | 'easing' | 'threshold'>;
export declare class Transitionable<T extends ValueType = ValueType> {
    constructor(config: TransitionerConstructOptions<T>);
    /**
     * The desired target value
     */
    target: WidenLiteral<T>;
    /**
     * The current value
     */
    current: WidenLiteral<T>;
    /**
     * The start value
     */
    start: WidenLiteral<T>;
    /**
     * The property path that should be used to store the current value
     */
    path?: string;
    /**
     * The typical range of the target value, used to determine percentage change
     */
    range: ValueRange<T>;
    /**
     * The target value awaiting to be added to the `targetQueue`
     */
    committedTarget?: WidenLiteral<T>;
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
     * The percentage that the `target` must differ from the `committedTarget`,
     * the last target added to the `targetQueue`, or the `current` value  (in  that order)
     * before it is considered "changed". Depends on `range` being defined.
     */
    threshold?: number;
    /**
     * The number of seconds in which the `target` value must remain "changed" before it
     * becomes the `committedTarget`
     */
    delay?: number;
    /**
     * The number of seconds in which the `committedTarget` must
     * remain stable before it is pushed to the `targetQueue`
     */
    debounce?: number;
    /**
     * The maximum number of seconds to wait before the `committedTarget`
     * is pushed to the `targetQueue`
     */
    maxWait?: number;
    /**
     * The queue of committed target values that are still influencing the current value
     * (whose durations have not yet been exceeded)
     */
    targetQueue: TransitionTarget<WidenLiteral<T>>[];
    _delayTime: number;
    _debounceTime: number;
    _waitTime: number;
    _changePercent: number;
    /**
     *
     */
    update(deltaTime: number, c?: TransitionableConfig, changePercent?: number): void;
    private static _c;
    private static _cBlack;
    private _addTargetInfluence;
    _setCurrent(value: WidenLiteral<T>): void;
    _computePercentChange(): number;
    protected _config: Required<Pick<Transitionable<ValueTypes>, "multiplier" | "duration" | "easing" | "threshold" | "delay" | "debounce" | "maxWait">>;
    protected _updateConfig(c?: TransitionableConfig): Required<Pick<Transitionable<ValueTypes>, "multiplier" | "duration" | "easing" | "threshold" | "delay" | "debounce" | "maxWait">>;
}
export declare class LocalMatrixTransitionable extends Transitionable<THREE.Matrix4> {
    object: THREE.Object3D;
    constructor(object: THREE.Object3D);
    position: Transitionable<THREE.Vector3>;
    quaternion: Transitionable<THREE.Quaternion>;
    scale: Transitionable<THREE.Vector3>;
    autoRange: boolean;
    synchronizeComponents: boolean;
    update(deltaTime: number, c?: TransitionableConfig): void;
}
/**
 * Enables smooth interpolation of various kinds of values, with hysteresis
 */
export declare class Transitioner {
    object: THREE.Object3D;
    static disableAllTransitions: boolean;
    static DEFAULT_CONFIG: Required<TransitionableConfig>;
    /**
     * The amount of time (in milliseconds) it takes to smoothly
     * damp towards the target.
     *
     * By defualt, based on a progress threshold of 0.96
     *
     * progress = 1 - Math.exp(-time)
     * time = - Math.log(1-progress)
     */
    static NATURAL_DURATION: number;
    /**
     *
     */
    set active(active: boolean);
    get active(): boolean;
    private _active;
    /**
     * Specifies the desired parent coordinate system.
     */
    parentTarget: THREE.Object3D | null;
    /**
     * The local matrix transitionable
     */
    matrixLocal: LocalMatrixTransitionable;
    /**
     * The target world matrix, automatically computed from pose/layout properties
     */
    matrixWorldTarget: THREE.Matrix4;
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
     * The percentage that the `target` must differ from the `committedTarget`,
     * the last target added to the `targetQueue`, or the `current` value  (in  that order)
     * before it is considered "changed"
     */
    threshold?: number;
    /**
     * The number of seconds in which the `target` value must remain "changed" before it
     * becomes the `committedTarget`
     */
    delay?: number;
    /**
     * The number of seconds in which the `committedTarget` must
     * remain stable before it is pushed to the `targetQueue`
     */
    debounce?: number;
    /**
     * The maximum number of seconds to wait before the `committedTarget`
     * is pushed to the `targetQueue`
     */
    maxWait?: number;
    /**
     *
     */
    customTransitionables: Transitionable<ValueTypes>[];
    /**
     *
     * @param object
     */
    constructor(object: THREE.Object3D);
    /**
     * Add a transitionable
     * @param transitionable
     */
    add<T extends ValueType>(transitionable: TransitionerConstructOptions<T> | Transitionable<T>): Transitionable<T>;
    /**
     * Transitions pose, layout, and/or custom properties associated with an Object3D instance.
     *
     * When the transitioner is active, the object's pose (`position`, `quaternion`, and `scale`)
     * and layout (`layout.absolute`, `layout.relative`, etc.) properties are treated as
     * target values, and their corresponding target matrices are maintained in the transitioner
     * instance (e.g., `transitioner.matrix`, `transitioner.layoutMatrix`). Meanwhile, the object's
     * pose/layout matrices (`matrix` and `layout.matrix`) will only be updated when this `update`
     * method is called).
     *
     * If `targetParent` is set and differs from the current `object.parent`,
     * this method will smoothly switch to the new coordinate system.
     */
    update(deltaTime: number, autoActive?: boolean): void;
    private _setPropertyAtPath;
    /**
     * Ensure that this `object` is attached to the `targetParent` Object3D instance.
     * When the `transitioner` is active, this method ensures a smooth transition
     * to another coordinate system. If the `object` is already attached to the
     * `targetParent`, this method is effectively noop.
     */
    private _setParent;
}
