import * as _THREE from 'three'

if (self.THREE) {
  var THREE = self.THREE
} else {
  var THREE = _THREE
}

import { WebLayer} from '../WebLayer'
import { WebRenderer } from '../WebRenderer'

import {Bounds, getBounds, getViewportBounds, traverseChildElements, DOM } from '../dom-utils'

export interface WebLayer3DOptions {
  pixelRatio?: number
  layerSeparation?: number
  autoRefresh?: boolean
  onLayerCreate?(layer: WebLayer3DBase): void
  onAfterRasterize?(layer: WebLayer3DBase): void
}

export {THREE}

type Intersection = THREE.Intersection & {groupOrder:number}

export type WebLayerHit = ReturnType<typeof WebLayer3D.prototype.hitTest> & {}

const scratchVector = new THREE.Vector3()
const scratchVector2 = new THREE.Vector3()
const scratchBounds = new Bounds()
const scratchBounds2 = new Bounds()

export class WebLayer3DBase extends THREE.Group {
  public element:Element
  constructor(elementOrHTML: Element|string, public options: WebLayer3DOptions = {}) {
    super()
    const element = this.element = typeof elementOrHTML === 'string' ? DOM(elementOrHTML) : elementOrHTML
    this.name = element.id
    this._webLayer = WebRenderer.getClosestLayer(element)!

    this.add(this.contentMesh)
    this.add(this._boundsMesh)
    this.cursor.visible = false
    
    this.matrixAutoUpdate = true

    this.contentMesh.matrixAutoUpdate = true
    this.contentMesh.visible = false
    this.contentMesh['customDepthMaterial'] = this.depthMaterial

    this._boundsMesh.matrixAutoUpdate = true

    WebLayer3D.layersByElement.set(this.element, this)
    WebLayer3D.layersByMesh.set(this.contentMesh, this)
  }

  protected _webLayer : WebLayer

  textures = new Map<HTMLCanvasElement | HTMLVideoElement, THREE.Texture>()

  get currentTexture() {
    if (this._webLayer.element.tagName === 'VIDEO') {
      const video = this._webLayer.element as HTMLVideoElement
      let t = this.textures.get(video)
      if (!t) {
        t = new THREE.VideoTexture(video)
        t.wrapS = THREE.ClampToEdgeWrapping
        t.wrapT = THREE.ClampToEdgeWrapping
        t.minFilter = THREE.LinearFilter
        this.textures.set(video, t)
      }
      return t
    }

    const canvas = this._webLayer.canvas
    let t = this.textures.get(canvas)
    if (!t) {
      t = new THREE.Texture(canvas)
      t.needsUpdate = true
      t.wrapS = THREE.ClampToEdgeWrapping
      t.wrapT = THREE.ClampToEdgeWrapping
      t.minFilter = THREE.LinearFilter
      this.textures.set(canvas, t)
    } else if (this.textureNeedsUpdate) {
      this.textureNeedsUpdate = false
      t.needsUpdate = true
    }
    return t
  }

  textureNeedsUpdate = false

  // content = new Object3D()
  contentMesh = new THREE.Mesh(
    WebLayer3D.GEOMETRY,
    new THREE.MeshBasicMaterial({
      transparent: true,
      alphaTest: 0.001,
      opacity: 1
    })
  )

  /**
   * This non-visible mesh ensures that an adapted layer retains
   * its innerBounds, even if the content mesh is
   * independently adapted.
   */
  private _boundsMesh = new THREE.Mesh(
    WebLayer3D.GEOMETRY,
    new THREE.MeshBasicMaterial({
      visible: false
    })
  )

  cursor = new THREE.Object3D()

  depthMaterial = new THREE.MeshDepthMaterial({
    depthPacking: THREE.RGBADepthPacking,
    alphaTest: 0.01
  })

  domLayout = new THREE.Object3D()
  domSize = new THREE.Vector3(1,1,1)

  /**
   * Get the hover state
   */
  get pseudoStates() {
    return this._webLayer.psuedoStates
  }

  /**
   * Get the layer depth (distance from this layer's element and the parent layer's element)
   */
  get depth() {
    return this._webLayer.depth
  }

  /**
   *
   */
  get index() {
    return this.parentWebLayer ? this.parentWebLayer.childWebLayers.indexOf(this) : 0
  }

  get needsRefresh() {
    return this._webLayer.needsRefresh
  }

  setNeedsRefresh() {
    this._webLayer.traverseLayers(WebRenderer.setLayerNeedsRefresh)
  }

  /** If true, this layer needs to be removed from the scene */
  get needsRemoval() {
    return this._webLayer.needsRemoval
  }

  get bounds() {
    return this._webLayer.bounds
  }

