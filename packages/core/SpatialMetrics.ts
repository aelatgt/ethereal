
import { Box3, Vector3, Quaternion, Matrix4, V_000, Q_IDENTITY, V_111 } from './math'
import { tracked, cached, TrackedArray } from './tracking'
import { EtherealSystem, Node3D, NodeState } from './EtherealSystem'
import { LayoutFrustum } from './LayoutFrustum'

/**
 * Efficiently and reactively compute spatial metrics 
 * based on *target* (not current) scenegraph state. 
 * 
 * All metric values should be treated as read-only. 
 */
export class SpatialMetrics<N extends Node3D = Node3D> {
    
    constructor(public system:EtherealSystem, node:N) {
        this.node = node
    }

    /**
     * 
     */
    @tracked node:N

    /**
     * Node adapter, if it exists and is enabled
     */
    private get _adapter() {
        const adapter = this.system.nodeAdapters.get(this.node)
        adapter?.update()
        return adapter?.enabled ? adapter : undefined
    }

    /**
     * True if this node contains the passed node
     */
    @cached containsNode(node:Node3D) {
        let parentMetrics = this.system.getMetrics(node)
        while (parentMetrics) {
            if (parentMetrics === this) return true
        }
        return false
    }

    /**
     * The current state
     */
    @cached get currentState() : Readonly<NodeState> {
        this.system.time
        this.system.bindings.getCurrentState(this.node, this._currentState)
        return this._currentState
    }
    @tracked private _currentState = new NodeState

    /**
     * Invalidate current state in order to allow
     * it to be recomputed again in the same frame
     */
    invalidateCurrentState() {
        this._currentState = this._currentState
    }

    /** 
     * The target parent
     */
    @cached get currentParent() {
        return this.currentState.parent
    }

    /**
     * The current children
     */
    @cached get currentChildren() : ReadonlyArray<Node3D> {
        this.system.time
        this.system.bindings.getCurrentChildren(this.node, this._currentChildren)
        return this._currentChildren
    }
    private _currentChildren = new TrackedArray as Node3D[]

    /** 
     * The target parent
     */
    @cached get parentNode() {
        return this._adapter?.parentNode ?? this.currentState.parent
    }

    /**
     * The target children
     */
    @cached get children() : ReadonlyArray<Node3D> {
        const currentChildren = this.currentChildren
        const targetChildren = currentChildren.slice()
        targetChildren.filter(this._hasThisParent)
        for (const adapter of this.system.nodeAdapters.values()) {
            if (this._hasThisParent(adapter.node)) {
                targetChildren.push(adapter.node)
            }
        }
        return targetChildren
    }
    private _hasThisParent = (n:Node3D) => {
        return this.system.getMetrics(n).parentNode === this.node
    }
    
    /**
     * The target parent metrics
     */
    @cached get parentMetrics() {
        const parent = this.parentNode
        if (!parent) return null
        return this.system.getMetrics(parent)
    }

    /**
     * 
     */
    get opacity() : number {
        return this._adapter?.opacity.target ?? this.currentState.opacity
    }

    /**
     * The intrinsic bounds of the geometry attached directly to this node (excluding child nodes)
     */
    get intrinsicBounds() : Readonly<Box3> {
        if (!this._intrinsicBounds) {
            this._intrinsicBounds = new Box3
            this.system.bindings.getIntrinsicBounds(this.node, this._intrinsicBounds)
        }
        return this._intrinsicBounds
    }
    @tracked private _intrinsicBounds?: Box3

    /**
     * Invalidate intrinsic bounds in order to allow it to be recomputed
     */
    invalidateIntrinsicBounds() {
        this._intrinsicBounds = this._intrinsicBounds
    }

    /**
     * 
     */
    @tracked isBoundingContext = false
    
