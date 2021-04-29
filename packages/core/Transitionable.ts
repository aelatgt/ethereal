
// import { cached, tracked, TrackedArray } from './tracking'
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
} from './math-utils'
import { EtherealLayoutSystem } from './EtherealLayoutSystem'

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
    constructor(options?:Partial<Transition>) {
        options && Object.assign(this, options)
    }
    public target?: TransitionableType<T>
    public duration?: number
    public easing?: Easing
    public blend?: boolean
    public elapsed?: number
}

export class TransitionConfig {
    constructor(config?:TransitionConfig) {
        config && Object.assign(this, config)
    }
    /**
     * A multiplier to influence the speed of the transition
     */
    multiplier?: number
    /**
     * The duration of the easing function in seconds
     */
    duration?: number 
    /**
     * The easing function 
     */
    easing?: (alpha:number) => number
    /**
     * The relative difference required to "stage" a transition.
     * 
     * A threshold of 0 means any difference will trigger a transition.
     * 
     * A threshold of 0.1 can be interpreted as a relative difference of 10%. 
     */
    threshold?: number
    /**s
     * The number of seconds the `target` must be maintained
     * beyond the `threshold` to automatically "stage" a transition
     */
    delay?: number
    /**
     * The number of seconds that the `stagedTarget` must remain 
     * stable to automatically "commit" a transition
     */
    debounce?: number
    /**
     * The maximum number of seconds before the `stagedTarget`
     * is committed
     */
    maxWait?: number
    /**
     * If true, blend transitions together
     */
    blend?: boolean
}

export class Transitionable<T extends MathType = MathType> extends TransitionConfig {

    constructor(
        public system:EtherealLayoutSystem<any>, 
        startValue:MathType,
        config?:TransitionConfig, 
        public parentConfig:TransitionConfig = system.transition)
    {
        super(config)
        this.reset(startValue as TransitionableType<T>)
        this._previousTarget = this._copy(this._previousTarget, this.target)
    }

    /** */
    needsUpdate = false

    private _copy(to?:TransitionableType<T>, from?:TransitionableType<T>) {
        if (typeof from === 'undefined') return undefined
        if (typeof from === 'number') return from
        const result = to ? (to as any).copy(from) : (from as any).clone()
        if (result && 'isBox3' in result) {
            const resultBox = result as Box3
            const resultSize = resultBox.getSize(this._size)
            if (resultBox.isEmpty() ||
                !isFinite(resultSize.x) ||
                !isFinite(resultSize.y) ||
                !isFinite(resultSize.z)) {
                resultBox.setFromCenterAndSize(V_000, V_000)
            }
        }
        return result
    }
    private _size = new Vector3

    private _isEqual(a?:TransitionableType<T>, b?:TransitionableType<T>) {
        if (a === undefined || b === undefined) return false
        if (a === b) return true
        if (typeof a === 'number') return a === b
        return (a as any)?.equals(b) || false
    }

    /**
     * Reset all states to the specified value, 
     * and remove all ongoing transitions
     */
    reset(v?:TransitionableType<T>) {
        this._start = this._copy(this._start, v)
        this._current = this._copy(this._current, v)
        this._target = this._copy(this._target, v)
        this.queue.length = 0
    }

    /**
     * The starting value for currently ongoing transitions
     */
    set start(value:TransitionableType<T>) {
        this._start = this._copy(this._start, value)
    }
    get start() {
        return this._start
    }
    private _start! : TransitionableType<T>
    
    /**
     * The current value. 
     */
    set current(value:TransitionableType<T>) {
        this._current = this._copy(this._current, value)
    }
    get current() {
        return this._current
    }
    private _current!: TransitionableType<T>

    /**
     * The "changed" reference value
     */
    set reference(value:TransitionableType<T>|undefined) {
        this._reference = this._copy(this._reference, value)
    }
    get reference() {
        return this._reference
    }
    private _reference? : TransitionableType<T>

    /**
     * The target value. 
     */
    set target(value:TransitionableType<T>) {
        this.enabled = true
        this._target = this._copy(this._target, value)
    }
    get target() {
        return this._target
    }
    private _target!: TransitionableType<T>

    
    /**
     * The queue of committed transitions that are still influencing the `current` value
     * (whose durations have not yet been exceeded)
     */
    readonly queue: Required<Transition<T>>[] = []

    /**
     * If false, this transitionable is inert
     */
    enabled = false

    /**
     * At 0, a new transition has started
     * Between 0 and 1 represents the transition progress
     * At 1, no transitions are active
     */
    get progress() {
        if (!this.enabled) return 1
        
        if (this.queue.length > 0) {
            const t = this.queue[this.queue.length-1]
            return t.elapsed / t.duration
        }
        
        return 1
    }