  get parentWebLayer(): WebLayer3DBase | undefined {
    return (
      this._webLayer.parentLayer &&
      WebLayer3D.layersByElement.get(this._webLayer.parentLayer.element)
    )
  }

  childWebLayers: WebLayer3DBase[] = []

  /**
   * Specifies whether or not the DOM layout should be applied.
   *
   * When set to `true`, the dom layout should always be applied.
   * When set to `false`, the dom layout should never be applied.
   * When set to `'auto'`, the dom layout should only be applied
   * when the `parentLayer` is the same as the `parent` object.
   *
   * It is the responsibiltiy of the update callback
   * to follow these rules.
   *
   * Defaults to `auto`
   */
  shouldApplyDOMLayout: true | false | 'auto' = 'auto'

  /**
   * Refresh from DOM
   */
  protected refresh(recurse=false) {
    this._webLayer.refresh()
    this.childWebLayers.length = 0
    for (const c of this._webLayer.childLayers) {
      const child = WebLayer3D.getClosestLayerForElement(c.element)
      if (!child) continue
      this.childWebLayers.push(child)
      if (recurse) child.refresh(recurse)
    }
    this._refreshVideoBounds()
    this._refreshDOMLayout()
  }

  private updateLayout() {
    this.position.copy(this.domLayout.position)
    this.quaternion.copy(this.domLayout.quaternion)
    this.scale.copy(this.domLayout.scale)
    // this.contentMesh.position.set(0,0,0)
    this.contentMesh.scale.copy(this.domSize)
    // this._boundsMesh.position.set(0,0,0)
    this._boundsMesh.scale.copy(this.domSize)
    // handle layer visibiltiy or removal
    const mesh = this.contentMesh
    const mat = mesh.material as THREE.MeshBasicMaterial
    const isHidden = mat.opacity < 0.005
    if (isHidden) mesh.visible = false
    else if (mesh.material.map) mesh.visible = true
    if (this.needsRemoval && isHidden) {
      if (this.parent) this.parent.remove(this)
      this.dispose()
    }
  }

  private updateContent() {
    const mesh = this.contentMesh
    const texture = this.currentTexture
    const material = mesh.material as THREE.MeshBasicMaterial
    if (texture.image && material.map !== texture) {
      material.map = texture
      this.depthMaterial['map'] = texture
      this.depthMaterial.needsUpdate = true
      material.depthWrite = false
      this.renderOrder = this.depth + this.index * 0.001
      material.needsUpdate = true
    }
  }

  protected _doUpdate() {
    this.updateLayout()
    this.updateContent()
    if (this.needsRefresh && this.options.autoRefresh) 
      this.refresh()
    WebRenderer.scheduleTasksIfNeeded()
  }

  update(recurse=false) {
    if (recurse) this.traverseLayersPreOrder(this._doUpdate)
    else this._doUpdate()
  }

  querySelector(selector: string): WebLayer3DBase | undefined {
    const element = this.element.querySelector(selector)
    if (element) {
      return WebLayer3D.layersByElement.get(element)
    }
    return undefined
  }

  traverseLayerAncestors(
    each: (layer: WebLayer3DBase) => void
  ) {
    const parentLayer = this.parentWebLayer
    if (parentLayer) {
      parentLayer.traverseLayerAncestors(each)
      each(parentLayer)
    }
  }

  traverseLayersPreOrder(
    each: (layer: WebLayer3DBase) => boolean|void
  ) {
    if (each(this) === false) return false
    for (const child of this.childWebLayers) {
      if (child.traverseLayersPreOrder(each) === false) return false
    }
    return true
  }

  traverseLayersPostOrder(
    each: (layer: WebLayer3DBase) => boolean|void
  ) : boolean {
    for (const child of this.childWebLayers) {
      if (child.traverseLayersPostOrder(each) === false) return false
    }
    return each(this) || true
  }

  dispose() {
    for (const t of this.textures.values()) {
      t.dispose()
    }
    this.contentMesh.geometry.dispose()
    this._boundsMesh.geometry.dispose()
    WebRenderer.disposeLayer(this._webLayer)
    for (const child of this.childWebLayers) child.dispose()
  }

