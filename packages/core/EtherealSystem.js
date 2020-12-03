import { SpatialMetrics } from './SpatialMetrics';
import { SpatialAdapter } from './SpatialAdapter';
import { SpatialOptimizer, OptimizerConfig } from './SpatialOptimizer';
import { Transitionable, TransitionConfig, easing } from './Transitionable';
import { LayoutFrustum } from './LayoutFrustum';
/**
 * Manages spatial adaptivity within an entire scene graph
 */
export class EtherealSystem {
    constructor(viewNode, bindings) {
        this.viewNode = viewNode;
        this.bindings = bindings;
        this.config = {
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
            }),
            optimize: new OptimizerConfig({
                constraintThreshold: 0.1,
                relativeTolerance: 0.4,
                absoluteTolerance: 0.1,
                iterationsPerFrame: 30,
                swarmSize: 5,
                pulseFrequencyMin: 0,
                pulseFrequencyMax: 1.5,
                pulseRate: 0.01,
                stepSizeMin: 0.000001,
                stepSizeMax: 10,
                stepSizeStart: 0.5,
                staleRestartRate: 0.02,
                successRateMovingAverage: 50
            })
        };
        /**
         *
         */
        this.optimizer = new SpatialOptimizer(this);
        /**
         * The view layout frustum
         */
        this.viewFrustum = new LayoutFrustum;
        /**
         * The deltaTime for the current frame (seconds)
         * @readonly
         */
        this.deltaTime = 1 / 60;
        /**
         * The time for the current frame (seconds)
         * @readonly
         */
        this.time = -1;
        /**
         * The maximum delta time value
         */
        this.maxDeltaTime = 1 / 60;
        /**
         * SpatialMetrics for Node3D
         */
        this.nodeMetrics = new Map();
        /**
         * SpatialAdapter for Node3D
         */
        this.nodeAdapters = new Map();
        /**
         *
         */
        this.transitionables = [];
        /**
         * Get or create a SpatialMetrics instance which wraps a third-party node instance (e.g., THREE.Object3D instance)
         */
        this.getMetrics = (node) => {
            if (!node)
                throw new Error('node must be defined');
            let metrics = this.nodeMetrics.get(node);
            if (!metrics) {
                metrics = new SpatialMetrics(this, node);
                this.nodeMetrics.set(node, metrics);
            }
            return metrics;
        };
        /**
         *
         */
        this.getState = (node) => {
            if (!node)
                throw new Error('node must be defined');
            return this.getMetrics(node).targetState;
        };
        /**
         * Get or create a SpatialAdapter instance which wraps a third-party node instance (e.g., THREE.Object3D instance)
         * @param node
         */
        this.getAdapter = (node) => {
            let adapter = this.nodeAdapters.get(node);
            if (!adapter) {
                adapter = new SpatialAdapter(this, node);
                this.nodeAdapters.set(node, adapter);
            }
            return adapter;
        };
        /**
         * Create a Transitionable instance
         */
        this.createTransitionable = (value, config) => {
            const t = new Transitionable(this, value, config, this.config.transition);
            this.transitionables.push(t);
            return t;
        };
    }
    /**
     *
     */
    get viewMetrics() {
        if (!this.viewNode)
            throw new Error('EtherealSystem.viewNode must be defined');
        return this.getMetrics(this.viewNode);
    }
    /**
     *
     * @param sceneNode
     * @param viewNode
     * @param deltaTime
     * @param time
     */
    update(deltaTime, time) {
        this.deltaTime = Math.max(deltaTime, this.maxDeltaTime);
        this.time = time;
        for (const metrics of this.nodeMetrics.values()) {
            metrics.needsUpdate = true;
            const adapter = this.nodeAdapters.get(metrics.node);
            if (adapter) {
                adapter.opacity.needsUpdate = true;
                adapter.orientation.needsUpdate = true;
                adapter.bounds.needsUpdate = true;
            }
        }
        for (const transitionable of this.transitionables) {
            transitionable.needsUpdate = true;
        }
        for (const transitionable of this.transitionables) {
            transitionable.update();
        }
        this.viewMetrics.update();
        for (const adapter of this.nodeAdapters.values()) {
            adapter.metrics.update();
        }
    }
}
