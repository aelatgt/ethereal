import { EtherealSystem, Node3D } from './EtherealSystem';
import { SpatialLayout } from './SpatialLayout';
import { Transitionable, TransitionConfig } from './Transitionable';
import { OptimizerConfig } from './SpatialOptimizer';
import { Quaternion, Box3 } from './math';
import { SpatialMetrics } from './SpatialMetrics';
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
export declare class SpatialAdapter<N extends Node3D = Node3D> {
    /**
     * The EtherealSystem instance
     */
    system: EtherealSystem<N>;
    /**
     * The wrapped third-party scenegraph nodes
     */
    node: N;
    static behavior: {
        fadeOnEnterExit(adapter: SpatialAdapter): void;
        fadeOnPoseChange(adapter: SpatialAdapter, relativeDifference?: number): void;
        fadeOnLayoutChange(): void;
        pauseMotionOnFade(adapter: SpatialAdapter): void;
    };
    constructor(
    /**
     * The EtherealSystem instance
     */
    system: EtherealSystem<N>, 
    /**
     * The wrapped third-party scenegraph nodes
     */
    node: N);
    /**
     *
     */
    readonly metrics: SpatialMetrics<N>;
    /**
     * Optimizer settings for this node
     */
    readonly optimize: OptimizerConfig;
    /**
     * Transition overrides for this node
     */
    readonly transition: TransitionConfig;
    /**
     * The target parent node
     *
     * If `undefined`, target parent is the current parent
     * if `null`, this node is considered as flagged to be removed
     */
    set parentNode(p: N | null | undefined);
    get parentNode(): N | null | undefined;
    private _parentNode?;
    /**
     * Transitionable layout orientation
     */
    get orientation(): Transitionable<Quaternion>;
    private _orientation;
    /**
     * The relative point of attachment in the outer bounds
     */
    /**
     * Transitionable layout bounds
     */
    get bounds(): Transitionable<Box3>;
    private _bounds;
    /**
     * Transitionable opacity
     */
    get opacity(): Transitionable<number>;
    private _opacity;
    /**
     * List of layout variants. If non-empty, the target
     * orientation, bounds, and opacity will be automatically updated
     */
    layouts: SpatialLayout[];
    get previousLayout(): SpatialLayout | null;
    private _prevLayout;
    set activeLayout(val: SpatialLayout | null);
    get activeLayout(): SpatialLayout | null;
    private _activeLayout;
    /**
     *
     */
    get isTargetStable(): boolean | null;
    /**
     * Add a layout with an associated behavior.
     */
    createLayout(): SpatialLayout;
    onUpdate?: () => void;
    onLayout?: () => void;
}
