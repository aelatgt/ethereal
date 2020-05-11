import { tracked, memo } from './tracking'
import { Quaternion, Vector3, Box3, MathUtils } from './math'
import { ConstraintSpec, SpatialConstraint, SpatialLayout, LayoutSolution, LinearMeasure, LinearMeasureSpec } from './SpatialLayout'
import type { SpatialAdapter } from './SpatialAdapter'
import type { SpatialMetrics } from './SpatialMetrics'

export class OptimizerConfig {
    constructor(config?:OptimizerConfig) {
        config && Object.assign(this, config)
    }

    /**
     * The solution swarm size for each layout
     */
    @tracked swarmSize? : number

    /**
     * The objective function used to evaluate fitness and rank layout solutions.
     * The returned value should increase in correlation with improved fitness.
     */
    @tracked objective? : (metrics:SpatialMetrics) => number

    /**
     * This mutation success rate at which exploration and exploitation are considered balanced
     */
    @tracked targetSuccessRate? : number //  = 0.2

    /**
     * The degree to which the search parameters (pulse rate and step size) should be modified based on the success rate
     * 
     * If the success rate is below the `targetSuccessRate`, the pulse rate and step size are multipled by this factor
     * If the success rate is above the `targetSuccessRate`, the pulse rate and step size are divided by this factor
     * Otherwise, the pulse rate and step size remain the same
     */
    @tracked adaptivityFactor? : number //  = 0.85
    
    /**
     * The smoothing window that determines the current success rate used for strategy adaptation
     */
    @tracked adaptivityInterval? : number // = 20
    
    /**
     * The minimal distance that a pulse will cause movement towards a better solution
     */
    @tracked minPulseFrequency? : number // = 0
    
    /**
     * The minimal distance that a pulse will cause movement towards a better solution
     */
    @tracked maxPulseFrequency? : number // = 2
}

/**
 * Implements an optimization metaheuristic based on:
 *  - Novel Adaptive Bat Algorithm (NABA) 
 *      - https://doi.org/10.5120/16402-6079
 *      - Adaptive exploration/exploitation!
 *      - 1/5th successful mutation rule used to adaptively increases or decreases exploration/exploitation via :
 *          - standard deviation of gaussian distrubtion for random walks (large standard deviation means more exploration)
 *          - pulse rate (high pulse rate means more exploitation)
 *  - Simple and Efficient Constraineed PSO
 *      - https://doi.org/10.1243/09544062JMES1732
 *      - Multi-objective via weighed sum of objective functions
 *      - Transform constraints into unconstrained objective 
 *      - Quasi-random / chaotic initialization
 *  - New directional bat algorithm for continuous optimization problems
 *      - https://doi.org/10.1016/j.eswa.2016.10.050
 *      - Directional echolocation (move towards best and/or random better solution)
 *      - Accept new local solution if better than current local solution (instead of requiring better than best solution)
 *      - Update best soltuion regardless of local solution acceptance
 * 
 * TLDR; In order to allow for continual optimization that maximizes exploration vs exploitation strategies as needed:
 *  - global search (exploration) consists of a gaussian random walk towards both the global best solution and (possibly) a random better solution
 *  - local search (exploitation) consists of gaussian random perturbation of the local solution
 *  - the frequency pulse rate (the ratio of exploration vs exploitation) adapts to the solution mutation success rate 
 *  - the standard deviation used for random walks also adapts to the solution mutation success rate
 */
export class SpatialOptimizer {

    static compareSolutions = (a:LayoutSolution, b:LayoutSolution) => {
        return a.score - b.score
    } 

    epsillonMeters = 1e-8
    epsillonDegrees = 1e-8
    epsillonRatio = 1e-8

    /** Default config */
    defaults = new OptimizerConfig({
        swarmSize: 30,
        objective: (metrics) => metrics.viewFrustum.area,
        targetSuccessRate: 0.2, // Rechenberg 1/5th mutation rule
        adaptivityFactor: 0.9925, // slowly increase/decrease exploration/exploitation parameters
        adaptivityInterval: 20, // the smoothing window for computing the current success rate,
        minPulseFrequency: 0,
        maxPulseFrequency: 2
    }) as Required<OptimizerConfig>
    
    /**
     * Max iteractions per layout, per frame
     */
    maxIterationsPerLayout = 10

