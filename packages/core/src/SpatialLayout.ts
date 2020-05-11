import type { Node3D } from './EtherealSystem'
import { Vector3, Quaternion, Box3} from './math'
import { tracked, memoizeTracked, TrackedArray } from './tracking'
import { MathUtils } from 'three'
import type { SpatialMetrics } from './SpatialMetrics'
import type { LayoutFrustum } from './LayoutFrustum'

export type OneOrMany<T> = T|T[]

export type DiscreteOrContinuous<T> = T|{min?:T,max?:T}

export type NumberSpec = OneOrMany<DiscreteOrContinuous<number>>

export type QuaternionSpec = OneOrMany<
    Quaternion |
    { axis: OneOrMany<{x?:number, y?:number, z?:number}>, degrees?:NumberSpec } |
    { twistSwing: {horizontalDegrees?:NumberSpec, verticalDegrees?:NumberSpec, twistDegrees?:NumberSpec} } |
    { swingTwist: {horizontalDegrees?:NumberSpec, verticalDegrees?:NumberSpec, twistDegrees?:NumberSpec} }
>

export type Vector3Spec = OneOrMany<Vector3|{
    x?:NumberSpec, y?:NumberSpec, z?:NumberSpec,
    magnitude?:NumberSpec
}>

/**
 * Specify a spatial measure with various units,
 * all of which are summed together as a single measure
 */
export interface LinearMeasure {
    percent? : number
    meters? : number
    centimeters?: number
}

/**
 * Specify a visual measure with various units,
 * all of which are summed together as a single measure
 */
export interface AngularMeasure {
    percent? : number
    degrees? : number
    radians? : number
}

export type LinearMeasureSpec = DiscreteOrContinuous<LinearMeasure>

export type AngularMeasureSpec = DiscreteOrContinuous<AngularMeasure>

export class BoundsSpec {
    @tracked left : LinearMeasureSpec   = { min: {percent:-50} }
    @tracked right : LinearMeasureSpec  = { max: {percent:50}  }
    @tracked bottom : LinearMeasureSpec = { min: {percent:-50} }
    @tracked top : LinearMeasureSpec    = { max: {percent:50}  }
    @tracked back : LinearMeasureSpec   = { min: {percent:-50} }
    @tracked front : LinearMeasureSpec  = { max: {percent:50}  }
}

export class FrustumSpec {
    @tracked left : AngularMeasureSpec   = { min: {percent:-50} }
    @tracked right : AngularMeasureSpec  = { max: {percent:50}  }
    @tracked bottom : AngularMeasureSpec = { min: {percent:-50} }
    @tracked top : AngularMeasureSpec    = { max: {percent:50}  }
    @tracked back : LinearMeasureSpec    = { min: {percent:-50} }
    @tracked front : LinearMeasureSpec   = { max: {percent:50}  }
}

export type MetricValueType = number|Vector3|Quaternion|Box3|LayoutFrustum

export type ConstraintSpec<T = MetricValueType> = 
    T extends number ? NumberSpec :
    T extends Quaternion ? QuaternionSpec :
    T extends Vector3 ? Vector3Spec :
    T extends Box3 ? BoundsSpec :
    T extends LayoutFrustum ? FrustumSpec :
    never


export interface SpatialConstraint<T = MetricValueType> {
    metric: (metrics:SpatialMetrics) => T
    spec: () => (ConstraintSpec<T>|undefined)
}

/**
 * Defines spatial layout constraints.
 * 
 * If a property is undefined, it is considered unconstrained. 
 */
export class SpatialLayout {
    
    /**
     * The parent node 
     * If `undefined`, target parent is the current parent
     * if `null`, this node is considered as flagged to be removed
     */
    @tracked parent? : Node3D|null

    /**
     * The position constraint spec
     */
    @tracked position?: ConstraintSpec<Vector3> = {
        x:{ min:-1e6, max:1e6 },
        y:{ min:-1e6, max:1e6 },
        z:{ min:-1e6, max:1e6 }
    }
    positionConstraint = this.addDefaultConstraint((m) => m.localPosition,() => this.position)

    /**
     * The orientation constraint spec
     */
    @tracked orientation? : ConstraintSpec<Quaternion>
    orientationConstraint = this.addDefaultConstraint((m) => m.localOrientation,() => this.orientation)

    /**
     * The scale constraint spec
     */
    @tracked scale?: ConstraintSpec<Vector3> = {
        x:{ min:1e-6, max:1e6 },
        y:{ min:1e-6, max:1e6 },
        z:{ min:1e-6, max:1e6 }
    }
    scaleConstraint = this.addDefaultConstraint((m) => m.localScale,() => this.scale)

