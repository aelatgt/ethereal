import { Bounds, Edges } from "./dom-utils"
import Dexie, {Table, liveQuery, Subscription} from 'dexie'
import {KTX2BasisUniversalTextureWriter} from '@loaders.gl/textures';


export type StateHash = string
export type CanvasHash = string

export interface LayerStateData {
    bounds: Bounds
    margin: Edges
    renderAttempts: number
    canvasHash?: CanvasHash,
    textureUrl?: string
}

export interface TextureData {
    lastUsedTime: number
    texture?: Blob
}
  
export class TextureStore extends Dexie {

    textures!: Table<TextureData>;

    constructor(name:string) {
        super(name)
        this.version(1).stores({
            textures: '&hash, renderAttempts, lastUsedTime'
        })
    }
}

export class WebLayerCache {
    static instance = new WebLayerCache

    constructor(name = "web-layer-cache") {
        this._textureStore = new TextureStore(name)
    }
    
    private _textureStore:TextureStore
    private _textureUrls = new Map<CanvasHash, string>()
    private _textureSubscriptions = new Map<CanvasHash, Subscription>()
    private _layerStateData = new Map<StateHash, LayerStateData>()

    getLayerStateData(hash:StateHash) {
        let data = this._layerStateData.get(hash)
        if (!data) {
            data = {bounds: new Bounds, margin: new Edges, renderAttempts: 0}
        }
        if (data.canvasHash) {
            data.textureUrl = this.getTextureURL(data.canvasHash)
        }
        return data
    }

    async updateTexture(canvasHash:CanvasHash, canvas:HTMLCanvasElement) {
        return new Promise((resolve) => {
            canvas.toBlob(async (blob) => {
                if (!blob) return
                const data = new Uint8Array(await blob.arrayBuffer())
                const image = {data, width: canvas.width, height: canvas.height}
                const basis = await KTX2BasisUniversalTextureWriter.encode(image, {})
                const textureData = await this._textureStore.textures.get(canvasHash) || {lastUsedTime:Date.now(), texture:undefined}
                textureData.texture = new Blob([basis], {type: 'image/ktx2'})
                this._textureStore.textures.put(textureData)
                resolve(null)
            })
        })
    }

    getTextureURL(canvasHash:CanvasHash) {
        let url = this._textureUrls.get(canvasHash)

        if (!this._textureSubscriptions.has(canvasHash)) {

            const subscription = liveQuery(() => this._textureStore.textures.get(canvasHash)).subscribe((value) => {
                if (value) {
                    const previousBlobUrl = this._textureUrls.get(canvasHash)
                    if (previousBlobUrl) URL.revokeObjectURL(previousBlobUrl)
                    this._textureUrls.set(canvasHash, URL.createObjectURL(value.texture))
                }
            })

            this._textureSubscriptions.set(canvasHash, subscription)
        }

        return url
    }

}

