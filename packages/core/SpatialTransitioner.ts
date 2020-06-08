
import { cached, tracked, TrackedArray } from './tracking'
import { 
    Vector2, 
    Vector3, 
    Quaternion, 
    Box3, 
    Color, 
    MathUtils, 
    V_00, 
    V_000, 
    Q_IDENTITY, 
    computeRelativeDifference,
    MathType
} from './math'
import { EtherealSystem } from './EtherealSystem'

import * as easingImport from '@popmotion/easing'

// becuase api-extractor complains about `import _ as _ from`,
// we have to redeclare types here
export type Easing = (v: number) => number;
export type EasingModifier = (easing: Easing) => Easing;
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

export const easing = easingImport as EasingModule

export type TransitionableType<T extends MathType> = T extends number ? number : T // widen number literal types

export class Transition<T extends MathType = MathType>{
    constructor(
        public target: TransitionableType<T>,
        public duration: number,
        public easing: Easing,
        public blend = true
    ) {}
    public elapsed = 0
}

export class TransitionableConfig {
    constructor(config?:TransitionableConfig) {
        config && Object.assign(this, config)
    }
    /**
     * A multiplier to influence the speed of the transition
     */
    @tracked multiplier?: number
    /**
     * The duration of the easing function
     */
    @tracked duration?: number 
    /**
     * The easing function 
     */
    @tracked easing?: (alpha:number) => number
    /**
     * The relative difference required to "stage" a transition.
     * 
     * A threshold of 0 means any difference will trigger a transition.
     * 
     * A threshold of 0.1 can be interpreted as a relative difference of 10%. 
     */
    @tracked threshold?: number
    /**s
     * The number of seconds the `target` must be maintained
     * beyond the `threshold` to automatically "stage" a transition
     */
    @tracked delay?: number
    /**
     * The number of seconds that the `stagedTarget` must remain 
     * stable to automatically "commit" a transition
     */
    @tracked debounce?: number
    /**
     * The maximum number of seconds before the `stagedTarget`
     * is committed
     */
    @tracked maxWait?: number
    /**
     * If true, blend transitions together
     */
    @tracked blend?: boolean
}

export class Transitionable<T extends MathType = MathType> extends TransitionableConfig {

    constructor(
        public system:EtherealSystem, 
        startValue:T,
        config?:TransitionableConfig, 
        public parentConfig:TransitionableConfig = system.transitioner.defaults)
    {
        super(config)
        this._start = startValue as TransitionableType<T>
        this._current = startValue as TransitionableType<T>
    }

    private _copy(to?:TransitionableType<T>, from?:TransitionableType<T>) {
        if (typeof from === 'undefined') return undefined
        if (typeof from === 'number') return from
        return to ? (to as any).copy(from) : (from as any).clone()
    }

    private _isEqual(to?:TransitionableType<T>, from?:TransitionableType<T>) {
        if (from === to) return true
        const epsillon = (this.start as Quaternion).isQuaternion ? 
            this.system.epsillonDegrees : this.system.epsillonMeters
        return from && to ? computeRelativeDifference(from, to) > epsillon : false
    }

    /**
     * The starting value for currently ongoing transitions
     */
    set start(value:TransitionableType<T>) {
        if (this._isEqual(this._start, value)) return
        this._start = this._copy(this._start, value)
    }
    get start() {
        return this._start
    }
    @tracked private _start! : TransitionableType<T>
    
    /**
     * The current value. 
     * Reading this value causes the transitionable to update for the
     * current frame, if it has not been updated already. 
     */
    set current(value:TransitionableType<T>) {
        if (this._isEqual(this._current, value)) return
        this._current = this._copy(this._current, value)
    }
    get current() {
        this.update()
        return this._current
    }
    @tracked private _current!: TransitionableType<T>

    /**
     * The value at the last "changed" state
     */
    set reference(value:TransitionableType<T>|undefined) {
        if (this._isEqual(this._reference, value)) return
        this._reference = this._copy(this._reference, value)
    }
    get reference() {
        return this._reference
    }
    @tracked private _reference? : TransitionableType<T>

    /**
     * The desired target value. This value can be set or retrieved
     * multiple times without causing the transitionable to be updated,
     * which is useful for computing metrics against various target values,
     * before settling on one.
     */
    set target(value:TransitionableType<T>|undefined) {
        if (this._isEqual(this._target, value)) return
        this._target = this._copy(this._target, value)
    }
    get target() {
        return this._target
    }
    @tracked private _target?: TransitionableType<T>

    
    /**
     * The queue of committed transitions that are still influencing the `current` value
     * (whose durations have not yet been exceeded)
     */
    readonly transitions: Transition<T>[] = new TrackedArray

    /**
     * If true, when another synced transitionable attached
     * to the same adapter is in state `commiting`, this
     * transitionable will be too
     */
    @tracked synced = false

    /**
     * Force the next update to commit the target value
     */
    @tracked forceCommit = false

