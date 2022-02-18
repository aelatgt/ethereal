import { CompressedTexture, Mesh, MeshDepthMaterial, Object3D, PlaneGeometry, Vector3, VideoTexture, Texture } from "three";
import { WebLayer } from "../core/WebLayer";
import { Bounds, Edges } from "../core/dom-utils";
import { WebContainer3D } from "./WebContainer3D";
export declare const ON_BEFORE_UPDATE: unique symbol;
export declare class WebLayer3D extends Object3D {
    element: Element;
    container: WebContainer3D;
    static GEOMETRY: PlaneGeometry;
    static FLIPPED_GEOMETRY: PlaneGeometry;
    static shouldApplyDOMLayout(layer: WebLayer3D): boolean;
    private _camera?;
    constructor(element: Element, container: WebContainer3D);
    protected _webLayer: WebLayer;
    private _localZ;
    private _viewZ;
    private _renderZ;
    private _mediaTexture?;
    textures: Set<CompressedTexture>;
    private _previousTexture?;
    get domState(): import("../core/WebLayerManagerBase").LayerState | undefined;
    get texture(): VideoTexture | Texture | CompressedTexture | undefined;
    contentMesh: Mesh;
    /**
     * This non-visible mesh ensures that an adapted layer retains
     * its innerBounds, even if the content mesh is
     * independently adapted.
     */
    private _boundsMesh;
    cursor: Object3D<import("three").Event>;
    /**
     * Allows correct shadow maps
     */
    depthMaterial: MeshDepthMaterial;
    domLayout: Object3D<import("three").Event>;
    domSize: Vector3;
    /**
     * The desired pseudo state (changing this will set needsRefresh to true)
     */
    get desiredPseudoStates(): {
        hover: boolean;
        active: boolean;
        focus: boolean;
        target: boolean;
    };
    /**
     * Get the hover state
     */
    get pseudoStates(): {
        hover: boolean;
        active: boolean;
        focus: boolean;
        target: boolean;
    } | undefined;
    /**
     * Get the layer depth (distance from this layer's element and the parent layer's element)
     */
    get depth(): number;
    /**
     *
     */
    get index(): number;
    get needsRefresh(): boolean;
    setNeedsRefresh(recurse?: boolean): void;
    /** If true, this layer needs to be removed from the scene */
    get needsRemoval(): boolean;
    bounds: Bounds;
    margin: Edges;
    get parentWebLayer(): WebLayer3D | undefined;
    childWebLayers: WebLayer3D[];
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
     * Refresh from DOM (potentially slow, call only when needed)
     */
    refresh(recurse?: boolean): Promise<void>;
    private updateLayout;
    private updateContent;
    /** INTERNAL */
    private [ON_BEFORE_UPDATE];
    protected _doUpdate(): void;
    update(recurse?: boolean): void;
    querySelector(selector: string): WebLayer3D | undefined;
    traverseLayerAncestors(each: (layer: WebLayer3D) => void): void;
    traverseLayersPreOrder(each: (layer: WebLayer3D) => boolean | void): boolean;
    traverseLayersPostOrder(each: (layer: WebLayer3D) => boolean | void): boolean;
    dispose(): void;
    private _refreshMediaBounds;
    private _updateDOMLayout;
}
