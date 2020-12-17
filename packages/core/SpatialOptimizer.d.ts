import { EtherealSystem, Node3D } from './EtherealSystem';
import { Vector3 } from './math';
import { LayoutSolution, SpatialLayout } from './SpatialLayout';
import { SpatialAdapter } from './SpatialAdapter';
import { SpatialMetrics, NodeState } from './SpatialMetrics';
export declare class OptimizerConfig {
    constructor(config?: OptimizerConfig);
    constraintThreshold?: number;
    relativeTolerance?: number;
    absoluteTolerance?: number;
    stepSizeMin?: number;
    stepSizeMax?: number;
    stepSizeStart?: number;
    staleRestartRate?: number;
    successRateMin?: number;
    /** The number of samples to use for computing success rate */
    successRateMovingAverage?: number;
    iterationsPerFrame?: number;
    /**
     * The solution swarm size for each layout
     */
    swarmSize?: number;
    /**
     * Ratio of exploration vs exploitation
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
 * A standard set of objective functions that can be used
 * in order to evaluate fitness and thereby rank layout solutions.
 *
 * The returned numerical value should increase in correlation with improved fitness.
 */
export declare const Objective: {
    maximizeVisualSize: (s: NodeState<any>) => number;
    towardsLayoutDirection: (s: NodeState<any>, direction: Vector3) => number;
    towardsViewDirection: (s: NodeState<any>, direction: Vector3) => number;
    towardsPosition: (metrics: SpatialMetrics<any>) => number;
    towardsViewPosition: (metrics: SpatialMetrics<any>) => number;
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
export declare class SpatialOptimizer<N extends Node3D> {
    #private;
    system: EtherealSystem<N>;
    constructor(system: EtherealSystem<N>);
    private _config;
    private _setConfig;
    private _prevOrientation;
    private _prevBounds;
    /**
     * Optimize the layouts defined on this adapter
     */
    update(adapter: SpatialAdapter<any>): SpatialLayout | undefined;
    private _updateLayout;
    private _manageSolutionPopulation;
    /**
     * Set a specific layout solution on the adapter
     *
     * @param adapter
     * @param layout
     * @param solution
     */
    applyLayoutSolution(adapter: SpatialAdapter<any>, layout: SpatialLayout, solution: LayoutSolution, evaluate?: boolean): void;
}