    /**
     * Optimize the layouts defined on this adapter
     */
    update(adapter:SpatialAdapter) {
        if (adapter.layouts.length === 0) return

        const swarmSize = adapter.optimize.swarmSize ?? this.defaults.swarmSize
        const minFreq = adapter.optimize.minPulseFrequency ?? this.defaults.minPulseFrequency
        const maxFreq = adapter.optimize.maxPulseFrequency ?? this.defaults.maxPulseFrequency
        const targetSuccessRate = adapter.optimize.targetSuccessRate ?? this.defaults.targetSuccessRate
        const adaptivityFactor = adapter.optimize.adaptivityFactor ?? this.defaults.adaptivityFactor
        const adaptivityInterval = adapter.optimize.adaptivityInterval ?? this.defaults.adaptivityInterval
        const adaptivityAlpha = 2 / (adaptivityInterval + 1)
        const newSolution = this.#scratchSolution

        for (const layout of adapter.layouts) {

            // init solutions (if necessary)
            if (layout.solutions.length < swarmSize) {
                while (layout.solutions.length < swarmSize) {
                    layout.solutions.push(new LayoutSolution().randomize(layout.sizeHint))
                }
                for (const solution of layout.solutions) {
                    this.setLayoutSolution(adapter, layout, solution)
                    solution.score = this.computeLayoutScore(adapter, layout)
                }
                layout.solutions.sort(SpatialOptimizer.compareSolutions)
            }

            // optimize solutions
            for (let i=0; i<this.maxIterationsPerLayout; i++) {
                layout.iteration++
                const solutions = layout.solutions

                // update solutions
                for (const solution of solutions) {

                    // generate new solution
                    newSolution.orientation.copy(solution.orientation)
                    newSolution.bounds.copy(solution.bounds)
                    if (Math.random() < solution.pulseRate) { // explore - emit pulses!
                        // select best and random solution
                        const solutionBest = solutions[0]
                        let solutionRandom:LayoutSolution
                        do { solutionRandom = solutions[Math.floor(Math.random()*solutions.length)] } 
                        while (solutionRandom === solution) 
                        // move towards best or both solutions
                        newSolution.moveTowards(solutionBest, minFreq, maxFreq)
                        if (solutionRandom.score > solution.score) {
                            newSolution.moveTowards(solutionRandom, minFreq, maxFreq)
                        }
                    } else { // exploit!
                        // gaussian random walk
                        newSolution.perturb(solution.stepScale, layout.sizeHint)
                    }

                    // evaluate new solution
                    this.setLayoutSolution(adapter, layout, solution)
                    newSolution.score = this.computeLayoutScore(adapter, layout)
                    
                    // accept new solution ? 
                    const success = newSolution.score > solution.score
                    if (success) {
                        solution.orientation.copy(newSolution.orientation)
                        solution.bounds.copy(newSolution.bounds)
                    }

                    // adapt search strategy
                    solution.successRate = adaptivityAlpha * (success ? 1 : 0) + (1-adaptivityAlpha) * solution.successRate
                    if (solution.successRate > targetSuccessRate) {
                        // increase exploitation
                        solution.pulseRate /= adaptivityFactor
                        solution.stepScale *= adaptivityFactor
                    } else {
                        // increase exploration
                        solution.pulseRate *= adaptivityFactor
                        solution.stepScale /= adaptivityFactor
                    }

                }

                solutions.sort(SpatialOptimizer.compareSolutions)
            }
        }

        let bestLayout = adapter.layouts[0]
        let bestOfAllSolutions = adapter.layouts[0].solutions[0]
        for (const layout of adapter.layouts) {
            const bestSolution = layout.solutions[0]
            if (bestSolution.score > bestOfAllSolutions.score) {
                bestLayout = layout
                bestOfAllSolutions = bestSolution
            }
        }
        
        this.setLayoutSolution(adapter, bestLayout, bestOfAllSolutions)
    }
    #scratchSolution = new LayoutSolution()


    /**
     * Set a specific layout solution on the adapter
     * 
     * @param adapter 
     * @param layout 
     * @param solution 
     */
    setLayoutSolution(adapter:SpatialAdapter, layout:SpatialLayout, solution:LayoutSolution) {
        if (adapter.targetParent !== layout.parent) adapter.targetParent = layout.parent
        if (adapter.orientation.target.angleTo(solution.orientation) > this.epsillonDegrees) 
            adapter.orientation.target = adapter.orientation.target.copy(solution.orientation)
        if (adapter.bounds.target.min.distanceTo(solution.bounds.min) > this.epsillonMeters || 
            adapter.bounds.target.max.distanceTo(solution.bounds.max) > this.epsillonMeters) 
            adapter.bounds.target = adapter.bounds.target.copy(solution.bounds)
    }

