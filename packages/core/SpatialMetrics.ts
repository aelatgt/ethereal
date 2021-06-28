
import { Box3, Vector3, Quaternion, Matrix4, V_000, DIRECTION, V_111, Box2, Vector2, Q_IDENTITY } from './math-utils'
import { EtherealLayoutSystem, Node3D } from './EtherealLayoutSystem'
import { MemoizationCache } from './MemoizationCache'
import { SpatialAdapter } from './SpatialAdapter'

const InternalRawState = Symbol("raw")
const InternalCurrentState = Symbol("current")
const InternalTargetState = Symbol("target")
const InternalPreviousTargetState = Symbol("previousTarget")

export class NodeState<N extends Node3D=Node3D> {

    constructor(public mode:'current'|'target', public metrics:SpatialMetrics<N>) {}
    
    private _cache = new MemoizationCache

    invalidate() {
        this._cache.invalidateAll()
    }

    opacity = 1
 
    get parent() {
        return this._parent
    }
    set parent(val:N|null) {
        const current = this._parent
        if (current !== val) {
            this._parent = val
            this.invalidate()
        }
    }
    private _parent : N|null = null

    get parentState() {
        return this.metrics.parentMetrics?.[this.mode]
    }
    
    get referenceState() {
        return this.metrics.referenceMetrics?.[this.mode]
    }

    private _cachedLocalMatrix = this._cache.memoize(() => {
        this._localMatrix.decompose(this._localPosition, this._localOrientation, this._localScale)
        this._localOrientation.normalize()
        this._localOrientationInverse.copy(this._localOrientation).invert()
        this._localRotation.makeRotationFromQuaternion(this._localOrientation)
        this._localRotationInverse.makeRotationFromQuaternion(this._localOrientationInverse)
        return this._localMatrix
    })
    get localMatrix() { return this._localMatrix }
    set localMatrix(val:Matrix4) {
        if (isNaN(val.elements[0])) throw new Error()
        if (!this._localMatrix.equals(val)) {
            this.invalidate()
            this._localMatrix.copy(val)
            this._localMatrixInverse.copy(this._localMatrix).invert()
        }
    }

    private _localMatrix = new Matrix4
    private _localMatrixInverse = new Matrix4
    
    private _localPosition = new Vector3
    private _localOrientation = new Quaternion
    private _localOrientationInverse = new Quaternion
    private _localScale = new Vector3(1,1,1)
    private _localRotation = new Matrix4
    private _localRotationInverse = new Matrix4

    get localMatrixInverse() {
        return this._localMatrixInverse
    }

    get localPosition() {
        this._cachedLocalMatrix()
        return this._localPosition
    }

    get localOrientation() {
        this._cachedLocalMatrix()
        return this._localOrientation
    }

    get localOrientationInverse() {
        this._cachedLocalMatrix()
        return this._localOrientationInverse
    }

    get localScale() {
        this._cachedLocalMatrix()
        return this._localScale
    }

    /**
     * Local rotation matrix
     */
    get localRotation() {
        this._cachedLocalMatrix()
        return this._localRotation
    }

    /**
     * Local Orientation matrix inverse
     */
    get localRotationInverse() {
        this._cachedLocalMatrix()
        return this._localRotationInverse
    }

    private _cachedWorldMatrix = this._cache.memoize(() => {
        const matrix = this._worldMatrix.copy(this.localMatrix)
        const parentState = this.parentState
        if (parentState) {
            matrix.premultiply(parentState.worldMatrix)
        }
        matrix.decompose(this._worldPosition, this._worldOrientation, this._worldScale)
        this._worldMatrixInverse.copy(this._worldMatrix).invert()
        this._worldOrientationInverse.copy(this._worldOrientation).invert()
        this._worldRotation.makeRotationFromQuaternion(this._worldOrientation)
        this._worldRotationInverse.makeRotationFromQuaternion(this._worldOrientationInverse)
        return matrix
    })
    get worldMatrix() {
        return this._cachedWorldMatrix()
    }
    
