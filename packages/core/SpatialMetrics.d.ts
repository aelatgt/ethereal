import { Box3, Vector3, Quaternion, Matrix4 } from './math';
import { EtherealSystem, Node3D } from './EtherealSystem';
import { LayoutFrustum } from './LayoutFrustum';
declare const InternalCurrentState: unique symbol;
declare const InternalTargetState: unique symbol;
export declare class NodeState<N extends Node3D = Node3D> {
    mode: 'current' | 'target';
    metrics: SpatialMetrics<N>;
    constructor(mode: 'current' | 'target', metrics: SpatialMetrics<N>);
    private _cache;
    invalidate(): void;
    get parent(): N | null;
    set parent(val: N | null);
    private _parent;
    get parentState(): Readonly<NodeState<N>> | undefined;
    get outerState(): Readonly<NodeState<N>> | undefined;
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
     * The layout space (convert to world space from layout space)
     */
    private _cachedLayoutMatrix;
    get layoutMatrix(): Matrix4;
    private _layoutMatrix;
    private _layoutMatrixInverse;
    private _localFromLayout;
    private _layoutFromLocal;
    /**
     * Convert to layout space from world space
     */
    get layoutMatrixInverse(): Matrix4;
    /**
     * Convert to local space from layout space
     */
    get localFromLayout(): Matrix4;
    /**
     * Convert to layout space from local space
     */
    get layoutFromLocal(): Matrix4;
    /**
     * The layout bounds
     */
    private _cachedLayoutBounds;
    get layoutBounds(): Box3;
    private _layoutBounds;
    private _layoutSize;
    private _layoutCenter;
    /**
     * The layout size
     */
    get layoutSize(): Vector3;
    /**
     * The layout center
     */
    get layoutCenter(): Vector3;
    /**
     * The first non-empty parent bounds, reoriented
     */
    private _cachedOuterBounds;
    get outerBounds(): Box3;
    private _outerBounds;
    private _outerCenter;
    private _outerSize;
    private _layoutFromOuter;
    /**
     *
     */
    get outerCenter(): Vector3;
    get outerSize(): Vector3;
    private get _viewState();
    /**
     * The view space from local space
     */
    get viewFromLocal(): Matrix4;
    private _viewFromLocal;
    /**
     * The view space from layout space
     */
    get viewFromLayout(): Matrix4;
    private _viewFromLayout;
    /**
     * Convert to parent space from layout space
     */
    get layoutFromView(): Matrix4;
    private _layoutFromView;
    /**
     * The view projection space from layout space
     */
    get screenBounds(): Box3;
    private _cachedScreenBounds;
    private _viewProjectionFromLocal;
    private _screenBounds;
    private _screenCenter;
    private _screenSize;
    get screenCenter(): Vector3;
    get screenSize(): Vector3;
    /**
     * The visual bounds of the this node.
     * X and Y coordinates are in degrees, with the origin being centered in the visual space
     * Z coordinate are in meters
     */
    get visualFrustum(): LayoutFrustum;
    private _cachedVisualFrustum;
    private _visualFrustum;
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
}
/**
 * Maintains current & target scenegraph state,
 * and efficiently/reactively compute spatial metrics
 * based on *target* (not current) scenegraph state.
 *
 * All metric values should be treated as read-only.
 */
export declare class SpatialMetrics<N extends Node3D = Node3D> {
    system: EtherealSystem<N>;
    node: N;
    constructor(system: EtherealSystem<N>, node: N);
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
     * Get the local node state (only local state is defined)
     */
    get nodeState(): Readonly<NodeState<N>>;
    private _cachedNodeState;
    private _nodeState;
    /**
     * Compute spatial state from layout orientation & bounds
     */
    private _computeState;
    invalidateNodeStates(): void;
    /**
     * The current state
     */
    get currentState(): Readonly<NodeState<N>>;
    private _cachedCurrentState;
    [InternalCurrentState]: NodeState<N>;
    /**
     * The target state
     */
    get targetState(): Readonly<NodeState<N>>;
    private _cachedTargetState;
    [InternalTargetState]: NodeState<N>;
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
