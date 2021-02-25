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
export declare type QuaternionSpec = {
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
    degrees?: ConstraintSpec;
} | {
    twistSwing: AtLeastOneProperty<{
        horizontal: ConstraintSpec;
        vertical: ConstraintSpec;
        twist: ConstraintSpec;
    }>;
} | {
    swingTwist: AtLeastOneProperty<{
        horizontal: ConstraintSpec;
        vertical: ConstraintSpec;
        twist: ConstraintSpec;
    }>;
};
export interface ObjectiveOptions {
    relativeTolerance?: number;
    absoluteTolerance?: number;
}
export declare type BoundsMeasureType = 'spatial' | 'visual' | 'view';
export declare type BoundsMeasureSubType = 'left' | 'bottom' | 'top' | 'right' | 'front' | 'back' | 'sizex' | 'sizey' | 'sizez' | 'sizediagonal' | 'centerx' | 'centery' | 'centerz';
declare type ConstraintMode = 'absolute' | 'relative';
export declare type DiscreteSpec<T> = Exclude<T, any[] | undefined | Partial<{
    gt: any;
    lt: any;
}>>;
export declare type ContinuousSpec<T> = T extends any[] | undefined ? never : T extends {
    gt: any;
    lt: any;
} ? T : never;
export declare abstract class SpatialObjective {
    layout: SpatialLayout;
    static isDiscreteSpec<T>(s: T): s is DiscreteSpec<T>;
    static isContinuousSpec<T>(s: T): s is ContinuousSpec<T>;
    relativeTolerance?: number;
    absoluteTolerance?: number;
    bestScore: number;
    sortBlame: number;
    constructor(layout: SpatialLayout);
    abstract evaluate(): number;
    protected reduceFromOneOrManySpec: <V, S>(value: V, spec: S | S[] | undefined, mode: ConstraintMode, accuracy: number, applyFn: (value: V, spec: S, mode: ConstraintMode, accuracy: number) => number) => number;
    protected getNumberScore(value: number, spec: OneOrMany<NumberConstraintSpec>, mode: ConstraintMode, accuracy: number): number;
    private _getNumberScoreSingle;
    protected getVector3Score(value: Vector3, spec: OneOrMany<Vector3Spec> | undefined, mode: ConstraintMode, accuracy: number): number;
    private _getVector3ScoreSingle;
    protected getQuaternionScore(value: Quaternion, spec: OneOrMany<QuaternionSpec> | undefined, mode: ConstraintMode, accuracy: number): number;
    private _getQuaternionScoreSingle;
    protected getBoundsScore(spec: SpatialBoundsSpec | undefined, type: BoundsMeasureType): number;
    protected getBoundsMeasureScore(spec: ConstraintSpec | undefined, type: BoundsMeasureType, subType: BoundsMeasureSubType): number;
    private _getMeasurePenaltySingle;
    /**  Attenuate visual score when out of view */
    protected attenuateVisualScore(score: number): number;
}
export declare class LocalPositionConstraint extends SpatialObjective {
    spec?: Vector3Spec;
    evaluate(): number;
}
export declare class LocalOrientationConstraint extends SpatialObjective {
    spec?: QuaternionSpec;
    evaluate(): number;
}
export declare class LocalScaleConstraint extends SpatialObjective {
    spec?: Vector3Spec;
    evaluate(): number;
}
export declare class AspectConstraint extends SpatialObjective {
    mode: "spatial" | "visual";
    private _scale;
    evaluate(): number;
}
export interface SpatialBoundsSpec {
    /** meters */ left?: ConstraintSpec;
    /** meters */ bottom?: ConstraintSpec;
    /** meters */ right?: ConstraintSpec;
    /** meters */ top?: ConstraintSpec;
    /** meters */ front?: ConstraintSpec;
    /** meters */ back?: ConstraintSpec;
    size?: {
        /** meters */ x?: ConstraintSpec;
        /** meters */ y?: ConstraintSpec;
        /** meters */ z?: ConstraintSpec;
        /** meters */ diagonal?: ConstraintSpec;
    };
    center?: {
        /** meters */ x?: ConstraintSpec;
        /** meters */ y?: ConstraintSpec;
        /** meters */ z?: ConstraintSpec;
    };
}
export declare class SpatialBoundsConstraint extends SpatialObjective {
    spec?: SpatialBoundsSpec;
    evaluate(): number;
}
export interface VisualBoundsSpec {
    absolute?: {
        /** pixels */ left?: ConstraintSpec;
        /** pixels */ bottom?: ConstraintSpec;
        /** pixels */ right?: ConstraintSpec;
        /** pixels */ top?: ConstraintSpec;
        /** meters */ front?: ConstraintSpec;
        /** meters */ back?: ConstraintSpec;
        center?: {
            /** pixels */ x?: ConstraintSpec;
            /** pixels */ y?: ConstraintSpec;
            /** meters */ z?: ConstraintSpec;
        };
    };
    /** pixels */ left?: ConstraintSpec;
    /** pixels */ bottom?: ConstraintSpec;
    /** pixels */ right?: ConstraintSpec;
    /** pixels */ top?: ConstraintSpec;
    /** meters */ front?: ConstraintSpec;
    /** meters */ back?: ConstraintSpec;
    center?: {
        /** pixels */ x?: ConstraintSpec;
        /** pixels */ y?: ConstraintSpec;
        /** meters */ z?: ConstraintSpec;
    };
    size?: {
        /** pixels */ x?: ConstraintSpec;
        /** pixels */ y?: ConstraintSpec;
        /** meters */ z?: ConstraintSpec;
        /** pixels */ diagonal?: ConstraintSpec;
    };
}
export declare class VisualBoundsConstraint extends SpatialObjective {
    spec?: VisualBoundsSpec;
    evaluate(): number;
}
export declare class VisualMaximizeObjective extends SpatialObjective {
    evaluate(): number;
}
export declare class VisualForceObjective extends SpatialObjective {
    evaluate(): number;
}
export {};
