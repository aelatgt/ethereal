import { WebRenderer } from './WebRenderer';
import "fast-text-encoding";
import { traverseChildElements, getBounds, getPadding, getMargin, getBorder, Bounds, Edges } from './dom-utils';
import * as sha256 from 'fast-sha256';
import { serializeToString, serializeAttribute, serializeAttributeValue } from './xml-serializer';
import { WebLayerCache } from './WebLayerCache';
const encoder = new TextEncoder();
function nearestPowerOf2(n) {
    return 1 << 31 - Math.clz32(n);
}
function nextPowerOf2(n) {
    return nearestPowerOf2((n - 1) * 2);
}
export class WebLayer {
    element;
    eventCallback;
    static CACHE = new WebLayerCache();
    static MINIMUM_RENDER_ATTEMPTS = 3;
    static canvasPool = [];
    id;
    constructor(element, eventCallback) {
        this.element = element;
        this.eventCallback = eventCallback;
        WebRenderer.layers.set(element, this);
        this.id = element.getAttribute(WebRenderer.ELEMENT_UID_ATTRIBUTE) || WebRenderer.generateElementUID();
        element.setAttribute(WebRenderer.ELEMENT_UID_ATTRIBUTE, this.id);
        element.setAttribute(WebRenderer.LAYER_ATTRIBUTE, '');
        this.parentLayer = WebRenderer.getClosestLayer(this.element, false);
        this.eventCallback('layercreated', { target: element });
        this._hashingCanvas.width = 30;
        this._hashingCanvas.height = 30;
    }
    needsRefresh = true;
    needsRemoval = false;
    pseudoStates = {
        hover: false,
        active: false,
        focus: false,
        target: false
    };
    svgImage = new Image();
    parentLayer;
    childLayers = [];
    pixelRatio;
    _desiredStateHash = '';
    _rasterizingStateHash = '';
    _currentStateHash = '';
    _svgSrc = '';
    _svgDocument = '';
    _hashingCanvas = document.createElement('canvas');
    _domMetrics = {
        bounds: new Bounds(),
        padding: new Edges(),
        margin: new Edges(),
        border: new Edges()
    };
    textureUrl;
    bounds = new Bounds;
    margin = new Edges;
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
        if (!this._currentStateHash) {
            const metrics = this._domMetrics;
            this.bounds.copy(metrics.bounds);
            this.margin.copy(metrics.margin);
        }
        else {
            const data = WebLayer.CACHE.getLayerStateData(this._currentStateHash);
            this.bounds.copy(data.bounds);
            this.margin.copy(data.margin);
            if (this.textureUrl !== data.textureUrl) {
                this.textureUrl = data.textureUrl;
                this.eventCallback('layerpainted', { target: this.element });
            }
        }
    }
    refresh() {
        if (!this._currentStateHash) {
            const metrics = this._domMetrics;
            getBounds(this.element, metrics.bounds, this.parentLayer && this.parentLayer.element);
            getMargin(this.element, metrics.margin);
        }
        this.needsRefresh = false;
        this._updateParentAndChildLayers();
        WebRenderer.addToSerializeQueue(this);
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
        const id = el.getAttribute(WebRenderer.ELEMENT_UID_ATTRIBUTE);
        if (!id) {
            el.setAttribute(WebRenderer.ELEMENT_UID_ATTRIBUTE, WebRenderer.generateElementUID());
        }
        const isLayer = el.hasAttribute(WebRenderer.LAYER_ATTRIBUTE);
        if (isLayer || el.nodeName === 'VIDEO' || styles.transform !== 'none') {
            let child = WebRenderer.layers.get(el);
            if (!child) {
                child = new WebLayer(el, this.eventCallback);
            }
            this.childLayers.push(child);
            return false; // stop traversing this subtree
        }
        return true;
    }
    serializationReplacer = (node) => {
        if (this.element === node)
            return;
        const element = node;
        const tagName = element.tagName?.toLowerCase();
        if (tagName === 'style' || tagName === 'link')
            return '';
        const layer = WebRenderer.layers.get(element);
        if (layer) {
            const bounds = layer._domMetrics.bounds;
            let attributes = '';
            // in order to increase our cache hits, don't serialize nested layers
            // instead, replace nested layers with an invisible placerholder that is the same width/height
            // downsides of this are that we lose subpixel precision. To avoid any rendering issues,
            // each sublayer should have explictly defined sizes (no fit-content or auto sizing). 
            const extraStyle = `box-sizing:border-box;max-width:${bounds.width + 1}px;max-height:${bounds.height + 1}px;min-width:${bounds.width}px;min-height:${bounds.height}px;visibility:hidden`;
            let addedStyle = false;
            for (const attr of layer.element.attributes) {
                if (attr.name === 'src')
                    continue;
                if (attr.name == 'style') {
                    attributes += serializeAttribute(attr.name, attr.value + ';' + extraStyle);
                    addedStyle = true;
                }
                else {
                    attributes += serializeAttribute(attr.name, attr.value);
                }
            }
            if (!addedStyle) {
                attributes += serializeAttribute('style', extraStyle);
            }
            const tag = element.tagName.toLowerCase();
            return `<${tag} ${attributes}></${tag}>`;
        }
    };
    async serialize() {
        const layerElement = this.element;
        if (layerElement.nodeName === 'VIDEO')
            return;
        const metrics = this._domMetrics;
        getBounds(layerElement, metrics.bounds, this.parentLayer?.element);
        getMargin(layerElement, metrics.margin);
        let { width, height } = metrics.bounds;
        // add margins
        width += Math.max(metrics.margin.left, 0) + Math.max(metrics.margin.right, 0);
        height += Math.max(metrics.margin.top, 0) + Math.max(metrics.margin.bottom, 0);
        if (width * height > 0) {
            getPadding(layerElement, metrics.padding);
            getBorder(layerElement, metrics.border);
            // create svg markup
            const elementAttribute = WebRenderer.attributeHTML(WebRenderer.ELEMENT_UID_ATTRIBUTE, '' + this.id);
            const computedStyle = getComputedStyle(layerElement);
            const needsInlineBlock = computedStyle.display === 'inline';
            WebRenderer.updateInputAttributes(layerElement);
            const parentsHTML = this._getParentsHTML(layerElement);
            parentsHTML[0] = parentsHTML[0].replace('html', 'html ' + WebRenderer.RENDERING_DOCUMENT_ATTRIBUTE + '="" ');
            const svgCSS = await WebRenderer.getAllEmbeddedStyles(layerElement);
            let layerHTML = await serializeToString(layerElement, this.serializationReplacer);
            layerHTML = layerHTML.replace(elementAttribute, `${elementAttribute} ${WebRenderer.RENDERING_ATTRIBUTE}="" ` +
                `${needsInlineBlock ? `${WebRenderer.RENDERING_INLINE_ATTRIBUTE}="" ` : ' '} ` +
                WebRenderer.getPsuedoAttributes(this.pseudoStates));
            const docString = '<svg width="' +
                width +
                '" height="' +
                height +
                '" xmlns="http://www.w3.org/2000/svg"><defs><style type="text/css"><![CDATA[\n' +
                svgCSS.join('\n') +
                ']]></style></defs><foreignObject x="0" y="0" width="' +
                (width + 1) +
                '" height="' +
                (height + 1) +
                '">' +
                parentsHTML[0] +
                layerHTML +
                parentsHTML[1] +
                '</foreignObject></svg>';
            const svgDoc = this._svgDocument = docString;
            const svgHash = this._desiredStateHash = WebRenderer.arrayBufferToBase64(sha256.hash(encoder.encode(svgDoc))) +
                '?w=' + width +
                ';h=' + height;
            // set the current layer hash
            this._currentStateHash = svgHash;
            // update the layer state data
            // console.log('serialized ' + svgHash)
            const data = WebLayer.CACHE.getLayerStateData(svgHash);
            data.bounds.copy(metrics.bounds);
            data.margin.copy(metrics.margin);
            // console.log(metrics.bounds)
            // if we've already processed this exact layer state several times, we should 
            // be confident about what it looks like, and don't need to rerender
            if (data.renderAttempts >= WebLayer.MINIMUM_RENDER_ATTEMPTS && data.textureHash)
                return;
            // rasterize (and then render) the svg document 
            WebRenderer.addToRasterizeQueue(this);
        }
        else {
            this.bounds.copy(metrics.bounds);
            this.margin.copy(metrics.margin);
        }
    }
    async rasterize() {
        return new Promise((resolve, reject) => {
            const render = () => {
                WebRenderer.addToRenderQueue(this);
                this.svgImage.onload = null;
                resolve();
            };
            this.svgImage.onload = () => {
                setTimeout(render, 10); // delay to make sure internal SVG images/resources are fully loaded 
            };
            this.svgImage.onerror = (error) => {
                reject(error);
            };
            this._rasterizingStateHash = this._desiredStateHash;
            this.svgImage.src = (this._svgSrc = 'data:image/svg+xml;utf8,' + encodeURIComponent(this._svgDocument));
        });
    }
    async render() {
        const svgSrc = this._svgSrc;
        if (!this.svgImage.complete || this.svgImage.currentSrc !== svgSrc) {
            setTimeout(() => WebRenderer.addToRenderQueue(this), 100);
            return;
        }
        const svgHash = this._rasterizingStateHash;
        const stateData = WebLayer.CACHE.getLayerStateData(svgHash);
        let { width, height } = stateData.bounds;
        let { left, top, right, bottom } = stateData.margin;
        const fullWidth = Math.max(width + left + right, 1);
        const fullHeight = Math.max(height + top + bottom, 1);
        const hashingCanvas = this._hashingCanvas;
        let hw = hashingCanvas.width;
        let hh = hashingCanvas.height;
        const hctx = hashingCanvas.getContext('2d');
        hctx.clearRect(0, 0, hw, hh);
        hctx.imageSmoothingEnabled = false;
        hctx.drawImage(this.svgImage, 0, 0, fullWidth, fullHeight, 0, 0, hw, hh);
        const hashData = hctx.getImageData(0, 0, hw, hh).data;
        const pixelRatio = this.pixelRatio ||
            parseFloat(this.element.getAttribute(WebRenderer.PIXEL_RATIO_ATTRIBUTE)) ||
            window.devicePixelRatio;
        const textureWidth = Math.max(nextPowerOf2(fullWidth * pixelRatio), 32) * pixelRatio;
        const textureHeight = Math.max(nextPowerOf2(fullHeight * pixelRatio), 32) * pixelRatio;
        const textureHash = WebRenderer.arrayBufferToBase64(sha256.hash(new Uint8Array(hashData))) +
            '?w=' + textureWidth +
            ';h=' + textureHeight;
        const previousCanvasHash = stateData.textureHash;
        stateData.textureHash = textureHash;
        if (previousCanvasHash !== textureHash) {
            stateData.renderAttempts = 0;
        }
        stateData.renderAttempts++;
        const textureRenderAttempts = WebLayer.CACHE.getTextureData(textureHash)?.renderAttempts || 0;
        if (stateData.renderAttempts > WebLayer.MINIMUM_RENDER_ATTEMPTS && textureRenderAttempts > WebLayer.MINIMUM_RENDER_ATTEMPTS) {
            return;
        }
        setTimeout(() => WebRenderer.addToRenderQueue(this), (500 + Math.random() * 1000) * 2 ^ stateData.renderAttempts);
        const textureData = await WebLayer.CACHE.requestTextureData(textureHash);
        if (previousCanvasHash === textureHash && textureData?.texture)
            return;
        if (this.svgImage.currentSrc !== svgSrc)
            return;
        const canvas = WebLayer.canvasPool.pop() || document.createElement('canvas');
        canvas.width = textureWidth;
        canvas.height = textureHeight;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, textureWidth, textureHeight);
        ctx.drawImage(this.svgImage, 0, 0, fullWidth, fullHeight, 0, 0, textureWidth, textureHeight);
        const imageData = ctx.getImageData(0, 0, textureWidth, textureHeight);
        WebLayer.CACHE.updateTexture(textureHash, imageData).then(() => {
            WebLayer.canvasPool.push(canvas);
        });
    }
    // Get all parents of the embeded html as these can effect the resulting styles
    _getParentsHTML(element) {
        const opens = [];
        const closes = [];
        const metrics = this._domMetrics;
        let parent = element.parentElement;
        if (!parent)
            parent = document.documentElement;
        do {
            let tag = parent.tagName.toLowerCase();
            let attributes = ' ';
            let style = '';
            for (const a of parent.attributes) {
                const value = serializeAttributeValue(a.value);
                if (a.name === 'style') {
                    style = value;
                    continue;
                }
                attributes += `${a.name}="${value}" `;
            }
            const open = '<' +
                tag +
                (tag === 'html'
                    ? ` xmlns="http://www.w3.org/1999/xhtml" style="--x-width:${metrics.bounds.width}px;--x-height:${metrics.bounds.height}px;--x-inline-top:${metrics.border.top + metrics.margin.top + metrics.padding.top}px; ${style}" `
                    : ` style="${style}" ${WebRenderer.RENDERING_PARENT_ATTRIBUTE}="" `) +
                attributes +
                ' >';
            opens.unshift(open);
            const close = '</' + tag + '>';
            closes.push(close);
            if (tag == 'html')
                break;
        } while ((parent = parent !== document.documentElement ? parent.parentElement || document.documentElement : null));
        return [opens.join(''), closes.join('')];
    }
}
