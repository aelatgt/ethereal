import { Bounds, Edges, getBorder, getBounds, getMargin, getPadding } from "./dom-utils"
import Dexie, { Table } from 'dexie'

// @ts-ignore
import { KTX2Encoder } from './textures/KTX2Encoder.bundle.js'
import type { KTX2Encoder as KTX2EncoderType } from './textures/KTX2Encoder'
import { WebRenderer } from "./WebRenderer"
import { WebLayer } from "./WebLayer"
import { serializeToString } from "./serialization-utils"
import { getParentsHTML } from "./serialization-utils"
import { bufferToHex } from "./hex-utils"

import { Packr, Unpackr } from 'msgpackr'

import { gzip, gunzip, compress, zlib, decompress, decompressSync } from 'fflate'
import { rejects } from "assert"

// import * as zip from '@zip.js/zip.js'
// const zipBaseURI = 'https://unpkg.com/@zip.js/zip.js@2.4.4/dist/'

export type StateHash = string
export type SVGUrl = string
export type TextureHash = string

// interface LayerState {
//   opacity: number,
//   layout: Layout<[number,number,number]>,
//   uvLayout: Layout<[number,number]>
// }
// interface Layout<N extends number[]> {
//   position: N,
//   size: N,
//   rotation: N,
//   originPoint: N,
//   alignPoint: N
//   mountPoint: N,
// }
export interface LayerState {
    bounds: Bounds, 
    margin: Edges,
    padding: Edges,
    border: Edges,
    fullWidth: number,
    fullHeight: number,
    renderAttempts: number
    texture: {
        width: number,
        height: number,
        pixelRatio: number,
        hash?: TextureHash,
        url?: string
    },
    pseudo: {
        hover: boolean,
        active: boolean,
        focus: boolean,
        target: boolean
    }
}

export interface StateData {
    hash: StateHash
    textureHash?: TextureHash
}
export interface TextureData {
    hash: TextureHash
    timestamp: number
    texture?: Uint8Array
}
  
export class LayerStore extends Dexie {

    states!: Table<StateData>;
    textures!: Table<TextureData>;

    constructor(name:string) {
        super(name)
        this.version(3).stores({
            states: '&hash',
            textures: '&hash, timestamp'
        })
    }
}


function nearestPowerOf2(n:number) {
    return 1 << 31 - Math.clz32(n);
}

function nextPowerOf2(n:number) {
    return nearestPowerOf2((n-1)*2)
}

export class WebLayerManagerBase {

    WebRenderer = WebRenderer

    autosave = true
    autosaveDelay = 10 * 1000
    _autosaveTimer? : any

    constructor(name = "ethereal-web-store") {
        this.store = new LayerStore(name)
    }

    saveStore() {
        const stateData = Array.from(this._layerState.entries())
            .filter(([k,v]) => typeof k === 'string')
            .map(([k,v]) => ({hash: k as string, textureHash: v.texture.hash}))
        const textureData = Array.from(this._unsavedTextureData.values())
        this._unsavedTextureData.clear()
        return this.loadIntoStore({
            stateData,
            textureData
        })
    }

    private _packr = new Packr({structuredClone:true})
    private _unpackr = new Unpackr({structuredClone:true})

    async importCache(url:string) {
        const response = await fetch(url)
        const zipped = await response.arrayBuffer()
        const buffer = await new Promise<Uint8Array>((resolve, reject) => {
            decompress(new Uint8Array(zipped), {consume:true}, (err, data) => {
                if (err) return reject(err)
                resolve(data)
            })
        })
        const data : {stateData:StateData[], textureData:TextureData[]} = this._unpackr.unpack(buffer)
        return this.loadIntoStore(data)
    }

    async exportCache(states?:StateHash[]) {
        const stateData = states ? 
            await this.store.states.bulkGet(states) as StateData[] : 
            await this.store.states.toArray()
        
        const textureData = await this.store.textures.bulkGet(
            stateData
                .map((v) => v.textureHash)
                .filter((v) => typeof v === 'string') as TextureHash[]
        ) as TextureData[]
        
        const data = {stateData, textureData}
        const buffer = this._packr.pack(data)

        return new Promise<Blob>((resolve, reject) => {
            compress(buffer, {consume:true}, (err, data) => {
                if (err) return reject(err)
                resolve(new Blob([data.buffer]))
            })
        })
    }