    /**
     * Negative scores are considered infeasible (constraints are violated).
     * Positive scores are feasible. The highest the score, the better the fitness. 
     */
    @memo computeLayoutScore(adapter:SpatialAdapter, layout:SpatialLayout) : number {
        const penalty = this.computeLayoutPenalty(adapter, layout)
        const objective = adapter.optimize.objective ?? this.defaults.objective
        return penalty > 0 ? -penalty : Math.atan(objective(adapter.metrics)) + Math.PI/2
    }

    /**
     * 
     */
    @memo computeLayoutPenalty(adapter:SpatialAdapter, layout:SpatialLayout) : number {
        let maxPenalty = 0
        for (const c of layout.defaultConstraints) {
            maxPenalty = Math.max(this.computeConstraintPenalty(adapter.metrics, c), maxPenalty)
        }
        for (const c of layout.constraints) {
            maxPenalty = Math.max(this.computeConstraintPenalty(adapter.metrics, c), maxPenalty)
        }
        return maxPenalty
    }

    /**
     * Compute a penalty for the given metrics and constraints.
     * 
     * The penalty is a measure of the "distance" from the
     * closest valid value (where valid values are defined by the constraint spec)
     * 
     * Any penalty score less than or equal to 0 means there was no penalty
     */
    @memo computeConstraintPenalty(metrics:SpatialMetrics, constraint:SpatialConstraint) {
        const value = constraint.metric(metrics)   
        const spec = constraint.spec()
        if (typeof spec === 'undefined') return 0
        if (typeof value === 'number') return this._getNumberPenalty(value, spec as ConstraintSpec<number>)
        if (value instanceof Vector3) return this._getVector3DPenalty(value, spec as ConstraintSpec<Vector3>)
        if (value instanceof Quaternion) return this._getQuaternionPenalty(value, spec as ConstraintSpec<Quaternion>)
        if (value instanceof Box3) return this._getBoundsPenalty(metrics, value, spec as ConstraintSpec<Box3>)
        // if (value instanceof LayoutFrustum) return this._getFrustumPenalty(value, spec as ConstraintSpec<Box3>)
        throw new Error("Unknown Constraint Value")
    }

    private _getNumberPenalty(value:number, spec:ConstraintSpec<number>, epsillon=0) {
        // penalty for compound spec is smallest penalty in the list
        if (spec instanceof Array && spec.length) {
            let penalty = Infinity
            for (const s of spec) {
                penalty = Math.min(this._getNumberPenalty(value, s), penalty)
                if (penalty <= epsillon) {
                    break
                }
            }
            return penalty
        }
        // penalty for single spec is distance from any valid value
        if (typeof spec === 'number') return Math.abs(value as number - spec)
        if ('min' in spec && typeof spec.min !== 'undefined' && value < spec.min) return spec.min - value
        if ('max' in spec && typeof spec.max !== 'undefined' && value > spec.max) return value - spec.max
        return 0
    }

    private _getVector3DPenalty(value:Vector3, spec:ConstraintSpec<Vector3>, epsillon=this.epsillonMeters) {
        // penalty for compound spec is smallest penalty in the list
        if (spec instanceof Array && spec.length) {
            let penalty = Infinity
            for (const s of spec) {
                penalty = Math.min(this._getVector3DPenalty(value, s), penalty)
                if (penalty <= epsillon) {
                    break
                }
            }
            return penalty
        }
        // penalty for discrete spec is distance from the valid value
        if (spec instanceof Vector3) return spec.distanceTo(value)
        // penalty for continous spec is distance from the valid range
        const xPenalty = ('x' in spec && typeof spec.x !== 'undefined') ? this._getNumberPenalty(value.x, spec.x, epsillon) : 0
        const yPenalty = ('y' in spec && typeof spec.y !== 'undefined') ? this._getNumberPenalty(value.y, spec.y, epsillon) : 0
        const zPenalty = ('z' in spec && typeof spec.z !== 'undefined') ? this._getNumberPenalty(value.z, spec.z, epsillon) : 0
        const magnitudePenalty = ('magnitude' in spec && typeof spec.magnitude !== 'undefined') ? this._getNumberPenalty(value.length(), spec.magnitude, epsillon) : 0
        const xyzPenalty = Math.sqrt(xPenalty**2 + yPenalty**2 + zPenalty**2)
        return Math.max(xyzPenalty, magnitudePenalty)
    }

