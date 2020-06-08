import { tracked, TrackedMap } from './tracking'
import { SpatialMetrics } from './SpatialMetrics'
import { SpatialAdapter } from './SpatialAdapter'
import { Vector2, Vector3, Quaternion, Box3, MathType } from './math'
import { SpatialOptimizer } from './SpatialOptimizer'
import { SpatialTransitioner, Transitionable, TransitionableConfig } from './SpatialTransitioner'
import { LayoutFrustum } from './LayoutFrustum'

/**
 * A third-party scenegraph node instance (e.g., THREE.Object3D)
 */
export type Node3D = { __isSceneGraphNode: true }

export class NodeState {
    parent : Node3D|null = null
    position  = new Vector3(0,0,0)
    orientation = new Quaternion(0,0,0,1)
    scale  = new Vector3(1,1,1)
    opacity = 1
}

/**
 * Bindings for a scenegraph node instance (glue layer)
 */
export abstract class NodeBindings {
    abstract getCurrentState(node:Node3D, state:NodeState) : NodeState
    abstract setCurrentState(node:Node3D, state:NodeState) : void
    abstract getCurrentChildren(node:Node3D, children:Node3D[]) : void
    abstract getIntrinsicBounds(node:Node3D, bounds:Box3) : void
}

/**
 * Manages spatial adaptivity within an entire scene graph
 */
export class EtherealSystem {

    constructor(public bindings:NodeBindings) {}

    epsillonMeters = 1e-8
    epsillonDegrees = 1e-8
    epsillonRatio = 1e-8

    /**
     * 
     */
    optimizer = new SpatialOptimizer(this)

    /**
     * 
     */
    transitioner = new SpatialTransitioner(this)

    /**
     * The view node
     */
    @tracked viewNode = {} as Node3D

    /**
     * The view layout frustum
     */
    @tracked viewFrustum = new LayoutFrustum

    /**
     * The deltaTime for the current frame (seconds)
     * @readonly
     */
    @tracked deltaTime = 1/60

    /**
     * The time for the current frame (seconds)
     * @readonly
     */
    @tracked time = -1
    
    /**
     * The maximum delta time value
     */
    maxDeltaTime = 1/60

    /** 
     * SpatialMetrics for Node3D
     */
    nodeMetrics = new TrackedMap<Node3D, SpatialMetrics>()

    /** 
     * SpatialAdapter for Node3D
     */
    nodeAdapters = new TrackedMap<Node3D, SpatialAdapter>()

    /**
     * 
     */
    readonly transitionables = [] as Transitionable<MathType>[]

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
        }
        return metrics 
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
     * Create a transitionable value
     */
    createTransitionable = <T extends MathType> (value:T, config?:TransitionableConfig, parentConfig:TransitionableConfig=this.transitioner.defaults) => {
        const t = new Transitionable<T>(this, value, config, parentConfig)
        this.transitionables.push(t)
        return t
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

        for (const adapter of this.nodeAdapters.values()) {
            adapter.needsUpdate = true
        }

        for (const transitionable of this.transitionables) {
            transitionable.needsUpdate = true
        }

        for (const adapter of this.nodeAdapters.values()) {
            adapter.update()
        }
        
        for (const transitionable of this.transitionables) {
            transitionable.update()
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