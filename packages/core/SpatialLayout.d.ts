/// <reference types="mathjs" />
import { Node3D } from './EtherealSystem';
import { Vector3, Quaternion, Box3 } from './math-utils';
import { TransitionConfig } from './Transitionable';
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
export declare type NumberSpec = OneOrMany<DiscreteOrContinuous<string | number>>;
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
    degrees?: AngularMeasureSpec;
} | {
    twistSwing: AtLeastOneProperty<{
        horizontal: AngularMeasureSpec;
        vertical: AngularMeasureSpec;
        twist: AngularMeasureSpec;
    }>;
} | {
    swingTwist: AtLeastOneProperty<{
        horizontal: AngularMeasureSpec;
        vertical: AngularMeasureSpec;
        twist: AngularMeasureSpec;
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
/**
 * Generic measure spec, generally a unitless value.
 */
export declare type MeasureSpec = OneOrMany<DiscreteOrContinuous<string>>;
/**
 * Linear spec should be convertable to meters.
 *
 * Units allowed: any standard length unit.
 * Additionally, percent (%) can be used,
 * which is based on the bounding context's size.
 */
export declare type LinearMeasureSpec = MeasureSpec;
/**
 * Visual spec should be convertable to pixels.
 * Units allowed: px, vw, vh, %
 */
export declare type VisualMeasureSpec = MeasureSpec;
/**
 * Angular spec should be convertable to rotations.
 *
 * Units allowed: deg, rad, rot
 */
export declare type AngularMeasureSpec = MeasureSpec;
export declare type LayoutMeasureType = 'local' | 'visual' | 'view';
export declare type LayoutMeasureSubType = 'left' | 'bottom' | 'top' | 'right' | 'front' | 'back' | 'width' | 'height' | 'depth' | 'diagonal' | 'centerX' | 'centerY' | 'centerZ';
export declare class BoundsSpec {
    left?: LinearMeasureSpec;
    bottom?: LinearMeasureSpec;
    right?: LinearMeasureSpec;
    top?: LinearMeasureSpec;
    front?: LinearMeasureSpec;
    back?: LinearMeasureSpec;
    width?: LinearMeasureSpec;
    height?: LinearMeasureSpec;
    depth?: LinearMeasureSpec;
    diagonal?: LinearMeasureSpec;
    centerX?: LinearMeasureSpec;
    centerY?: LinearMeasureSpec;
    centerZ?: LinearMeasureSpec;
    pull?: PullSpec;
}
export declare class VisualSpec {
    left?: VisualMeasureSpec;
    bottom?: VisualMeasureSpec;
    right?: VisualMeasureSpec;
    top?: VisualMeasureSpec;
    front?: LinearMeasureSpec;
    back?: LinearMeasureSpec;
    width?: VisualMeasureSpec;
    height?: VisualMeasureSpec;
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
export declare type ScoreFunction = () => number;
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
    static compiledExpressions: Map<string, import("mathjs").EvalFunction>;
    static isDiscreteSpec<T>(s: T): s is DiscreteSpec<T>;
    static isContinuousSpec<T>(s: T): s is ContinuousSpec<T>;
    constructor(adapter: SpatialAdapter<any>);
    getNumberPenalty(value: number, spec?: NumberSpec): number;
    private _getNumberPenaltySingle;
    getVector3Penalty(value: Vector3, spec?: Vector3Spec, epsillon?: number): number;
    private _getVector3PenaltySingle;
    getQuaternionPenalty(value: Quaternion, spec?: QuaternionSpec, epsillon?: number): number;
    private _getQuaternionPenaltySingle;
    getBoundsPenalty(spec: BoundsSpec | undefined, type: LayoutMeasureType): number;
    getNearFarPenalty(viewSpec: VisualSpec, visualSpec: VisualSpec): number;
    getBoundsMeasurePenalty(spec: MeasureSpec | undefined, type: LayoutMeasureType, subType: LayoutMeasureSubType): number;
    private _getMeasurePenaltySingle;
    measureNumber(measure: string | number): number;
    measureLayout(measure: string, type: LayoutMeasureType, sType: LayoutMeasureSubType): number;
    measureCache: Map<string, number>;
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
    * The aspect constraint specification
    */
    aspect?: "preserve-3d" | "preserve-2d" | "any" | undefined;
    /**
     * Measures distance from normalized world scale
     * (1,1,1) or (1,1,any)
     */
    aspectConstraint: LayoutConstraint;
    private _aspect;
    /**
     * The local orientation constraint spec
     */
    orientation?: QuaternionSpec;
    /**
     * Measures angle (in degrees) to orientation spec
     */
    orientationConstraint: LayoutConstraint;
    /**
     * The local position constraint spec
     * (local units are ambigious due to potential parent scaling).
     */
    position?: Vector3Spec;
    /**
     * Measures distance from position spec
     */
    positionConstraint: LayoutConstraint;
    /**
     * The local scale constraint spec
     */
    scale?: Vector3Spec;
    /**
     * Measures distance from scale spec
     */
    scaleConstraint: LayoutConstraint;
    /**
     * The local bounds spec
     */
    local: BoundsSpec;
    /**
     * Measures distance from local bounds spec
     */
    localConstraint: LayoutConstraint;
    /**
     * The local visual bounds (specified relative to
     * the closest visual bounding context)
     * */
    visual: VisualSpec;
    view: VisualSpec;
    /**
     * Measure near/far distance (in meter) from visual bounds spec
     */
    nearFarConstraint: LayoutConstraint;
    /**
     * Computes pixel-based penalty from view bounds spec
     */
    viewBoundsConstraint: LayoutConstraint;
    /**
     * Computes pixel-based penalty from visual bounds spec
     */
    visualBoundsConstraint: LayoutConstraint;
    private _pullCenter;
    private _pullRay;
    private _pullClosestPoint;
    private _pullDirection;
    /**
     * Measures negative distance from pull position
    */
    pullLocalObjective: LayoutObjective;
    pullVisualObjective: LayoutObjective;
    /** */
    maximizeVisual: boolean;
    /** */
    maximizeVisualObjective: LayoutObjective;
    /**
     * Occluders to minimize visual overlap with
     */
    occluders?: Node3D[];
    /**
     * Add a new layout constraint
     */
    addConstraint(opts: {
        name: string;
        evaluate: ScoreFunction;
        threshold: number;
        relativeTolerance?: number;
    }): LayoutConstraint;
    /**
     * Add a new layout objective
     */
    addObjective(opts: {
        name: string;
        evaluate: ScoreFunction;
        relativeTolerance?: number;
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
    sortBlame: number;
}
export interface LayoutConstraint extends LayoutObjective {
    threshold: number;
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
    /**
     * All constraints scores are within threshold
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
    private _perturbFromLinearMeasureSpec;
    static generatePulseFrequency(min: number, max: number): number;
    private static _mutateCorner;
}
export {};