    private _worldPosition = new Vector3
    private _worldOrientation = new Quaternion
    private _worldOrientationInverse = new Quaternion
    private _worldScale = new Vector3
    private _worldMatrix = new Matrix4
    private _worldMatrixInverse = new Matrix4
    private _worldRotation = new Matrix4
    private _worldRotationInverse = new Matrix4

    get worldMatrixInverse() {
        this.worldMatrix
        return this._worldMatrixInverse
    }

    get worldPosition() {
        this.worldMatrix
        return this._worldPosition
    }

    get worldOrientation() {
        this.worldMatrix
        return this._worldOrientation
    }

    get worldScale() {
        this.worldMatrix
        return this._worldScale
    }

    /**
     * Inverse world orientation
     */
    get worldOrientationInverse() {
        return this._worldOrientationInverse
    }

    /**
     * World rotation matrix
     */
    get worldRotation() {
        return this._worldRotation
    }
    
    /**
     * World rotation matrix inverse
     */
    get worldRotationInverse() {
        return this._worldRotationInverse
    }

    /**
     * The inner bounds center in world coordinates
     */
    private _cachedWorldCenter = this._cache.memoize(() => {
        return this._worldCenter.copy(this.metrics.innerCenter).applyMatrix4(this.worldMatrix)
    })
    get worldCenter() {
        return this._cachedWorldCenter()
    }
    private _worldCenter = new Vector3

    /**
     * Convert to world frame from spatial frame
     * 
     * Spatial Frame = Reference Origin + My World Orientation
     */
    private _cachedSpatialMatrix = this._cache.memoize(() => {
        const spatialMatrix = this._spatialMatrix.compose(this.outerOrigin, this.worldOrientation, V_111) 
        this._spatialMatrixInverse.copy(this._spatialMatrix).invert()
        this._localFromSpatial.multiplyMatrices(this.worldMatrixInverse, spatialMatrix)
        this._spatialFromLocal.copy(this._localFromSpatial).invert()
        const reference = this.referenceState
        if (reference) {
            this._spatialFromReference.multiplyMatrices(this._spatialMatrixInverse, reference.worldMatrix)
        } else {
            this._spatialFromReference.copy(this._spatialMatrixInverse)
        }
        return spatialMatrix
    })
    get spatialMatrix() {
        return this._cachedSpatialMatrix()
    }

    private _spatialMatrix = new Matrix4
    private _spatialMatrixInverse = new Matrix4
    private _localFromSpatial = new Matrix4
    private _spatialFromLocal = new Matrix4
    private _spatialFromReference = new Matrix4


    /**
     * Convert to spatial frame from world frame
     */
    get spatialMatrixInverse() {
        this.spatialMatrix
        return this._spatialMatrixInverse
    }

    /**
     * Convert to local frame from spatial frame
     */
    get localFromSpatial() { 
        this.spatialMatrix
        return this._localFromSpatial
    }

    /**
     * Convert to spatial frame from local frame
     */
    get spatialFromLocal() { 
        this.spatialMatrix
        return this._spatialFromLocal 
    }

    /**
     * Convert to spatial frame from reference frame
     */
    get spatialFromReference() { 
        this.spatialMatrix
        return this._spatialFromReference 
    }
    
    /**
     * The spatial bounds 
     */
    private _cachedSpatialBounds = this._cache.memoize(() => {
        this._spatialBounds.copy(this.metrics.innerBounds)
        const bounds = this._spatialBounds.applyMatrix4(this.spatialFromLocal)
        bounds.getCenter(this._spatialCenter)
        bounds.getSize(this._spatialSize)
        return bounds
    })
    get spatialBounds() { return this._cachedSpatialBounds() }
    private _spatialBounds = new Box3
    private _spatialSize = new Vector3
    private _spatialCenter = new Vector3

    /**
     * The spatial size
     */
    get spatialSize() {
        this.spatialBounds
        return this._spatialSize
    }