    /**
     * The bounds of this node and non-adaptive child nodes in the local coordinate system
     */
    get innerBounds() {
        if (this._adapter?.innerBounds.target) {
            return this._innerBounds.copy(this._adapter.innerBounds.target)
        }

        const inner = this._innerBounds
        inner.copy(this.intrinsicBounds)
        const childBounds = this._childBounds
        for (const c of this.children) {
            const childMetrics = this.system.getMetrics(c)
            if (childMetrics.isBoundingContext) continue // children that define their own bounding context can't be included in this one
            childBounds.copy(childMetrics.innerBounds)
            childBounds.applyMatrix4(childMetrics.parentFromLocal)
            inner.union(childBounds)
        }
        return inner
    }
    private _innerBounds = new Box3
    private _childBounds = new Box3
    
    /**
     * inner center
     */
    @cached get innerCenter() {
        return this.innerBounds.getCenter(this._innerCenter)
    }
    private _innerCenter = new Vector3

    /**
     * inner size
     */
    @cached get innerSize() {
        return this.innerBounds.getSize(this._innerSize)
    }
    private _innerSize = new Vector3

    @cached private get localComponents() {
        const s = this.currentState
        const c = this._localComponents
        if (this._adapter) {
            c.orientation.copy(this._adapter.orientation.target ?? s.orientation)

            const layoutBounds = this._adapter.bounds.target 
            if (layoutBounds) {
                layoutBounds.getCenter(c.position)
                layoutBounds.getSize(c.scale)
                if (!this.innerBounds.isEmpty()) c.scale.divide(this.innerSize)
                const scaledInnerCenter = this._scaledCenter.copy(this.innerCenter).multiply(c.scale)
                c.position.sub(scaledInnerCenter)
                this.parentMetrics && c.position.add(this.parentMetrics.worldCenter)
                const worldMatrix = this._localComponentsMatrix.compose(c.position,c.orientation,c.scale)
                const localMatrix = worldMatrix.premultiply(this.parentFromWorld)
                localMatrix.decompose(c.position,c.orientation,c.scale)
            } else {
                c.position.copy(s.position)
                c.scale.copy(s.scale)
            }

        } else {
            c.position.copy(s.position)
            c.orientation.copy(s.orientation)
            c.scale.copy(s.scale)
        }
        return c
    }
    private _scaledCenter = new Vector3
    private _localComponentsMatrix = new Matrix4
    private _localComponents = {position:new Vector3, orientation: new Quaternion, scale:new Vector3}


    /**
     * The position component of the local coordinate sytem
     */
    get localPosition() : Readonly<Vector3> {
        return this.localComponents.position
    }

    /**
     * The orientation component of the local cooridnate sytem
     */
    get localOrientation() : Readonly<Quaternion> {
        return this.localComponents.orientation
    }

    /**
     * The scale component of the local cooridnate sytem
     */
    get localScale() : Readonly<Vector3> {
        return this.localComponents.scale
    }
    // private _localScale = new Vector3

    /**
     * Inverse orientation relative to local origin
     */
    @cached get localOrientationInverse() {
        return this._localOrientationInverse.copy(this.localOrientation).inverse()
    }
    private _localOrientationInverse = new Quaternion

    /**
     * Local rotation matrix
     */
    @cached get localRotation() {
        return this._localRotation.makeRotationFromQuaternion(this.localOrientation)
    }
    private _localRotation = new Matrix4

    /**
     * Local Orientation matrix inverse
     */
    @cached get localRotationInverse() {
        return this._localRotationInverse.makeRotationFromQuaternion(this.localOrientationInverse)
    }
    private _localRotationInverse = new Matrix4

    /**
     * The local matrix
     */
    @cached get parentFromLocal() {
        return this._parentFromLocal.compose(this.localPosition, this.localOrientation, this.localScale)
    }
    private _parentFromLocal = new Matrix4

    /**
     * The inverse local matrix
     */
    @cached get localFromParent() {
        return this._localFromParent.getInverse(this.parentFromLocal)
    }
    private _localFromParent = new Matrix4

