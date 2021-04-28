import { Node3D } from './EtherealLayoutSystem'
import { Vector3, Quaternion, Box3, MathUtils, randomSelect, randomQuaternion, gaussian, levy} from './math-utils'
import { SpatialAdapter } from './SpatialAdapter'
import { OptimizerConfig } from './SpatialOptimizer'
import { 
    ObjectiveOptions, 
    Vector3Spec, RelativePositionConstraint as RelativePositionConstraint, 
    QuaternionSpec, RelativeOrientationConstraint as RelativeOrientationConstraint,
    WorldScaleConstraint as WorldScaleConstraint, AspectConstraint,
    SpatialBoundsSpec, SpatialBoundsConstraint,
    VisualBoundsSpec, VisualBoundsConstraint, 
    VisualMaximizeObjective as MaximizeObjective,
    SpatialObjective, MagnetizeObjective, MinimizeOcclusionObjective
} from './SpatialObjective'


/**
 * Defines spatial layout constraints/goals
 */
export class SpatialLayout extends OptimizerConfig {

    constructor(public adapter:SpatialAdapter<any>) {
        super()
    }
    
    relativeTolerance?:number
    absoluteTolerance = {
        meter: '1mm',
        pixel: '1px',
        degree: '0.002deg',
        ratio: 0.005
    }

    getComputedAbsoluteTolerance(type: keyof typeof SpatialLayout.prototype.absoluteTolerance) {
        return this.adapter.system.measureNumber(this.absoluteTolerance[type], type)
    }

    successRate = 0

    restartRate = 0

    /**
     * The objectives applied to this layout
     */
    objectives = new Array<SpatialObjective>() as ReadonlyArray<SpatialObjective>
    
    /**
     * The reference frame for position and orientation constraints. 
     * if not defined, the parent node becomes the reference frame. 
     */
    referenceNode?:Node3D|null = null

    /**
     * Define a reference frame for position and orientation constraints.
     * @param reference 
     */
    poseRelativeTo(reference?:Node3D|null) {
        this.referenceNode = reference
        return this
    }

    /**
     * Add a relative orientation constraint
     */
    orientation(spec:QuaternionSpec, opts?:Partial<RelativeOrientationConstraint>) {
        const obj = this.orientationConstraint = this.orientationConstraint ?? new RelativeOrientationConstraint(this)
        obj.spec = spec
        obj.priority = -3
        return this.addObjective(obj, opts)
    }
    orientationConstraint?:RelativeOrientationConstraint

    /**
     * Add a relative position constraint
     */
    position(spec:Vector3Spec, opts?:Partial<RelativePositionConstraint>) {
        const obj = this.positionConstraint = this.positionConstraint ?? new RelativePositionConstraint(this)
        obj.spec = spec
        obj.priority = -2
        return this.addObjective(obj, opts)
    }
    positionConstraint?:RelativePositionConstraint

    /**
     * Add a world scale constraint
     */
    scale(spec:Vector3Spec, opts?:Partial<WorldScaleConstraint>) {
        const obj = this.scaleConstraint = this.scaleConstraint ?? new WorldScaleConstraint(this)
        obj.spec = spec
        obj.priority = -2
        return this.addObjective(obj, opts)
    }
    scaleConstraint?:WorldScaleConstraint

    /**
    * Add an aspect-ratio constraint
    * Constrain normalized world scale to preserve
    * xyz or xy aspect ratios
    */
    keepAspect(mode:'xyz'|'xy'= 'xyz', opts?:Partial<AspectConstraint>) {
        const obj = this.keepAspectConstraint = this.keepAspectConstraint ?? new AspectConstraint(this)
        obj.mode = mode
        obj.priority = -1
        return this.addObjective(obj, opts)
    }
    keepAspectConstraint?:AspectConstraint

    bounds(spec:SpatialBoundsSpec, opts?:Partial<SpatialBoundsConstraint>) {
        const obj = this.boundsConstraint =  this.boundsConstraint ?? new SpatialBoundsConstraint(this)
        obj.spec = spec
        return this.addObjective(obj, opts)
    }
    boundsConstraint?:SpatialBoundsConstraint

    visualOrientation(spec:QuaternionSpec, opts?:ObjectiveOptions) {

    }

    visualBounds(spec:VisualBoundsSpec, opts?:Partial<VisualBoundsConstraint>) {
        const meterConstraint = this.visualBoundsMeterConstraint = 
            this.visualBoundsMeterConstraint ?? new VisualBoundsConstraint(this)
        const pixelConstraint = this.visualBoundsPixelConstraint = 
            this.visualBoundsPixelConstraint ?? new VisualBoundsConstraint(this)
        meterConstraint.spec = spec
        meterConstraint.type = 'meter'
        pixelConstraint.spec = spec
        pixelConstraint.type = 'pixel'
        return this.addObjective(meterConstraint, opts).addObjective(pixelConstraint, opts)
    }
    visualBoundsMeterConstraint?:VisualBoundsConstraint
    visualBoundsPixelConstraint?:VisualBoundsConstraint