    /** 
     * Force the next update to not commit the target value
     **/
    forceWait = false

    /**
     * Force the next update to commit the target value,
     * or the specified transition.
     * If forceCommit is set while forceWait is also set, 
     * forceWait takes precedence. 
     */
    get forceCommit() {
        return this._forceCommit
    }
    set forceCommit(val: boolean | Transition<T>) {
        if (this._forceCommit === val) return
        this._forceCommit = val
    }
    private _forceCommit = false as boolean | Transition<T>

    /**
     * The relative difference between the target and last committed value.
     */
    get relativeDifference() {
        const lastTarget = this.queue[this.queue.length-1]?.target || this.start
        return typeof this.target !== 'undefined' ? computeRelativeDifference(lastTarget, this.target) : 0
    }

    /**
     * The relative difference between the target and reference value
     */
    get referenceRelativeDifference() {
        return typeof this.reference !== 'undefined' && typeof this.target !== 'undefined' ? 
            computeRelativeDifference(this.reference, this.target) : Infinity
    }

    /**
     * The transition config after accounting for adapter and system defaults
     */
    get resolvedConfig() {
        const r = this._resolvedConfig
        const adapterConfig = this.parentConfig
        const systemConfig = this.system.transition
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
    private _resolvedConfig = new TransitionConfig as Required<TransitionConfig>


    delayTime = 0
    debounceTime = 0

    // waitTime = 0

    private _previousStatus: 'unchanged'|'changed'|'settling'|'committing' = 'unchanged'
    get previousStatus() {
        return this._previousStatus
    }

    /**
     * Describes the status of the target value
     * 
     * "unchanged" - the target value is unchanged relative to the last committed value
     * "changed" - the target value has changed relative to the `reference` value or last committed value
     * "settling" - the target value has changed, pending stabalization/timeout, or reversion to "unchanged" state
     * "committing" - the target value will be accepted as a new transition targets
     */
    get status() {
        if (this.needsUpdate) {
            this._previousStatus = this._status
            this._status = this._computeStatus()
        }
        return this._status
    }
    private _status : 'unchanged'|'changed'|'settling'|'committing' = 'unchanged'
    private _computeStatus() : 'unchanged'|'changed'|'settling'|'committing' {

        if (this.forceCommit) return 'committing'

        const config = this.resolvedConfig
        const threshold = config.threshold
        const delta = this.system.deltaTime * config.multiplier
        const delay = this.delayTime + delta
        const debounce = this.debounceTime + delta
        // const wait = this.waitTime + delta
        const relDiff = this.relativeDifference
        const changed = relDiff > threshold

        if (!changed) return 'unchanged'

        if (!this.forceWait && ((delay >= config.delay && debounce >= config.debounce) || delay >= config.maxWait)) {
            return 'committing'
        }

        const refRelDiff = this.referenceRelativeDifference
        const stable = refRelDiff < threshold

        if (!stable && delay >= config.delay) {
            return 'changed'
        }

        return 'settling'
    }

    /**
     * 
     */
    private _updateTransitionable() {
        const deltaTime  = this.system.deltaTime
        const config = this.resolvedConfig
        const queue = this.queue
        const status = this.status
        const delta = deltaTime * config.multiplier

        // Finite Impulse Response Interruptable Transitions

        while (queue.length && queue[0].elapsed >= queue[0].duration) {
            this.start = queue.shift()!.target
        }
        
        this.current = this.start
        const current = this._current
        let previousTarget = this.start
        for (const transition of queue) {
            this._addTransitionToCurrent(current, previousTarget, transition)
            transition.elapsed += delta
            previousTarget = transition.target
            if (!transition.blend) break
        }

        // Hysteresis-Aware Target Change Trigger

        this.debounceTime += delta
        this.delayTime += delta

        switch (status) {
            case 'settling': break
            case 'changed': 
                this.reference = this.target
                this.debounceTime = 0
                break
            case 'unchanged': 
                this.reference = undefined
                this.delayTime = 0
                // if relative difference is greater than 0
                // (and less then the change threshold),
                // instantly update the last committed value to the 
                // current target
                // if (this.relativeDifference > 0) {
                //     if (this.queue.length > 0) {
                //         const t = this.queue[this.queue.length-1]
                //         t.target = this._copy(t.target, this.target)
                //     } else {
                //         this.start = this._copy(this.start, this.target)
                //     }
                // }
                break
            case 'committing': 
                this.delayTime = 0
                this.debounceTime = 0
                const transition = typeof this.forceCommit === 'object' ? 
                    this.forceCommit : new Transition<T>()
                transition.target = transition.target ?? this._copy(undefined, this.target)
                transition.duration = transition.duration ?? config.duration
                transition.easing = transition.easing ?? config.easing
                transition.blend = transition.blend ?? config.blend
                transition.elapsed = transition.elapsed ?? 0
                queue.push(transition as Required<Transition<T>>)
                this.forceCommit = false
                break
        }
        this.forceWait = false
    }

    private _scratchV2 = new Vector2
    private _scratchV3 = new Vector3
    private _scratchQ = new Quaternion
    private _scratchBox = new Box3
    private _scratchColor = new Color
    private _blackColor = new Color(0,0,0)

    private _addTransitionToCurrent = (current:TransitionableType<T>, start:TransitionableType<T>, transition:Required<Transition<T>>) => {
        if (transition.elapsed === 0) return 
        
        const alpha = transition.easing( Math.min(transition.elapsed / transition.duration, 1) )
        const target = transition.target

        if (typeof target === 'number') {
            this._current = current as number + MathUtils.lerp(target - (start as number), 0, 1-alpha) as any
            return
        } 
        
        if ('isVector3' in target) {
            const c = current as THREE.Vector3
            const s = start as THREE.Vector3
            const e = target as THREE.Vector3
            const amount = this._scratchV3.copy(e).sub(s).lerp(V_000, 1-alpha)
            this._current = c.add(amount) as any
            return
        } 
        
        if ('isVector2' in target) {
            const c = current as THREE.Vector2
            const s = start as THREE.Vector2
            const e = target as THREE.Vector2
            const amount = this._scratchV2.copy(e).sub(s).lerp(V_00, 1-alpha)
            this._current = c.add(amount) as any
            return
        } 
        
        if ('isQuaternion' in target) {
            const c = current as THREE.Quaternion
            const s = start as THREE.Quaternion
            const e = target as THREE.Quaternion
            const amount = this._scratchQ.copy(s).inverse().multiply(e).slerp(Q_IDENTITY, 1-alpha)
            this._current = c.multiply(amount).normalize() as any
            return
        } 
        
        if ('isColor' in target) {
            const c = current as THREE.Color
            const s = start as THREE.Color
            const e = target as THREE.Color
            const amount = this._scratchColor.copy(e).sub(s).lerp(this._blackColor, 1-alpha)
            this._current = c.add(amount) as any
            return
        } 
        
        if ('isBox3' in target) {
            const c = current as THREE.Box3
            const s = start as THREE.Box3
            const e = target as THREE.Box3
            const minAmount = this._scratchBox.min.copy(e.min).sub(s.min).lerp(V_000, 1-alpha)
            const maxAmount = this._scratchBox.max.copy(e.max).sub(s.max).lerp(V_000, 1-alpha)
            c.min.add(minAmount)
            c.max.add(maxAmount)
            if (c.isEmpty()) {
                const min = c.min
                const max = c.max
                if (min.x > max.x) this._swap(min,max,'x')
                if (min.y > max.y) this._swap(min,max,'y')
                if (min.z > max.z) this._swap(min,max,'z')
            }
            this._current = c as any
            return
        }
    }

    private _swap(a:Vector3, b:Vector3, key:'x'|'y'|'z') {
        const aValue = a[key]
        const bValue = b[key]
        a[key] = bValue
        b[key] = aValue
    }

    /**
     * 
     */
    update(force=false) {

        if (!this.needsUpdate && !force) return

        if (!this._isEqual(this._previousTarget, this.target)) {
            this._target = this._target
            this.enabled = true
        }

        this._previousTarget = this._copy(this._previousTarget, this.target)

        if (!this.enabled) return

        const syncGroup = this.syncGroup as Set<Transitionable>
        if (!this.forceCommit && syncGroup) {
            for (const t of syncGroup) {
                if (t.enabled && t.status === 'committing') {
                    for (const to of syncGroup) { 
                        if (to.needsUpdate && to.forceCommit === false) to.forceCommit = true 
                    }
                    break
                }
            }
        }

        this._updateTransitionable()
        this.needsUpdate = false
    }
    private _previousTarget! : TransitionableType<T>

    set syncGroup(group:Set<any>|undefined) {
        if (this._syncGroup) this._syncGroup.delete(this)
        this._syncGroup = group
        group?.add(this)
    }
    get syncGroup() {
        return this._syncGroup
    }
    private _syncGroup?:Set<any>
}