import { Quaternion, Box3 } from './math';
import { LayoutSolution } from './SpatialLayout';
export class OptimizerConfig {
    constructor(config) {
        config && Object.assign(this, config);
    }
}
/**
 * A standard set of objective functions that can be used
 * in order to evaluate fitness and thereby rank layout solutions.
 *
 * The returned numerical value should increase in correlation with improved fitness.
 */
export const Objective = {
    maximizeVisualSize: (s) => {
        return s.visualFrustum.diagonalDegrees;
    },
    towardsLayoutDirection: (s, direction) => {
        return s.layoutCenter.distanceTo(direction);
    },
    towardsViewDirection: (s, direction) => {
        const f = s.visualFrustum;
        // f.centerMeters
        return 0;
    },
    towardsPosition: (metrics) => 0,
    towardsViewPosition: (metrics) => 0
};
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
export class SpatialOptimizer {
    constructor(system) {
        this.system = system;
        this._config = new OptimizerConfig;
        this._prevOrientation = new Quaternion;
        this._prevBounds = new Box3;
        this.#scratchSolution = new LayoutSolution();
    }
    _setConfig(adapter) {
        const defaultConfig = this.system.config.optimize;
        this._config.pulseRate = defaultConfig.pulseRate;
        this._config.iterationsPerFrame = adapter.optimize.iterationsPerFrame ?? defaultConfig.iterationsPerFrame;
        this._config.swarmSize = adapter.optimize.swarmSize ?? defaultConfig.swarmSize;
        this._config.pulseFrequencyMin = adapter.optimize.pulseFrequencyMin ?? defaultConfig.pulseFrequencyMin;
        this._config.pulseFrequencyMax = adapter.optimize.pulseFrequencyMax ?? defaultConfig.pulseFrequencyMax;
        this._config.stepSizeMax = adapter.optimize.stepSizeMax ?? defaultConfig.stepSizeMax;
        this._config.stepSizeMin = adapter.optimize.stepSizeMin ?? defaultConfig.stepSizeMin;
        this._config.stepSizeStart = adapter.optimize.stepSizeStart ?? defaultConfig.stepSizeStart;
        this._config.staleRestartRate = adapter.optimize.staleRestartRate ?? defaultConfig.staleRestartRate;
        this._config.successRateMovingAverage = adapter.optimize.successRateMovingAverage ?? defaultConfig.successRateMovingAverage;
    }
    /**
     * Optimize the layouts defined on this adapter
     */
    update(adapter) {
        if (adapter.allLayouts.length === 0 || adapter.metrics.innerBounds.isEmpty()) {
            adapter.activeLayout = null;
            return;
        }
        const prevParent = adapter.parentNode;
        const prevOrientation = this._prevOrientation.copy(adapter.orientation.target);
        const prevBounds = this._prevBounds.copy(adapter.bounds.target);
        this._setConfig(adapter);
        for (const layout of adapter.allLayouts) {
            this._updateLayout(adapter, layout);
        }
        if (adapter.layouts.length === 0) {
            adapter.parentNode = prevParent;
            adapter.orientation.target = prevOrientation;
            adapter.bounds.target = prevBounds;
            adapter.metrics.invalidateNodeStates();
            adapter.activeLayout = null;
            return;
        }
        let bestLayout = adapter.layouts[0];
        let bestOfAllSolutions = adapter.layouts[0].solutions[0];
        for (const layout of adapter.layouts) {
            const bestSolution = layout.solutions[0];
            if (layout.compareSolutions(bestSolution, bestOfAllSolutions) < 0) {
                bestLayout = layout;
                bestOfAllSolutions = bestSolution;
            }
        }
        this.applyLayoutSolution(adapter, bestLayout, bestOfAllSolutions, false);
        adapter.activeLayout = bestLayout;
        return bestLayout;
    }
    #scratchSolution;
    _updateLayout(adapter, layout) {
        const solutions = layout.solutions;
        const c = this._config;
        const newSolution = this.#scratchSolution;
        const diversificationFactor = 1.5;
        const intensificationFactor = 1.5 ** (-1 / 4);
        const successAlpha = 2 / (c.successRateMovingAverage + 1); // N-sample exponential moving average
        // const iterations = adapter.layouts.includes(layout) ? 
        //     c.iterationsPerFrame : Math.min(Math.round(c.iterationsPerFrame * 0.1), 1)
        const iterations = c.iterationsPerFrame;
        // manage solution population (if necessary)
        this._manageSolutionPopulation(adapter, layout, c.swarmSize, c.stepSizeStart);
        // // rescore and sort solutions
        newSolution.copy(solutions[0]);
        for (let i = 0; i < solutions.length; i++) {
            this.applyLayoutSolution(adapter, layout, solutions[i], true);
        }
        layout.sortSolutions();
        // optimize solutions
        for (let i = 0; i < iterations; i++) {
            layout.iteration++;
            const solutionBest = solutions[0];
            // update solutions
            for (let j = 0; j < solutions.length; j++) {
                const solution = solutions[j];
                // generate new solution
                newSolution.copy(solution);
                newSolution.mutationStrategies = solution.mutationStrategies;
                let mutationStrategy = undefined;
                if (Math.random() < c.pulseRate) { // emit directional pulses! (global search / exploration)
                    // select best and random solution
                    let bestSolution = solutionBest !== solution ? solutionBest : solutions[1];
                    let randomSolution;
                    if (solutions.length > 2) {
                        do {
                            randomSolution = solutions[Math.floor(Math.random() * solutions.length)];
                        } while (randomSolution === solution);
                    }
                    // move towards best or both solutions
                    newSolution.moveTowards(bestSolution, c.pulseFrequencyMin, c.pulseFrequencyMax);
                    if (randomSolution && layout.compareSolutions(randomSolution, solution) <= 0) {
                        newSolution.moveTowards(randomSolution, c.pulseFrequencyMin, c.pulseFrequencyMax);
                    }
                }
                else { // gaussian/levy random walk! (local search / exploitation)
                    mutationStrategy = newSolution.perturb();
                }
                // evaluate new solutions
                // this.applyLayoutSolution(adapter, layout, solution, true)
                this.applyLayoutSolution(adapter, layout, newSolution, true);
                // better than previous ?
                const success = layout.compareSolutions(newSolution, solution) < 0;
                if (success)
                    solution.copy(newSolution);
                // adapt step size
                if (mutationStrategy) {
                    mutationStrategy.successRate = successAlpha * (success ? 1 : 0) + (1 - successAlpha) * mutationStrategy.successRate;
                    mutationStrategy.stepSize *= success ? diversificationFactor : intensificationFactor;
                    if (!success && solution !== solutionBest && mutationStrategy.stepSize < c.stepSizeMin && Math.random() < c.staleRestartRate) {
                        // random restart
                        for (const m of solution.mutationStrategies) {
                            m.stepSize = c.stepSizeStart;
                            m.successRate = 0.2;
                        }
                        solution.randomize(1);
                        this.applyLayoutSolution(adapter, layout, solution, true);
                    }
                    else if (mutationStrategy.stepSize > c.stepSizeMax) {
                        mutationStrategy.stepSize = c.stepSizeMax;
                    }
                }
            }
            // best solution may have changed
            layout.sortSolutions();
        }
    }
    _manageSolutionPopulation(adapter, layout, swarmSize, startStepSize) {
        if (swarmSize <= 1)
            throw new Error('Swarm size must be larger than 1');
        if (layout.solutions.length < swarmSize) {
            while (layout.solutions.length < swarmSize) {
                const solution = new LayoutSolution(layout);
                for (const s of solution.mutationStrategies)
                    s.stepSize = startStepSize;
                solution.randomize(1);
                layout.solutions.push(solution);
            }
        }
        else if (layout.solutions.length > swarmSize) {
            while (layout.solutions.length > swarmSize) {
                layout.solutions.pop();
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
    applyLayoutSolution(adapter, layout, solution, evaluate = false) {
        adapter.parentNode = layout.parentNode;
        adapter.orientation.target = solution.orientation;
        adapter.bounds.target = solution.bounds;
        adapter.metrics.invalidateNodeStates();
        if (evaluate) {
            const state = adapter.metrics.targetState;
            for (let i = 0; i < layout.constraints.length; i++) {
                solution.constraintScores[i] = layout.constraints[i].evaluate(state, layout);
            }
            for (let i = 0; i < layout.objectives.length; i++) {
                solution.objectiveScores[i] = layout.objectives[i].evaluate(state, layout);
            }
        }
    }
}
