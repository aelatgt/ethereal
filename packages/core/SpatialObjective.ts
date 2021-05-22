import { MathUtils, Vector3, Quaternion, Box3, Euler } from './math-utils'
import { SpatialLayout } from './SpatialLayout'

export type OneOrMany<T> = T|T[]

export type DiscreteOrContinuous<T> = T|{gt:T,lt:T}|{gt:T}|{lt:T}

export type ConstraintSpec<T=string> = DiscreteOrContinuous<T>

export type NumberConstraintSpec = ConstraintSpec<string|number>

export type AtLeastOneProperty<T, U = {[K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U]

export type Vector3Spec = AtLeastOneProperty<{
    x:NumberConstraintSpec, y:NumberConstraintSpec, z:NumberConstraintSpec,
    magnitude:NumberConstraintSpec
}>

export type QuaternionSpec = 
    OneOrMany<
        { x:number, y:number, z:number, w:number } |
        AtLeastOneProperty<{ swingRange:{x:string, y:string}, twistRange:string }>
    >

export interface ObjectiveOptions {
    relativeTolerance?:number|(() => number), 
    absoluteTolerance?:number|(() => number)
}

export type BoundsMeasureType = 'spatial'|'visual'|'view'
export type BoundsMeasureSubType = 
    'left'|'bottom'|'top'|'right'|'front'|'back'|
    'sizex'|'sizey'|'sizez'|'sizediagonal'|
    'centerx'|'centery'|'centerz'|'centerdistance'
 
export type DiscreteSpec<T> = Exclude<T,any[]|undefined|Partial<{gt:any,lt:any}>>
export type ContinuousSpec<T> = T extends any[] | undefined ? never : 
    T extends {gt:any,lt:any} ? T : never

export abstract class SpatialObjective {

    static isDiscreteSpec<T>(s:T) : s is DiscreteSpec<T> {
        const type = typeof s
        return type === 'string' || type === 'number'
    }

    static isContinuousSpec<T>(s:T) : s is ContinuousSpec<T> {
        return s !== undefined && s instanceof Array === false && typeof s === 'object' && ('gt' in s || 'lt' in s) === true
    }

    type : keyof typeof SpatialLayout.prototype.absoluteTolerance = 'ratio'
    sortBlame = 0

    // bestScore = -1000

    get bestScore() {
        return this.layout.solutions[0].scores[this.index]
    }

    relativeTolerance ?: number = undefined
    absoluteTolerance ?: number|string = undefined

    priority = 0
    index = -1

    get computedRelativeTolerance () {
        return this.relativeTolerance ??
        this.layout.relativeTolerance ??
        this.layout.adapter.system.optimize.relativeTolerance
    }

    get computedAbsoluteTolerance () {
        const sys = this.layout.adapter.system
        return this.absoluteTolerance !== undefined ? 
            sys.measureNumber(this.absoluteTolerance, sys.mathScope[this.type]) :
            this.layout.getComputedAbsoluteTolerance(this.type)
    }

    layout:SpatialLayout

    constructor(layout:SpatialLayout) {
        this.layout = layout
    }

    abstract evaluate() : number;

    protected reduceFromOneOrManySpec = <V,S>(value:V, spec:OneOrMany<S>|undefined, applyFn:(value:V, spec:S)=>number) => {
        if (spec === undefined) return 0
        // score for compound spec is best score in the list
        if (spec instanceof Array) {
            let score = -Infinity
            for (const s of spec) {
                score = Math.max(applyFn(value, s), score)
            }
            return score
        }
        return applyFn(value, spec)
    }

    protected getNumberScore(value:number, spec:OneOrMany<NumberConstraintSpec>) {
        return this.reduceFromOneOrManySpec(value, spec, this._getNumberScoreSingle)
    }

    private _getNumberScoreSingle = (value:number, spec:NumberConstraintSpec) => {
        let diff = 0
        if (typeof spec !== 'object') {
            const target = this.layout.adapter.system.measureNumber(spec)
            diff = -Math.abs(value - target)
        } else {
            const min = 'gt' in spec ? this.layout.adapter.system.measureNumber(spec.gt): undefined
            const max = 'lt' in spec ? this.layout.adapter.system.measureNumber(spec.lt): undefined
            if (min !== undefined && value < min) {
                diff = value - min
            }
            else if (max !== undefined && value > max) {
                diff = max - value
            }
        }
        return diff
    }

    protected getVector3Score(value:Vector3, spec:OneOrMany<Vector3Spec>|undefined) {        
        return this.reduceFromOneOrManySpec(value, spec, this._getVector3ScoreSingle)
    }

    private _getVector3ScoreSingle = (value:Vector3, spec:Vector3Spec) => {
        // penalty for discrete spec is distance from the valid value
        const xScore = ('x' in spec && typeof spec.x !== 'undefined') ? this.getNumberScore(value.x, spec.x) : 0
        const yScore = ('y' in spec && typeof spec.y !== 'undefined') ? this.getNumberScore(value.y, spec.y) : 0
        const zScore = ('z' in spec && typeof spec.z !== 'undefined') ? this.getNumberScore(value.z, spec.z) : 0
        const magnitudeScore = ('magnitude' in spec && typeof spec.magnitude !== 'undefined') ? this.getNumberScore(value.length(), spec.magnitude) : 0
        return xScore + yScore + zScore + magnitudeScore
    }

    protected getQuaternionScore(value:Quaternion, spec:OneOrMany<QuaternionSpec>|undefined) {
        return this.reduceFromOneOrManySpec(value, spec, this._getQuaternionScoreSingle)
    }

    private _quat = new Quaternion
    private _euler = new Euler

    private _getQuaternionScoreSingle = (value:Quaternion, spec:QuaternionSpec|undefined) => {
        if (spec === undefined) return 0
        // absolute score = - angle from target  
        // relative score = (- angle from target / max magnitude) 
        if ('x' in spec) {
            const s = this._quat.copy(spec as any)
            return - s.angleTo(value) * MathUtils.RAD2DEG
        } else if ('swingRange' in spec) {
            const euler = this._euler.setFromQuaternion(value)
            const swingX = euler.x * MathUtils.RAD2DEG
            const swingY = euler.y * MathUtils.RAD2DEG
            const twistZ = euler.z * MathUtils.RAD2DEG
            const system = this.layout.adapter.system
            const deg = system.mathScope.degree
            let swingRangeX = spec.swingRange?.x ? system.measureNumber(spec.swingRange.x, deg) : 0
            let swingRangeY = spec.swingRange?.y ? system.measureNumber(spec.swingRange.y, deg) : 0
            swingRangeX = Math.max(swingRangeX, 0.01)
            swingRangeY = Math.max(swingRangeY, 0.01)
            const twistRange = spec.twistRange ? system.measureNumber(spec.twistRange, deg) : 0
            // const swingRange = Math.acos( 
            //     Math.cos( swingRangeX * MathUtils.DEG2RAD ) * 
            //     Math.cos( swingRangeY * MathUtils.DEG2RAD )
            // ) * MathUtils.RAD2DEG
            const swingScore = (1 - (swingX / swingRangeX) ** 2 - (swingY / swingRangeY) ** 2)
            const twistScore = twistRange - Math.abs(twistZ)
            return (swingScore > 0 ? 0 : swingScore) + (twistScore > 0 ? 0 : twistScore)
        }

        return 0
    }

    protected getBoundsScore(spec:SpatialBoundsSpec|undefined, boundsType:BoundsMeasureType) {
        if (spec === undefined) return 0
        let score = 0
        for (const key in spec) {
            if (key === 'absolute') {
                continue
            } 
            let k = key as keyof SpatialBoundsSpec
            if (k === 'size' || k === 'center') {
                const subSpec = spec[k]
                for (const subKey of VECTOR3_SPEC_KEYS) {
                    let sk = subKey as keyof NonNullable<typeof spec[typeof k]>
                    if (boundsType !== 'spatial') {
                        if (this.type === 'meter' && sk !== 'z') continue
                        if (this.type === 'pixel' && sk === 'z') continue
                    }
                    score += this.getBoundsMeasureScore(subSpec?.[sk], boundsType, k+sk as any)
                }
            } else {
                if (boundsType !== 'spatial') {
                    if (this.type === 'meter' && k !== 'back' && k !== 'front')
                        continue
                    if (this.type === 'pixel' && (k === 'back' || k === 'front'))
                        continue
                }
                score += this.getBoundsMeasureScore(spec[k], boundsType, k)
            }
        }
        return score
    }

    protected getBoundsMeasureScore(spec:OneOrMany<NumberConstraintSpec>|undefined, type:BoundsMeasureType, subType:BoundsMeasureSubType) {
        if (spec === undefined) return 0
        const state = this.layout.adapter.metrics.target
        let bounds : Box3
        let center : Vector3
        let size : Vector3
        switch (type) {
            case 'spatial': 
                bounds = state.spatialBounds
                center = state.spatialCenter
                size = state.spatialSize
                break
            case 'visual': 
            case 'view':
                bounds = state.visualBounds
                center = state.visualCenter
                size = state.visualSize
                break
            default: 
                throw new Error(`Unknown measure type "${type}.${subType}" in spec:\n "${spec}"`)
        }
        let value = 0
        switch (subType) {
            case 'left':    value = bounds.min.x; break
            case 'right':   value = bounds.max.x; break
            case 'bottom':  value = bounds.min.y; break
            case 'top':     value = bounds.max.y; break
            case 'back':    value = bounds.min.z; break
            case 'front':   value = bounds.max.z; break
            case 'centerx': value = center.x; break
            case 'centery': value = center.y; break
            case 'centerz': value = center.z; break
            case 'centerdistance': value = type === 'spatial' ? 
                center.length() : Math.sqrt(center.x**2 + size.y**2); break
            case 'sizex':   value = size.x; break
            case 'sizey':  value = size.y; break
            case 'sizez':   value = size.z; break
            case 'sizediagonal': value = type === 'spatial' ? 
                size.length() : Math.sqrt(size.x**2 + size.y**2); break
            default: 
                throw new Error(`Unknown measure subtype ${type}.${subType} in spec "${spec}"`)
        }

        // score for compound spec is best score in the list
        if (spec instanceof Array) {
            let score = -Infinity
            for (const s of spec) {
                score = Math.max(this._getBoundsMeasureScoreSingle(value, s, type, subType), score)
            }
            return score
        }
        return this._getBoundsMeasureScoreSingle(value, spec, type, subType)
    }

    private _getBoundsMeasureScoreSingle = (value:number, spec:NumberConstraintSpec|undefined, type:BoundsMeasureType, subType:BoundsMeasureSubType) => {
        if (spec === undefined) return 0
        // penalty for single spec is distance from any valid value
        if (typeof spec === 'object') {
            if ('gt' in spec) {
                const min = this.layout.adapter.measureBounds(spec.gt, type, subType)
                if (value < min) return value - min
            }
            if ('lt' in spec) {
                const max = this.layout.adapter.measureBounds(spec.lt, type, subType)
                if (value > max) return max - value
            }  
            return 0
        }
        return - Math.abs(value - this.layout.adapter.measureBounds(spec, type, subType))
    }

    /**  Attenuate visual score when out of view */
    protected attenuateVisualScore(score:number) : number {
        let penalty = 0
        const acc = this.layout.getComputedAbsoluteTolerance('pixel')
        const adapter = this.layout.adapter
        const viewResolution = adapter.system.viewResolution
        const viewFrustum = adapter.system.viewFrustum
        const vw = viewResolution.x
        const vh = viewResolution.y
        const viewSize = viewResolution.length()
        const visualBounds = adapter.metrics.target.visualBounds
        const leftOffset = visualBounds.min.x - -vw/2 + acc
        const rightOffset = visualBounds.max.x - vw/2 - acc
        const bottomOffset = visualBounds.min.y - -vh/2 + acc
        const topOffset = visualBounds.max.y - vh/2 - acc
        const nearOffset = visualBounds.max.z + viewFrustum.nearMeters
        if (leftOffset < 0) penalty += Math.abs(leftOffset / vw)
        if (rightOffset > 0) penalty += Math.abs(rightOffset / vw) 
        if (bottomOffset < 0) penalty += Math.abs(bottomOffset / vh)
        if (topOffset > 0) penalty += Math.abs(topOffset / vh)
        if (nearOffset > 0) penalty += nearOffset * 10
        return score - Math.abs(viewSize)*penalty
    }
}

// export class RelativePositionConstraint extends SpatialObjective {
//     spec?:Vector3Spec

//     constructor(layout:SpatialLayout) {
//         super(layout)
//         this.type = 'meter'
//     }

//     evaluate() {
//         const state = this.layout.adapter.metrics.target
//         return this.getVector3Score(state.spatialCenter, this.spec)
//     }
// }

export class RelativeOrientationConstraint extends SpatialObjective {
    spec?:QuaternionSpec

    constructor(layout:SpatialLayout) {
        super(layout)
        this.type = 'degree'
    }

    evaluate() {
        const state = this.layout.adapter.metrics.target
        return this.getQuaternionScore(state.localOrientation, this.spec)
    }
}


export class WorldScaleConstraint extends SpatialObjective {
    spec?:Vector3Spec

    constructor(layout:SpatialLayout) {
        super(layout)
        this.type = 'ratio'
    }

    evaluate() {
        const state = this.layout.adapter.metrics.target
        return this.getVector3Score(state.worldScale, this.spec)
    }
}

export class AspectConstraint extends SpatialObjective {
    mode = 'xyz' as 'xyz'|'xy'

    private _scale = new Vector3

    constructor(layout:SpatialLayout) {
        super(layout)
        this.type = 'ratio'
    }

    evaluate() {
        const state = this.layout.adapter.metrics.target
        const mode = this.mode
        if (!mode) return 0
        // const worldScale = state.worldScale
        const s = this._scale.copy(state.worldScale)
        const largest = mode === 'xyz' ? 
            Math.max(Math.abs(s.x), Math.abs(s.y), Math.abs(s.z)) : 
            Math.max(Math.abs(s.x), Math.abs(s.y))
        const aspectFill = s.divideScalar(largest)
        // return  -(1/aspectFill.x) + 1 +
        //         -(1/aspectFill.y) + 1 +
        //         (mode === 'xyz' ? 
        //             -(1/aspectFill.z) + 1:
        //             // prevent z from being scaled largest when doing preserved 2D aspect
        //             aspectFill.z > 1 ? 1-aspectFill.z : 0)
        return  (aspectFill.x - 1) +
                (aspectFill.y - 1) +
                (mode === 'xyz' ? 
                    aspectFill.z - 1:
                    // prevent z from being scaled largest when doing preserved 2D aspect
                    aspectFill.z > 1 ? 1-aspectFill.z : 0)
    }
}

export interface SpatialBoundsSpec {
    /** meters */ left? : OneOrMany<ConstraintSpec>   
    /** meters */ bottom? : OneOrMany<ConstraintSpec> 
    /** meters */ right? :  OneOrMany<ConstraintSpec>  
    /** meters */ top? :  OneOrMany<ConstraintSpec>    
    /** meters */ front? :  OneOrMany<ConstraintSpec>  
    /** meters */ back? :  OneOrMany<ConstraintSpec>
    size? : {
    /** meters */ x?: OneOrMany<NumberConstraintSpec>,
    /** meters */ y?: OneOrMany<NumberConstraintSpec>, 
    /** meters */ z?: OneOrMany<NumberConstraintSpec>, 
    /** meters */ diagonal?: OneOrMany<ConstraintSpec>
    },
    center? : {
    /** meters */ x?: OneOrMany<NumberConstraintSpec>,
    /** meters */ y?: OneOrMany<NumberConstraintSpec>, 
    /** meters */ z?: OneOrMany<NumberConstraintSpec>,
    /** meters */ distance?: OneOrMany<ConstraintSpec>
    }
}

const VECTOR3_SPEC_KEYS = ['x','y','z','diagonal', 'distance']

export class SpatialBoundsConstraint extends SpatialObjective {
    spec?:SpatialBoundsSpec

    constructor(layout:SpatialLayout) {
        super(layout)
        this.type = 'meter'
    }

    evaluate() {
        return this.getBoundsScore(this.spec, 'spatial')
    }
}

export interface VisualBoundsSpec {
    absolute?: {
        /** pixels */ left? : OneOrMany<ConstraintSpec>   
        /** pixels */ bottom? : OneOrMany<ConstraintSpec> 
        /** pixels */ right? : OneOrMany<ConstraintSpec>  
        /** pixels */ top? : OneOrMany<ConstraintSpec>    
        /** meters */ front? : OneOrMany<ConstraintSpec>   
        /** meters */ back? : OneOrMany<ConstraintSpec>,
        center? : {
            /** pixels */ x?:OneOrMany<ConstraintSpec>,
            /** pixels */ y?:OneOrMany<ConstraintSpec>, 
            /** meters */ z?:OneOrMany<ConstraintSpec>,
        }
    },
    /** pixels */ left? : OneOrMany<ConstraintSpec>   
    /** pixels */ bottom? : OneOrMany<ConstraintSpec> 
    /** pixels */ right? : OneOrMany<ConstraintSpec>  
    /** pixels */ top? : OneOrMany<ConstraintSpec>    
    /** meters */ front? : OneOrMany<ConstraintSpec>   
    /** meters */ back? : OneOrMany<ConstraintSpec>,
    center? : {
        /** pixels */ x?:OneOrMany<NumberConstraintSpec>,
        /** pixels */ y?:OneOrMany<NumberConstraintSpec>, 
        /** meters */ z?:OneOrMany<ConstraintSpec>,
        /** pixels */ distance?: OneOrMany<ConstraintSpec>,
    }
    size? : {
    /** pixels */ x?:OneOrMany<ConstraintSpec>,
    /** pixels */ y?:OneOrMany<ConstraintSpec>, 
    /** meters */ z?:OneOrMany<ConstraintSpec>, 
    /** pixels */ diagonal?:OneOrMany<ConstraintSpec>
    }
}

export class VisualBoundsConstraint extends SpatialObjective {
    spec?:VisualBoundsSpec

    constructor(layout:SpatialLayout) {
        super(layout)
        this.type = "pixel"
    }

    evaluate() {
        return this.attenuateVisualScore(
            this.getBoundsScore(this.spec, 'visual') + 
            this.getBoundsScore(this.spec?.absolute, 'view')
        )
    }
}


export class VisualMaximizeObjective extends SpatialObjective {

    constructor(layout:SpatialLayout) {
        super(layout)
        this.type = "pixel"
    }

    minAreaPercent = 0.2

    evaluate() {
        const target = this.layout.adapter.metrics.target
        const visualSize = target.visualSize
        const viewSize = this.layout.adapter.system.viewResolution
        const visualArea = Math.min(visualSize.x * visualSize.y, viewSize.x * viewSize.y)
        const refVisualSize = target.referenceState?.visualSize || viewSize
        const refVisualArea = refVisualSize.x * refVisualSize.y
        const score = this.attenuateVisualScore(visualArea) - refVisualArea * this.minAreaPercent
        if (score === 0) console.log(score)
        return score
    }
}


export class MagnetizeObjective extends SpatialObjective {

    constructor(layout:SpatialLayout) {
        super(layout)
        this.type = "meter"
        this.absoluteTolerance = 1e10
    }

    evaluate() {
        const center = this.layout.adapter.metrics.target.visualCenter
        return -center.length()
    }
}


export class MaximizeTemporalCoherenceObjective extends SpatialObjective {

    constructor(layout:SpatialLayout) {
        super(layout)
        this.type = "meter"
        this.relativeTolerance = 0
    }

    evaluate() {
        if (!this.layout.bestSolution?.isFeasible) return 10000000
        const metrics = this.layout.adapter.metrics
        const previousCenter = metrics.previousTarget.spatialCenter
        const targetCenter = metrics.target.spatialCenter
        const previousOrientation = metrics.previousTarget.localOrientation
        const targetOrientation = metrics.target.localOrientation
        const previousScale = metrics.previousTarget.localScale.lengthSq()
        const targetScale = metrics.target.localScale.lengthSq()
        const dist = previousCenter.distanceTo(targetCenter) * 100
        const orientationDiff = previousOrientation.angleTo(targetOrientation) / Math.PI
        const scaleDiff = Math.abs(previousScale-targetScale) * 0.1
        return Math.min(1 / (dist + scaleDiff + orientationDiff), 10000000)
    }
}


export class MinimizeOcclusionObjective extends SpatialObjective {

    constructor(layout:SpatialLayout) {
        super(layout)
        this.type = "meter"
    }

    evaluate() {
        const targetState = this.layout.adapter.metrics.target
        return 1 / (targetState.occludedPercent + targetState.occludingPercent)
    }
}




