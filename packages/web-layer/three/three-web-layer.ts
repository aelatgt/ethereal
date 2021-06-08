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
  onLayerCreate?(layer: WebLayer3DContent): void
  onAfterRasterize?(layer: WebLayer3DContent): void,
  textureEncoding?: number,
  renderOrderOffset?: number
}

export {THREE}

type Intersection = THREE.Intersection & {groupOrder:number}

export type WebLayerHit = ReturnType<typeof WebLayer3D.prototype.hitTest> & {}

const scratchMatrix = new THREE.Matrix4
const scratchVector = new THREE.Vector3()
const scratchVector2 = new THREE.Vector3()
const scratchBounds = new Bounds()
const scratchBounds2 = new Bounds()

const ON_BEFORE_UPDATE = Symbol('ON_BEFORE_UPDATE')

export class WebLayer3DContent extends THREE.Object3D {

  public isRoot = false

  private _camera?:THREE.PerspectiveCamera

  constructor(public element: Element, public options: WebLayer3DOptions = {}) {
    super()
    this.name = element.id
    this._webLayer = WebRenderer.getClosestLayer(element)!

    this.add(this.contentMesh)
    this.add(this._boundsMesh)
    this.cursor.visible = false
    
    this.matrixAutoUpdate = true

    this.contentMesh.matrixAutoUpdate = true
    this.contentMesh.visible = false
    this.contentMesh['customDepthMaterial'] = this.depthMaterial
    this.contentMesh.onBeforeRender = (renderer, scene, camera) => {
      this._camera = camera as THREE.PerspectiveCamera
    }

    this._boundsMesh.matrixAutoUpdate = true

    WebLayer3D.layersByElement.set(this.element, this)
    WebLayer3D.layersByMesh.set(this.contentMesh, this)
  }

  protected _webLayer : WebLayer

  private _localZ = 0
  private _viewZ = 0
  private _renderZ = 0

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
        if (this.options.textureEncoding) t.encoding = this.options.textureEncoding
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
      if (this.options.textureEncoding) t.encoding = this.options.textureEncoding
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
      side: THREE.DoubleSide,
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

  /**
   * Allows correct shadow maps
   */
  depthMaterial = new THREE.MeshDepthMaterial({
    depthPacking: THREE.RGBADepthPacking,
    alphaTest: 0.001
  })

  domLayout = new THREE.Object3D()
  domSize = new THREE.Vector3(1,1,1)

  /**
   * Get the hover state
   */
  get pseudoStates() {
    return this._webLayer.pseudoStates
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

  get parentWebLayer(): WebLayer3DContent | undefined {
    return (
      this._webLayer.parentLayer &&
      WebLayer3D.layersByElement.get(this._webLayer.parentLayer.element)
    )
  }

  childWebLayers: WebLayer3DContent[] = []

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
  public refresh(recurse=false) {
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
    this.contentMesh.position.set(0,0,0)
    this.contentMesh.scale.copy(this.domSize)
    this.contentMesh.quaternion.set(0,0,0,1)
    this._boundsMesh.position.set(0,0,0)
    this._boundsMesh.scale.copy(this.domSize)
    this._boundsMesh.quaternion.set(0,0,0,1)
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
      material.depthWrite = false
      material.needsUpdate = true
      this.depthMaterial['map'] = texture
      this.depthMaterial.needsUpdate = true
    }
    material.transparent = true

    if (!this._camera) return

    this._localZ =
      scratchVector.setFromMatrixPosition(this.matrix).z + 
      scratchVector.setFromMatrixPosition(this.contentMesh.matrix).z
    this._viewZ = this.contentMesh.getWorldPosition(scratchVector).applyMatrix4(this._camera.matrixWorldInverse).z
    
    let parentRenderZ = this.parentWebLayer ? this.parentWebLayer._renderZ : this._viewZ
    
    if (Math.abs(this._localZ) < 1e-8) { // coplanar? use parent renderZ
      this._renderZ = parentRenderZ
    } else {
      this._renderZ = this._viewZ
    }

    this.contentMesh.renderOrder = (this.options.renderOrderOffset || 0) + 
      (1 - Math.log(this._renderZ + 1) / Math.log(this._camera.far + 1))+
      (this.depth + this.index * 0.001)*0.0000001
  }

