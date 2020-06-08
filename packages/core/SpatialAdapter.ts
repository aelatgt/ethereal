import { EtherealSystem, Node3D } from './EtherealSystem'
import { cached, tracked, TrackedArray, memo } from './tracking'
import { SpatialLayout } from './SpatialLayout'
import { Transitionable, TransitionableConfig } from './SpatialTransitioner'
import { OptimizerConfig } from './SpatialOptimizer'
import { Quaternion, Box3 } from './math'
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
         * The wrapped third-party scenegraph node
         */
        public node:T
    ) {
        this.metrics = this.system.getMetrics(this.node)
        this.metrics.isBoundingContext = true
        this.parentNode = this.metrics.parentNode
        this.innerBounds = this.system.createTransitionable(this.metrics.innerBounds, undefined, this.transition)
        this.orientation = this.system.createTransitionable(this.metrics.layoutOrientation, undefined, this.transition)
        this.bounds = this.system.createTransitionable(this.metrics.layoutBounds, undefined, this.transition)
        this.opacity = this.system.createTransitionable(this.metrics.opacity, undefined, this.transition)
        this.orientation.synced = true
        this.bounds.synced = true
        this.opacity.synced = true
        this.needsUpdate = true
        this.enabled = true
    }

    /**
     * If false, the adapter will not modify the underlying node state
     */
    @tracked enabled = false

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
    @tracked parentNode? : Node3D | null

    /**
     * Transitionable inner bounds
     */
    readonly innerBounds : Transitionable<Box3>

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
     * By default, the behavior is memoized. 
     */
    behavior = (cb:()=>void, memoized = true) => {
        const behavior = memoized ? memo(cb) : cb
        this.behaviors.push(behavior)
    }

    /**
     * Add a layout with an associated behavior.
     * By default, the behavior is memoized. 
     */
    layout = (cb:(layout:SpatialLayout)=>void, memoized?:boolean) => {
        const layout = new SpatialLayout(this.system)
        this.behavior(() => cb(layout), memoized)
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
     * Update if necessary
     */
    update(force=false) {
        if (this.isRunningBehaviors) {
            console.warn(`Reactive behavior cycle detected. Make sure behaviors are not cyclically dependent`)
            return
        }
        if (this.isUpdating) return // applying solutions while optimizing will trigger updates
        if (!this.needsUpdate && !force) return
        this.needsUpdate = false
        this.isUpdating = true
        this.isRunningBehaviors = true
        for (const b of this.behaviors) b()
        this.isRunningBehaviors = false
        if (this.enabled) this.system.optimizer.update(this)
        this.orientation.update(force)
        this.opacity.update(force)
        this.bounds.update(force)
        this.isUpdating = false
    }

    /** */
    needsUpdate = true
    isUpdating = false
    isRunningBehaviors = false

}