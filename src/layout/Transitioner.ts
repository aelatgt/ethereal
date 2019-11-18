import * as THREE from 'three'
import { vectors2, vectors, quaternions, matrices, V_00, V_000, Q_IDENTITY } from '../utils'
import * as e from '@popmotion/easing'
import { isUndefined } from 'util';

// redecalre popmotion types here so that the consumer doesn't have to 
// add '@popmotion/easing' as a dependency to get the types
/**
 * Easing functions from '@popmotion/easing'
 */
namespace Easings {
    export declare type Easing = (v: number) => number;
    export declare type EasingModifier = (easing: Easing) => Easing;
    export declare const reversed: EasingModifier;
    export declare const mirrored: EasingModifier;
    export declare const createReversedEasing: EasingModifier;
    export declare const createMirroredEasing: EasingModifier;
    export declare const createExpoIn: (power: number) => Easing;
    export declare const createBackIn: (power: number) => Easing;
    export declare const createAnticipateEasing: (power: number) => Easing;
    export declare const linear: Easing;
    export declare const easeIn: Easing;
    export declare const easeOut: Easing;
    export declare const easeInOut: Easing;
    export declare const circIn: Easing;
    export declare const circOut: Easing;
    export declare const circInOut: Easing;
    export declare const backIn: Easing;
    export declare const backOut: Easing;
    export declare const backInOut: Easing;
    export declare const anticipate: Easing;
    export declare const bounceOut: (p: number) => number;
    export declare const bounceIn: (p: number) => number;
    export declare const bounceInOut: (p: number) => number;
    export declare function cubicBezier(mX1: number, mY1: number, mX2: number, mY2: number): (aX: number) => number;
}

const easing = (e as any) as typeof Easings

export {easing}

function defined(...obj:any[]) {
    for (const o of obj) {
        if (typeof o !== 'undefined') return o
    }
}

type WidenLiteral<T> = T extends number ? number : T

export type Multiplier<T> = number | (T extends THREE.Matrix4 ? {position?:number,scale?:number,quaternion?:number} : never)

export class TransitionTarget<T extends ValueType = ValueType>{
    constructor(
        public value: T,
        public duration: number,
        public easing: (number) => number
    ) {}
    public elapsed: 0
}

type ValueTypes = number|THREE.Vector2|THREE.Vector3|THREE.Quaternion|THREE.Color|THREE.Matrix4|THREE.Box3
export type ValueType<T extends ValueTypes=ValueTypes> = WidenLiteral<T>

export type ValueRange<T> = T extends THREE.Vector2|THREE.Vector3 ? T : 
    T extends THREE.Matrix4|THREE.Box3 ? THREE.Vector3 : 
    T extends number ? number : never

export type TransitionableConstructorKeys = 
    'target'|'multiplier'|'duration'|'easing'|'threshold'|
    'delay'|'debounce'|'maxWait'|'path'
export type TransitionerConstructOptions<T extends ValueType> = Pick<Transitionable<T>, TransitionableConstructorKeys>

export type TransitionableConfig = Pick<Transitionable<ValueType>,'delay'|'debounce'|'maxWait'|'multiplier'|'duration'|'easing'|'threshold'>

export class Transitionable<T extends ValueType = ValueType> {

    constructor(config:TransitionerConstructOptions<T>) {
        Object.assign(this, config)
        const t = this.target
        if (typeof this.current === 'undefined') 
            this.current = (typeof t === 'number' ? t : (t as any).clone()) as  WidenLiteral<T>
        if (typeof this.start === 'undefined') 
            this.start = (typeof t === 'number' ? t : (t as any).clone()) as  WidenLiteral<T>
    }

    /**
     * The desired target value
     */
    target: WidenLiteral<T>

    /**
     * The current value
     */
    current : WidenLiteral<T>

    /**
     * The start value
     */
    start : WidenLiteral<T>

    /**
     * The property path that should be used to store the current value
     */
    path? : string
    
