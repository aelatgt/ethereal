import { SpatialLayout } from './SpatialLayout';
import { Transitionable, TransitionConfig } from './Transitionable';
import { OptimizerConfig } from './SpatialOptimizer';
import { Quaternion, Box3, V_000, V_111 } from './math-utils';
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
     * The EtherealSystem instance
     */
    system, 
    /**
     * The wrapped third-party scenegraph nodes
     */
    node) {
        this.system = system;
        this.node = node;
        /**
         * Optimizer settings for this node
         */
        this.optimize = new OptimizerConfig;
        /**
         * Transition overrides for this node
         */
        this.transition = new TransitionConfig;
        // /** 
        //  * Behaviors get called every frame
        //  */
        // behaviors = Array<()=>void>()
        /**
         * All layouts associated with this adapter.
         */
        this.allLayouts = new Array();
        /**
         * List of presentable layout variants. If non-empty, the target
         * orientation, bounds, and opacity will be automatically updated.
         * Layouts in this list will be optimized with higher priority.
         */
        this.layouts = new Array();
        this._prevLayout = null;
        this._activeLayout = null;
        this.previousProgress = 1;
        this.syncWithParentAdapter = true;
        this._nodeOrientation = new Quaternion;
        this._nodeBounds = new Box3;
        this.metrics = this.system.getMetrics(this.node);
        this._orientation = new Transitionable(this.system, new Quaternion, undefined, this.transition);
        this._bounds = new Transitionable(this.system, new Box3().setFromCenterAndSize(V_000, V_111), undefined, this.transition);
        this._opacity = new Transitionable(this.system, 0, undefined, this.transition);
        this._orientation.syncGroup = this._bounds.syncGroup = this._opacity.syncGroup = new Set;
    }
    /**
     * The target parent node
     *
     * If `undefined`, target parent is the current parent
     * if `null`, this node is considered as flagged to be removed
     */
    set parentNode(p) {
        const currentParent = typeof this._parentNode !== 'undefined' ? this._parentNode : this.metrics.nodeState.parent;
        const newParent = typeof p !== 'undefined' ? p : this.metrics.nodeState.parent;
        if (newParent === currentParent)
            return;
        const currentOuterMetrics = this.metrics.outerMetrics;
        if (currentOuterMetrics) {
            const outerWorldOrientation = currentOuterMetrics.currentState.worldOrientation;
            const outerWorldCenter = currentOuterMetrics.currentState.worldCenter;
            this.orientation.start.premultiply(outerWorldOrientation);
            this.orientation.target.premultiply(outerWorldOrientation);
            this.orientation.reference?.premultiply(outerWorldOrientation);
            this.orientation.current.premultiply(outerWorldOrientation);
            for (const t of this.orientation.queue) {
                t.target.premultiply(outerWorldOrientation);
            }
            this.bounds.start.min.add(outerWorldCenter);
            this.bounds.start.max.add(outerWorldCenter);
            this.bounds.target.min.add(outerWorldCenter);
            this.bounds.target.max.add(outerWorldCenter);
            this.bounds.reference?.min.add(outerWorldCenter);
            this.bounds.reference?.max.add(outerWorldCenter);
            this.bounds.current.min.add(outerWorldCenter);
            this.bounds.current.max.add(outerWorldCenter);
            for (const t of this.bounds.queue) {
                t.target.min.add(outerWorldCenter);
                t.target.max.add(outerWorldCenter);
            }
        }
        this._parentNode = p;
        const newOuterMetrics = this.metrics.outerMetrics;
        if (this.metrics.parentNode && this.metrics.containsNode(this.metrics.parentNode)) {
            throw new Error(`Node cannot become it's own descendent`);
        }
        if (newOuterMetrics) {
            const outerState = newOuterMetrics.currentState;
            const outerWorldOrientationInverse = outerState.worldOrientationInverse;
            const outerWorldCenter = outerState.worldCenter;
            this.orientation.start.premultiply(outerWorldOrientationInverse);
            this.orientation.target.premultiply(outerWorldOrientationInverse);
            this.orientation.reference?.premultiply(outerWorldOrientationInverse);
            this.orientation.current.premultiply(outerWorldOrientationInverse);
            for (const t of this.orientation.queue) {
                t.target.premultiply(outerWorldOrientationInverse);
            }
            this.bounds.start.min.sub(outerWorldCenter);
            this.bounds.start.max.sub(outerWorldCenter);
            this.bounds.target.min.sub(outerWorldCenter);
            this.bounds.target.max.sub(outerWorldCenter);
            this.bounds.reference?.min.sub(outerWorldCenter);
            this.bounds.reference?.max.sub(outerWorldCenter);
            this.bounds.current.min.sub(outerWorldCenter);
            this.bounds.current.max.sub(outerWorldCenter);
            for (const t of this.bounds.queue) {
                t.target.min.sub(outerWorldCenter);
                t.target.max.sub(outerWorldCenter);
            }
        }
    }
    get parentNode() { return this._parentNode; }
    /**
     * The closest ancestor adapter
     */
    get parentAdapter() {
        let nodeMetrics = this.metrics;
        while (nodeMetrics = nodeMetrics.parentMetrics) {
            const adapter = this.system.nodeAdapters.get(nodeMetrics.node);
            if (adapter)
                return adapter;
        }
        return null;
    }
    /**
     * Transitionable layout orientation
     */
    get orientation() {
        return this._orientation;
    }
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
        return this._bounds;
    }
    /**
     * Transitionable opacity
     */
    get opacity() {
        return this._opacity;
    }
    get previousLayout() {
        return this._prevLayout;
    }
    set activeLayout(val) {
        this._prevLayout = this._activeLayout;
        this._activeLayout = val;
    }
    get activeLayout() {
        return this._activeLayout;
    }
    /**
     * At 0, a new transition has started
     * Between 0 and 1 represents the transition progress
     * At 1, no transitions are active
     */
    get progress() {
        return Math.min(this.orientation.progress, this.bounds.progress, this.opacity.progress);
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
        const layout = new SpatialLayout(this);
        this.allLayouts.push(layout);
        this.layouts.push(layout);
        return layout;
    }
    _update() {
        this.previousProgress = this.progress;
        const metrics = this.metrics;
        if (this.onPreUpdate) {
            const nodeState = metrics.nodeState;
            const previousNodeParent = nodeState.parent;
            const previousNodeOrientation = this._nodeOrientation.copy(nodeState.localOrientation);
            const previousNodeBounds = this._nodeBounds.copy(nodeState.layoutBounds);
            this.onPreUpdate();
            metrics.invalidateIntrinsicBounds();
            metrics.invalidateInnerBounds();
            metrics.invalidateNodeStates();
            metrics.nodeState; // recompute
            const config = this.system.config;
            const bounds = nodeState.layoutBounds;
            if (previousNodeParent !== nodeState.parent)
                this.parentNode = nodeState.parent;
            if (previousNodeOrientation.angleTo(nodeState.localOrientation) > config.epsillonRadians)
                this.orientation.target = nodeState.localOrientation;
            if (previousNodeBounds.min.distanceTo(bounds.min) > config.epsillonMeters ||
                previousNodeBounds.max.distanceTo(bounds.max) > config.epsillonMeters)
                this.bounds.target = bounds;
            if (!this.system.optimizer.update(this)) {
                this.parentNode = previousNodeParent;
                this.orientation.target = previousNodeOrientation;
                this.bounds.target = previousNodeBounds;
            }
        }
        else {
            metrics.invalidateIntrinsicBounds();
            metrics.invalidateInnerBounds();
            metrics.invalidateNodeStates();
            this.system.optimizer.update(this);
        }
        if (this.syncWithParentAdapter && this.parentAdapter?.progress === 0) {
            this.opacity.forceCommit = true;
            this.orientation.forceCommit = true;
            this.bounds.forceCommit = true;
        }
        this.opacity.update();
        this.orientation.update();
        this.bounds.update();
        metrics.invalidateNodeStates();
        this.system.bindings.apply(metrics, metrics.currentState);
        metrics.invalidateNodeStates();
        this.onPostUpdate?.();
    }
}
SpatialAdapter.behavior = {
    fadeOnEnterExit(adapter) {
        // if (adapter.opacity.target === 0 && 
        // adapter.progress === 1 && 
        // adapter.metrics.targetState.visualBounds.angleToCenter < adapter.system.viewFrustum.diagonalDegrees) {
        // adapter.opacity.forceCommit = new Transition({target: 1, blend:false})
        // return
        // }
        if (adapter.opacity.target > 0 && !adapter.metrics.parentNode) {
            adapter.opacity.target = 0;
        }
    },
    fadeOnPoseChange(adapter, relativeDifference = 0.1) {
        if (adapter.opacity.target === 0) { }
    },
    fadeOnLayoutChange() {
    },
    pauseMotionOnFade(adapter) {
        if (adapter) { }
    }
};
