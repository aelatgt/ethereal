import { Node3D } from './EtherealLayoutSystem';
import { Quaternion, Box3 } from './math-utils';
import { SpatialAdapter } from './SpatialAdapter';
import { OptimizerConfig } from './SpatialOptimizer';
import { Vector3Spec, //RelativePositionConstraint as RelativePositionConstraint, 
QuaternionSpec, RelativeOrientationConstraint as RelativeOrientationConstraint, WorldScaleConstraint as WorldScaleConstraint, AspectConstraint, SpatialBoundsSpec, SpatialBoundsConstraint, VisualBoundsSpec, VisualBoundsConstraint, VisualMaximizeObjective as MaximizeObjective, SpatialObjective, MagnetizeObjective, MinimizeOcclusionObjective } from './SpatialObjective';
/**
 * Defines spatial layout constraints/goals
 */
export declare class SpatialLayout extends OptimizerConfig {
    adapter: SpatialAdapter<any>;
    constructor(adapter: SpatialAdapter<any>);
    relativeTolerance?: number;
    absoluteTolerance: {
        meter: string;
        pixel: string;
        degree: string;
        ratio: number;
    };
    getComputedAbsoluteTolerance(type: keyof typeof SpatialLayout.prototype.absoluteTolerance): number;
    successRate: number;
    restartRate: number;
    /**
     * The objectives applied to this layout
     */
    objectives: readonly SpatialObjective[];
    /**
     * The reference frame for position and orientation constraints.
     * if not defined, the parent node becomes the reference frame.
     */
    referenceNode?: Node3D | null;
    /**
     * Define a reference frame for position and orientation constraints.
     * @param reference
     */
    poseRelativeTo(reference?: Node3D | null): this;
    maximize(opts?: Partial<MaximizeObjective>): this;
    maximizeObjective?: MaximizeObjective;
    /**
     * Add a relative orientation constraint
     */
    orientation(spec: QuaternionSpec, opts?: Partial<RelativeOrientationConstraint>): this;
    orientationConstraint?: RelativeOrientationConstraint;
    /**
    * Add an aspect-ratio constraint
    * Constrain normalized world scale to preserve
    * xyz or xy aspect ratios
    */
    keepAspect(mode?: 'xyz' | 'xy', opts?: Partial<AspectConstraint>): this;
    keepAspectConstraint?: AspectConstraint;
    /**
     * Add a world scale constraint
     */
    scale(spec: Vector3Spec, opts?: Partial<WorldScaleConstraint>): this;
    scaleConstraint?: WorldScaleConstraint;
    bounds(spec: SpatialBoundsSpec, opts?: Partial<SpatialBoundsConstraint>): this;
    boundsConstraint?: SpatialBoundsConstraint;
    visualOrientation(spec: QuaternionSpec, opts?: Partial<RelativeOrientationConstraint>): this;
    visualBounds(spec: VisualBoundsSpec, opts?: Partial<VisualBoundsConstraint>): this;
    visualBoundsMeterConstraint?: VisualBoundsConstraint;
    visualBoundsPixelConstraint?: VisualBoundsConstraint;
    magnetize(opts?: Partial<MagnetizeObjective>): this;
    magnetizeObjective?: MagnetizeObjective;
    avoidOcclusion(opts?: Partial<MinimizeOcclusionObjective>): this;
    minimizeOcclusionObjective?: MagnetizeObjective;
    /**
     * Add an objective with it's options.
     * If the objective instance is already present, it's not added again.
     *
     * After an objective is added, the objective list is stably sorted,
     * according to the priority of each objective.
     */
    addObjective<T extends SpatialObjective>(obj: T, opts?: Partial<T>): this;
    /**
     * The solutions being explored for this layout
     */
    solutions: LayoutSolution[];
    /**
     * The current optimization iteration
     */
    iteration: number;
    /**
     * Return true if this layout has a valid solution
     */
    get hasValidSolution(): boolean;
    /** stable-sort objectives by priority */
    processObjectives(): void;
    bestSolution: LayoutSolution;
    /**
     * Update best scores and sort solutions
     */
    sortSolutions(): void;
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
    compareSolutions: (a: LayoutSolution, b: LayoutSolution) => number;
}
export interface MutationStrategy {
    type: string;
    stepSize: number;
}
export declare class LayoutSolution {
    constructor(layout?: SpatialLayout);
    /**
     * The layout associated with this solution
     */
    layout: SpatialLayout;
    /**
     * The layout orientation (relative to parent orientation)
     */
    orientation: Quaternion;
    /**
     * The layout bounds (world units)
     */
    bounds: Box3;
    get aspectPenalty(): number;
    get orientationPenalty(): number;
    get spatialBoundsPenalty(): number;
    /**
     * The objectives fitness scores for this solution
     * (one for each objective, higher is better)
     */
    scores: number[];
    /**
     * All constraints are satisfied
     */
    isFeasible: boolean;
    mutationStrategies: {
        type: string;
        stepSize: number;
    }[];
    private _selectStrategy;
    private _mutationWeights;
    copy(solution: LayoutSolution): this;
    private static _scratchV1;
    private static _scratchV2;
    randomize(sizeHint: number): this;
    private static _direction;
    private static _center;
    private static _size;
    private static _otherCenter;
    private static _otherSize;
    moveTowards(solution: LayoutSolution, minFreq: number, maxFreq: number): void;
    /**
     *
     * @param stepSize
     *
     */
    perturb(): typeof LayoutSolution.prototype.mutationStrategies[0];
    private _swap;
    static generatePulseFrequency(min: number, max: number): number;
    apply(evaluate?: boolean): void;
}
