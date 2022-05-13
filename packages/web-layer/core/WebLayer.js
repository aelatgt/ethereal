import { WebRenderer } from './WebRenderer';
import { traverseChildElements, Bounds, Edges } from './dom-utils';
export class WebLayer {
    manager;
    element;
    eventCallback;
    isMediaElement = false;
    isVideoElement = false;
    isCanvasElement = false;
    constructor(manager, element, eventCallback) {
        this.manager = manager;
        this.element = element;
        this.eventCallback = eventCallback;
        if (!manager)
            throw new Error("WebLayerManager must be initialized");
        WebRenderer.layers.set(element, this);
        element.setAttribute(WebRenderer.LAYER_ATTRIBUTE, '');
        this.parentLayer = WebRenderer.getClosestLayer(this.element, false);
        this.isVideoElement = element.nodeName === 'VIDEO';
        this.isMediaElement = this.isVideoElement || element.nodeName === 'IMG' || element.nodeName === 'CANVAS';
        this.eventCallback('layercreated', { target: element });
    }
    desiredPseudoState = {
        hover: false,
        active: false,
        focus: false,
        target: false
    };
    needsRefresh = true;
    setNeedsRefresh(recurse = false) {
        this.needsRefresh = true;
        if (recurse)
            for (const c of this.childLayers)
                c.setNeedsRefresh(recurse);
    }
    needsRemoval = false;
    parentLayer;
    childLayers = [];
    set pixelRatio(val) {
        const isNumber = typeof val === 'number';
        if (isNumber) {
            this.element.setAttribute(WebRenderer.PIXEL_RATIO_ATTRIBUTE, val.toString());
        }
        else {
            this.element.removeAttribute(WebRenderer.PIXEL_RATIO_ATTRIBUTE);
        }
    }
    get pixelRatio() {
        const val = this.element.getAttribute(WebRenderer.PIXEL_RATIO_ATTRIBUTE);
        return val ? parseFloat(val) : null;
    }
    get computedPixelRatio() {
        return this.pixelRatio ?? this.parentLayer?.computedPixelRatio ?? 1;
    }
    allStateHashes = new Set();
    previousDOMStateKey;
    desiredDOMStateKey;
    currentDOMStateKey;
    lastSVGUrl;
    get previousDOMState() {
        return this.previousDOMStateKey ? this.manager.getLayerState(this.previousDOMStateKey) : undefined;
    }
    get desiredDOMState() {
        return this.desiredDOMStateKey ? this.manager.getLayerState(this.desiredDOMStateKey) : undefined;
    }
    get currentDOMState() {
        return this.currentDOMStateKey ? this.manager.getLayerState(this.currentDOMStateKey) : undefined;
    }
    domMetrics = {
        bounds: new Bounds(),
        padding: new Edges(),
        margin: new Edges(),
        border: new Edges()
    };
    get depth() {
        let depth = 0;
        let layer = this;
        while (layer.parentLayer) {
            layer = layer.parentLayer;
            depth++;
        }
        return depth;
    }
    get rootLayer() {
        let rootLayer = this;
        while (rootLayer.parentLayer)
            rootLayer = rootLayer.parentLayer;
        return rootLayer;
    }
    traverseParentLayers(each) {
        const parentLayer = this.parentLayer;
        if (parentLayer) {
            parentLayer.traverseParentLayers(each);
            each(parentLayer);
        }
    }
    traverseLayers(each) {
        each(this);
        this.traverseChildLayers(each);
    }
    traverseChildLayers(each) {
        for (const child of this.childLayers) {
            child.traverseLayers(each);
        }
    }
    update() {
        if (this.desiredDOMStateKey !== this.currentDOMStateKey) {
            const desired = this.desiredDOMState;
            if (desired && (this.isMediaElement || desired.texture?.ktx2Url || desired.texture?.canvas || desired.fullWidth * desired.fullHeight === 0)) {
                this.currentDOMStateKey = this.desiredDOMStateKey;
            }
        }
        const prev = this.previousDOMState?.texture?.ktx2Url ?? this.previousDOMState?.texture?.canvas;
        const current = this.currentDOMState?.texture?.ktx2Url ?? this.previousDOMState?.texture?.canvas;
        if (current && prev !== current) {
            this.eventCallback('layerpainted', { target: this.element });
        }
        this.previousDOMStateKey = this.currentDOMStateKey;
    }
    async refresh() {
        this.needsRefresh = false;
        this._updateParentAndChildLayers();
        const result = await this.manager.addToSerializeQueue(this);
        if (result.needsRasterize && typeof result.stateKey === 'string' && result.svgUrl)
            await this.manager.addToRasterizeQueue(result.stateKey, result.svgUrl);
    }
    _updateParentAndChildLayers() {
        const element = this.element;
        const childLayers = this.childLayers;
        const oldChildLayers = childLayers.slice();
        const previousParentLayer = this.parentLayer;
        this.parentLayer = WebRenderer.getClosestLayer(this.element, false);
        if (previousParentLayer !== this.parentLayer) {
            this.parentLayer && this.parentLayer.childLayers.push(this);
            this.eventCallback('layermoved', { target: element });
        }
        childLayers.length = 0;
        traverseChildElements(element, this._tryConvertElementToWebLayer, this);
        for (const child of oldChildLayers) {
            const parentLayer = WebRenderer.getClosestLayer(child.element, false);
            if (!parentLayer) {
                child.needsRemoval = true;
                childLayers.push(child);
            }
        }
    }
    _tryConvertElementToWebLayer(n) {
        if (this.needsRemoval)
            return false;
        const el = n;
        const styles = getComputedStyle(el);
        const isLayer = el.hasAttribute(WebRenderer.LAYER_ATTRIBUTE);
        if (isLayer || el.nodeName === 'VIDEO' || styles.transform !== 'none') {
            let child = WebRenderer.layers.get(el);
            if (!child) {
                child = new WebLayer(this.manager, el, this.eventCallback);
            }
            this.childLayers.push(child);
            return false; // stop traversing this subtree
        }
        return true;
    }
}
