
import { ClampToEdgeWrapping, CompressedTexture, LinearFilter, sRGBEncoding } from 'three'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader'
import { WebLayer3D } from './WebLayer3D'
import { WebLayerManagerBase } from '../core/WebLayerManagerBase'
export class WebLayerManager extends WebLayerManagerBase {

    static DEFAULT_TRANSCODER_PATH = `https://unpkg.com/@loaders.gl/textures@3.1.7/dist/libs/`

    static initialize(renderer:THREE.WebGLRenderer) {
      WebLayerManager.instance = new WebLayerManager()
      WebLayerManager.instance.renderer = renderer
      WebLayerManager.instance.textureLoader.detectSupport(renderer)
    }

    static instance:WebLayerManager

    constructor() {
      super()
      this.textureLoader.setTranscoderPath(WebLayerManager.DEFAULT_TRANSCODER_PATH)
    }

    renderer!:THREE.WebGLRenderer

    textureEncoding = sRGBEncoding

    texturesByUrl = new Map<string, CompressedTexture|'pending'|'error'>()
    layersUsingTexture = new WeakMap<CompressedTexture, Set<WebLayer3D>>()
    textureLoader = new KTX2Loader
    layersByElement = new WeakMap<Element, WebLayer3D>()
    layersByMesh = new WeakMap<THREE.Mesh, WebLayer3D>()
  
    pixelsPerUnit = 1000
  
    getTexture(url:string, layer?:WebLayer3D) {

      let texture = this.texturesByUrl.get(url)!  
      const isNotLoaded = typeof texture === 'string'

      if (isNotLoaded) return undefined

      if (texture) {
        if (layer) this.layersUsingTexture.get(texture as CompressedTexture)?.add(layer)
        return texture as CompressedTexture
      }

      this.textureLoader.loadAsync(url).then((t) => {
        t.wrapS = ClampToEdgeWrapping
        t.wrapT = ClampToEdgeWrapping
        t.minFilter = LinearFilter
        t.encoding = this.textureEncoding
        this.layersUsingTexture.set(t, new Set<WebLayer3D>())
        this.texturesByUrl.set(url, t)
      }).catch(() => {
        this.texturesByUrl.set(url, 'error')
      })

      this.texturesByUrl.set(url, 'pending')

      return texture
    }

    requestTexture(url:string, layer?:WebLayer3D) {
      
    }

    disposeLayer(layer:WebLayer3D) {
        for (const t of layer.textures) {
            const layers = this.layersUsingTexture.get(t)!
            layers.delete(layer)
            if (layers.size === 0) t.dispose()
        }
    }
}