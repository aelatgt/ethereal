import { SpatialMetrics, NodeState } from './SpatialMetrics'
import { SpatialAdapter } from './SpatialAdapter'
import { Box3, MathType, Vector2 } from './math-utils'
import { SpatialOptimizer, OptimizerConfig } from './SpatialOptimizer'
import { Transitionable, TransitionConfig, easing } from './Transitionable'
import { LayoutFrustum } from './LayoutFrustum'
import { 
    create, 
    evaluateDependencies, 
    addDependencies, 
    subtractDependencies,
    multiplyDependencies,
    divideDependencies,
    numberDependencies,
    modDependencies,
    createUnitDependencies,
    unitDependencies 
} from 'mathjs'

/**
 * A third-party scenegraph node instance (e.g., THREE.Object3D)
 */
export type Node3D = { __isSceneGraphNode: true }

/**
 * Bindings for a scenegraph node instance (glue layer)
 */
export interface NodeBindings<N extends Node3D> {
    getChildren(metrics:SpatialMetrics<N>, children:Node3D[]) : void
    getState(metrics:SpatialMetrics<N>, state:NodeState<N>) : void
    getIntrinsicBounds(metrics:SpatialMetrics<N>, bounds:Box3) : void
    apply(metrics:SpatialMetrics<N>, state:Readonly<NodeState<N>>) : void
}

/**
 * Manages spatial adaptivity within an entire scene graph
 */
export class EtherealLayoutSystem<N extends Node3D = Node3D> {

    constructor(public viewNode:N, public bindings:NodeBindings<N>) {}

    math = create({ 
        evaluateDependencies, 
        addDependencies, 
        subtractDependencies,
        multiplyDependencies,
        divideDependencies,
        modDependencies,
        numberDependencies,
        createUnitDependencies,
        unitDependencies }, <any>{
        predictable: true
    }) as math.MathJsStatic

    mathCompiledExpressions = new Map<string,math.EvalFunction>() 

    mathScope = {
        ratio: undefined,
        degree: this.math.unit('degree'),
        meter: this.math.unit('meter'),
        pixel: this.math.createUnit('pixel',{aliases:['pixels','px']}),
        percent: undefined as math.Unit|undefined,
        vdeg: undefined as math.Unit|undefined,
        vw: undefined as math.Unit|undefined,
        vh: undefined as math.Unit|undefined
    }

    epsillonMeters = 1e-10
    epsillonRadians = 1e-10
    epsillonRatio = 1e-10

    transition = new TransitionConfig({
        multiplier: 1,
        duration: 0,
        easing: easing.easeInOut,
        threshold: 0,
        delay: 0,
        debounce: 0,
        maxWait: 10,
        blend: true
    }) as Required<TransitionConfig>

    optimize = new OptimizerConfig({
        minFeasibleTime: 0.02,
        maxInfeasibleTime: Infinity,
        relativeTolerance: 0.4, 
        maxIterationsPerFrame: 20, // iterations per frame per layout
        swarmSize: 10, // solutions per layout
        pulseFrequencyMin: 0, // minimal exploitation pulse
        pulseFrequencyMax: 1, // maximal exploitation pulse
        pulseRate: 0.4, // The ratio of directed exploitation vs random exploration,
        stepSizeMin: 0.0001,
        stepSizeMax: 4,
        stepSizeStart: 1.5
    }) as Required<OptimizerConfig>

    /**
     * 
     */
    optimizer = new SpatialOptimizer<N>(this)

    /**
     * The view layout frustum
     */
    viewFrustum = new LayoutFrustum

    /**
     * The view size in pixels
     */
    viewResolution = new Vector2(1000,1000)

    /**
     * The deltaTime for the current frame (seconds)
     * @readonly
     */
    deltaTime = 1/60

    /**
     * 
     */
    time = 0
    
    /**
     * The maximum delta time value
     */
    maxDeltaTime = 1/60

    /** 
     * SpatialMetrics for Node3D
     */
    nodeMetrics = new Map<N, SpatialMetrics<N>>()

    /** 
     * SpatialAdapter for Node3D
     */
    nodeAdapters = new Map<N, SpatialAdapter<N>>()

