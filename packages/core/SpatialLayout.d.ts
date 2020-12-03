import { Node3D } from './EtherealSystem';
import { Vector3, Quaternion, Box3 } from './math';
import { TransitionConfig } from './Transitionable';
import { NodeState } from './SpatialMetrics';
import { SpatialAdapter } from './SpatialAdapter';
export declare type OneOrMany<T> = T | T[];
export declare type AtLeastOneProperty<T, U = {
    [K in keyof T]: Pick<T, K>;
}> = Partial<T> & U[keyof U];
export declare type DiscreteOrContinuous<T> = T | {
    gt: T;
    lt: T;
} | {
    gt: T;
} | {
    lt: T;
};
export declare type NumberSpec = OneOrMany<DiscreteOrContinuous<number>>;
export declare type QuaternionSpec = OneOrMany<{
    x: number;
    y: number;
    z: number;
    w: number;
} | {
    axis: OneOrMany<AtLeastOneProperty<{
        x: number;
        y: number;
        z: number;
    }>>;
    degrees?: VisualMeasureSpec;
} | {
    twistSwing: AtLeastOneProperty<{
        horizontal: VisualMeasureSpec;
        vertical: VisualMeasureSpec;
        twist: VisualMeasureSpec;
    }>;
} | {
    swingTwist: AtLeastOneProperty<{
        horizontal: VisualMeasureSpec;
        vertical: VisualMeasureSpec;
        twist: VisualMeasureSpec;
    }>;
}>;
export declare type Vector3Spec = OneOrMany<AtLeastOneProperty<{
    x: NumberSpec;
    y: NumberSpec;
    z: NumberSpec;
    magnitude: NumberSpec;
}>>;
/**
 * Specify a spatial measure with various units,
 * all of which are summed together as a single measure
 */
export declare type LinearMeasure = AtLeastOneProperty<{
    percent: number;
    meters: number;
    centimeters: number;
}>;
/**
 * Specify a visual measure with various units,
 * all of which are summed together as a single measure
 */
export declare type VisualMeasure = AtLeastOneProperty<{
    /** Percent relative to user's view frustum */
    percent: number;
    /** Percent relative to parent node's visual frustum */
    offsetPercent: number;
    /** Degrees relative to user's view frustum */
    degrees: number;
    /** Degrees relative to parent node's visual frustum */
    offsetDegrees: number;
    /** Radians relative to user's view frustum */
    radians: number;
    /** Radians relative to parent node's visual frustum */
    offsetRadians: number;
}>;
export declare type LinearMeasureSpec = OneOrMany<DiscreteOrContinuous<LinearMeasure>>;
export declare type VisualMeasureSpec = OneOrMany<DiscreteOrContinuous<VisualMeasure>>;
export declare class BoundsSpec {
    left?: LinearMeasureSpec;
    bottom?: LinearMeasureSpec;
    back?: LinearMeasureSpec;
    right?: LinearMeasureSpec;
    top?: LinearMeasureSpec;
    front?: LinearMeasureSpec;
    width?: LinearMeasureSpec;
    height?: LinearMeasureSpec;
    depth?: LinearMeasureSpec;
    diagonal?: LinearMeasureSpec;
    centerX?: LinearMeasureSpec;
    centerY?: LinearMeasureSpec;
    centerZ?: LinearMeasureSpec;
    pull?: PullSpec;
}
export declare class FrustumSpec {
    left?: VisualMeasureSpec;
    bottom?: VisualMeasureSpec;
    right?: VisualMeasureSpec;
    top?: VisualMeasureSpec;
    near?: LinearMeasureSpec;
    far?: LinearMeasureSpec;
    width?: VisualMeasureSpec;
    height?: VisualMeasureSpec;
    depth?: LinearMeasureSpec;
    diagonal?: VisualMeasureSpec;
    centerX?: VisualMeasureSpec;
    centerY?: VisualMeasureSpec;
    centerZ?: LinearMeasureSpec;
    pull?: PullSpec;
}
export declare type PullSpec = AtLeastOneProperty<{
    direction: AtLeastOneProperty<{
        x: number;
        y: number;
        z: number;
    }>;
    position: AtLeastOneProperty<{
        x: number;
        y: number;
        z: number;
    }>;
}>;
export declare type ScoreFunction = (state: Readonly<NodeState>, layout: SpatialLayout) => number;
declare type DiscreteSpec<T> = Exclude<T, any[] | undefined | Partial<{
    gt: any;
    lt: any;
}>>;
declare type ContinuousSpec<T> = T extends any[] | undefined ? never : T extends {
    gt: any;
    lt: any;
} ? T : never;
/**
 * Defines spatial layout constraints/goals
 */