    // async importStore(url:string) {
    //     await this._zipReady
    //     const httpReader = new zip.HttpReader(url)
    //     await httpReader.init()
    //     const reader = new zip.ZipReader(httpReader)
    //     const entries = await reader.getEntries()
    //     const dataBlob : Blob = await entries[0].getData!(new zip.BlobWriter('application/zip'))
    //     reader.close()
    //     const buffer = new Uint8Array(await dataBlob.arrayBuffer())
    //     const data : {stateData:StateData[], textureData:TextureData[]} = this._unpackr.unpack(buffer)
    //     return Promise.all([
    //         this.store.states.bulkPut(data.stateData),
    //         this.store.textures.bulkPut(data.textureData)
    //     ])
    // }

    // async exportStore(states?:StateHash[]) {
    //     await this._zipReady
    //     const stateData = states ? 
    //         await this.store.states.bulkGet(states) as StateData[] : 
    //         await this.store.states.toArray()
    //     const textureData = await this.store.textures.bulkGet(
    //         stateData
    //             .map((v) => v.textureHash)
    //             .filter((v) => typeof v === 'string') as TextureHash[]
    //     ) as TextureData[]
        
    //     const data = {stateData, textureData}
        
    //     const buffer = this._packr.pack(data).buffer
    //     const blob = new Blob([buffer])

    //     const blobWriter = new zip.BlobWriter("application/zip")
    //     const writer = new zip.ZipWriter(blobWriter)

    //     await writer.add("ethereal.web.cache", new zip.BlobReader(blob), {onprogress: (progress,total) => {
    //         console.log('progress: ' + progress/total)
    //     }})
    //     await writer.close()

    //     const zippedBlob = blobWriter.getData()
    //     return zippedBlob
    // }

    async loadIntoStore(data:{stateData:StateData[], textureData:TextureData[]}) {
        return Promise.all([
            this.store.states.bulkPut(data.stateData),
            this.store.textures.bulkPut(data.textureData)
        ])
    }
    
    public store:LayerStore

    private _textureUrls = new Map<TextureHash, string>()
    private _unsavedTextureData = new Map<TextureHash, TextureData>()

    private _layerState = new Map<StateHash|HTMLMediaElement, LayerState>()

    serializeQueue = [] as {layer:WebLayer, resolve:(val:any)=>void, promise:any}[]
    rasterizeQueue = [] as {hash:StateHash, url:string, resolve:(val:any)=>void, promise:any}[]

    MINIMUM_RENDER_ATTEMPTS = 3
    canvasPool: HTMLCanvasElement[] = []
    imagePool: HTMLImageElement[] = []

    textEncoder = new TextEncoder();
    ktx2Encoder = new KTX2Encoder() as KTX2EncoderType

    useCreateImageBitmap = false

    getLayerState(hash:StateHash|HTMLMediaElement) {
        let data = this._layerState.get(hash)
        if (!data) {
            data = {
                bounds: new Bounds, 
                margin: new Edges, 
                padding: new Edges,
                border: new Edges,
                fullWidth:0, 
                fullHeight:0, 
                renderAttempts: 0,
                texture: {
                    hash: undefined,
                    url: undefined,
                    width:32, 
                    height:32,
                    pixelRatio:1
                },
                pseudo: {
                    hover: false,
                    active: false,
                    focus: false,
                    target: false
                }
            }
            this._layerState.set(hash, data)
        }
        if (data.texture.hash) {
            data.texture.url = this.getTextureURL(data.texture.hash)
        }
        return data
    }

    async requestLayerState(hash:StateHash|HTMLMediaElement) {
        const fullState = this.getLayerState(hash)
        if (typeof hash === 'string' && !fullState.texture.hash) {
            const state = await this.store.states.get(hash)
            fullState.texture.hash = state?.textureHash
        }
        return fullState
    }

