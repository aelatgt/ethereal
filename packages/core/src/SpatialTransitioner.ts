
import { memo, tracked, TrackedArray } from './tracking'
import { Vector2, Vector3, Quaternion, Box3, Color, MathUtils, V_00, V_000, Q_IDENTITY } from './math'
import type { SpatialAdapter } from './SpatialAdapter'

import * as easing from '@popmotion/easing'
export {easing}

// type WidenLiteral<T> = T extends number ? number : T
type TransitionableTypes = number|THREE.Vector2|THREE.Vector3|THREE.Quaternion|THREE.Color|THREE.Box3
export type TransitionableType<T extends TransitionableTypes=TransitionableTypes> = T extends number ? number : T // WidenLiteral<T>

export class Transition<T extends TransitionableType = TransitionableType>{
    constructor(
        public target: TransitionableType<T>,
        public duration: number,
        public easing: (number:number) => number,
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
     * The relative difference required to "stage" a transition
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

export class Transitionable<T extends TransitionableType = TransitionableType> extends TransitionableConfig {

    constructor(public adapter:SpatialAdapter, value:TransitionableType<T>, config?:TransitionableConfig) {
        super(config)
        const t = this.target = value
        // @ts-ignore
        if (typeof this.current === 'undefined') 
            this.current = (typeof t === 'number' ? t : (t as any).clone()) as  TransitionableType<T>
        // @ts-ignore
        if (typeof this.start === 'undefined') 
            this.start = (typeof t === 'number' ? t : (t as any).clone()) as  TransitionableType<T>
    }

    /**
     * The desired target value
     */
    @tracked target: TransitionableType<T>

    /**
     * The current value
     */
    @tracked current : TransitionableType<T>

    /**
     * The value at the last "changed" state
     */
    @tracked reference? : TransitionableType<T>

    /**
     * The starting value for currently ongoing transitions
     */
    @tracked start : TransitionableType<T>
    
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
     * 
     * The relative difference is a unitless scalar measure of the difference
     * between the `target` value and the previous target value (staged or committed)
     * @see https://en.wikipedia.org/wiki/Relative_change_and_difference
     * 
     * Exactly how relative difference is calculated is based on the value type:
     * 
     * number - absolute difference / avg distance from 0
     * vector - magnitude of difference / avg magnitude
     * quaternion - angular difference / 180 deg
     * box - avg magnitude of corner difference / avg magnitude of size
     * 
     * If there is no change, the relative difference is 0
     * Otherwise, the relative difference is positive. 
     */
    @memo get relativeDifference() {
        const lastTarget = this.transitions[this.transitions.length-1].target || this.start
        return this._computeRelativeDifference(this.target, lastTarget)
    }

    /**
     * The relative difference between the target and reference value
     */
    @memo get referenceRelativeDifference() {
        return this.reference ? this._computeRelativeDifference(this.target, this.reference) : Infinity
    }

    /**
     * The transition config after accounting for adapter and system defaults
     */
    @memo get resolvedConfig() {
        const r = this._resolvedConfig
        const adapterConfig = this.adapter.transition
        const systemConfig = this.adapter.system.transitioner.defaults
        r.multiplier = this.multiplier ?? adapterConfig.multiplier ?? systemConfig.multiplier
        r.duration = this.duration ?? adapterConfig.duration ?? systemConfig.duration
        r.easing = this.easing ?? adapterConfig.easing ?? systemConfig.easing
        r.threshold = this.threshold ?? adapterConfig.threshold ?? systemConfig.threshold
        r.delay = this.delay ?? adapterConfig.delay ?? systemConfig.delay
        r.debounce = this.debounce ?? adapterConfig.debounce ?? systemConfig.debounce
        r.maxWait = this.maxWait ?? adapterConfig.maxWait ?? systemConfig.maxWait
        r.blend = this.blend ?? adapterConfig.blend ?? systemConfig.blend
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
    @memo get state() : 'unchanged'|'changed'|'settling'|'committing' {
        const config = this.resolvedConfig
        const delta = this.adapter.system.deltaTime * config.multiplier
        const delay = this.delayTime + delta
        const debounce = this.debounceTime + delta
        const wait = this.waitTime + delta
        const relDiff = this.relativeDifference
        const changed = relDiff >= config.threshold

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

    private static _scratchV2 = new Vector2
    private static _scratchV3 = new Vector3

    private _computeRelativeDifference(start:TransitionableType<T>, end:TransitionableType<T>) {

        if (typeof start === 'number') {
            const s = start as number
            const e = end as number
            if (e-s === 0) return 0
            return Math.abs(e-s) / ((Math.abs(e) + Math.abs(s))/2)
        }
        
        if ('isVector3' in start) {
            const s = start as THREE.Vector3
            const e = end as THREE.Vector3
            if (e.equals(s)) return 0
            const diffMagnitude = Transitionable._scratchV3.subVectors(e, s).length()
            const avgMagnitude = (e.length() + s.length())/2
            return diffMagnitude / avgMagnitude
        } 
        
        if ('isVector2' in start) {
            const s = start as THREE.Vector2
            const e = end as THREE.Vector2
            if (e.equals(s)) return 0
            const diffMagnitude = Transitionable._scratchV2.subVectors(e, s).length()
            const avgMagnitude = (e.length() + s.length())/2
            return diffMagnitude / avgMagnitude
        } 
        
        if ('isQuaternion' in start) {
            const s = start as THREE.Quaternion
            const e = end as THREE.Quaternion
            if (s.equals(e)) return 0
            return Math.abs(s.angleTo(e) / Math.PI)
        } 
        
        if ('isColor' in start) {
            const s = start as THREE.Color
            const e = end as THREE.Color
            if (s.equals(e)) return 0
            const v = Transitionable._scratchV3
            const diffMagnitude = v.set(
                Math.abs(e.r - s.r), 
                Math.abs(e.g - s.g), 
                Math.abs(e.b - s.b)
            ).length()
            const avgMagnitude = (v.set(e.r,e.g,e.b).length() + v.set(s.r,s.g,s.b).length()) / 2
            return diffMagnitude/avgMagnitude
        } 
        
        if ('isBox3' in start) {
            const s = start as THREE.Box3
            const e = end as THREE.Box3
            if (s.equals(e)) return 0
            const v = Transitionable._scratchV3
            const minDiffMagnitude = v.subVectors(e.min,s.min).length()
            const maxDiffMagnitude = v.subVectors(e.max,s.max).length()
            const avgDiffMagnitude = (minDiffMagnitude + maxDiffMagnitude) / 2
            const avgSizeMagnitude = (e.getSize(v).length() + s.getSize(v).length()) / 2
            return avgDiffMagnitude / avgSizeMagnitude
        }

        return Infinity
    }
}


/**
 * Enables smooth interpolation of various kinds of values, with hysteresis
 */
export class SpatialTransitioner {

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
    update(adapter:SpatialAdapter) {
        // determine if synced transition is needed
        let syncedCommit = false
        for (const t of adapter.transitionables) {
            if (t.synced && t.state === 'committing') {
                syncedCommit = true
                break
            }
        }
        // update transitionables
        for (const t of adapter.transitionables) {
            if (t.synced && syncedCommit) t.forceCommit = true
            this._updateTransitionable(t)
        }
    }

    /**
     * 
     */
    private _updateTransitionable(t:Transitionable) {
        const config = t.resolvedConfig
        const queue = t.transitions
        const state = t.state
        const delta = t.adapter.system.deltaTime * config.multiplier

        switch (state) {
            case 'changed': 
                t.reference = this._copy(t.reference, t.target)
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
                    target: this._copy(t.reference, t.target),
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
        
        t.current = this._copy(t.current, t.start)
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

    private _addTransitionToCurrent(t:Transitionable, start:TransitionableType, transition:Transition) {
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

    private _copy(to:TransitionableType|undefined, from:TransitionableType) {
        if (typeof to === 'number') {
            return from
        }
        return to ? (to as any).copy(from) : (from as any).clone()
    }

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