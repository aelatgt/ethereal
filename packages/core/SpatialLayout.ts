import { Node3D } from './EtherealSystem'
import { Vector3, Quaternion, Box3, MathUtils, randomSelect, randomQuaternion, gaussian, levy} from './math-utils'
import { SpatialAdapter } from './SpatialAdapter'
import { 
    ObjectiveOptions, 
    Vector3Spec, LocalPositionConstraint, 
    QuaternionSpec, LocalOrientationConstraint,
    LocalScaleConstraint, AspectConstraint,
    BoundsMeasureType, BoundsMeasureSubType,
    SpatialBoundsSpec, SpatialBoundsConstraint,
    VisualBoundsSpec, VisualBoundsConstraint, 
    VisualMaximizeObjective, VisualForceObjective,
    SpatialObjective, ConstraintSpec, OneOrMany,
    ContinuousSpec
} from './SpatialObjective'

// export type PullSpec = AtLeastOneProperty<{
//     direction: AtLeastOneProperty<{x:number, y:number, z:number}>,
//     position: AtLeastOneProperty<{x:number|string, y:number|string, z:number|string}>
// }>

/**
 * Defines spatial layout constraints/goals
 */
export class SpatialLayout {

    public static compiledExpressions = new Map<string,math.EvalFunction>() 

    constructor(public adapter:SpatialAdapter<any>) {}

    spatialAccuracy = '10mm'
    visualAccuracy = '1px'
    angularAccuracy = '0.1deg'
    relativeAccuracy = 0.02

    successRate = 0

    restartRate = 0

    /**
     * The objectives applied to this layout
     */
    objectives = new Array<SpatialObjective>()
    
    /**
     * The parent node 
     * If `undefined`, target parent is the current parent
     * if `null`, this node is considered as flagged to be removed
     */
    parentNode? : Node3D|null

    
    attachedTo(parentNode:Node3D|null|undefined) {
        this.parentNode = parentNode
        return this
    }

    /**
     * Add a local position objective
     * (local units are ambigious due to potential parent scaling).
     */
    localPosition(spec:Vector3Spec, opts?:ObjectiveOptions) {
        const obj = this.localPositionConstraint = 
            this.localPositionConstraint ?? new LocalPositionConstraint(this)
        Object.assign(obj, {spec}, opts)
        if (this.objectives.indexOf(obj) === -1) this.objectives.push(obj)
        return this
    }
    localPositionConstraint?:LocalPositionConstraint

    /**
     * Add a local orientation constraint
     */
    localOrientation(spec:QuaternionSpec, opts?:ObjectiveOptions) {
        const obj = this.localOrientationConstraint = 
            this.localOrientationConstraint ?? new LocalOrientationConstraint(this)
        Object.assign(obj, {spec}, opts)
        if (this.objectives.indexOf(obj) === -1) this.objectives.push(obj)
        return this
    }
    localOrientationConstraint?:LocalOrientationConstraint

    /**
     * Add a local scale constraint
     */
    localScale(spec:Vector3Spec, opts?:ObjectiveOptions) {
        const obj = this.localScaleConstraint = 
            this.localScaleConstraint ?? new LocalScaleConstraint(this)
        Object.assign(obj, {spec}, opts)
        if (this.objectives.indexOf(obj) === -1) this.objectives.push(obj)
        return this
    }
    localScaleConstraint?:LocalScaleConstraint

    /**
    * Add an aspect-ratio constraint
    * Constrain normalized world scale to preserve
    * spatial or visual aspect ratios
    */
    preserveAspect(mode:'spatial'|'visual', opts?:ObjectiveOptions) {
        const obj = this.preserveAspectConstraint = 
            this.preserveAspectConstraint ?? new AspectConstraint(this)
        Object.assign(obj, {mode}, opts)
        if (this.objectives.indexOf(obj) === -1) this.objectives.push(obj)
        return this
    }
    preserveAspectConstraint?:AspectConstraint

