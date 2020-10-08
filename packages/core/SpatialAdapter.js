import { SpatialLayout } from './SpatialLayout';
import { Transitionable, TransitionConfig, Transition } from './Transitionable';
import { OptimizerConfig } from './SpatialOptimizer';
import { Quaternion, Box3, V_000, V_111 } from './math';
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
let SpatialAdapter = /** @class */ (() => {
    class SpatialAdapter {
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
             * List of layout variants. If non-empty, the target
             * orientation, bounds, and opacity will be automatically updated
             */
            this.layouts = new Array();
            this._prevLayout = null;
            this._activeLayout = null;
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
            this._parentNode = p;
            if (currentParent) {
                const parentMetrics = this.system.getMetrics(currentParent);
                const parentState = parentMetrics.targetState;
                const parentWorldOrientation = parentState.worldOrientation;
                const parentWorldCenter = parentState.worldCenter;
                this.orientation.start.premultiply(parentWorldOrientation);
                this.orientation.target.premultiply(parentWorldOrientation);
                this.orientation.reference?.premultiply(parentWorldOrientation);
                for (const t of this.orientation.queue) {
                    t.target.premultiply(parentWorldOrientation);
                }
                this.bounds.start.min.add(parentWorldCenter);
                this.bounds.start.max.add(parentWorldCenter);
                this.bounds.target.min.add(parentWorldCenter);
                this.bounds.target.max.add(parentWorldCenter);
                this.bounds.reference?.min.add(parentWorldCenter);
                this.bounds.reference?.max.add(parentWorldCenter);
                for (const t of this.bounds.queue) {
                    t.target.min.add(parentWorldCenter);
                    t.target.max.add(parentWorldCenter);
                }
            }
            if (newParent) {
                const parentMetrics = this.system.getMetrics(newParent);
                // if this node gets added to one of it's own descendents, 
                // throw an error
                if (this.metrics.containsNode(parentMetrics.node)) {
                    throw new Error(`Node cannot become it's own descendent`);
                }
                const parentState = parentMetrics.targetState;
                const parentWorldOrientationInverse = parentState.worldOrientationInverse;
                const parentWorldCenter = parentState.worldCenter;
                this.orientation.start.premultiply(parentWorldOrientationInverse);
                this.orientation.target.premultiply(parentWorldOrientationInverse);
                this.orientation.reference?.premultiply(parentWorldOrientationInverse);
                for (const t of this.orientation.queue) {
                    t.target.premultiply(parentWorldOrientationInverse);
                }
                this.bounds.start.min.sub(parentWorldCenter);
                this.bounds.start.max.sub(parentWorldCenter);
                this.bounds.target.min.sub(parentWorldCenter);
                this.bounds.target.max.sub(parentWorldCenter);
                this.bounds.reference?.min.sub(parentWorldCenter);
                this.bounds.reference?.max.sub(parentWorldCenter);
                for (const t of this.bounds.queue) {
                    t.target.min.sub(parentWorldCenter);
                    t.target.max.sub(parentWorldCenter);
                }
            }
        }
        get parentNode() { return this._parentNode; }
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
         *
         */
        get isTargetStable() {
            return this.metrics.parentNode && this.orientation.status === "unchanged" && this.bounds.status === "unchanged";
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
            const layout = new SpatialLayout();
            this.layouts.push(layout);
            return layout;
        }
    }
    SpatialAdapter.behavior = {
        fadeOnEnterExit(adapter) {
            if (adapter.opacity.target === 0 &&
                adapter.isTargetStable &&
                adapter.metrics.targetState.visualFrustum.angleToCenter < adapter.system.viewFrustum.diagonalDegrees) {
                adapter.opacity.forceCommit = new Transition({ target: 1, blend: false });
                return;
            }
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
    return SpatialAdapter;
})();
export { SpatialAdapter };
