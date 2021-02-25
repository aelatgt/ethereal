import { MathUtils, Vector3, Quaternion, Box3 } from './math-utils'
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
    { x:number, y:number, z:number, w:number } |
    { axis: OneOrMany<AtLeastOneProperty<{x:number, y:number, z:number}>>, degrees?:ConstraintSpec } |
    { twistSwing: AtLeastOneProperty<{horizontal:ConstraintSpec, vertical:ConstraintSpec, twist:ConstraintSpec}> } |
    { swingTwist: AtLeastOneProperty<{horizontal:ConstraintSpec, vertical:ConstraintSpec, twist:ConstraintSpec}> }

export interface ObjectiveOptions {
    relativeTolerance?:number, 
    absoluteTolerance?:number
}

export type BoundsMeasureType = 'spatial'|'visual'|'view'
export type BoundsMeasureSubType = 'left'|'bottom'|'top'|'right'|'front'|'back'|'sizex'|'sizey'|'sizez'|'sizediagonal'|'centerx'|'centery'|'centerz'


type ConstraintMode = 'absolute'|'relative'

export type DiscreteSpec<T> = Exclude<T,any[]|undefined|Partial<{gt:any,lt:any}>>
export type ContinuousSpec<T> = T extends any[] | undefined ? never : 
    T extends {gt:any,lt:any} ? T : never

export abstract class SpatialObjective {

    static isDiscreteSpec<T>(s:T) : s is DiscreteSpec<T> {
        return s !== undefined && s instanceof Array === false && ('gt' in s || 'lt' in s) === false
    }

    static isContinuousSpec<T>(s:T) : s is ContinuousSpec<T> {
        return s !== undefined && s instanceof Array === false && ('gt' in s || 'lt' in s) === true
    }


    relativeTolerance?:number;
    absoluteTolerance?:number;

    bestScore = -Infinity
    sortBlame = 0

    constructor(public layout:SpatialLayout) {}

    abstract evaluate() : number;

    protected reduceFromOneOrManySpec = <V,S>(value:V, spec:OneOrMany<S>|undefined, mode:ConstraintMode, accuracy:number, applyFn:(value:V, spec:S, mode:ConstraintMode, accuracy:number)=>number) => {
        if (spec === undefined) return 0
        // score for compound spec is best score in the list
        if (spec instanceof Array) {
            let score = -Infinity
            for (const s of spec) {
                score = Math.max(applyFn(value, s, mode, accuracy), score)
            }
            return score
        }
        return applyFn(value, spec, mode, accuracy)
    }

    protected getNumberScore(value:number, spec:OneOrMany<NumberConstraintSpec>, mode:ConstraintMode, accuracy:number) {
        return this.reduceFromOneOrManySpec(value, spec, mode, accuracy, this._getNumberScoreSingle)
    }

    private _getNumberScoreSingle = (value:number, spec:NumberConstraintSpec, mode:ConstraintMode, accuracy:number) => {
        // absolute score = - distance from target + accuracy 
        // relative score = (- distance from target / max magnitude) + accuracy

        const isRelative = mode === 'relative'
        let diff = 0
        let magnitude = 1

        if (typeof spec !== 'object') {
            const target = this.layout.adapter.measureNumber(spec)
            diff = Math.abs(value - target)
            if (isRelative) magnitude = Math.max(Math.abs(target), Math.abs(value))
        } else {
            const min = 'gt' in spec ? this.layout.adapter.measureNumber(spec.gt): undefined
            const max = 'lt' in spec ? this.layout.adapter.measureNumber(spec.lt): undefined
            if (min !== undefined && value < min) {
                diff = value - min
                if (isRelative) magnitude =  Math.max(Math.abs(min), Math.abs(value))
            }
            else if (max !== undefined && value > max) {
                diff = max - value
                if (isRelative) magnitude = Math.max(Math.abs(max), Math.abs(value))
            }
        }

        if (isRelative) {
            if (magnitude === 0) return accuracy
            return -(diff/magnitude) + accuracy
        }

        return - diff + accuracy
    }

    protected getVector3Score(value:Vector3, spec:OneOrMany<Vector3Spec>|undefined, mode:ConstraintMode, accuracy:number) {        
        return this.reduceFromOneOrManySpec(value, spec, mode, accuracy, this._getVector3ScoreSingle)
    }

