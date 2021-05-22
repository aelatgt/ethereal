import { EtherealLayoutSystem, Node3D } from './EtherealLayoutSystem';
import { SpatialLayout } from './SpatialLayout';
import { BoundsMeasureType, BoundsMeasureSubType } from './SpatialObjective';
import { Transitionable, TransitionConfig } from './Transitionable';
import { Quaternion, Box3, Vector3 } from './math-utils';
import { SpatialMetrics } from './SpatialMetrics';
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
export declare class SpatialAdapter<N extends Node3D = Node3D> {
    /**
     * The EtherealSystem instance
     */
    system: EtherealLayoutSystem<N>;
    /**
     * The wrapped third-party scenegraph nodes
     */
    node: N;
    constructor(
    /**
     * The EtherealSystem instance
     */
    system: EtherealLayoutSystem<N>, 
    /**
     * The wrapped third-party scenegraph nodes
     */
    node: N);
    measureBoundsCache: Map<string, number>;
    measureBounds(measure: string | number, type: BoundsMeasureType, subType: BoundsMeasureSubType): number;
    /**
     *
     */
    readonly metrics: SpatialMetrics<N>;
    /**
     * Transition overrides for this node
     */
    readonly transition: TransitionConfig;
    /**
     * The reference node.
     *
     * If `undefined`, reference is the current parent.
     *
     * if `null`, this node is considered as flagged to be removed.
     */
    referenceNode: N | null | undefined;
    /**
     *
     */
    get outerOrigin(): Transitionable<Vector3>;
    private _outerOrigin;
    /**
     *
     */
    get outerOrientation(): Transitionable<Quaternion>;
    private _outerOrientation;
    /**
     *
     */
    get outerBounds(): Transitionable<Box3>;
    private _outerBounds;
    /**
     *
     */
    get outerVisualBounds(): Transitionable<Box3>;
    private _outerVisualBounds;
    /**
     * The closest ancestor adapter
     */
    get parentAdapter(): SpatialAdapter<N> | null;
    private _parentAdapter;
    private _computeParentAdapter;
    /**
     * Transitionable orientation
     */
    get orientation(): Transitionable<Quaternion>;
    private _orientation;
    /**
     * Transitionable spatial bounds
     */
    get bounds(): Transitionable<Box3>;
    private _bounds;
    /**
     * Transitionable opacity
     */
    get opacity(): Transitionable<number>;
    private _opacity;
    /**
     * List of presentable layout variants. If non-empty, the target
     * orientation, bounds, and opacity will be automatically updated.
     */
    layouts: SpatialLayout[];
    /**
     * Time spent since feasible layout solution was found
     */
    layoutFeasibleTime: number;
    /**
     * Time spent since last feasible layout solution was found
     */
    layoutInfeasibleTime: number;
    get previousLayout(): SpatialLayout | null;
    private _prevLayout;
    set activeLayout(val: SpatialLayout | null);
    get activeLayout(): SpatialLayout | null;
    private _activeLayout;
    /**
     * At 0, a new transition has started
     * Between 0 and 1 represents the transition progress
     * At 1, no transitions are active
     */
    get progress(): number;
    private _progress;
    private _computeProgress;
    /**
     * Add a layout with an associated behavior.
     */
    createLayout(): SpatialLayout;
    get hasValidContext(): boolean;
    private _hasValidContext;
    onUpdate?: () => void;
    onPostUpdate?: () => void;
    private _prevNodeOrientation;
    private _prevNodeBounds;
    _computeHasValidContext(): boolean;
    _update(): void;
}
