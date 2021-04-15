import { EtherealSystem, Node3D } from './EtherealSystem'
import { SpatialLayout } from './SpatialLayout'
import { BoundsMeasureType, BoundsMeasureSubType } from './SpatialObjective'
import { Transitionable, TransitionConfig } from './Transitionable'
import { Quaternion, Box3, V_000, V_111, Vector3 } from './math-utils'
import { SpatialMetrics, NodeState } from './SpatialMetrics'


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
export class SpatialAdapter<N extends Node3D = Node3D> {

    static behavior = {
        fadeOnEnterExit(adapter:SpatialAdapter) {
            // if (adapter.opacity.target === 0 && 
                // adapter.progress === 1 && 
                // adapter.metrics.targetState.visualBounds.angleToCenter < adapter.system.viewFrustum.diagonalDegrees) {
                // adapter.opacity.forceCommit = new Transition({target: 1, blend:false})
                // return
            // }
            if (adapter.opacity.target > 0 && !adapter.metrics.parentNode) {
                adapter.opacity.target = 0
            }
        },
        fadeOnPoseChange(adapter:SpatialAdapter, relativeDifference = 0.1) {
            if (adapter.opacity.target === 0 ) {}
        },
        fadeOnLayoutChange() {
            
        },
        pauseMotionOnFade(adapter:SpatialAdapter) {
            if (adapter ) {}
        }
    }

    constructor(
        /**
         * The EtherealSystem instance
         */
        public system:EtherealSystem<N>,
        /**
         * The wrapped third-party scenegraph nodes
         */
        public node:N
    ) {
        this.metrics = this.system.getMetrics(this.node)
        this._orientation = new Transitionable(this.system, this.metrics.raw.localOrientation, undefined, this.transition)
        this._bounds = new Transitionable(this.system, this.metrics.raw.spatialBounds, undefined, this.transition)
        this._opacity = new Transitionable(this.system, 0, undefined, this.transition)
        this._orientation.syncGroup = this._bounds.syncGroup = this._opacity.syncGroup = new Set
    }

    measureBoundsCache = new Map<string, number>()

    measureBounds(measure:string|number, type:BoundsMeasureType, subType:BoundsMeasureSubType) {
        if (typeof measure === 'number') measure = '' + measure
        const cacheKey = type + '-' + subType + ' = ' + measure
        if (this.measureBoundsCache?.has(cacheKey)) return this.measureBoundsCache.get(cacheKey)!

        const system = this.system
        const scope = system.mathScope
        const math = system.math

        if (!system.mathCompiledExpressions.has(measure)) {
            const node = math.parse(measure.replace('%', 'percent'))
            const code = node.compile()
            system.mathCompiledExpressions.set(measure, code)
        }
        const code = system.mathCompiledExpressions.get(measure)!
        
        const viewState = system.viewMetrics.target
        const state = this.metrics.target
        let referenceBounds : Box3
        let referenceCenter: Vector3
        switch (type) {
            case 'spatial': 
                referenceBounds = state.outerBounds
                referenceCenter = state.outerCenter
                break
            case 'visual': 
                referenceBounds = state.outerState?.visualBounds ?? viewState.visualBounds
                referenceCenter = state.outerState?.visualCenter ?? viewState.visualCenter
                break
            case 'view': 
                referenceBounds = viewState.visualBounds
                referenceCenter = viewState.visualCenter
                break
            default: 
                throw new Error(`Unknown measure type "${type}.${subType}"`)
        }

        const unit = (type === 'spatial' || 
                    subType === 'front' || 
                    subType === 'back' || 
                    subType === 'centerz' || 
                    subType === 'sizez') ? scope.meter : scope.pixel

        if (measure.includes('%')) {
            const outerSize = type === 'spatial' ? state.outerSize : 
                (state.outerState?.visualSize ?? viewState.visualSize)
            let percent = 0 as number|math.Unit
            let uXY = unit === scope.meter ? 'm' : 'px'
            switch (subType) {
                case 'left': case 'centerx': case 'right': case 'sizex':
                    percent = math.unit(outerSize.x / 100, uXY)
                    break
                case 'bottom': case 'centery': case 'top': case 'sizey':
                    percent = math.unit(outerSize.y / 100, uXY)
                    break
                case 'back': case 'centerz': case 'front': case 'sizez':
                    percent = math.unit(outerSize.z / 100, 'm')
                    break
                case 'sizediagonal': 
                    percent = type === 'spatial' ? 
                        math.unit(outerSize.length() / 100, 'm') : 
                        math.unit(Math.sqrt(outerSize.x ** 2 + outerSize.y ** 2) / 100, 'px')
                    break
                default:
                    throw new Error(`Unknown measure subtype "${type}.${subType}"`)
            }
            scope.percent = percent
        }

        let offset = 0
        switch (subType) {
            case 'left': offset = referenceBounds.min.x; break;
            case 'centerx': offset = referenceCenter.x; break;
            case 'right': offset = referenceBounds.max.x; break;
            case 'bottom': offset = referenceBounds.min.y; break;
            case 'top': offset = referenceBounds.max.y; break;
            case 'centery': offset = referenceCenter.y; break;
            case 'front': offset = referenceBounds.min.z; break;
            case 'back': offset = referenceBounds.max.z; break;
            case 'centerz': offset = referenceCenter.z; break;
        }
        
        const result = code.evaluate(scope)
        const value = result === 0 ? offset : math.number!(result, unit) + offset
        scope.percent = undefined
        this.measureBoundsCache?.set(cacheKey, value)

        return value
    }