export declare class SpatialLayout {
    #private;
    adapter: SpatialAdapter<any>;
    static isDiscreteSpec<T>(s: T): s is DiscreteSpec<T>;
    static isContinuousSpec<T>(s: T): s is ContinuousSpec<T>;
    static getNumberPenalty(value: number, spec?: NumberSpec, epsillon?: number): number;
    private static _getNumberPenaltySingle;
    static getVector3Penalty(value: Vector3, spec?: Vector3Spec, epsillon?: number): number;
    private static _getVector3PenaltySingle;
    static getQuaternionPenalty(value: Quaternion, spec?: QuaternionSpec, epsillon?: number): number;
    private static _getQuaternionPenaltySingle;
    static _boundsCenter: Vector3;
    static _boundsSize: Vector3;
    static _outerSize: Vector3;
    static getBoundsPenalty(state: Readonly<NodeState>, spec?: BoundsSpec): number;
    static getLinearMeasurePenalty(valueMeters: number, spec: LinearMeasureSpec | undefined, range: number): number;
    private static _getLinearMeasurePenaltySingle;
    static getVisualBoundsPenalty(state: Readonly<NodeState>, spec?: FrustumSpec): number;
    static getVisualMeasurePenalty(valueDegrees: number, spec: VisualMeasureSpec | undefined, rangeDegrees: number, nearMeters: number): number;
    private static _getVisualMeasurePenaltySingle;
    static getMetersFromLinearMeasure(measure: LinearMeasure, rangeMeters: number): number;
    static getDegreesFromVisualMeasure(measure: VisualMeasure, rangeDegrees: number, nearMeters: number): number;
    constructor(adapter: SpatialAdapter<any>);
    /**
     * The constraints applied to this layout
     */
    constraints: LayoutConstraint[];
    /**
     * The objectives applied to this layout
     */
    objectives: LayoutObjective[];
    /**
     * Clear all of the default constraints
     */
    /**
     * The parent node
     * If `undefined`, target parent is the current parent
     * if `null`, this node is considered as flagged to be removed
     */
    parentNode?: Node3D | null;
    /**
     *
     */
    /**
     *
     */
    /**
     * The content aspect constraint
     */
    aspect?: "preserve-3d" | "preserve-2d" | "any" | undefined;
    aspectConstraint: LayoutConstraint;
    private _aspect;
    /**
     * The local orientation constraint spec
     */
    orientation?: QuaternionSpec;
    orientationConstraint: LayoutConstraint;
    /**
     * The local position constraint spec (local units are ambigious).
     * Copies on assignment
     */
    position?: Vector3Spec;
    positionConstraint: LayoutConstraint;
    /**
     * The local scale constraint spec
     */
    scale?: Vector3Spec;
    scaleConstraint: LayoutConstraint;
    local: BoundsSpec;
    localConstraint: LayoutConstraint;
    /** The visual bounds spec */
    visual: FrustumSpec;
    visualConstraint: LayoutConstraint;
    /**
     * Occluders to minimize visual overlap with
     */
    occluders?: Node3D[];
    /** */
    maximizeVisual: boolean;
    maximizeVisualObjective: LayoutObjective;
    private _pullCenter;
    private _pullRay;
    /** */
    pullLocalObjective: LayoutObjective;
    pullVisualObjective: LayoutObjective;
    /**
     * Add a new layout constraint
     */
    addConstraint(name: string, evaluate: ScoreFunction, opts?: {
        relativeTolerance?: number;
        absoluteTolerance?: number;
        threshold?: number;
    }): LayoutConstraint;
    /**
     * Add a new layout objective
     */
    addObjective(name: string, evaluate: ScoreFunction, opts?: {
        relativeTolerance?: number;
        absoluteTolerance?: number;
    }): LayoutObjective;
    /**
     * The solutions being explored for this layout
     */
    get solutions(): LayoutSolution[];
    /**
     * Transition overrides for this layout
     */
    transition: TransitionConfig;
    /**
     * The current optimization iteration
     */
    iteration: number;
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
export interface LayoutObjective {
    name?: string;
    evaluate: ScoreFunction;
    relativeTolerance?: number;
    absoluteTolerance?: number;
    bestScore?: number;
}
export interface LayoutConstraint extends LayoutObjective {
    threshold?: number;
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
    get boundsPenalty(): number;
    /**
     * The constraint violation penalties for this solution
     * (one for each constraint, lower is better)
     */
    constraintScores: number[];
    /**
     * The objectives fitness scores for this solution
     * (one for each objective, higher is better)
     */
    objectiveScores: number[];
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
    private _perturbFromLinearMeasureSpec;
    static generatePulseFrequency(min: number, max: number): number;
    private static _mutateCorner;
}
export {};