  private _refreshVideoBounds() {
    if (this.element.nodeName === 'VIDEO') {
      const video = this.element as HTMLVideoElement
      const texture = this.currentTexture
      const computedStyle = getComputedStyle(this.element)
      const { objectFit } = computedStyle
      const { width: viewWidth, height: viewHeight } = this.bounds
      const { videoWidth, videoHeight } = video
      const videoRatio = videoWidth / videoHeight
      const viewRatio = viewWidth / viewHeight
      texture.center.set(0.5, 0.5)
      switch (objectFit) {
        case 'none':
          texture.repeat.set(viewWidth / videoWidth, viewHeight / videoHeight).clampScalar(0, 1)
          break
        case 'contain':
        case 'scale-down':
          texture.repeat.set(1, 1)
          if (viewRatio > videoRatio) {
            const width = this.bounds.height * videoRatio || 0
            this.bounds.left += (this.bounds.width - width) / 2
            this.bounds.width = width
          } else {
            const height = this.bounds.width / videoRatio || 0
            this.bounds.top += (this.bounds.height - height) / 2
            this.bounds.height = height
          }
          break
        case 'cover':
          texture.repeat.set(viewWidth / videoWidth, viewHeight / videoHeight)
          if (viewRatio < videoRatio) {
            const width = this.bounds.height * videoRatio || 0
            this.bounds.left += (this.bounds.width - width) / 2
            this.bounds.width = width
          } else {
            const height = this.bounds.width / videoRatio || 0
            this.bounds.top += (this.bounds.height - height) / 2
            this.bounds.height = height
          }
          break
        default:
        case 'fill':
          texture.repeat.set(1, 1)
          break
      }
    }
  }

  private _refreshDOMLayout() {

    if (this.needsRemoval) {
      return
    }

    this.domLayout.position.set(0,0,0)
    this.domLayout.scale.set(1, 1, 1)
    this.domLayout.quaternion.set(0, 0, 0, 1)

    const bounds = this.bounds
    const width = bounds.width
    const height = bounds.height
    const pixelSize = 1 / WebLayer3D.DEFAULT_PIXELS_PER_UNIT

    this.domSize.set(
      Math.max(pixelSize * width, 10e-6),
      Math.max(pixelSize * height, 10e-6),
      1
    )

    if (!WebLayer3D.shouldApplyDOMLayout(this)) return

    const parentBounds =
      this.parentWebLayer instanceof WebLayer3DBase
        ? this.parentWebLayer.bounds
        : getViewportBounds(scratchBounds)
    const parentWidth = parentBounds.width
    const parentHeight = parentBounds.height

    const leftEdge = -parentWidth / 2 + width / 2
    const topEdge = parentHeight / 2 - height / 2

    const sep = this.options.layerSeparation || WebLayer3D.DEFAULT_LAYER_SEPARATION
    
    this.domLayout.position.set(
      pixelSize * (leftEdge + bounds.left),
      pixelSize * (topEdge - bounds.top),
      0
      // this.depth * sep +
      //   (this.parentWebLayer ? this.parentWebLayer.index * sep * 0.01 : 0) +
      //   this.index * sep * 0.001
    )
  }
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
export class WebLayer3D extends WebLayer3DBase {

  static layersByElement = new WeakMap<Element, WebLayer3DBase>()
  static layersByMesh = new WeakMap<THREE.Mesh, WebLayer3DBase>()

  static DEFAULT_LAYER_SEPARATION = 0.001
  static DEFAULT_PIXELS_PER_UNIT = 1000
  static GEOMETRY = new THREE.PlaneGeometry(1, 1, 2, 2) as THREE.Geometry

  static computeNaturalDistance(
    projection: THREE.Matrix4 | THREE.Camera,
    renderer: THREE.WebGLRenderer
  ) {
    let projectionMatrix = projection as  THREE.Matrix4
    if ((projection as THREE.Camera).isCamera) {
      projectionMatrix = (projection as THREE.Camera).projectionMatrix
    }
    const pixelRatio = renderer.getPixelRatio()
    const widthPixels = renderer.domElement.width / pixelRatio
    const width = WebLayer3D.DEFAULT_PIXELS_PER_UNIT * widthPixels
    const horizontalFOV = getFovs(projectionMatrix).horizontal
    const naturalDistance = width / 2 / Math.tan(horizontalFOV / 2)
    return naturalDistance
  }
  
  static shouldApplyDOMLayout(layer: WebLayer3DBase) {
    const should = layer.shouldApplyDOMLayout
    if ((should as any) === 'always' || should === true) return true
    if ((should as any) === 'never' || should === false) return false
    if (should === 'auto' && layer.parentWebLayer && layer.parent === layer.parentWebLayer) return true
    return false
  }

  get parentWebLayer() {
    return super.parentWebLayer!
  }

  private _interactionRays = [] as Array<THREE.Ray | THREE.Object3D>
  private _raycaster = new THREE.Raycaster()
  private _hitIntersections = [] as Intersection[]