    /**
     * The spatial center
     */
    get spatialCenter() {
        this.spatialBounds
        return this._spatialCenter
    }


    private _cachedOuterBounds = this._cache.memoize(() => {
        const bounds = this._outerBounds
        const adapter = this.metrics.system.nodeAdapters.get(this.metrics.node)
        if (adapter) {
            bounds.copy(adapter.outerBounds[this.mode])
        } else {
            const referenceState = this.referenceState
            if (!referenceState) bounds.setFromCenterAndSize(V_000,V_000)
            else bounds.copy(referenceState.metrics.innerBounds)
            bounds.applyMatrix4(this.spatialFromReference)
        }
        bounds.getCenter(this._outerCenter)
        bounds.getSize(this._outerSize)
        return bounds
    })
    /**
    * The reference bounds in the spatial frame
    */
    get outerBounds() { return this._cachedOuterBounds() }
    private _outerBounds = new Box3
    private _outerCenter = new Vector3
    private _outerSize = new Vector3

    /**
     * 
     */
    get outerCenter() {
        this.outerBounds
        return this._outerCenter
    }

    /**
     * The outer bounds size in the spatial frame
     */
    get outerSize() {
        this.outerBounds
        return this._outerSize
    }

    /**
     * The outer bounds origin in the world frame
     */
    get outerOrigin() {
        const adapter = this.metrics.system.nodeAdapters.get(this.metrics.node)
        if (adapter) return adapter.outerOrigin[this.mode]
        return this.referenceState?.worldCenter ?? V_000
    }

    /**
     * The outer bounds orientation in the world frame
     */
    get outerOrientation() {
        const adapter = this.metrics.system.nodeAdapters.get(this.metrics.node)
        if (adapter) return adapter.outerOrientation[this.mode]
        return this.referenceState?.worldOrientation ?? Q_IDENTITY
    }

    private _cachedOuterVisualBounds = this._cache.memoize(() => {
        const bounds = this._outerVisualBounds
        const adapter = this.metrics.system.nodeAdapters.get(this.metrics.node)
        if (adapter) {
            bounds.copy(adapter.outerVisualBounds[this.mode])
        } else {
            const referenceState = this.referenceState
            if (!referenceState) bounds.setFromCenterAndSize(V_000, V_000)
            else bounds.copy(referenceState.visualBounds)
        }
        bounds.getCenter(this._outerVisualCenter)
        bounds.getSize(this._outerVisualSize)
        return bounds
    })
    /**
    * The reference bounds in the visual frame
    */
    get outerVisualBounds() { return this._cachedOuterVisualBounds() }
    private _outerVisualBounds = new Box3
    private _outerVisualCenter = new Vector3
    private _outerVisualSize = new Vector3

    /**
     * 
     */
    get outerVisualCenter() {
        this.outerVisualBounds
        return this._outerVisualCenter
    }

    /**
     * The outerVisual bounds size in the spatial frame
     */
    get outerVisualSize() {
        this.outerVisualBounds
        return this._outerVisualSize
    }


    private get _viewState() {
        if (this.metrics.system.viewNode === this.metrics.node) return this
        const viewMetrics = this.metrics.system.viewMetrics
        if (this.mode === 'current') return viewMetrics[InternalCurrentState]
        return viewMetrics[InternalTargetState]
    }


    /**
     * The view frame from world frame
     */
    get viewFromWorld() {
        return this._viewFromWorld.multiplyMatrices(this._viewState.worldMatrixInverse, this.worldMatrix)
    }
    private _viewFromWorld = new Matrix4
    
    /**
     * The view frame from spatial frame
     */
    get viewFromSpatial() {
        return this._viewFromSpatial.multiplyMatrices(this._viewState.worldMatrixInverse, this.spatialMatrix)
    }
    private _viewFromSpatial = new Matrix4

    /**
     * Convert to parent frame from spatial frame
     */
    get spatialFromView() {
        return this._spatialFromView.copy(this.viewFromSpatial).invert()
    }
    private _spatialFromView = new Matrix4