    private _getQuaternionPenalty(value:Quaternion, spec:ConstraintSpec<Quaternion>, epsillon=this.epsillonDegrees) {
        // penalty for compound spec is smallest penalty in the list
        if (spec instanceof Array && spec.length) {
            let penalty = Infinity
            for (const s of spec) {
                penalty = Math.min(this._getQuaternionPenalty(value, s), penalty)
                if (penalty <= epsillon) {
                    break
                }
            }
            return penalty
        }
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



    private _getBoundsPenalty(metrics:SpatialMetrics, value:Box3, spec:ConstraintSpec<Box3>, epsillon=this.epsillonMeters) {
        // penalty for compound spec is smallest penalty in the list
        if (spec instanceof Array && spec.length) {
            let penalty = Infinity
            for (const s of spec) {
                penalty = Math.min(this._getBoundsPenalty(metrics, value, s), penalty)
                if (penalty <= epsillon) {
                    break
                }
            }
            return penalty
        }
        
        // penalty for discrete spec is length of the difference between spec size and union size
        // (if the current value is inside the spec, then the union of both will be the same as the spec)
        if (spec instanceof Box3) {
            const unionBox = this.#unionBox.copy(spec).union(value)
            const unionSize = unionBox.getSize(this.#unionSize)
            const specSize = spec.getSize(this.#specSize)
            const diffSize = unionSize.sub(specSize)
            return diffSize.length() * MathUtils.RAD2DEG
        }
        // penalty for continous spec is distance from the valid range
        const metersFromPercent = this.#metersFromPercent.copy(metrics.proportionalSize).divideScalar(100) 
        const leftPenalty = this._getLinearMeasurePenalty(value.min.x, spec.left, metersFromPercent.x, epsillon)
        const rightPenalty = this._getLinearMeasurePenalty(value.max.x, spec.right, metersFromPercent.x, epsillon)
        const bottomPenalty = this._getLinearMeasurePenalty(value.min.y, spec.bottom, metersFromPercent.y, epsillon)
        const topPenalty = this._getLinearMeasurePenalty(value.max.y, spec.top, metersFromPercent.y, epsillon)
        const nearPenalty = this._getLinearMeasurePenalty(value.max.z, spec.front, metersFromPercent.z, epsillon)
        const farPenalty = this._getLinearMeasurePenalty(value.min.z, spec.back, metersFromPercent.z, epsillon)
        return Math.sqrt((rightPenalty + leftPenalty)**2 + (topPenalty + bottomPenalty)**2 + (nearPenalty + farPenalty)**2)
    }
    #metersFromPercent = new Vector3
    #specSize = new Vector3
    #unionSize = new Vector3
    #unionBox = new Box3

    private _getLinearMeasurePenalty(valueMeters:number, spec:LinearMeasureSpec, metersFromPercent:number, epsillon=this.epsillonMeters) {
        // penalty for compound spec is smallest penalty in the list
        if (spec instanceof Array && spec.length) {
            let penalty = Infinity
            for (const s of spec) {
                penalty = Math.min(this._getLinearMeasurePenalty(valueMeters, s, metersFromPercent, epsillon), penalty)
                if (penalty <= epsillon) {
                    break
                }
            }
            return penalty
        }
        // penalty for single spec is distance from any valid value
        if (typeof spec === 'number') return Math.abs(valueMeters - spec)
        if ('min' in spec && typeof spec.min !== 'undefined' && valueMeters < spec.min) {
            const minMeters = this._getMetersFromLinearMeasure(spec.min, metersFromPercent)
            return minMeters - valueMeters
        }
        if ('max' in spec && typeof spec.max !== 'undefined' && valueMeters > spec.max) {
            const maxMeters = this._getMetersFromLinearMeasure(spec.max, metersFromPercent)
            return valueMeters - maxMeters
        }
        return 0
    }

    private _getMetersFromLinearMeasure(measure:LinearMeasure, metersFromPercent:number) {
        return measure.meters || 0 + 0.01 * (measure.centimeters || 0) + metersFromPercent * (measure.percent || 0)
    }

}