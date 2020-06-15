import { EtherealSystem, Node3D } from './EtherealSystem'
import { tracked, TrackedArray, isTracking } from './tracking'
import { SpatialLayout } from './SpatialLayout'
import { Transitionable, TransitionableConfig } from './SpatialTransitioner'
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
export class SpatialAdapter<T extends Node3D = Node3D> {

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
        this.orientation = this.system.createTransitionable(new Quaternion, undefined, this.transition)
        this.bounds = this.system.createTransitionable(new Box3().setFromCenterAndSize(V_000,V_111), undefined, this.transition)
        this.opacity = this.system.createTransitionable(0, undefined, this.transition)
        this.orientation.synced = true
        this.bounds.synced = true
        this.opacity.synced = true
        this.metrics.needsUpdate = true
    }

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
    readonly transition = new TransitionableConfig

    /**
     * The target parent node
     * 
     * If `undefined`, target parent is the current parent
     * if `null`, this node is considered as flagged to be removed
     */
    set parentNode(p: Node3D|null|undefined) {
        const currentParent = this.metrics.parentNode
        this._parentNode = p
        if (p === currentParent) return
        if (currentParent) {
            const parentAdapter = this.system.getAdapter(currentParent)
            parentAdapter.addedChildren.delete(this.node)
            parentAdapter.addedChildren = parentAdapter.addedChildren
        }
        if (p) {
            const parentAdapter = this.system.getAdapter(p)
            parentAdapter.addedChildren.add(this.node)
            parentAdapter.addedChildren = parentAdapter.addedChildren
        }
    }
    get parentNode() {
        return this._parentNode
    }
    @tracked private _parentNode? : Node3D | null

    /**
     * Children that are to be added to this node
     */
    @tracked addedChildren = new Set<Node3D>()

    /**
     * Transitionable layout orientation                                                                          
     */
    readonly orientation : Transitionable<Quaternion>
    
    /**
     * Transitionable layout bounds
     */
    readonly bounds : Transitionable<Box3>

    /**
     * Transitionable opacity
     */
    readonly opacity : Transitionable<number>

    /** 
     * Behaviors get called every frame
     */
    readonly behaviors = new TrackedArray<()=>void>()

    /**
     * List of layout variants. If non-empty, the target 
     * orientation, bounds, and opacity will be automatically updated
     */
    readonly layouts = new TrackedArray<SpatialLayout>()

    /**
     * Add a behavior. 
     */
    behavior = (cb:()=>void) => {
        this.behaviors.push(cb)
    }

    /**
     * Add a layout with an associated behavior.
     * By default, the behavior is memoized. 
     */
    layout = (cb:(layout:SpatialLayout)=>void) => {
        const layout = new SpatialLayout(this.system)
        this.layouts.push(layout)
        this.behavior(() => cb(layout))
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

    /**
     * Update if necessary\
     */
    // update(force=false) {
    // }

}