    /**
     * Add a local orientation constraint (same as localOrientation)
     */
    spatialOrientation(spec:QuaternionSpec, opts?:ObjectiveOptions) {
        return this.localOrientation(spec, opts)
    }

    spatialBounds(spec:SpatialBoundsSpec, opts?:ObjectiveOptions) {
        const obj = this.spatialBoundsConstraint = 
            this.spatialBoundsConstraint ?? new SpatialBoundsConstraint(this)
        Object.assign(obj, {spec}, opts)
        if (this.objectives.indexOf(obj) === -1) this.objectives.push(obj)
        return this
    }
    spatialBoundsConstraint?:SpatialBoundsConstraint

    visualOrientation(spec:QuaternionSpec, opts?:ObjectiveOptions) {

    }

    visualBounds(spec:VisualBoundsSpec, opts?:ObjectiveOptions) {
        const obj = this.visualBoundsConstraint = 
            this.visualBoundsConstraint ?? new VisualBoundsConstraint(this)
        Object.assign(obj, {spec}, opts)
        if (this.objectives.indexOf(obj) === -1) this.objectives.push(obj)
        return this
    }
    visualBoundsConstraint?:VisualBoundsConstraint

    visualMaximize(opts?:ObjectiveOptions) {
        const obj = this.visualMaximizeObjective = 
            this.visualMaximizeObjective ?? new VisualMaximizeObjective(this)
        // this objective is not a hard constraint, so give it large relative tolerance
        Object.assign(obj, {relativeTolerance:0.9}, opts)
        if (this.objectives.indexOf(obj) === -1) this.objectives.push(obj)
        return this
    }
    visualMaximizeObjective?:VisualMaximizeObjective

    visualForce(opts?:ObjectiveOptions) {
        // const obj = this.visualForceObjective = 
        //     this.visualForceObjective ?? new VisualForceObjective(this)
        // Object.assign(obj, opts)
        // if (this.objectives.indexOf(obj) === -1) this.objectives.push(obj)
        return this
    }
    visualForceObjective?:VisualForceObjective
    

    /**
     * The solutions being explored for this layout
     */
    solutions = new Array<LayoutSolution>()

    /**
     * The current optimization iteration
     */
    iteration = 0

    /**
     * Return true if this layout has a valid solution
     */
    get hasValidSolution() {
        return this.solutions[0]?.isValid === true
    }

    bestSolution! : LayoutSolution
    /**
     * Update best scores and sort solutions
     */
    sortSolutions() {
        let best = 0
        for (let o = 0; o < this.objectives.length; o++) {
            best = -Infinity
            for (let s = 0; s < this.solutions.length; s++) {
                const score = this.solutions[s].bestScores[o] ?? this.solutions[s].scores[o]
                if (score > best) best = score
            }
            this.objectives[o].bestScore = best * 0.0001 + (1-0.0001) * this.objectives[o].bestScore
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

        const objectives = this.objectives
        if (a.scores.length < objectives.length) return 1

        const systemConfig = this.adapter.system.config.optimize
        const relTol = this.adapter.optimize.relativeTolerance ?? systemConfig.relativeTolerance
        
        let rank = 0
        
        for (let i = 0; i < objectives.length; i++) {
            const scoreA = a.scores[i] 
            const scoreB = b.scores[i] 
            const objective = objectives[i]
            if (scoreA < 0 || scoreB < 0) {
                objective.sortBlame++
                return scoreB - scoreA // rank by highest score
            }
            const oRelTol = objective.relativeTolerance ?? relTol
            const bestScore = objective.bestScore!
            const tolerance = bestScore - Math.abs(bestScore) * oRelTol
            if (scoreA < tolerance || scoreB < tolerance) {
                objective.sortBlame++
                return scoreB - scoreA // rank by highest score
            }
            if (scoreB - scoreA !== 0) rank = scoreB - scoreA
        }

        // If all scores are within relative tolerance of one another,
        // sort by lowest priority score
        return rank
    }
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
        return this.scores[this.layout.objectives.indexOf(this.layout.preserveAspectConstraint!)]||0
    }

