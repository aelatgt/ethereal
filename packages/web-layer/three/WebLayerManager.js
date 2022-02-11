import { ClampToEdgeWrapping, LinearFilter, sRGBEncoding } from 'three';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';
import { WebLayerManagerBase } from '../core/WebLayerManagerBase';
export class WebLayerManager extends WebLayerManagerBase {
    static DEFAULT_TRANSCODER_PATH = `https://unpkg.com/@loaders.gl/textures@3.1.7/dist/libs/`;
    static initialize(renderer) {
        WebLayerManager.instance = new WebLayerManager();
        WebLayerManager.instance.renderer = renderer;
        WebLayerManager.instance.textureLoader.detectSupport(renderer);
    }
    static instance;
    constructor() {
        super();
        this.textureLoader.setTranscoderPath(WebLayerManager.DEFAULT_TRANSCODER_PATH);
    }
    renderer;
    textureEncoding = sRGBEncoding;
    texturesByUrl = new Map();
    layersUsingTexture = new WeakMap();
    textureLoader = new KTX2Loader;
    layersByElement = new WeakMap();
    layersByMesh = new WeakMap();
    pixelsPerUnit = 1000;
    getTexture(url, layer) {
        this._requestTexture(url);
        const texture = this.texturesByUrl.get(url);
        if (texture) {
            if (layer)
                this.layersUsingTexture.get(texture)?.add(layer);
            return texture;
        }
        return undefined;
    }
    _texturePromise = new Map();
    _requestTexture(url) {
        if (!this._texturePromise.has(url)) {
            new Promise((resolve) => {
                this._texturePromise.set(url, resolve);
                this.textureLoader.loadAsync(url).then((t) => {
                    t.wrapS = ClampToEdgeWrapping;
                    t.wrapT = ClampToEdgeWrapping;
                    t.minFilter = LinearFilter;
                    t.encoding = this.textureEncoding;
                    this.layersUsingTexture.set(t, new Set());
                    this.texturesByUrl.set(url, t);
                }).finally(() => {
                    resolve(undefined);
                });
            });
        }
    }
    disposeLayer(layer) {
        for (const t of layer.textures) {
            const layers = this.layersUsingTexture.get(t);
            layers.delete(layer);
            if (layers.size === 0)
                t.dispose();
        }
    }
}
