
import * as _THREE from 'three'
import type { CompressedTexture } from 'three'
import { BasisTextureLoader } from 'three/examples/jsm/loaders/BasisTextureLoader'
import { WebLayer3D } from './WebLayer3D'
import { WebRenderer } from '../core/WebRenderer'

if (self.THREE) {
var THREE = self.THREE
} else {
var THREE = _THREE
}

export {THREE}

export class WebLayerManager {

    static instance = new WebLayerManager

    textureEncoding = THREE.sRGBEncoding

    texturesByUrl = new Map<string, CompressedTexture>()
    layersUsingTexture = new WeakMap<CompressedTexture, Set<WebLayer3D>>()
    textureLoader = new BasisTextureLoader
    layersByElement = new WeakMap<Element, WebLayer3D>()
    layersByMesh = new WeakMap<THREE.Mesh, WebLayer3D>()
  
    pixelsPerUnit = 1000
  
    getTexture(url:string, layer?:WebLayer3D) {
      if (this.texturesByUrl.has(url)) {
        const texture = this.texturesByUrl.get(url)!
        if (layer) this.layersUsingTexture.get(texture)?.add(layer)
        return texture
      } 
      const texture = this.textureLoader.load(url, () => {}) as any as CompressedTexture
      this.texturesByUrl.set(url, texture)
      const layers = new Set<WebLayer3D>()
      if (layer) layers.add(layer)
      this.layersUsingTexture.set(texture, layers)
      texture.wrapS = THREE.ClampToEdgeWrapping
      texture.wrapT = THREE.ClampToEdgeWrapping
      texture.minFilter = THREE.LinearFilter
      texture.encoding = this.textureEncoding
      return texture
    }

    disposeLayer(layer:WebLayer3D) {
        for (const t of layer.textures) {
            const layers = this.layersUsingTexture.get(t)!
            layers.delete(layer)
            if (layers.size === 0) t.dispose()
        }
    }
}