    /**
     * 
     */
    readonly metrics : SpatialMetrics<N>
    
    /**
     * Transition overrides for this node
     */
    readonly transition = new TransitionConfig

    /**
     * The target parent node.
     * 
     * If `undefined`, target parent is the current parent.
     * 
     * if `null`, this node is considered as flagged to be removed.
     */
    set referenceNode(p: N|null|undefined) {
        const currentReference = typeof this._referenceNode !== 'undefined' ? this._referenceNode : this.metrics.raw.parent
        const newReference = typeof p !== 'undefined' ? p : this.metrics.raw.parent
        if (newReference === currentReference) return
        const currentOuterMetrics = this.metrics.outerMetrics
        if (currentOuterMetrics) {
            const outerWorldOrientation = currentOuterMetrics.current.worldOrientation
            const outerWorldCenter = currentOuterMetrics.current.worldCenter
            this.orientation.start.premultiply(outerWorldOrientation)
            this.orientation.target.premultiply(outerWorldOrientation)
            this.orientation.reference?.premultiply(outerWorldOrientation)
            this.orientation.current.premultiply(outerWorldOrientation)
            for (const t of this.orientation.queue) { 
                t.target.premultiply(outerWorldOrientation) 
            }
            this.bounds.start.min.add(outerWorldCenter)
            this.bounds.start.max.add(outerWorldCenter)
            this.bounds.target.min.add(outerWorldCenter)
            this.bounds.target.max.add(outerWorldCenter)
            this.bounds.reference?.min.add(outerWorldCenter)
            this.bounds.reference?.max.add(outerWorldCenter)
            this.bounds.current.min.add(outerWorldCenter)
            this.bounds.current.max.add(outerWorldCenter)
            for (const t of this.bounds.queue) {
                t.target.min.add(outerWorldCenter)
                t.target.max.add(outerWorldCenter)
            }
        }
        this._referenceNode = p
        const newOuterMetrics = this.metrics.outerMetrics
        if (this.metrics.parentNode && this.metrics.containsNode(this.metrics.parentNode)) {
            throw new Error(`Node cannot become it's own descendent`)
        }
        if (newOuterMetrics) {
            const outerState = newOuterMetrics.current
            const outerWorldOrientationInverse = outerState.worldOrientationInverse
            const outerWorldCenter = outerState.worldCenter
            this.orientation.start.premultiply(outerWorldOrientationInverse)
            this.orientation.target.premultiply(outerWorldOrientationInverse)
            this.orientation.reference?.premultiply(outerWorldOrientationInverse)
            this.orientation.current.premultiply(outerWorldOrientationInverse)
            for (const t of this.orientation.queue) { t.target.premultiply(outerWorldOrientationInverse) }
            this.bounds.start.min.sub(outerWorldCenter)
            this.bounds.start.max.sub(outerWorldCenter)
            this.bounds.target.min.sub(outerWorldCenter)
            this.bounds.target.max.sub(outerWorldCenter)
            this.bounds.reference?.min.sub(outerWorldCenter)
            this.bounds.reference?.max.sub(outerWorldCenter)
            this.bounds.current.min.sub(outerWorldCenter)
            this.bounds.current.max.sub(outerWorldCenter)
            for (const t of this.bounds.queue) {
                t.target.min.sub(outerWorldCenter)
                t.target.max.sub(outerWorldCenter)
            }
        }
    }
    get referenceNode() { return this._referenceNode }
    private _referenceNode? : N | null

