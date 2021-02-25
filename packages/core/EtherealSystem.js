import { SpatialMetrics } from './SpatialMetrics';
import { SpatialAdapter } from './SpatialAdapter';
import { Vector2 } from './math-utils';
import { SpatialOptimizer, OptimizerConfig } from './SpatialOptimizer';
import { Transitionable, TransitionConfig, easing } from './Transitionable';
import { LayoutFrustum } from './LayoutFrustum';
import { create, evaluateDependencies, addDependencies, subtractDependencies, multiplyDependencies, divideDependencies, numberDependencies, modDependencies, createUnitDependencies, unitDependencies } from 'mathjs';
/**
 * Manages spatial adaptivity within an entire scene graph
 */
export class EtherealSystem {
    constructor(viewNode, bindings) {
        this.viewNode = viewNode;
        this.bindings = bindings;
        this.math = create({
            evaluateDependencies,
            addDependencies,
            subtractDependencies,
            multiplyDependencies,
            divideDependencies,
            modDependencies,
            numberDependencies,
            createUnitDependencies,
            unitDependencies
        }, {
            predictable: true
        });
        this.mathScope = {
            degree: this.math.unit('degree'),
            meter: this.math.unit('meter'),
            pixel: this.math.createUnit('pixel', { aliases: ['pixels', 'px'] }),
            percent: undefined,
            vdeg: undefined,
            vw: undefined,
            vh: undefined
        };
        this.config = {
            epsillonMeters: 1e-8,
            epsillonRadians: 1e-8,
            epsillonRatio: 1e-8,
            transition: new TransitionConfig({
                multiplier: 1,
                duration: 0,
                easing: easing.easeInOut,
                threshold: 0.001,
                delay: 0,
                debounce: 0,
                maxWait: 10,
                blend: true
            }),
            optimize: new OptimizerConfig({
                allowInvalidLayout: false,
                relativeTolerance: 0.2,
                iterationsPerFrame: 1,
                swarmSize: 20,
                pulseFrequencyMin: 0,
                pulseFrequencyMax: 1,
                pulseRate: 0.2,
                stepSizeMin: 0.01,
                stepSizeMax: 1.5,
                stepSizeStart: 0.8,
                staleRestartRate: 0.01,
                successRateMovingAverage: 200,
                successRateMin: 0.15
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
         * The view size in pixels
         */
        this.viewResolution = new Vector2(1000, 1000);
        /**
         * The deltaTime for the current frame (seconds)
         * @readonly
         */
        this.deltaTime = 1 / 60;
        /**
         *
         */
        this.time = 0;
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
        this._prevResolution = new Vector2;
        this._prevSize = new Vector2;
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
     * Call this each frame, after updating `viewNode`, `viewFrustum`,
     * and `viewResolution`
     *
     * @param deltaTime
     */
    update(deltaTime, time) {
        this.deltaTime = Math.max(deltaTime, this.maxDeltaTime);
        this.time = time;
        if (!this._prevResolution.equals(this.viewResolution) || !this._prevSize.equals(this.viewFrustum.sizeDegrees)) {
            this.mathScope.vdeg = this.math.unit(this.viewResolution.y / this.viewFrustum.sizeDegrees.y, 'px');
            this.mathScope.vw = this.math.unit(this.viewResolution.x / 100, 'px');
            this.mathScope.vh = this.math.unit(this.viewResolution.y / 100, 'px');
        }
        this._prevResolution.copy(this.viewResolution);
        this._prevSize.copy(this.viewFrustum.sizeDegrees);
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
