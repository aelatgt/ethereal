import * as THREE from 'three';
export declare class SimplifiedHull {
    static hulls: WeakMap<THREE.Geometry | THREE.BufferGeometry, THREE.Geometry | undefined>;
    static compute(geometry: THREE.Geometry | THREE.BufferGeometry, maxPoints?: number): THREE.Geometry;
    static get(geometry: THREE.Geometry | THREE.BufferGeometry): THREE.Geometry | THREE.BufferGeometry;
}
export declare class Box3 extends THREE.Box3 {
    objectFilter?: ((o: THREE.Object3D) => boolean) | undefined;
    objectExpansion: "geometry" | "hull" | "box";
    coordinateSystem: THREE.Object3D | undefined;
    private _objectExpandFunction;
    private _onObjectTraverse;
    setFromObject(object: THREE.Object3D): this;
    private _vector;
    private _mat4;
    expandByObjectGeometry(node: THREE.Object3D): this;
    expandByObjectHull(node: THREE.Object3D): this;
    private _box;
    expandByObjectBox(node: THREE.Object3D): this;
    private _getCoordinateSystemTransform;
    private _center;
    private _size;
    relativeToAbsolute(relativePosition: THREE.Vector3, out?: THREE.Vector3): THREE.Vector3;
    absoluteToRelative(absolutePosition: THREE.Vector3, out?: THREE.Vector3): THREE.Vector3;
    isEmpty(): boolean;
}
/**
 * A visual viewing frustum, with angles specified in DEGREES
 */
export declare class VisualFrustum {
    coordinateSystem: THREE.Object3D;
    objectFilter?: ((o: THREE.Object3D) => boolean) | undefined;
    objectExpansion: "geometry" | "hull" | "box";
    private _objectExpandFunction;
    min: THREE.Vector3;
    max: THREE.Vector3;
    minClamped: THREE.Vector3;
    maxClamped: THREE.Vector3;
    minClamp?: THREE.Vector3;
    maxClamp?: THREE.Vector3;
    constructor(coordinateSystem: THREE.Object3D);
    get left(): number;
    get leftClamped(): number;
    get top(): number;
    get topClamped(): number;
    get right(): number;
    get rightClamped(): number;
    get bottom(): number;
    get bottomClamped(): number;
    get near(): number;
    get nearClamped(): number;
    get far(): number;
    get farClamped(): number;
    get horizontal(): number;
    get horizontalClamped(): number;
    get vertical(): number;
    get verticalClamped(): number;
    get depth(): number;
    get depthClamped(): number;
    get diagonal(): number;
    get diagonalClamped(): number;
    isEmpty(): boolean;
    getCenter(out: THREE.Vector3): THREE.Vector3;
    getClampedCenter(out: THREE.Vector3): THREE.Vector3;
    getSize(out: THREE.Vector3): THREE.Vector3;
    getClampedSize(out: THREE.Vector3): THREE.Vector3;
    getPositionForOffset(offset: THREE.Vector3, out: THREE.Vector3): THREE.Vector3;
    getClampedPositionForOffset(offset: THREE.Vector3, out: THREE.Vector3): THREE.Vector3;
    setFromPerspectiveProjectionMatrix(projectionMatrix: THREE.Matrix4): void;
    makeEmpty(): void;
    setFromObject(object: THREE.Object3D): this;
    private _onObjectTraverse;
    private _vec3;
    private _mat4;
    private expandByObjectHull;
    private _boxPoints;
    expandByObjectBox(node: THREE.Object3D): this | undefined;
    private _applyClamping;
}
/**
 * Calculate spatial metrics between a primary object and a target object.
 *
 * The results are always in one of two *local* coordinate systems:
 * `object-space` -
 *      Local *cartesian* coordinate system [X,Y,Z]. By convention, this local coordinate system is
 *      interpreted in two different ways, depending on whether or not the object is a camera:
 *          Typical objects: [+X = left, +Y = up, +Z = forward]
 *          Camera objects: [+X = right, +Y = up, -Z = forward]
 * `visual-space` -
 *      Local *spherical* coordinate system [azimuth, elevation, distance], where:
 *          `azimuth` (-180 to 180 DEGREES) an angle around the horizontal plane
 *              (increasing from left to right, with 0deg being aligned with this object's natural `forward` vector)
 *          `elevation` (-90 to 90 DEGREES ) an angle above or below the horizontal plane
 *              (increases from below to above, with 0deg at the horizon)
 *          `distance` is distance along the direction defined by the azimuth and elevation
 *      Unlike object-space, visual-space is consistent for camera and non-camera objects.
 */
