
import { Box3, Vector3, Quaternion, Matrix4, V_000, Q_IDENTITY, V_111 } from './math'
import { tracked, memo, TrackedArray } from './tracking'
import { EtherealSystem, Node3D, TrackedNodeState } from './EtherealSystem'
import { LayoutFrustum } from './LayoutFrustum'

/**
 * Efficiently and reactively compute spatial metrics 
 * based on *target* (not current) scenegraph state. 
 */
export class SpatialMetrics {
    
    constructor(public node:Node3D, public system:EtherealSystem) {}

    /**
     * Node adapter, if it exists
     */
    private get _adapter() { return this.system.nodeAdapters.get(this.node) }

    /**
     * The current state
     */
    @memo get currentState() : Readonly<TrackedNodeState> {
        this.system.time
        this.system.bindings.getCurrentState(this.node, this._currentState)
        return this._currentState
    }
    private _currentState = new TrackedNodeState

    /** 
     * The target parent
     */
    @memo get currentParent() {
        return this.currentState.parent
    }

    /**
     * The current children
     */
    @memo get currentChildren() : ReadonlyArray<Node3D> {
        this.system.time
        this.system.bindings.getCurrentChildren(this.node, this._currentChildren)
        return this._currentChildren
    }
    private _currentChildren = new TrackedArray as Node3D[]

    /** 
     * The target parent
     */
    @memo get parent() {
        return this._adapter?.targetParent ?? this.currentState.parent
    }

    /**
     * The target children
     */
    @memo get children() : ReadonlyArray<Node3D> {
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
        return this.system.metrics(n).parent === this.node
    }
    
    /**
     * The target parent metrics
     */
    @memo get parentMetrics() {
        const parent = this.parent
        if (!parent) return null
        return this.system.metrics(parent)
    }

    /**
     * 
     */
    get opacity() {
        return this._adapter?.opacity.target ?? this.currentState.opacity
    }

    /**
     * The intrinsic bounds of the geometry attached directly to this node (excluding child nodes)
     */
    get intrinsicBounds() {
        if (!this._intrinsicBounds) {
            this._intrinsicBounds = new Box3
            this.system.bindings.getIntrinsicBounds(this.node, this._intrinsicBounds)
        }
        return this._intrinsicBounds
    }
    set intrinsicBounds(b:Box3) {
        this._intrinsicBounds = b
    }
    @tracked private _intrinsicBounds?: Box3
    
    /**
     * The bounds of this node and non-adaptive child nodes in the local coordinate system
     */
    get innerBounds() {
        const inner = this._innerBounds
        inner.copy(this.intrinsicBounds)
        const childBounds = this._innerBoundsScratch
        for (const c of this.children) {
            const childMetrics = this.system.metrics(c)
            if (childMetrics._adapter) continue // child adapters can't be included in the inner bounds
            childBounds.copy(childMetrics.innerBounds)
            childBounds.applyMatrix4(childMetrics.parentFromLocal)
            inner.union(childBounds)
        }
        if (inner.isEmpty()) {
            inner.setFromCenterAndSize(V_000, V_111)
        }
        return inner
    }
    private _innerBounds = new Box3
    private _innerBoundsScratch = new Box3
    
    /**
     * inner center
     */
    @memo get innerCenter() {
        return this.innerBounds.getCenter(this._innerCenter)
    }
    private _innerCenter = new Vector3

    /**
     * inner size
     */
    @memo get innerSize() {
        return this.innerBounds.getSize(this._innerSize)
    }
    private _innerSize = new Vector3