  get rootWebLayer() {
    return WebLayer3D.layersByElement.get(this._webLayer.rootLayer.element)!
  }

  /** INTERNAL */
  private [ON_BEFORE_UPDATE]() {}

  protected _doUpdate() {
    this[ON_BEFORE_UPDATE]()
    this.updateLayout()
    this.updateContent()
    if (this.needsRefresh && this.options.autoRefresh !== false) 
      this.refresh()
    WebRenderer.scheduleTasksIfNeeded()
  }

  update(recurse=false) {
    if (recurse) this.traverseLayersPreOrder(this._doUpdate)
    else this._doUpdate()
  }

  querySelector(selector: string): WebLayer3DContent | undefined {
    const element = this.element.querySelector(selector)
    if (element) {
      return WebLayer3D.layersByElement.get(element)
    }
    return undefined
  }

  traverseLayerAncestors(
    each: (layer: WebLayer3DContent) => void
  ) {
    const parentLayer = this.parentWebLayer
    if (parentLayer) {
      parentLayer.traverseLayerAncestors(each)
      each.call(this, parentLayer)
    }
  }

  traverseLayersPreOrder(
    each: (layer: WebLayer3DContent) => boolean|void
  ) {
    if (each.call(this, this) === false) return false
    for (const child of this.childWebLayers) {
      if (child.traverseLayersPreOrder(each) === false) return false
    }
    return true
  }