    private _getVector3ScoreSingle = (value:Vector3, spec:Vector3Spec, mode:ConstraintMode, accuracy:number) => {
        // penalty for discrete spec is distance from the valid value
        const xScore = ('x' in spec && typeof spec.x !== 'undefined') ? this.getNumberScore(value.x, spec.x, mode, accuracy) : 0
        const yScore = ('y' in spec && typeof spec.y !== 'undefined') ? this.getNumberScore(value.y, spec.y, mode, accuracy) : 0
        const zScore = ('z' in spec && typeof spec.z !== 'undefined') ? this.getNumberScore(value.z, spec.z, mode, accuracy) : 0
        const magnitudeScore = ('magnitude' in spec && typeof spec.magnitude !== 'undefined') ? this.getNumberScore(value.length(), spec.magnitude, mode, accuracy) : 0
        return xScore + yScore + zScore + magnitudeScore
    }

    protected getQuaternionScore(value:Quaternion, spec:OneOrMany<QuaternionSpec>|undefined, mode:ConstraintMode, accuracy:number) {
        return this.reduceFromOneOrManySpec(value, spec, mode, accuracy, this._getQuaternionScoreSingle)
    }

    private _getQuaternionScoreSingle = (value:Quaternion, spec:QuaternionSpec|undefined, mode:ConstraintMode, accuracy:number) => {
        // absolute score = - angle from target + accuracy 
        // relative score = (- angle from target / max magnitude) + accuracy

        const isRelative = mode === 'relative'

        if (spec instanceof Quaternion) {
            if (isRelative) {
                return - (spec.angleTo(value) / Math.PI) + accuracy
            }
            return - spec.angleTo(value) * MathUtils.RAD2DEG + accuracy
        }
        // penalty for continous spec is distance from the valid range
        // const axis = 'axis' in spec && spec.axis
        // const xScore = ('x' in axis && typeof axis.x !== 'undefined') ? this._getNumberScore(value.x, axis.x) : 0
        // const yScore = ('y' in axis && typeof axis.y !== 'undefined') ? this._getNumberScore(value.y, axis.y) : 0
        // const zScore = ('z' in axis && typeof axis.z !== 'undefined') ? this._getNumberScore(value.z, axis.z) : 0
        // const magnitudeScore = ('magnitude' in spec && typeof spec.magnitude !== 'undefined') ? this._getNumberScore(value.length(), spec.magnitude) : 0
        // const xyzScore = Math.sqrt(xScore**2 + yScore**2 + zScore**2)
        // return Math.max(xyzScore, magnitudeScore)
        return 0
    }

    protected getBoundsScore(spec:SpatialBoundsSpec|undefined, type:BoundsMeasureType) {
        if (spec === undefined) return 0
        let score = Infinity
        for (const key in spec) {
            let k = key as keyof SpatialBoundsSpec
            if (k === 'size' || k === 'center') {
                const subSpec = spec[k]
                for (const subKey in subSpec) {
                    let sk = subKey as keyof NonNullable<typeof spec[typeof k]>
                    score = Math.min(this.getBoundsMeasureScore(subSpec?.[sk], type, k+sk as any), score)
                }
            } else {
                score = Math.min(this.getBoundsMeasureScore(spec[k], type, k), score)
            }
        }
        return score
    }

    protected getBoundsMeasureScore(spec:ConstraintSpec|undefined, type:BoundsMeasureType, subType:BoundsMeasureSubType) {
        if (spec === undefined) return 0
        const state = this.layout.adapter.metrics.targetState
        const system = this.layout.adapter.system
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
                bounds = state.visualBounds
                center = state.visualCenter
                size = state.visualSize
                break
            case 'view': 
                const viewState = system.viewMetrics.targetState
                bounds = viewState.visualBounds
                center = viewState.visualCenter
                size = viewState.visualSize
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
            case 'sizex':   value = size.x; break
            case 'sizey':  value = size.y; break
            case 'sizez':   value = size.z; break
            case 'sizediagonal': value = type === 'spatial' ? 
                size.length() : Math.sqrt(size.x**2 + size.y**2); break
            default: 
                throw new Error(`Unknown measure subtype ${type}.${subType} in spec "${spec}"`)
        }