    /**
     * The typical range of the target value, used to determine percentage change
     */
    range: ValueRange<T>
    /**
     * The target value awaiting to be added to the `targetQueue`
     */
    committedTarget?: WidenLiteral<T>
    /**
     * A multiplier to influence the speed of the transition
     */
    multiplier?: number = undefined
    /**
     * The duration of the easing function
     */
    duration?: number  = undefined
    /**
     * The easing function 
     */
    easing?: (alpha:number) => number = undefined
    /**
     * The percentage that the `target` must differ from the `committedTarget`, 
     * the last target added to the `targetQueue`, or the `current` value  (in  that order)
     * before it is considered "changed". Depends on `range` being defined. 
     */
    threshold?: number = undefined
    /**
     * The number of seconds in which the `target` value must remain "changed" before it
     * becomes the `committedTarget`
     */
    delay?: number = undefined
    /**
     * The number of seconds in which the `committedTarget` must 
     * remain stable before it is pushed to the `targetQueue`
     */
    debounce?: number = undefined
    /**
     * The maximum number of seconds to wait before the `committedTarget`
     * is pushed to the `targetQueue`
     */
    maxWait?: number = undefined
    /**
     * The queue of committed target values that are still influencing the current value
     * (whose durations have not yet been exceeded)
     */
    targetQueue: TransitionTarget<WidenLiteral<T>>[] = []

    _delayTime = 0
    _debounceTime = 0
    _waitTime = 0

    _changePercent = 0

    /**
     * 
     */
    update(deltaTime:number, c?:TransitionableConfig, changePercent?:number) {
        const config = this._updateConfig(c)
        const queue = this.targetQueue
        const target = this.target
        this._changePercent = changePercent = typeof changePercent === 'number' ? changePercent : this._computePercentChange()
        deltaTime *= config.multiplier
        
        if (changePercent > config.threshold) {
            if (this._delayTime > config.delay) {
                if (typeof target === 'number') this.committedTarget = target as any
                else {
                    if (this.committedTarget) (this.committedTarget as any).copy(target)
                    else this.committedTarget = (target as any).clone()
                }
                this._delayTime = 0
                this._debounceTime = 0
            }
            this._delayTime += deltaTime
        } else {
            if (typeof this.committedTarget !== 'undefined') this._delayTime = 0
            this._debounceTime += deltaTime
        }

        if (this.committedTarget) this._waitTime += deltaTime

        if (this.committedTarget && (this._debounceTime > config.debounce || this._waitTime > config.maxWait)) {
            queue.push({
                value: this.committedTarget,
                easing: config.easing,
                duration: config.duration,
                elapsed: 0
            })
            this.committedTarget = undefined
            this._waitTime = 0
        }
        
        while (queue.length && queue[0].elapsed > queue[0].duration) {
            this.start = queue.shift()!.value
        }
        
        this._setCurrent(this.start)
        let previousTarget = this.start
        for (const target of queue) {
            target.elapsed += deltaTime
            this._addTargetInfluence(previousTarget, target)
            previousTarget = target.value
        }
    }

    private static _c = new THREE.Color
    private static _cBlack = new THREE.Color(0,0,0)