    /**
     * The opacity constraint spec
     */
    @tracked opacity?: ConstraintSpec<number>
    opacityConstraint = this.addDefaultConstraint((m) => m.opacity, () => this.opacity)

    /**
     * The layout bounds spec
     */
    @tracked bounds = new BoundsSpec
    boundsConstraint = this.addDefaultConstraint((m) => m.layoutBounds, () => this.bounds)

    /** The view frustum spec */
    @tracked view = new FrustumSpec
    viewConstraint = this.addDefaultConstraint((m) => m.viewFrustum, () => this.view)

    /**
     * The content aspect constraint
     */
    @tracked aspect?= 'preserve-3d' as 'preserve-3d'|'preserve-2d'|'any'
    aspectConstraint = this.addDefaultConstraint((m) => {
        const s = this.#normalizedScale.copy(m.worldScale)
        const largest = this.aspect === 'preserve-3d' ? 
            Math.max(Math.abs(s.x), Math.abs(s.y), Math.abs(s.y)) : 
            Math.max(Math.abs(s.x), Math.abs(s.y))
        return s.divideScalar(largest)
    }, memoizeTracked(() => {
        const aspect = this.aspect
        return  aspect === 'preserve-3d' ? {x:1,y:1,z:1} :
                aspect === 'preserve-2d' ? {x:1,y:1} : 
                undefined
    }))
    #normalizedScale = new Vector3

    /**
     * The default constraints applied to this layout
     */
    get defaultConstraints() {
        return this.#defaultConstraints
    }
    #defaultConstraints = new TrackedArray<SpatialConstraint>()

    /**
     * The additional constraints applied to this layout
     */
    get constraints() {
        return this.#constraints
    }
    #constraints = new TrackedArray<SpatialConstraint>()

    /**
     * Add a new layout constraint
     */
    protected addDefaultConstraint<T extends MetricValueType>(metric:(metrics:SpatialMetrics) => T, spec:() => ConstraintSpec<T>|undefined) : SpatialConstraint<T> {
        const c = {metric, spec}
        this.defaultConstraints.push(c)
        return c
    }

    /**
     * Add a new layout constraint
     */
    addConstraint<T extends MetricValueType>(metric:(metrics:SpatialMetrics) => T, spec:() => ConstraintSpec<T>|undefined) : SpatialConstraint<T> {
        const c = {metric, spec}
        this.constraints.push(c)
        return c
    }

    /**
     * The solutions being explored for this layout
     */
    get solutions() {
        return this.#solutions
    }
    #solutions = new TrackedArray<LayoutSolution>()

    /**
     * The aproximate expected size of this layout in any dimension (width, height, or depth), in meters. 
     * This affects how the solution space for this layout is explored
     */
    sizeHint = 1

    /**
     * The optimization iteration
     */
    iteration = 0
}

export class LayoutSolution {

    /** 
     * Return random number with gaussian distribution
     * @param [mean=0] 
     * @param [standardDeviation=1]
     */
    static gaussian = (() => {
        const _2PI = Math.PI
        let z0:number, z1:number
        let generate = false
        return (mean=0, standardDeviation=1) => {
            generate = !generate
            if (!generate) return z1 * standardDeviation + mean
            let u1:number, u2:number
            do { u1 = Math.random() } while (u1 < Number.EPSILON)
            u2 = Math.random()
            z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(_2PI * u2)
            z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(_2PI * u2)
            return z0 * standardDeviation + mean
        }
    })()

    /**
     * Return a random quaternion
     * @param out 
     * @param twistScale 
     * @param swingScale 
     */
    static randomQuaternion = (() => {
        const _2PI = Math.PI * 2
        const V_001 = new Vector3(0,0,1)
        const twist = new Quaternion
        const swing = new Quaternion
        const swingAxis = new Vector3
        return function randomQuaternion(out = new Quaternion, twistScale=1, swingScale=1) {
            const twistMagnitude = (Math.random() - 0.5) * _2PI * twistScale 
            const swingDirection = Math.random() * _2PI
            const swingMagnitude = Math.random() * Math.PI * swingScale
            swingAxis.set(1,0,0).applyAxisAngle(V_001, swingDirection)
            twist.setFromAxisAngle(V_001, twistMagnitude)
            swing.setFromAxisAngle(swingAxis, swingMagnitude)
            return out.multiplyQuaternions(swing, twist)
        }
    })()

    /**
     * The layout orientation (relative to parent orientation)
     */
    orientation = new Quaternion