    async updateTexture(textureHash:TextureHash, imageData:ImageData) {
        const ktx2Texture = await this.ktx2Encoder.encode(imageData as any)
        const textureData = this._unsavedTextureData.get(textureHash) || 
            {hash: textureHash, renderAttempts: 0, timestamp:Date.now(), texture:undefined}
        this._textureUrls.set(textureHash, URL.createObjectURL(new Blob([ktx2Texture], {type: 'image/ktx2'}))) 
        const data = await new Promise<Uint8Array>((resolve, reject) => {
            compress(new Uint8Array(ktx2Texture), {consume:true}, (err, data) => {
                if (err) return reject(err)
                resolve(data)
            })
        })
        textureData.texture = data
        this._unsavedTextureData.set(textureHash, textureData)
    }

    _texturesRequested = new Set<TextureHash>()

    async requestTextureData(textureHash:TextureHash) {
        if (!this._texturesRequested.has(textureHash)) {
            this._texturesRequested.add(textureHash)
            return new Promise(async (resolve) => {
                const textureData = await this.store.textures.get(textureHash)
                if (textureData?.texture && !this._unsavedTextureData.has(textureHash)) {
                    const data = await new Promise<Uint8Array>((resolve, reject) => {
                        decompress(textureData.texture!, {consume:true}, (err, data) => {
                            if (err) return reject(err)
                            resolve(data)
                        })
                    })
                    this._textureUrls.set(textureHash, URL.createObjectURL(new Blob([data.buffer], {type: 'image/ktx2'})))  
                    resolve(undefined)
                }
            })
        }
    }

    getTextureURL(textureHash:TextureHash) {
        this.requestTextureData(textureHash)
        return this._textureUrls.get(textureHash)
    }

    tasksPending = false
    serializePendingCount = 0
    rasterizePendingCount = 0

    MAX_SERIALIZE_TASK_COUNT = 10
    MAX_RASTERIZE_TASK_COUNT = 10
  
    scheduleTasksIfNeeded() {
      if (this.tasksPending ||
          (this.serializeQueue.length === 0 && this.rasterizeQueue.length === 0)) return
      this.tasksPending = true
      setTimeout(this._runTasks, 1)
    }

    private _runTasks = () => {
        const serializeQueue = this.serializeQueue
        const rasterizeQueue = this.rasterizeQueue

        // console.log("serialize task size", serializeQueue.length, serializeQueue)
        // console.log("rasterize task size", rasterizeQueue.length, rasterizeQueue)

        while (serializeQueue.length > 0 && this.serializePendingCount < this.MAX_RASTERIZE_TASK_COUNT) {
            this.serializePendingCount++
            const {layer, resolve} = serializeQueue.shift()!
            this.serialize(layer).then((val) => {
                this.serializePendingCount--
                resolve(val)
            })
        }

        while (rasterizeQueue.length > 0 && this.rasterizePendingCount < this.MAX_SERIALIZE_TASK_COUNT) {
            this.rasterizePendingCount++
            const {hash, url, resolve} = rasterizeQueue.shift()!
            this.rasterize(hash, url).finally(() => {
                this.rasterizePendingCount--
                resolve(undefined)
                if (this._autosaveTimer) clearTimeout(this._autosaveTimer)
                if (this.autosave) this._autosaveTimer = setTimeout(() => { this.saveStore() }, this.autosaveDelay)
            })
        }
        
        this.tasksPending = false
    }

    addToSerializeQueue(layer:WebLayer) : ReturnType<typeof WebLayerManagerBase.prototype.serialize>{
        const inQueue = this.serializeQueue.find((v) => v.layer === layer)
        if (inQueue) return inQueue.promise
        let resolve!:(v:any)=>any
        const promise = new Promise((r) => {resolve = r})
        this.serializeQueue.push({layer, resolve, promise})
        return promise as Promise<any>
    }