    private _addTargetInfluence(start:WidenLiteral<T>, target:TransitionTarget<WidenLiteral<T>>) {
        const alpha = target.duration > 0 ? target.easing( Math.min(target.elapsed, target.duration) / target.duration) : 1

        if (typeof target.value !== 'number' && 'isMatrix4' in target.value) {
            const c = this.current as THREE.Matrix4
            const s = start as THREE.Matrix4
            const e = target.value as THREE.Matrix4

            const pos = vectors.get()
            const quat = quaternions.get()
            const scale = vectors.get()
            c.decompose(pos, quat, scale)

            const sPos = vectors.get()
            const sQuat = quaternions.get()
            const sScale = vectors.get()
            s.decompose(sPos, sQuat, sScale)
    
            const tPos = vectors.get()
            const tQuat = quaternions.get()
            const tScale = vectors.get()
            e.decompose(tPos, tQuat, tScale)
    
            pos.add(tPos.sub(sPos).lerp(V_000, 1-alpha))
            quat.multiply(sQuat.inverse().multiply(tQuat).slerp(Q_IDENTITY, 1-alpha)).normalize()
            scale.add(tScale.sub(sScale).lerp(V_000, 1-alpha))
    
            vectors.pool(pos)
            quaternions.pool(quat)
            vectors.pool(scale)
            vectors.pool(sPos)
            quaternions.pool(sQuat)
            vectors.pool(sScale)
            vectors.pool(tPos)
            quaternions.pool(tQuat)
            vectors.pool(tScale)
            return
        }

        if (typeof target.value === 'number') {
            this.current += THREE.Math.lerp(0, target.value-(start as number), alpha) as any
            return
        } 
        
        if ('isVector3' in target.value) {
            const c = this.current as THREE.Vector3
            const s = start as THREE.Vector3
            const e = target.value as THREE.Vector3
            const amount = vectors.get().copy(e).sub(s).lerp(V_000, 1-alpha)
            c.add(amount)
            vectors.pool(amount)
            return
        } 
        
        if ('isVector2' in target.value) {
            const c = this.current as THREE.Vector2
            const s = start as THREE.Vector2
            const e = target.value as THREE.Vector2
            const amount = vectors2.get().copy(e).sub(s).lerp(V_00, 1-alpha)
            c.add(amount)
            vectors2.pool(amount)
            return
        } 
        
        if ('isQuaternion' in target.value) {
            const c = this.current as THREE.Quaternion
            const s = start as THREE.Quaternion
            const e = target.value as THREE.Quaternion
            const amount = quaternions.get().copy(s).inverse().multiply(e).slerp(Q_IDENTITY, 1-alpha)
            c.multiply(amount).normalize()
            quaternions.pool(amount)
            return
        } 
        
        if ('isColor' in target.value) {
            const c = this.current as THREE.Color
            const s = start as THREE.Color
            const e = target.value as THREE.Color
            const amount = Transitionable._c.copy(e).sub(s).lerp(Transitionable._cBlack, 1-alpha)
            c.add(amount)
            return
        } 
        
        if ('isBox3' in target.value) {
            const c = this.current as THREE.Box3
            const s = start as THREE.Box3
            const e = target.value as THREE.Box3
            const minAmount = vectors.get().copy(e.min).sub(s.min).lerp(V_000, 1-alpha)
            const maxAmount = vectors.get().copy(e.max).sub(s.max).lerp(V_000, 1-alpha)
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

    _setCurrent(value:WidenLiteral<T>) {
        if (typeof value === 'number') {
            this.current = value
        } else {
            (this.current as any).copy(value)
        }
    }

    _computePercentChange() {

        const end = this.target as ValueType
        const start = this.committedTarget || (this.targetQueue[0] && this.targetQueue[0].value) || this.current

        if (typeof start === 'number') {
            const s = start as number
            const e = end as number
            return Math.abs(e - s / ((this.range as number) || 1))
        } 

        if ('isMatrix4' in start) {
            const s = start as THREE.Matrix4
            const e = end as THREE.Matrix4
            const sPos = vectors.get()
            const sQuat = quaternions.get()
            const sScale = vectors.get()
            s.decompose(sPos, sQuat, sScale)
            const ePos = vectors.get()
            const eQuat = quaternions.get()
            const eScale = vectors.get()
            e.decompose(ePos, eQuat, eScale)

            const posPercent = sPos.equals(ePos) ? 0 : Infinity

            const quatPercent = Math.abs(sQuat.angleTo(eQuat) / Math.PI)

            const scalePercent = sScale.equals(eScale) ? 0 : Infinity
            
            vectors.pool(sPos)
            quaternions.pool(sQuat)
            vectors.pool(sScale)
            vectors.pool(ePos)
            quaternions.pool(eQuat)
            vectors.pool(eScale)

            return Math.max(posPercent, quatPercent, scalePercent)
        }
        
        if ('isVector3' in start) {
            const s = start as THREE.Vector3
            const e = end as THREE.Vector3
            if (!this.range) return e.equals(s) ? 0 : Infinity
            const percent = vectors.get().subVectors(e, s).divide(this.range as THREE.Vector3)
            const {x,y,z} = percent
            vectors.pool(percent)
            return Math.max(Math.abs(x||0),Math.abs(y||0),Math.abs(z||0))
        } 
        
        if ('isVector2' in start) {
            const s = start as THREE.Vector2
            const e = end as THREE.Vector2
            if (!this.range) return e.equals(s) ? 0 : Infinity
            const percent = vectors2.get().subVectors(e, s).divide(this.range as THREE.Vector2)
            const {x,y} = percent
            vectors2.pool(percent)
            return Math.max(Math.abs(x||0),Math.abs(y||0))
        } 
        
        if ('isQuaternion' in start) {
            const s = start as THREE.Quaternion
            const e = end as THREE.Quaternion
            return Math.abs(s.angleTo(e) / Math.PI)
        } 
        
        if ('isColor' in start) {
            const s = start as THREE.Color
            const e = end as THREE.Color
            return Math.max(
                Math.abs(e.r - s.r), 
                Math.abs(e.g - s.r), 
                Math.abs(e.b - s.r)
            )
        } 
        
        if ('isBox3' in start) {
            const s = start as THREE.Box3
            const e = end as THREE.Box3
            if (!this.range) return e.equals(s) ? 0 : Infinity
            const size = this.range as ValueRange<THREE.Box3>
            const minPercent = vectors.get().subVectors(e.min, s.min).divide(size)
            const maxPercent = vectors.get().subVectors(e.max, s.max).divide(size)
            const min = Math.max(Math.abs(minPercent.x||0), Math.abs(minPercent.y||0), Math.abs(minPercent.z||0))
            const max = Math.max(Math.abs(maxPercent.x||0), Math.abs(maxPercent.y||0), Math.abs(maxPercent.z||0))
            vectors.pool(minPercent)
            vectors.pool(maxPercent)
            return Math.max(min, max)
        }

        return Infinity
    }

    protected _config = {} as Required<TransitionableConfig>

    protected _updateConfig(c?:TransitionableConfig) {
        this._config.multiplier = defined(this.multiplier, c && c.multiplier, Transitioner.DEFAULT_CONFIG.multiplier)
        this._config.duration = defined(this.duration, c && c.duration, Transitioner.DEFAULT_CONFIG.duration)
        this._config.easing = defined(this.easing, c && c.easing, Transitioner.DEFAULT_CONFIG.easing)
        this._config.threshold = defined(this.threshold, c && c.threshold, Transitioner.DEFAULT_CONFIG.threshold)
        this._config.delay = defined(this.delay, c && c.delay, Transitioner.DEFAULT_CONFIG.delay)
        this._config.debounce = defined(this.debounce, c && c.debounce, Transitioner.DEFAULT_CONFIG.debounce) 
        this._config.maxWait = defined(this.maxWait, c && c.maxWait, Transitioner.DEFAULT_CONFIG.maxWait)
        return this._config
    }

}

export class LocalMatrixTransitionable extends Transitionable<THREE.Matrix4> {
    constructor(public object:THREE.Object3D) {
        super({ target: new THREE.Matrix4 })
    }

    position = new Transitionable({target: new THREE.Vector3})
    quaternion = new Transitionable({target: new THREE.Quaternion})
    scale = new Transitionable({target: new THREE.Vector3(1,1,1)})

    autoRange = true
    synchronizeComponents = true

    update(deltaTime:number, c?:TransitionableConfig) {
        this._updateConfig(c)
        const {position, quaternion, scale, _config} = this

        if (this.autoRange) {
            if (!position.range) position.range = new THREE.Vector3
            if (!scale.range) scale.range = new THREE.Vector3
            this.object.layout.computedOuterBounds.getSize(position.range)
            this.object.layout.computedOuterBounds.getSize(scale.range).divide(position.range)
            if (!isFinite(scale.range.x) || scale.range.x === 0) scale.range.x = 1
            if (!isFinite(scale.range.y) || scale.range.y === 0) scale.range.y = 1
            if (!isFinite(scale.range.z) || scale.range.z === 0) scale.range.z = 1
        }
        
        this.target.decompose(position.target, quaternion.target, scale.target)
        this.current.decompose(position.current, quaternion.current, scale.current)
        
        let changePercent:number|undefined = undefined
        if (this.synchronizeComponents) {
            changePercent = Math.max(
                position._computePercentChange(), 
                quaternion._computePercentChange(), 
                scale._computePercentChange()
            )
        }

        position.update(deltaTime, _config, changePercent)
        quaternion.update(deltaTime, _config, changePercent)
        scale.update(deltaTime, _config, changePercent)
        this.current.compose(position.current, quaternion.current, scale.current)
    }
}

/**
 * Enables smooth interpolation of various kinds of values, with hysteresis
 */
export class Transitioner {

    static disableAllTransitions = false

    static DEFAULT_CONFIG:Required<TransitionableConfig> = {
        multiplier: 1,
        duration: 1.5,
        easing: easing.easeInOut,
        threshold: 1e-2,
        delay: 0,
        debounce: 0,
        maxWait: 10
    }

    /**
     * The amount of time (in milliseconds) it takes to smoothly 
     * damp towards the target.
     * 
     * By defualt, based on a progress threshold of 0.96
     * 
     * progress = 1 - Math.exp(-time)
     * time = - Math.log(1-progress)
     */
    static NATURAL_DURATION = - Math.log(1 - 0.95)
    
    /**
     * 
     */
    set active(active:boolean) {
        this._active = active
    }
    get active() {
        return this._active && !Transitioner.disableAllTransitions
    }
    private _active = false

    /**
     * Specifies the desired parent coordinate system.
     */
    parentTarget : THREE.Object3D|null = null

    /**
     * The local matrix transitionable
     */
    matrixLocal:LocalMatrixTransitionable
    
    /**
     * The target world matrix, automatically computed from pose/layout properties
     */
    matrixWorldTarget = new THREE.Matrix4

    /**
     * A multiplier to influence the speed of the transition
     */
    multiplier? : number = undefined
    
    /**
     * The duration of the easing function
     */
    duration? : number = undefined

    /**
     * The easing function 
     */
    easing? : (alpha:number) => number = undefined

    /**
     * The percentage that the `target` must differ from the `committedTarget`, 
     * the last target added to the `targetQueue`, or the `current` value  (in  that order)
     * before it is considered "changed"
     */
    threshold? : number = undefined

    /**
     * The number of seconds in which the `target` value must remain "changed" before it
     * becomes the `committedTarget`
     */
    delay? : number = undefined

    /**
     * The number of seconds in which the `committedTarget` must 
     * remain stable before it is pushed to the `targetQueue`
     */
    debounce? : number = undefined

    /**
     * The maximum number of seconds to wait before the `committedTarget`
     * is pushed to the `targetQueue`
     */
    maxWait? : number = undefined

    /**
     * 
     */
    customTransitionables = [] as Transitionable[]

    /**
     * 
     * @param object 
     */
    constructor(public object:THREE.Object3D) {
        this.matrixLocal = new LocalMatrixTransitionable(this.object)
    }

    /**
     * Add a transitionable
     * @param transitionable 
     */
    add<T extends ValueType>(transitionable:TransitionerConstructOptions<T>|Transitionable<T>) : Transitionable<T> {
        const t = transitionable instanceof Transitionable ? 
            transitionable : new Transitionable(transitionable)
        this.customTransitionables.push(t)
        return t
    }

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
    update(deltaTime:number, autoActive=true) {

        if (!this.active && autoActive) this.active = true

        if (!this.active) { 
            this.matrixLocal.current.copy(this.matrixLocal.target)
            for (const t of this.customTransitionables) {
                t._setCurrent(t.target)
                this._setPropertyAtPath(t)
            }
            return
        }

        // refresh matrix targets if necessary
        if (autoActive) this.object.updateWorldMatrix(true, true)
        this._setParent()

        // update transitionables
        deltaTime = Math.max(deltaTime, 1e-10) // in case multiplier is Infinity
        this.matrixLocal.update(deltaTime, this)
        for (const t of this.customTransitionables) {
            t.update(deltaTime, this)
            this._setPropertyAtPath(t)
        }

        this.object.updateWorldMatrix(false, true)
    }

    private _setPropertyAtPath(t:Transitionable) {
        if (t.path) {
            if (typeof t.current === 'number') {
                set(t.path, this.object, t.current)
            } else {
                resolve(t.path, this.object).copy(t.current)
            }
        }
    }

    /**
     * Ensure that this `object` is attached to the `targetParent` Object3D instance. 
     * When the `transitioner` is active, this method ensures a smooth transition 
     * to another coordinate system. If the `object` is already attached to the 
     * `targetParent`, this method is effectively noop.
     */
    private _setParent() {
        const parent = this.parentTarget
        const o = this.object
        if (!parent) return
        if (o.parent !== parent) {
            o.updateWorldMatrix(true, true)
            const originalMatrixWorld = matrices.get().copy(o.matrixWorld)
            o.parent && o.parent.remove(o)
            parent && parent.add(o)
            parent.updateWorldMatrix(true, true)
            const inverseParentMatrixWorld = parent ? matrices.get().getInverse(parent.matrixWorld) : matrices.get().identity()
            o.matrix.copy(inverseParentMatrixWorld.multiply(originalMatrixWorld))
            // const transitioner = o.layout.transitioner
            // if (transitioner.active) {
            //     transitioner.layout.weight = 0
            //     o.matrix.decompose(transitioner.position, transitioner.quaternion, transitioner.scale)
            // } else {
            // }
            o.matrix.decompose(o.position, o.quaternion, o.scale)
            matrices.pool(originalMatrixWorld)
            matrices.pool(inverseParentMatrixWorld)
        }
    }
}

const next = (prev, curr) => prev && prev[curr]

function resolve(path:string, obj=self as any, separator='.') {
    var properties = Array.isArray(path) ? path : path.split(separator)
    return properties.reduce(next, obj)
}

function set(path:string, obj=self as any, value:any, separator='.') {
    var properties = Array.isArray(path) ? path : path.split(separator)
    var lastPropertKey = properties.pop()
    const property = properties.reduce(next, obj)
    property[lastPropertKey] = value
}