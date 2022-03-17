
import { CanvasTexture, ClampToEdgeWrapping, CompressedTexture, LinearFilter, sRGBEncoding, Texture, VideoTexture } from 'three'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader'
import { WebLayer3D } from './WebLayer3D'
import { TextureData, TextureHash, WebLayerManagerBase } from '../core/WebLayerManagerBase'
export interface  ThreeTextureData {
  canvasTexture?: CanvasTexture
  compressedTexture?: CompressedTexture
}
export class WebLayerManager extends WebLayerManagerBase {

    static DEFAULT_TRANSCODER_PATH = `https://unpkg.com/@loaders.gl/textures@3.1.7/dist/libs/`

    static initialize(renderer:THREE.WebGLRenderer) {
      WebLayerManager.instance = new WebLayerManager()
      WebLayerManager.instance.renderer = renderer
      WebLayerManager.instance.ktx2Loader.detectSupport(renderer)
    }

    static instance:WebLayerManager

    constructor() {
      super()
      this.ktx2Loader.setTranscoderPath(WebLayerManager.DEFAULT_TRANSCODER_PATH)
    }

    renderer!:THREE.WebGLRenderer
    textureEncoding = sRGBEncoding
    ktx2Loader = new KTX2Loader

    texturesByHash = new Map<string, ThreeTextureData>()
    layersByElement = new WeakMap<Element, WebLayer3D>()
    layersByMesh = new WeakMap<THREE.Mesh, WebLayer3D>()
  
    getTexture(textureHash:TextureHash) {
      const textureData = this.getTextureState(textureHash)
      if (!this.texturesByHash.has(textureHash)) {
        this.texturesByHash.set(textureHash, {})
      }
      this._loadCompressedTextureIfNecessary(textureData)
      this._loadCanvasTextureIfNecessary(textureData)
      return this.texturesByHash.get(textureHash)!
    }

    _compressedTexturePromise = new Map<string, (value?:any)=>void>()

    private _loadCompressedTextureIfNecessary(textureData:TextureData) {
      const ktx2Url = textureData.ktx2Url
      if (!ktx2Url) return
      if (!this._compressedTexturePromise.has(textureData.hash)) {
        new Promise((resolve) => {
          this._compressedTexturePromise.set(textureData.hash, resolve)
          this.ktx2Loader.loadAsync(ktx2Url).then((t) => {
            t.wrapS = ClampToEdgeWrapping
            t.wrapT = ClampToEdgeWrapping
            t.minFilter = LinearFilter
            t.encoding = this.textureEncoding
            this.texturesByHash.get(textureData.hash)!.compressedTexture = t
          }).finally(()=>{
            resolve(undefined)
          })
        })
      }
    }

    _canvasTexturePromise = new Map<string, (value?:any)=>void>()

    private _loadCanvasTextureIfNecessary(textureData:TextureData) {
      const threeTextureData = this.texturesByHash.get(textureData.hash)!
      if (threeTextureData.compressedTexture) {
        threeTextureData.canvasTexture?.dispose()
        threeTextureData.canvasTexture = undefined
        return
      }
      const canvas = textureData.canvas
      if (!canvas) return
      if (!threeTextureData.canvasTexture && !threeTextureData.compressedTexture) {
        const t = new CanvasTexture(canvas)
        t.wrapS = ClampToEdgeWrapping
        t.wrapT = ClampToEdgeWrapping
        t.minFilter = LinearFilter
        t.encoding = this.textureEncoding
        t.flipY = false
        threeTextureData.canvasTexture = t
      }
    }
}