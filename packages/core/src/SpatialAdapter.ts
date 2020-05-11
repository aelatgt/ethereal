import type { EtherealSystem, Node3D } from './EtherealSystem'
import { tracked, TrackedArray } from './tracking'
import { SpatialLayout } from './SpatialLayout'
import { Transitionable, TransitionableType, TransitionableConfig } from './SpatialTransitioner'
import { OptimizerConfig } from './SpatialOptimizer'
import { Quaternion, Box3 } from './math'


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
export class SpatialAdapter {

    constructor(
        /**
         * The wrapped third-party scenegraph node
         */
        public node:Node3D,
        /**
         * The EtherealSystem instance
         */
        public system:EtherealSystem,
        /**
         * This callback allows the adapter to be modified each frame
         * before computing the next target state
         */
        public preUpdate = ()=>{}
    ) {
        this.orientation.synced = true
        this.bounds.synced = true
        this.opacity.synced = true
    }

    /**
     * 
     */
    readonly transitionables = [] as Transitionable[]

    /**
     * Spatial Metrics
     */
    get metrics(){ return this.system.metrics(this.node) }

    /**
     * The target parent node
     * 
     * If `undefined`, target parent is the current parent
     * if `null`, this node is considered as flagged to be removed
     */
    @tracked targetParent? : Node3D | null | undefined

    /**
     * Transitionable layout orientation
     */
    readonly orientation = this.addTransitionable(new Quaternion)
    
    /**
     * Transitionable layout bounds
     */
    readonly bounds = this.addTransitionable(new Box3)

    /**
     * Transitionable opacity
     */
    readonly opacity = this.addTransitionable(1)

    /**
     * List of layout variants. If non-empty, the target 
     * orientation, bounds, and opacity will be automatically updated
     */
    get layouts() : SpatialLayout[] {
        return this.#layouts
    }
    set layouts(arr:SpatialLayout[]) {
        this.#layouts = <[]> (arr instanceof TrackedArray ? arr : new TrackedArray)
    }
    #layouts = new TrackedArray as SpatialLayout[]

    /**
     * Optimizer settings for this node
     */
    readonly optimize = new OptimizerConfig
    
    /**
     * Transitioner settings for this node
     */
    readonly transition = new TransitionableConfig

    /**
     * 
     */
    addTransitionable<T extends TransitionableType>(value:TransitionableType<T>, config?: TransitionableConfig) {
        const t = new Transitionable(this, value, config)
        this.transitionables.push(t)
        return t
    }
}