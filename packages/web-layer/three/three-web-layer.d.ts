import { Vector3, Group, Object3D, Mesh, MeshBasicMaterial, MeshDepthMaterial, Geometry, Camera, Intersection, Texture, Matrix4, WebGLRenderer } from 'three';
import { WebLayer } from '../WebLayer';
import { Bounds } from '../dom-utils';
export interface WebLayer3DOptions {
    pixelRatio?: number;
    layerSeparation?: number;
    autoRefresh?: boolean;
    onLayerCreate?(layer: WebLayer3DBase): void;
    onAfterRasterize?(layer: WebLayer3DBase): void;
}
export declare type WebLayerHit = ReturnType<typeof WebLayer3D.prototype.hitTest> & {};
export declare class WebLayer3DBase extends Group {
    options: WebLayer3DOptions;
    element: Element;
    constructor(elementOrHTML: Element | string, options?: WebLayer3DOptions);
    protected _webLayer: WebLayer;
    textures: Map<HTMLCanvasElement | HTMLVideoElement, Texture>;
    get currentTexture(): Texture;
    textureNeedsUpdate: boolean;
    contentMesh: Mesh<Geometry, MeshBasicMaterial>;
    cursor: Object3D;
    depthMaterial: MeshDepthMaterial;
    domLayout: Object3D;
    domSize: Vector3;
    /**
     * Get the hover state
     */
    get pseudoStates(): {
        hover: boolean;
        active: boolean;
        focus: boolean;
        target: boolean;
    };
    /**
     * Get the layer depth (distance from this layer's element and the parent layer's element)
     */
    get depth(): number;
    /**
     *
     */
    get index(): number;
    get needsRefresh(): boolean;
    setNeedsRefresh(): void;
    /** If true, this layer needs to be removed from the scene */
    get needsRemoval(): boolean;
    get bounds(): Bounds;
    get parentWebLayer(): WebLayer3DBase | undefined;
    childWebLayers: WebLayer3DBase[];
    /**
     * Specifies whether or not the DOM layout should be applied.
     *
     * When set to `true`, the dom layout should always be applied.
     * When set to `false`, the dom layout should never be applied.
     * When set to `'auto'`, the dom layout should only be applied
     * when the `parentLayer` is the same as the `parent` object.
     *
     * It is the responsibiltiy of the update callback
     * to follow these rules.
     *
     * Defaults to `auto`
     */
    shouldApplyDOMLayout: true | false | 'auto';
    /**
     * Refresh from DOM
     */
    protected refresh(recurse?: boolean): void;
    private updateLayout;
    private updateContent;
    protected _doUpdate: () => void;
    update(recurse?: boolean): void;
    querySelector(selector: string): WebLayer3DBase | undefined;
    traverseLayerAncestors(each: (layer: WebLayer3DBase) => void): void;
    traverseLayersPreOrder(each: (layer: WebLayer3DBase) => boolean | void): boolean;
    traverseLayersPostOrder(each: (layer: WebLayer3DBase) => boolean | void): boolean;
    dispose(): void;
    private _refreshVideoBounds;
    private _refreshDOMLayout;
}
/**
 * Transform a DOM tree into 3D layers.
 *
 * When an instance is created, a `xr-layer` is set on the
 * the passed DOM element to match this instance's Object3D id.
 * If the passed DOM element has an `id` attribute, this instance's Object3D name
 * will be set to match the element id.
 *
 * Child WebLayer3D instances can be specified with an `xr-layer` attribute,
 * which will be set when the child WebLayer3D instance is created automatically.
 * The attribute can be specified added in HTML or dynamically:
 *  - `<div xr-layer></div>`
 *
 * Additionally, the pixel ratio can be adjusted on each layer, individually:
 *  - `<div xr-layer xr-pixel-ratio="0.5"></div>`
 *
 * Default dimensions: 1px = 0.001 world dimensions = 1mm (assuming meters)
 *     e.g., 500px width means 0.5meters
 */
export declare class WebLayer3D extends WebLayer3DBase {
    options: WebLayer3DOptions;
    static layersByElement: WeakMap<Element, WebLayer3DBase>;
    static layersByMesh: WeakMap<Mesh<Geometry | import("three").BufferGeometry, import("three").Material | import("three").Material[]>, WebLayer3DBase>;
    static DEFAULT_LAYER_SEPARATION: number;
    static DEFAULT_PIXELS_PER_UNIT: number;
    static GEOMETRY: Geometry;
    static computeNaturalDistance(projection: Matrix4 | Camera, renderer: WebGLRenderer): number;
    static shouldApplyDOMLayout(layer: WebLayer3DBase): boolean;
    get parentWebLayer(): WebLayer3DBase;
    private _interactionRays;
    private _raycaster;
    private _hitIntersections;
    constructor(elementOrHTML: Element | string, options?: WebLayer3DOptions);
    /**
     * A list of Rays to be used for interaction.
     * Can only be set on a root WebLayer3D instance.
     */
    get interactionRays(): Array<THREE.Ray | THREE.Object3D>;
    set interactionRays(rays: Array<THREE.Ray | THREE.Object3D>);
    /**
     * Update this layer, optionally recursively
     */
    update(recurse?: boolean): void;
    private _previousHoverLayers;
    private _contentMeshes;
    private _prepareHitTest;
    private _updateInteractions;
    static getLayerForQuery(selector: string): WebLayer3DBase | undefined;
    static getClosestLayerForElement(element: Element): WebLayer3DBase | undefined;
    hitTest(ray: THREE.Ray): {
        layer: WebLayer3DBase;
        intersection: Intersection;
        target: HTMLElement;
    } | undefined;
}
