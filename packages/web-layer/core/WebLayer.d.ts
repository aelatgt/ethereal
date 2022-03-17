import { Bounds, Edges } from './dom-utils';
import { WebLayerManagerBase } from './WebLayerManagerBase';
export declare type EventCallback = (event: 'layerpainted' | 'layercreated' | 'layermoved', data: {
    target: Element;
}) => void;
export declare class WebLayer {
    manager: WebLayerManagerBase;
    element: Element;
    eventCallback: EventCallback;
    isMediaElement: boolean;
    isVideoElement: boolean;
    isCanvasElement: boolean;
    constructor(manager: WebLayerManagerBase, element: Element, eventCallback: EventCallback);
    desiredPseudoState: {
        hover: boolean;
        active: boolean;
        focus: boolean;
        target: boolean;
    };
    needsRefresh: boolean;
    setNeedsRefresh(recurse?: boolean): void;
    needsRemoval: boolean;
    parentLayer?: WebLayer;
    childLayers: WebLayer[];
    pixelRatio?: number;
    allStateHashes: Set<string>;
    previousDOMStateKey?: string | HTMLMediaElement;
    desiredDOMStateKey?: string | HTMLMediaElement;
    currentDOMStateKey?: string | HTMLMediaElement;
    get previousDOMState(): import("./WebLayerManagerBase").StateData | undefined;
    get desiredDOMState(): import("./WebLayerManagerBase").StateData | undefined;
    get currentDOMState(): import("./WebLayerManagerBase").StateData | undefined;
    domMetrics: {
        bounds: Bounds;
        padding: Edges;
        margin: Edges;
        border: Edges;
    };
    get depth(): number;
    get rootLayer(): WebLayer;
    traverseParentLayers(each: (layer: WebLayer) => void): void;
    traverseLayers(each: (layer: WebLayer) => void): void;
    traverseChildLayers(each: (layer: WebLayer) => void): void;
    update(): void;
    refresh(): Promise<void>;
    private _updateParentAndChildLayers;
    private _tryConvertElementToWebLayer;
}
