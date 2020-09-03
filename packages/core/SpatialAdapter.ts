import { EtherealSystem, Node3D } from './EtherealSystem'
import { SpatialLayout } from './SpatialLayout'
import { SpatialTransitioner, TransitionConfig, Transition } from './SpatialTransitioner'
import { OptimizerConfig } from './SpatialOptimizer'
import { Quaternion, Box3, V_000, V_111, Vector3 } from './math'
import { SpatialMetrics, NodeState } from './SpatialMetrics'


/**
 * This class enables *spatially adaptive layout* for a single node in a scenegraph.
 * 
 * This integrates several core capabilties:
 * 
 *  - layout engine: a 3D box-model layout engine, enabling content layout be flexibly specificed 
 *      in relation to other content
 * 
 *  - metrics engine: performant reactive computation of various spatial metrics,
 *      enabling the straightforward specification of layout constraints and objectives
 * 
 *  - optimization engine: a swarm metahueristics engine, enabling layout to be optimized 
 *      based on configurable layout constraints/objectives
 * 
 *  - transition engine: a Finite Impulse Response transition engine w/ configurable hysteresis,
 *      enabling layout transitions that can be smoothly combined with various easings, 
 *      and gauranteed to settle within their individual transition windows 
 */
export class SpatialAdapter<T extends Node3D = Node3D> {

    static behavior = {
        fadeOnEnterExit(adapter:SpatialAdapter) {
            if (adapter.opacity.target === 0 && 
                adapter.hasStablePose && 
                adapter.metrics.targetState.visualFrustum.angleToCenter < adapter.system.viewFrustum.diagonalLength) {
                adapter.opacity.forceCommit = new Transition({target: 1, blend:false})
                return
            }
            if (adapter.opacity.target > 0 && !adapter.metrics.parentNode) {
                adapter.opacity.target = 0
            }
        },
        fadeOnPoseChange(adapter:SpatialAdapter, relativeDifference = 0.1) {
            if (adapter.opacity.target === 0 ) {}
        },
        fadeOnLayoutChange() {
            
        },
        pauseMotionOnFade(adapter:SpatialAdapter) {
            if (adapter ) {}
        }
    }

    constructor(
        /**
         * The EtherealSystem instance
         */
        public system:EtherealSystem,
        /**
         * The wrapped third-party scenegraph nodes
         */
        public node:T
    ) {
        this.metrics = this.system.getMetrics(this.node)
        this._orientation = new SpatialTransitioner(this.system, new Quaternion, undefined, this.transition)
        // this._origin = new SpatialTransitioner(this.system, new Vector3(0.5,0.5,0.5), undefined, this.transition)
        this._bounds = new SpatialTransitioner(this.system, new Box3().setFromCenterAndSize(V_000,V_111), undefined, this.transition)
        this._opacity = new SpatialTransitioner(this.system, 0, undefined, this.transition)
        // this._orientation.syncGroup = this._origin.syncGroup = this._bounds.syncGroup = this._opacity.syncGroup = new Set
        this._orientation.syncGroup = this._bounds.syncGroup = this._opacity.syncGroup = new Set
    }

    // /**
    //  * List of nodes to check for occlusion against
    //  */
    // occluders = [] as Node3D[]

    /**
     * 
     */
    readonly metrics : SpatialMetrics

    /**
     * Optimizer settings for this node
     */
    readonly optimize = new OptimizerConfig
    
    /**
     * Transition overrides for this node
     */
    readonly transition = new TransitionConfig