    /**
     * Convert to parent space from world space (the parent inverse world matrix)
     */
    @cached get parentFromWorld() {
        return this.parentMetrics ? this.parentMetrics.localFromWorld : this._identity.identity()
    }
    private _identity = new Matrix4

    /**
     * The world matrix
     */
    @cached get worldFromLocal() : Matrix4 {
        const worldFromParent = this.parentMetrics?.worldFromLocal
        if (!worldFromParent) return this._worldFromLocal.copy(this.parentFromLocal)
        return this._worldFromLocal.multiplyMatrices(worldFromParent, this.parentFromLocal)
    }
    private _worldFromLocal = new Matrix4

    /**
     * The inverse world matrix
     */
    @cached get localFromWorld() : Matrix4 {
        return this._localFromWorld.getInverse(this.worldFromLocal)
    }
    private _localFromWorld = new Matrix4

    /**
     * World components
     */
    @cached private get worldComponents() {
        const c = this._worldComponents
        this.worldFromLocal.decompose(c.position, c.orientation, c.scale)
        return c
    }
    private _worldComponents = {position:new Vector3, orientation: new Quaternion, scale:new Vector3}

    /**
     * The position relative to world origin (in meters)
     */
    get worldPosition() {
        return this.worldComponents.position
    }

    /**
     * The world orientation
     */
    get worldOrientation() {
        return this.worldComponents.orientation
    }

    /**
     * The world scale
     */
    get worldScale() {
        return this.worldComponents.scale
    }

    /**
     * The world bounds center
     */
    get worldCenter() {
        return this._worldCenter.copy(this.innerCenter).applyMatrix4(this.worldFromLocal)
    }
    private _worldCenter = new Vector3

    /**
     * Inverse world orientation
     */
    @cached get worldOrientationInverse() {
        return this._worldOrientationInverse.copy(this.worldOrientation).inverse()
    }
    private _worldOrientationInverse = new Quaternion

    /**
     * World orientation matrix
     */
    @cached get worldOrientationMatrix() {
        return this._worldOrientationMatrix.makeRotationFromQuaternion(this.worldOrientation)
    }
    private _worldOrientationMatrix = new Matrix4

    /**
     * World Orientation matrix inverse
     */
    @cached get worldOrientationMatrixInverse() {
        return this._worldOrientationMatrixInverse.makeRotationFromQuaternion(this.worldOrientationInverse)
    }
    private _worldOrientationMatrixInverse = new Matrix4

    /**
     * Convert to world space from layout space
     * 
     * Layout space is a coordinate system that:
     * 1) center-aligns this node and the parent node at layout position (0,0,0)
     * 2) is rotated by the local orientation
     * 3) has unscaled world units (meters)
     */
    @cached get worldFromLayout() {
        const worldFromLayout = this._worldFromLayout
        const parentWorldCenter = this.parentMetrics?.worldCenter || V_000
        const parentWorldOrientation = this.parentMetrics?.worldOrientation || Q_IDENTITY
        const layoutOrientation = this._layoutOrientation.multiplyQuaternions(parentWorldOrientation, this.localOrientation)
        const layoutPosition = this._layoutPosition.copy(this.innerCenter).negate()
            .multiply(this.worldScale).applyQuaternion(this.worldOrientation).add(parentWorldCenter)
        return worldFromLayout.compose(layoutPosition, layoutOrientation, V_111)
    }
    private _worldFromLayout = new Matrix4
    private _layoutPosition = new Vector3
    private _layoutOrientation = new Quaternion


    /**
     * Convert to local space from layout space
     */
    @cached get localFromLayout() {
        return this._localFromLayout.multiplyMatrices(this.localFromWorld, this.worldFromLayout)
    }
    private _localFromLayout = new Matrix4

    /**
     * Convert to layout space from local space
     */
    @cached get layoutFromLocal() {
        return this._layoutFromLocal.getInverse(this.localFromLayout)
    }
    private _layoutFromLocal = new Matrix4