        const unit = (type === 'spatial' || 
                    subType === 'front' || 
                    subType === 'back' || 
                    subType === 'centerz' || 
                    subType === 'sizez') ? system.mathScope.meter : system.mathScope.pixel
        const accuracyMeasure = unit === system.mathScope.meter ? 
            this.layout.spatialAccuracy : this.layout.visualAccuracy
        const accuracy = this.layout.adapter.measureNumber(accuracyMeasure, unit)

        // score for compound spec is best score in the list
        if (spec instanceof Array && spec.length) {
            let score = -Infinity
            for (const s of spec) {
                score = Math.max(this._getMeasurePenaltySingle(value, s, type, subType, accuracy), score)
            }
            return score
        }
        return this._getMeasurePenaltySingle(value, spec, type, subType, accuracy)
    }

    private _getMeasurePenaltySingle = (value:number, spec:ConstraintSpec|undefined, type:BoundsMeasureType, subType:BoundsMeasureSubType, accuracy:number) => {
        if (spec === undefined) return 0
        // penalty for single spec is distance from any valid value
        if (typeof spec === 'object') {
            if ('gt' in spec) {
                const min = this.layout.adapter.measureBounds(spec.gt, type, subType)
                if (value < min) return value - min + accuracy
            }
            if ('lt' in spec) {
                const max = this.layout.adapter.measureBounds(spec.lt, type, subType)
                if (value > max) return max - value + accuracy
            }  
            return accuracy
        }
        return - Math.abs(value - this.layout.adapter.measureBounds(spec, type, subType)) + accuracy
    }

    /**  Attenuate visual score when out of view */
    protected attenuateVisualScore(score:number) : number {
        let penalty = 0
        const acc = this.layout.adapter.measureNumber(
            this.layout.visualAccuracy, this.layout.adapter.system.mathScope.pixel)
        const adapter = this.layout.adapter
        const viewResolution = adapter.system.viewResolution
        const vw = viewResolution.x
        const vh = viewResolution.y
        const visualBounds = adapter.metrics.targetState.visualBounds
        const leftOffset = visualBounds.min.x - -vw/2 + acc
        const rightOffset = visualBounds.max.x - vw/2 - acc
        const bottomOffset = visualBounds.min.y - -vh/2 + acc
        const topOffset = visualBounds.max.y - vh/2 - acc
        if (leftOffset < 0) penalty += Math.abs(leftOffset / vw) * 10
        if (rightOffset > 0) penalty += Math.abs(rightOffset / vw) * 10 
        if (bottomOffset < 0) penalty += Math.abs(bottomOffset / vh) * 10
        if (topOffset > 0) penalty += Math.abs(topOffset / vh) * 10
        return score - Math.abs(score)*(penalty**2)
    }
}

export class LocalPositionConstraint extends SpatialObjective {
    spec?:Vector3Spec

    evaluate() {
        const mathScope = this.layout.adapter.system.mathScope
        const state = this.layout.adapter.metrics.targetState
        const accuracy = this.layout.adapter.measureNumber( this.layout.relativeAccuracy, mathScope.meter )
        return this.getVector3Score(state.localPosition, this.spec, 'relative', accuracy)
    }
}

export class LocalOrientationConstraint extends SpatialObjective {
    spec?:QuaternionSpec

    evaluate() {
        const mathScope = this.layout.adapter.system.mathScope
        const state = this.layout.adapter.metrics.targetState
        const accuracy = this.layout.adapter.measureNumber( this.layout.angularAccuracy, mathScope.degree )
        return this.getQuaternionScore(state.localOrientation, this.spec, 'absolute', accuracy)
    }
}


export class LocalScaleConstraint extends SpatialObjective {
    spec?:Vector3Spec

    evaluate() {
        const state = this.layout.adapter.metrics.targetState
        const accuracy = this.layout.adapter.measureNumber( this.layout.relativeAccuracy )
        return this.getVector3Score(state.localScale, this.spec, 'relative', accuracy)
    }
}

export class AspectConstraint extends SpatialObjective {
    mode = 'spatial' as 'spatial'|'visual'

    private _scale = new Vector3

