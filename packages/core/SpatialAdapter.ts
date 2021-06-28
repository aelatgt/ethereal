import { EtherealLayoutSystem, Node3D } from './EtherealLayoutSystem'
import { SpatialLayout } from './SpatialLayout'
import { BoundsMeasureType, BoundsMeasureSubType } from './SpatialObjective'
import { Transitionable, TransitionConfig } from './Transitionable'
import { Quaternion, Box3, Vector3, V_000, V_111, Q_IDENTITY } from './math-utils'
import { SpatialMetrics, NodeState } from './SpatialMetrics'

/**
 * This class enables *spatially adaptive layout* for a single node in a scenegraph.
 * 
 * This integrates several core capabilties:
 * 
 *  - spatial metrics/query engine: performant reactive computation of various spatial metrics,
 *      enabling the straightforward specification of layout constraints and objectives
 * 
 *  - spatial layout/optimization engine: a swarm metahueristics engine, enabling layout to be optimized 
 *      based on configurable spatial/visual layout constraints/objectives
 * 
 *  - spatial transition engine: a Finite Impulse Response transition engine w/ configurable hysteresis,
 *      enabling layout transitions that can be smoothly combined with various easings, 
 *      and gauranteed to settle within their individual transition windows 
 */
export class SpatialAdapter<N extends Node3D = Node3D> {

    constructor(
        /**
         * The EtherealSystem instance
         */
        public system:EtherealLayoutSystem<N>,
        /**
         * The wrapped third-party scenegraph nodes
         */
        public node:N
    ) {
        this.metrics = this.system.getMetrics(this.node)
        const raw = this.metrics.raw

        this._orientation = new Transitionable(this.system, raw.localOrientation, undefined, this.transition)
        this._bounds = new Transitionable(this.system, raw.spatialBounds, undefined, this.transition)
        this._opacity = new Transitionable(this.system, raw.opacity, undefined, this.transition)
        
        this._outerOrigin = new Transitionable(this.system, raw.outerOrigin, undefined, this.transition)
        this._outerOrientation = new Transitionable(this.system, raw.outerOrientation, undefined, this.transition)
        this._outerBounds = new Transitionable(this.system, raw.outerBounds, undefined, this.transition)
        this._outerVisualBounds = new Transitionable(this.system, raw.outerVisualBounds, undefined, this.transition)
        
        this._outerOrigin.debounce = 0
        this._outerOrigin.delay = 0
        this._outerOrientation.debounce = 0
        this._outerOrientation.delay = 0
        this._outerBounds.debounce = 0
        this._outerBounds.delay = 0
        this._outerVisualBounds.debounce = 0
        this._outerVisualBounds.delay = 0

        this._orientation.syncGroup = 
        this._bounds.syncGroup = 
        this._opacity.syncGroup =
            new Set
    }

    measureBoundsCache = new Map<string, number>()

    measureBounds(measure:string|number, type:BoundsMeasureType, subType:BoundsMeasureSubType) {
        const system = this.system
        const scope = system.mathScope
        const math = system.math
        const unit = (type === 'spatial' || 
                    subType === 'front' || 
                    subType === 'back' || 
                    subType === 'centerz' || 
                    subType === 'sizez') ? scope.meter : scope.pixel
        const unitString = unit === scope.meter ? 'm' : 'px'

        if (typeof measure === 'number') measure = '' + measure + unitString
        const cacheKey = type + '-' + subType + ' = ' + measure
        if (this.measureBoundsCache?.has(cacheKey)) return this.measureBoundsCache.get(cacheKey)!

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
                referenceBounds = state.outerVisualBounds
                referenceCenter = state.outerVisualCenter
                break
            case 'view': 
                referenceBounds = viewState.visualBounds
                referenceCenter = viewState.visualCenter
                break
            default: 
                throw new Error(`Unknown measure type "${type}.${subType}"`)
        }

        if (measure.includes('%')) {
            const outerSize = type === 'spatial' ? state.outerSize : 
                (state.outerVisualSize ?? viewState.visualSize)
            let percent = 0 as number|math.Unit
            switch (subType) {
                case 'left': case 'centerx': case 'right': case 'sizex':
                    percent = math.unit(outerSize.x / 100, unitString)
                    break
                case 'bottom': case 'centery': case 'top': case 'sizey':
                    percent = math.unit(outerSize.y / 100, unitString)
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
                    throw new Error(`Invalid measure subtype "${type}.${subType}" for percentage units`)
            }
            scope.percent = percent
        }

