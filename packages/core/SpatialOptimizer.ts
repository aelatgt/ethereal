import { EtherealSystem, Node3D } from './EtherealSystem'
import { Vector3, computeRelativeDifference, Ray, V_000 } from './math'
import { 
    LayoutSolution, 
    LayoutObjective,
    SpatialLayout,
    MutationStrategy
} from './SpatialLayout'
import { SpatialAdapter } from './SpatialAdapter'
import { SpatialMetrics, NodeState } from './SpatialMetrics'

export class OptimizerConfig {
    constructor(config?:OptimizerConfig) {
        config && Object.assign(this, config)
    }

    constraintThreshold?: number
    constraintRelativeTolerance? : number
    objectiveRelativeTolerance? : number
    stepSizeMin?: number
    stepSizeMax?: number
    stepSizeStart?: number
    staleRestartRate?: number

    /** The number of samples to use for computing success rate */
    successRateSamples?: number

    iterationsPerFrame? : number

    /**
     * The solution swarm size for each layout
     */
    swarmSize? : number

    /**
     * Ratio of exploration vs exploitation 
     */
    pulseRate?: number // = 0.2
    
    /**
     * The minimal distance that a pulse will cause movement towards a better solution
     */
    pulseFrequencyMin? : number // = 0
    
    /**
     * The maximal distance that a pulse will cause movement towards a better solution
     */
    pulseFrequencyMax? : number // = 2
}



/**
 * A standard set of objective functions that can be used 
 * in order to evaluate fitness and thereby rank layout solutions.
 * 
 * The returned numerical value should increase in correlation with improved fitness.
 */