    /**
     * Normalized Device Coordinates
     */
    get ndcBounds() {
        return this._cachedNDCBounds()
    }
    private _cachedNDCBounds = this._cache.memoize(() => {
        if (this.metrics.system.viewNode === this.metrics.node) {
            this._ndcBounds.min.setScalar(-1)
            this._ndcBounds.max.setScalar(1)
            return this._ndcBounds
        }
        const viewFrustum = this.metrics.system.viewFrustum
        const projection = viewFrustum.perspectiveProjectionMatrix
        const viewFromWorld = this.viewFromWorld
        const viewProjectionFromWorld = this._viewProjectionFromWorld.multiplyMatrices(projection, viewFromWorld)
        const bounds = this._ndcBounds.copy(this.metrics.innerBounds).applyMatrix4(viewProjectionFromWorld)
        bounds.getCenter(this._ndcCenter)
        bounds.getSize(this._ndcSize)
        if (!isFinite(bounds.min.x) || !isFinite(bounds.min.y) || !isFinite(bounds.min.z) || 
            !isFinite(bounds.max.x) || !isFinite(bounds.max.y) || !isFinite(bounds.max.z)) {
            bounds.min.setScalar(-1)
            bounds.max.setScalar(1)
            bounds.getCenter(this._ndcCenter)
            bounds.getSize(this._ndcSize)
        }
        return bounds
    }, this._viewState._cache)
    private _viewProjectionFromWorld = new Matrix4
    private _ndcBounds = new Box3
    private _ndcCenter = new Vector3
    private _ndcSize = new Vector3

    get ndcCenter() {
        this._cachedNDCBounds()
        return this._ndcCenter
    }
    get ndcSize() {
        this._cachedNDCBounds()
        return this._ndcSize
    }

    /**
     * The visual bounds of this node.
     * 
     * Horizontal and vertical units are in pixels, with screen center at (0,0)
     * Z dimension is in meters
     */
    get visualBounds() {
        return this._cachedVisualBounds()
    }
    private _cachedVisualBounds = this._cache.memoize(() => {
        const system = this.metrics.system
        const projection = system.viewFrustum.perspectiveProjectionMatrix
        const inverseProjection = this._inverseProjection.copy(projection).invert()
        const bounds = this._visualBounds.copy(this.ndcBounds)
        const v = this._v1
        const nearMeters = v.set(0,0,bounds.min.z).applyMatrix4(inverseProjection).z
        const farMeters = v.set(0,0,bounds.max.z).applyMatrix4(inverseProjection).z
        bounds.min.z = farMeters
        bounds.max.z = nearMeters
        bounds.min.x *= 0.5 * system.viewResolution.x
        bounds.max.x *= 0.5 * system.viewResolution.x
        bounds.min.y *= 0.5 * system.viewResolution.y
        bounds.max.y *= 0.5 * system.viewResolution.y
        bounds.getCenter(this._visualCenter)
        bounds.getSize(this._visualSize) 
        return bounds
    }, this._viewState._cache)
    private _visualBounds = new Box3
    private _visualCenter = new Vector3
    private _visualSize = new Vector3
    private _v1 = new Vector3
    private _inverseProjection = new Matrix4

    get visualCenter() {
        this._cachedVisualBounds()
        return this._visualCenter
    }
    get visualSize() {
        this._cachedVisualBounds()
        return this._visualSize
    }

    /**
     * The view position relative to this node state
     */
    get relativeViewPosition() {
        return this._viewPosition.copy(this._viewState.worldPosition).applyMatrix4(this.worldMatrixInverse)
    }
    private _viewPosition = new Vector3


