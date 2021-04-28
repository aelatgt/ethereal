import { Vector2, Matrix4, Box3 } from './math-utils';
export declare class LayoutFrustum {
    private _cache;
    isLayoutFrustum: boolean;
    get leftDegrees(): number;
    set leftDegrees(val: number);
    private _leftDegrees;
    get rightDegrees(): number;
    set rightDegrees(val: number);
    private _rightDegrees;
    get bottomDegrees(): number;
    set bottomDegrees(val: number);
    private _bottomDegrees;
    get topDegrees(): number;
    set topDegrees(val: number);
    private _topDegrees;
    get nearMeters(): number;
    set nearMeters(val: number);
    private _nearMeters;
    get farMeters(): number;
    set farMeters(val: number);
    private _farMeters;
    get sizeDegrees(): Vector2;
    private _size;
    /**
     * The diagonal size
     */
    get diagonalDegrees(): number;
    /**
     * The center position
     */
    get centerDegrees(): Vector2;
    private _center;
    /**
     * Angular distance to the frustum center
     * (origin is the forward viewing direction).
     * If greater than 90, the frustum is positioned
     * behind the viewer
     */
    get angleToCenter(): number;
    get angleToTopLeft(): number;
    get angleToTopRight(): number;
    get angleToBottomLeft(): number;
    get angleToBottomRight(): number;
    get angleToClosestPoint(): number;
    get angleToFarthestPoint(): number;
    /**
     * Linear depth (meters)
     */
    get depth(): number;
    /**
     * Linear distance (meters) to the frustum center
     * (origin is the viewer position).
     */
    get distance(): number;
    get aspectRatio(): number;
    private _v1;
    private _inverseProjection;
    private _forwardDirection;
    private _fullNDC;
    setFromPerspectiveProjectionMatrix(projectionMatrix: Matrix4, ndcBounds?: Box3): this;
    get perspectiveProjectionMatrix(): Matrix4;
    private _cachedPerspectiveProjectionMatrix;
    private _perspective;
    overlapPercent(f: LayoutFrustum): number;
    private _boxA;
    private _boxB;
    private _overlapSize;
}
