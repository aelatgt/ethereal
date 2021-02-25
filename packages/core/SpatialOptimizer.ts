import { EtherealSystem, Node3D } from './EtherealSystem'
import { Quaternion, Box3 } from './math-utils'
import { 
    LayoutSolution, 
    SpatialLayout,
    MutationStrategy
} from './SpatialLayout'
import {SpatialObjective} from './SpatialObjective'
import { SpatialAdapter } from './SpatialAdapter'

export class OptimizerConfig {
    constructor(config?:OptimizerConfig) {
        config && Object.assign(this, config)
    }

    relativeTolerance? : number
    stepSizeMin?: number
    stepSizeMax?: number
    stepSizeStart?: number
    staleRestartRate?: number
    successRateMin?: number
    allowInvalidLayout?: boolean

    /** The number of samples to use for computing success rate */
    successRateMovingAverage?: number

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
 * Implements an optimization metaheuristic inspired by:
 *  - Novel Adaptive Bat Algorithm (NABA) 
 *      - https://doi.org/10.5120/16402-6079
 *      - 1/5th successful mutation rule used to adaptively increase or decrease exploration/exploitation via :
 *          - standard deviation of gaussian distrubtion for random walks
 *  - New directional bat algorithm for continuous optimization problems
 *      - https://doi.org/10.1016/j.eswa.2016.10.050
 *      - Directional echolocation (move towards best and/or random better solution)
 *      - Accept new local solution if better than current local solution (instead of requiring better than best solution)
 *      - Update best soltuion regardless of local solution acceptance
 * 
 * In order to allow for continual optimization that maximizes exploration vs exploitation strategies as needed:
 *  - exploitation consists of directional pulses towards the global best solution and (possibly) a random better solution
 *  - exploration consists of gaussian random perturbation of an arbitrary solution
 */
export class SpatialOptimizer<N extends Node3D> {

    constructor(public system:EtherealSystem<N>) {}

    private _config = new OptimizerConfig as Required<OptimizerConfig>

    private _setConfig(adapter:SpatialAdapter<any>) {
        const defaultConfig = this.system.config.optimize
        this._config.allowInvalidLayout = defaultConfig.allowInvalidLayout
        this._config.pulseRate = defaultConfig.pulseRate
        this._config.iterationsPerFrame = adapter.optimize.iterationsPerFrame ?? defaultConfig.iterationsPerFrame
        this._config.swarmSize = adapter.optimize.swarmSize ?? defaultConfig.swarmSize
        this._config.pulseFrequencyMin = adapter.optimize.pulseFrequencyMin ?? defaultConfig.pulseFrequencyMin
        this._config.pulseFrequencyMax = adapter.optimize.pulseFrequencyMax ?? defaultConfig.pulseFrequencyMax
        this._config.stepSizeMax = adapter.optimize.stepSizeMax ?? defaultConfig.stepSizeMax
        this._config.stepSizeMin = adapter.optimize.stepSizeMin ?? defaultConfig.stepSizeMin
        this._config.successRateMin = adapter.optimize.successRateMin ?? defaultConfig.successRateMin
        this._config.stepSizeStart = adapter.optimize.stepSizeStart ?? defaultConfig.stepSizeStart
        this._config.staleRestartRate = adapter.optimize.staleRestartRate ?? defaultConfig.staleRestartRate
        this._config.successRateMovingAverage = adapter.optimize.successRateMovingAverage ?? defaultConfig.successRateMovingAverage
    }

    private _prevOrientation = new Quaternion
    private _prevBounds = new Box3

    /**
     * Optimize the layouts defined on this adapter
     * 
     * Returns true if layout is valid (no constraints are violated)
     * Returrns false if layout is invalid
     */
    update(adapter:SpatialAdapter<any>) {

        if (adapter.layouts.length === 0 || adapter.metrics.innerBounds.isEmpty()) {
            adapter.activeLayout = null
            return true
        }

        if (!adapter.hasValidLayoutContext) return false

        const prevParent = adapter.parentNode
        const prevOrientation = this._prevOrientation.copy(adapter.orientation.target)
        const prevBounds = this._prevBounds.copy(adapter.bounds.target)
        const prevLayout = adapter.activeLayout

        this._setConfig(adapter)
        for (const layout of adapter.layouts) {
            this._updateLayout(adapter, layout)
        }

        let bestLayout:SpatialLayout|undefined
        let bestSolution:LayoutSolution|undefined
        for (const layout of adapter.layouts) {
            const solution = layout.solutions[0]
            if ((this._config.allowInvalidLayout || solution.isValid) && 
                (!bestSolution || layout.compareSolutions(solution, bestSolution) < 0)) {
                bestLayout = layout
                bestSolution = solution
            }
        }
        
        if (bestLayout) {
            bestSolution!.apply(false)
            adapter.activeLayout = bestLayout
            return true
        }

        adapter.parentNode = prevParent
        adapter.orientation.target = prevOrientation
        adapter.bounds.target = prevBounds
        adapter.activeLayout = prevLayout
        adapter.metrics.invalidateNodeStates()
        return false
    }
    #scratchSolution = new LayoutSolution()


