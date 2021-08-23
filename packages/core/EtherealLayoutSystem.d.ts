import { SpatialMetrics, NodeState } from './SpatialMetrics';
import { SpatialAdapter } from './SpatialAdapter';
import { Box3, MathType, Vector2 } from './math-utils';
import { SpatialOptimizer, OptimizerConfig } from './SpatialOptimizer';
import { Transitionable, TransitionConfig } from './Transitionable';
import { LayoutFrustum } from './LayoutFrustum';
/**
 * A third-party scenegraph node instance (e.g., THREE.Object3D)
 */
export declare type Node3D = {
    __isSceneGraphNode: true;
};
/**
 * Bindings for a scenegraph node instance (glue layer)
 */
export interface NodeBindings<N extends Node3D> {
    getChildren(metrics: SpatialMetrics<N>, children: Node3D[]): void;
    getState(metrics: SpatialMetrics<N>): void;
    getIntrinsicBounds(metrics: SpatialMetrics<N>, bounds: Box3): void;
    apply(metrics: SpatialMetrics<N>, state: Readonly<NodeState<N>>): void;
}
/**
 * Manages spatial adaptivity within an entire scene graph
 */
export declare class EtherealLayoutSystem<N extends Node3D = Node3D> {
    viewNode: N;
    bindings: NodeBindings<N>;
    constructor(viewNode: N, bindings: NodeBindings<N>);
    math: import("mathjs").MathJsStatic;
    mathCompiledExpressions: Map<string, import("mathjs").EvalFunction>;
    mathScope: {
        ratio: undefined;
        degree: import("mathjs").Unit;
        meter: import("mathjs").Unit;
        pixel: import("mathjs").Unit;
        percent: import("mathjs").Unit | undefined;
        vdeg: import("mathjs").Unit | undefined;
        vw: import("mathjs").Unit | undefined;
        vh: import("mathjs").Unit | undefined;
    };
    epsillonMeters: number;
    epsillonRadians: number;
    epsillonRatio: number;
    transition: Required<TransitionConfig>;
    optimize: Required<OptimizerConfig>;
    /**
     *
     */
    optimizer: SpatialOptimizer<N>;
    /**
     * The view layout frustum
     */
    viewFrustum: LayoutFrustum;
    /**
     * The view size in pixels
     */
    viewResolution: Vector2;
    /**
     * The deltaTime for the current frame (seconds)
     * @readonly
     */
    deltaTime: number;
    /**
     *
     */
    time: number;
    /**
     * The maximum delta time value
     */
    maxDeltaTime: number;
    /**
     * SpatialMetrics for Node3D
     */
    nodeMetrics: Map<N, SpatialMetrics<N>>;
    /**
     * SpatialAdapter for Node3D
     */
    nodeAdapters: Map<N, SpatialAdapter<N>>;
    /**
     *
     */
    readonly transitionables: Transitionable<MathType>[];
    /**
     *
     */
    get viewMetrics(): SpatialMetrics<N>;
    /**
     * Get or create a SpatialMetrics instance which wraps a third-party node instance (e.g., THREE.Object3D instance)
     */
    getMetrics: (node: N) => SpatialMetrics<N>;
    /**
     *
     */
    getState: (node: N) => NodeState<N>;
    /**
     * Get or create a SpatialAdapter instance which wraps a third-party node instance (e.g., THREE.Object3D instance)
     * @param node
     */
    getAdapter: (node: N) => SpatialAdapter<N>;
    /**
     * Create a Transitionable instance
     */
    createTransitionable: <T extends MathType>(value: T, config?: TransitionConfig | undefined) => Transitionable<T>;
    private _prevResolution;
    private _prevSize;
    /**
     * Call this each frame, after updating `viewNode`, `viewFrustum`,
     * and `viewResolution`
     *
     * @param deltaTime
     */
    update(deltaTime: number, time: number): void;
    private measureNumberCache;
    measureNumber(measure: string | number, unit?: string | math.Unit): number;
}
