import { Box3, Vector3, Quaternion, Matrix4 } from './math-utils';
import { EtherealLayoutSystem, Node3D } from './EtherealLayoutSystem';
declare const InternalRawState: unique symbol;
declare const InternalCurrentState: unique symbol;
declare const InternalTargetState: unique symbol;
declare const InternalPreviousTargetState: unique symbol;
export declare class NodeState<N extends Node3D = Node3D> {
    mode: 'current' | 'target';
    metrics: SpatialMetrics<N>;
    constructor(mode: 'current' | 'target', metrics: SpatialMetrics<N>);
    private _cache;
    invalidate(): void;
    get parent(): N | null;
    set parent(val: N | null);
    private _parent;
    get opacity(): number;
    get parentState(): NodeState<N> | undefined;
    get outerState(): NodeState<N> | undefined;
    private _cachedLocalMatrix;
    get localMatrix(): Matrix4;
    set localMatrix(val: Matrix4);
    private _localMatrix;
    private _localMatrixInverse;
    private _localPosition;
    private _localOrientation;
    private _localOrientationInverse;
    private _localScale;
    private _localRotation;
    private _localRotationInverse;
    get localMatrixInverse(): Matrix4;
    get localPosition(): Vector3;
    get localOrientation(): Quaternion;
    get localOrientationInverse(): Quaternion;
    get localScale(): Vector3;
    /**
     * Local rotation matrix
     */
    get localRotation(): Matrix4;
    /**
     * Local Orientation matrix inverse
     */
    get localRotationInverse(): Matrix4;
    private _cachedWorldMatrix;
    get worldMatrix(): Matrix4;
    private _worldPosition;
    private _worldOrientation;
    private _worldOrientationInverse;
    private _worldScale;
    private _worldMatrix;
    private _worldMatrixInverse;
    private _worldRotation;
    private _worldRotationInverse;
    get worldMatrixInverse(): Matrix4;
    get worldPosition(): Vector3;
    get worldOrientation(): Quaternion;
    get worldScale(): Vector3;
    /**
     * Inverse world orientation
     */
    get worldOrientationInverse(): Quaternion;
    /**
     * World rotation matrix
     */
    get worldRotation(): Matrix4;
    /**
     * World rotation matrix inverse
     */
    get worldRotationInverse(): Matrix4;
    /**
     * The inner bounds center in world coordinates
     */
    private _cachedWorldCenter;
    get worldCenter(): Vector3;
    private _worldCenter;
    /**
     * The outer origin in world coordinates
     */
    get worldOrigin(): Vector3;
    /**
     * The spatial frame (convert to world frame from spatial frame)
     */
    private _cachedSpatialMatrix;
    get spatialMatrix(): Matrix4;
    private _spatialMatrix;
    private _spatialMatrixInverse;
    private _localFromSpatial;
    private _spatialFromLocal;
    /**
     * Convert to spatial frame from world frame
     */
    get spatialMatrixInverse(): Matrix4;
    /**
     * Convert to local frame from spatial frame
     */
    get localFromSpatial(): Matrix4;
    /**
     * Convert to spatial frame from local frame
     */
    get spatialFromLocal(): Matrix4;
    /**
     * The spatial bounds
     */
    private _cachedSpatialBounds;
    get spatialBounds(): Box3;
    private _spatialBounds;
    private _spatialSize;
    private _spatialCenter;
    /**
     * The spatial size
     */
    get spatialSize(): Vector3;
    /**
     * The spatial center
     */
    get spatialCenter(): Vector3;
    /**
     * The first non-empty parent bounds, reoriented
     */
    private _cachedOuterBounds;
    get outerBounds(): Box3;
    private _outerBounds;
    private _outerCenter;
    private _outerSize;
    private _spatialFromOuter;
    /**
     *
     */
    get outerCenter(): Vector3;
    /**
     *
     */
    get outerSize(): Vector3;
    private get _viewState();
    /**
     * The view frame from local frame
     */
    get viewFromLocal(): Matrix4;
    private _viewFromLocal;
    /**
     * The view frame from spatial frame
     */
    get viewFromSpatial(): Matrix4;
    private _viewFromSpatial;
    /**
     * Convert to parent frame from spatial frame
     */
    get spatialFromView(): Matrix4;
    private _spatialFromView;
    /**
     * Normalized Device Coordinates
     */
    get ndcBounds(): Box3;
    private _cachedNDCBounds;
    private _viewProjectionFromLocal;
    private _ndcBounds;
    private _ndcCenter;
    private _ndcSize;
    get ndcCenter(): Vector3;
    get ndcSize(): Vector3;
    /**
     * The visual bounds of this node.
     *
     * Horizontal and vertical units are in pixels, with screen center at (0,0)
     * Z dimension is in meters
     */
    get visualBounds(): Box3;
    private _cachedVisualBounds;
    private _visualBounds;
    private _visualCenter;
    private _visualSize;
    private _v1;
    private _inverseProjection;
    get visualCenter(): Vector3;
    get visualSize(): Vector3;
    /**
     * The view position relative to this node state
     */
    get relativeViewPosition(): Vector3;
    private _viewPosition;
    /**
     * The local orthogonal (right-angled) orientation with the closest view orientation alignment
     */
    get viewAlignedOrientation(): Quaternion;
    private _cachedViewAlignedOrientation;
    private _relativeViewMatrix;
    private _relativeViewRotation;
    private _relativeViewOrientation;
    private _relativeViewUp;
    private _relativeViewForward;
    private _orthogonalRotation;
    private _orthogonalOrientation;
    private _computeOcclusion;
    private static _boxA;
    private static _boxB;
    private static _sizeA;
    private static _sizeB;
    /**
     * The percent of this node occluding another node
     */
    get occludingPercent(): number;
    private _occludingPercent;
    /**
     * The percent of this node occluded by another node
     */
    get occludedPercent(): number;
    private _occludedPercent;
    /**
     * Used as a heuristic for view-size maximization
     * (average edge length corresponds better with inncreasig visual area
     * compared to area of the projected bounding-box in
     * cases where the underlying aspect ratios are not fixed)
     */
    visualAverageEdgeLength(): void;
}
/**
 * Maintains current & target scenegraph state,
 * and efficiently/reactively compute spatial metrics
 * based on *target* (not current) scenegraph state.
 *
 * All metric values should be treated as read-only.
 */
