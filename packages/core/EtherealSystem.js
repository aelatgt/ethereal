import { SpatialMetrics } from './SpatialMetrics';
import { SpatialAdapter } from './SpatialAdapter';
import { SpatialOptimizer, OptimizerConfig } from './SpatialOptimizer';
import { SpatialTransitioner, TransitionConfig, easing } from './SpatialTransitioner';
import { LayoutFrustum } from './LayoutFrustum';
/**
 * Manages spatial adaptivity within an entire scene graph
 */
export class EtherealSystem {
    constructor(bindings) {
        this.bindings = bindings;
        this.config = {
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
            }),
            optimize: new OptimizerConfig({
                constraintThreshold: 0.005,
                constraintRelativeTolerance: 0.005,
                objectiveRelativeTolerance: 0.01,
                iterationsPerFrame: 2,
                swarmSize: 2,
                minPulseFrequency: 0,
                maxPulseFrequency: 1.5,
                pulseRate: 0.1,
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
            let metrics = this.nodeMetrics.get(node);
            if (!metrics) {
                metrics = new SpatialMetrics(this, node);
                this.nodeMetrics.set(node, metrics);
                // for (const c of metrics.children) this.getMetrics(c)
            }
            return metrics;
        };
        /**
         *
         */
        this.getState = (node) => {
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
         * Create a SpatialTransitioner instance
         */
        this.createTransitioner = (value, config, parentConfig = this.config.transition) => {
            const t = new SpatialTransitioner(this, value, config, parentConfig);
            this.transitionables.push(t);
            return t;
        };
    }
    /**
     *
     */
    get viewMetrics() {
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
                // adapter.origin.needsUpdate = true
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
