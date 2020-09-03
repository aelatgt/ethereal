import { SpatialMetrics, NodeState } from './SpatialMetrics'
import { SpatialAdapter } from './SpatialAdapter'
import { Box3, MathType } from './math'
import { SpatialOptimizer, OptimizerConfig } from './SpatialOptimizer'
import { SpatialTransitioner, TransitionConfig, easing } from './SpatialTransitioner'
import { LayoutFrustum } from './LayoutFrustum'

/**
 * A third-party scenegraph node instance (e.g., THREE.Object3D)
 */
export type Node3D = { __isSceneGraphNode: true }

/**
 * Bindings for a scenegraph node instance (glue layer)
 */
export interface NodeBindings {
    getChildren(metrics:SpatialMetrics, children:Node3D[]) : void
    getState(metrics:SpatialMetrics, state:NodeState) : void
    getIntrinsicBounds(metrics:SpatialMetrics, bounds:Box3) : void
    apply(metrics:SpatialMetrics, state:Readonly<NodeState>) : void
}

/**
 * Manages spatial adaptivity within an entire scene graph
 */
export class EtherealSystem {

    constructor(public bindings:NodeBindings) { }

    config = {
        cachingEnabled: true,
        epsillonMeters: 1e-10,
        epsillonRadians: 1e-10,
        epsillonRatio: 1e-10,
        transition: new TransitionConfig({
            multiplier: 1,
            duration: 0,
            easing: easing.easeInOut,
            threshold: 0,
            delay: 0,
            debounce: 0,
            maxWait: 10,
            blend: true
        }) as Required<TransitionConfig>,
        optimize: new OptimizerConfig({
            constraintThreshold: 0.005,
            constraintRelativeTolerance: 0.005,
            objectiveRelativeTolerance: 0.01,
            iterationsPerFrame: 2, // iterations per frame per layout
            swarmSize: 2, // solutions per layout
            minPulseFrequency: 0, // minimal exploitation pulse
            maxPulseFrequency: 1.5, // maximal exploitation pulse
            pulseRate: 0.1, // The ratio of directed exploitation vs random exploration
        }) as Required<OptimizerConfig>
    }

    /**
     * 
     */
    optimizer = new SpatialOptimizer(this)

    /**
     * The view node
     */
    viewNode!: Node3D

    /**
     * The view layout frustum
     */
    viewFrustum = new LayoutFrustum

    /**
     * The deltaTime for the current frame (seconds)
     * @readonly
     */
    deltaTime = 1/60

    /**
     * The time for the current frame (seconds)
     * @readonly
     */
    time = -1
    
    /**
     * The maximum delta time value
     */
    maxDeltaTime = 1/60

    /** 
     * SpatialMetrics for Node3D
     */
    nodeMetrics = new Map<Node3D, SpatialMetrics>()

    /** 
     * SpatialAdapter for Node3D
     */
    nodeAdapters = new Map<Node3D, SpatialAdapter>()

    /**
     * 
     */
    readonly transitionables = [] as SpatialTransitioner<MathType>[]

    /**
     * 
     */
    get viewMetrics() {
        return this.getMetrics(this.viewNode!)
    }

    /**
     * Get or create a SpatialMetrics instance which wraps a third-party node instance (e.g., THREE.Object3D instance)
     */
    getMetrics = <N extends Node3D> (node:N) => {
        let metrics = this.nodeMetrics.get(node) as SpatialMetrics<N>
        if (!metrics) {
            metrics = new SpatialMetrics(this, node)
            this.nodeMetrics.set(node, metrics)
            // for (const c of metrics.children) this.getMetrics(c)
        }
        return metrics 
    }

    /**
     * 
     */
    getState = <N extends Node3D> (node:N) => {
        return this.getMetrics(node).targetState
    }

    /**
     * Get or create a SpatialAdapter instance which wraps a third-party node instance (e.g., THREE.Object3D instance)
     * @param node 
     */
    getAdapter = <N extends Node3D> (node:N) => {
        let adapter = this.nodeAdapters.get(node) as SpatialAdapter<N>
        if (!adapter) {
            adapter = new SpatialAdapter(this, node)
            this.nodeAdapters.set(node, adapter)
        }
        return adapter 
    }

    /**
     * Create a SpatialTransitioner instance
     */
    createTransitioner = <T extends MathType> (value:T, config?:TransitionConfig, parentConfig:TransitionConfig=this.config.transition) => {
        const t = new SpatialTransitioner(this, value, config, parentConfig)
        this.transitionables.push(t)
        return t as any as SpatialTransitioner<T>
    }

    /**
     * 
     * @param sceneNode 
     * @param viewNode 
     * @param deltaTime 
     * @param time 
     */
    update(deltaTime:number, time:number) {

        this.deltaTime = Math.max(deltaTime, this.maxDeltaTime)
        this.time = time

        for (const metrics of this.nodeMetrics.values()) {
            metrics.needsUpdate = true
            const adapter = this.nodeAdapters.get(metrics.node)
            if (adapter) {
                adapter.opacity.needsUpdate = true
                adapter.orientation.needsUpdate = true
                // adapter.origin.needsUpdate = true
                adapter.bounds.needsUpdate = true
            }
        }

        for (const transitionable of this.transitionables) {
            transitionable.needsUpdate = true
        }

        for (const transitionable of this.transitionables) {
            transitionable.update()
        }

        this.viewMetrics.update()
        
        for (const adapter of this.nodeAdapters.values()) {
            adapter.metrics.update()
        }

    }

    // private _compareAdapterHeirarchy = (adapterA:SpatialAdapter, adapterB:SpatialAdapter) => {
    //     if (adapterA.metrics.containsNode(adapterB.node)) {
    //         return -1
    //     }
    //     if (adapterB.metrics.containsNode(adapterA.node)) {
    //         return 1
    //     }
    //     return 0
    // }
}