    /**
     * 
     */
    readonly transitionables = [] as Transitionable[]

    /**
     * 
     */
    get viewMetrics() {
        if (!this.viewNode) throw new Error('EtherealSystem.viewNode must be defined')
        return this.getMetrics(this.viewNode!)
    }

    /**
     * Get or create a SpatialMetrics instance which wraps a third-party node instance (e.g., THREE.Object3D instance)
     */
    getMetrics = (node:N) => {
        if (!node) throw new Error('node must be defined')
        let metrics = this.nodeMetrics.get(node) as SpatialMetrics<N>
        if (!metrics) {
            metrics = new SpatialMetrics<N>(this, node)
            this.nodeMetrics.set(node, metrics)
        }
        return metrics 
    }

    /**
     * 
     */
    getState = (node:N) => {
        if (!node) throw new Error('node must be defined')
        return this.getMetrics(node).target
    }

    /**
     * Get or create a SpatialAdapter instance which wraps a third-party node instance (e.g., THREE.Object3D instance)
     * @param node 
     */
    getAdapter = (node:N) => {
        let adapter = this.nodeAdapters.get(node) as SpatialAdapter<N>
        if (!adapter) {
            adapter = new SpatialAdapter(this, node)
            this.nodeAdapters.set(node, adapter)
        }
        return adapter
    }

    /**
     * Create a Transitionable instance
     */
    createTransitionable = <T extends MathType> (value:T, config?:TransitionConfig) => {
        const t = new Transitionable(this, value, config, this.transition)
        this.transitionables.push(t)
        return t as any as Transitionable<T>
    }


    private _prevResolution = new Vector2
    private _prevSize = new Vector2

    /**
     * Call this each frame, after updating `viewNode`, `viewFrustum`, 
     * and `viewResolution`
     * 
     * @param deltaTime
     */
    update(deltaTime:number, time:number) {

        this.deltaTime = Math.max(deltaTime, this.maxDeltaTime)
        this.time = time
        
        if (!this._prevResolution.equals(this.viewResolution) || !this._prevSize.equals(this.viewFrustum.sizeDegrees)) {
            this.mathScope.vdeg = this.math.unit(this.viewResolution.y/this.viewFrustum.sizeDegrees.y,'px')
            this.mathScope.vw = this.math.unit(this.viewResolution.x/100,'px')
            this.mathScope.vh = this.math.unit(this.viewResolution.y/100,'px')
            this.measureNumberCache = {}
        }
        this._prevResolution.copy(this.viewResolution)
        this._prevSize.copy(this.viewFrustum.sizeDegrees)

        for (const metrics of this.nodeMetrics.values()) {
            metrics.needsUpdate = true
            const adapter = this.nodeAdapters.get(metrics.node)
            if (adapter) {
                adapter.opacity.needsUpdate = true
                adapter.orientation.needsUpdate = true
                adapter.bounds.needsUpdate = true
                adapter.outerOrigin.needsUpdate = true
                adapter.outerOrientation.needsUpdate = true
                adapter.outerBounds.needsUpdate = true
                adapter.outerVisualBounds.needsUpdate = true
            }
        }

        for (const transitionable of this.transitionables) {
            transitionable.needsUpdate = true
        }

        for (const transitionable of this.transitionables) {
            transitionable.update()
        }

        this.viewMetrics.update()
        
        for (const adapter of this.nodeAdapters.values()) {
            adapter.metrics.update()
        }

    }

    private measureNumberCache = {} as {[measure:string]:number}

    measureNumber(measure:string|number, unit?:string|math.Unit) {
        if (typeof measure === 'number') return measure
        if (measure in this.measureNumberCache) return this.measureNumberCache[measure]

        if (!this.mathCompiledExpressions.has(measure)) {
            const node = this.math.parse(measure)
            const code = node.compile()
            this.mathCompiledExpressions.set(measure, code)
        }
        const code = this.mathCompiledExpressions.get(measure)!
        const result = code.evaluate(this.mathScope)
        const value = typeof result === 'number' ? result :
            this.math.number(code.evaluate(this.mathScope), unit!)
        this.measureNumberCache[measure] = value
        return value
    }
}