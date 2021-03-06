import "fast-text-encoding";
import { Bounds, Edges } from './dom-utils';
export declare type EventCallback = (event: 'layerpainted' | 'layercreated' | 'layermoved', data: {
    target: Element;
}) => void;
declare type SVGHash = string;
export declare class WebLayer {
    element: Element;
    eventCallback: EventCallback;
    static DEFAULT_CACHE_SIZE: number;
    private static svgRetryCount;
    private static svgCanvasHash;
    private static cachedCanvases;
    id: string;
    constructor(element: Element, eventCallback: EventCallback);
    needsRefresh: boolean;
    needsRemoval: boolean;
    pseudoStates: {
        hover: boolean;
        active: boolean;
        focus: boolean;
        target: boolean;
    };
    svgImage: HTMLImageElement;
    private bounds;
    private padding;
    private margin;
    private border;
    parentLayer?: WebLayer;
    childLayers: WebLayer[];
    pixelRatio?: number;
    rasterizationCount: Map<string, number>;
    cachedBounds: Map<string, Bounds>;
    cachedMargin: Map<string, Edges>;
    private _dynamicAttributes;
    private _svgHash;
    private _svgDocument;
    private _svgHashRasterizing;
    private _svgSrc;
    private _hashingCanvas;
    _currentSVGHash?: string;
    _currentCanvas?: HTMLCanvasElement;
    _currentBounds: Bounds;
    _currentMargin: Edges;
    trySetFromSVGHash(svgHash: SVGHash): boolean;
    get currentCanvas(): HTMLCanvasElement | undefined;
    get currentBounds(): Bounds;
    get currentMargin(): Edges;
    get depth(): number;
    get rootLayer(): WebLayer;
    traverseParentLayers(each: (layer: WebLayer) => void): void;
    traverseLayers(each: (layer: WebLayer) => void): void;
    traverseChildLayers(each: (layer: WebLayer) => void): void;
    refresh(): void;
    private _updateParentAndChildLayers;
    private _tryConvertElementToWebLayer;
    serializationReplacer: (node: Node) => string | undefined;
    serialize(): Promise<void>;
    rasterize(): Promise<void>;
    render(): void;
    private _getParentsHTML;
}
export {};
