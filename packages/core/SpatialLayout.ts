import { EtherealSystem, Node3D, NodeState } from './EtherealSystem'
import { Vector3, Quaternion, Box3} from './math'
import { cached, tracked, memo, TrackedArray } from './tracking'
import { MathUtils } from 'three'
import { TransitionableConfig } from './SpatialTransitioner'
import { SpatialMetrics } from './SpatialMetrics'

export type OneOrMany<T> = T|T[]

export type AtLeastOneProperty<T, U = {[K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U]

export type DiscreteOrContinuous<T> = T|{min:T,max:T}|{min:T}|{max:T}

export type NumberSpec = OneOrMany<DiscreteOrContinuous<number>>

export type QuaternionSpec = OneOrMany<
    { x:number, y:number, z:number, w:number } |
    { axis: OneOrMany<AtLeastOneProperty<{x:number, y:number, z:number}>>, degrees?:NumberSpec } |
    { twistSwing: AtLeastOneProperty<{horizontalDegrees:NumberSpec, verticalDegrees:NumberSpec, twistDegrees:NumberSpec}> } |
    { swingTwist: AtLeastOneProperty<{horizontalDegrees:NumberSpec, verticalDegrees:NumberSpec, twistDegrees:NumberSpec}> }
>

export type Vector3Spec = OneOrMany<AtLeastOneProperty<{
    x:NumberSpec, y:NumberSpec, z:NumberSpec,
    magnitude:NumberSpec
}>>

/**
 * Specify a spatial measure with various units,
 * all of which are summed together as a single measure
 */
export type LinearMeasure = AtLeastOneProperty<{
    percent : number
    meters : number
    centimeters: number
}>

/**
 * Specify a visual measure with various units,
 * all of which are summed together as a single measure
 */
export type AngularMeasure = AtLeastOneProperty<{
    percent : number
    degrees : number
    radians : number
}>

export type LinearMeasureSpec = OneOrMany<DiscreteOrContinuous<LinearMeasure>>

export type AngularMeasureSpec = OneOrMany<DiscreteOrContinuous<AngularMeasure>>

export class BoundsSpec {
    @tracked left? : LinearMeasureSpec   // = { min: {percent:-50} }
    @tracked right? : LinearMeasureSpec  // = { max: {percent:50}  }
    @tracked bottom? : LinearMeasureSpec // = { min: {percent:-50} }
    @tracked top? : LinearMeasureSpec    // = { max: {percent:50}  }
    @tracked back? : LinearMeasureSpec   // = { min: {percent:-50} }
    @tracked front? : LinearMeasureSpec  // = { max: {percent:50}  }
    @tracked width? : LinearMeasureSpec
    @tracked height? : LinearMeasureSpec
    @tracked depth? : LinearMeasureSpec

    setMinCorner(left:LinearMeasure,bottom:LinearMeasure,back:LinearMeasure) {
        this.left = left
        this.bottom = bottom
        this.back = back
    }

    setMaxCorner(right:LinearMeasure,top:LinearMeasure,front:LinearMeasure) {
        this.right = right
        this.top = top
        this.front = front
    }
}

export class FrustumSpec {
    @tracked left? : AngularMeasureSpec   // = { min: {percent:-50} }
    @tracked right? : AngularMeasureSpec  // = { max: {percent:50}  }
    @tracked bottom? : AngularMeasureSpec // = { min: {percent:-50} }
    @tracked top? : AngularMeasureSpec    // = { max: {percent:50}  }
    @tracked back? : LinearMeasureSpec    // = { min: {percent:-50} }
    @tracked front? : LinearMeasureSpec   // = { max: {percent:50}  }
    @tracked width? : AngularMeasureSpec
    @tracked height? : AngularMeasureSpec
    @tracked depth? : LinearMeasureSpec

    setMinCorner(left:AngularMeasureSpec,bottom:AngularMeasureSpec,back:LinearMeasure) {
        this.left = left
        this.bottom = bottom
        this.back = back
    }

    setMaxCorner(right:AngularMeasureSpec,top:AngularMeasureSpec,front:LinearMeasure) {
        this.right = right
        this.top = top
        this.front = front
    }
}

export type PullSpec = AtLeastOneProperty<{
    direction: AtLeastOneProperty<{x:number, y:number, z:number}>,
    center: AtLeastOneProperty<{x:number, y:number, z:number}>
}>

export class Constraint {

    public static getNumberPenalty(value:number, spec?:NumberSpec, epsillon=0) {
        if (!spec) return 0
        // penalty for compound spec is smallest penalty in the list
        if (spec instanceof Array && spec.length) {
            let penalty = Infinity
            for (const s of spec) {
                penalty = Math.min(this._getNumberPenaltySingle(value, s), penalty)
                if (penalty <= epsillon) {
                    return 0
                }
            }
            return penalty
        }
        const penalty = this._getNumberPenaltySingle(value, spec)
        if (penalty < epsillon) return 0
        return penalty
    }

    private static _getNumberPenaltySingle(value:number, spec?:NumberSpec) {
        if (!spec) return 0
        // penalty for single spec is distance from any valid value
        if (typeof spec === 'number') return Math.abs(value as number - spec)
        if ('min' in spec && typeof spec.min === 'number' && value < spec.min) return spec.min - value
        if ('max' in spec && typeof spec.max === 'number' && value > spec.max) return value - spec.max
        return 0
    }

    public static getVector3Penalty(value:Vector3, spec?:Vector3Spec, epsillon=0) {
        if (!spec) return 0
        // penalty for compound spec is smallest penalty in the list
        if (spec instanceof Array && spec.length) {
            let penalty = Infinity
            for (const s of spec) {
                penalty = Math.min(this._getVector3PenaltySingle(value, s, epsillon), penalty)
                if (penalty <= epsillon) {
                    return 0
                }
            }
            return penalty
        }
        const penalty = this._getVector3PenaltySingle(value, spec, epsillon)
        if (penalty <= epsillon) {
            return 0
        }
        return penalty
    }

    private static _getVector3PenaltySingle(value:Vector3, spec:Vector3Spec, epsillon:number) {
        // penalty for discrete spec is distance from the valid value
        const xPenalty = ('x' in spec && typeof spec.x !== 'undefined') ? this.getNumberPenalty(value.x, spec.x, epsillon) : 0
        const yPenalty = ('y' in spec && typeof spec.y !== 'undefined') ? this.getNumberPenalty(value.y, spec.y, epsillon) : 0
        const zPenalty = ('z' in spec && typeof spec.z !== 'undefined') ? this.getNumberPenalty(value.z, spec.z, epsillon) : 0
        const magnitudePenalty = ('magnitude' in spec && typeof spec.magnitude !== 'undefined') ? this.getNumberPenalty(value.length(), spec.magnitude, epsillon) : 0
        const xyzPenalty = Math.sqrt(xPenalty**2 + yPenalty**2 + zPenalty**2)
        return Math.max(xyzPenalty, magnitudePenalty)
    }

    public static getQuaternionPenalty(value:Quaternion, spec?:QuaternionSpec, epsillon=0) {
        if (!spec) return 0
        // penalty for compound spec is smallest penalty in the list
        if (spec instanceof Array && spec.length) {
            let penalty = Infinity
            for (const s of spec) {
                penalty = Math.min(this._getQuaternionPenaltySingle(value, s), penalty)
                if (penalty <= epsillon) {
                    return 0
                }
            }
            return penalty
        }
        const penalty = this._getQuaternionPenaltySingle(value, spec)
        if (penalty <= epsillon) {
            return 0
        }
        return penalty
    }

    private static _getQuaternionPenaltySingle(value:Quaternion, spec?:QuaternionSpec) {
        if (!spec) return 0
        // penalty for discrete spec is distance from the valid value
        if (spec instanceof Quaternion) return spec.angleTo(value) * MathUtils.RAD2DEG
        // penalty for continous spec is distance from the valid range
        // const axis = 'axis' in spec && spec.axis
        // const xPenalty = ('x' in axis && typeof axis.x !== 'undefined') ? this._getNumberPenalty(value.x, axis.x) : 0
        // const yPenalty = ('y' in axis && typeof axis.y !== 'undefined') ? this._getNumberPenalty(value.y, axis.y) : 0
        // const zPenalty = ('z' in axis && typeof axis.z !== 'undefined') ? this._getNumberPenalty(value.z, axis.z) : 0
        // const magnitudePenalty = ('magnitude' in spec && typeof spec.magnitude !== 'undefined') ? this._getNumberPenalty(value.length(), spec.magnitude) : 0
        // const xyzPenalty = Math.sqrt(xPenalty**2 + yPenalty**2 + zPenalty**2)
        // return Math.max(xyzPenalty, magnitudePenalty)
        return 0
    }

    public static getBoundsPenalty(metrics:SpatialMetrics, spec?:BoundsSpec) {
        if (!spec) return 0
        const epsillon = metrics.system.epsillonMeters
        const bounds = metrics.layoutBounds
        const size = metrics.layoutSize
        const outerSize = metrics.outerSize
        const leftPenalty = this.getLinearMeasurePenalty(bounds.min.x, spec.left, outerSize.x, epsillon)
        const rightPenalty = this.getLinearMeasurePenalty(bounds.max.x, spec.right, outerSize.x, epsillon)
        const bottomPenalty = this.getLinearMeasurePenalty(bounds.min.y, spec.bottom, outerSize.y, epsillon)
        const topPenalty = this.getLinearMeasurePenalty(bounds.max.y, spec.top, outerSize.y, epsillon)
        const frontPenalty = this.getLinearMeasurePenalty(bounds.max.z, spec.front, outerSize.z, epsillon)
        const backPenalty = this.getLinearMeasurePenalty(bounds.min.z, spec.back, outerSize.z, epsillon)
        const combinedEdgePenalty = Math.sqrt((rightPenalty + leftPenalty)**2 + (topPenalty + bottomPenalty)**2 + (frontPenalty + backPenalty)**2)
        const widthPenalty = this.getLinearMeasurePenalty(size.x, spec.width, outerSize.x, epsillon)
        const heightPenalty = this.getLinearMeasurePenalty(size.y, spec.height, outerSize.y, epsillon)
        const depthPenalty = this.getLinearMeasurePenalty(size.z, spec.depth, outerSize.z, epsillon)
        const combinedSizePenalty = Math.sqrt(widthPenalty**2 + heightPenalty**2 + depthPenalty**2)
        return Math.max(combinedEdgePenalty, combinedSizePenalty)
    }

    public static getLinearMeasurePenalty(valueMeters:number, spec:LinearMeasureSpec|undefined, range:number, epsillon=0) {
        if (!spec) return 0
        // penalty for compound spec is smallest penalty in the list
        if (spec instanceof Array && spec.length) {
            let penalty = Infinity
            for (const s of spec) {
                penalty = Math.min(this._getLinearMeasurePenaltySingle(valueMeters, s, range), penalty)
                if (penalty <= epsillon) {
                    return 0
                }
            }
            return penalty
        }
        const penalty = this._getLinearMeasurePenaltySingle(valueMeters, spec, range)
        if (penalty <= epsillon) {
            return 0
        }
        return penalty
    }

    private static _getLinearMeasurePenaltySingle(valueMeters:number, spec:LinearMeasureSpec|undefined, range:number) {
        if (!spec) return 0
        // penalty for single spec is distance from any valid value
        if (typeof spec === 'number') return Math.abs(valueMeters - spec)
        if ('min' in spec && typeof spec.min !== 'undefined') {
            const minMeters = this._getMetersFromLinearMeasure(spec.min, range)
            if (valueMeters < minMeters) return minMeters - valueMeters
        }
        if ('max' in spec && typeof spec.max !== 'undefined') {
            const maxMeters = this._getMetersFromLinearMeasure(spec.max, range)
            if (valueMeters > maxMeters) return valueMeters - maxMeters
        }
        return 0
    }

    public static getVisualBoundsPenalty(metrics:SpatialMetrics, spec?:FrustumSpec) {
        if (!spec) return 0
        const epsillonMeters = metrics.system.epsillonMeters
        const epsillonDegrees = metrics.system.epsillonDegrees
        const outerHorizonalDegrees = metrics.system.viewFrustum.horizontalDegrees
        const outerVerticalDegrees = metrics.system.viewFrustum.verticalDegrees
        const outerDepthMeters = metrics.system.viewFrustum.depthMeters
        const leftPenalty = this.getAngularMeasurePenalty(metrics.viewFrustum.leftDegrees, spec.left, outerHorizonalDegrees, epsillonDegrees)
        const rightPenalty = this.getAngularMeasurePenalty(metrics.viewFrustum.rightDegrees, spec.right, outerHorizonalDegrees, epsillonDegrees)
        const bottomPenalty = this.getAngularMeasurePenalty(metrics.viewFrustum.bottomDegrees, spec.bottom, outerVerticalDegrees, epsillonDegrees)
        const topPenalty = this.getAngularMeasurePenalty(metrics.viewFrustum.topDegrees, spec.top, outerVerticalDegrees, epsillonDegrees)
        const nearPenalty = this.getLinearMeasurePenalty(metrics.viewFrustum.nearMeters, spec.front, outerDepthMeters, epsillonMeters)
        const farPenalty = this.getLinearMeasurePenalty(metrics.viewFrustum.farMeters, spec.back, outerDepthMeters, epsillonMeters)
        const combinedEdgePenalty = Math.sqrt((rightPenalty + leftPenalty)**2 + (topPenalty + bottomPenalty)**2 + (nearPenalty + farPenalty)**2)
        const widthPenalty = this.getAngularMeasurePenalty(metrics.viewFrustum.horizontalDegrees, spec.width, outerHorizonalDegrees, epsillonDegrees)
        const heightPenalty = this.getAngularMeasurePenalty(metrics.viewFrustum.verticalDegrees, spec.height, outerVerticalDegrees, epsillonDegrees)
        const depthPenalty = this.getLinearMeasurePenalty(metrics.viewFrustum.depthMeters, spec.depth, outerDepthMeters, epsillonMeters)
        const combinedSizePenalty = Math.sqrt(widthPenalty**2 + heightPenalty**2 + depthPenalty**2)
        return Math.max(combinedEdgePenalty, combinedSizePenalty)
    }

    public static getAngularMeasurePenalty(valueDegrees:number, spec:AngularMeasureSpec|undefined, range:number, epsillon=0) {
        if (!spec) return 0
        // penalty for compound spec is smallest penalty in the list
        if (spec instanceof Array && spec.length) {
            let penalty = Infinity
            for (const s of spec) {
                penalty = Math.min(this._getAngularMeasurePenaltySingle(valueDegrees, s, range), penalty)
                if (penalty <= epsillon) {
                    return 0
                }
            }
            return penalty
        }
        const penalty = this._getAngularMeasurePenaltySingle(valueDegrees, spec, range)
        if (penalty <= epsillon) {
            return 0
        }
        return penalty
    }
    
    private static _getAngularMeasurePenaltySingle(valueMeters:number, spec:AngularMeasureSpec|undefined, rangeDegrees:number) {
        if (!spec) return 0
        // penalty for single spec is distance from any valid value
        if (typeof spec === 'number') return Math.abs(valueMeters - spec)
        if ('min' in spec && typeof spec.min !== 'undefined') {
            const minMeters = this._getDegreesFromAngularMeasure(spec.min, rangeDegrees)
            if (valueMeters < minMeters) return minMeters - valueMeters
        }
        if ('max' in spec && typeof spec.max !== 'undefined') {
            const maxMeters = this._getDegreesFromAngularMeasure(spec.max, rangeDegrees)
            if (valueMeters > maxMeters) return valueMeters - maxMeters
        }
        return 0
    }

    private static _getMetersFromLinearMeasure(measure:LinearMeasure, rangeMeters:number) {
        return measure.meters || 0 + 0.01 * (measure.centimeters || 0) + rangeMeters * (measure.percent || 0) / 100
    }

    private static _getDegreesFromAngularMeasure(measure:AngularMeasure, rangeDegrees:number) {
        return measure.degrees || 0 + MathUtils.RAD2DEG * (measure.radians || 0) + rangeDegrees * (measure.percent || 0) / 100
    }
}

export type ConstraintFunction = (metrics:SpatialMetrics) => number

/**
 * Defines spatial layout constraints/goals
 */
export class SpatialLayout {
    
    private _defaultConstraints = new TrackedArray<ConstraintFunction>()
    private _constraints = new TrackedArray<ConstraintFunction>()

    constructor(public system:EtherealSystem) {
        // Object.seal(this) // seal to preserve call-site monomorphism
    }

    /***/
    userData? : any
    
    /**
     * The parent node 
     * If `undefined`, target parent is the current parent
     * if `null`, this node is considered as flagged to be removed
     */
    parentNode? : Node3D|null

    /**
     * 
     */
    setFromNodeState(node:Node3D) {
        const s = this.system.bindings.getCurrentState(node, this._nodeState)
        this.position = { x: s.position.x, y: s.position.y, z: s.position.z }
        this.orientation = { x: s.orientation.x, y: s.orientation.y, z: s.orientation.z, w: s.orientation.w }
        this.scale = { x: s.scale.x, y: s.scale.y, z: s.scale.z }
        this.opacity = s.opacity
    }
    private _nodeState = new NodeState

    /**
     * The local position constraint spec (local units are ambigious).
     * Copies on assignment
     */
    position?: Vector3Spec = {
        x:{ min:-1e6, max:1e6 },
        y:{ min:-1e6, max:1e6 },
        z:{ min:-1e6, max:1e6 }
    }
    positionConstraint = this.addDefaultConstraint((m) => {
        return Constraint.getVector3Penalty(m.localPosition, this.position)
    })

    /**
     * The local orientation constraint spec
     */
    orientation? : QuaternionSpec
    orientationConstraint = this.addDefaultConstraint((m) => {
        return Constraint.getQuaternionPenalty(m.localOrientation, this.orientation, m.system.epsillonDegrees)
    })

    /**
     * The local scale constraint spec
     */
    scale?: Vector3Spec = {
        x:{ min:1e-6, max:1e6 },
        y:{ min:1e-6, max:1e6 },
        z:{ min:1e-6, max:1e6 }
    }
    scaleConstraint = this.addDefaultConstraint((m) => {
        return Constraint.getVector3Penalty(m.localScale, this.scale)
    })

    /**
     * The opacity constraint spec
     */
    opacity?: NumberSpec
    opacityConstraint = this.addDefaultConstraint((m) => {
        return Constraint.getNumberPenalty(m.opacity, this.opacity)
    })

    // /**
    //  * The layout bounds spec
    //  */
    public bounds = new BoundsSpec
    public boundsConstraint = this.addDefaultConstraint((m) => {
        return Constraint.getBoundsPenalty(m, this.bounds)
    })
    
    get left() { return this.bounds.left }
    set left( spec: typeof BoundsSpec.prototype.left) { this.bounds.left = spec }

    get right() { return this.bounds.right }
    set right( spec: typeof BoundsSpec.prototype.right) { this.bounds.right = spec }

    get bottom() { return this.bounds.bottom }
    set bottom( spec: typeof BoundsSpec.prototype.bottom ) { this.bounds.bottom = spec }

    get top() { return this.bounds.top }
    set top( spec: typeof BoundsSpec.prototype.top ) { this.bounds.top = spec }

    get back() { return this.bounds.back }
    set back( spec: typeof BoundsSpec.prototype.back ) { this.bounds.back = spec }

    get front() { return this.bounds.front }
    set front( spec: typeof BoundsSpec.prototype.front ) { this.bounds.front = spec }

    get width() { return this.bounds.width }
    set width( spec: typeof BoundsSpec.prototype.width ) { this.bounds.width = spec }

    get height() { return this.bounds.height }
    set height( spec: typeof BoundsSpec.prototype.height ) { this.bounds.height = spec }

    get depth() { return this.bounds.depth }
    set depth( spec: typeof BoundsSpec.prototype.depth ) { this.bounds.depth = spec }

    /** The layout frustum spec */
    public visual = new FrustumSpec
    public visualConstraint = this.addDefaultConstraint((m) => {
        return Constraint.getVisualBoundsPenalty(m, this.visual)
    })

    get visualLeft() { return this.visual.left }
    set visualLeft( spec: typeof FrustumSpec.prototype.left ) { this.visual.left = spec }

    get visualRight() { return this.visual.right }
    set visualRight( spec: typeof FrustumSpec.prototype.right ) { this.visual.right = spec }

    get visualBottom() { return this.visual.bottom }
    set visualBottom( spec: typeof FrustumSpec.prototype.bottom ) { this.visual.bottom = spec }

    get visualTop() { return this.visual.top }
    set visualTop( spec: typeof FrustumSpec.prototype.top ) { this.visual.top = spec }

    get visualBack() { return this.visual.back }
    set visualBack( spec: typeof FrustumSpec.prototype.back ) { this.visual.back = spec }

    get visualFront() { return this.visual.front }
    set visualFront( spec: typeof FrustumSpec.prototype.front ) { this.visual.front = spec }

    get visualWidth() { return this.visual.width }
    set visualWidth( spec: typeof FrustumSpec.prototype.width ) { this.visual.width = spec }

    get visualHeight() { return this.visual.height }
    set visualHeight( spec: typeof FrustumSpec.prototype.height ) { this.visual.height = spec }

    get visualDepth() { return this.visual.depth }
    set visualDepth( spec: typeof FrustumSpec.prototype.depth ) { this.visual.depth = spec }

    /**
     * The content aspect constraint
     */
    @tracked aspect? = 'preserve-3d' as 'preserve-3d'|'preserve-2d'|'any'
    @cached private get _aspectSpec() {
        const aspect = this.aspect
        return  aspect === 'preserve-3d' ? {x:1,y:1,z:1} :
                aspect === 'preserve-2d' ? {x:1,y:1} : 
                undefined
    }
    aspectConstraint = this.addDefaultConstraint((m) => {
        const s = this._normalizedScale.copy(m.worldScale)
        const largest = this.aspect === 'preserve-3d' ? 
            Math.max(Math.abs(s.x), Math.abs(s.y), Math.abs(s.y)) : 
            Math.max(Math.abs(s.x), Math.abs(s.y))
        const normalized = s.divideScalar(largest)
        return Constraint.getVector3Penalty(normalized, this._aspectSpec)
    })
    private _normalizedScale = new Vector3

    /**
     * Pull influence
     */
    pull?: PullSpec

    /**
     * Visual-space pull influence
     */
    visualPull?: PullSpec

    /**
     * Occluders to minimize visual overlap with
     */
    occluders?: Node3D[]

    /**
     * The default constraints applied to this layout
     */
    get defaultConstraints() {
        return this._defaultConstraints
    }

    /**
     * The additional constraints applied to this layout
     */
    get constraints() {
        return this._constraints
    }

    /**
     * Add a new layout constraint
     */
    protected addDefaultConstraint( constraint: ConstraintFunction  ) : ConstraintFunction {
        this.defaultConstraints.push(constraint)
        return constraint
    }

    /**
     * Add a new layout constraint
     */
    addConstraint( constraint: ConstraintFunction ) : ConstraintFunction {
        this.constraints.push(constraint)
        return constraint
    }

    /**
     * Transition overrides for this layout
     */
    transition = new TransitionableConfig

    /**
     * The solutions being explored for this layout
     */
    get solutions() {
        return this.#solutions
    }
    #solutions = new Array<LayoutSolution>()

    /**
     * The optimization iteration
     */
    iteration = 0
}

export interface LayoutObjective {
    fitness:(metrics:SpatialMetrics, layout:SpatialLayout)=>number,
    relativeTolerance?: number
}

export class LayoutSolution {

    constructor() {
        Object.seal(this)
    }

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
     * The objectives used to rank this solution
     */
    objectives = [] as LayoutObjective[]

    /**
     * The constraint violation penalty.
     * Positive penalty means the solution is infeasible (constraints are violated).
     * Negative or 0 penalty means the solution is feasible.
     */
    penalty = 0

    /**
     * The fitness scores of this solution
     * (one for each objective, higher is better)
     */
    scores = [] as number[]

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
    * `visualDistance` when mutating a length, or by Math.PI when mutating 
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

    randomize(visualDistance:number) {
        this.orientation = LayoutSolution.randomQuaternion(this.orientation)
        const center = LayoutSolution._scratchV1.set(
            (Math.random() - 0.5) * visualDistance * 2 + LayoutSolution.gaussian(0, visualDistance),
            (Math.random() - 0.5) * visualDistance * 2 + LayoutSolution.gaussian(0, visualDistance),
            (Math.random() - 0.5) * visualDistance * 2 + LayoutSolution.gaussian(0, visualDistance)
        )
        const halfSize = LayoutSolution._scratchV2.set(
            (Math.random() - 0.5) * visualDistance,
            (Math.random() - 0.5) * visualDistance,
            (Math.random() - 0.5) * visualDistance
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

    perturb(scale=this.stepScale, visualDistance:number) {
        if (visualDistance < 1e-6) visualDistance = 1e-6
        this.orientation.multiply(LayoutSolution.randomQuaternion(LayoutSolution._scratchQ, scale, scale))
        const stepSizeMeters = scale * visualDistance
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