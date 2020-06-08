import { EtherealSystem } from './EtherealSystem'
import { tracked, cached } from './tracking'
import { Vector3, computeRelativeDifference, Ray } from './math'
import { 
    LayoutSolution, 
    LayoutObjective,
    SpatialLayout
} from './SpatialLayout'
import { SpatialAdapter } from './SpatialAdapter'
import { SpatialMetrics } from './SpatialMetrics'

export class OptimizerConfig {
    constructor(config?:OptimizerConfig) {
        config && Object.assign(this, config)
    }

    /**
     * The solution swarm size for each layout
     */
    @tracked swarmSize? : number

    /**
     * The objectives used to evaluate fitness and thereby rank layout solutions.
     * This list should be sorted in order of objective priority. 
     * 
     * @see `SpatialOptimizer.rankSolutions` to understand how solutions are ranked. 
     */
    @tracked objectives? : Array<LayoutObjective>

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

    /**
     * A standard set of objective functions that can be used 
     * in order to evaluate fitness and thereby rank layout solutions.
     * 
     * The returned numerical value should increase in correlation with improved fitness.
     */
    static objective = {
        maximizeViewArea: (metrics:SpatialMetrics) => {
            return metrics.viewFrustum.area
        },
        minimizePullEnergy: (() => {
            const ray = new Ray
            return (metrics:SpatialMetrics, layout:SpatialLayout) => {
                const center = metrics.layoutCenter
                const pullCenter = layout.pull?.center
                const pullDirection = layout.pull?.direction
                let centerDist = 0
                let directionDist = 0
                if (pullCenter) {
                    const xDiff = Math.abs(center.x - (pullCenter.x || 0))
                    const yDiff = Math.abs(center.y - (pullCenter.y || 0))
                    const zDiff = Math.abs(center.z - (pullCenter.z || 0))
                    centerDist = Math.sqrt(xDiff**2 + yDiff**2 + zDiff**2)
                }
                if (pullDirection) {
                    ray.origin.copy(metrics.outerCenter)
                    ray.direction.set(pullDirection.x || 0, pullDirection.y || 0, pullDirection.z || 0).normalize()
                    directionDist = ray.distanceToPoint(center)
                }
                return -(centerDist + directionDist)
            }
        })(),
        minimizeVisualPullEnergy: (() => {
            const ray = new Ray
            return (metrics:SpatialMetrics, layout:SpatialLayout) => {
                const center = metrics.viewFrustum.centerMeters
                const pullCenter = layout.visualPull?.center
                const pullDirection = layout.visualPull?.direction
                let centerDist = 0
                let directionDist = 0
                if (pullCenter) {
                    const xDiff = Math.abs(center.x - (pullCenter.x || 0))
                    const yDiff = Math.abs(center.y - (pullCenter.y || 0))
                    const zDiff = Math.abs(center.z - (pullCenter.z || 0))
                    centerDist = Math.sqrt(xDiff**2 + yDiff**2 + zDiff**2)
                }
                if (pullDirection) {
                    ray.origin.set(0,0,0)
                    ray.direction.set(pullDirection.x || 0, pullDirection.y || 0, pullDirection.z || 0).normalize()
                    directionDist = ray.distanceToPoint(center)
                }
                return -(centerDist + directionDist)
            }
        })(),
        towardsDirection: (metrics:SpatialMetrics, direction:Vector3) => {
            return metrics.layoutCenter.distanceTo(direction)
        },
        towardsViewDirection: (metrics:SpatialMetrics, direction:Vector3) => {
            const f = metrics.viewFrustum
            f.centerMeters
            return 0
        },
        towardsPosition: (metrics:SpatialMetrics) => 0,
        towardsViewPosition: (metrics:SpatialMetrics) => 0
        
    }

    constructor(public system:EtherealSystem) {}

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
    static rankSolutions = (a:LayoutSolution, b:LayoutSolution) => {
        /**
         * If either solution breaks constraints, then
         * the one with the lowest penalty is ranked higher
         */
        if (a.penalty > 0 || b.penalty > 0) {
            return a.penalty - b.penalty // rank by lowest penalty
        }
        /**
         * If both solutions are feasible, then we 
         * rank according to the objective functions, 
         * prefering the solution that has the highest 
         * score within the relative tolerance ranges
         * of each objective, in order of objective priority. 
         * If at any point, the relative difference between 
         * scores is larger than the relative tolerance for 
         * a given objective, the two solutions will be ranked 
         * by that objective. 
         */
        for (const [i, obj] of a.objectives.entries()) {
            const scoreA = a.scores[i]
            const scoreB = b.scores[i]
            const relativeDiff = computeRelativeDifference(scoreA, scoreB)
            if (relativeDiff > (obj.relativeTolerance || 0)) {
                return scoreB - scoreA // rank by highest score
            }
        }
        /**
         * If all scores are within relative tolerance of one another,
         * then simply rank by the lowest priority objective
         */
        const lastIndex = a.scores.length-1
        return b.scores[lastIndex] - a.scores[lastIndex] // rank by highest score
    } 

