import * as _THREE from 'three';
import { WebLayer } from '../WebLayer';
import { WebLayerOptions } from '../WebRenderer';
import { Bounds, Edges } from '../dom-utils';
export interface WebLayer3DOptions extends WebLayerOptions {
    pixelRatio?: number;
    layerSeparation?: number;
    autoRefresh?: boolean;
    onLayerCreate?(layer: WebLayer3DContent): void;
    onLayerPaint?(layer: WebLayer3DContent): void;
    textureEncoding?: number;
    renderOrderOffset?: number;
}
export { THREE };
declare type Intersection = THREE.Intersection & {
    groupOrder: number;
};
export declare type WebLayerHit = ReturnType<typeof WebLayer3D.prototype.hitTest> & {};
declare const ON_BEFORE_UPDATE: unique symbol;
export declare class WebLayer3DContent extends THREE.Object3D {
    element: Element;
    options: WebLayer3DOptions;
    isRoot: boolean;
    private _camera?;
    constructor(element: Element, options?: WebLayer3DOptions);
    protected _webLayer: WebLayer;
    private _localZ;
    private _viewZ;
    private _renderZ;
    textures: Map<HTMLCanvasElement | HTMLVideoElement, _THREE.Texture>;
    get currentTexture(): _THREE.Texture | undefined;
    textureNeedsUpdate: boolean;
    contentMesh: _THREE.Mesh<_THREE.PlaneGeometry, _THREE.MeshBasicMaterial>;
    /**
     * This non-visible mesh ensures that an adapted layer retains
     * its innerBounds, even if the content mesh is
     * independently adapted.
     */
    private _boundsMesh;
    cursor: _THREE.Object3D;
    /**
     * Allows correct shadow maps
     */
    depthMaterial: _THREE.MeshDepthMaterial;
    domLayout: _THREE.Object3D;
    domSize: _THREE.Vector3;
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
    bounds: Bounds;
    margin: Edges;
    get parentWebLayer(): WebLayer3DContent | undefined;
    childWebLayers: WebLayer3DContent[];
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
    refresh(recurse?: boolean): void;
    private updateLayout;
    private updateContent;
    get rootWebLayer(): WebLayer3DContent;
    /** INTERNAL */
    private [ON_BEFORE_UPDATE];
    protected _doUpdate(): void;
    update(recurse?: boolean): void;
    querySelector(selector: string): WebLayer3DContent | undefined;
    traverseLayerAncestors(each: (layer: WebLayer3DContent) => void): void;
    traverseLayersPreOrder(each: (layer: WebLayer3DContent) => boolean | void): boolean;
    traverseLayersPostOrder(each: (layer: WebLayer3DContent) => boolean | void): boolean;
    dispose(): void;
    private _refreshVideoBounds;
    private _updateDOMLayout;
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
export declare class WebLayer3D extends THREE.Object3D {
    options: WebLayer3DOptions;
    static layersByElement: WeakMap<Element, WebLayer3DContent>;
    static layersByMesh: WeakMap<_THREE.Mesh<_THREE.BufferGeometry, _THREE.Material | _THREE.Material[]>, WebLayer3DContent>;
    static DEFAULT_LAYER_SEPARATION: number;
    static DEFAULT_PIXELS_PER_UNIT: number;
    static GEOMETRY: _THREE.PlaneGeometry;
    static shouldApplyDOMLayout(layer: WebLayer3DContent): boolean;
    rootLayer: WebLayer3DContent;
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
     * Run a query selector on the root layer
     * @param selector
     */
    querySelector(selector: string): WebLayer3DContent | undefined;
    /**
     * Refresh all layers, recursively
     */
    refresh(): void;
    /**
     * Update all layers, recursively
     */
    update(): void;
    /** Get the content mesh of the root layer */
    get contentMesh(): _THREE.Mesh<_THREE.PlaneGeometry, _THREE.MeshBasicMaterial>;
    private _previousHoverLayers;
    private _contentMeshes;
    private _prepareHitTest;
    private _intersectionSort;
    private _updateInteractions;
    /**
     * Perform hit test with ray, or with -Z direction of an Object3D
     * @param ray
     */
    hitTest(ray: THREE.Ray | THREE.Object3D): {
        layer: WebLayer3DContent;
        intersection: Intersection;
        target: HTMLElement;
    } | undefined;
}