    /**
     * The closest ancestor adapter
     */
    get parentAdapter() { return this._parentAdapter }
    private _parentAdapter:SpatialAdapter<N>|null = null
    private _computeParentAdapter() {
        let nodeMetrics : SpatialMetrics<N>|null = this.metrics
        while (nodeMetrics = nodeMetrics.parentMetrics) {
            const adapter = this.system.nodeAdapters.get(nodeMetrics.node)
            if (adapter) return adapter
        }
        return null
    }

    /**
     * Transitionable orientation                                                                          
     */
    get orientation() {
        return this._orientation
    } 
    private _orientation : Transitionable<Quaternion>

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
        return this._bounds
    } 
    private _bounds : Transitionable<Box3>

    /**
     * Transitionable opacity
     */
    get opacity() {
        return this._opacity
    } 
    private _opacity : Transitionable<number>

    /**
     * List of presentable layout variants. If non-empty, the target 
     * orientation, bounds, and opacity will be automatically updated.
     */
    layouts = new Array<SpatialLayout>()

    /**
     * Time spent waiting for feasible layout solution
     */
    layoutWaitTime = 0

    get previousLayout() {
        return this._prevLayout
    }
    private _prevLayout = null as SpatialLayout|null

    set activeLayout(val:SpatialLayout|null) {
        this._prevLayout = this._activeLayout
        this._activeLayout = val
    }
    get activeLayout() {
        return this._activeLayout
    }
    private _activeLayout = null as SpatialLayout|null

    /**
     * At 0, a new transition has started
     * Between 0 and 1 represents the transition progress
     * At 1, no transitions are active
     */
    get progress() {
        return this._progress
    }
    private _progress = 1

    private _computeProgress() {
        return Math.min(
            this.orientation.progress, 
            this.bounds.progress, 
            this.opacity.progress
        )
    }

    /**
     * Add a layout with an associated behavior.
     */
    createLayout() {
        const layout = new SpatialLayout(this)
        this.layouts.push(layout)
        return layout
    }

    get hasValidContext() {
        return this._hasValidContext
    }
    private _hasValidContext = false

    onUpdate? : () => void

    onPostUpdate? : () => void

    syncWithParentAdapter = false

    private _prevNodeOrientation = new Quaternion
    private _prevNodeBounds = new Box3

    _computeHasValidContext() {
        const pAdapter = this.parentAdapter
        if (!pAdapter) return true
        if (!pAdapter.hasValidContext) return false
        if (pAdapter.layouts.length === 0) return true
        if (pAdapter.activeLayout?.hasValidSolution) return true
        return false
    }

    _update() {
        this._parentAdapter = this._computeParentAdapter()
        this._hasValidContext = this._computeHasValidContext()

        const metrics = this.metrics

        if (this.onUpdate) {       
            const nodeState = metrics.raw as NodeState<N>
            const previousNodeParent = nodeState.parent
            const previousNodeOrientation = this._prevNodeOrientation.copy(nodeState.localOrientation)
            const previousNodeBounds = this._prevNodeBounds.copy(nodeState.spatialBounds)
            this.onUpdate()
            metrics.invalidateIntrinsicBounds()
            metrics.invalidateInnerBounds()
            metrics.invalidateStates()
            metrics.raw // recompute
            if (!this.system.optimizer.update(this)) {
                // this.referenceNode = previousNodeParent
                // this.orientation.target = previousNodeOrientation
                // this.bounds.target = previousNodeBounds
                const config = this.system.config
                const bounds = nodeState.spatialBounds
                if (previousNodeParent !== nodeState.parent ||
                    previousNodeOrientation.angleTo(nodeState.localOrientation) > config.epsillonRadians ||
                    previousNodeBounds.min.distanceTo(bounds.min) > config.epsillonMeters ||
                    previousNodeBounds.max.distanceTo(bounds.max) > config.epsillonMeters) {
                    this.referenceNode = undefined
                    this.orientation.target = nodeState.localOrientation
                    this.bounds.target = bounds
                }
            }
        } else {
            metrics.invalidateIntrinsicBounds()
            metrics.invalidateInnerBounds()
            metrics.invalidateStates()
            this.system.optimizer.update(this)
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
            this.opacity.forceCommit = true
            this.orientation.forceCommit = true
            this.bounds.forceCommit = true
        }

        this.opacity.update()
        this.orientation.update()
        this.bounds.update()
        this._progress = this._computeProgress()

        metrics.invalidateStates()
        this.system.bindings.apply(metrics, metrics.current)
        metrics.invalidateStates()
        this.onPostUpdate?.()
    }

}