    /**
     * The layout bounds (world units)
     */
    bounds = new Box3

    /**
     * The fitness score of this solution
     */
    score = -Infinity

    /** 
     * The pulse rate is effectively the exploration to exploitation ratio 
     * 
     * At 0, the solution space is being searched entirely using exploration strategies
     * At 1, the solution space is being searched entirely using exploitation strategies
     * 
     * The pulse rate is automatically updated based on the mutation success rate
     * 
    */
    pulseRate = Math.random()

    /** 
    * The scale of the random mutation step, which is multiplied by the
    * `sizeHint` when mutating a length, or by Math.PI when mutating 
    * an orientation. The resulting value is used as the standard deviation 
    * of the eventual (randomly determind over a gaussian distribution) step size. 
    * 
    * The step scale is automatically updated based on the mutation success rate
    */
    stepScale = Math.random()

    /**
    * The current solution mutation success rate 
    */
    successRate = 0.2

    private static _scratchV1 = new Vector3 
    private static _scratchV2 = new Vector3
    private static _scratchQ = new Quaternion

    randomize(sizeHintMeters=1) {
        this.orientation = LayoutSolution.randomQuaternion(this.orientation)
        const center = LayoutSolution._scratchV1.set(
            (Math.random() - 0.5) * sizeHintMeters * 2 + LayoutSolution.gaussian(0, sizeHintMeters),
            (Math.random() - 0.5) * sizeHintMeters * 2 + LayoutSolution.gaussian(0, sizeHintMeters),
            (Math.random() - 0.5) * sizeHintMeters * 2 + LayoutSolution.gaussian(0, sizeHintMeters)
        )
        const halfSize = LayoutSolution._scratchV2.set(
            (Math.random() - 0.5) * sizeHintMeters,
            (Math.random() - 0.5) * sizeHintMeters,
            (Math.random() - 0.5) * sizeHintMeters
        )
        this.bounds.min.copy(center).sub(halfSize)
        this.bounds.max.copy(center).add(halfSize)
        this.bounds = this.bounds
        this.stepScale = Math.random()
        this.pulseRate = Math.random()
        return this
    }

    moveTowards(solution:LayoutSolution, minFreq:number, maxFreq:number) {
        this.orientation.slerp(solution.orientation, LayoutSolution.generatePulseFrequency(minFreq, maxFreq))
        this.bounds.min.x += MathUtils.lerp(this.bounds.min.x, solution.bounds.min.x, LayoutSolution.generatePulseFrequency(minFreq, maxFreq))
        this.bounds.min.y += MathUtils.lerp(this.bounds.min.y, solution.bounds.min.y, LayoutSolution.generatePulseFrequency(minFreq, maxFreq))
        this.bounds.min.z += MathUtils.lerp(this.bounds.min.z, solution.bounds.min.z, LayoutSolution.generatePulseFrequency(minFreq, maxFreq))
        this.bounds.max.x += MathUtils.lerp(this.bounds.max.x, solution.bounds.max.x, LayoutSolution.generatePulseFrequency(minFreq, maxFreq))
        this.bounds.max.y += MathUtils.lerp(this.bounds.max.y, solution.bounds.max.y, LayoutSolution.generatePulseFrequency(minFreq, maxFreq))
        this.bounds.max.z += MathUtils.lerp(this.bounds.max.z, solution.bounds.max.z, LayoutSolution.generatePulseFrequency(minFreq, maxFreq))
        this.bounds.min.lerp(solution.bounds.min, LayoutSolution.generatePulseFrequency(minFreq, maxFreq))
        this.bounds.max.lerp(solution.bounds.max, LayoutSolution.generatePulseFrequency(minFreq, maxFreq))
    }

    perturb(scale=this.stepScale, sizeHintMeters=1) {
        this.orientation.multiply(LayoutSolution.randomQuaternion(LayoutSolution._scratchQ, scale, scale))
        const stepSizeMeters = scale * sizeHintMeters
        this.bounds.min.x += LayoutSolution.gaussian(0, stepSizeMeters)
        this.bounds.min.y += LayoutSolution.gaussian(0, stepSizeMeters)
        this.bounds.min.z += LayoutSolution.gaussian(0, stepSizeMeters)
        this.bounds.max.x += LayoutSolution.gaussian(0, stepSizeMeters)
        this.bounds.max.y += LayoutSolution.gaussian(0, stepSizeMeters)
        this.bounds.max.z += LayoutSolution.gaussian(0, stepSizeMeters)
    }

    static generatePulseFrequency(min:number,max:number) {
        return min + Math.random() * (max - min)
    }
}