export const Objective = {
    maximizeVisualSize: (s:NodeState<any>) => {
        return s.visualFrustum.diagonalDegrees
    },
    minimizePullEnergy: (() => {
        const ray = new Ray
        return (s:NodeState<any>, layout:SpatialLayout) => {
            const center = s.layoutCenter
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
                ray.origin.copy(s.outerCenter)
                ray.direction.set(pullDirection.x || 0, pullDirection.y || 0, pullDirection.z || 0).normalize()
                directionDist = ray.distanceToPoint(center)
            }
            return -(centerDist + directionDist)
        }
    })(),
    minimizeVisualPullEnergy: (() => {
        const center = new Vector3
        const ray = new Ray
        return (s:NodeState<any>, layout:SpatialLayout) => {
            center.copy(V_000).applyMatrix4(s.viewFromLayout)
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
    towardsLayoutDirection: (s:NodeState<any>, direction:Vector3) => {
        return s.layoutCenter.distanceTo(direction)
    },
    towardsViewDirection: (s:NodeState<any>, direction:Vector3) => {
        const f = s.visualFrustum
        // f.centerMeters
        return 0
    },
    towardsPosition: (metrics:SpatialMetrics<any>) => 0,
    towardsViewPosition: (metrics:SpatialMetrics<any>) => 0
    
}

/**
 * Implements an optimization metaheuristic inspired by:
 *  - Novel Adaptive Bat Algorithm (NABA) 
 *      - https://doi.org/10.5120/16402-6079
 *      - 1/5th successful mutation rule used to adaptively increase or decrease exploration/exploitation via :
 *          - standard deviation of gaussian distrubtion for random walks
 *          - pulse rate
 *  - New directional bat algorithm for continuous optimization problems
 *      - https://doi.org/10.1016/j.eswa.2016.10.050
 *      - Directional echolocation (move towards best and/or random better solution)
 *      - Accept new local solution if better than current local solution (instead of requiring better than best solution)
 *      - Update best soltuion regardless of local solution acceptance
 * 
 * TLDR; In order to allow for continual optimization that maximizes exploration vs exploitation strategies as needed:
 *  - exploitation consists of directional pulses towards the global best solution and (possibly) a random better solution
 *  - exploration consists of gaussian random perturbation of an arbitrary solution
 *  - the pulse rate (the ratio of exploration vs exploitation) adapts to the solution mutation success rate 
 *  - the standard deviation used for random walks also adapts to the solution mutation success rate
 */
export class SpatialOptimizer<N extends Node3D> {

    constructor(public system:EtherealSystem<N>) {}

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
        const systemConfig = this.system.config.optimize
        const cThreshold = a.adapter?.optimize.constraintThreshold || systemConfig.constraintThreshold
        const cRelativeTolerance = a.adapter?.optimize.constraintRelativeTolerance || systemConfig.constraintRelativeTolerance
        const oRelativeTolerance = a.adapter?.optimize.objectiveRelativeTolerance || systemConfig.objectiveRelativeTolerance
        
        for (let i = 0; i < a.layout.constraints.length; i++) {
            const constraint = a.layout.constraints[i]
            const scoreA = a.constraintScores[i] 
            const scoreB = b.constraintScores[i] 
            if (scoreA > cThreshold && scoreB > cThreshold) {
                const relativeDiff = computeRelativeDifference(scoreA, scoreB)
                const relativeTolerance = constraint.relativeTolerance || cRelativeTolerance
                if (relativeDiff > relativeTolerance) {
                    return scoreA - scoreB // rank by lowest penalty
                }
            } else if (scoreA > cThreshold || scoreB > cThreshold) {
                return scoreA - scoreB
            }
        }
        
        for (let i = 0; i < a.layout.objectives.length; i++) {
            const objective = a.layout.objectives[i]
            const scoreA = a.objectiveScores[i] 
            const scoreB = b.objectiveScores[i] 
            const relativeDiff = computeRelativeDifference(scoreA, scoreB)
            const relativeTolerance = objective.relativeTolerance || oRelativeTolerance
            if (relativeDiff > relativeTolerance) {
                return scoreB - scoreA // rank by highest score
            }
        }

        // If all scores are within relative tolerance of one another,
        // then simply rank by the lowest priority objective
        const lastIndex = a.objectiveScores.length-1
        return b.objectiveScores[lastIndex] - a.objectiveScores[lastIndex] // rank by highest score
    }


    /**
     * Optimize the layouts defined on this adapter
     */
    update(adapter:SpatialAdapter<any>) {
        if (adapter.layouts.length === 0) return

        const defaultConfig = this.system.config.optimize
        const pulseRate = defaultConfig.pulseRate
        const iterationsPerFrame = adapter.optimize.iterationsPerFrame ?? defaultConfig.iterationsPerFrame
        const swarmSize = adapter.optimize.swarmSize ?? defaultConfig.swarmSize
        const minFreq = adapter.optimize.pulseFrequencyMin ?? defaultConfig.pulseFrequencyMin
        const maxFreq = adapter.optimize.pulseFrequencyMax ?? defaultConfig.pulseFrequencyMax
        const stepSizeMax = adapter.optimize.stepSizeMax ?? defaultConfig.stepSizeMax
        const stepSizeMin = adapter.optimize.stepSizeMin ?? defaultConfig.stepSizeMin
        const stepSizeStart = adapter.optimize.stepSizeStart ?? defaultConfig.stepSizeStart
        const staleRestartRate = adapter.optimize.staleRestartRate ?? defaultConfig.staleRestartRate
        const newSolution = this.#scratchSolution
        const diversificationFactor = 1.5 
        const intensificationFactor = 1.5 ** (-1/4)
        const successRateSamples = adapter.optimize.successRateSamples ?? defaultConfig.successRateSamples
        const successAlpha = 2 / (successRateSamples + 1) // N-sample exponential moving average

        for (const layout of adapter.layouts) {

            // manage solution population (if necessary)
            this._manageSolutionPopulation(adapter, layout, swarmSize)

            // rescore and sort solutions
            const solutions = layout.solutions
            newSolution.copy(solutions[0])
            for (const solution of layout.solutions) {
                this.applyLayoutSolution(adapter, layout, solution, true)
            }
            layout.solutions.sort(this.compareSolutions)

            // optimize solutions
            for (let i=0; i< iterationsPerFrame; i++) {
                layout.iteration++
                const solutionBest = solutions[0]

                // update solutions
                for (const solution of solutions) {

                    // generate new solution
                    newSolution.copy(solution)
                    newSolution.mutationStrategies = solution.mutationStrategies
                    let mutationStrategy = undefined as MutationStrategy|undefined

                    if (Math.random() < pulseRate) { // emit directional pulses! (global search / exploration)
                        // select best and random solution
                        let bestSolution = solutionBest !== solution ? solutionBest : solutions[1] 
                        let randomSolution:LayoutSolution|undefined
                        if (solutions.length > 2) {
                            do { randomSolution = solutions[Math.floor(Math.random()*solutions.length)] } 
                            while (randomSolution === solution) 
                        }
                        // move towards best or both solutions
                        newSolution.moveTowards(bestSolution, minFreq, maxFreq)
                        if (randomSolution && this.compareSolutions(randomSolution, solution) <= 0) {
                            newSolution.moveTowards(randomSolution, minFreq, maxFreq)
                        }
                        
                    } else { // gaussian/levy random walk! (local search / exploitation)
                        mutationStrategy = newSolution.perturb()
                    }

                    // evaluate new solution
                    this.applyLayoutSolution(adapter, layout, newSolution, true)
                    
                    // better than previous ?
                    const success = this.compareSolutions(newSolution, solution) < 0
                    if (success) solution.copy(newSolution)

                    if (mutationStrategy) {
                        mutationStrategy.successRate = successAlpha * (success ? 1 : 0) + (1-successAlpha) * mutationStrategy.successRate
                        mutationStrategy.stepSize *= success ? diversificationFactor : intensificationFactor
                        if (!success && solution !== solutionBest && mutationStrategy.stepSize < stepSizeMin && Math.random() < staleRestartRate) {
                            for (const m of solution.mutationStrategies) {
                                m.stepSize = stepSizeStart
                                m.successRate = 0.2
                            }
                            solution.randomize(1)
                            this.applyLayoutSolution(adapter, layout, solution, true)
                        } else if (mutationStrategy.stepSize > stepSizeMax) {
                            mutationStrategy.stepSize = stepSizeMax
                        }
                    }

                }

                // best solution may have changed
                solutions.sort(this.compareSolutions)
            }
        }


        let bestLayout = adapter.layouts[0]!
        let bestOfAllSolutions = adapter.layouts[0].solutions[0]
        for (const layout of adapter.layouts) {
            const bestSolution = layout.solutions[0]
            if (this.compareSolutions(bestSolution, bestOfAllSolutions) < 0) {
                bestLayout = layout
                bestOfAllSolutions = bestSolution
            }
        }
        
        this.applyLayoutSolution(adapter, bestLayout, bestOfAllSolutions, false)
        adapter.activeLayout = bestLayout
        return bestLayout
    }
    #scratchSolution = new LayoutSolution()

    private _manageSolutionPopulation(adapter:SpatialAdapter<N>, layout:SpatialLayout, swarmSize:number) {
        if (swarmSize <= 1) throw new Error('Swarm size must be larger than 1')
        if (layout.solutions.length < swarmSize) {
            while (layout.solutions.length < swarmSize) {
                const solution = new LayoutSolution().randomize(1)
                solution.adapter = adapter
                solution.layout = layout
                layout.solutions.push(solution)
            }
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
    applyLayoutSolution(adapter:SpatialAdapter<any>, layout:SpatialLayout, solution:LayoutSolution, evaluate=false) {        
        adapter.parentNode = layout.parentNode
        adapter.orientation.target = solution.orientation
        // adapter.origin.target = layout.origin
        adapter.bounds.target = solution.bounds
        adapter.metrics.invalidateLocalState()
        if (evaluate) {
            const state = adapter.metrics.targetState
            for (let i=0; i < layout.constraints.length; i++) {
                solution.constraintScores[i] = layout.constraints[i].score(state,layout)
            } 
            for (let i=0; i < layout.objectives.length; i++) {
                solution.objectiveScores[i] = layout.objectives[i].score(state,layout)
            }
        }
    }

}