  traverseLayersPostOrder(
    each: (layer: WebLayer3DContent) => boolean|void
  ) : boolean {
    for (const child of this.childWebLayers) {
      if (child.traverseLayersPostOrder(each) === false) return false
    }
    return each.call(this, this) || true
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
      this.parentWebLayer instanceof WebLayer3DContent
        ? this.parentWebLayer.bounds
        : getViewportBounds(scratchBounds)
    const parentWidth = parentBounds.width
    const parentHeight = parentBounds.height

    const leftEdge = -parentWidth / 2 + width / 2
    const topEdge = parentHeight / 2 - height / 2

    // const sep = this.options.layerSeparation || WebLayer3D.DEFAULT_LAYER_SEPARATION
    
    this.domLayout.position.set(
      pixelSize * (leftEdge + bounds.left),
      pixelSize * (topEdge - bounds.top),
      0
    )

    const computedStyle = getComputedStyle(this.element)
    const transform = computedStyle.transform
    if (transform && transform !== 'none') {
      const cssTransform = WebRenderer.parseCSSTransform(computedStyle, width, height, pixelSize, scratchMatrix)
      if (cssTransform) {
        this.domLayout.updateMatrix()
        this.domLayout.matrix.multiply(cssTransform)
        this.domLayout.matrix.decompose(this.domLayout.position, this.domLayout.quaternion, this.domLayout.scale)
      }
    }
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
export class WebLayer3D extends THREE.Object3D {

  static layersByElement = new WeakMap<Element, WebLayer3DContent>()
  static layersByMesh = new WeakMap<THREE.Mesh, WebLayer3DContent>()

  static DEFAULT_LAYER_SEPARATION = 0.001
  static DEFAULT_PIXELS_PER_UNIT = 1000
  static GEOMETRY = new THREE.PlaneGeometry(1, 1, 2, 2)

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
  
  static shouldApplyDOMLayout(layer: WebLayer3DContent) {
    const should = layer.shouldApplyDOMLayout
    if ((should as any) === 'always' || should === true) return true
    if ((should as any) === 'never' || should === false) return false
    if (should === 'auto' && layer.parentWebLayer && layer.parent === layer.parentWebLayer) return true
    return false
  }
  
  public rootLayer!:WebLayer3DContent

  private _interactionRays = [] as Array<THREE.Ray | THREE.Object3D>
  private _raycaster = new THREE.Raycaster()
  private _hitIntersections = [] as Intersection[]

  constructor(elementOrHTML: Element|string, public options: WebLayer3DOptions = {}) {
    super()

    const element = typeof elementOrHTML === 'string' ? DOM(elementOrHTML) : elementOrHTML

    WebRenderer.createLayerTree(element, (event, { target }) => {
      if (event === 'layercreated') {
        const layer = new WebLayer3DContent(target, this.options)
        if (target === element) {
          layer[ON_BEFORE_UPDATE] = () => this._updateInteractions()
          layer.isRoot = true
          this.rootLayer = layer
          this.add(layer)
        } else layer.parentWebLayer?.add(layer)
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
   * Run a query selector on the root layer
   * @param selector 
   */
  querySelector(selector:string) : WebLayer3DContent|undefined {
    return this.rootLayer.querySelector(selector)
  }

  /**
   * Refresh all layers, recursively
   */
  refresh() {
    this.rootLayer.refresh(true)
  }

  /**
   * Update all layers, recursively
   */
  update() {
    this.rootLayer.update(true)
  }

  /** Get the content mesh of the root layer */
  get contentMesh() {
    return this.rootLayer.contentMesh
  }

  private _previousHoverLayers = new Set<WebLayer3DContent>()
  private _contentMeshes = [] as THREE.Mesh[]

  private _prepareHitTest = (layer:WebLayer3DContent) => {
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
    const aLayer = a.object.parent as WebLayer3DContent
    const bLayer = b.object.parent as WebLayer3DContent
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
      if (ray instanceof THREE.Ray) this._raycaster.ray.copy(ray)
      else
        this._raycaster.ray.set(
          ray.getWorldPosition(scratchVector),
          ray.getWorldDirection(scratchVector2)
        )
      this._hitIntersections.length = 0
      const intersections = this._raycaster.intersectObjects(this._contentMeshes, false, this._hitIntersections) as Intersection[]
      // intersections.forEach(this._intersectionGetGroupOrder)
      intersections.sort(this._intersectionSort)
      const intersection = intersections[0]
      if (intersection) {
        const layer = intersection.object.parent as WebLayer3DContent
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

  static getLayerForQuery(selector: string): WebLayer3DContent | undefined {
    const element = document.querySelector(selector)!
    return WebLayer3D.layersByElement.get(element)
  }

  static getClosestLayerForElement(element: Element): WebLayer3DContent | undefined {
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

// class CameraFOVs {
//   top = 0
//   left = 0
//   bottom = 0
//   right = 0
//   horizontal = 0
//   vertical = 0
// }

// const _fovs = new CameraFOVs()
// const _getFovsMatrix = new THREE.Matrix4()
// const _getFovsVector = new THREE.Vector3()
// const FORWARD = new THREE.Vector3(0, 0, -1)
// function getFovs(projectionMatrix: THREE.Matrix4) {
//   const out = _fovs
//   const invProjection = _getFovsMatrix.getInverse(projectionMatrix) as THREE.Matrix4
//   const vec = _getFovsVector
//   out.left = vec
//     .set(-1, 0, -1)
//     .applyMatrix4(invProjection)
//     .angleTo(FORWARD)
//   out.right = vec
//     .set(1, 0, -1)
//     .applyMatrix4(invProjection)
//     .angleTo(FORWARD)
//   out.top = vec
//     .set(0, 1, -1)
//     .applyMatrix4(invProjection)
//     .angleTo(FORWARD)
//   out.bottom = vec
//     .set(0, -1, -1)
//     .applyMatrix4(invProjection)
//     .angleTo(FORWARD)
//   out.horizontal = out.right + out.left
//   out.vertical = out.top + out.bottom
//   return out
// }