    private _updateLayout(adapter:SpatialAdapter<any>, layout:SpatialLayout) {
        adapter.measureBoundsCache.clear()

        const solutions = layout.solutions
        const c = this._config
        const newSolution = this.#scratchSolution
        const diversificationFactor = 1.5 
        const intensificationFactor = 1.5 ** (-1/4)
        const successAlpha = 2 / (c.successRateMovingAverage + 1) // N-sample exponential moving average
        const iterations = c.iterationsPerFrame

        // manage solution population (if necessary)
        this._manageSolutionPopulation(adapter, layout, c.swarmSize, c.stepSizeStart)

        // rescore previous best solution (in case the score changed)
        solutions[0].apply(true)
        
        // // rescore and sort solutions
        // newSolution.copy(solutions[0])
        // for (let i=0; i < solutions.length; i++) {
        //     this.applyLayoutSolution(solutions[i], true)
        // }
        // layout.sortSolutions()

        // optimize solutions
        for (let i=0; i< iterations; i++) {
            layout.iteration++
            const solutionBest = solutions[0]

            // update solutions
            for (let j=0; j < solutions.length; j++) {
                const solution = solutions[j]

                // generate new solution
                newSolution.copy(solution)
                newSolution.mutationStrategies = solution.mutationStrategies
                let mutationStrategy = undefined as MutationStrategy|undefined

                if (Math.random() < c.pulseRate) { // emit directional pulses! (global search / exploration)
                    // select best and random solution
                    let bestSolution = solutionBest !== solution ? solutionBest : solutions[1] 
                    let randomSolution:LayoutSolution|undefined
                    if (solutions.length > 2) {
                        do { randomSolution = solutions[Math.floor(Math.random()*solutions.length)] } 
                        while (randomSolution === solution) 
                    }
                    // move towards best or both solutions
                    newSolution.moveTowards(bestSolution, c.pulseFrequencyMin, c.pulseFrequencyMax)
                    if (randomSolution && layout.compareSolutions(randomSolution, solution) <= 0) {
                        newSolution.moveTowards(randomSolution, c.pulseFrequencyMin, c.pulseFrequencyMax)
                    }
                    
                } else { // gaussian/levy random walk! (local search / exploitation)
                    mutationStrategy = newSolution.perturb()
                }

                // evaluate new solutions
                // this.applyLayoutSolution(adapter, layout, solution, true)
                newSolution.apply(true)
                
                // better than previous ?
                const success = layout.compareSolutions(newSolution, solution) < 0
                if (success) solution.copy(newSolution)

                // adapt step size
                if (mutationStrategy) {
                    mutationStrategy.successRate = successAlpha * (success ? 1 : 0) + (1-successAlpha) * mutationStrategy.successRate
                    mutationStrategy.stepSize *= success ? diversificationFactor : intensificationFactor
                    
                    if (mutationStrategy.stepSize > c.stepSizeMax) {
                        mutationStrategy.stepSize = c.stepSizeMax
                    } else if (mutationStrategy.stepSize < c.stepSizeMin) {
                        mutationStrategy.stepSize = c.stepSizeMin
                    }

                    if (mutationStrategy.successRate < c.successRateMin &&
                        Math.random() < c.staleRestartRate && !success) {
                        // random restart
                        for (const m of solution.mutationStrategies) {
                            m.stepSize = c.stepSizeStart
                            m.successRate = 0.2
                        }
                        if (solution !== solutionBest) {
                            solution.randomize(1)
                            solution.apply(true)
                        }
                    }
                }

            }

            // best solution may have changed
            layout.sortSolutions()
        }
    }

    private _manageSolutionPopulation(adapter:SpatialAdapter<N>, layout:SpatialLayout, swarmSize:number, startStepSize:number) {
        if (swarmSize <= 1) throw new Error('Swarm size must be larger than 1')
        if (layout.solutions.length < swarmSize) {
            while (layout.solutions.length < swarmSize) {
                const solution = new LayoutSolution(layout)
                for (const s of solution.mutationStrategies) s.stepSize = startStepSize
                solution.randomize(1)
                layout.solutions.push(solution)
            }
        } else if (layout.solutions.length > swarmSize) {
            while (layout.solutions.length > swarmSize) {
                layout.solutions.pop()
            }
        }
    }

}