    /**
     * The local orthogonal (right-angled) orientation with the closest view orientation alignment
     */
    get viewAlignedOrientation() {
        return this._cachedViewAlignedOrientation()
    }
    private _cachedViewAlignedOrientation = this._cache.memoize(() => {
        const relativeViewMatrix = this._relativeViewMatrix.multiplyMatrices(this.worldMatrixInverse, this._viewState.worldMatrix)
        const relativeViewRotation = this._relativeViewRotation.extractRotation(relativeViewMatrix)
        const relativeViewOrientation = this._relativeViewOrientation.setFromRotationMatrix(relativeViewRotation)
        const forwardDirection = this._relativeViewForward.set(0, 0, 1).applyQuaternion(relativeViewOrientation)
        const upDirection = this._relativeViewUp.set(0, 1, 0).applyQuaternion(relativeViewOrientation)
        
        let distForward = Infinity
        let distUp = Infinity
        let closestForwardDirection : Vector3
        let closestUpDirection : Vector3
        let d : keyof typeof DIRECTION

        for (d in DIRECTION) {
            const dir = DIRECTION[d]
            var dist = upDirection.distanceToSquared(dir)
            if (dist < distUp) {
                distUp = dist
                closestUpDirection = dir
            }
        }
    
        for (d in DIRECTION) {
            const dir = DIRECTION[d]    
            // avoid having forward & up defined on the same axis
            if (dir.x && closestUpDirection!.x) continue
            if (dir.y && closestUpDirection!.y) continue
            if (dir.z && closestUpDirection!.z) continue
            const dist = forwardDirection.distanceToSquared(dir)
            if (dist < distForward) {
                distForward = dist
                closestForwardDirection = dir
            }
        }
    
        const rot = this._orthogonalRotation.identity()
        rot.lookAt(closestForwardDirection!, V_000, closestUpDirection!)
        return this._orthogonalOrientation.setFromRotationMatrix(rot)
    }, this._viewState._cache)
    private _relativeViewMatrix = new Matrix4
    private _relativeViewRotation = new Matrix4
    private _relativeViewOrientation = new Quaternion
    private _relativeViewUp = new Vector3
    private _relativeViewForward = new Vector3
    private _orthogonalRotation = new Matrix4
    private _orthogonalOrientation = new Quaternion


    private _computeOcclusion = this._cache.memoize(() => {
        this._occludingPercent = 0
        this._occludedPercent = 0
        
        const metrics = this.metrics
        if (metrics.innerBounds.isEmpty()) return
        
        const system = metrics.system
        const adapters = system.nodeAdapters.values()

        const myBounds = this.visualBounds
        const myNear = myBounds.min.z
        const a = NodeState._boxA
        const b = NodeState._boxB
        a.min.set(myBounds.min.x, myBounds.min.y)
        a.min.set(myBounds.max.x, myBounds.max.y)
        const myLength = a.getSize(NodeState._sizeA).length()

        for (const adapter of adapters) {
            const otherMetrics = adapter.metrics
            if (otherMetrics === metrics) continue
            if (!otherMetrics.isAdaptive || otherMetrics.innerBounds.isEmpty()) continue
            if (otherMetrics.containedByNode(adapter.node)) continue
            
            const otherState = this.mode === 'current' ? otherMetrics.current : otherMetrics.target
            const otherBounds = otherState.visualBounds
            a.min.set(myBounds.min.x, myBounds.min.y)
            a.min.set(myBounds.max.x, myBounds.max.y)
            b.min.set(otherBounds.min.x, otherBounds.min.y)
            b.min.set(otherBounds.max.x, otherBounds.max.y)
            const overlapPercent = a.intersect(b).getSize(NodeState._sizeB).length() / myLength
            if (overlapPercent > 0)  {
                if  (myNear < otherBounds.min.z) this._occludingPercent += overlapPercent
                else this._occludedPercent += overlapPercent
            }
        }
    },  this._viewState._cache)
    private static _boxA = new Box2
    private static _boxB = new Box2
    private static _sizeA = new Vector2
    private static _sizeB = new Vector2

    /** 
     * The percent of this node occluding another node
     */
    get occludingPercent() {
        this._computeOcclusion()
        return this._occludingPercent
    }
    private _occludingPercent = 0

    /**
     * The percent of this node occluded by another node
     */
    get occludedPercent() {
        this._computeOcclusion()
        return this._occludedPercent
    }
    private _occludedPercent = 0

