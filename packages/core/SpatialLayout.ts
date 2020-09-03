import { Node3D } from './EtherealSystem'
import { Vector3, Quaternion, Box3, MathUtils, V_111, randomSelect, randomQuaternion, gaussian, levy } from './math'
import { TransitionConfig } from './SpatialTransitioner'
import { NodeState } from './SpatialMetrics'
import { SpatialAdapter } from './SpatialAdapter'

export type OneOrMany<T> = T|T[]

export type AtLeastOneProperty<T, U = {[K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U]

export type DiscreteOrContinuous<T> = T|{gt:T,lt:T}|{gt:T}|{lt:T}

export type NumberSpec = OneOrMany<DiscreteOrContinuous<number>>

export type QuaternionSpec = OneOrMany<
    { x:number, y:number, z:number, w:number } |
    { axis: OneOrMany<AtLeastOneProperty<{x:number, y:number, z:number}>>, degrees?:AngularMeasureSpec } |
    { twistSwing: AtLeastOneProperty<{horizontal:AngularMeasureSpec, vertical:AngularMeasureSpec, twist:AngularMeasureSpec}> } |
    { swingTwist: AtLeastOneProperty<{horizontal:AngularMeasureSpec, vertical:AngularMeasureSpec, twist:AngularMeasureSpec}> }
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

export class  BoundsSpec {
    left? : LinearMeasureSpec   // = { min: {percent:0} }
    bottom? : LinearMeasureSpec // = { min: {percent:0} }
    back? : LinearMeasureSpec   // = { min: {percent:0} }
    right? : LinearMeasureSpec  // = { max: {percent:100} }
    top? : LinearMeasureSpec    // = { max: {percent:100} }
    front? : LinearMeasureSpec  // = { max: {percent:100} }
    width? : LinearMeasureSpec
    height? : LinearMeasureSpec
    depth? : LinearMeasureSpec
    diagonalLength? : LinearMeasureSpec
    centerX? : LinearMeasureSpec
    centerY? : LinearMeasureSpec
    centerZ? : LinearMeasureSpec
    // center? : AtLeastOneProperty<{ x: LinearMeasureSpec, y: LinearMeasureSpec, z: LinearMeasureSpec }>
    // size? : AtLeastOneProperty<{ x: LinearMeasureSpec, y: LinearMeasureSpec, z: LinearMeasureSpec }>
}

export class FrustumSpec {
    left? : AngularMeasureSpec   // = { min: {percent:0} }
    bottom? : AngularMeasureSpec // = { min: {percent:0} }
    back? : LinearMeasureSpec    // = { min: {percent:0} }
    right? : AngularMeasureSpec  // = { max: {percent:100} }
    top? : AngularMeasureSpec    // = { max: {percent:100} }
    front? : LinearMeasureSpec   // = { max: {percent:100} }
    width? : AngularMeasureSpec
    height? : AngularMeasureSpec
    diagonalLength? : AngularMeasureSpec
    depth? : LinearMeasureSpec
    centerX? : AngularMeasureSpec
    centerY? : AngularMeasureSpec
    centerZ? : LinearMeasureSpec
    angleToCenter?: AngularMeasureSpec
    angleToClosestCorner?: AngularMeasureSpec
    angleToFurthestCorner?: AngularMeasureSpec
    // angularWidth? : AngularMeasureSpec
    // angularHeight? : AngularMeasureSpec
    // angularPosition? : { x?: AngularMeasureSpec, y?: AngularMeasureSpec }
    // angularDistance? : AngularMeasureSpec
    // depth? : LinearMeasureSpec
    // distance? : LinearMeasureSpec
}

export type PullSpec = AtLeastOneProperty<{
    direction: AtLeastOneProperty<{x:number, y:number, z:number}>,
    center: AtLeastOneProperty<{x:number, y:number, z:number}>
}>

export type ScoreFunction = (state:Readonly<NodeState>,layout:SpatialLayout) => number


type UnionToIntersection<U> =
    (U extends any ? (k: U) => void : never) extends
    ((k: infer I) => void) ? I : never

type DiscreteSpec<T> = Exclude<T,any[]|undefined|Partial<{gt:any,lt:any}>>
type ContinuousSpec<T> = T extends any[] | undefined ? never : 
    T extends {gt:any,lt:any} ? T : never

// type K = UnionToIntersection<Exclude<LinearMeasureSpec, Array<any>|Exclude<LinearMeasureSpec,Partial<{gt:any,lt:any}>>>>
// type X = Exclude<keyof UnionToIntersection<LinearMeasureSpec>,'gt'|'lt'>
/**
 * Defines spatial layout constraints/goals
 */
export class SpatialLayout {

    public static isDiscreteSpec<T>(s:T) : s is DiscreteSpec<T> {
        return s !== undefined && s instanceof Array === false && ('gt' in s || 'lt' in s) === false
    }

    public static isContinuousSpec<T>(s:T) : s is ContinuousSpec<T> {
        return s !== undefined && s instanceof Array === false && ('gt' in s || 'lt' in s) === true
    }

    public static getNumberPenalty(value:number, spec?:NumberSpec, epsillon=0) {
        if (spec === undefined) return 0
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
        if (spec === undefined) return 0
        // penalty for single spec is distance from any valid value
        if (typeof spec === 'number') return Math.abs(value as number - spec)
        if ('gt' in spec && typeof spec.gt === 'number' && value < spec.gt) return spec.gt - value
        if ('lt' in spec && typeof spec.lt === 'number' && value > spec.lt) return value - spec.lt
        return 0
    }

    public static getVector3Penalty(value:Vector3, spec?:Vector3Spec, epsillon=0) {
        if (spec === undefined) return 0
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
        if (spec === undefined) return 0
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
        if (spec === undefined) return 0
        // penalty for discrete spec is distance from the valid value
        if (spec instanceof Quaternion) return spec.angleTo(value) * MathUtils.RAD2DEG / 0.0360
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

    public static _boundsCenter = new Vector3
    public static _boundsSize = new Vector3
    public static _outerSize = new Vector3

    public static getBoundsPenalty(state:Readonly<NodeState>, spec?:BoundsSpec) {
        if (spec === undefined) return 0

        let hasSpec = false
        for (const key in spec) {
            if (typeof spec[key as keyof BoundsSpec] !== 'undefined') 
                hasSpec = true 
        }

        if (!hasSpec) return 0

        const bounds = state.layoutBounds
        const center = state.layoutCenter
        const size = state.layoutSize
        const outerSize = state.outerSize
        const leftPenalty = this.getLinearMeasurePenalty(bounds.min.x, spec.left, outerSize.x)
        const rightPenalty = this.getLinearMeasurePenalty(bounds.max.x, spec.right, outerSize.x)
        const bottomPenalty = this.getLinearMeasurePenalty(bounds.min.y, spec.bottom, outerSize.y)
        const topPenalty = this.getLinearMeasurePenalty(bounds.max.y, spec.top, outerSize.y)
        const frontPenalty = this.getLinearMeasurePenalty(bounds.max.z, spec.front, outerSize.z)
        const backPenalty = this.getLinearMeasurePenalty(bounds.min.z, spec.back, outerSize.z)
        // const combinedEdgePenalty = //Math.sqrt((rightPenalty + leftPenalty)**2 + (topPenalty + bottomPenalty)**2 + (frontPenalty + backPenalty)**2)
        const xPenalty = this.getLinearMeasurePenalty(center.x, spec.centerX, outerSize.x)
        const yPenalty = this.getLinearMeasurePenalty(center.y, spec.centerY, outerSize.y)
        const zPenalty = this.getLinearMeasurePenalty(center.z, spec.centerZ, outerSize.z)
        const widthPenalty = this.getLinearMeasurePenalty(size.x, spec.width, outerSize.x)
        const heightPenalty = this.getLinearMeasurePenalty(size.y, spec.height, outerSize.y)
        const depthPenalty = this.getLinearMeasurePenalty(size.z, spec.depth, outerSize.z)
        const diagonalLengthPenalty = this.getLinearMeasurePenalty(size.length(), spec.diagonalLength, outerSize.length())
        // const combinedSizePenalty = Math.sqrt(widthPenalty**2 + heightPenalty**2 + depthPenalty**2)
        // return Math.max(combinedEdgePenalty, combinedSizePenalty)
        return  leftPenalty +
                rightPenalty +
                bottomPenalty +
                topPenalty +
                frontPenalty +
                backPenalty +
                xPenalty +
                yPenalty +
                zPenalty +
                widthPenalty +
                heightPenalty +
                depthPenalty +
                diagonalLengthPenalty
    }

    public static getLinearMeasurePenalty(valueMeters:number, spec:LinearMeasureSpec|undefined, range:number) {
        if (spec === undefined) return 0
        // penalty for compound spec is smallest penalty in the list
        if (spec instanceof Array && spec.length) {
            let penalty = Infinity
            for (const s of spec) {
                penalty = Math.min(this._getLinearMeasurePenaltySingle(valueMeters, s, range), penalty)
            }
            return penalty
        }
        return this._getLinearMeasurePenaltySingle(valueMeters, spec, range)
    }

    private static _getLinearMeasurePenaltySingle(valueMeters:number, spec:LinearMeasureSpec|undefined, range:number) {
        if (spec === undefined) return 0
        // if (typeof spec === 'number') return Math.abs(valueMeters - spec)
        // penalty for single spec is distance from any valid value
        if ('gt' in spec || 'lt' in spec) {
            if (typeof (spec as any).gt !== 'undefined') {
                const minMeters = this.getMetersFromLinearMeasure((spec as any).gt, range)
                if (valueMeters < minMeters) return (minMeters - valueMeters)
            }
            if (typeof (spec as any).lt !== 'undefined') {
                const maxMeters = this.getMetersFromLinearMeasure((spec as any).lt, range)
                if (valueMeters > maxMeters) return (valueMeters - maxMeters)
            }  
            return 0
        }      
        return Math.abs(valueMeters - this.getMetersFromLinearMeasure(spec as LinearMeasure, range))
    }

    public static getVisualBoundsPenalty(state:Readonly<NodeState>, spec?:FrustumSpec) {
        if (spec === undefined) return 0

        let hasSpec = false
        for (const key in spec) {
            if (typeof spec[key as keyof FrustumSpec] !== 'undefined') 
                hasSpec = true 
        }

        if (!hasSpec) return 0
        
        const system = state.metrics.system
        const viewSizeDegrees = system.viewFrustum.sizeDegrees
        const viewDepthMeters = system.viewFrustum.depth
        const visualFrustum = state.visualFrustum
        const leftPenalty = this.getAngularMeasurePenalty(visualFrustum.leftDegrees, spec.left, viewSizeDegrees.x)
        const rightPenalty = this.getAngularMeasurePenalty(visualFrustum.rightDegrees, spec.right, viewSizeDegrees.x)
        const bottomPenalty = this.getAngularMeasurePenalty(visualFrustum.bottomDegrees, spec.bottom, viewSizeDegrees.y)
        const topPenalty = this.getAngularMeasurePenalty(visualFrustum.topDegrees, spec.top, viewSizeDegrees.y)
        const nearPenalty = this.getLinearMeasurePenalty(visualFrustum.nearMeters, spec.front, viewDepthMeters)
        const farPenalty = this.getLinearMeasurePenalty(visualFrustum.farMeters, spec.back, viewDepthMeters)
        // const combinedEdgePenalty = Math.sqrt((rightPenalty + leftPenalty)**2 + (topPenalty + bottomPenalty)**2 + (nearPenalty + farPenalty)**2)
        const visualSize = visualFrustum.sizeDegrees
        const widthPenalty = this.getAngularMeasurePenalty(visualSize.x, spec.width, viewSizeDegrees.x)
        const heightPenalty = this.getAngularMeasurePenalty(visualSize.y, spec.height, viewSizeDegrees.y)
        const depthPenalty = this.getLinearMeasurePenalty(visualFrustum.depth, spec.depth, viewDepthMeters)
        const diagonalLengthPenalty = this.getAngularMeasurePenalty(visualFrustum.diagonalLength, spec.diagonalLength, viewSizeDegrees.y)
        const centerXPenalty = this.getAngularMeasurePenalty(visualFrustum.centerDegrees.x, spec.centerX, viewSizeDegrees.x)
        const centerYPenalty = this.getAngularMeasurePenalty(visualFrustum.centerDegrees.y, spec.centerY, viewSizeDegrees.y)
        const centerZPenalty = this.getLinearMeasurePenalty(visualFrustum.distance, spec.centerZ, viewDepthMeters)
        const angleToCenterPenalty = this.getAngularMeasurePenalty(visualFrustum.angleToCenter, spec.centerY, viewSizeDegrees.y)
        
        // const combinedSizePenalty = Math.sqrt(widthPenalty**2 + heightPenalty**2 + depthPenalty**2)
        // return Math.max(combinedEdgePenalty, combinedSizePenalty)
        return  leftPenalty +
                rightPenalty +
                bottomPenalty +
                topPenalty +
                nearPenalty +
                farPenalty +
                widthPenalty +
                heightPenalty +
                depthPenalty + 
                diagonalLengthPenalty + 
                centerXPenalty + 
                centerYPenalty + 
                centerZPenalty + 
                angleToCenterPenalty
    }

    public static getAngularMeasurePenalty(valueDegrees:number, spec:AngularMeasureSpec|undefined, range:number) {
        if (spec === undefined) return 0
        // penalty for compound spec is smallest penalty in the list
        if (spec instanceof Array && spec.length) {
            let penalty = Infinity
            for (const s of spec) {
                penalty = Math.min(this._getAngularMeasurePenaltySingle(valueDegrees, s, range), penalty)
            }
            return penalty
        }
        const penalty = this._getAngularMeasurePenaltySingle(valueDegrees, spec, range)
        return penalty/360 * 100 // (1 + penalty/360)**10 - 1 // amplify larger penalty
    }
    
    private static _getAngularMeasurePenaltySingle(valueDegrees:number, spec:AngularMeasureSpec|undefined, rangeDegrees:number) {
        if (spec === undefined) return 0
        // penalty for single spec is distance from any valid value
        if ('gt' in spec || 'lt' in spec) {
            if (typeof (spec as any).gt !== 'undefined') {
                const minDegrees = this.getDegreesFromAngularMeasure((spec as any).gt, rangeDegrees)
                if (valueDegrees < minDegrees) return (minDegrees - valueDegrees)
            }
            if (typeof (spec as any).lt !== 'undefined') {
                const maxDegrees = this.getDegreesFromAngularMeasure((spec as any).lt, rangeDegrees)
                if (valueDegrees > maxDegrees) return (valueDegrees - maxDegrees)
            }
            return 0
        }
        return Math.abs(valueDegrees - this.getDegreesFromAngularMeasure(spec as AngularMeasure, rangeDegrees))
    }

    static getMetersFromLinearMeasure(measure:LinearMeasure, rangeMeters:number) {
        if (typeof measure === 'number') return measure
        return (measure.meters || 0) + 0.01 * (measure.centimeters || 0) + rangeMeters * (measure.percent || 0) / 100
    }

    static getDegreesFromAngularMeasure(measure:AngularMeasure, rangeDegrees:number) {
        if (typeof measure === 'number') return measure
        return (measure.degrees || 0) + MathUtils.RAD2DEG * (measure.radians || 0) + rangeDegrees * (measure.percent || 0) / 100
    }

    constructor() {
        // Object.seal(this) // seal to preserve call-site monomorphism
    }

    /**
     * The constraints applied to this layout
     */
    constraints = new Array<LayoutConstraint>()

    /**
     * The objectives applied to this layout
     */
    objectives = new Array<LayoutObjective>()
    
    /**
     * The parent node 
     * If `undefined`, target parent is the current parent
     * if `null`, this node is considered as flagged to be removed
     */
    parentNode? : Node3D|null

    /**
     * 
     */
    // setFromNodeState(node:Node3D) {
    //     const metrics = this.system.getMetrics(node)
    //     metrics.invalidateNodeState()
    //     const s = metrics.nodeState
    //     this.position = { x: s.localPosition.x, y: s.localPosition.y, z: s.localPosition.z }
    //     this.orientation = { x: s.localOrientation.x, y: s.localOrientation.y, z: s.localOrientation.z, w: s.localOrientation.w }
    //     this.scale = { x: s.localScale.x, y: s.localScale.y, z: s.localScale.z }
    // }

    /**
     * 
     */
    origin = new Vector3(0.5,0.5,0.5)

    /**
     * The content aspect constraint
     */
    aspect? = 'preserve-3d' as 'preserve-3d'|'preserve-2d'|'any'
    aspectConstraint = this._addConstraint((state) => {
        const aspect = this.aspect
        if (!aspect || aspect === 'any') return 0
        const worldScale = state.worldScale
        const s = this._aspect.copy(worldScale)
        const largest = aspect === 'preserve-3d' ? 
            Math.max(Math.abs(s.x), Math.abs(s.y), Math.abs(s.y)) : 
            Math.max(Math.abs(s.x), Math.abs(s.y))
        const aspectFill = s.divideScalar(largest)
        return aspect === 'preserve-3d' ?
            SpatialLayout.getVector3Penalty(aspectFill, V_111) : 
            SpatialLayout.getNumberPenalty(aspectFill.x, 1) + SpatialLayout.getNumberPenalty(aspectFill.y, 1)
        // return SpatialLayout.getVector3Penalty(aspectFill, V_111)
    })
    private _aspect = new Vector3

    /**
     * The local orientation constraint spec
     */
    orientation? : QuaternionSpec
    orientationConstraint = this._addConstraint((m) => {
        if (!this.orientation) return 0
        return SpatialLayout.getQuaternionPenalty(m.localOrientation, this.orientation, m.metrics.system.config.epsillonRadians)
    })

    // /**
    //  * The layout bounds spec
    //  */
    public bounds = new BoundsSpec
    public boundsConstraint = this._addConstraint((m) => {
        if (!this.bounds) return 0
        return SpatialLayout.getBoundsPenalty(m, this.bounds)
    })

    /** The visual bounds spec */
    public visual = new FrustumSpec
    public visualConstraint = this._addConstraint((m) => {
        if (!this.visual) return 0
        return SpatialLayout.getVisualBoundsPenalty(m, this.visual)
    })

    /**
     * The local position constraint spec (local units are ambigious).
     * Copies on assignment
     */
    position?: Vector3Spec
    positionConstraint = this._addConstraint((m) => {
        if (!this.position) return 0
        return SpatialLayout.getVector3Penalty(m.localPosition, this.position)
    })

    /**
     * The local scale constraint spec
     */
    scale?: Vector3Spec = {
        x:{ gt:1e-6, lt:1e6 },
        y:{ gt:1e-6, lt:1e6 },
        z:{ gt:1e-6, lt:1e6 }
    }
    scaleConstraint = this._addConstraint((m) => {
        if (!this.scale) return 0
        return 10 * SpatialLayout.getVector3Penalty(m.localScale, this.scale)
    })

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

    /** */
    public visualMaximize = true
    public visualMaximizeObjective = this._addObjective((state) => {
        return state.visualFrustum.diagonalLength
    })

    /**
     * Add a new layout constraint
     */
    private _addConstraint( score: ScoreFunction, relativeTolerance?:number, threshold?:number ) : LayoutConstraint {
        const c = {score, relativeTolerance, threshold}
        this.constraints.push(c)
        return c
    }

    /**
     * Add a new layout objective
     */
    private _addObjective( score: ScoreFunction, relativeTolerance?:number ) : LayoutObjective {
        const o = {score, relativeTolerance}
        this.objectives.push(o)
        return o
    }

    /**
     * The solutions being explored for this layout
     */
    get solutions() {
        return this.#solutions
    }
    #solutions = new Array<LayoutSolution>()

    /**
     * Transition overrides for this layout
     */
    transition = new TransitionConfig

    /**
     * The current optimization iteration
     */
    iteration = 0
}

export interface LayoutObjective {
    score: ScoreFunction,
    relativeTolerance?: number
}

export interface LayoutConstraint extends LayoutObjective {
    threshold?: number
}

export interface MutationStrategy {type:string, stepSize: number, successRate:number}

export class LayoutSolution {

    /**
     * The adapter associated with this solution
     */
    adapter: SpatialAdapter = undefined as any

    /**
     * The layout associated with this solution
     */
    layout: SpatialLayout = undefined as any

    /**
     * The layout orientation (relative to parent orientation)
     */
    orientation = new Quaternion

    /**
     * The layout bounds (world units)
     */
    bounds = new Box3


    get aspectPenalty() {
        return this.constraintScores[this.layout.constraints.indexOf(this.layout.aspectConstraint)]||0
    }

    get orientationPenalty() {
        return this.constraintScores[this.layout.constraints.indexOf(this.layout.orientationConstraint)]||0
    }

    get boundsPenalty() {
        return this.constraintScores[this.layout.constraints.indexOf(this.layout.boundsConstraint)]||0
    }


    /**
     * The constraint violation penalties for this solution
     * (one for each constraint, lower is better)
     */
    constraintScores = [] as number[]

    /**
     * The objectives fitness scores for this solution
     * (one for each objective, higher is better)
     */
    objectiveScores = [] as number[]
    

    mutationStrategies = [
        {type:'rotate', stepSize: 0.1, successRate:0.2},
        {type:'centerX', stepSize: 0.1, successRate:0.2},
        {type:'centerY', stepSize: 0.1, successRate:0.2},
        {type:'centerZ', stepSize: 0.1, successRate:0.2},
        {type:'sizeX', stepSize: 0.1, successRate:0.2},
        {type:'sizeY', stepSize: 0.1, successRate:0.2},
        {type:'sizeZ', stepSize: 0.1, successRate:0.2},
        {type:'minX', stepSize: 0.1, successRate:0.2},
        {type:'minY', stepSize: 0.1, successRate:0.2},
        {type:'minZ', stepSize: 0.1, successRate:0.2},
        {type:'maxX', stepSize: 0.1, successRate:0.2},
        {type:'maxY', stepSize: 0.1, successRate:0.2},
        {type:'maxZ', stepSize: 0.1, successRate:0.2},
        {type:'minXAspect', stepSize: 0.1, successRate:0.2},
        {type:'minYAspect', stepSize: 0.1, successRate:0.2},
        {type:'minZAspect', stepSize: 0.1, successRate:0.2},
        {type:'maxXAspect', stepSize: 0.1, successRate:0.2},
        {type:'maxYAspect', stepSize: 0.1, successRate:0.2},
        {type:'maxZAspect', stepSize: 0.1, successRate:0.2},
        {type:'corner000', stepSize: 0.1, successRate:0.2},
        {type:'corner001', stepSize: 0.1, successRate:0.2},
        {type:'corner010', stepSize: 0.1, successRate:0.2},
        {type:'corner011', stepSize: 0.1, successRate:0.2},
        {type:'corner100', stepSize: 0.1, successRate:0.2},
        {type:'corner101', stepSize: 0.1, successRate:0.2},
        {type:'corner110', stepSize: 0.1, successRate:0.2},
        {type:'corner111', stepSize: 0.1, successRate:0.2},
    ]

    private _selectStrategy() {
        const strategies = this.mutationStrategies
        const weights = this._mutationWeights

        for (let i=0; i< strategies.length; i++) {
            weights[i] = strategies[i].successRate
        }
        
        const defaultThreshold = this.adapter.system.config.optimize.constraintThreshold
        if (this.aspectPenalty > (this.layout.aspectConstraint.threshold || defaultThreshold)) {
            for (let i=0; i< weights.length; i++) {
                weights[i] *= strategies[i].type.includes('size') ? 100 : 1
            }
        }

        if (this.orientationPenalty > (this.layout.orientationConstraint.threshold || defaultThreshold)) {
            weights[0] *= 1000
        }

        return randomSelect(strategies, weights)
    }
    private _mutationWeights = [] as number[]

    copy(solution:LayoutSolution) {
        this.adapter = solution.adapter
        this.layout = solution.layout
        this.orientation.copy( solution.orientation )
        this.bounds.copy( solution.bounds )
        this.constraintScores.length = 0
        this.objectiveScores.length = 0
        for (const s of solution.constraintScores) this.constraintScores.push(s)
        for (const s of solution.objectiveScores) this.objectiveScores.push(s)
        return this
    }

    private static _scratchV1 = new Vector3 
    private static _scratchV2 = new Vector3

    randomize(sizeHint:number) {
        this.orientation.copy(randomQuaternion())
        const center = LayoutSolution._scratchV1.set(
            (Math.random() - 0.5) * sizeHint * 2 + gaussian(sizeHint),
            (Math.random() - 0.5) * sizeHint * 2 + gaussian(sizeHint),
            (Math.random() - 0.5) * sizeHint * 2 + gaussian(sizeHint)
        )
        const halfSize = LayoutSolution._scratchV2.set(
            Math.random() * sizeHint * 2 + sizeHint * 0.1,
            Math.random() * sizeHint * 2 + sizeHint * 0.1,
            Math.random() * sizeHint * 2 + sizeHint * 0.1
        )
        this.bounds.min.copy(center).sub(halfSize)
        this.bounds.max.copy(center).add(halfSize)
        this.bounds = this.bounds
        return this
    }
    
    private static _center = new Vector3
    private static _size = new Vector3
    private static _otherCenter = new Vector3
    private static _otherSize = new Vector3

    moveTowards(solution:LayoutSolution, minFreq:number, maxFreq:number) {
        const center = this.bounds.getCenter(LayoutSolution._center)
        const size = this.bounds.getSize(LayoutSolution._size)
        const otherBounds = solution.bounds
        const otherCenter = otherBounds.getCenter(LayoutSolution._otherCenter)
        const otherSize = otherBounds.getSize(LayoutSolution._otherSize)
        this.orientation.slerp(solution.orientation, LayoutSolution.generatePulseFrequency(minFreq, maxFreq)).normalize()
        if (Math.random() < 0.5) {
            center.lerp(otherCenter, LayoutSolution.generatePulseFrequency(minFreq, maxFreq))
            size.lerp(otherSize, LayoutSolution.generatePulseFrequency(minFreq, maxFreq))
            this.bounds.setFromCenterAndSize(center, size)
        } else {
            this.bounds.min.lerp(otherBounds.min, LayoutSolution.generatePulseFrequency(minFreq, maxFreq))
            this.bounds.max.lerp(otherBounds.max, LayoutSolution.generatePulseFrequency(minFreq, maxFreq))
        }
    }
    
    /**
     *  
     * @param stepSize 
     * 
     */
    perturb() {
        
        let strategy = this._selectStrategy()
        const strategyType = strategy.type
        let stepSize = strategy.stepSize

        // orientation mutation strategy
        if (strategyType === 'rotate') {
            if (this.layout.orientation && (this.layout.orientation as Quaternion).isQuaternion) {
                this.orientation.copy(this.layout.orientation as any)
                return strategy
            }
            stepSize = strategy.stepSize = Math.min(stepSize, 1)
            const scale = Math.min(levy(stepSize*0.00001), 1)
            this.orientation.multiply(randomQuaternion(scale, scale)).normalize()
            return strategy
        }

        const bounds = this.bounds
        const center = bounds.getCenter(LayoutSolution._center)
        const size = bounds.getSize(LayoutSolution._size)
        size.clampScalar(1e-6,1e10)

        // center mutation strategies
        if (strategyType === 'centerX')  {
            const outerSize = this.adapter.metrics.targetState.outerSize
            center.x += this._perturbFromLinearMeasureSpec(center.x, outerSize.x, stepSize, this.layout.bounds.centerX)
        } else if (strategyType === 'centerY')  {
            const outerSize = this.adapter.metrics.targetState.outerSize
            center.y += this._perturbFromLinearMeasureSpec(center.y, outerSize.y, stepSize, this.layout.bounds.centerY)
        } else if (strategyType === 'centerZ')  {
            const outerSize = this.adapter.metrics.targetState.outerSize
            center.z += this._perturbFromLinearMeasureSpec(center.z, outerSize.z, stepSize, this.layout.bounds.centerZ)
        }

        // size mutation strategies
        else if (strategyType === 'sizeX') {
            const outerSize = this.adapter.metrics.targetState.outerSize
            size.x += this._perturbFromLinearMeasureSpec(size.x, outerSize.x, stepSize, this.layout.bounds.width)
        } else if (strategyType === 'sizeY') {
            const outerSize = this.adapter.metrics.targetState.outerSize
            size.y += this._perturbFromLinearMeasureSpec(size.y, outerSize.y, stepSize, this.layout.bounds.height)
        } else if (strategyType === 'sizeZ') {
            const outerSize = this.adapter.metrics.targetState.outerSize
            size.z += this._perturbFromLinearMeasureSpec(size.z, outerSize.z, stepSize, this.layout.bounds.depth)
        }

        size.x = Math.abs(size.x)
        size.y = Math.abs(size.y)
        size.z = Math.abs(size.z)
        size.clampScalar(1e-6,1e10)
        bounds.setFromCenterAndSize(center, size)

        if (strategyType === 'minX')  {
            const outerSize = this.adapter.metrics.targetState.outerSize
            const diff = this._perturbFromLinearMeasureSpec(bounds.min.x, outerSize.x, stepSize, this.layout.bounds.left)
            bounds.min.x += diff
            bounds.max.x += diff
        } else if (strategyType === 'minY')  {
            const outerSize = this.adapter.metrics.targetState.outerSize
            const diff = this._perturbFromLinearMeasureSpec(bounds.min.y, outerSize.y, stepSize, this.layout.bounds.bottom)
            bounds.min.y += diff
            bounds.max.y += diff
        } else if (strategyType === 'minZ')  {
            const outerSize = this.adapter.metrics.targetState.outerSize
            const diff = this._perturbFromLinearMeasureSpec(bounds.min.z, outerSize.z, stepSize, this.layout.bounds.back)
            bounds.min.z += diff
            bounds.max.z += diff
        } else if (strategyType === 'maxX')  {
            const outerSize = this.adapter.metrics.targetState.outerSize
            const diff = this._perturbFromLinearMeasureSpec(bounds.max.x, outerSize.x, stepSize, this.layout.bounds.right)
            bounds.min.x += diff
            bounds.max.x += diff
        } else if (strategyType === 'maxY')  {
            const outerSize = this.adapter.metrics.targetState.outerSize
            const diff = this._perturbFromLinearMeasureSpec(bounds.max.y, outerSize.y, stepSize, this.layout.bounds.top)
            bounds.min.y += diff
            bounds.max.y += diff
        } else if (strategyType === 'maxZ')  {
            const outerSize = this.adapter.metrics.targetState.outerSize
            const diff = this._perturbFromLinearMeasureSpec(bounds.max.z, outerSize.z, stepSize, this.layout.bounds.front)
            bounds.min.z += diff
            bounds.max.z += diff
        } else if (strategyType === 'minXAspect')  {
            const scale = 2 ** gaussian(stepSize)
            center.x -= (size.x * scale - size.x) * 0.5
            size.multiplyScalar(scale)
            bounds.setFromCenterAndSize(center, size)
        } else if (strategyType === 'minYAspect')  {
            const scale = 2 ** gaussian(stepSize)
            center.y -= (size.y * scale - size.y) * 0.5
            size.multiplyScalar(scale)
            bounds.setFromCenterAndSize(center, size)
        } else if (strategyType === 'minZAspect')  {
            const scale = 2 ** gaussian(stepSize)
            center.z -= (size.z * scale - size.z) * 0.5
            size.multiplyScalar(scale)
            bounds.setFromCenterAndSize(center, size)
        } else if (strategyType === 'maxXAspect')  {
            const scale = 2 ** gaussian(stepSize)
            center.x += (size.x * scale - size.x) * 0.5
            size.multiplyScalar(scale)
            bounds.setFromCenterAndSize(center, size)
        } else if (strategyType === 'maxYAspect')  {
            const scale = 2 ** gaussian(stepSize)
            center.y += (size.y * scale - size.y) * 0.5
            size.multiplyScalar(scale)
            bounds.setFromCenterAndSize(center, size)
        } else if (strategyType === 'maxZAspect')  {
            const scale = 2 ** gaussian(stepSize)
            center.z += (size.z * scale - size.z) * 0.5
            size.multiplyScalar(scale)
            bounds.setFromCenterAndSize(center, size)
        } else if (strategyType === 'corner000') {
            LayoutSolution._mutateCorner(bounds,'min','min','min',stepSize)
        } else if (strategyType === 'corner001') {
            LayoutSolution._mutateCorner(bounds,'min','min','max',stepSize)
        } else if (strategyType === 'corner010') {
            LayoutSolution._mutateCorner(bounds,'min','max','min',stepSize)
        } else if (strategyType === 'corner011') {
            LayoutSolution._mutateCorner(bounds,'min','max','max',stepSize)
        } else if (strategyType === 'corner100') {
            LayoutSolution._mutateCorner(bounds,'max','min','min',stepSize)
        } else if (strategyType === 'corner101') {
            LayoutSolution._mutateCorner(bounds,'max','min','max',stepSize)
        } else if (strategyType === 'corner110') {
            LayoutSolution._mutateCorner(bounds,'max','max','min',stepSize)
        } else if (strategyType === 'corner111') {
            LayoutSolution._mutateCorner(bounds,'max','max','max',stepSize)
        }
        
        return strategy
    }

    private _perturbFromLinearMeasureSpec(value:number, range:number, stepSize:number, spec?:LinearMeasureSpec) {
        if (spec === undefined) return gaussian(stepSize)
        if (spec instanceof Array) spec = randomSelect(spec)
        if (SpatialLayout.isDiscreteSpec(spec)) {
            return - value + SpatialLayout.getMetersFromLinearMeasure(spec, range)
        } 
        const continuousSpec = spec as ContinuousSpec<LinearMeasureSpec>
        const min = continuousSpec.gt && SpatialLayout.getMetersFromLinearMeasure(continuousSpec.gt, range)
        const max = continuousSpec.lt && SpatialLayout.getMetersFromLinearMeasure(continuousSpec.lt, range)
        if (value < min || value > max) {
            if (min !== undefined && max !== undefined) {
                return - value + min + Math.random() * (max - min)
            } else if (min !== undefined) {
                return - value + min + levy(stepSize * 0.1)
            } else if (max !== undefined) {
                return - value + max - levy(stepSize * 0.1)
            }
        }
        return gaussian(stepSize)
    }

    static generatePulseFrequency(min:number,max:number) {
        return min + Math.random() * (max - min)
    }

    private static _mutateCorner(bounds:Box3, sideX:'min'|'max', sideY:'min'|'max', sideZ:'min'|'max', stepSize:number) {
        const center = bounds.getCenter(this._center)
        const diff = LayoutSolution._scratchV1.set(bounds[sideX].x, bounds[sideY].y, bounds[sideZ].z).sub(center)
        const length = diff.length() * 2 ** gaussian(stepSize)
        diff.normalize().multiplyScalar(length)
        bounds[sideX].x = diff.x + center.x
        bounds[sideY].y = diff.y + center.y
        bounds[sideZ].z = diff.z + center.z
    }
}