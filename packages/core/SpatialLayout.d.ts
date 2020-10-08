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
    percent: number;
    degrees: number;
    radians: number;
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
    diagonalLength?: LinearMeasureSpec;
    centerX?: LinearMeasureSpec;
    centerY?: LinearMeasureSpec;
    centerZ?: LinearMeasureSpec;
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
    diagonalLength?: VisualMeasureSpec;
    depth?: LinearMeasureSpec;
    centerX?: VisualMeasureSpec;
    centerY?: VisualMeasureSpec;
    centerZ?: LinearMeasureSpec;
    angleToCenter?: VisualMeasureSpec;
    angleToClosestCorner?: VisualMeasureSpec;
    angleToFurthestCorner?: VisualMeasureSpec;
}
export declare type PullSpec = AtLeastOneProperty<{
    direction: AtLeastOneProperty<{
        x: number;
        y: number;
        z: number;
    }>;
    center: AtLeastOneProperty<{
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
    constructor();
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
    local: BoundsSpec;
    localConstraint: LayoutConstraint;
    /** The visual bounds spec */
    visual: FrustumSpec;
    visualConstraint: LayoutConstraint;
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
    /**
     * Pull influence
     */
    pull?: PullSpec;
    /**
     * Visual-space pull influence
     */
    visualPull?: PullSpec;
    /**
     * Occluders to minimize visual overlap with
     */
    occluders?: Node3D[];
    /** */
    visualMaximize: boolean;
    visualMaximizeObjective: LayoutObjective;
    /**
     * Add a new layout constraint
     */
    private _addConstraint;
    /**
     * Add a new layout objective
     */
    private _addObjective;
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
}
export interface LayoutObjective {
    score: ScoreFunction;
    relativeTolerance?: number;
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
    /**
     * The adapter associated with this solution
     */
    adapter: SpatialAdapter<any>;
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
