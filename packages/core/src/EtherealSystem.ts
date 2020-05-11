import { tracked, TrackedMap } from './tracking'
import { SpatialMetrics } from './SpatialMetrics'
import { SpatialAdapter } from './SpatialAdapter'
import { Vector3, Quaternion, Box3 } from './math'
import { SpatialOptimizer } from './SpatialOptimizer'
import { SpatialTransitioner } from './SpatialTransitioner'
import { LayoutFrustum } from './LayoutFrustum'

/**
 * A third-party scenegraph node instance (e.g., THREE.Object3D)
 */
export type Node3D = { __isSceneGraphNode: true }

export class TrackedNodeState {
    @tracked parent : Node3D|null = null
    @tracked position  = new Vector3(0,0,0)
    @tracked orientation = new Quaternion(0,0,0,1)
    @tracked scale  = new Vector3(1,1,1)
    @tracked opacity = 1
}

/**
 * Bindings for a scenegraph node instance (glue layer)
 */
export abstract class NodeBindings {
    abstract getCurrentState(node:Node3D, state:TrackedNodeState) : void
    abstract setCurrentState(node:Node3D, state:TrackedNodeState) : void
    abstract getCurrentChildren(node:Node3D, children:Node3D[]) : void
    abstract getIntrinsicBounds(node:Node3D, bounds:Box3) : void
}

/**
 * Manages spatial adaptivity within an entire scene graph
 */
export abstract class EtherealSystem {

    constructor(public bindings:NodeBindings, viewNode:Node3D) {
        this.viewNode = viewNode
    }

    /**
     * 
     */
    optimizer = new SpatialOptimizer

    /**
     * 
     */
    transitioner = new SpatialTransitioner
    

    /**
     * The view node
     */
    @tracked viewNode = null as Node3D|null

    /**
     * The view's layout frustum
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
    get viewMetrics() {
        return this.metrics(this.viewNode!)
    }

    /**
     * Get or create a SpatialMetrics instance which wraps a third-party node instance (e.g., THREE.Object3D instance)
     */
    metrics(node:Node3D) {
        let metrics = this.nodeMetrics.get(node)
        if (!metrics) {
            metrics = new SpatialMetrics(node, this)
            this.nodeMetrics.set(node, metrics)
        }
        return metrics 
    }

    /**
     * Get or create a SpatialAdapter instance which wraps a third-party node instance (e.g., THREE.Object3D instance)
     * @param node 
     */
    adapter(node:Node3D, preUpdate?: ()=>{} ) {
        let adapter = this.nodeAdapters.get(node)
        if (!adapter) {
            adapter = new SpatialAdapter(node, this, preUpdate)
            this.nodeAdapters.set(node, adapter)
        }
        return adapter 
    }

    /**
     * 
     * @param sceneNode 
     * @param viewNode 
     * @param deltaTime 
     * @param time 
     */
    update(deltaTime:number, time:number) {
        this.deltaTime = Math.max(deltaTime, 1/60)
        this.time = time
        for (const adapter of this.nodeAdapters.values()) {
            adapter.preUpdate()
            this.optimizer.update(adapter)
            this.transitioner.update(adapter)
        }
    }
}