    /**
     * The relative difference between the target and last committed value.
     */
    @cached get relativeDifference() {
        const lastTarget = this.transitions[this.transitions.length-1]?.target || this.start
        return computeRelativeDifference(lastTarget, this.target)
    }

    /**
     * The relative difference between the target and reference value
     */
    @cached get referenceRelativeDifference() {
        return this.reference ? computeRelativeDifference(this.reference, this.target) : Infinity
    }

    /**
     * The transition config after accounting for adapter and system defaults
     */
    @cached get resolvedConfig() {
        const r = this._resolvedConfig
        const adapterConfig = this.parentConfig
        const systemConfig = this.system.transitioner.defaults
        r.multiplier = this.multiplier ?? adapterConfig?.multiplier ?? systemConfig.multiplier
        r.duration = this.duration ?? adapterConfig?.duration ?? systemConfig.duration
        r.easing = this.easing ?? adapterConfig?.easing ?? systemConfig.easing
        r.threshold = this.threshold ?? adapterConfig?.threshold ?? systemConfig.threshold
        r.delay = this.delay ?? adapterConfig?.delay ?? systemConfig.delay
        r.debounce = this.debounce ?? adapterConfig?.debounce ?? systemConfig.debounce
        r.maxWait = this.maxWait ?? adapterConfig?.maxWait ?? systemConfig.maxWait
        r.blend = this.blend ?? adapterConfig?.blend ?? systemConfig.blend
        return r
    }
    private _resolvedConfig = new TransitionableConfig as Required<TransitionableConfig>


    @tracked delayTime = 0
    @tracked debounceTime = 0
    @tracked waitTime = 0

    /**
     * Describes the state of the target value
     * 
     * "unchanged" - the target value is unchanged relative to the last committed value
     * "changed" - the target value has changed relative to the `reference` value or last committed value
     * "settling" - the target value has changed, pending stabalization/timeout, or reversion to "unchanged" state
     * "committing" - the target value will be accepted as a new transition targets
     */
    @cached get state() : 'unchanged'|'changed'|'settling'|'committing' {
        const config = this.resolvedConfig
        const delta = this.system.deltaTime * config.multiplier
        const delay = this.delayTime + delta
        const debounce = this.debounceTime + delta
        const wait = this.waitTime + delta
        const relDiff = this.relativeDifference
        const changed = relDiff >= config.threshold

        if (typeof this.target === 'undefined') return 'unchanged'
        
        if (this.forceCommit) return 'committing'

        if (!changed) return 'unchanged'

        if ((delay >= config.delay && debounce >= config.debounce) || wait >= config.maxWait) {
            return 'committing'
        }

        const refRelDiff = this.referenceRelativeDifference
        const stable = refRelDiff < config.threshold

        if (!stable && delay >= config.delay) {
            return 'changed'
        }

        if (stable) {
            return 'settling'
        }

        return 'unchanged'
    }

    /**
     * 
     */
    update(force=false) {
        if (!this.needsUpdate && !force) return
        this.needsUpdate = false
        this.system.transitioner.update(this, this.system.deltaTime)
    }

    /** */
    needsUpdate = false
}


/**
 * Enables smooth interpolation of various kinds of values, with hysteresis
 */
export class SpatialTransitioner {

    constructor(public system:EtherealSystem){}

    defaults = new TransitionableConfig({
        multiplier: 1,
        duration: 1.5,
        easing: easing.easeInOut,
        threshold: 1e-2,
        delay: 0,
        debounce: 0,
        maxWait: 4,
        blend: true
    }) as Required<TransitionableConfig>

    /**
     * Update transitionables associated with an adapter 
     */
    update(transitionable:Transitionable, deltaTime:number) {
        if (transitionable.synced) {
            for (const t of this.system.transitionables) {
                if (t.parentConfig === transitionable.parentConfig && t.synced && t.state === 'committing') {
                    transitionable.forceCommit = true
                    break
                }
            }
        }
        this._updateTransitionable(transitionable, deltaTime)
    }

    /**
     * 
     */
    private _updateTransitionable(t:Transitionable, delatTime:number) {
        const config = t.resolvedConfig
        const queue = t.transitions
        const state = t.state
        const delta = delatTime * config.multiplier

        switch (state) {
            case 'changed': 
                t.reference = t.target
                t.debounceTime = 0
                // continue
            case 'settling':
                if (!t.reference) {
                    t.delayTime += delta
                } else {
                    t.debounceTime += delta
                    t.waitTime += delta
                }
                break
            case 'committing': 
                queue.push({
                    target: (t.reference = t.target!),
                    easing: config.easing,
                    duration: config.duration,
                    blend: config.blend,
                    elapsed: 0
                })
                // continue
            case 'unchanged': 
                t.reference = undefined
                t.delayTime = 0
                t.debounceTime = 0
                t.waitTime = 0
                break
        }

        while (queue.length && queue[0].elapsed >= queue[0].duration) {
            t.start = queue.shift()!.target
        }
        
        t.current = t.start
        let previousTarget = t.start
        for (const transition of queue) {
            transition.elapsed += delta
            this._addTransitionToCurrent(t, previousTarget, transition)
            previousTarget = transition.target
            if (!transition.blend) break
        }
    }