    get orientationPenalty() {
        return this.scores[this.layout.objectives.indexOf(this.layout.localOrientationConstraint!)]||0
    }

    get spatialBoundsPenalty() {
        return this.scores[this.layout.objectives.indexOf(this.layout.spatialBoundsConstraint!)]||0
    }

    /**
     * The objectives fitness scores for this solution
     * (one for each objective, higher is better)
     */
    scores = [] as number[]
    bestScores = [] as number[]

    /**
     * All constraints are satisfied
     */
    get isValid() {
        for (let i=0; i < this.scores.length; i++) {
            const score = this.scores[i]
            if (score < 0) return false
        }
        return true
    }
    

    mutationStrategies = [
        {type:'rotate', stepSize: 0.1, successRate:0.2},
        
        {type:'centerx', stepSize: 0.1, successRate:0.2},
        {type:'centery', stepSize: 0.1, successRate:0.2},
        {type:'centerz', stepSize: 0.1, successRate:0.2},
        {type:'sizeXYZ', stepSize: 0.1, successRate:0.2},
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
            weights[i] = strategies[i].stepSize * strategies[i].successRate
        }
        
        // if (this.aspectPenalty > this.layout.aspectConstraint.threshold) {
        //     for (let i=0; i< weights.length; i++) {
        //         weights[i] *= strategies[i].type.includes('size') ? 100 : 1
        //     }
        // }

        // if (this.orientationPenalty > this.layout.orientationConstraint.threshold) {
        //     weights[0] *= 1000
        // }

