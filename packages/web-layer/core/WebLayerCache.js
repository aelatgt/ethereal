import { Bounds, Edges } from "./dom-utils";
import Dexie, { liveQuery } from 'dexie';
// @ts-ignore
import { KTX2Encoder } from './textures/KTX2Encoder.bundle.js';
export class TextureStore extends Dexie {
    textures;
    constructor(name) {
        super(name);
        this.version(1).stores({
            textures: '&hash, lastUsedTime'
        });
    }
}
export class WebLayerCache {
    static instance = new WebLayerCache;
    constructor(name = "web-layer-cache") {
        this._textureStore = new TextureStore(name);
    }
    _textureStore;
    _textureUrls = new Map();
    _textureData = new Map();
    _textureSubscriptions = new Map();
    _layerStateData = new Map();
    _encoder = new KTX2Encoder();
    getLayerStateData(hash) {
        let data = this._layerStateData.get(hash);
        if (!data) {
            data = {
                bounds: new Bounds,
                margin: new Edges,
                renderAttempts: 0,
                fullWidth: 1,
                fullHeight: 1,
                textureWidth: 32,
                textureHeight: 32,
                pixelRatio: 1
            };
            this._layerStateData.set(hash, data);
        }
        if (data.textureHash) {
            data.textureUrl = this.getTextureURL(data.textureHash);
        }
        return data;
    }
    async updateTexture(textureHash, imageData) {
        return new Promise(async (resolve) => {
            try {
                const ktx2Texture = await this._encoder.encode(imageData);
                const textureData = await this._textureStore.textures.get(textureHash) ||
                    { hash: textureHash, renderAttempts: 0, lastUsedTime: Date.now(), texture: undefined };
                textureData.texture = ktx2Texture;
                textureData.renderAttempts++;
                this._textureStore.textures.put(textureData);
            }
            finally {
                resolve(null);
            }
        });
    }
    async requestTextureData(textureHash) {
        // this._textureStore.textures.update(textureHash, {lastUsedTime: Date.now()})
        if (!this._textureSubscriptions.has(textureHash)) {
            const subscription = liveQuery(() => this._textureStore.textures.get(textureHash)).subscribe((value) => {
                if (value) {
                    this._textureData.set(textureHash, value);
                    const previousBlobUrl = this._textureUrls.get(textureHash);
                    if (previousBlobUrl)
                        URL.revokeObjectURL(previousBlobUrl);
                    if (value.texture) {
                        this._textureUrls.set(textureHash, URL.createObjectURL(new Blob([value.texture], { type: 'image/ktx2' })));
                    }
                    else {
                        this._textureUrls.delete(textureHash);
                    }
                }
            });
            this._textureSubscriptions.set(textureHash, subscription);
        }
        return this._textureStore.textures.get(textureHash);
    }
    getTextureData(textureHash) {
        if (!this._textureSubscriptions.has(textureHash))
            this.requestTextureData(textureHash);
        return this._textureData.get(textureHash);
    }
    getTextureURL(textureHash) {
        if (!this._textureSubscriptions.has(textureHash))
            this.requestTextureData(textureHash);
        return this._textureUrls.get(textureHash);
    }
}