    /**
     * Used as a heuristic for view-size maximization
     * (average edge length corresponds better with inncreasig visual area
     * compared to area of the projected bounding-box in 
     * cases where the underlying aspect ratios are not fixed)
     */
    visualAverageEdgeLength() {

    }

}


/**
 * Maintains current & target scenegraph state,
 * and efficiently/reactively compute spatial metrics 
 * based on *target* (not current) scenegraph state. 
 * 
 * All metric values should be treated as read-only.
 */
export class SpatialMetrics<N extends Node3D=Node3D> {
    
    constructor(public system:EtherealLayoutSystem<N>, public node:N) {}

    private _cache = new MemoizationCache()
    
    needsUpdate = true

    parentNode! : N|null
    parentMetrics! : SpatialMetrics<N>|null
    referenceMetrics? : SpatialMetrics<N>|null

    private _adapter? : SpatialAdapter<N>

    /**
     * Update metrics, if necessary
     */
    update() {
        if (this.needsUpdate) {
            this.needsUpdate = false

            // this.previousTarget.parent = this.target.parent
            // this.previousTarget.localMatrix = this.target.localMatrix

            const adapter = this._adapter = this.system.nodeAdapters.get(this.node)

            this.parentNode = this.raw.parent
            this.parentMetrics = this.parentNode && this.system.getMetrics(this.parentNode)
            const reference = adapter?.activeLayout?.referenceNode || adapter?.referenceNode || this.parentNode
            this.referenceMetrics = reference && this.system.getMetrics(reference as N)

            this.parentMetrics?.update()
            this.referenceMetrics?.update()


            if (adapter) {

                adapter._update()

            } else {
                this.invalidateInnerBounds()
                this.invalidateStates()
            }

        }
    }
    
    private _cachedInnerBounds = this._cache.memoize(() => {
        const inner = this._innerBounds

        if (this.node !== this.system.viewNode) {
            inner.copy(this.intrinsicBounds)
            const childBounds = this._childBounds
            for (const c of this.boundingChildMetrics) {
                c.invalidateStates()
                childBounds.copy(c.innerBounds)
                childBounds.applyMatrix4(c.raw.localMatrix)
                inner.union(childBounds)
            }
        }

        const center = inner.getCenter(this._innerCenter)
        const size = inner.getSize(this._innerSize)
        if (size.length() > 0) {
            // if the content is flat, give some thickness so that
            // bounds-size meaningfully affects scale
            const sizeEpsillon = this.system.epsillonMeters
            if (Math.abs(size.x) <= sizeEpsillon) size.x = (Math.sign(size.x) || 1) * sizeEpsillon * 1000
            if (Math.abs(size.y) <= sizeEpsillon) size.y = (Math.sign(size.y) || 1) * sizeEpsillon * 1000
            if (Math.abs(size.z) <= sizeEpsillon) {
                // for z size, make sure bounds are only extend backwards 
                // (this way, visual-bounds remain accurate)
                size.z = (Math.sign(size.z) || 1) * sizeEpsillon * 1000
                center.z -= sizeEpsillon * 1000 / 2
            }
            inner.setFromCenterAndSize(center, size)
        }
        return inner
    })
    private _childBounds = new Box3
    private _innerBounds = new Box3
    private _innerCenter = new Vector3
    private _innerSize = new Vector3

    /**
     * The bounds of this node and non-adaptive child nodes in the local coordinate system
     */
    get innerBounds() {
        return this._cachedInnerBounds()
    }
    
    get innerCenter() {
        this.innerBounds
        return this._innerCenter
    }

    get innerSize() {
        this.innerBounds
        return this._innerSize
    }

    /**
     * The intrinsic bounds of the geometry attached directly to this node (excluding child nodes)
     */
    get intrinsicBounds() : Readonly<Box3> {
        if (this._intrinsicBoundsNeedsUpdate) {
            this._intrinsicBoundsNeedsUpdate = false
            this.system.bindings.getIntrinsicBounds(this, this._intrinsicBounds)
            this._intrinsicBounds.getCenter(this._intrinsicCenter)
            this._intrinsicBounds.getSize(this._intrinsicSize)
        }
        return this._intrinsicBounds
    }

