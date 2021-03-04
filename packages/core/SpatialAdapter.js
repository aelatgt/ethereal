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
        this.measureNumberCache = new Map();
        this.measureBoundsCache = new Map();
        /**
         * Optimizer settings for this node
         */
        this.optimize = new OptimizerConfig;
        /**
         * Transition overrides for this node
         */
        this.transition = new TransitionConfig;
        this._parentAdapter = null;
        /**
         * List of presentable layout variants. If non-empty, the target
         * orientation, bounds, and opacity will be automatically updated.
         */
        this.layouts = new Array();
        this._prevLayout = null;
        this._activeLayout = null;
        this._progress = 1;
        this._hasValidContext = false;
        this.syncWithParentAdapter = false;
        this._prevNodeOrientation = new Quaternion;
        this._prevNodeBounds = new Box3;
        this.metrics = this.system.getMetrics(this.node);
        this._orientation = new Transitionable(this.system, new Quaternion, undefined, this.transition);
        this._bounds = new Transitionable(this.system, new Box3().setFromCenterAndSize(V_000, V_111), undefined, this.transition);
        this._opacity = new Transitionable(this.system, 0, undefined, this.transition);
        this._orientation.syncGroup = this._bounds.syncGroup = this._opacity.syncGroup = new Set;
    }
    measureNumber(measure, unit) {
        if (typeof measure === 'number')
            return measure;
        if (this.measureNumberCache?.has(measure))
            return this.measureNumberCache.get(measure);
        const system = this.system;
        if (!SpatialLayout.compiledExpressions.has(measure)) {
            const node = system.math.parse(measure);
            const code = node.compile();
            SpatialLayout.compiledExpressions.set(measure, code);
        }
        const code = SpatialLayout.compiledExpressions.get(measure);
        const result = code.evaluate(system.mathScope);
        const value = typeof result === 'number' ? result :
            system.math.number(code.evaluate(system.mathScope), unit);
        this.measureNumberCache?.set(measure, value);
        return value;
    }
    measureBounds(measure, type, subType) {
        if (typeof measure === 'number')
            return measure;
        const cacheKey = type + '-' + subType + ' = ' + measure;
        if (this.measureBoundsCache?.has(cacheKey))
            return this.measureBoundsCache.get(cacheKey);
        const system = this.system;
        const scope = system.mathScope;
        const math = system.math;
        if (!SpatialLayout.compiledExpressions.has(measure)) {
            const node = math.parse(measure.replace('%', 'percent'));
            const code = node.compile();
            SpatialLayout.compiledExpressions.set(measure, code);
        }
        const code = SpatialLayout.compiledExpressions.get(measure);
        const state = this.metrics.targetState;
        let referenceBounds;
        let referenceCenter;
        switch (type) {
            case 'spatial':
                referenceBounds = state.outerBounds;
                referenceCenter = state.outerCenter;
                break;
            case 'visual':
                referenceBounds = state.outerState.visualBounds;
                referenceCenter = state.outerState.visualCenter;
                break;
            case 'view':
                const viewState = state.metrics.system.viewMetrics.targetState;
                referenceBounds = viewState.visualBounds;
                referenceCenter = viewState.visualCenter;
                break;
            default:
                throw new Error(`Unknown measure type "${type}.${subType}"`);
        }
        if (measure.includes('%')) {
            const outerSize = type === 'spatial' ? state.outerSize : state.outerState.visualSize;
            let percent = 0;
            switch (subType) {
                case 'left':
                case 'centerx':
                case 'right':
                case 'sizex':
                    percent = math.unit(outerSize.x / 100, 'm');
                    break;
                case 'bottom':
                case 'centery':
                case 'top':
                case 'sizey':
                    percent = math.unit(outerSize.y / 100, 'm');
                    break;
                case 'back':
                case 'centerz':
                case 'front':
                case 'sizez':
                    percent = math.unit(outerSize.z / 100, 'm');
                    break;
                case 'sizediagonal':
                    percent = type === 'spatial' ?
                        math.unit(outerSize.length() / 100, 'm') :
                        math.unit(Math.sqrt(outerSize.x ** 2 + outerSize.y ** 2) / 100, 'px');
                    break;
                default:
                    throw new Error(`Unknown measure subtype "${type}.${subType}"`);
            }
            scope.percent = percent;
        }
        let offset = 0;
        switch (subType) {
            case 'left':
                offset = referenceBounds.min.x;
                break;
            case 'centerx':
                offset = referenceCenter.x;
                break;
            case 'right':
                offset = referenceBounds.max.x;
                break;
            case 'bottom':
                offset = referenceBounds.min.y;
                break;
            case 'top':
                offset = referenceBounds.max.y;
                break;
            case 'centery':
                offset = referenceCenter.y;
                break;
            case 'front':
                offset = referenceBounds.min.z;
                break;
            case 'back':
                offset = referenceBounds.max.z;
                break;
            case 'centerz':
                offset = referenceCenter.z;
                break;
        }
        let unit = (type === 'spatial' ||
            subType === 'front' ||
            subType === 'back' ||
            subType === 'centerz' ||
            subType === 'sizez') ? scope.meter : scope.pixel;
        const result = code.evaluate(system.mathScope);
        const value = result === 0 ? 0 : math.number(code.evaluate(scope), unit) + offset;
        scope.percent = undefined;
        this.measureBoundsCache?.set(cacheKey, value);
        return value;
    }
    /**
     * The target parent node.
     *
     * If `undefined`, target parent is the current parent.
     *
     * if `null`, this node is considered as flagged to be removed.
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
    get parentAdapter() { return this._parentAdapter; }
    _computeParentAdapter() {
        let nodeMetrics = this.metrics;
        while (nodeMetrics = nodeMetrics.parentMetrics) {
            const adapter = this.system.nodeAdapters.get(nodeMetrics.node);
            if (adapter)
                return adapter;
        }
        return null;
    }
    /**
     * Transitionable orientation
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
     * Transitionable spatial bounds
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
        return this._progress;
    }
    _computeProgress() {
        return Math.min(this.orientation.progress, this.bounds.progress, this.opacity.progress);
    }
    /**
     * Add a layout with an associated behavior.
     */
    createLayout() {
        const layout = new SpatialLayout(this);
        this.layouts.push(layout);
        return layout;
    }
    get hasValidContext() {
        return this._hasValidContext;
    }
    _computeHasValidContext() {
        const pAdapter = this.parentAdapter;
        if (!pAdapter)
            return true;
        if (!pAdapter.hasValidContext)
            return false;
        if (pAdapter.layouts.length === 0)
            return true;
        if (pAdapter.activeLayout?.hasValidSolution)
            return true;
        return false;
    }
    _update() {
        this._parentAdapter = this._computeParentAdapter();
        this._hasValidContext = this._computeHasValidContext();
        const metrics = this.metrics;
        if (this.onUpdate) {
            const nodeState = metrics.nodeState;
            const previousNodeParent = nodeState.parent;
            const previousNodeOrientation = this._prevNodeOrientation.copy(nodeState.localOrientation);
            const previousNodeBounds = this._prevNodeBounds.copy(nodeState.spatialBounds);
            this.onUpdate();
            metrics.invalidateIntrinsicBounds();
            metrics.invalidateInnerBounds();
            metrics.invalidateNodeStates();
            metrics.nodeState; // recompute
            const config = this.system.config;
            const bounds = nodeState.spatialBounds;
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
        // const previousNodeParent = nodeState.parent
        // const previousNodeOrientation = this._nodeOrientation.copy(nodeState.localOrientation)
        // const previousNodeBounds = this._nodeBounds.copy(nodeState.spatialBounds)
        // if (this.onUpdate) {       
        //     const nodeState = metrics.nodeState as NodeState<N>
        //     this.onUpdate()
        //     metrics.invalidateIntrinsicBounds()
        //     metrics.invalidateInnerBounds()
        //     metrics.invalidateNodeStates()
        //     metrics.nodeState // recompute
        //     const config = this.system.config
        //     const bounds = nodeState.spatialBounds
        //     if (previousNodeParent !== nodeState.parent) 
        //         this.parentNode = nodeState.parent
        //     if (previousNodeOrientation.angleTo(nodeState.localOrientation) > config.epsillonRadians) 
        //         this.orientation.target = nodeState.localOrientation
        //     if (previousNodeBounds.min.distanceTo(bounds.min) > config.epsillonMeters ||
        //         previousNodeBounds.max.distanceTo(bounds.max) > config.epsillonMeters) 
        //         this.bounds.target = bounds
        //     if (!this.system.optimizer.update(this)) {
        //         this.parentNode = previousNodeParent
        //         this.orientation.target = previousNodeOrientation
        //         this.bounds.target = previousNodeBounds
        //     }
        // } else {
        //     metrics.invalidateIntrinsicBounds()
        //     metrics.invalidateInnerBounds()
        //     metrics.invalidateNodeStates()
        //     this.system.optimizer.update(this)
        // }
        if (this.syncWithParentAdapter && this.parentAdapter?.progress === 0) {
            this.opacity.forceCommit = true;
            this.orientation.forceCommit = true;
            this.bounds.forceCommit = true;
        }
        this.opacity.update();
        this.orientation.update();
        this.bounds.update();
        this._progress = this._computeProgress();
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