  constructor(elementOrHTML: Element|string, public options: WebLayer3DOptions = {}) {
    super(elementOrHTML, options)

    this._webLayer = WebRenderer.createLayerTree(this.element, (event, { target }) => {
      if (event === 'layercreated') {
        if (target === this.element) return
        const layer = new WebLayer3DBase(target, this.options)
        layer.parentWebLayer?.add(layer)
        if (this.options.onLayerCreate) this.options.onLayerCreate(layer)
      } else if (event === 'layerpainted') {
        const layer = WebRenderer.layers.get(target)!
        const layer3D = WebLayer3D.layersByElement.get(layer.element)!
        layer3D.textureNeedsUpdate = true
      } else if (event === 'layermoved') {
        const layer = WebLayer3D.layersByElement.get(target)!
        layer.parentWebLayer?.add(layer)
      }
    })
    if (this.options.onLayerCreate) this.options.onLayerCreate(this)

    this.refresh(true)
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
   * Update this layer, optionally recursively
   */
  update(recurse=false) {
    this._updateInteractions()
    super.update(recurse)
  }

  private _previousHoverLayers = new Set<WebLayer3DBase>()
  private _contentMeshes = [] as THREE.Mesh[]

  private _prepareHitTest = (layer:WebLayer3DBase) => {
    if (layer.pseudoStates.hover) this._previousHoverLayers.add(layer)
    layer.cursor.visible = false
    layer.pseudoStates.hover = false
    this._contentMeshes.push(layer.contentMesh)
  }

  private _intersectionGetGroupOrder(i:Intersection) {
    let o = i.object as THREE.Group&THREE.Object3D
    while (o.parent && !o.isGroup) {
      o = o.parent as THREE.Group&THREE.Object3D
    }
    i.groupOrder = o.renderOrder
  }

  private _intersectionSort(a:Intersection,b:Intersection) {
    if ( a.groupOrder !== b.groupOrder ) {
		  return b.groupOrder - a.groupOrder
	  } else if ( a.object.renderOrder !== b.object.renderOrder ) {
      return b.object.renderOrder - a.object.renderOrder
    } else {
      return a.distance - b.distance
    }
  }

  private _updateInteractions() {
    // this.updateWorldMatrix(true, true)
    
    const prevHover = this._previousHoverLayers
    prevHover.clear()
    this._contentMeshes.length = 0
    this.traverseLayersPreOrder(this._prepareHitTest)

    for (const ray of this._interactionRays) {
      if (ray instanceof THREE.Ray) this._raycaster.ray.copy(ray)
      else
        this._raycaster.ray.set(
          ray.getWorldPosition(scratchVector),
          ray.getWorldDirection(scratchVector2)
        )
      this._hitIntersections.length = 0
      const intersections = this._raycaster.intersectObjects(this._contentMeshes, false, this._hitIntersections) as Intersection[]
      intersections.forEach(this._intersectionGetGroupOrder)
      intersections.sort(this._intersectionSort)
      const intersection = intersections[0]
      if (intersection) {
        const layer = intersection.object.parent as WebLayer3DBase
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

  static getLayerForQuery(selector: string): WebLayer3DBase | undefined {
    const element = document.querySelector(selector)!
    return WebLayer3D.layersByElement.get(element)
  }

  static getClosestLayerForElement(element: Element): WebLayer3DBase | undefined {
    const closestLayerElement =
      element && (element.closest(`[${WebRenderer.LAYER_ATTRIBUTE}]`) as HTMLElement)
    return WebLayer3D.layersByElement.get(closestLayerElement)
  }

  hitTest(ray: THREE.Ray) {
    const raycaster = this._raycaster
    const intersections = this._hitIntersections
    const meshMap = WebLayer3D.layersByMesh
    raycaster.ray.copy(ray)
    intersections.length = 0
    raycaster.intersectObject(this, true, intersections)
    intersections.forEach(this._intersectionGetGroupOrder)
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

class CameraFOVs {
  top = 0
  left = 0
  bottom = 0
  right = 0
  horizontal = 0
  vertical = 0
}

const _fovs = new CameraFOVs()
const _getFovsMatrix = new THREE.Matrix4()
const _getFovsVector = new THREE.Vector3()
const FORWARD = new THREE.Vector3(0, 0, -1)
function getFovs(projectionMatrix: THREE.Matrix4) {
  const out = _fovs
  const invProjection = _getFovsMatrix.getInverse(projectionMatrix)
  const vec = _getFovsVector
  out.left = vec
    .set(-1, 0, -1)
    .applyMatrix4(invProjection)
    .angleTo(FORWARD)
  out.right = vec
    .set(1, 0, -1)
    .applyMatrix4(invProjection)
    .angleTo(FORWARD)
  out.top = vec
    .set(0, 1, -1)
    .applyMatrix4(invProjection)
    .angleTo(FORWARD)
  out.bottom = vec
    .set(0, -1, -1)
    .applyMatrix4(invProjection)
    .angleTo(FORWARD)
  out.horizontal = out.right + out.left
  out.vertical = out.top + out.bottom
  return out
}