    private _intrinsicBoundsNeedsUpdate = true
    private _intrinsicBounds = new Box3
    private _intrinsicCenter = new Vector3
    private _intrinsicSize = new Vector3
    
    get intrinsicCenter() {
        this.intrinsicBounds
        return this._intrinsicCenter
    }

    get intrinsicSize() {
        this.intrinsicBounds
        return this._intrinsicSize
    }

    /**
     * Invalidate intrinsic bounds in order to allow it to be recomputed
     */
    invalidateIntrinsicBounds() {
        this._intrinsicBoundsNeedsUpdate = true
        for (const c of this.boundingChildMetrics) {
            c.invalidateIntrinsicBounds()
        }
    }

    invalidateInnerBounds() {
        if (this._cachedInnerBounds.needsUpdate) return
        this._cachedNodeChildren.needsUpdate = true
        this._cachedBoundsChildren.needsUpdate = true
        this._cachedInnerBounds.needsUpdate = true
        for (const c of this.boundingChildMetrics) {
            c.invalidateInnerBounds()
        }
    }

    /**
     * Returns false if this node does not contain the passed node.
     * If the given node is a descendent of this node, returns
     * the closest child node.
     */
    containsNode(node:N) {
        this.update()
        let parentMetrics = this.system.getMetrics(node) as SpatialMetrics<N>|null
        while (parentMetrics) {
            if (parentMetrics.parentMetrics === this) return parentMetrics.node
            parentMetrics = parentMetrics.parentMetrics
        }
        return false
    }

    containedByNode(node:N) {
        this.update()
        let parentMetrics = this.parentMetrics
        while (parentMetrics) {
            if (parentMetrics.node === node) return parentMetrics.node
            parentMetrics = parentMetrics.parentMetrics
        }
        return false
    }

    /**
     * 
     */
    get nodeChildren() {
        return this._cachedNodeChildren()
    }
    private _cachedNodeChildren = this._cache.memoize(() => {
        this.system.bindings.getChildren(this, this._nodeChildren)
        return this._nodeChildren
    })
    private _nodeChildren = new Array<N>()

