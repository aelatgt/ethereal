import { Node3D } from './EtherealSystem'
import { Vector3, Quaternion, Box3, MathUtils, Ray, randomSelect, randomQuaternion, gaussian, levy, Vector2} from './math-utils'
import { TransitionConfig } from './Transitionable'
import { NodeState } from './SpatialMetrics'
import { SpatialAdapter } from './SpatialAdapter'

export type OneOrMany<T> = T|T[]

export type AtLeastOneProperty<T, U = {[K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U]

export type DiscreteOrContinuous<T> = T|{gt:T,lt:T}|{gt:T}|{lt:T}

export type NumberSpec = OneOrMany<DiscreteOrContinuous<string|number>>

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
// export type LinearMeasure = AtLeastOneProperty<{
//     percent : number
//     meters : number
//     centimeters: number
// }>

// /**
//  * Specify a visual measure with various units,
//  * all of which are summed together as a single measure
//  */
// export type VisualMeasure = string | MathNode

/**
 * Generic measure spec, generally a unitless value. 
 */
export type MeasureSpec = OneOrMany<DiscreteOrContinuous<string>>

/**
 * Linear spec should be convertable to meters.
 * 
 * Units allowed: any standard length unit.
 * Additionally, percent (%) can be used,
 * which is based on the bounding context's size.
 */
export type LinearMeasureSpec = MeasureSpec

/**
 * Visual spec should be convertable to pixels.
 * Units allowed: px, vw, vh, %
 */
export type VisualMeasureSpec = MeasureSpec

/**
 * Angular spec should be convertable to rotations.
 * 
 * Units allowed: deg, rad, rot
 */
export type AngularMeasureSpec = MeasureSpec

export type LayoutMeasureType = 'local'|'visual'|'view'
export type LayoutMeasureSubType = 'left'|'bottom'|'top'|'right'|'front'|'back'|'width'|'height'|'depth'|'diagonal'|'centerX'|'centerY'|'centerZ'

export class BoundsSpec {
    left? : LinearMeasureSpec   
    bottom? : LinearMeasureSpec 
    right? : LinearMeasureSpec  
    top? : LinearMeasureSpec    
    front? : LinearMeasureSpec  
    back? : LinearMeasureSpec   
    width? : LinearMeasureSpec
    height? : LinearMeasureSpec
    depth? : LinearMeasureSpec
    diagonal? : LinearMeasureSpec
    centerX? : LinearMeasureSpec
    centerY? : LinearMeasureSpec
    centerZ? : LinearMeasureSpec
    pull?: PullSpec
}

export class VisualSpec {
    left? : VisualMeasureSpec   
    bottom? : VisualMeasureSpec 
    right? : VisualMeasureSpec  
    top? : VisualMeasureSpec    
    front? : LinearMeasureSpec   
    back? : LinearMeasureSpec    
    width? : VisualMeasureSpec
    height? : VisualMeasureSpec
    diagonal? : VisualMeasureSpec
    centerX? : VisualMeasureSpec
    centerY? : VisualMeasureSpec
    centerZ? : LinearMeasureSpec
    pull?: PullSpec
}

export type PullSpec = AtLeastOneProperty<{
    direction: AtLeastOneProperty<{x:number, y:number, z:number}>,
    position: AtLeastOneProperty<{x:number, y:number, z:number}>
}>

export type ScoreFunction = () => number

type DiscreteSpec<T> = Exclude<T,any[]|undefined|Partial<{gt:any,lt:any}>>
type ContinuousSpec<T> = T extends any[] | undefined ? never : 
    T extends {gt:any,lt:any} ? T : never

// type K = UnionToIntersection<Exclude<LinearMeasureSpec, Array<any>|Exclude<LinearMeasureSpec,Partial<{gt:any,lt:any}>>>>
// type X = Exclude<keyof UnionToIntersection<LinearMeasureSpec>,'gt'|'lt'>
/**
 * Defines spatial layout constraints/goals
 */
export class SpatialLayout {

    public static compiledExpressions = new Map<string,math.EvalFunction>() 

    public static isDiscreteSpec<T>(s:T) : s is DiscreteSpec<T> {
        return s !== undefined && s instanceof Array === false && ('gt' in s || 'lt' in s) === false
    }

    public static isContinuousSpec<T>(s:T) : s is ContinuousSpec<T> {
        return s !== undefined && s instanceof Array === false && ('gt' in s || 'lt' in s) === true
    }

    constructor(public adapter:SpatialAdapter<any>) {
        // Object.seal(this) // seal to preserve call-site monomorphism
    }

    public getNumberPenalty(value:number, spec?:NumberSpec) {
        if (spec === undefined) return 0
        // penalty for compound spec is smallest penalty in the list
        if (spec instanceof Array) {
            let penalty = Infinity
            for (const s of spec) {
                penalty = Math.min(this._getNumberPenaltySingle(value, s), penalty)
            }
            return penalty
        }
        const penalty = this._getNumberPenaltySingle(value, spec)
        return penalty
    }

    private _getNumberPenaltySingle(value:number, spec?:DiscreteOrContinuous<string|number>) {
        if (spec === undefined) return 0
        // penalty for single spec is distance from any valid value
        if (typeof spec !== 'object') return Math.abs(value as number - this.measureNumber(spec))
        const min = 'gt' in spec ? this.measureNumber(spec.gt) : undefined
        const max = 'lt' in spec ? this.measureNumber(spec.lt) : undefined
        if (min !== undefined && value < min) return min - value
        if (max !== undefined && value > max) return value - max
        return 0
    }

    public getVector3Penalty(value:Vector3, spec?:Vector3Spec, epsillon=0) {
        if (spec === undefined) return 0
        // penalty for compound spec is smallest penalty in the list
        if (spec instanceof Array) {
            let penalty = Infinity
            for (const s of spec) {
                penalty = Math.min(this._getVector3PenaltySingle(value, s), penalty)
                if (penalty <= epsillon) {
                    return 0
                }
            }
            return penalty
        }
        const penalty = this._getVector3PenaltySingle(value, spec)
        if (penalty <= epsillon) {
            return 0
        }
        return penalty
    }

    private _getVector3PenaltySingle(value:Vector3, spec:Vector3Spec) {
        // penalty for discrete spec is distance from the valid value
        const xPenalty = ('x' in spec && typeof spec.x !== 'undefined') ? this.getNumberPenalty(value.x, spec.x) : 0
        const yPenalty = ('y' in spec && typeof spec.y !== 'undefined') ? this.getNumberPenalty(value.y, spec.y) : 0
        const zPenalty = ('z' in spec && typeof spec.z !== 'undefined') ? this.getNumberPenalty(value.z, spec.z) : 0
        const magnitudePenalty = ('magnitude' in spec && typeof spec.magnitude !== 'undefined') ? this.getNumberPenalty(value.length(), spec.magnitude) : 0
        const xyzPenalty = Math.sqrt(xPenalty**2 + yPenalty**2 + zPenalty**2)
        return Math.max(xyzPenalty, magnitudePenalty)
    }

    public getQuaternionPenalty(value:Quaternion, spec?:QuaternionSpec, epsillon=0) {
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

    private _getQuaternionPenaltySingle(value:Quaternion, spec?:QuaternionSpec) {
        if (spec === undefined) return 0
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

    public getBoundsPenalty(spec:BoundsSpec|undefined, type:LayoutMeasureType) {
        if (spec === undefined) return 0
        let penalty = 0
        for (const key in spec) {
            let k = key as keyof BoundsSpec
            if (k === 'pull') continue
            penalty += this.getBoundsMeasurePenalty(spec[k], type, k)
        }
        return penalty
    }
    
    public getNearFarPenalty(viewSpec:VisualSpec, visualSpec:VisualSpec) {
        // if (!(  'near' in viewSpec || 'far' in viewSpec || 'centerZ' in viewSpec ||
        //         'near' in visualSpec || 'far' in visualSpec || 'centerZ' in visualSpec)) 
        //         return 0

        const nearPenalty = 
            this.getBoundsMeasurePenalty(viewSpec.front, 'visual', 'front') +
            this.getBoundsMeasurePenalty(visualSpec.front, 'visual', 'front')
        const farPenalty = 
            this.getBoundsMeasurePenalty(viewSpec.back, 'visual', 'back') +
            this.getBoundsMeasurePenalty(visualSpec.back, 'visual', 'back') 
        const centerZPenalty = 
            this.getBoundsMeasurePenalty(viewSpec.centerZ, 'visual', 'centerZ') +
            this.getBoundsMeasurePenalty(visualSpec.centerZ, 'visual', 'centerZ')

        const state = this.adapter.metrics.targetState
        const bounds = state.visualBounds
        const depth = bounds.max.z - bounds.min.z
        const near = -state.metrics.system.viewFrustum.nearMeters
        const negDepthPenalty = depth < 0 ? -depth : 0
        const beyondNearPenalty = 
            (bounds.min.z > near ? bounds.min.z-near : 0) + 
            (bounds.max.z > near ? bounds.max.z-near : 0)

        return  (nearPenalty + farPenalty + centerZPenalty + negDepthPenalty + beyondNearPenalty) * 
            (1+negDepthPenalty) * (1+beyondNearPenalty)
    }


    public getBoundsMeasurePenalty(spec:MeasureSpec|undefined, type:LayoutMeasureType, subType:LayoutMeasureSubType) {
        if (spec === undefined) return 0
        const state = this.adapter.metrics.targetState
        let bounds : Box3
        let center : Vector3
        let size : Vector3
        switch (type) {
            case 'local': 
                bounds = state.layoutBounds
                center = state.layoutCenter
                size = state.layoutSize
                break
            case 'view': 
                const viewState = state.metrics.system.viewMetrics.targetState
                bounds = viewState.visualBounds
                center = viewState.visualCenter
                size = viewState.visualSize
                break
            case 'visual': 
                bounds = state.visualBounds
                center = state.visualCenter
                size = state.visualSize
                break
            default: 
                throw new Error(`Unknown measure type "${type}.${subType}" in spec "${spec}"`)
        }
        let value = 0
        switch (subType) {
            case 'left':    value = bounds.min.x; break
            case 'right':   value = bounds.max.x; break
            case 'bottom':  value = bounds.min.y; break
            case 'top':     value = bounds.max.y; break
            case 'back':    value = bounds.min.z; break
            case 'front':   value = bounds.max.z; break
            case 'centerX': value = center.x; break
            case 'centerY': value = center.y; break
            case 'centerZ': value = center.z; break
            case 'width':   value = size.x; break
            case 'height':  value = size.y; break
            case 'depth':   value = size.z; break
            case 'diagonal': value = type === 'local' ? 
                size.length() : Math.sqrt(size.x**2 + size.y**2); break
            default: 
                throw new Error(`Unknown measure subtype ${type}.${subType} in spec "${spec}"`)
        }
        // penalty for compound spec is smallest penalty in the list
        if (spec instanceof Array && spec.length) {
            let penalty = Infinity
            for (const s of spec) {
                penalty = Math.min(this._getMeasurePenaltySingle(value, s, type, subType), penalty)
            }
            return penalty
        }
        return this._getMeasurePenaltySingle(value, spec, type, subType)
    }

    private _getMeasurePenaltySingle(value:number, spec:LinearMeasureSpec|undefined, type:LayoutMeasureType, subType:LayoutMeasureSubType) {
        if (spec === undefined) return 0
        // penalty for single spec is distance from any valid value
        if (typeof spec === 'object') {
            if ('gt' in spec) {
                const min = this.measureLayout(spec.gt, type, subType)
                if (value < min) return (min - value)
            }
            if ('lt' in spec) {
                const max = this.measureLayout(spec.lt, type, subType)
                if (value > max) return (value - max)
            }  
            return 0
        }
        return Math.abs(value - this.measureLayout(spec, type, subType))
    }

    measureNumber(measure:string|number) {
        if (typeof measure === 'number') return measure
        if (this.measureCache?.has(measure)) return this.measureCache.get(measure)!

        const system = this.adapter.system
        if (!SpatialLayout.compiledExpressions.has(measure)) {
            const node = system.math.parse(measure)
            const code = node.compile()
            SpatialLayout.compiledExpressions.set(measure, code)
        }
        const code = SpatialLayout.compiledExpressions.get(measure)!
        const value = code.evaluate(system.mathScope)
        this.measureCache?.set(measure, value)
        return system.math.number(value) as number
    }

    measureLayout(measure:string, type:LayoutMeasureType, sType:LayoutMeasureSubType) {
        const cacheKey = type+sType+measure
        if (this.measureCache?.has(cacheKey)) return this.measureCache.get(cacheKey)!

        const system = this.adapter.system
        const math = system.math
        const scope = system.mathScope

        if (!SpatialLayout.compiledExpressions.has(measure)) {
            const node = math.parse(measure.replace('%', 'percent'))
            const code = node.compile()
            SpatialLayout.compiledExpressions.set(measure, code)
        }
        const code = SpatialLayout.compiledExpressions.get(measure)!

        const state = this.adapter.metrics.targetState
        let referenceBounds : Box3
        let referenceCenter: Vector3
        switch (type) {
            case 'local': 
                referenceBounds = state.outerBounds
                referenceCenter = state.outerCenter
                break
            case 'visual': 
                referenceBounds = state.outerState.visualBounds
                referenceCenter = state.outerState.visualCenter
                break
            case 'view': 
                const viewState = state.metrics.system.viewMetrics.targetState
                referenceBounds = viewState.visualBounds
                referenceCenter = viewState.visualCenter
                break
            default: 
                throw new Error(`Unknown measure type "${type}.${sType}"`)
        }

        if (measure.includes('%')) {
            const outerSize = type === 'local' ? state.outerSize : state.outerState.visualSize
            let percent = 0 as number|math.Unit
            switch (sType) {
                case 'left': case 'centerX': case 'right': case 'width':
                    percent = math.unit(outerSize.x / 100, 'm')
                    break
                case 'bottom': case 'centerY': case 'top': case 'height':
                    percent = math.unit(outerSize.y / 100, 'm')
                    break
                case 'back': case 'centerZ': case 'front': case 'depth':
                    percent = math.unit(outerSize.z / 100, 'm')
                    break
                case 'diagonal': 
                    percent = type === 'local' ? 
                        math.unit(outerSize.length() / 100, 'm') : 
                        math.unit(Math.sqrt(outerSize.x ** 2 + outerSize.y ** 2) / 100, 'px')
                    break
                default:
                    throw new Error(`Unknown measure subtype "${type}.${sType}"`)
            }
            scope.percent = percent
        }

        let offset = 0
        switch (sType) {
            case 'left': offset = referenceBounds.min.x; break;
            case 'right': offset = referenceBounds.max.x; break;
            case 'centerX': offset = referenceCenter.x; break;
            case 'bottom': offset = referenceBounds.min.y; break;
            case 'top': offset = referenceBounds.max.y; break;
            case 'centerY': offset = referenceCenter.y; break;
            case 'front': offset = referenceBounds.min.z; break;
            case 'back': offset = referenceBounds.max.z; break;
            case 'centerZ': offset = referenceCenter.z; break;
        }

        let unit = (type === 'local' || 
                    sType === 'front' || 
                    sType === 'back' || 
                    sType === 'centerZ' || 
                    sType === 'depth') ? scope.meter : scope.pixel
                    
        const value = math.number!(code.evaluate(scope), unit) + offset
        scope.percent = undefined
        this.measureCache?.set(cacheKey, value)
        return value
    }

    measureCache = new Map<string, number>()

    /**
     * The constraints applied to this layout
     */
    constraints = new Array<LayoutConstraint>()

    /**
     * The objectives applied to this layout
     */
    objectives = new Array<LayoutObjective>()


    /**
     * Clear all of the default constraints
     */
    
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
    * The aspect constraint specification
    */
   aspect? = 'preserve-3d' as 'preserve-3d'|'preserve-2d'|'any'
   /**
    * Measures distance from normalized world scale
    * (1,1,1) or (1,1,any) 
    */
   aspectConstraint = this.addConstraint({
       name:'aspect',
       threshold: 0.1,
       evaluate: () => {
        const aspect = this.aspect
        if (!aspect || aspect === 'any') return 0
        const worldScale = this.adapter.metrics.targetState.worldScale
        const s = this._aspect.copy(worldScale)
        const largest = aspect === 'preserve-3d' ? 
            Math.max(Math.abs(s.x), Math.abs(s.y), Math.abs(s.z)) : 
            Math.max(Math.abs(s.x), Math.abs(s.y))
        const aspectFill = s.divideScalar(largest)
        return  this.getNumberPenalty(aspectFill.x, 1) +
                this.getNumberPenalty(aspectFill.y, 1) +
                (aspect === 'preserve-3d' ? 
                    this.getNumberPenalty(aspectFill.z, 1):
                    // prevent z from being scaled largest when doing preserved 2D aspect
                    aspectFill.z > 1 ? aspectFill.z : 1) 
        }
    })
   private _aspect = new Vector3

    /**
     * The local orientation constraint spec
     */
    orientation? : QuaternionSpec
    /**
     * Measures angle (in degrees) to orientation spec 
     */
    orientationConstraint = this.addConstraint({
        name:'orientation',
        threshold: 0.01,
        evaluate: () => {
            if (!this.orientation) return 0
            const system = this.adapter.system
            const state = this.adapter.metrics.targetState
            return this.getQuaternionPenalty(state.localOrientation, this.orientation, system.config.epsillonRadians)
        }
    })

    /**
     * The local position constraint spec
     * (local units are ambigious due to potential parent scaling).
     */
    position?: Vector3Spec
    /**
     * Measures distance from position spec
     */
    positionConstraint = this.addConstraint({
        name:'position',
        threshold: 0.1,
        evaluate: () => {
            if (!this.position) return 0
            const state = this.adapter.metrics.targetState
            return this.getVector3Penalty(state.localPosition, this.position)
        }
    })

    /**
     * The local scale constraint spec
     */
    scale?: Vector3Spec = {
        x:{ gt:1e-8, lt:1e8 },
        y:{ gt:1e-8, lt:1e8 },
        z:{ gt:1e-8, lt:1e8 }
    }
    /**
     * Measures distance from scale spec
     */
    scaleConstraint = this.addConstraint({
        name:'scale',
        threshold: 0.1,
        evaluate: () => {
            if (!this.scale) return -1
            const state = this.adapter.metrics.targetState
            return this.getVector3Penalty(state.localScale, this.scale)
        }
    })

    /**
     * The local bounds spec
     */
    public local = new BoundsSpec
    /**
     * Measures distance from local bounds spec
     */
    public localConstraint = this.addConstraint({
        name: 'local',
        threshold: 0.01,
        evaluate: () => {
            if (!this.local) return 0
            return this.getBoundsPenalty(this.local, 'local')
        }
    })

    /** 
     * The local visual bounds (specified relative to 
     * the closest visual bounding context)
     * */
    public visual = new VisualSpec
    
    /*
    * The global visual bounds (specified relative to 
    * the view)
    */
    public view = new VisualSpec

    /**
     * Measure near/far distance (in meter) from visual bounds spec
     */
    public nearFarConstraint = this.addConstraint({
        name: 'near-far',
        threshold: 0.01,
        evaluate: () => {
            return this.getNearFarPenalty(this.visual, this.view)
        }
    })

    /**
     * Computes pixel-based penalty from view bounds spec
     */
    public viewBoundsConstraint = this.addConstraint({
        name: 'view-bounds',
        threshold: 10,
        evaluate: () => {
            if (!this.view) return 0
            return this.getBoundsPenalty(this.view, 'view')
        }
    })

    /**
     * Computes pixel-based penalty from visual bounds spec
     */
    public visualBoundsConstraint = this.addConstraint({
        name: 'visual-bounds',
        threshold: 10,
        evaluate: () => {
            if (!this.visual) return 0
            return this.getBoundsPenalty(this.visual, 'visual')
        }
    })

    private _pullCenter = new Vector3
    private _pullRay = new Ray
    private _pullClosestPoint = new Vector3
    private _pullDirection = new Vector3

    /** 
     * Measures negative distance from pull position
    */
    public pullLocalObjective = this.addObjective({
        name: 'pull-local',
        evaluate: () => {
            const ray = this._pullRay
            const pullPosition = this.local.pull?.position
            const pullDirection = this.local.pull?.direction
            if (!pullPosition && !pullDirection) return 0
            const state = this.adapter.metrics.targetState
            const center = state.layoutCenter
            let centerDist = 0
            let directionDist = 0
            if (pullPosition) {
                const xDiff = typeof pullPosition.x === 'number' ? pullPosition.x - center.x : 0
                const yDiff = typeof pullPosition.y === 'number' ? pullPosition.y - center.y : 0
                const zDiff = typeof pullPosition.z === 'number' ? pullPosition.z - center.z : 0
                centerDist = xDiff**2 + yDiff**2 + zDiff**2
            }
            if (pullDirection) {
                ray.origin.set(0,0,0)
                ray.direction.set(pullDirection.x || 0, pullDirection.y || 0, pullDirection.z || 0).normalize()
                const closestPoint = ray.closestPointToPoint(center, center)
                directionDist = ray.distanceToPoint(closestPoint)
            }
            return - centerDist + directionDist
        }
    })

    public pullVisualObjective = this.addObjective({
        name: 'pull-visual',
        evaluate: () => {
            const pullPosition = this.visual.pull?.position
            const pullDirection = this.visual.pull?.direction
            if (!pullPosition && !pullDirection) return 0
            const state = this.adapter.metrics.targetState
            const bounds = state.visualBounds
            const center = state.visualCenter
            const outerCenter = state.outerState.visualCenter
            let dist = 0
            let directionDist = 0
            if (pullPosition) {
                const closest = this._pullClosestPoint.set(
                    typeof pullPosition.x === 'number' ? pullPosition.x : center.x,
                    typeof pullPosition.y === 'number' ? pullPosition.y : center.y,
                    typeof pullPosition.z === 'number' ? pullPosition.z : center.z
                ).add(outerCenter).clamp(bounds.min, bounds.max)
                const xDiff = typeof pullPosition.x === 'number' ? pullPosition.x + outerCenter.x - closest.x : 0
                const yDiff = typeof pullPosition.y === 'number' ? pullPosition.y + outerCenter.y  - closest.y : 0
                const zDiff = typeof pullPosition.z === 'number' ? pullPosition.z + outerCenter.z  - closest.z : 0
                dist = xDiff**2 + yDiff**2 + zDiff**2
            }
            if (pullDirection) {
                const direction = this._pullDirection.set(pullDirection.x || 0, pullDirection.y || 0, pullDirection.z || 0).normalize()
                const ray = this._pullRay   
                ray.origin.copy(outerCenter)
                ray.direction.copy(direction)
                const closestPoint = direction.multiplyScalar(10e8).clamp(bounds.min, bounds.max)
                directionDist = ray.distanceToPoint(closestPoint)
            }
            return - dist + directionDist
        }
    })

    /** */
    public maximizeVisual = true
    /** */
    public maximizeVisualObjective = this.addObjective({
        name: 'maximize-visual', 
        evaluate: () => {
            if (!this.maximizeVisual) return 0
            const visualSize = this.adapter.metrics.targetState.visualSize
            return visualSize.x * visualSize.y
        }
    })

    /**
     * Occluders to minimize visual overlap with
     */
    occluders?: Node3D[]


    /**
     * Add a new layout constraint
     */
   addConstraint( opts: {name:string, evaluate: ScoreFunction, threshold:number, relativeTolerance?:number} ) : LayoutConstraint {
        const {name, evaluate, threshold, relativeTolerance} = opts || {}
        const c = {name, sortBlame:0, evaluate, threshold, relativeTolerance, bestScore:0}
        this.constraints.push(c)
        return c
    }

    /**
     * Add a new layout objective
     */
   addObjective( opts: {name:string, evaluate: ScoreFunction, relativeTolerance?:number} ) : LayoutObjective {
    const {name, evaluate, relativeTolerance} = opts || {}
    const o = {name, sortBlame:0, evaluate, relativeTolerance, bestScore:0}
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

    bestSolution! : LayoutSolution
    /**
     * Update best scores and sort solutions
     */
    sortSolutions() {
        let best = 0
        for (let c = 0; c < this.constraints.length; c++) {
            best = Infinity
            for (let s = 0; s < this.solutions.length; s++) {
                const score = this.solutions[s].constraintScores[c]
                if (score < best) best = score
            }
            this.constraints[c].bestScore = best
        }
        for (let o = 0; o < this.objectives.length; o++) {
            best = -Infinity
            for (let s = 0; s < this.solutions.length; s++) {
                const score = this.solutions[s].objectiveScores[o]
                if (score > best) best = score
            }
            this.objectives[o].bestScore = best
        }
        this.solutions.sort(this.compareSolutions)
        this.bestSolution = this.solutions[0]
    }

    /**
     * Each objective function should return a scalar value 
     * that increases in correlation with improved fitness. 
     * The fitness value does not need to be normalized, as objectives 
     * are not weighted directly aginst one another. Rather, 
     * solutions are ranked by preferring the solution that 
     * has the highest score within the `relativeTolerance`
     * of each objective, in order of objective priority. 
     * If at any point the relative difference between 
     * scores is larger than the relative tolerance for 
     * a given objective, the two solutions will be ranked 
     * by that objective. 
     * 
     * If any two solutions are within relative tolerance 
     * of one another for all objectives, those two will be
     * compared to ane another by the lowest priority objective
     * 
     * If either solution breaks constraints, then
     * the one with the lowest penalty is ranked higher
     */
    compareSolutions = (a:LayoutSolution, b:LayoutSolution) => {

        const aMin = a.bounds.min
        const aMax = a.bounds.max
        if (isNaN(aMin.x)||isNaN(aMin.y)||isNaN(aMin.z)||isNaN(aMax.x)||isNaN(aMax.y)||isNaN(aMax.z))
            return 1

        const constraints = this.constraints
        if (a.constraintScores.length < constraints.length) return 1

        const systemConfig = this.adapter.system.config.optimize
        // const cThreshold = this.adapter.optimize.constraintThreshold ?? systemConfig.constraintThreshold
        const relTol = this.adapter.optimize.relativeTolerance ?? systemConfig.relativeTolerance
        // const absTol = this.adapter.optimize.absoluteTolerance ?? systemConfig.absoluteTolerance
        
        for (let i = 0; i < constraints.length; i++) {
            const scoreA = a.constraintScores[i] 
            const scoreB = b.constraintScores[i] 
            // if (scoreA > cThreshold && scoreB > cThreshold) {
            //     const relativeDiff = computeRelativeDifference(scoreA, scoreB)
            //     const relativeTolerance = constraint.relativeTolerance || cRelativeTolerance
            //     if (relativeDiff > relativeTolerance) {
            //         return scoreA - scoreB // rank by lowest penalty
            //     }
            // } else if (scoreA > cThreshold || scoreB > cThreshold) {
            //     return scoreA - scoreB
            // }
            const constraint = constraints[i]
            if (scoreA > constraint.threshold || scoreB > constraint.threshold) {
                constraint.sortBlame++
                return scoreA - scoreB // rank by lowest penalty
            }
            const bestScore = constraint.bestScore!
            const cRelTol = constraint.relativeTolerance ?? relTol
            const tolerance = bestScore + (0.1 + Math.abs(bestScore)) * cRelTol
            if (scoreA > tolerance || scoreB > tolerance) {
                return scoreA - scoreB
            }
        }
        
        const objectives = this.objectives
        for (let i = 0; i < objectives.length; i++) {
            const scoreA = a.objectiveScores[i] 
            const scoreB = b.objectiveScores[i] 
            // const relativeDiff = computeRelativeDifference(scoreA, scoreB)
            // const relativeTolerance = objective.relativeTolerance || oRelativeTolerance
            // if (relativeDiff > relativeTolerance) {
            //     return scoreB - scoreA // rank by highest score
            // }
            // if (Math.abs(scoreA - scoreB) < 1e-4 || computeRelativeDifference(scoreA, scoreB) < 1e-4) 
            //     continue // consider equal
            const objective = objectives[i]
            const oRelTol = objective.relativeTolerance ?? relTol
            const bestScore = objective.bestScore!
            const tolerance = bestScore - (1 + Math.abs(bestScore)) * oRelTol
            // const tolerance = Math.min(
            //     bestScore - relativeTolerance, 
            //     bestScore - oAbsTol
            // )
            // const scoreDiff = Math.abs(scoreA - scoreB)
            // if (scoreDiff < relativeTolerance * 0.1) continue // consider equal
            // if (Math.abs(scoreA - scoreB) < oAbsTol || computeRelativeDifference(scoreA, scoreB) < oRelTol) 
            //     continue
            if (scoreA < tolerance || scoreB < tolerance) {
                objective.sortBlame++
                return scoreB - scoreA // rank by highest score
            }
        }

        // If all scores are within relative tolerance of one another, consider them equal
        return 0
    }
}

export interface LayoutObjective {
    name?:string,
    evaluate: ScoreFunction,
    relativeTolerance?: number,
    absoluteTolerance?: number,
    bestScore?: number,
    sortBlame:number
}

export interface LayoutConstraint extends LayoutObjective {
    threshold: number
}

export interface MutationStrategy {type:string, stepSize: number, successRate:number}

export class LayoutSolution {

    constructor(layout?:SpatialLayout) { 
        if (layout) this.layout = layout
    }

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
        return this.constraintScores[this.layout.constraints.indexOf(this.layout.localConstraint)]||0
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

    /**
     * All constraints scores are within threshold
     */
    get isValid() {
        for (let i=0; i < this.layout.constraints.length; i++) {
            const c = this.layout.constraints[i]
            const score = this.constraintScores[i]
            if (score > c.threshold) return false
        }
        return true
    }
    

    mutationStrategies = [
        {type:'rotate', stepSize: 0.1, successRate:0.2},
        {type:'centerX', stepSize: 0.1, successRate:0.2},
        {type:'centerY', stepSize: 0.1, successRate:0.2},
        {type:'centerZ', stepSize: 0.1, successRate:0.2},
        {type:'sizeXYZ', stepSize: 0.1, successRate:0.2},
        {type:'sizeX', stepSize: 0.1, successRate:0.2},
        {type:'sizeY', stepSize: 0.1, successRate:0.2},
        {type:'sizeZ', stepSize: 0.1, successRate:0.2},
        // {type:'minX', stepSize: 0.1, successRate:0.2},
        // {type:'minY', stepSize: 0.1, successRate:0.2},
        // {type:'minZ', stepSize: 0.1, successRate:0.2},
        // {type:'maxX', stepSize: 0.1, successRate:0.2},
        // {type:'maxY', stepSize: 0.1, successRate:0.2},
        // {type:'maxZ', stepSize: 0.1, successRate:0.2},
        {type:'minXAspect', stepSize: 0.1, successRate:0.2},
        {type:'minYAspect', stepSize: 0.1, successRate:0.2},
        {type:'minZAspect', stepSize: 0.1, successRate:0.2},
        {type:'maxXAspect', stepSize: 0.1, successRate:0.2},
        {type:'maxYAspect', stepSize: 0.1, successRate:0.2},
        {type:'maxZAspect', stepSize: 0.1, successRate:0.2},
        // {type:'corner000', stepSize: 0.1, successRate:0.2},
        // {type:'corner001', stepSize: 0.1, successRate:0.2},
        // {type:'corner010', stepSize: 0.1, successRate:0.2},
        // {type:'corner011', stepSize: 0.1, successRate:0.2},
        // {type:'corner100', stepSize: 0.1, successRate:0.2},
        // {type:'corner101', stepSize: 0.1, successRate:0.2},
        // {type:'corner110', stepSize: 0.1, successRate:0.2},
        // {type:'corner111', stepSize: 0.1, successRate:0.2},
    ]

    private _selectStrategy() {
        const strategies = this.mutationStrategies
        const weights = this._mutationWeights

        for (let i=0; i< strategies.length; i++) {
            weights[i] = strategies[i].successRate
        }
        
        if (this.aspectPenalty > this.layout.aspectConstraint.threshold) {
            for (let i=0; i< weights.length; i++) {
                weights[i] *= strategies[i].type.includes('size') ? 100 : 1
            }
        }

        if (this.orientationPenalty > this.layout.orientationConstraint.threshold) {
            weights[0] *= 1000
        }

        return randomSelect(strategies, weights)
    }
    private _mutationWeights = [] as number[]

    copy(solution:LayoutSolution) {
        this.layout = solution.layout
        this.orientation.copy( solution.orientation )
        this.bounds.copy( solution.bounds )
        this.constraintScores.length = 0
        for (let i = 0; i < solution.constraintScores.length; i++) {
            this.constraintScores[i] = solution.constraintScores[i]
        }
        this.objectiveScores.length = 0
        for (let i = 0; i < solution.objectiveScores.length; i++) {
            this.objectiveScores[i] = solution.objectiveScores[i]
        }
        return this
    }

    private static _scratchV1 = new Vector3 
    private static _scratchV2 = new Vector3

    randomize(sizeHint:number) {
        // this.orientation.copy(randomQuaternion())
        const far = levy(sizeHint)
        // const center = LayoutSolution._scratchV1.set(
        //     ((Math.random() - 0.5) * gaussian(sizeHint * 0.1)) * far,
        //     ((Math.random() - 0.5) * gaussian(sizeHint * 0.1)) * far,
        //     - far
        // )
        const center = LayoutSolution._scratchV1.set(
            0,
            0,
            - far
        )

        const viewState = this.layout.adapter.system.viewMetrics.targetState

        

        center.applyMatrix4(viewState.worldMatrix)
        const parentState = this.layout.adapter.metrics.targetState.parentState
        parentState && center.applyMatrix4(parentState.worldMatrixInverse)

        this.orientation.copy(viewState.worldOrientation)
        parentState && this.orientation.multiply(parentState.worldOrientationInverse)

        // const halfSize = LayoutSolution._scratchV2.set(
        //     Math.random() * sizeHint * 2 + sizeHint * 0.1,
        //     Math.random() * sizeHint * 2 + sizeHint * 0.1,
        //     Math.random() * sizeHint * 2 + sizeHint * 0.1
        // )
        const inner = this.layout.adapter.metrics.innerBounds
        const size = inner.isEmpty() ? 
            LayoutSolution._scratchV2.set(1,1,1) : 
            inner.getSize(LayoutSolution._scratchV2)
        size.normalize()
        size.multiplyScalar(far * 2 * Math.tan(5 * MathUtils.DEG2RAD))
        // size.multiplyScalar(Math.random() * sizeHint * 2)
        this.bounds.setFromCenterAndSize(center, size)
        // this.bounds.min.copy(center).sub(halfSize)
        // this.bounds.max.copy(center).add(halfSize)
        // this.bounds = this.bounds
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
            const scale = Math.min(levy(stepSize*0.0001), 1)
            this.orientation.multiply(randomQuaternion(scale, scale)).normalize()
            return strategy
        }

        const bounds = this.bounds
        const center = bounds.getCenter(LayoutSolution._center)
        const size = bounds.getSize(LayoutSolution._size)

        // center mutation strategies
        if (strategyType === 'centerX')  {
            center.x = this._perturbFromLinearMeasureSpec(center.x, stepSize, this.layout.local.centerX, 'centerX')
        } else if (strategyType === 'centerY')  {
            center.y = this._perturbFromLinearMeasureSpec(center.y, stepSize, this.layout.local.centerY, 'centerY')
        } else if (strategyType === 'centerZ')  {
            center.z = this._perturbFromLinearMeasureSpec(center.z, stepSize, this.layout.local.centerZ, 'centerZ')
        }

        // size mutation strategies
        else if (strategyType === 'sizeXYZ') {
            const scale = 4 ** gaussian(stepSize)
            if (this.layout.aspect === 'preserve-2d') {
                size.x *= scale
                size.y *= scale
            } else {
                size.multiplyScalar(scale)
            }
        } else if (strategyType === 'sizeX') {
            size.x = this._perturbFromLinearMeasureSpec(size.x, stepSize, this.layout.local.width, 'width')
        } else if (strategyType === 'sizeY') {
            size.y = this._perturbFromLinearMeasureSpec(size.y, stepSize, this.layout.local.height, 'height')
        } else if (strategyType === 'sizeZ') {
            size.z = this._perturbFromLinearMeasureSpec(size.z, stepSize, this.layout.local.depth, 'depth')
        }

        size.x = Math.abs(size.x)
        size.y = Math.abs(size.y)
        size.z = Math.abs(size.z)
        size.clampScalar(this.layout.adapter.system.config.epsillonMeters/10,1e20)
        bounds.setFromCenterAndSize(center, size)

        if (strategyType === 'minX')  {
            bounds.min.x = this._perturbFromLinearMeasureSpec(bounds.min.x, stepSize, this.layout.local.left, 'left')
        } else if (strategyType === 'minY')  {
            bounds.min.y = this._perturbFromLinearMeasureSpec(bounds.min.y, stepSize, this.layout.local.bottom, 'bottom')
        } else if (strategyType === 'minZ')  {
            bounds.min.z = this._perturbFromLinearMeasureSpec(bounds.min.z, stepSize, this.layout.local.back, 'back')
        } else if (strategyType === 'maxX')  {
            bounds.max.x = this._perturbFromLinearMeasureSpec(bounds.max.x, stepSize, this.layout.local.right, 'right')
        } else if (strategyType === 'maxY')  {
            bounds.max.y = this._perturbFromLinearMeasureSpec(bounds.max.y, stepSize, this.layout.local.top, 'top')
        } else if (strategyType === 'maxZ')  {
            bounds.max.z = this._perturbFromLinearMeasureSpec(bounds.max.z, stepSize, this.layout.local.front, 'front')
        } else if (strategyType === 'minXAspect')  {
            const opposite = bounds.max.x
            const scale = 4 ** gaussian(stepSize)
            size.multiplyScalar(scale)
            bounds.setFromCenterAndSize(center, size)
            bounds.max.x = opposite
            bounds.min.x = opposite - size.x
        } else if (strategyType === 'minYAspect')  {
            const opposite = bounds.max.y
            const scale = 4 ** gaussian(stepSize)
            size.multiplyScalar(scale)
            bounds.setFromCenterAndSize(center, size)
            bounds.max.y = opposite
            bounds.min.y = opposite - size.y
        } else if (strategyType === 'minZAspect')  {
            const opposite = bounds.max.z
            const scale = 4 ** gaussian(stepSize)
            size.multiplyScalar(scale)
            bounds.setFromCenterAndSize(center, size)
            bounds.max.z = opposite
            bounds.min.z = opposite - size.z
        } else if (strategyType === 'maxXAspect')  {
            const opposite = bounds.min.x
            const scale = 4 ** gaussian(stepSize)
            size.multiplyScalar(scale)
            bounds.setFromCenterAndSize(center, size)
            bounds.min.x = opposite
            bounds.max.x = opposite + size.x
        } else if (strategyType === 'maxYAspect')  {
            const opposite = bounds.min.y
            const scale = 4 ** gaussian(stepSize)
            size.multiplyScalar(scale)
            bounds.setFromCenterAndSize(center, size)
            bounds.min.y = opposite
            bounds.max.y = opposite + size.y
        } else if (strategyType === 'maxZAspect')  {
            const opposite = bounds.min.z
            const scale = 4 ** gaussian(stepSize)
            size.multiplyScalar(scale)
            bounds.setFromCenterAndSize(center, size)
            bounds.min.z = opposite
            bounds.max.z = opposite + size.z
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

    private _perturbFromLinearMeasureSpec(value:number, stepSize:number, spec:LinearMeasureSpec|undefined, sType:LayoutMeasureSubType) {
        if (spec === undefined) return value + gaussian(stepSize)
        if (spec instanceof Array) spec = randomSelect(spec)
        if (SpatialLayout.isDiscreteSpec(spec)) {
            return this.layout.measureLayout(spec, 'local', sType)
        } 
        const continuousSpec = spec as ContinuousSpec<LinearMeasureSpec>
        const min = 'gt' in continuousSpec ? this.layout.measureLayout(continuousSpec.gt, 'local', sType) : undefined
        const max = 'lt' in continuousSpec ? this.layout.measureLayout(continuousSpec.lt, 'local', sType) : undefined
        if (min !== undefined && max !== undefined && (value < min || value > max)) {
            return min + Math.random() * (max - min)
        } else if (min !== undefined && value < min) {
            return min + levy(stepSize)
        } else if (max !== undefined && value > max) {
            return max - levy(stepSize)
        }
        return gaussian(stepSize)
    }

    static generatePulseFrequency(min:number,max:number) {
        return min + Math.random() * (max - min)
    }

    private static _mutateCorner(bounds:Box3, sideX:'min'|'max', sideY:'min'|'max', sideZ:'min'|'max', stepSize:number) {
        const center = bounds.getCenter(this._center)
        const diff = LayoutSolution._scratchV1.set(bounds[sideX].x, bounds[sideY].y, bounds[sideZ].z).sub(center)
        const length = diff.length() * 4 ** gaussian(stepSize)
        diff.normalize().multiplyScalar(length)
        bounds[sideX].x = diff.x + center.x
        bounds[sideY].y = diff.y + center.y
        bounds[sideZ].z = diff.z + center.z
    }
}