    /**
     * The target parent node
     * 
     * If `undefined`, target parent is the current parent
     * if `null`, this node is considered as flagged to be removed
     */
    set parentNode(p: Node3D|null|undefined) {
        const currentParent = typeof this._parentNode !== 'undefined' ? this._parentNode : this.metrics.nodeState.parent
        const newParent = typeof p !== 'undefined' ? p : this.metrics.nodeState.parent
        if (newParent === currentParent) return
        this._parentNode = p
        if (currentParent) {
            const parentAdapter = this.system.getAdapter(currentParent)
            parentAdapter._addedChildren.delete(this.node)
            
            const parentState = parentAdapter.metrics.targetState
            const parentWorldOrientation = parentState.worldOrientation
            const parentWorldCenter = parentState.worldCenter
            this.orientation.start.premultiply(parentWorldOrientation)
            this.orientation.target.premultiply(parentWorldOrientation)
            this.orientation.reference?.premultiply(parentWorldOrientation)
            for (const t of this.orientation.queue) { t.target.premultiply(parentWorldOrientation ) }
            this.bounds.start.min.add(parentWorldCenter)
            this.bounds.start.max.add(parentWorldCenter)
            this.bounds.target.min.add(parentWorldCenter)
            this.bounds.target.max.add(parentWorldCenter)
            this.bounds.reference?.min.add(parentWorldCenter)
            this.bounds.reference?.max.add(parentWorldCenter)
            for (const t of this.bounds.queue) {
                t.target.min.add(parentWorldCenter)
                t.target.max.add(parentWorldCenter)
            }
        }
        if (newParent) {
            const parentAdapter = this.system.getAdapter(newParent)
            parentAdapter._addedChildren.add(this.node)

            const parentState = parentAdapter.metrics.targetState
            const parentWorldOrientationInverse = parentState.worldOrientationInverse
            const parentWorldCenter = parentState.worldCenter
            this.orientation.start.premultiply(parentWorldOrientationInverse)
            this.orientation.target.premultiply(parentWorldOrientationInverse)
            this.orientation.reference?.premultiply(parentWorldOrientationInverse)
            for (const t of this.orientation.queue) { t.target.premultiply(parentWorldOrientationInverse ) }
            this.bounds.start.min.sub(parentWorldCenter)
            this.bounds.start.max.sub(parentWorldCenter)
            this.bounds.target.min.sub(parentWorldCenter)
            this.bounds.target.max.sub(parentWorldCenter)
            this.bounds.reference?.min.sub(parentWorldCenter)
            this.bounds.reference?.max.sub(parentWorldCenter)
            for (const t of this.bounds.queue) {
                t.target.min.sub(parentWorldCenter)
                t.target.max.sub(parentWorldCenter)
            }

            // if this node gets added to one of it's children, 
            // detache the branch that contains that child
            // in order to avoid a circular scenegraph 
            // (presuambly, the detached branch will be reattached to a different
            // node in the same frame)
            const containingBranchNode = this.metrics.containsNode(parentAdapter.node)
            if (containingBranchNode) { 
                this.system.getAdapter(containingBranchNode).parentNode = null
            }
        }
    }
    get parentNode() { return this._parentNode }
    private _parentNode? : Node3D | null

    /**
     * Children that are to be added to this node
     */
    get addedChildren() { return this._addedChildren as ReadonlySet<Node3D> }
    private _addedChildren = new Set<Node3D>()


    /**
     * Transitionable layout orientation                                                                          
     */
    get orientation() {
        return this._orientation
    } 
    private _orientation : SpatialTransitioner<Quaternion>

    /** 
     * The relative point of attachment in the outer bounds
     */
    // get origin() {
    //     return this._origin
    // }
    // private _origin : SpatialTransitioner<Vector3>
    
    /**
     * Transitionable layout bounds
     */
    get bounds() {
        return this._bounds
    } 
    private _bounds : SpatialTransitioner<Box3>

    /**
     * Transitionable opacity
     */
    get opacity() {
        return this._opacity
    } 
    private _opacity : SpatialTransitioner<number>

    // /** 
    //  * Behaviors get called every frame
    //  */
    // behaviors = Array<()=>void>()

    /**
     * List of layout variants. If non-empty, the target 
     * orientation, bounds, and opacity will be automatically updated
     */
    layouts = new Array<SpatialLayout>()

    get previousLayout() {
        return this._prevLayout
    }
    private _prevLayout = null as SpatialLayout|null

    set activeLayout(val:SpatialLayout|null) {
        this._prevLayout = this._activeLayout
        this._activeLayout = val
    }
    get activeLayout() {
        return this._activeLayout
    }
    private _activeLayout = null as SpatialLayout|null

    /**
     * 
     */
    get hasStablePose() {
        return this.metrics.parentNode && this.orientation.status === "unchanged" && this.bounds.status === "unchanged"
    }

    /**
     * Add a layout with an associated behavior.
     */
    // layout = (update:(layout:SpatialLayout)=>void, active?:(layout:SpatialLayout)=>void) => {
    //     const layout = new SpatialLayout(this.system, active)
    //     this.layouts.push(layout)
    //     this.behaviors.push(() => update(layout))
    // }
    createLayout() {
        const layout = new SpatialLayout()
        this.layouts.push(layout)
        return layout
    }

    // /**
    //  * Reset the target state to match the current node state
    //  */
    // retarget(node:Node3D=this.node) {
    //     this.enabled = false
    //     this.metrics.invalidateCurrentState()
    //     this.parentNode = this.metrics.parentNode
    //     this.orientation.target = this.metrics.layoutOrientation
    //     this.bounds.target = this.metrics.layoutBounds
    //     this.opacity.target = this.metrics.opacity
    //     this.enabled = true
    // }

    // _update() {
    //     const metrics = this.metrics
    //     const nodeState = metrics.nodeState as NodeState

       
    // }
    // private _currentMatrix = new Matrix4


    onUpdate = (system:EtherealSystem) => {}

    onLayout = (system:EtherealSystem) => {}

}