import "fast-text-encoding";
import { Bounds, Edges } from './dom-utils';
import { WebLayerManagerBase } from './WebLayerManagerBase';
export declare type EventCallback = (event: 'layerpainted' | 'layercreated' | 'layermoved', data: {
    target: Element;
}) => void;
export declare class WebLayer {
    manager: WebLayerManagerBase;
    element: Element;
    eventCallback: EventCallback;
    id: string;
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
    previousDOMStateHash?: string;
    currentDOMStateHash?: string;
    get previousDOMState(): import("./WebLayerManagerBase").LayerState | undefined;
    get currentDOMState(): import("./WebLayerManagerBase").LayerState | undefined;
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
    refresh(serializeSync?: boolean): void;
    private _updateParentAndChildLayers;
    private _tryConvertElementToWebLayer;
}