export declare class SpatialMetrics<N extends Node3D = Node3D> {
    system: EtherealLayoutSystem<N>;
    node: N;
    constructor(system: EtherealLayoutSystem<N>, node: N);
    private _cache;
    needsUpdate: boolean;
    /**
     * Update metrics, if necessary
     */
    update(): void;
    private _cachedInnerBounds;
    private _childBounds;
    private _innerBounds;
    private _innerCenter;
    private _innerSize;
    /**
     * The bounds of this node and non-adaptive child nodes in the local coordinate system
     */
    get innerBounds(): Box3;
    get innerCenter(): Vector3;
    get innerSize(): Vector3;
    /**
     * The intrinsic bounds of the geometry attached directly to this node (excluding child nodes)
     */
    get intrinsicBounds(): Readonly<Box3>;
    private _intrinsicBoundsNeedsUpdate;
    private _intrinsicBounds;
    private _intrinsicCenter;
    private _intrinsicSize;
    get intrinsicCenter(): Vector3;
    get intrinsicSize(): Vector3;
    /**
     * Invalidate intrinsic bounds in order to allow it to be recomputed
     */
    invalidateIntrinsicBounds(): void;
    invalidateInnerBounds(): void;
    /**
     * Returns false if this node does not contain the passed node.
     * If the given node is a descendent of this node, returns
     * the closest child node.
     */
    containsNode(node: N): false | N;
    containedByNode(node: N): false | N;
    /**
     *
     */
    get nodeChildren(): N[];
    private _cachedNodeChildren;
    private _nodeChildren;
    /**
     * Compute spatial state from spatial orientation & bounds
     */
    private _computeState;
    invalidateStates(): void;
    /**
     * The raw node state.
     * This is raw local with `target` ancestor states.
     */
    get raw(): Readonly<NodeState<N>>;
    private _cachedRawState;
    [InternalRawState]: NodeState<N>;
    /**
     * The current state
     */
    get current(): NodeState<N>;
    private _cachedCurrentState;
    [InternalCurrentState]: NodeState<N>;
    /**
     * The target state
     */
    get target(): NodeState<N>;
    private _cachedTargetState;
    [InternalTargetState]: NodeState<N>;
    /**
     * The previous target state
     */
    get previousTarget(): NodeState<N>;
    [InternalPreviousTargetState]: NodeState<N>;
    /**
     * The reference node
     */
    get referenceNode(): N | null;
    /**
     * The reference metrics
     */
    get referenceMetrics(): SpatialMetrics<N> | null;
    /**
     * The parent node
     */
    get parentNode(): N | null;
    /**
     * The parent metrics
     */
    get parentMetrics(): SpatialMetrics<N> | null;
    /**
     * The closest non-empty containing metrics
     */
    get outerMetrics(): SpatialMetrics<N> | null;
    /**
     * The child nodes that are included in this bounding context
     */
    get boundsChildren(): ReadonlyArray<N>;
    private _cachedBoundsChildren;
    private _children;
    /**
     *
     */
    get isAdaptive(): boolean;
}
export {};