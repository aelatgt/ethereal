import { Bounds, Edges, getBorder, getBounds, getMargin, getPadding } from "./dom-utils"
import Dexie, { Table, liveQuery, Subscription } from 'dexie'

// @ts-ignore
import { KTX2Encoder } from './textures/KTX2Encoder.bundle.js';
import type { KTX2Encoder as KTX2EncoderType } from './textures/KTX2Encoder'
import { WebRenderer } from "./WebRenderer";
import { WebLayer } from "./WebLayer";
import { serializeToString } from "./serialization-utils";
import { getParentsHTML } from "./serialization-utils";
import { bufferToHex } from "./hex-utils";

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

export interface TextureData {
    hash: TextureHash
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


function nearestPowerOf2(n:number) {
    return 1 << 31 - Math.clz32(n);
}

function nextPowerOf2(n:number) {
    return nearestPowerOf2((n-1)*2)
}

export class WebLayerManagerBase {

    WebRenderer = WebRenderer

    constructor(name = "web-layer-cache") {
        this._textureStore = new TextureStore(name)
    }
    
    private _textureStore:TextureStore
    private _textureUrls = new Map<TextureHash, string>()
    private _textureData = new Map<TextureHash, TextureData>()
    private _textureSubscriptions = new Map<TextureHash, Subscription>()

    private _layerState = new Map<StateHash, LayerState>()
    private _encoder = new KTX2Encoder() as KTX2EncoderType

    serializeQueue = [] as WebLayer[]
    rasterizeQueue = [] as Array<{hash:StateHash, url:string}>

    MINIMUM_RENDER_ATTEMPTS = 3
    canvasPool: HTMLCanvasElement[] = []
    imagePool: HTMLImageElement[] = []

    encoder = new TextEncoder();

    useCreateImageBitmap = false