export declare class SpatialMetrics {
    object: THREE.Object3D;
    matrixWorldGetter: "current" | "target";
    private static _metrics;
    static objectFilter: (o: THREE.Object3D) => boolean;
    static get(o: THREE.Object3D): SpatialMetrics;
    static getCartesianForSphericalDirection(sphericalDirection: THREE.Vector2 | THREE.Vector3, out: THREE.Vector3): THREE.Vector3;
    static getSphericalDirectionForCartesian(cartesian: THREE.Vector3, out: THREE.Vector2): THREE.Vector2;
    static getSphericalPositionForCartesian(cartesian: THREE.Vector3, out: THREE.Vector3): THREE.Vector3;
    static getCartesianForSphericalPosition(sphericalPosition: THREE.Vector3, out: THREE.Vector3): THREE.Vector3;
    private constructor();
    private getMatrixWorld;
    getCartesianForVisualDirection(visualDirection: THREE.Vector2, out: THREE.Vector3): THREE.Vector3;
    getVisualDirectionForCartesian(cartesian: THREE.Vector3, out: THREE.Vector2): THREE.Vector2;
    getVisualPositionForCartesianPosition(cartesianPosition: THREE.Vector3, out: THREE.Vector3): THREE.Vector3;
    getCartesianForVisualPosition(visualPosition: THREE.Vector3, out: THREE.Vector3): THREE.Vector3;
    /**
     * Calculate the local position of target in `object space`
     */
    getPositionOf(target: THREE.Object3D, out: THREE.Vector3): THREE.Vector3;
    /**
     * Calculate the local distance of the target object
     * (Note: this is the same for both `object-space` and `visual-space`)
     */
    getDistanceOf(target: THREE.Object3D): number;
    /**
     * Calculate the local direction of the target object in `object-space`
     *
     * Remember, by convention:
     *     Normal objects: [+X = left, +Y = up, +Z = forward]
     *     Camera objects: [+X = right, +Y = up, -Z = forward]
     * Special Case: if both objects are at the same *exact* position,
     *      the result is a `forward` vector ([0,0,-1] for cameras, [0,0,1] for other objects)
     */
    getDirectionOf(target: THREE.Object3D, out: THREE.Vector3): THREE.Vector3;
    /**
     * Get the world direction of the target object.
     *
     * Special Case: if both objects are at the same *exact* position,
     *      the result is a `forward` vector ([0,0,-1] for cameras, [0,0,1] for other objects),
     *      transformed into world coordinates
     */
    getWorldDirectionOf(target: THREE.Object3D, out: THREE.Vector3): THREE.Vector3;
    getClosestOrthogonalOrientationOf(target: THREE.Object3D, out: THREE.Quaternion): void;
    /**
     * Set a position for the *target object*,
     * based on the visual-space of *this object*.
     *
     * If the object has no bounding sphere, or if a visualSize is not specified,
     * then the current distance will be assumed.
     *
     * @param target
     * @param visualDirection the desired visual direction to the target
     * @param visualSize the desired visual size of the target (in DEGREES)
     * @param alpha a linear interpolation value (default is 1)
     */
    /**
     * Set a new scale for the target that
     * would make it have the desired visual size
     * in this object's `visual-space`.
     *
     * @param target
     * @param visualSize the desired visual size of the target (in DEGREES)
     * @param alpha a linear interpolation value (default is 1)
     */
    getOrientationOf(target: THREE.Object3D, out: THREE.Quaternion): THREE.Quaternion;
    /**
     * Calculate the visual direction towards the target object.
     * Assumes that a normal object faces +Z, and a camera faces -Z.
     *
     * If pointing directly towards the target object, the direction is [0,0] (forward)
     * If pointing directly opposite of the target object, the direction is [0,-180] (backwards)
     * Special Case: if both are at the same exact position, the direction is [0,0] (forward)
     */
    getVisualDirectionOf(target: THREE.Object3D, out: THREE.Vector2): THREE.Vector2;
    /**
     * Calculate the visual angle towards the target object.
     * Assumes that a normal object faces +Z, and a camera faces -Z.
     *
     * If the target object is to the right of the forward vector, the angle is 0
     * If the target object is above the forward vector, the angle is 90
     * If the target object is to the left of the forward vector, then angle is 180
     * If the target object is below the forward vector, the angle is 270
     * If pointing directly towards the target object, the angle is 90 (up)
     * If pointing directly opposite of the target object, the direction is [0,-180] (backwards)
     * Special Case: if both are at the same exact position, the direction is [0,0] (forward)
     */
    getVisualAngleOf(target: THREE.Object3D, out: THREE.Vector2): THREE.Vector2;
    /**
     * Calculate the bounds of the target object, in the local `object-space` coordinate system.
     * @param target
     * @param out
     */
    getBoundsOf(target: THREE.Object3D, out?: Box3): Box3;
    private _box;
    private _visualFrustum;
    getVisualFrustumOf(target?: THREE.Object3D, out?: VisualFrustum): VisualFrustum;
    /**
     * Calculate the angular offset (in DEGREES) between this object's forward vector,
     * and the direction towards the target object (as calculated by getDirectionOf).
     * Assumes that a normal object faces +Z, and a camera faces -Z.
     *
     * If pointing directly towards the target object, the visual offset is 0
     * If pointing directly opposite of the target object, the visual offset is 180
     * Special Case: if both are at the same position, the visual offset is 180
     */
    getVisualOffsetOf(target: THREE.Object3D): number;
}
