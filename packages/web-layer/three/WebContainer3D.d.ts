import { WebLayerOptions } from '../core/WebRenderer';
import { WebLayer3D } from './WebLayer3D';
import { WebLayerManager } from './WebLayerManager';
import { Object3D, Raycaster } from 'three';
declare type Intersection = THREE.Intersection & {
    groupOrder: number;
};
export declare type WebLayerHit = ReturnType<typeof WebContainer3D.prototype.hitTest> & {};
export interface WebContainer3DOptions extends WebLayerOptions {
    manager: WebLayerManager;
    pixelRatio?: number;
    layerSeparation?: number;
    autoRefresh?: boolean;
    onLayerCreate?(layer: WebLayer3D): void;
    onLayerPaint?(layer: WebLayer3D): void;
    renderOrderOffset?: number;
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
export declare class WebContainer3D extends Object3D {
    containerElement: Element;
    options: WebContainer3DOptions;
    rootLayer: WebLayer3D;
    raycaster: Raycaster;
    private _raycaster;
    private _interactionRays;
    private _hitIntersections;
    constructor(elementOrHTML: Element | string, options?: Partial<WebContainer3DOptions>);
    get manager(): WebLayerManager;
    /**
     * A list of Rays to be used for interaction.
     * Can only be set on a root WebLayer3D instance.
     */
    get interactionRays(): Array<THREE.Ray | THREE.Object3D>;
    set interactionRays(rays: Array<THREE.Ray | THREE.Object3D>);
    /**
     * Update all layers until they are rasterized and textures have been uploaded to the GPU
     */
    updateUntilReady(): Promise<void>;
    /**
     * Update all layers, recursively
     */
    update(): void;
    /**
     * Refresh all layers, recursively
     */
    refresh(): void;
    /**
     * Run a query selector on the root layer
     * @param selector
     * @deprecated
     */
    querySelector(selector: string): WebLayer3D | undefined;
    /** Get the content mesh of the root layer
     * @deprecated
    */
    get contentMesh(): import("three").Mesh<import("three").BufferGeometry, import("three").Material | import("three").Material[]>;
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
        layer: WebLayer3D;
        intersection: Intersection;
        target: HTMLElement;
    } | undefined;
    /**
     * Remove all DOM elements, remove from scene, and dispose layer resources
     */
    destroy(): void;
    /**
     * Export the cache data for this
     */
    downloadCache(filter?: (layer: WebLayer3D) => boolean): Promise<void>;
}
export {};
