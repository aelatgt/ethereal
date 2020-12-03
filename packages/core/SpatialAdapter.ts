import { EtherealSystem, Node3D } from './EtherealSystem'
import { SpatialLayout } from './SpatialLayout'
import { Transitionable, TransitionConfig, Transition } from './Transitionable'
import { OptimizerConfig } from './SpatialOptimizer'
import { Quaternion, Box3, V_000, V_111 } from './math'
import { SpatialMetrics } from './SpatialMetrics'


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
export class SpatialAdapter<N extends Node3D = Node3D> {

    static behavior = {
        fadeOnEnterExit(adapter:SpatialAdapter) {
            if (adapter.opacity.target === 0 && 
                adapter.isTargetStable && 
                adapter.metrics.targetState.visualFrustum.angleToCenter < adapter.system.viewFrustum.diagonalDegrees) {
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
        public system:EtherealSystem<N>,
        /**
         * The wrapped third-party scenegraph nodes
         */
        public node:N
    ) {
        this.metrics = this.system.getMetrics(this.node)
        this._orientation = new Transitionable(this.system, new Quaternion, undefined, this.transition)
        this._bounds = new Transitionable(this.system, new Box3().setFromCenterAndSize(V_000,V_111), undefined, this.transition)
        this._opacity = new Transitionable(this.system, 0, undefined, this.transition)
        this._orientation.syncGroup = this._bounds.syncGroup = this._opacity.syncGroup = new Set
    }

    // /**
    //  * List of nodes to check for occlusion against
    //  */
    // occluders = [] as Node3D[]

    /**
     * 
     */
    readonly metrics : SpatialMetrics<N>

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
    set parentNode(p: N|null|undefined) {
        const currentParent = typeof this._parentNode !== 'undefined' ? this._parentNode : this.metrics.nodeState.parent
        const newParent = typeof p !== 'undefined' ? p : this.metrics.nodeState.parent
        if (newParent === currentParent) return
        const currentOuterMetrics = this.metrics.outerMetrics
        if (currentOuterMetrics) {
            const outerWorldOrientation = currentOuterMetrics.currentState.worldOrientation
            const outerWorldCenter = currentOuterMetrics.currentState.worldCenter
            this.orientation.start.premultiply(outerWorldOrientation)
            this.orientation.target.premultiply(outerWorldOrientation)
            this.orientation.reference?.premultiply(outerWorldOrientation)
            this.orientation.current.premultiply(outerWorldOrientation)
            for (const t of this.orientation.queue) { 
                t.target.premultiply(outerWorldOrientation) 
            }
            this.bounds.start.min.add(outerWorldCenter)
            this.bounds.start.max.add(outerWorldCenter)
            this.bounds.target.min.add(outerWorldCenter)
            this.bounds.target.max.add(outerWorldCenter)
            this.bounds.reference?.min.add(outerWorldCenter)
            this.bounds.reference?.max.add(outerWorldCenter)
            this.bounds.current.min.add(outerWorldCenter)
            this.bounds.current.max.add(outerWorldCenter)
            for (const t of this.bounds.queue) {
                t.target.min.add(outerWorldCenter)
                t.target.max.add(outerWorldCenter)
            }
        }
        this._parentNode = p
        const newOuterMetrics = this.metrics.outerMetrics
        if (this.metrics.parentNode && this.metrics.containsNode(this.metrics.parentNode)) {
            throw new Error(`Node cannot become it's own descendent`)
        }
        if (newOuterMetrics) {
            const outerState = newOuterMetrics.currentState
            const outerWorldOrientationInverse = outerState.worldOrientationInverse
            const outerWorldCenter = outerState.worldCenter
            this.orientation.start.premultiply(outerWorldOrientationInverse)
            this.orientation.target.premultiply(outerWorldOrientationInverse)
            this.orientation.reference?.premultiply(outerWorldOrientationInverse)
            this.orientation.current.premultiply(outerWorldOrientationInverse)
            for (const t of this.orientation.queue) { t.target.premultiply(outerWorldOrientationInverse) }
            this.bounds.start.min.sub(outerWorldCenter)
            this.bounds.start.max.sub(outerWorldCenter)
            this.bounds.target.min.sub(outerWorldCenter)
            this.bounds.target.max.sub(outerWorldCenter)
            this.bounds.reference?.min.sub(outerWorldCenter)
            this.bounds.reference?.max.sub(outerWorldCenter)
            this.bounds.current.min.sub(outerWorldCenter)
            this.bounds.current.max.sub(outerWorldCenter)
            for (const t of this.bounds.queue) {
                t.target.min.sub(outerWorldCenter)
                t.target.max.sub(outerWorldCenter)
            }
        }
    }
    get parentNode() { return this._parentNode }
    private _parentNode? : N | null

    /**
     * Transitionable layout orientation                                                                          
     */
    get orientation() {
        return this._orientation
    } 
    private _orientation : Transitionable<Quaternion>

    /** 
     * The relative point of attachment in the outer bounds
     */
    // get origin() {
    //     return this._origin
    // }
    // private _origin : Transitionable<Vector3>
    
    /**
     * Transitionable layout bounds
     */
    get bounds() {
        return this._bounds
    } 
    private _bounds : Transitionable<Box3>

    /**
     * Transitionable opacity
     */
    get opacity() {
        return this._opacity
    } 
    private _opacity : Transitionable<number>

    // /** 
    //  * Behaviors get called every frame
    //  */
    // behaviors = Array<()=>void>()

    /**
     * All layouts associated with this adapter. 
     */
    allLayouts = new Array<SpatialLayout>()

    /**
     * List of presentable layout variants. If non-empty, the target 
     * orientation, bounds, and opacity will be automatically updated.
     * Layouts in this list will be optimized with higher priority.
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
    get isTargetStable() {
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
        const layout = new SpatialLayout(this)
        this.allLayouts.push(layout)
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


    onUpdate? : () => void

    onLayout? : () => void

}