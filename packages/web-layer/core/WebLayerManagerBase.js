import { Bounds, Edges, getBorder, getBounds, getMargin, getPadding } from "./dom-utils";
import Dexie from 'dexie';
// @ts-ignore
import { KTX2Encoder } from './textures/KTX2Encoder.bundle.js';
import { WebRenderer } from "./WebRenderer";
import { serializeToString } from "./serialization-utils";
import { getParentsHTML } from "./serialization-utils";
import { bufferToHex } from "./hex-utils";
export class TextureStore extends Dexie {
    textures;
    constructor(name) {
        super(name);
        this.version(1).stores({
            textures: '&hash, lastUsedTime'
        });
    }
}
function nearestPowerOf2(n) {
    return 1 << 31 - Math.clz32(n);
}
function nextPowerOf2(n) {
    return nearestPowerOf2((n - 1) * 2);
}
export class WebLayerManagerBase {
    WebRenderer = WebRenderer;
    constructor(name = "web-layer-cache") {
        this._textureStore = new TextureStore(name);
        window.addEventListener("blur", (event) => {
            this._textureStore.textures.bulkPut(Array.from(this._textureData.values()));
        });
    }
    _textureStore;
    _textureUrls = new Map();
    _textureData = new Map();
    _layerState = new Map();
    serializeQueue = [];
    rasterizeQueue = [];
    MINIMUM_RENDER_ATTEMPTS = 3;
    canvasPool = [];
    imagePool = [];
    textEncoder = new TextEncoder();
    ktx2Encoder = new KTX2Encoder();
    useCreateImageBitmap = false;
    getLayerState(hash) {
        let data = this._layerState.get(hash);
        if (!data) {
            data = {
                bounds: new Bounds,
                margin: new Edges,
                fullWidth: 0,
                fullHeight: 0,
                renderAttempts: 0,
                texture: {
                    hash: undefined,
                    url: undefined,
                    width: 32,
                    height: 32,
                    pixelRatio: 1
                },
                pseudo: {
                    hover: false,
                    active: false,
                    focus: false,
                    target: false
                }
            };
            this._layerState.set(hash, data);
        }
        if (data.texture.hash) {
            data.texture.url = this.getTextureURL(data.texture.hash);
        }
        return data;
    }
    async updateTexture(textureHash, imageData) {
        const ktx2Texture = await this.ktx2Encoder.encode(imageData);
        const textureData = this._textureData.get(textureHash) ||
            { hash: textureHash, renderAttempts: 0, lastUsedTime: Date.now(), texture: undefined };
        textureData.texture = ktx2Texture;
        this._textureData.set(textureHash, textureData);
    }
    async requestTextureData(textureHash) {
        if (!this._textureData.has(textureHash)) {
            const textureData = await this._textureStore.textures.get(textureHash);
            if (textureData && !this._textureData.has(textureHash)) {
                this._textureData.set(textureHash, textureData);
            }
        }
        const textureData = this._textureData.get(textureHash);
        const textureDataBuffer = textureData?.texture;
        if (!this._textureUrls.has(textureHash) && textureDataBuffer) {
            await void this._textureUrls.set(textureHash, URL.createObjectURL(new Blob([textureDataBuffer], { type: 'image/ktx2' })));
        }
        return this._textureData.get(textureHash);
    }
    getTextureData(textureHash) {
        if (!this._textureData.has(textureHash))
            setTimeout(() => this.requestTextureData(textureHash), 1);
        return this._textureData.get(textureHash);
    }
    getTextureURL(textureHash) {
        if (!this._textureUrls.has(textureHash))
            setTimeout(() => this.requestTextureData(textureHash), 1);
        return this._textureUrls.get(textureHash);
    }
    tasksPending = false;
    serializePendingCount = 0;
    rasterizePendingCount = 0;
    MAX_SERIALIZE_TASK_COUNT = 10;
    MAX_RASTERIZE_TASK_COUNT = 10;
    scheduleTasksIfNeeded() {
        if (this.tasksPending ||
            (this.serializeQueue.length === 0 && this.rasterizeQueue.length === 0))
            return;
        this.tasksPending = true;
        setTimeout(this._runTasks, 1);
    }
    _runTasks = () => {
        const serializeQueue = this.serializeQueue;
        const rasterizeQueue = this.rasterizeQueue;
        // console.log("serialize task size", serializeQueue.length, serializeQueue)
        // console.log("rasterize task size", rasterizeQueue.length, rasterizeQueue)
        while (serializeQueue.length > 0 && this.serializePendingCount < this.MAX_RASTERIZE_TASK_COUNT) {
            this.serializePendingCount++;
            const { layer, resolve } = serializeQueue.shift();
            this.serialize(layer).then((val) => {
                this.serializePendingCount--;
                resolve(val);
            });
        }
        // rasterizeQueue.sort((a, b) => {
        //     const aState = this.getLayerState(a.hash)
        //     const bState = this.getLayerState(b.hash)
        //     const aSize = aState.fullWidth + aState.fullHeight + aState.fullWidth * aState.fullHeight
        //     const bSize = bState.fullWidth + bState.fullHeight + bState.fullWidth * bState.fullHeight
        //     return aSize - bSize
        // })
        while (rasterizeQueue.length > 0 && this.rasterizePendingCount < this.MAX_SERIALIZE_TASK_COUNT) {
            this.rasterizePendingCount++;
            const { hash, url, resolve } = rasterizeQueue.shift();
            this.rasterize(hash, url).finally(() => {
                this.rasterizePendingCount--;
                resolve(undefined);
            });
        }
        this.tasksPending = false;
    };
    addToSerializeQueue(layer) {
        const inQueue = this.serializeQueue.find((v) => v.layer === layer);
        if (inQueue)
            return inQueue.promise;
        layer.currentDOMStateHash = undefined;
        let resolve;
        const promise = new Promise((r) => { resolve = r; });
        this.serializeQueue.push({ layer, resolve, promise });
        return promise;
    }
    async serialize(layer) {
        const layerElement = layer.element;
        const metrics = layer.domMetrics;
        getBounds(layerElement, metrics.bounds, layer.parentLayer?.element);
        getMargin(layerElement, metrics.margin);
        const { width, height } = metrics.bounds;
        // add margins
        const fullWidth = width + Math.max(metrics.margin.left, 0) + Math.max(metrics.margin.right, 0);
        const fullHeight = height + Math.max(metrics.margin.top, 0) + Math.max(metrics.margin.bottom, 0);
        getPadding(layerElement, metrics.padding);
        getBorder(layerElement, metrics.border);
        const pixelRatio = layer.pixelRatio ||
            parseFloat(layer.element.getAttribute(WebRenderer.PIXEL_RATIO_ATTRIBUTE)) ||
            window.devicePixelRatio;
        // create svg markup
        const elementAttribute = WebRenderer.attributeHTML(WebRenderer.ELEMENT_UID_ATTRIBUTE, '' + layer.id);
        const computedStyle = getComputedStyle(layerElement);
        const needsInlineBlock = computedStyle.display === 'inline';
        WebRenderer.updateInputAttributes(layerElement);
        const parentsHTML = getParentsHTML(layer, fullWidth, fullHeight, pixelRatio);
        const svgCSS = await WebRenderer.getAllEmbeddedStyles(layerElement);
        let layerHTML = await serializeToString(layerElement);
        layerHTML = layerHTML.replace(elementAttribute, `${elementAttribute} ${WebRenderer.RENDERING_ATTRIBUTE}="" ` +
            `${needsInlineBlock ? `${WebRenderer.RENDERING_INLINE_ATTRIBUTE}="" ` : ' '} ` +
            WebRenderer.getPsuedoAttributes(layer.desiredPseudoState));
        const textureWidth = Math.max(nextPowerOf2(fullWidth * pixelRatio), 32);
        const textureHeight = Math.max(nextPowerOf2(fullHeight * pixelRatio), 32);
        const docString = '<svg width="' +
            textureWidth +
            '" height="' +
            textureHeight +
            '" xmlns="http://www.w3.org/2000/svg"><defs><style type="text/css"><![CDATA[\n' +
            svgCSS.join('\n') +
            ']]></style></defs><foreignObject x="0" y="0" width="' +
            fullWidth * pixelRatio +
            '" height="' +
            fullHeight * pixelRatio +
            '">' +
            parentsHTML[0] +
            layerHTML +
            parentsHTML[1] +
            '</foreignObject></svg>';
        const svgUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(docString);
        const stateHashBuffer = await crypto.subtle.digest('SHA-1', this.textEncoder.encode(docString));
        const stateHash = bufferToHex(stateHashBuffer) +
            '?w=' + fullWidth +
            ';h=' + fullHeight +
            ';tw=' + textureWidth +
            ';th=' + textureHeight;
        layer.currentDOMStateHash = stateHash;
        // update the layer state data
        // console.log('serialized ' + svgHash)
        const data = this.getLayerState(stateHash);
        data.bounds.copy(metrics.bounds);
        data.margin.copy(metrics.margin);
        data.fullWidth = fullWidth;
        data.fullHeight = fullHeight;
        data.texture.width = textureWidth;
        data.texture.height = textureHeight;
        data.texture.pixelRatio = pixelRatio;
        // console.log(metrics.bounds)
        // @ts-ignore
        layer._svgUrl = svgUrl;
        const nodeName = layer.element.nodeName;
        const needsRasterize = fullWidth * fullHeight > 0 && nodeName !== "VIDEO"
            && (data.renderAttempts < this.MINIMUM_RENDER_ATTEMPTS || !data.texture.hash);
        return { svgHash: stateHash, svgUrl, needsRasterize };
    }
    async rasterize(stateHash, svgUrl) {
        const stateData = this.getLayerState(stateHash);
        const svgImage = this.imagePool.pop() || new Image();
        await new Promise((resolve, reject) => {
            svgImage.onload = () => {
                resolve();
            };
            svgImage.onerror = (error) => {
                reject(error);
            };
            svgImage.width = stateData.texture.width;
            svgImage.height = stateData.texture.height;
            svgImage.src = svgUrl;
        });
        if (!svgImage.complete || svgImage.currentSrc !== svgUrl) {
            throw new Error('Rasterization Failed');
        }
        const { fullWidth, fullHeight, texture } = stateData;
        const { width: textureWidth, height: textureHeight, pixelRatio } = texture;
        const sourceWidth = Math.floor(fullWidth * pixelRatio);
        const sourceHeight = Math.floor(fullHeight * pixelRatio);
        const hashData = await this.getImageData(svgImage, sourceWidth, sourceHeight, 30, 30);
        const textureHashBuffer = await crypto.subtle.digest('SHA-1', hashData.data);
        const textureHash = bufferToHex(textureHashBuffer) +
            '?w=' + textureWidth +
            ';h=' + textureHeight;
        const previousCanvasHash = stateData.texture.hash;
        stateData.texture.hash = textureHash;
        if (previousCanvasHash !== textureHash) {
            stateData.renderAttempts = 0;
        }
        stateData.renderAttempts++;
        if (stateData.renderAttempts > this.MINIMUM_RENDER_ATTEMPTS && stateData.texture) {
            return;
        }
        // in case the svg image wasn't finished loading, we should try again a few times
        setTimeout(() => this.addToRasterizeQueue(stateHash, svgUrl), (500 + Math.random() * 1000) * 2 ^ stateData.renderAttempts);
        const textureData = this.getTextureData(textureHash);
        if (textureData?.texture)
            return;
        const imageData = await this.getImageData(svgImage, sourceWidth, sourceHeight, textureWidth, textureHeight);
        try {
            await this.updateTexture(textureHash, imageData);
        }
        finally {
            this.imagePool.push(svgImage);
        }
    }
    async getImageData(svgImage, sourceWidth, sourceHeight, textureWidth, textureHeight) {
        const canvas = this.canvasPool.pop() || document.createElement('canvas');
        canvas.width = textureWidth;
        canvas.height = textureHeight;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, textureWidth, textureHeight);
        let imageData;
        if (this.useCreateImageBitmap) {
            // this non-blocking api would be nice, but causes chrome to taint the canvas, 
            // and Safari treats the svg size strangely
            const imageBitmap = await createImageBitmap(svgImage, 0, 0, sourceWidth * devicePixelRatio, sourceHeight * devicePixelRatio, {
                resizeWidth: textureWidth,
                resizeHeight: textureHeight,
                resizeQuality: 'high'
            });
            ctx.drawImage(imageBitmap, 0, 0, sourceWidth, sourceHeight, 0, 0, textureWidth, textureHeight);
        }
        else {
            ctx.drawImage(svgImage, 0, 0, sourceWidth, sourceHeight, 0, 0, textureWidth, textureHeight);
        }
        try {
            imageData = ctx.getImageData(0, 0, textureWidth, textureHeight);
        }
        catch (err) {
            // canvas is tainted, don't reuse
            this.useCreateImageBitmap = false;
            return this.getImageData(svgImage, sourceWidth, sourceHeight, textureWidth, textureHeight);
        }
        setTimeout(() => this.canvasPool.push(canvas), 10);
        return imageData;
    }
    addToRasterizeQueue(hash, url) {
        const inQueue = this.rasterizeQueue.find((v) => v.hash === hash);
        if (inQueue)
            return inQueue.promise;
        let resolve;
        const promise = new Promise((r) => { resolve = r; });
        this.rasterizeQueue.push({ hash, url, resolve, promise });
        return promise;
    }
}
