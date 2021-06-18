import { EtherealLayoutSystem, Node3D } from './EtherealLayoutSystem';
import { SpatialAdapter } from './SpatialAdapter';
export declare class OptimizerConfig {
    constructor(config?: OptimizerConfig);
    relativeTolerance?: number;
    stepSizeMin?: number;
    stepSizeMax?: number;
    stepSizeStart?: number;
    /** Min number of seconds to wait after producing an infeasible layout */
    minFeasibleTime?: number;
    /** Max number of seconds to wait for a feasible layout */
    maxInfeasibleTime?: number;
    maxIterationsPerFrame?: number;
    /**
     * The solution swarm size for each layout
     */
    swarmSize?: number;
    /**
     * Ratio of exploitation vs exploration
     */
    pulseRate?: number;
    /**
     * The minimal distance that a pulse will cause movement towards a better solution
     */
    pulseFrequencyMin?: number;
    /**
     * The maximal distance that a pulse will cause movement towards a better solution
     */
    pulseFrequencyMax?: number;
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
export declare class SpatialOptimizer<N extends Node3D> {
    system: EtherealLayoutSystem<N>;
    constructor(system: EtherealLayoutSystem<N>);
    private _config;
    private _setConfig;
    private _prevOrientation;
    private _prevBounds;
    /**
     * Optimize the layouts defined on this adapter
     *
     * @returns false if there are no layouts
     */
    update(adapter: SpatialAdapter<any>): boolean;
    private _scratchSolution;
    private _scratchBestSolution;
    private _updateLayout;
    private _manageSolutionPopulation;
}
