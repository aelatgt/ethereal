import { EtherealLayoutSystem, Node3D } from './EtherealLayoutSystem'
import { Quaternion, Box3 } from './math-utils'
import { 
    LayoutSolution, 
    SpatialLayout,
    MutationStrategy
} from './SpatialLayout'
import { SpatialAdapter } from './SpatialAdapter'

export class OptimizerConfig {
    constructor(config?:OptimizerConfig) {
        config && Object.assign(this, config)
    }

    relativeTolerance? : number
    stepSizeMin?: number
    stepSizeMax?: number
    stepSizeStart?: number
    
    /** Min number of seconds to wait after producing an infeasible layout */
    minFeasibleTime?: number
    /** Max number of seconds to wait for a feasible layout */
    maxInfeasibleTime?: number

    maxIterationsPerFrame? : number

    /**
     * The solution swarm size for each layout
     */
    swarmSize? : number

    /**
     * Ratio of exploitation vs exploration 
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

    constructor(public system:EtherealLayoutSystem<N>) {}

    private _config = new OptimizerConfig as Required<OptimizerConfig>

    private _setConfig(config:OptimizerConfig) {
        const defaultConfig = this.system.optimize
        this._config.minFeasibleTime = config.minFeasibleTime ?? defaultConfig.minFeasibleTime
        this._config.maxInfeasibleTime = config.maxInfeasibleTime ?? defaultConfig.maxInfeasibleTime
        this._config.pulseRate = config.pulseRate ?? defaultConfig.pulseRate
        this._config.maxIterationsPerFrame = config.maxIterationsPerFrame ?? defaultConfig.maxIterationsPerFrame
        this._config.swarmSize = config.swarmSize ?? defaultConfig.swarmSize
        this._config.pulseFrequencyMin = config.pulseFrequencyMin ?? defaultConfig.pulseFrequencyMin
        this._config.pulseFrequencyMax = config.pulseFrequencyMax ?? defaultConfig.pulseFrequencyMax
        this._config.stepSizeMax = config.stepSizeMax ?? defaultConfig.stepSizeMax
        this._config.stepSizeMin = config.stepSizeMin ?? defaultConfig.stepSizeMin
        this._config.stepSizeStart = config.stepSizeStart ?? defaultConfig.stepSizeStart
    }

    private _prevOrientation = new Quaternion
    private _prevBounds = new Box3

    /**
     * Optimize the layouts defined on this adapter
     */
    update(adapter:SpatialAdapter<any>) {

        if (adapter.layouts.length === 0 || adapter.metrics.innerBounds.isEmpty()) {
            adapter.activeLayout = null
            return false
        }

        const prevReference = adapter.referenceNode
        const prevOrientation = this._prevOrientation.copy(adapter.orientation.target)
        const prevBounds = this._prevBounds.copy(adapter.bounds.target)
        const prevLayout = adapter.activeLayout

        for (const layout of adapter.layouts) {
            this._setConfig(layout)
            this._updateLayout(adapter, layout)
        }

        let bestLayout:SpatialLayout|undefined
        let bestSolution:LayoutSolution|undefined
        for (const layout of adapter.layouts) {
            const solution = layout.solutions[0]
            if (!bestSolution || (!bestSolution.isFeasible && solution.isFeasible)) {
                bestSolution = solution
                bestLayout = layout
                if (bestSolution.isFeasible) break
            }
        }
        

        adapter.layoutFeasibleTime += adapter.system.deltaTime
        adapter.layoutInfeasibleTime += adapter.system.deltaTime

        if (bestSolution?.isFeasible) {
            adapter.layoutInfeasibleTime = 0
        } else {
            adapter.layoutFeasibleTime = 0
        }
        
        if ((bestSolution && bestSolution.isFeasible && adapter.layoutFeasibleTime > this._config.minFeasibleTime) ||  
            adapter.layoutInfeasibleTime > this._config.maxInfeasibleTime) {
            bestSolution!.apply(false)
            adapter.activeLayout = bestLayout!
        } else {
            adapter.referenceNode = prevReference
            adapter.orientation.target = prevOrientation
            adapter.bounds.target = prevBounds
            adapter.activeLayout = prevLayout
            adapter.metrics.invalidateStates()
        }
        return true
    }


