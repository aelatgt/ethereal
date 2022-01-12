import { Bounds } from '../core/dom-utils'
import { WebRenderer, WebLayerOptions } from '../core/WebRenderer'
import {getBounds, traverseChildElements, toDOM } from '../core/dom-utils'
import { ON_BEFORE_UPDATE, WebLayer3D } from './WebLayer3D'
import { WebLayerManager } from './WebLayerManager'


type Intersection = THREE.Intersection & {groupOrder:number}

export type WebLayerHit = ReturnType<typeof WebContainer3D.prototype.hitTest> & {}

const scratchVector = new THREE.Vector3()
const scratchVector2 = new THREE.Vector3()
const scratchBounds = new Bounds()
const scratchBounds2 = new Bounds()

export interface WebContainer3DOptions extends WebLayerOptions {
    manager: WebLayerManager
    pixelRatio?: number
    layerSeparation?: number
    autoRefresh?: boolean
    onLayerCreate?(layer: WebLayer3D): void
    onLayerPaint?(layer: WebLayer3D): void
    renderOrderOffset?: number
  }

/**
 * Transform a DOM tree into 3D layers.
 *
 * When an instance is created, a `xr-layer` is set on the
 * the passed DOM element to match this instance's Object3D id.
 * If the passed DOM element has an `id` attribute, this instance's Object3D name
 * will be set to match the element id.
 *
 * Child WebLayer3D instances can be specified with an `xr-layer` attribute,
 * which will be set when the child WebLayer3D instance is created automatically.
 * The attribute can be specified added in HTML or dynamically:
 *  - `<div xr-layer></div>`
 *
 * Additionally, the pixel ratio can be adjusted on each layer, individually:
 *  - `<div xr-layer xr-pixel-ratio="0.5"></div>`
 *
 * Default dimensions: 1px = 0.001 world dimensions = 1mm (assuming meters)
 *     e.g., 500px width means 0.5meters
 */
 export class WebContainer3D extends THREE.Object3D {
  
    // static computeNaturalDistance(
    //   projection: THREE.Matrix4 | THREE.Camera,
    //   renderer: THREE.WebGLRenderer
    // ) {
    //   let projectionMatrix = projection as  THREE.Matrix4
    //   if ((projection as THREE.Camera).isCamera) {
    //     projectionMatrix = (projection as THREE.Camera).projectionMatrix
    //   }
    //   const pixelRatio = renderer.getPixelRatio()
    //   const widthPixels = renderer.domElement.width / pixelRatio
    //   const width = WebLayer3D.DEFAULT_PIXELS_PER_UNIT * widthPixels
    //   const horizontalFOV = getFovs(projectionMatrix).horizontal
    //   const naturalDistance = width / 2 / Math.tan(horizontalFOV / 2)
    //   return naturalDistance
    // }

    public options!:WebContainer3DOptions

    public rootLayer!:WebLayer3D
  
    private _interactionRays = [] as Array<THREE.Ray | THREE.Object3D>
    private _raycaster = new THREE.Raycaster()
    private _hitIntersections = [] as Intersection[]
  
    constructor(elementOrHTML: Element|string, options: Partial<WebContainer3DOptions> = {}) {
      super()

      if (!options.manager) options.manager = WebLayerManager.instance
      this.options = options as WebContainer3DOptions

  
      const element = typeof elementOrHTML === 'string' ? toDOM(elementOrHTML) : elementOrHTML
  
      WebRenderer.createLayerTree(element, options, (event, { target }) => {
        if (event === 'layercreated') {
          const layer = new WebLayer3D(target, this.options)
          if (target === element) {
            layer[ON_BEFORE_UPDATE] = () => this._updateInteractions()
            this.rootLayer = layer
            this.add(layer)
          } else layer.parentWebLayer?.add(layer)
          this.options.onLayerCreate?.(layer)
        } else if (event === 'layerpainted') {
          const layer = WebRenderer.layers.get(target)!
          const layer3D = this.options.manager.layersByElement.get(layer.element)!
          this.options.onLayerPaint?.(layer3D)
        } else if (event === 'layermoved') {
          const layer = this.options.manager.layersByElement.get(target)!
          layer.parentWebLayer?.add(layer)
        }
      })
  
      this.refresh()
      this.update()
    }
  
    /**
     * A list of Rays to be used for interaction.
     * Can only be set on a root WebLayer3D instance.
     */
    get interactionRays() {
      return this._interactionRays
    }
    set interactionRays(rays: Array<THREE.Ray | THREE.Object3D>) {
      this._interactionRays = rays
    }
  
    /**
     * Update all layers, recursively
     */
     update() {
      this.rootLayer.update(true)
    }
  
    /**
     * Refresh all layers, recursively
     */
    refresh() {
      this.rootLayer.refresh(true)
    }
  
    /**
     * Run a query selector on the root layer
     * @param selector 
     * @deprecated
     */
     querySelector(selector:string) : WebLayer3D|undefined {
      return this.rootLayer.querySelector(selector)
    }
  
  
    /** Get the content mesh of the root layer 
     * @deprecated
    */
    get contentMesh() {
      return this.rootLayer.contentMesh
    }
  
    private _previousHoverLayers = new Set<WebLayer3D>()
    private _contentMeshes = [] as THREE.Mesh[]
  
    private _prepareHitTest = (layer:WebLayer3D) => {
      if (layer.pseudoStates.hover) this._previousHoverLayers.add(layer)
      layer.cursor.visible = false
      layer.pseudoStates.hover = false
      this._contentMeshes.push(layer.contentMesh)
    }
  
    // private _intersectionGetGroupOrder(i:Intersection) {
    //   let o = i.object as THREE.Group&THREE.Object3D
    //   while (o.parent && !o.isGroup) {
    //     o = o.parent as THREE.Group&THREE.Object3D
    //   }
    //   i.groupOrder = o.renderOrder
    // }
  
    private _intersectionSort(a:Intersection,b:Intersection) {
      const aLayer = a.object.parent as WebLayer3D
      const bLayer = b.object.parent as WebLayer3D
      if (aLayer.depth !== bLayer.depth) {
        return bLayer.depth - aLayer.depth
      }
      return bLayer.index - aLayer.index
    }
  
    private _updateInteractions() {
      // this.updateWorldMatrix(true, true)
      
      const prevHover = this._previousHoverLayers
      prevHover.clear()
      this._contentMeshes.length = 0
      this.rootLayer.traverseLayersPreOrder(this._prepareHitTest)
  
      for (const ray of this._interactionRays) {
        if ('isObject3D' in ray && ray.isObject3D) {
          this._raycaster.ray.set(
            ray.getWorldPosition(scratchVector),
            ray.getWorldDirection(scratchVector2).negate()
          ) 
        } else this._raycaster.ray.copy(ray as THREE.Ray)
        this._hitIntersections.length = 0
        const intersections = this._raycaster.intersectObjects(this._contentMeshes, false, this._hitIntersections) as Intersection[]
        // intersections.forEach(this._intersectionGetGroupOrder)
        intersections.sort(this._intersectionSort)
        const intersection = intersections[0]
        if (intersection) {
          const layer = intersection.object.parent as WebLayer3D
          layer.cursor.position.copy(intersection.point)
          layer.cursor.visible = true
          layer.pseudoStates.hover = true
          if (!prevHover.has(layer)) {
            layer.setNeedsRefresh()
          }
        }
      }
  
      for (const layer of prevHover) {
        if (!layer.pseudoStates.hover) {
          layer.setNeedsRefresh()
        }
      }
    }
  
    /**
     * Perform hit test with ray, or with -Z direction of an Object3D
     * @param ray 
     */
    hitTest(ray: THREE.Ray|THREE.Object3D) {
      const raycaster = this._raycaster
      const intersections = this._hitIntersections
      const meshMap = this.options.manager.layersByMesh
      if ('isObject3D' in ray && ray.isObject3D) { 
        this._raycaster.ray.set(
          ray.getWorldPosition(scratchVector),
          ray.getWorldDirection(scratchVector2).negate()
        )
      } else {
        this._raycaster.ray.copy(ray as THREE.Ray)
      }
      intersections.length = 0
      raycaster.intersectObject(this, true, intersections)
      // intersections.forEach(this._intersectionGetGroupOrder)
      intersections.sort(this._intersectionSort)
      for (const intersection of intersections) {
        const layer = meshMap!.get(intersection.object as any)
        if (!layer) continue
        const layerBoundingRect = getBounds(layer.element, scratchBounds)!
        if (!layerBoundingRect.width || !layerBoundingRect.height) continue
        let target = layer.element as HTMLElement
        const clientX = intersection.uv!.x * layerBoundingRect.width
        const clientY = (1 - intersection.uv!.y) * layerBoundingRect.height
        traverseChildElements(layer.element, el => {
          if (!target.contains(el)) return false
          const elementBoundingRect = getBounds(el, scratchBounds2)!
          const offsetLeft = elementBoundingRect.left - layerBoundingRect.left
          const offsetTop = elementBoundingRect.top - layerBoundingRect.top
          const { width, height } = elementBoundingRect
          const offsetRight = offsetLeft + width
          const offsetBottom = offsetTop + height
          if (
            clientX > offsetLeft &&
            clientX < offsetRight &&
            clientY > offsetTop &&
            clientY < offsetBottom
          ) {
            target = el as HTMLElement
            return true
          }
          return false // stop traversal down this path
        })
        return { layer, intersection, target }
      }
      return undefined
    }
  
  }
  