    /** Default config */
    defaults = new OptimizerConfig({
        swarmSize: 30,
        objectives: [{fitness: (metrics) => metrics.viewFrustum.area}],
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
        const solutionCenter = this.#center

        for (const layout of adapter.layouts) {

            // manage solution population (if necessary)
            this._manageSolutionPopulation(adapter, layout, swarmSize)

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
                        if (SpatialOptimizer.rankSolutions(solutionRandom, solution) <= 0) {
                            newSolution.moveTowards(solutionRandom, minFreq, maxFreq)
                        }
                    } else { // exploit!
                        // gaussian random walk
                        newSolution.bounds.getCenter(solutionCenter)
                        const solutionDistance = solutionCenter.applyMatrix4(adapter.metrics.viewFromLocal).length()
                        newSolution.perturb(solution.stepScale, solutionDistance)
                    }

                    // evaluate new solution
                    this.applyLayoutSolution(adapter, layout, solution, true)
                    
                    // accept new solution ?
                    const success = SpatialOptimizer.rankSolutions(newSolution, solution) <= 0
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

                solutions.sort(SpatialOptimizer.rankSolutions)
            }
        }

        let bestLayout = adapter.layouts[0]
        let bestOfAllSolutions = adapter.layouts[0].solutions[0]
        for (const layout of adapter.layouts) {
            const bestSolution = layout.solutions[0]
            if (SpatialOptimizer.rankSolutions(bestSolution, bestOfAllSolutions) < 0) {
                bestLayout = layout
                bestOfAllSolutions = bestSolution
            }
        }
        
        this.applyLayoutSolution(adapter, bestLayout, bestOfAllSolutions)
    }
    #scratchSolution = new LayoutSolution()
    #center = new Vector3

    private _manageSolutionPopulation(adapter:SpatialAdapter, layout:SpatialLayout, swarmSize:number) {
        if (swarmSize <= 2) throw new Error('Swarm size must be larger than 2')
        if (layout.solutions.length < swarmSize) {
            const visualDistance = Math.min(
                adapter.metrics.parentMetrics?.viewFrustum.nearMeters ?? this.system.viewFrustum.nearMeters,
                this.system.viewFrustum.nearMeters
            )
            while (layout.solutions.length < swarmSize) {
                layout.solutions.push(new LayoutSolution().randomize(visualDistance))
            }
            for (const solution of layout.solutions) {
                this.applyLayoutSolution(adapter, layout, solution, true)
            }
            layout.solutions.sort(SpatialOptimizer.rankSolutions)
        } else if (layout.solutions.length > swarmSize) {
            while (layout.solutions.length > swarmSize) {
                layout.solutions.pop()
            }
        }
    }

    /**
     * Set a specific layout solution on the adapter
     * 
     * @param adapter 
     * @param layout 
     * @param solution 
     */
    applyLayoutSolution(adapter:SpatialAdapter, layout:SpatialLayout, solution:LayoutSolution, evaluate=false) {
        if (adapter.parentNode !== layout.parentNode) adapter.parentNode = layout.parentNode
        if (adapter.orientation.target && adapter.orientation.target.angleTo(solution.orientation) > this.system.epsillonDegrees) 
            adapter.orientation.target = solution.orientation
        if (adapter.bounds.target && adapter.bounds.target.min.distanceTo(solution.bounds.min) > this.system.epsillonMeters || 
            adapter.bounds.target && adapter.bounds.target.max.distanceTo(solution.bounds.max) > this.system.epsillonMeters) 
            adapter.bounds.target = solution.bounds
        if (evaluate) {
            this._computeSolutionPenalty(adapter, layout, solution)
            this._computeSolutionScores(adapter, layout, solution)
        }
    }

    /*
     * Positive penalty means the solution is infeasible (constraints are violated).
     * Negative or 0 penalty means the solution is feasible.
     */
    @cached private _computeSolutionPenalty(adapter:SpatialAdapter, layout:SpatialLayout, solution:LayoutSolution) {
        const metrics = adapter.metrics
        let maxPenalty = 0
        for (const c of layout.defaultConstraints) {
            maxPenalty = Math.max(c(metrics), maxPenalty)
        }
        for (const c of layout.constraints) {
            maxPenalty = Math.max(c(metrics), maxPenalty)
        }
        solution.penalty = maxPenalty
    }

    /** The highest the score, the better the fitness. 
     */
    @cached private _computeSolutionScores(adapter:SpatialAdapter, layout:SpatialLayout, solution:LayoutSolution) {
        solution.objectives = adapter.optimize.objectives ?? this.defaults.objectives
        for (const [i,obj] of solution.objectives.entries()) {
            solution.scores[i] = obj.fitness(adapter.metrics, layout)
        }
    }

}