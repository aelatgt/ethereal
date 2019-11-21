import * as THREE from 'three';
import { Box3 } from '../metrics/SpatialMetrics';
export declare const LayoutFit: {
    contain: string;
    contain3d: string;
    cover: string;
    cover3d: string;
    fill: string;
    fill3d: string;
};
export declare type LayoutFitType = keyof typeof LayoutFit;
export declare type LayoutX = number | 'center' | 'left' | 'right';
export declare type LayoutY = number | 'center' | 'top' | 'bottom';
export declare type LayoutZ = number | 'center' | 'front' | 'back';
/**
 * Extend THREE.Object3D functionality with 3D layout functionality.
 *
 * Features include:
 *  - automatic bounds computation
 *  - modify alignment, origin, and size with respect to bounds and parent bounds
 *  - pose & layout transitions
 */
export declare class Layout {
    object: THREE.Object3D;
    /**
     * Force local layout bounds to be excluded from the parent bounding context
     * (effectively, forces a new bounding context)
     */
    forceBoundsExclusion: boolean;
    /**
     * Specifies the degree to which the layout properties (`absolute`, and `relative`) influence
     * the final transform. At 0, the layout properties have no effect. At 1, they have
     * their full intended effect.
     */
    weight: number;
    /**
     * Specify absolute layout bounds. A mininum or maximum boundary
     * can be set to `NaN` in any dimension to remain unspecified.
     *
     * Note: any specified `relative` and `absolute` bounds
     * are combined to determine `computedBounds`
     */
    absolute: Box3;
    /**
     * Specify relative layout bounds, with -0.5 to 0.5 spanning the
     * range of `computedOuterBounds` for each dimension. A mininum or
     * maximum boundary can be set to `NaN` in any dimension to remain
     * unspecified.
     *
     * Note: any specified `relative` and `absolute` bounds
     * are combined to determine `computedBounds`
     */
    relative: Box3;
    /**
     * Specify the orientation of the layout. Default is identity.
     */
    orientation: THREE.Quaternion;
    /**
     *
     */
    minRelativeSize: THREE.Vector3;
    /**
     *
     */
    minAbsoluteSize: THREE.Vector3;
    /**
     * Specifies how the object should fit within `absolute` and `relative` bounds,
     * which determines the `computedBounds`
    */
    set fit(fit: LayoutFitType);
    get fit(): LayoutFitType;
    private _fit;
    /** Used internally. */
    fitTargets: {
        contain: number;
        contain3d: number;
        cover: number;
        cover3d: number;
        fill: number;
        fill3d: number;
    };
    /**
     *
     */
    fitAlign: THREE.Vector3;
    clip: Box3;
    inner: Box3;
    innerAutoUpdate: boolean;
    computedBounds: Box3;
    computedInnerBounds: Box3;
    computedOuterBounds: Box3;
    computedClipBounds: Box3;
    matrix: THREE.Matrix4;
    private _boundsValid;
    constructor(object: THREE.Object3D);
    invalidateBounds(): void;
    resetLayout(): void;
    resetPose(): void;
    reset(): void;
    /**
     * If true, the layout properties are effectively noop
     */
    isPassive(): boolean;
    /**
     * If true, the `object` should not be included in the bounding calculation
     * for any parent layouts.
     */
    isBoundingContext(): boolean;
    updateMatrix(): void;
    static updateInnerBounds(o: THREE.Object3D): Box3;
    static updateOuterBounds(o: THREE.Object3D): Box3;
    static _fitScale: THREE.Vector3;
    static adjustScaleForFit(fitTargets: typeof Layout.prototype.fitTargets, sizeScale: THREE.Vector3): THREE.Vector3;
}