    /**
     * Convert to layout space from parent space
     */
    @cached get layoutFromParent() {
        return this._layoutFromParent.multiplyMatrices(this.layoutFromLocal, this.localFromParent)
    }
    private _layoutFromParent = new Matrix4

    /**
     * The layout orientation
     */
    @cached get layoutOrientation() {
        return this.localOrientation
    }
    
    /**
     * The layout bounds 
     */
    @cached get layoutBounds() {
        if (this.innerBounds.isEmpty()) {
            this._layoutBounds.setFromCenterAndSize(V_000,V_111)
        } else {
            this._layoutBounds.copy(this.innerBounds)
        }
        return this._layoutBounds.applyMatrix4(this.layoutFromLocal)
    }
    private _layoutBounds = new Box3

    /**
     * The layout size
     */
    @cached get layoutSize() {
        return this.layoutBounds.getSize(this._layoutSize)
    }
    private _layoutSize = new Vector3

    /**
     * The layout center
     */
    @cached get layoutCenter() {
        return this.layoutBounds.getCenter(this._layoutCenter)
    }
    private _layoutCenter = new Vector3

    /**
     * The parent bounds in layout space
     */
    @cached get outerBounds() {
        const parentMetrics = this.parentMetrics
        if (!parentMetrics || parentMetrics?.innerBounds.isEmpty()) {
            this._outerBounds.setFromCenterAndSize(V_000,V_111)
        } else {
            this._outerBounds.copy(parentMetrics.innerBounds)
        }
        return this._outerBounds.applyMatrix4(this.layoutFromParent)
    }
    private _outerBounds = new Box3

    /**
     * 
     */
    @cached get outerCenter() {
        return this.outerBounds.getCenter(this._outerCenter)
    }
    private _outerCenter = new Vector3

    /**
     * 
     */
    @cached get outerSize() {
        return this.outerBounds.getSize(this._outerSize)
    }
    private _outerSize = new Vector3

    /**
     * The layout bounds in proportional units ( identity with parent layout is center=[0,0,0] size=[1,1,1] )
     */
    @cached get proportionalBounds() {
        const proportional = this._proportionalBounds.copy(this.layoutBounds)
        proportional.min.divide(this.outerSize)
        proportional.max.divide(this.outerSize)
        return proportional
    }
    private _proportionalBounds = new Box3

    /**
     * Proportional size ( identity with parent layout is size=[1,1,1] )
     */
    @cached get proportionalSize() {
        return this.proportionalBounds.getSize(this._proportionalSize)
    }
    private _proportionalSize = new Vector3
    

    /**
     * The view space from local space
     */
    @cached get viewFromLocal() {
        if (this.parentMetrics === this.system.viewMetrics) return this._viewFromLocal.copy(this.parentFromLocal)
        return this._viewFromLocal.multiplyMatrices(this.system.viewMetrics.localFromWorld, this.worldFromLocal)
    }
    private _viewFromLocal = new Matrix4

    /**
     * The view projection space from lacal space
     */
    @cached get viewProjectionFromLocal() {
        return this._viewProjectionFromLocal.multiplyMatrices(this.system.viewFrustum.perspectiveProjectionMatrix, this.viewFromLocal)
    }
    private _viewProjectionFromLocal = new Matrix4


    /**
     * The frustum of this node relative to the view
     */
    @cached get viewFrustum() {
        const viewBounds = this._viewBounds.copy(this.innerBounds).applyMatrix4(this.viewProjectionFromLocal)
        const viewPerspectiveMatrix =this._viewPerspective.makePerspective(
            viewBounds.min.x, viewBounds.max.x,
            viewBounds.min.y, viewBounds.max.y,
            viewBounds.min.z, viewBounds.max.z
        )
        return this._viewFrustum.setFromPerspectiveProjectionMatrix(viewPerspectiveMatrix)
    }
    private _viewBounds = new Box3
    private _viewFrustum = new LayoutFrustum
    private _viewPerspective = new Matrix4
    
}