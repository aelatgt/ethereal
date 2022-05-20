import { CanvasTexture, ClampToEdgeWrapping, LinearMipmapLinearFilter, sRGBEncoding } from 'three';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';
import { WebLayerManagerBase } from '../core/WebLayerManagerBase';
export class WebLayerManager extends WebLayerManagerBase {
    static DEFAULT_TRANSCODER_PATH = `https://unpkg.com/@loaders.gl/textures@3.1.7/dist/libs/`;
    static initialize(renderer) {
        WebLayerManager.instance = new WebLayerManager();
        WebLayerManager.instance.renderer = renderer;
        WebLayerManager.instance.ktx2Loader.setWorkerLimit(2);
        WebLayerManager.instance.ktx2Loader.detectSupport(renderer);
        WebLayerManager.instance.ktx2Encoder.setWorkerLimit(1);
    }
    static instance;
    constructor() {
        super();
        this.ktx2Loader.setTranscoderPath(WebLayerManager.DEFAULT_TRANSCODER_PATH);
    }
    renderer;
    textureEncoding = sRGBEncoding;
    ktx2Loader = new KTX2Loader;
    texturesByHash = new Map();
    layersByElement = new WeakMap();
    layersByMesh = new WeakMap();
    getTexture(textureHash) {
        const textureData = this.getTextureState(textureHash);
        if (!this.texturesByHash.has(textureHash)) {
            this.texturesByHash.set(textureHash, {});
        }
        this._loadCompressedTextureIfNecessary(textureData);
        this._loadCanvasTextureIfNecessary(textureData);
        return this.texturesByHash.get(textureHash);
    }
    _compressedTexturePromise = new Map();
    _loadCompressedTextureIfNecessary(textureData) {
        const ktx2Url = textureData.ktx2Url;
        if (!ktx2Url)
            return;
        if (!this._compressedTexturePromise.has(textureData.hash)) {
            new Promise((resolve) => {
                this._compressedTexturePromise.set(textureData.hash, resolve);
                this.ktx2Loader.loadAsync(ktx2Url).then((t) => {
                    t.wrapS = ClampToEdgeWrapping;
                    t.wrapT = ClampToEdgeWrapping;
                    t.minFilter = LinearMipmapLinearFilter;
                    t.encoding = this.textureEncoding;
                    this.texturesByHash.get(textureData.hash).compressedTexture = t;
                }).finally(() => {
                    resolve(undefined);
                });
            });
        }
    }
    _canvasTexturePromise = new Map();
    _loadCanvasTextureIfNecessary(textureData) {
        const threeTextureData = this.texturesByHash.get(textureData.hash);
        if (threeTextureData.compressedTexture) {
            threeTextureData.canvasTexture?.dispose();
            threeTextureData.canvasTexture = undefined;
            return;
        }
        const canvas = textureData.canvas;
        if (!canvas)
            return;
        if (!threeTextureData.canvasTexture && !threeTextureData.compressedTexture) {
            const t = new CanvasTexture(canvas);
            t.wrapS = ClampToEdgeWrapping;
            t.wrapT = ClampToEdgeWrapping;
            t.minFilter = LinearMipmapLinearFilter;
            t.encoding = this.textureEncoding;
            t.flipY = false;
            threeTextureData.canvasTexture = t;
        }
    }
}
