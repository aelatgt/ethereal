import { Bounds, Edges } from "./dom-utils"
import Dexie, { Table, liveQuery, Subscription } from 'dexie'

// @ts-ignore
import KTX2Encoder from './textures/KTX2Encoder.bundle.js';
import type { KTX2Encoder as KTX2EncoderType } from './textures/KTX2Encoder'

export type StateHash = string
export type TextureHash = string

export interface LayerStateData {
    bounds: Bounds
    margin: Edges
    renderAttempts: number
    textureHash?: TextureHash,
    textureUrl?: string
}

export interface TextureData {
    hash: TextureHash
    renderAttempts: number
    lastUsedTime: number
    texture?: ArrayBuffer
}
  
export class TextureStore extends Dexie {

    textures!: Table<TextureData>;

    constructor(name:string) {
        super(name)
        this.version(1).stores({
            textures: '&hash, lastUsedTime'
        })
    }
}

export class WebLayerCache {
    static instance = new WebLayerCache

    constructor(name = "web-layer-cache") {
        this._textureStore = new TextureStore(name)
    }
    
    private _textureStore:TextureStore
    private _textureUrls = new Map<TextureHash, string>()
    private _textureData = new Map<TextureHash, TextureData>()
    private _textureSubscriptions = new Map<TextureHash, Subscription>()
    private _layerStateData = new Map<StateHash, LayerStateData>()
    private _encoder = new KTX2Encoder() as KTX2EncoderType

    getLayerStateData(hash:StateHash) {
        let data = this._layerStateData.get(hash)
        if (!data) {
            data = {bounds: new Bounds, margin: new Edges, renderAttempts: 0}
            this._layerStateData.set(hash, data)
        }
        if (data.textureHash) {
            data.textureUrl = this.getTextureURL(data.textureHash)
        }
        return data
    }

    async updateTexture(textureHash:TextureHash, imageData:ImageData) {
        return new Promise(async (resolve) => {
            try {
                const ktx2Texture = await this._encoder.encode(imageData as any)
                const textureData = await this._textureStore.textures.get(textureHash) || 
                    {hash: textureHash, renderAttempts: 0, lastUsedTime:Date.now(), texture:undefined}
                textureData.texture = ktx2Texture
                textureData.renderAttempts++
                this._textureStore.textures.put(textureData)                
            } finally {
                resolve(null)
            }
        })
    }

    async requestTextureData(textureHash:TextureHash) {
        // this._textureStore.textures.update(textureHash, {lastUsedTime: Date.now()})

        if (!this._textureSubscriptions.has(textureHash)) {

            const subscription = liveQuery(() => this._textureStore.textures.get(textureHash)).subscribe((value) => {
                if (value) {
                    this._textureData.set(textureHash, value)
                    const previousBlobUrl = this._textureUrls.get(textureHash)
                    if (previousBlobUrl) URL.revokeObjectURL(previousBlobUrl)
                    if (value.texture) {
                        this._textureUrls.set(textureHash, URL.createObjectURL(new Blob([value.texture], {type: 'image/ktx2'})))
                    } else {
                        this._textureUrls.delete(textureHash)
                    }
                }
            })

            this._textureSubscriptions.set(textureHash, subscription)
        }

        return this._textureStore.textures.get(textureHash)
    }

    getTextureData(textureHash:TextureHash) {
        if (!this._textureSubscriptions.has(textureHash)) this.requestTextureData(textureHash)
        return this._textureData.get(textureHash)
    }

    getTextureURL(textureHash:TextureHash) {
        if (!this._textureSubscriptions.has(textureHash)) this.requestTextureData(textureHash)
        return this._textureUrls.get(textureHash)
    }

}