    @memo private get localComponents() {
        const c = this._localComponents
        if (this._adapter) {
            const layoutBounds = this._adapter.bounds.target
            layoutBounds.getCenter(c.position)
            c.orientation.copy(this._adapter.orientation.target)
            layoutBounds.getSize(c.scale).divide(this.innerSize)
            const scaledInnerCenter = this._scaledCenter.copy(this.innerCenter).multiply(c.scale)
            c.position.sub(scaledInnerCenter)
            this.parentMetrics && c.position.add(this.parentMetrics.worldCenter)
            const worldMatrix = this._localComponentsMatrix.compose(c.position,c.orientation,c.scale)
            const localMatrix = worldMatrix.premultiply(this.parentFromWorld)
            localMatrix.decompose(c.position,c.orientation,c.scale)
        } else {
            const s = this.currentState
            c.position.copy(s.position)
            c.orientation.copy(s.orientation)
            c.scale.copy(s.scale)
        }
        return c
    }
    private _scaledCenter = new Vector3
    private _localComponentsMatrix = new Matrix4
    private _localComponents = {position:new Vector3, orientation: new Quaternion, scale:new Vector3}
    // private _localBounds = new Box3
    // private _localPosition = new Vector3


    /**
     * The position component of the local coordinate sytem
     */
    get localPosition() {
        // if (!this._adapter) return this.currentState.position
        // const innerCenter = this.innerCenter
        // const localBounds = this._localBounds.copy(this._adapter.bounds.target)
        // localBounds.min.sub(innerCenter)
        // localBounds.max.sub(innerCenter)
        // localBounds.applyMatrix4(this.localRotationInverse)
        // if (this.parentMetrics) {
        //     localBounds.min.divide(this.parentMetrics.worldScale)
        //     localBounds.max.divide(this.parentMetrics.worldScale)
        //     const parentCenter = this.parentMetrics.innerCenter
        //     // localBounds.applyMatrix4(this.parentFromWorld)
        //     localBounds.min.add(parentCenter)
        //     localBounds.max.add(parentCenter)
        // }
        // return localBounds.getCenter(this._localPosition)
        return this.localComponents.position
    }

    /**
     * The orientation component of the local cooridnate sytem
     */
    get localOrientation() {
        // return this._adapter?.orientation.target ?? this.currentState.orientation
        return this.localComponents.orientation
    }

    /**
     * The scale component of the local cooridnate sytem
     */
    get localScale() {
        // if (!this._adapter) return this.currentState.scale
        // const layoutBounds = this._adapter.bounds.target
        // const layoutSize = layoutBounds.getSize(this._localScale)
        // const worldScale = layoutSize.divide(this.innerSize).applyQuaternion(this.localOrientation)
        // const parentScale = this.parentMetrics?.worldScale || V_111
        // const localScale = worldScale.divide(parentScale)
        // return localScale//.applyMatrix4(this.parentFromWorld)
        return this.localComponents.scale
    }
    // private _localScale = new Vector3

    /**
     * Inverse orientation relative to local origin
     */
    @memo get localOrientationInverse() {
        return this._localOrientationInverse.copy(this.localOrientation).inverse()
    }
    private _localOrientationInverse = new Quaternion

    /**
     * Local rotation matrix
     */
    @memo get localRotation() {
        return this._localRotation.makeRotationFromQuaternion(this.localOrientation)
    }
    private _localRotation = new Matrix4

    /**
     * Local Orientation matrix inverse
     */
    @memo get localRotationInverse() {
        return this._localRotationInverse.makeRotationFromQuaternion(this.localOrientationInverse)
    }
    private _localRotationInverse = new Matrix4

    /**
     * The local matrix
     */
    @memo get parentFromLocal() {
        return this._parentFromLocal.compose(this.localPosition, this.localOrientation, this.localScale)
    }
    private _parentFromLocal = new Matrix4

    /**
     * The inverse local matrix
     */
    @memo get localFromParent() {
        return this._localFromParent.getInverse(this.parentFromLocal)
    }
    private _localFromParent = new Matrix4

    /**
     * Convert to parent space from world space (the parent inverse world matrix)
     */
    @memo get parentFromWorld() {
        return this.parentMetrics ? this.parentMetrics.localFromWorld : this._identity.identity()
    }
    private _identity = new Matrix4