    getLayerState(hash:StateHash) {
        let data = this._layerState.get(hash)
        if (!data) {
            data = {
                bounds: new Bounds, 
                margin: new Edges, 
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

    async updateTexture(textureHash:TextureHash, imageData:ImageData) {
        return new Promise(async (resolve) => {
            try {
                const ktx2Texture = await this._encoder.encode(imageData as any)
                const textureData = await this._textureStore.textures.get(textureHash) || 
                    {hash: textureHash, renderAttempts: 0, lastUsedTime:Date.now(), texture:undefined}
                textureData.texture = ktx2Texture
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

    tasksPending = false
    serializePendingCount = 0
    rasterizePendingCount = 0

    MAX_SERIALIZE_TASK_COUNT = 15
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

        console.log("serialize task size", serializeQueue.length)
        console.log("rasterize task size", rasterizeQueue.length)

        while (serializeQueue.length > 0 && this.serializePendingCount < this.MAX_RASTERIZE_TASK_COUNT) {
            this.serializePendingCount++
            this.serialize(serializeQueue.shift()!).finally(() => {
                this.serializePendingCount--
            })
        }

        rasterizeQueue.sort((a, b) => {
            const aState = this.getLayerState(a.hash)
            const bState = this.getLayerState(b.hash)
            const aSize = aState.fullWidth + aState.fullHeight + aState.fullWidth * aState.fullHeight
            const bSize = bState.fullWidth + bState.fullHeight + bState.fullWidth * bState.fullHeight
            return aSize - bSize
        })

        while (rasterizeQueue.length > 0 && this.rasterizePendingCount < this.MAX_SERIALIZE_TASK_COUNT) {
            this.rasterizePendingCount++
            const {hash, url} = rasterizeQueue.shift()!
            this.rasterize(hash, url).finally(() => {
                this.rasterizePendingCount--
            })
        }
        
        this.tasksPending = false
    }

    addToSerializeQueue(layer:WebLayer) {
        layer.currentDOMStateHash = undefined
        this.serializeQueue.push(layer)
    }

    async serialize(layer:WebLayer) {      
        const layerElement = layer.element as HTMLElement
        const metrics = layer.domMetrics
        
        getBounds(layerElement, metrics.bounds, layer.parentLayer?.element)
        getMargin(layerElement, metrics.margin)
        const { width, height } = metrics.bounds
        // add margins
        const fullWidth = width + Math.max(metrics.margin.left, 0) + Math.max(metrics.margin.right, 0)
        const fullHeight = height + Math.max(metrics.margin.top, 0) + Math.max(metrics.margin.bottom, 0)

        getPadding(layerElement, metrics.padding)
        getBorder(layerElement, metrics.border)

        const pixelRatio =
            layer.pixelRatio ||
            parseFloat(layer.element.getAttribute(WebRenderer.PIXEL_RATIO_ATTRIBUTE)!) ||
            window.devicePixelRatio

        // create svg markup
        const elementAttribute = WebRenderer.attributeHTML(WebRenderer.ELEMENT_UID_ATTRIBUTE,''+layer.id)
        const computedStyle = getComputedStyle(layerElement)
        const needsInlineBlock = computedStyle.display === 'inline'
        WebRenderer.updateInputAttributes(layerElement)
        
        const parentsHTML = getParentsHTML(layer, fullWidth, fullHeight, pixelRatio)
        const svgCSS = await WebRenderer.getAllEmbeddedStyles(layerElement)
        let layerHTML = await serializeToString(layerElement)
        
        layerHTML = layerHTML.replace(elementAttribute,
            `${elementAttribute} ${WebRenderer.RENDERING_ATTRIBUTE}="" ` +
            `${needsInlineBlock ? `${WebRenderer.RENDERING_INLINE_ATTRIBUTE}="" ` : ' '} ` +
            WebRenderer.getPsuedoAttributes(layer.desiredPseudoState))
            
        const textureWidth = Math.max(nextPowerOf2(fullWidth * pixelRatio), 32)
        const textureHeight = Math.max(nextPowerOf2(fullHeight * pixelRatio), 32)
        
        const docString =
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

        
        const svgUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(docString)

        const svgHashBuffer = await crypto.subtle.digest('SHA-1', this.encoder.encode(docString))
        const svgHash = bufferToHex(svgHashBuffer) +
            '?w=' + fullWidth +
            ';h=' + fullHeight + 
            ';tw=' + textureWidth +
            ';th=' + textureHeight
        
        layer.currentDOMStateHash = svgHash

        // update the layer state data
        // console.log('serialized ' + svgHash)
        const data = this.getLayerState(svgHash)
        data.bounds.copy(metrics.bounds)
        data.margin.copy(metrics.margin)
        data.fullWidth = fullWidth
        data.fullHeight = fullHeight
        data.texture.width = textureWidth
        data.texture.height = textureHeight
        data.texture.pixelRatio = pixelRatio
        // console.log(metrics.bounds)

        // @ts-ignore
        layer._svgUrl = svgUrl

        if (fullWidth * fullHeight > 0 && layer.element.nodeName !== "VIDEO") {
            // if we've already processed this exact layer state several times, we should 
            // be confident about what it looks like, and don't need to rerender
            if (data.renderAttempts >= this.MINIMUM_RENDER_ATTEMPTS && data.texture.hash) return
            // rasterize (and then render) the svg document 
            this.addToRasterizeQueue(svgHash, svgUrl)
        }
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

        const textureData = await this.requestTextureData(textureHash)

        if (textureData?.texture) return
    
        const imageData = await this.getImageData(svgImage, sourceWidth, sourceHeight, textureWidth, textureHeight)

        this.updateTexture(textureHash, imageData).then(() => {
            this.imagePool.push(svgImage)
        })
    }

    async getImageData(svgImage:HTMLImageElement, sourceWidth:number, sourceHeight:number, textureWidth:number, textureHeight:number) : Promise<ImageData> {
        const canvas = this.canvasPool.pop() || document.createElement('canvas')
        canvas.width = textureWidth
        canvas.height = textureHeight
        const ctx = canvas.getContext('2d')!
        ctx.imageSmoothingEnabled = false
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

    addToRasterizeQueue(hash:StateHash, url:string) {
        this.rasterizeQueue.push({hash, url})
    }

}