    private _scratchV2 = new Vector2
    private _scratchV3 = new Vector3
    private _scratchQ = new Quaternion
    private _scratchBox = new Box3
    private _scratchColor = new Color
    private _blackColor = new Color(0,0,0)

    private _addTransitionToCurrent(t:Transitionable, start:MathType, transition:Transition) {
        const alpha = transition.duration > 0 ? transition.easing( Math.min(transition.elapsed / transition.duration, 1) ) : 1

        if (typeof transition.target === 'number') {
            t.current += MathUtils.lerp(transition.target - (start as number), 0, 1-alpha) as any
            return
        } 
        
        if ('isVector3' in transition.target) {
            const c = t.current as THREE.Vector3
            const s = start as THREE.Vector3
            const e = transition.target as THREE.Vector3
            const amount = this._scratchV3.copy(e).sub(s).lerp(V_000, 1-alpha)
            c.add(amount)
            return
        } 
        
        if ('isVector2' in transition.target) {
            const c = t.current as THREE.Vector2
            const s = start as THREE.Vector2
            const e = transition.target as THREE.Vector2
            const amount = this._scratchV2.copy(e).sub(s).lerp(V_00, 1-alpha)
            c.add(amount)
            return
        } 
        
        if ('isQuaternion' in transition.target) {
            const c = t.current as THREE.Quaternion
            const s = start as THREE.Quaternion
            const e = transition.target as THREE.Quaternion
            const amount = this._scratchQ.copy(s).inverse().multiply(e).slerp(Q_IDENTITY, 1-alpha)
            c.multiply(amount).normalize()
            return
        } 
        
        if ('isColor' in transition.target) {
            const c = t.current as THREE.Color
            const s = start as THREE.Color
            const e = transition.target as THREE.Color
            const amount = this._scratchColor.copy(e).sub(s).lerp(this._blackColor, 1-alpha)
            c.add(amount)
            return
        } 
        
        if ('isBox3' in transition.target) {
            const c = t.current as THREE.Box3
            const s = start as THREE.Box3
            const e = transition.target as THREE.Box3
            const minAmount = this._scratchBox.min.copy(e.min).sub(s.min).lerp(V_000, 1-alpha)
            const maxAmount = this._scratchBox.max.copy(e.max).sub(s.max).lerp(V_000, 1-alpha)
            if (isFinite(c.min.x)) c.min.x = 0
            if (isFinite(c.min.y)) c.min.y = 0
            if (isFinite(c.min.z)) c.min.z = 0
            if (isFinite(c.max.x)) c.max.x = 0
            if (isFinite(c.max.y)) c.max.y = 0
            if (isFinite(c.max.z)) c.max.z = 0
            c.min.add(minAmount)
            c.max.add(maxAmount)
            return
        }
    }

    // private _copy(to:TransitionableType|undefined, from:TransitionableType) {
    //     if (typeof to === 'number') {
    //         return from
    //     }
    //     return to ? (to as any).copy(from) : (from as any).clone()
    // }

    // private _setPropertyAtPath(t:Transitionable) {
    //     if (t.path) {
    //         if (typeof t.path === 'string') {
    //             if (typeof t.current === 'number') {
    //                 set(t.path, this.object, t.current)
    //             } else {
    //                 const property = resolve(t.path, this.object)
    //                 if (property) property.copy(t.current)
    //             }
    //         } else {
    //             for (const p of t.path) {
    //                 if (typeof t.current === 'number') {
    //                     set(p, this.object, t.current)
    //                 } else {
    //                     const property = resolve(p, this.object)
    //                     if (property) property.copy(t.current)
    //                 }
    //             }
    //         }
    //     }
    // }

    /**
     * Ensure that this `object` is attached to the `targetParent` Object3D instance. 
     * When the `transitioner` is active, this method ensures a smooth transition 
     * to another coordinate system. If the `object` is already attached to the 
     * `targetParent`, this method is effectively noop.
     */
    // private _setParent() {
    //     const parent = this.parentTarget
    //     const o = this.object
    //     if (!parent) return
    //     if (o.parent !== parent) {
    //         o.updateWorldMatrix(true, true)
    //         const originalMatrixWorld = scratchMat_1.copy(o.matrixWorld)
    //         o.parent && o.parent.remove(o)
    //         parent && parent.add(o)
    //         parent.updateWorldMatrix(true, true)
    //         const inverseParentMatrixWorld = parent ? scratchMat_2.getInverse(parent.matrixWorld) : scratchMat_2.identity()
    //         o.matrix.copy(inverseParentMatrixWorld.multiply(originalMatrixWorld))
    //         // const transitioner = o.layout.transitioner
    //         // if (transitioner.active) {
    //         //     transitioner.layout.weight = 0
    //         //     o.matrix.decompose(transitioner.position, transitioner.quaternion, transitioner.scale)
    //         // } else {
    //         // }
    //         o.matrix.decompose(o.position, o.quaternion, o.scale)
    //     }
    // }
}