        return randomSelect(strategies, weights)
    }
    private _mutationWeights = [] as number[]

    copy(solution:LayoutSolution) {
        this.layout = solution.layout
        this.orientation.copy( solution.orientation )
        this.bounds.copy( solution.bounds )
        // this.constraintScores.length = 0
        // for (let i = 0; i < solution.constraintScores.length; i++) {
        //     this.constraintScores[i] = solution.constraintScores[i]
        // }
        this.scores.length = 0
        for (let i = 0; i < solution.scores.length; i++) {
            this.scores[i] = solution.scores[i]
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
            const orientationSpec = this.layout.localOrientationConstraint?.spec as any
            if (orientationSpec?.isQuaternion) {
                this.orientation.copy(orientationSpec)
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
        if (strategyType === 'centerz')  {
            const spatialBounds = this.layout.spatialBoundsConstraint?.spec
            center.x = this._perturbFromSpatialBoundsSpec(center.x, stepSize * size.x, spatialBounds?.center?.x, 'centerx')
        } else if (strategyType === 'centery')  {
            const spatialBounds = this.layout.spatialBoundsConstraint?.spec
            center.y = this._perturbFromSpatialBoundsSpec(center.y, stepSize * size.y, spatialBounds?.center?.y, 'centery')
        } else if (strategyType === 'centerz')  {
            const spatialBounds = this.layout.spatialBoundsConstraint?.spec
            center.z = this._perturbFromSpatialBoundsSpec(center.z, stepSize * size.z, spatialBounds?.center?.z, 'centerz')
        }

        // size mutation strategies
        else if (strategyType === 'sizeXYZ') {
            const scale = 4 ** gaussian(stepSize)
            const aspectMode = this.layout.preserveAspectConstraint?.mode
            if (aspectMode === 'visual') {
                size.x *= scale
                size.y *= scale
            } else {
                size.multiplyScalar(scale)
            }
        } else if (strategyType === 'sizeX') {
            const spatialBounds = this.layout.spatialBoundsConstraint?.spec
            size.x = this._perturbFromSpatialBoundsSpec(size.x, stepSize, spatialBounds?.size?.x, 'sizex')
        } else if (strategyType === 'sizeY') {
            const spatialBounds = this.layout.spatialBoundsConstraint?.spec
            size.y = this._perturbFromSpatialBoundsSpec(size.y, stepSize, spatialBounds?.size?.y, 'sizey')
        } else if (strategyType === 'sizeZ') {
            const spatialBounds = this.layout.spatialBoundsConstraint?.spec
            size.z = this._perturbFromSpatialBoundsSpec(size.z, stepSize, spatialBounds?.size?.z, 'sizez')
        }

        size.x = Math.abs(size.x)
        size.y = Math.abs(size.y)
        size.z = Math.abs(size.z)
        size.clampScalar(this.layout.adapter.system.config.epsillonMeters/10,1e20)
        bounds.setFromCenterAndSize(center, size)

        if (strategyType === 'minX')  {
            const spatialBounds = this.layout.spatialBoundsConstraint?.spec
            bounds.min.x = this._perturbFromSpatialBoundsSpec(bounds.min.x, stepSize * size.x, spatialBounds?.left, 'left')
        } else if (strategyType === 'minY')  {
            const spatialBounds = this.layout.spatialBoundsConstraint?.spec
            bounds.min.y = this._perturbFromSpatialBoundsSpec(bounds.min.y, stepSize * size.y, spatialBounds?.bottom, 'bottom')
        } else if (strategyType === 'minZ')  {
            const spatialBounds = this.layout.spatialBoundsConstraint?.spec
            bounds.min.z = this._perturbFromSpatialBoundsSpec(bounds.min.z, stepSize * size.z, spatialBounds?.back, 'back')
        } else if (strategyType === 'maxX')  {
            const spatialBounds = this.layout.spatialBoundsConstraint?.spec
            bounds.max.x = this._perturbFromSpatialBoundsSpec(bounds.max.x, stepSize * size.x, spatialBounds?.right, 'right')
        } else if (strategyType === 'maxY')  {
            const spatialBounds = this.layout.spatialBoundsConstraint?.spec
            bounds.max.y = this._perturbFromSpatialBoundsSpec(bounds.max.y, stepSize * size.y, spatialBounds?.top, 'top')
        } else if (strategyType === 'maxZ')  {
            const spatialBounds = this.layout.spatialBoundsConstraint?.spec
            bounds.max.z = this._perturbFromSpatialBoundsSpec(bounds.max.z, stepSize * size.z, spatialBounds?.front, 'front')
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

    private _perturbFromSpatialBoundsSpec(value:number, stepSize:number, spec:OneOrMany<ConstraintSpec>|undefined, sType:BoundsMeasureSubType) {
        if (spec === undefined) return value + gaussian(stepSize)
        if (spec instanceof Array) spec = randomSelect(spec)
        if (SpatialObjective.isDiscreteSpec(spec)) {
            return this.layout.adapter.measureBounds(spec, 'spatial', sType)
        } 
        const continuousSpec = spec as ContinuousSpec<ConstraintSpec>
        const min = 'gt' in continuousSpec ? this.layout.adapter.measureBounds(continuousSpec.gt, 'spatial', sType) : undefined
        const max = 'lt' in continuousSpec ? this.layout.adapter.measureBounds(continuousSpec.lt, 'spatial', sType) : undefined
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

    apply(evaluate=false) {
        const layout = this.layout
        const adapter = layout.adapter   
        adapter.parentNode = layout.parentNode
        adapter.orientation.target = this.orientation
        adapter.bounds.target = this.bounds
        adapter.metrics.invalidateNodeStates()
        if (evaluate) {
            for (let i=0; i < layout.objectives.length; i++) {
                const score = this.scores[i] = layout.objectives[i].evaluate()
                if (!isFinite(score)) throw new Error()
                this.bestScores[i] = Math.max(this.bestScores[i], score)
            }
        }
    }
}