    magnetize(opts?:Partial<MagnetizeObjective>) {
        const obj = this.magnetizeObjective = this.magnetizeObjective ?? new MagnetizeObjective(this)
        obj.priority = 1000
        obj.relativeTolerance = 0.99
        return this.addObjective(obj, opts)
    }
    magnetizeObjective?:MagnetizeObjective

    maximize(opts?:Partial<MaximizeObjective>) {
        const obj = this.maximizeObjective = 
            this.maximizeObjective ?? new MaximizeObjective(this)
        obj.priority = 1001
        obj.relativeTolerance = 0
        return this.addObjective(obj,opts)
    }
    maximizeObjective?:MaximizeObjective

    avoidOcclusion(opts?:Partial<MinimizeOcclusionObjective>) {
        const obj = this.minimizeOcclusionObjective = 
            this.minimizeOcclusionObjective ?? new MagnetizeObjective(this)
        obj.priority = 11
        return this.addObjective(obj, opts)
    }
    minimizeOcclusionObjective?:MagnetizeObjective

    /**
     * Add an objective with it's options.
     * If the objective instance is already present, it's not added again.
     * 
     * After an objective is added, the objective list is stably sorted, 
     * according to the priority of each objective.
     */
    addObjective<T extends SpatialObjective>(obj:T, opts?:Partial<T>) {
        Object.assign(obj, opts)
        if (this.objectives.indexOf(obj) === -1) 
            (this.objectives as Array<SpatialObjective>).push(obj)
        this.sortObjectives()
        return this
    }
    

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
        return this.solutions[0]?.isFeasible === true
    }

    private _prioritySort(a:SpatialObjective,b:SpatialObjective) {
        if (a.priority === b.priority) return a.index - b.index
        return a.priority - b.priority
    }

    /** stable-sort objectives by priority */
    sortObjectives() {
        const objectives = this.objectives as Array<SpatialObjective>
        let index = 0
        for (const o of objectives) o.index = index++
        objectives.sort(this._prioritySort)
    }

    bestSolution! : LayoutSolution

    /**
     * Update best scores and sort solutions
     */
    sortSolutions() {
        let best = 0
        for (let o = 0; o < this.objectives.length; o++) {
            best = this.solutions[0].scores[o]
            this.objectives[o].bestScore = best
        }
        this.solutions.sort(this.compareSolutions)
        this.bestSolution = this.solutions[0]
    }

    /**
     * Each objective function should return a scalar value 
     * that increases in correlation with improved fitness. 
     * 
     * The fitness value does not need to be normalized, as 
     * individual objectives are not weighted directly against
     * one another. Rather, solutions are ranked by preferring 
     * the solution that has the highest score (within tolerance)
     * of each objective, in order of objective priority. 
     * 
     * If one solution is feasible (no negative scores) and the 
     * other soltion isn't, the feasible one is always ranked higher. 
     * 
     * In all other cases, solutions are compared by examining
     * their objective scores sequentially:
     * 
     * If at any point the difference between scores is larger 
     * than the tolerance for a given objective, the two solutions 
     * will be ranked by that objective. 
     * 
     * If any two solutions are within relative tolerance 
     * of one another for all objectives, those two will be
     * compared to one another by the lowest priority objective
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
        if (b.scores.length < objectives.length) return -1

        const aFeasible = a.isFeasible
        const bFeasible = b.isFeasible
        if (aFeasible && !bFeasible) return -1
        if (bFeasible && !aFeasible) return 1

        let rank = 0
        
        for (let i = 0; i < objectives.length; i++) {
            const scoreA = a.scores[i] 
            const scoreB = b.scores[i] 
            if (isNaN(scoreA)) return 1
            if (isNaN(scoreB)) return -1
            const objective = objectives[i]
            const oRelTol = objective.computedRelativeTolerance
            const oAbsTol = objective.computedAbsoluteTolerance
            const best = objective.bestScore
            const max = Math.max(scoreA,scoreB)
            const tolerance = Math.min(max - Math.abs(max) * oRelTol, -oAbsTol)
            if (best < -oAbsTol || scoreA < tolerance || scoreB < tolerance) {
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

export interface MutationStrategy {type:string, stepSize: number}

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
        return this.scores[this.layout.objectives.indexOf(this.layout.keepAspectConstraint!)]||0
    }

    get orientationPenalty() {
        return this.scores[this.layout.objectives.indexOf(this.layout.orientationConstraint!)]||0
    }

    get spatialBoundsPenalty() {
        return this.scores[this.layout.objectives.indexOf(this.layout.boundsConstraint!)]||0
    }

    /**
     * The objectives fitness scores for this solution
     * (one for each objective, higher is better)
     */
    scores = [] as number[]

    /**
     * All constraints are satisfied
     */
    isFeasible = false
    

    mutationStrategies = [
        {type:'rotate', stepSize: 0.1},
        {type:'center', stepSize: 0.1},
        {type:'size', stepSize: 0.1},
        {type:'minmax', stepSize: 0.1},
    ]

    private _selectStrategy() {
        const strategies = this.mutationStrategies
        const weights = this._mutationWeights

        const orientationConstraint = this.layout.orientationConstraint
        const aspectConstraint = this.layout.keepAspectConstraint

        for (let i=0; i < strategies.length; i++) {
            weights[i] = strategies[i].stepSize
            if (orientationConstraint && strategies[i].type == 'rotate' 
                && this.orientationPenalty > -orientationConstraint.computedAbsoluteTolerance)
                weights[i] *= 0.01
            if (aspectConstraint && strategies[i].type == 'size' 
                && this.aspectPenalty < -aspectConstraint.computedAbsoluteTolerance)
                weights[i] *= 100
        }

        return randomSelect(strategies, weights)
    }
    private _mutationWeights = [] as number[]

    copy(solution:LayoutSolution) {
        this.layout = solution.layout
        this.orientation.copy( solution.orientation )
        this.bounds.copy( solution.bounds )
        this.scores.length = 0
        // this.bestScores.length = 0
        for (let i = 0; i < solution.scores.length; i++) {
            this.scores[i] = solution.scores[i]
            // this.bestScores[i] = solution.bestScores[i]
        }
        this.isFeasible = solution.isFeasible
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

        const viewState = this.layout.adapter.system.viewMetrics.target

        

        center.applyMatrix4(viewState.worldMatrix)
        const parentState = this.layout.adapter.metrics.target.parentState
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

    private static _direction = new Vector3
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
    perturb() : typeof LayoutSolution.prototype.mutationStrategies[0] {
        
        const strategy = this._selectStrategy()
        const strategyType = strategy.type
        let stepSize = strategy.stepSize

        // orientation mutation strategy
        if (strategyType === 'rotate' || Math.random() < 0.001) {
            const orientationSpec = this.layout.orientationConstraint?.spec as any
            if (orientationSpec?.isQuaternion && 
                this.orientationPenalty < orientationSpec.computedAbsoluteTolerance && 
                Math.random() < 0.01) {
                this.orientation.copy(orientationSpec)
            } else {
                const scale = Math.min(levy(Math.min(stepSize, 1)*0.0001), 1)
                this.orientation.multiply(randomQuaternion(scale, scale)).normalize()
            }
        }

        const bounds = this.bounds
        const center = bounds.getCenter(LayoutSolution._center)
        const size = bounds.getSize(LayoutSolution._size)

        // center mutation strategies
        if (strategyType === 'center')  {
            const offset = LayoutSolution._direction.set(0,0,1).applyQuaternion(randomQuaternion(1,1))
            offset.setLength(gaussian(stepSize)).multiplyScalar(size.length())
            center.add(offset)
        }

        // size mutation strategies
        if (strategyType === 'size') {
            const scale = 2 ** gaussian(stepSize)
            size.multiplyScalar(scale)
        }

        size.clampScalar(this.layout.adapter.system.epsillonMeters/10,1e20)
        bounds.setFromCenterAndSize(center, size)


        if (strategyType === 'minmax') {
            const offset = LayoutSolution._direction.set(0,0,1).applyQuaternion(randomQuaternion(1,1))
            offset.setLength(gaussian(stepSize)).multiply(size)
            if (Math.random() < 0.5) {
                bounds.min.add(offset)
            } else {
                bounds.min.add(offset)
            }
        }


        // make sure size has no negative components, or else 
        // Box3 is unable to transition properly
        // alternative fix: update Box3 to support negative size components
        const min = bounds.min
        const max = bounds.max
        if (min.x > max.x) this._swap(min,max,'x')
        if (min.y > max.y) this._swap(min,max,'y')
        if (min.z > max.z) this._swap(min,max,'z')
        
        return strategy
    }

    private _swap(a:Vector3, b:Vector3, key:'x'|'y'|'z') {
        const aValue = a[key]
        const bValue = b[key]
        a[key] = bValue
        b[key] = aValue
    }

    static generatePulseFrequency(min:number,max:number) {
        return min + Math.random() * (max - min)
    }

    apply(evaluate=true) {
        const layout = this.layout
        const adapter = layout.adapter   
        adapter.referenceNode = layout.referenceNode
        adapter.orientation.target = this.orientation
        adapter.bounds.target = this.bounds
        adapter.metrics.invalidateStates()
        if (evaluate) {
            this.isFeasible = true
            for (let i=0; i < layout.objectives.length; i++) {
                const o = layout.objectives[i]
                const score = this.scores[i] = o.evaluate()
                if (score < -o.computedAbsoluteTolerance || !isFinite(score)) 
                    this.isFeasible = false
            }
        }
    }
}