    /**
     * Compute spatial state from spatial orientation & bounds
     */
    private _computeState = (() => {

        const localMatrix = new Matrix4
        const localOrientation = new Quaternion
        const localPosition = new Vector3
        const localScale = new Vector3

        const worldMatrix = new Matrix4
        const worldPosition = new Vector3
        const worldOrientation = new Quaternion
        const worldScale = new Vector3

        const spatialCenter = new Vector3
        const spatialSize = new Vector3
        const spatialOffset = new Vector3
        const innerOffset = new Vector3

        return function computeState(this:SpatialMetrics<N>, state:NodeState<N>) {

            const useCurrent = state.mode === 'current'
            const adapter = this._adapter

            localOrientation.copy( 
                ( useCurrent ? 
                    adapter?.orientation.enabled && adapter?.orientation.current :
                    adapter?.orientation.enabled && adapter?.orientation.target
                ) || this.raw.localOrientation
            )
                
            const spatialBounds = useCurrent ? 
                adapter?.bounds.enabled && adapter?.bounds.current :
                adapter?.bounds.enabled && adapter?.bounds.target

            const parentMetrics = this.parentMetrics
            state.parent = parentMetrics?.node ?? null

            if (spatialBounds) {
                spatialBounds.getCenter(spatialCenter)
                spatialBounds.getSize(spatialSize)

                const parentState = useCurrent ? 
                    parentMetrics?.current : 
                    parentMetrics?.target

                const innerCenter = this.innerCenter
                const innerSize = this.innerSize

                const sizeEpsillon = this.system.epsillonMeters
                if (Math.abs(spatialSize.x) <= sizeEpsillon) spatialSize.x = (Math.sign(spatialSize.x) || 1) * sizeEpsillon * 10
                if (Math.abs(spatialSize.y) <= sizeEpsillon) spatialSize.y = (Math.sign(spatialSize.y) || 1) * sizeEpsillon * 10
                if (Math.abs(spatialSize.z) <= sizeEpsillon) spatialSize.z = (Math.sign(spatialSize.z) || 1) * sizeEpsillon * 10

                worldScale.copy(spatialSize)
                if (Math.abs(innerSize.x) >= sizeEpsillon) worldScale.x /= innerSize.x
                if (Math.abs(innerSize.y) >= sizeEpsillon) worldScale.y /= innerSize.y
                if (Math.abs(innerSize.z) >= sizeEpsillon) worldScale.z /= innerSize.z

                worldOrientation.multiplyQuaternions(state.outerOrientation, localOrientation).normalize()
                spatialOffset.copy(spatialCenter).applyQuaternion(worldOrientation)
                innerOffset.copy(innerCenter).multiply(worldScale).applyQuaternion(worldOrientation)
                worldPosition.copy(state.outerOrigin).add(spatialOffset).sub(innerOffset)
                
                worldMatrix.compose(worldPosition,worldOrientation,worldScale)

                parentState ?    
                    localMatrix.multiplyMatrices(parentState.worldMatrixInverse, worldMatrix) :
                    localMatrix.copy(worldMatrix)

            } else {

                localPosition.copy(this.raw.localPosition)
                localScale.copy(this.raw.localScale)
                localMatrix.compose(localPosition, localOrientation, localScale)
                
            }

            // apply changes
            state.localMatrix = localMatrix
            return state
        }
    })()

    invalidateStates(includeRaw=true) {
        if (includeRaw) {
            this._cachedRawState.needsUpdate = true
            this[InternalRawState].invalidate()
        }
        this._cachedCurrentState.needsUpdate = true
        this._cachedTargetState.needsUpdate = true
        this[InternalCurrentState].invalidate()
        this[InternalTargetState].invalidate()
    }

    /**
     * The raw node state, before any update, with ancestor target states
     */
    get raw() : Readonly<NodeState<N>> {
        return this._cachedRawState()
    }
    private _cachedRawState = this._cache.memoize(() => {
        this.system.bindings.getState(this, this[InternalRawState])
        return this[InternalRawState]
    });
    [InternalRawState]:NodeState<N> = new NodeState('target', this)

    /**
     * The current state
     */
    get current() {
        this.update()
        return this._cachedCurrentState()
    }
    private _cachedCurrentState = this._cache.memoize(() => {
        return this._computeState(this[InternalCurrentState])
    });
    [InternalCurrentState]:NodeState<N> = new NodeState('current', this)

    /**
     * The target state
     */
    get target() {
        this.update()
        return this._cachedTargetState()
    }
    private _cachedTargetState = this._cache.memoize(() => {
        return this._computeState(this[InternalTargetState])
    });
    [InternalTargetState]:NodeState<N> = new NodeState('target', this)


    /**
     * The previous target state
     */
    get previousTarget() {
        this.update()
        return this[InternalPreviousTargetState]
    }
    [InternalPreviousTargetState]:NodeState<N> = new NodeState('target', this)


    /**
     * The child nodes that are included in this bounding context
     */
    get boundingChildMetrics() : ReadonlyArray<SpatialMetrics<N>> {
        return this._cachedBoundsChildren()
    }
    private _cachedBoundsChildren = this._cache.memoize(() => {
        const nodeChildren = this.nodeChildren
        const children = this._boundingChildren
        children.length = 0
        for (const child of nodeChildren) {
            const metrics = this.system.getMetrics(child)
            if (metrics.isAdaptive) continue
            children.push(metrics)
        }
        return children
    })
    private _boundingChildren = [] as SpatialMetrics<N>[]

    /**
     * 
     */
    get isAdaptive() {
        return this.system.nodeAdapters.has(this.node)
    }
    
}