    async serialize(layer:WebLayer) {      
        const layerElement = layer.element as HTMLElement
        const metrics = layer.domMetrics
        
        getBounds(layerElement, metrics.bounds, layer.parentLayer?.element)
        getMargin(layerElement, metrics.margin)
        getPadding(layerElement, metrics.padding)
        getBorder(layerElement, metrics.border)

        const { top, left, width, height } = metrics.bounds
        const { top: marginTop, left: marginLeft, bottom: marginBottom, right: marginRight} = metrics.margin
        // add margins
        const fullWidth = width + Math.max(marginLeft, 0) + Math.max(marginRight, 0)
        const fullHeight = height + Math.max(marginTop, 0) + Math.max(marginBottom, 0)


        const pixelRatio =
            layer.pixelRatio ||
            parseFloat(layer.element.getAttribute(WebRenderer.PIXEL_RATIO_ATTRIBUTE)!) ||
            window.devicePixelRatio
        const textureWidth = Math.max(nextPowerOf2(fullWidth * pixelRatio), 32)
        const textureHeight = Math.max(nextPowerOf2(fullHeight * pixelRatio), 32)

        const result = {} as {stateKey: StateHash|HTMLMediaElement, svgUrl?:string, needsRasterize:boolean}
        let svgDoc!:string

        if (layer.isMediaElement) {
            result.stateKey = layerElement as HTMLMediaElement
        } else {

            // create svg markup
            const layerAttribute = WebRenderer.attributeHTML(WebRenderer.LAYER_ATTRIBUTE,'')
            const computedStyle = getComputedStyle(layerElement)
            const needsInlineBlock = computedStyle.display === 'inline'
            WebRenderer.updateInputAttributes(layerElement)
            
            const parentsHTML = getParentsHTML(layer, fullWidth, fullHeight, pixelRatio)
            const svgCSS = await WebRenderer.getAllEmbeddedStyles(layerElement)
            let layerHTML = await serializeToString(layerElement)
            layerHTML = layerHTML.replace(layerAttribute,
                `${layerAttribute} ${WebRenderer.RENDERING_ATTRIBUTE}="" ` +
                `${needsInlineBlock ? `${WebRenderer.RENDERING_INLINE_ATTRIBUTE}="" ` : ' '} ` +
                WebRenderer.getPsuedoAttributes(layer.desiredPseudoState))
            
            svgDoc =
                '<svg width="' +
                textureWidth +
                '" height="' +
                textureHeight +
                '" xmlns="http://www.w3.org/2000/svg"><defs><style type="text/css"><![CDATA[\n' +
                svgCSS.join('\n') +
                ']]></style></defs><foreignObject x="0" y="0" width="' +
                fullWidth*pixelRatio +
                '" height="' +
                fullHeight*pixelRatio +
                '">' +
                parentsHTML[0] +
                layerHTML +
                parentsHTML[1] +
                '</foreignObject></svg>'

            const stateHashBuffer = await crypto.subtle.digest('SHA-1', this.textEncoder.encode(svgDoc))
            const stateHash = bufferToHex(stateHashBuffer) +
                '?w=' + fullWidth +
                ';h=' + fullHeight + 
                ';tw=' + textureWidth +
                ';th=' + textureHeight

            result.stateKey = stateHash

        }
        
        // update the layer state data
        const data = await this.requestLayerState(result.stateKey)
        data.bounds.left = left
        data.bounds.top = top
        data.bounds.width = width
        data.bounds.height = height
        data.margin.left = marginLeft
        data.margin.top = marginTop
        data.margin.right = marginRight
        data.margin.bottom = marginBottom
        data.fullWidth = fullWidth
        data.fullHeight = fullHeight
        data.texture.width = textureWidth
        data.texture.height = textureHeight
        data.texture.pixelRatio = pixelRatio
        
        layer.desiredDOMStateKey = result.stateKey
        if (typeof result.stateKey === 'string') layer.allStateHashes.add(result.stateKey)

        result.needsRasterize = !layer.isMediaElement && fullWidth * fullHeight > 0 && !data.texture.hash
        result.svgUrl = (result.needsRasterize && svgDoc) ? 'data:image/svg+xml;utf8,' + encodeURIComponent(svgDoc) : undefined

        return result
    }

