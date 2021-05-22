import { Vector3, Quaternion } from './math-utils';
import { SpatialLayout } from './SpatialLayout';
export declare type OneOrMany<T> = T | T[];
export declare type DiscreteOrContinuous<T> = T | {
    gt: T;
    lt: T;
} | {
    gt: T;
} | {
    lt: T;
};
export declare type ConstraintSpec<T = string> = DiscreteOrContinuous<T>;
export declare type NumberConstraintSpec = ConstraintSpec<string | number>;
export declare type AtLeastOneProperty<T, U = {
    [K in keyof T]: Pick<T, K>;
}> = Partial<T> & U[keyof U];
export declare type Vector3Spec = AtLeastOneProperty<{
    x: NumberConstraintSpec;
    y: NumberConstraintSpec;
    z: NumberConstraintSpec;
    magnitude: NumberConstraintSpec;
}>;
export declare type QuaternionSpec = OneOrMany<{
    x: number;
    y: number;
    z: number;
    w: number;
} | AtLeastOneProperty<{
    swingRange: {
        x: string;
        y: string;
    };
    twistRange: string;
}>>;
export interface ObjectiveOptions {
    relativeTolerance?: number | (() => number);
    absoluteTolerance?: number | (() => number);
}
export declare type BoundsMeasureType = 'spatial' | 'visual' | 'view';
export declare type BoundsMeasureSubType = 'left' | 'bottom' | 'top' | 'right' | 'front' | 'back' | 'sizex' | 'sizey' | 'sizez' | 'sizediagonal' | 'centerx' | 'centery' | 'centerz' | 'centerdistance';
export declare type DiscreteSpec<T> = Exclude<T, any[] | undefined | Partial<{
    gt: any;
    lt: any;
}>>;
export declare type ContinuousSpec<T> = T extends any[] | undefined ? never : T extends {
    gt: any;
    lt: any;
} ? T : never;
export declare abstract class SpatialObjective {
    static isDiscreteSpec<T>(s: T): s is DiscreteSpec<T>;
    static isContinuousSpec<T>(s: T): s is ContinuousSpec<T>;
    type: keyof typeof SpatialLayout.prototype.absoluteTolerance;
    sortBlame: number;
    get bestScore(): number;
    relativeTolerance?: number;
    absoluteTolerance?: number | string;
    priority: number;
    index: number;
    get computedRelativeTolerance(): number;
    get computedAbsoluteTolerance(): number;
    layout: SpatialLayout;
    constructor(layout: SpatialLayout);
    abstract evaluate(): number;
    protected reduceFromOneOrManySpec: <V, S>(value: V, spec: S | S[] | undefined, applyFn: (value: V, spec: S) => number) => number;
    protected getNumberScore(value: number, spec: OneOrMany<NumberConstraintSpec>): number;
    private _getNumberScoreSingle;
    protected getVector3Score(value: Vector3, spec: OneOrMany<Vector3Spec> | undefined): number;
    private _getVector3ScoreSingle;
    protected getQuaternionScore(value: Quaternion, spec: OneOrMany<QuaternionSpec> | undefined): number;
    private _quat;
    private _euler;
    private _getQuaternionScoreSingle;
    protected getBoundsScore(spec: SpatialBoundsSpec | undefined, boundsType: BoundsMeasureType): number;
    protected getBoundsMeasureScore(spec: OneOrMany<NumberConstraintSpec> | undefined, type: BoundsMeasureType, subType: BoundsMeasureSubType): number;
    private _getBoundsMeasureScoreSingle;
    /**  Attenuate visual score when out of view */
    protected attenuateVisualScore(score: number): number;
}
export declare class RelativeOrientationConstraint extends SpatialObjective {
    spec?: QuaternionSpec;
    constructor(layout: SpatialLayout);
    evaluate(): number;
}
export declare class WorldScaleConstraint extends SpatialObjective {
    spec?: Vector3Spec;
    constructor(layout: SpatialLayout);
    evaluate(): number;
}
export declare class AspectConstraint extends SpatialObjective {
    mode: "xyz" | "xy";
    private _scale;
    constructor(layout: SpatialLayout);
    evaluate(): number;
}
export interface SpatialBoundsSpec {
    /** meters */ left?: OneOrMany<ConstraintSpec>;
    /** meters */ bottom?: OneOrMany<ConstraintSpec>;
    /** meters */ right?: OneOrMany<ConstraintSpec>;
    /** meters */ top?: OneOrMany<ConstraintSpec>;
    /** meters */ front?: OneOrMany<ConstraintSpec>;
    /** meters */ back?: OneOrMany<ConstraintSpec>;
    size?: {
        /** meters */ x?: OneOrMany<NumberConstraintSpec>;
        /** meters */ y?: OneOrMany<NumberConstraintSpec>;
        /** meters */ z?: OneOrMany<NumberConstraintSpec>;
        /** meters */ diagonal?: OneOrMany<ConstraintSpec>;
    };
    center?: {
        /** meters */ x?: OneOrMany<NumberConstraintSpec>;
        /** meters */ y?: OneOrMany<NumberConstraintSpec>;
        /** meters */ z?: OneOrMany<NumberConstraintSpec>;
        /** meters */ distance?: OneOrMany<ConstraintSpec>;
    };
}
export declare class SpatialBoundsConstraint extends SpatialObjective {
    spec?: SpatialBoundsSpec;
    constructor(layout: SpatialLayout);
    evaluate(): number;
}
export interface VisualBoundsSpec {
    absolute?: {
        /** pixels */ left?: OneOrMany<ConstraintSpec>;
        /** pixels */ bottom?: OneOrMany<ConstraintSpec>;
        /** pixels */ right?: OneOrMany<ConstraintSpec>;
        /** pixels */ top?: OneOrMany<ConstraintSpec>;
        /** meters */ front?: OneOrMany<ConstraintSpec>;
        /** meters */ back?: OneOrMany<ConstraintSpec>;
        center?: {
            /** pixels */ x?: OneOrMany<ConstraintSpec>;
            /** pixels */ y?: OneOrMany<ConstraintSpec>;
            /** meters */ z?: OneOrMany<ConstraintSpec>;
        };
    };
    /** pixels */ left?: OneOrMany<ConstraintSpec>;
    /** pixels */ bottom?: OneOrMany<ConstraintSpec>;
    /** pixels */ right?: OneOrMany<ConstraintSpec>;
    /** pixels */ top?: OneOrMany<ConstraintSpec>;
    /** meters */ front?: OneOrMany<ConstraintSpec>;
    /** meters */ back?: OneOrMany<ConstraintSpec>;
    center?: {
        /** pixels */ x?: OneOrMany<NumberConstraintSpec>;
        /** pixels */ y?: OneOrMany<NumberConstraintSpec>;
        /** meters */ z?: OneOrMany<ConstraintSpec>;
        /** pixels */ distance?: OneOrMany<ConstraintSpec>;
    };
    size?: {
        /** pixels */ x?: OneOrMany<ConstraintSpec>;
        /** pixels */ y?: OneOrMany<ConstraintSpec>;
        /** meters */ z?: OneOrMany<ConstraintSpec>;
        /** pixels */ diagonal?: OneOrMany<ConstraintSpec>;
    };
}
export declare class VisualBoundsConstraint extends SpatialObjective {
    spec?: VisualBoundsSpec;
    constructor(layout: SpatialLayout);
    evaluate(): number;
}
export declare class VisualMaximizeObjective extends SpatialObjective {
    constructor(layout: SpatialLayout);
    minAreaPercent: number;
    evaluate(): number;
}
export declare class MagnetizeObjective extends SpatialObjective {
    constructor(layout: SpatialLayout);
    evaluate(): number;
}
export declare class MaximizeTemporalCoherenceObjective extends SpatialObjective {
    constructor(layout: SpatialLayout);
    evaluate(): number;
}
export declare class MinimizeOcclusionObjective extends SpatialObjective {
    constructor(layout: SpatialLayout);
    evaluate(): number;
}