    /**
     * The world matrix
     */
    @memo get worldFromLocal() : Matrix4 {
        const worldFromParent = this.parentMetrics?.worldFromLocal
        if (!worldFromParent) return this._worldFromLocal.copy(this.parentFromLocal)
        return this._worldFromLocal.multiplyMatrices(worldFromParent, this.parentFromLocal)
    }
    private _worldFromLocal = new Matrix4

    /**
     * The inverse world matrix
     */
    @memo get localFromWorld() : Matrix4 {
        return this._localFromWorld.getInverse(this.worldFromLocal)
    }
    private _localFromWorld = new Matrix4

    /**
     * World components
     */
    @memo private get worldComponents() {
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
    @memo get worldOrientationInverse() {
        return this._worldOrientationInverse.copy(this.worldOrientation).inverse()
    }
    private _worldOrientationInverse = new Quaternion

    /**
     * World orientation matrix
     */
    @memo get worldOrientationMatrix() {
        return this._worldOrientationMatrix.makeRotationFromQuaternion(this.worldOrientation)
    }
    private _worldOrientationMatrix = new Matrix4

    /**
     * World Orientation matrix inverse
     */
    @memo get worldOrientationMatrixInverse() {
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
    @memo get worldFromLayout() {
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
    @memo get localFromLayout() {
        return this._localFromLayout.multiplyMatrices(this.localFromWorld, this.worldFromLayout)
    }
    private _localFromLayout = new Matrix4

    /**
     * Convert to layout space from local space
     */
    @memo get layoutFromLocal() {
        return this._layoutFromLocal.getInverse(this.localFromLayout)
    }
    private _layoutFromLocal = new Matrix4

    /**
     * Convert to layout space from parent space
     */
    @memo get layoutFromParent() {
        return this._layoutFromParent.multiplyMatrices(this.layoutFromLocal, this.localFromParent)
    }
    private _layoutFromParent = new Matrix4
    
    /**
     * The layout bounds 
     */
    @memo get layoutBounds() {
        return this._layoutBounds.copy(this.innerBounds).applyMatrix4(this.layoutFromLocal)
    }
    private _layoutBounds = new Box3

    /**
     * The layout size
     */
    @memo get layoutSize() {
        return this.layoutBounds.getSize(this._layoutSize)
    }
    private _layoutSize = new Vector3

    /**
     * The parent bounds in layout space
     */
    @memo get outerBounds() {
        const parentMetrics = this.parentMetrics
        return parentMetrics ? 
            this._outerBounds.copy(parentMetrics.innerBounds).applyMatrix4(this.layoutFromParent) :
            this._outerBounds.makeEmpty()
    }
    private _outerBounds = new Box3

    /**
     * 
     */
    @memo get outerSize() {
        return this.outerBounds.getSize(this._outerSize)
    }
    private _outerSize = new Vector3

    /**
     * The layout bounds in proportional units ( identity with parent layout is center=[0,0,0] size=[1,1,1] )
     */
    @memo get proportionalBounds() {
        const proportional = this._proportionalBounds.copy(this.layoutBounds)
        proportional.min.divide(this.outerSize)
        proportional.max.divide(this.outerSize)
        return proportional
    }
    private _proportionalBounds = new Box3

    /**
     * Proportional size
     */
    @memo get proportionalSize() {
        return this.proportionalBounds.getSize(this._proportionalSize)
    }
    private _proportionalSize = new Vector3
    

    /**
     * The view space from local space
     */
    @memo get viewFromLocal() {
        if (this.parentMetrics === this.system.viewMetrics) return this._viewFromLocal.copy(this.parentFromLocal)
        return this._viewFromLocal.multiplyMatrices(this.system.viewMetrics.localFromWorld, this.worldFromLocal)
    }
    private _viewFromLocal = new Matrix4

    /**
     * The view projection space from lacal space
     */
    @memo get viewProjectionFromLocal() {
        return this._viewProjectionFromLocal.multiplyMatrices(this.system.viewFrustum.perspectiveProjectionMatrix, this.viewFromLocal)
    }
    private _viewProjectionFromLocal = new Matrix4


    /**
     * The frustum of this node relative to the view
     */
    @memo get viewFrustum() {
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