    async rasterize(stateHash:StateHash, svgUrl:SVGUrl) {
        const stateData = this.getLayerState(stateHash)
        const svgImage = this.imagePool.pop() || new Image()

        await new Promise<void>( (resolve, reject) => {

            svgImage.onload = () => {
                resolve()
            }
            
            svgImage.onerror = (error) => {
                reject(error)
            }

            svgImage.width = stateData.texture.width
            svgImage.height = stateData.texture.height
            svgImage.src = svgUrl

        })

        if (!svgImage.complete || svgImage.currentSrc !== svgUrl) {
            throw new Error('Rasterization Failed')
        }

        await svgImage.decode()

        const {fullWidth, fullHeight, texture} = stateData
        const {width : textureWidth, height : textureHeight, pixelRatio} = texture

        const sourceWidth = Math.floor(fullWidth*pixelRatio)
        const sourceHeight = Math.floor(fullHeight*pixelRatio)

        const hashData = await this.getImageData(svgImage, sourceWidth, sourceHeight, 30, 30)
        const textureHashBuffer = await crypto.subtle.digest('SHA-1', hashData.data)
        const textureHash = bufferToHex(textureHashBuffer) +
            '?w=' + textureWidth +
            ';h=' + textureHeight
        
        const previousCanvasHash = stateData.texture.hash
        stateData.texture.hash = textureHash
        
        if (previousCanvasHash !== textureHash) {
            stateData.renderAttempts = 0
        }

        stateData.renderAttempts++

        if (stateData.renderAttempts > this.MINIMUM_RENDER_ATTEMPTS && stateData.texture) {
            return
        }

        // in case the svg image wasn't finished loading, we should try again a few times
        setTimeout(() => this.addToRasterizeQueue(stateHash, svgUrl), (500 + Math.random() * 1000) * 2^stateData.renderAttempts)

        const textureUrl = this.getTextureURL(textureHash)
        if (textureUrl) return
    
        const imageData = await this.getImageData(svgImage, sourceWidth, sourceHeight, textureWidth, textureHeight)

        try{
            await this.updateTexture(textureHash, imageData)
        } finally {
            this.imagePool.push(svgImage)
        }
    }

    async getImageData(svgImage:HTMLImageElement, sourceWidth:number, sourceHeight:number, textureWidth:number, textureHeight:number) : Promise<ImageData> {
        const canvas = this.canvasPool.pop() || document.createElement('canvas')
        canvas.width = textureWidth
        canvas.height = textureHeight
        const ctx = canvas.getContext('2d')!
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.clearRect(0, 0, textureWidth, textureHeight)

        let imageData
        if (this.useCreateImageBitmap) {
            // this non-blocking api would be nice, but causes chrome to taint the canvas, 
            // and Safari treats the svg size strangely
            const imageBitmap = await createImageBitmap(svgImage, 0,0, sourceWidth * devicePixelRatio, sourceHeight * devicePixelRatio, {
                resizeWidth: textureWidth,
                resizeHeight: textureHeight,
                resizeQuality: 'high'
            })
            ctx.drawImage(imageBitmap, 0, 0, sourceWidth, sourceHeight, 0, 0, textureWidth, textureHeight)
        } else {
            ctx.drawImage(svgImage, 0, 0, sourceWidth, sourceHeight, 0, 0, textureWidth, textureHeight)
        }

        try {
            imageData = ctx.getImageData(0,0, textureWidth, textureHeight)
        } catch (err) {
            // canvas is tainted, don't reuse
            this.useCreateImageBitmap = false
            return this.getImageData(svgImage, sourceWidth, sourceHeight, textureWidth, textureHeight)
        }

        setTimeout(() => this.canvasPool.push(canvas), 10)
        
        return imageData
    }

    addToRasterizeQueue(hash:StateHash, url:string) : ReturnType<typeof WebLayerManagerBase.prototype.rasterize> {
        const inQueue = this.rasterizeQueue.find((v) => v.hash === hash)
        if (inQueue) return inQueue.promise
        let resolve!:(v:any)=>any
        const promise = new Promise((r) => {resolve = r})
        this.rasterizeQueue.push({hash, url, resolve, promise})
        return promise as Promise<void>
    }

}