        let value:number
        switch (subType) {
            case 'left': value = referenceBounds.min.x; break;
            case 'centerx': value = referenceCenter.x; break;
            case 'right': value = referenceBounds.max.x; break;
            case 'bottom': value = referenceBounds.min.y; break;
            case 'centery': value = referenceCenter.y; break;
            case 'top': value = referenceBounds.max.y; break;
            case 'front': value = referenceBounds.max.z; break;
            case 'centerz': value = referenceCenter.z; break;
            case 'back': value = referenceBounds.min.z; break;
            case 'centerdistance':
            default: value = 0
        }
        
        let result = code.evaluate(scope)
        if (typeof result === 'object') result = math.number(result, unit) 
        value += result

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
     * The reference node. If a layout is assigned, it's reference frame takes precedence.
     * 
     * If `undefined`, reference is the current parent.
     * 
     * if `null`, this node is considered as flagged to be removed.
     */
    referenceNode = undefined as N|null|undefined

    /**
     * 
     */
    get outerOrigin() {
        return this._outerOrigin
    }
    private _outerOrigin : Transitionable<Vector3>

    /**
     * 
     */
    get outerOrientation() {
        return this._outerOrientation
    }
    private _outerOrientation : Transitionable<Quaternion>

    /**
     * 
     */
    get outerBounds() {
        return this._outerBounds
    }
    private _outerBounds : Transitionable<Box3>
    
    /**
     * 
     */
    get outerVisualBounds() {
        return this._outerVisualBounds
    }
    private _outerVisualBounds : Transitionable<Box3>
    

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
     * Time spent since feasible layout solution was found
     */
    layoutFeasibleTime = 0

    /**
     * Time spent since last feasible layout solution was found
     */
    layoutInfeasibleTime = 0

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
    createLayout() : SpatialLayout {
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

        // allow outer bounds to be animated whenever the
        // reference frame or spatial frame changes
        const metrics = this.metrics
        if (metrics.referenceMetrics) {
            this.outerOrigin.target.copy(metrics.referenceMetrics.target.worldCenter)
            this.outerOrientation.target.copy(metrics.referenceMetrics.target.worldOrientation)
            this.outerBounds.target.copy(metrics.referenceMetrics.innerBounds)
            this.outerBounds.target.applyMatrix4(metrics.target.spatialFromReference)
            this.outerVisualBounds.target.copy(metrics.referenceMetrics.target.visualBounds)
        }
        this.outerOrigin.update()
        this.outerOrientation.update()
        this.outerBounds.update()
        this.outerVisualBounds.update()

        if (this.onUpdate) {       
            // let nodeState = metrics.raw
            // const previousNodeParent = nodeState.parent
            // const previousNodeOrientation = this._prevNodeOrientation.copy(nodeState.localOrientation)
            // const previousNodeBounds = this._prevNodeBounds.copy(nodeState.spatialBounds)
            this.onUpdate()
            metrics.invalidateIntrinsicBounds()
            metrics.invalidateInnerBounds()
            metrics.invalidateStates()
            const rawState = metrics.raw // recompute
            if (!this.system.optimizer.update(this)) { // no layouts?
                const targetOrientation = this.orientation.target // metrics.target.localOrientation
                const orientation = rawState.localOrientation
                if (targetOrientation.angleTo(orientation) > this.system.epsillonRadians) {
                    this.orientation.target = orientation
                }
                const targetBounds = this.bounds.target // metrics.target.spatialBounds
                const bounds = rawState.spatialBounds
                if (targetBounds.min.distanceTo(bounds.min) > this.system.epsillonMeters ||
                    targetBounds.max.distanceTo(bounds.max) > this.system.epsillonMeters) {
                    this.bounds.target = bounds
                }
            }
        } else {
            metrics.invalidateIntrinsicBounds()
            metrics.invalidateInnerBounds()
            metrics.invalidateStates()
            this.system.optimizer.update(this)
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