    private _scratchSolution = new LayoutSolution()
    private _scratchBestSolution = new LayoutSolution()

    private _updateLayout(adapter:SpatialAdapter<any>, layout:SpatialLayout) {
        adapter.measureBoundsCache.clear()

        const solutions = layout.solutions
        const c = this._config
        const newSolution = this._scratchSolution
        const bestSolution = this._scratchBestSolution
        const diversificationFactor = 1.5 
        const intensificationFactor = 1.5 ** (-1/4)
        let iterations = c.maxIterationsPerFrame

        // if (!adapter.hasValidContext || layout.solutions[0]?.isFeasible)
        if (layout.solutions[0]?.isFeasible) 
            iterations = 1

        // manage solution population (if necessary)
        this._manageSolutionPopulation(adapter, layout, c.swarmSize, c.stepSizeStart)

        // rescore previous best solution (in case the score changed)
        solutions[0].apply()

        // optimize solutions
        for (let i=0; i< iterations; i++) {
            layout.iteration++
            bestSolution.copy(solutions[0])

            // update solutions
            for (let j=0; j < solutions.length; j++) {
                const solution = solutions[j]

                // generate new solution
                newSolution.copy(solution)
                newSolution.mutationStrategies = solution.mutationStrategies
                let mutationStrategy = undefined as MutationStrategy|undefined

                if (Math.random() < c.pulseRate) { // emit directional pulses! (global search / exploration)
                    // select best and random solution
                    const best = bestSolution !== solution ? bestSolution : solutions[1] 
                    let randomSolution:LayoutSolution|undefined
                    if (solutions.length > 2) {
                        do { randomSolution = solutions[Math.floor(Math.random()*solutions.length)] } 
                        while (randomSolution === solution) 
                    }
                    // move towards best or both solutions
                    newSolution.moveTowards(best, c.pulseFrequencyMin, c.pulseFrequencyMax)
                    if (randomSolution && layout.compareSolutions(randomSolution, solution) <= 0) {
                        newSolution.moveTowards(randomSolution, c.pulseFrequencyMin, c.pulseFrequencyMax)
                    }
                    
                } else { // gaussian/levy random walk! (local search / exploitation)
                    mutationStrategy = newSolution.perturb()
                }

                // evaluate new solutions
                newSolution.apply()
                
                // better than previous ?
                const success = layout.compareSolutions(newSolution, solution) < 0
                if (success) solution.copy(newSolution)

                // adapt step size
                if (mutationStrategy) {
                    mutationStrategy.stepSize *= success ? diversificationFactor : intensificationFactor
                    if (!success && mutationStrategy.stepSize < c.stepSizeMin || mutationStrategy.stepSize > c.stepSizeMax) {
                        // random restart
                        layout.restartRate = 0.001 + (1-0.001) * layout.restartRate
                        for (const m of solution.mutationStrategies) {
                            m.stepSize = c.stepSizeStart
                        }
                        if (solution !== solutions[0]) {
                            solution.randomize(1)
                            solution.apply()
                        }
                        // solution.bestScores.length = 0
                        // for (const s of solution.scores) solution.bestScores.push(s)
                    } else {
                        layout.restartRate = (1-0.001) * layout.restartRate
                        // if (!success && solution !== solutions[0] && Math.random() < 2 ** (50 * mutationStrategy.stepSize / c.stepSizeStart - 50))
                        //     solution.copy(newSolution)
                    }
                }

            }

            // best solution may have changed
            layout.sortSolutions()
            if (layout.compareSolutions(bestSolution, solutions[0]) <= 0) {
                layout.successRate = (1-0.001) * layout.successRate
            } else {
                layout.successRate = 0.001 + (1-0.001) * layout.successRate
            }
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