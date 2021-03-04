/// <reference types="mathjs" />
import { Node3D } from './EtherealSystem';
import { Quaternion, Box3 } from './math-utils';
import { SpatialAdapter } from './SpatialAdapter';
import { ObjectiveOptions, Vector3Spec, LocalPositionConstraint, QuaternionSpec, LocalOrientationConstraint, LocalScaleConstraint, AspectConstraint, SpatialBoundsSpec, SpatialBoundsConstraint, VisualBoundsSpec, VisualBoundsConstraint, VisualMaximizeObjective, VisualForceObjective, SpatialObjective } from './SpatialObjective';
/**
 * Defines spatial layout constraints/goals
 */
export declare class SpatialLayout {
    adapter: SpatialAdapter<any>;
    static compiledExpressions: Map<string, import("mathjs").EvalFunction>;
    constructor(adapter: SpatialAdapter<any>);
    spatialAccuracy: string;
    visualAccuracy: string;
    angularAccuracy: string;
    relativeAccuracy: number;
    successRate: number;
    restartRate: number;
    /**
     * The objectives applied to this layout
     */
    objectives: SpatialObjective[];
    /**
     * The parent node
     * If `undefined`, target parent is the current parent
     * if `null`, this node is considered as flagged to be removed
     */
    parentNode?: Node3D | null;
    attachedTo(parentNode: Node3D | null | undefined): this;
    /**
     * Add a local position objective
     * (local units are ambigious due to potential parent scaling).
     */
    localPosition(spec: Vector3Spec, opts?: ObjectiveOptions): this;
    localPositionConstraint?: LocalPositionConstraint;
    /**
     * Add a local orientation constraint
     */
    localOrientation(spec: QuaternionSpec, opts?: ObjectiveOptions): this;
    localOrientationConstraint?: LocalOrientationConstraint;
    /**
     * Add a local scale constraint
     */
    localScale(spec: Vector3Spec, opts?: ObjectiveOptions): this;
    localScaleConstraint?: LocalScaleConstraint;
    /**
    * Add an aspect-ratio constraint
    * Constrain normalized world scale to preserve
    * spatial or visual aspect ratios
    */
    preserveAspect(mode: 'spatial' | 'visual', opts?: ObjectiveOptions): this;
    preserveAspectConstraint?: AspectConstraint;
    /**
     * Add a local orientation constraint (same as localOrientation)
     */
    spatialOrientation(spec: QuaternionSpec, opts?: ObjectiveOptions): this;
    spatialBounds(spec: SpatialBoundsSpec, opts?: ObjectiveOptions): this;
    spatialBoundsConstraint?: SpatialBoundsConstraint;
    visualOrientation(spec: QuaternionSpec, opts?: ObjectiveOptions): void;
    visualBounds(spec: VisualBoundsSpec, opts?: ObjectiveOptions): this;
    visualBoundsConstraint?: VisualBoundsConstraint;
    visualMaximize(opts?: ObjectiveOptions): this;
    visualMaximizeObjective?: VisualMaximizeObjective;
    visualForce(opts?: ObjectiveOptions): this;
    visualForceObjective?: VisualForceObjective;
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
    bestSolution: LayoutSolution;
    /**
     * Update best scores and sort solutions
     */
    sortSolutions(): void;
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
    compareSolutions: (a: LayoutSolution, b: LayoutSolution) => number;
}
export interface MutationStrategy {
    type: string;
    stepSize: number;
    successRate: number;
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
    bestScores: number[];
    /**
     * All constraints are satisfied
     */
    get isValid(): boolean;
    mutationStrategies: {
        type: string;
        stepSize: number;
        successRate: number;
    }[];
    private _selectStrategy;
    private _mutationWeights;
    copy(solution: LayoutSolution): this;
    private static _scratchV1;
    private static _scratchV2;
    randomize(sizeHint: number): this;
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
    perturb(): {
        type: string;
        stepSize: number;
        successRate: number;
    };
    private _perturbFromSpatialBoundsSpec;
    static generatePulseFrequency(min: number, max: number): number;
    private static _mutateCorner;
    apply(evaluate?: boolean): void;
}