    evaluate() {
        const state = this.layout.adapter.metrics.targetState
        const accuracy = this.layout.adapter.measureNumber( this.layout.relativeAccuracy )
        const mode = this.mode
        if (!mode) return 0
        // const worldScale = state.worldScale
        const s = this._scale.copy(state.worldScale)
        const largest = mode === 'spatial' ? 
            Math.max(Math.abs(s.x), Math.abs(s.y), Math.abs(s.z)) : 
            Math.max(Math.abs(s.x), Math.abs(s.y))
        const aspectFill = s.divideScalar(largest)
        return  this.getNumberScore(aspectFill.x, 1, 'relative', accuracy) +
                this.getNumberScore(aspectFill.y, 1, 'relative', accuracy) +
                (mode === 'spatial' ? 
                    this.getNumberScore(aspectFill.z, 1, 'relative', accuracy):
                    // prevent z from being scaled largest when doing preserved 2D aspect
                    aspectFill.z > 1 ? -1-aspectFill.z : 0)
    }
}

export interface SpatialBoundsSpec {
    /** meters */ left? : ConstraintSpec   
    /** meters */ bottom? : ConstraintSpec 
    /** meters */ right? :  ConstraintSpec  
    /** meters */ top? :  ConstraintSpec    
    /** meters */ front? :  ConstraintSpec  
    /** meters */ back? :  ConstraintSpec
    size? : {
    /** meters */ x?: ConstraintSpec,
    /** meters */ y?: ConstraintSpec, 
    /** meters */ z?: ConstraintSpec, 
    /** meters */ diagonal?: ConstraintSpec
    },
    center? : {
    /** meters */ x?: ConstraintSpec,
    /** meters */ y?: ConstraintSpec, 
    /** meters */ z?: ConstraintSpec,
    }
}

export class SpatialBoundsConstraint extends SpatialObjective {
    spec?:SpatialBoundsSpec

    evaluate() {
        return this.getBoundsScore(this.spec, 'spatial')
    }
}

export interface VisualBoundsSpec {
    absolute?: {
        /** pixels */ left? : ConstraintSpec   
        /** pixels */ bottom? : ConstraintSpec 
        /** pixels */ right? : ConstraintSpec  
        /** pixels */ top? : ConstraintSpec    
        /** meters */ front? : ConstraintSpec   
        /** meters */ back? : ConstraintSpec,
        center? : {
            /** pixels */ x?:ConstraintSpec,
            /** pixels */ y?:ConstraintSpec, 
            /** meters */ z?:ConstraintSpec,
        }
    },
    /** pixels */ left? : ConstraintSpec   
    /** pixels */ bottom? : ConstraintSpec 
    /** pixels */ right? : ConstraintSpec  
    /** pixels */ top? : ConstraintSpec    
    /** meters */ front? : ConstraintSpec   
    /** meters */ back? : ConstraintSpec,
    center? : {
        /** pixels */ x?:ConstraintSpec,
        /** pixels */ y?:ConstraintSpec, 
        /** meters */ z?:ConstraintSpec,
    }
    size? : {
    /** pixels */ x?:ConstraintSpec,
    /** pixels */ y?:ConstraintSpec, 
    /** meters */ z?:ConstraintSpec, 
    /** pixels */ diagonal?:ConstraintSpec
    }
}

export class VisualBoundsConstraint extends SpatialObjective {
    spec?:VisualBoundsSpec

    evaluate() {
        return this.attenuateVisualScore(
            this.getBoundsScore(this.spec, 'visual') + 
            this.getBoundsScore(this.spec?.absolute, 'view')
        )
    }
}


export class VisualMaximizeObjective extends SpatialObjective {

    evaluate() {
        const visualSize = this.layout.adapter.metrics.targetState.visualSize
        let visualArea = Math.min(visualSize.x * visualSize.y, visualSize.x * visualSize.y) ** 20
        return this.attenuateVisualScore(visualArea)
    }
}

export class VisualForceObjective extends SpatialObjective {

    evaluate() {
        const visualSize = this.layout.adapter.metrics.targetState.visualSize
        let visualArea = Math.min(visualSize.x * visualSize.y, visualSize.x * visualSize.y) ** 20
        return this.attenuateVisualScore(visualArea)
    }
}

