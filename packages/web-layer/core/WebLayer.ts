import {WebRenderer} from './WebRenderer'
import {
  traverseChildElements,
  Bounds,
  Edges
} from './dom-utils'

import { WebLayerManagerBase } from './WebLayerManagerBase'

export type EventCallback = (
  event:
    | 'layerpainted'
    | 'layercreated'
    | 'layermoved',
  data: { target: Element }
) => void
export class WebLayer {

  isMediaElement = false
  isVideoElement = false

  constructor(public manager:WebLayerManagerBase, public element: Element, public eventCallback: EventCallback) {
    if (!manager) throw new Error("WebLayerManager must be initialized")
    WebRenderer.layers.set(element, this)
    element.setAttribute(WebRenderer.LAYER_ATTRIBUTE,'')
    this.parentLayer = WebRenderer.getClosestLayer(this.element, false)
    this.eventCallback('layercreated', { target: element })
    this.isVideoElement = element.nodeName === 'VIDEO'
    this.isMediaElement = this.isVideoElement || element.nodeName === 'IMAGE' || element.nodeName === 'CANVAS'
  }
  
  desiredPseudoState = {
    hover: false,
    active: false,
    focus: false,
    target: false
  }

  needsRefresh = true

  setNeedsRefresh(recurse=false) {
    this.needsRefresh = true
    if (recurse) for (const c of this.childLayers) c.setNeedsRefresh(recurse)
  }
  
  needsRemoval = false
  
  parentLayer?: WebLayer
  childLayers = [] as WebLayer[]
  pixelRatio?: number

  previousDOMStateKey?: string|HTMLMediaElement

  desiredDOMStateKey?: string|HTMLMediaElement
  currentDOMStatekey?: string|HTMLMediaElement

  get previousDOMState() {
    return this.previousDOMStateKey ? this.manager.getLayerState(this.previousDOMStateKey) : undefined
  }

  get desiredDOMState() {
    return this.desiredDOMStateKey ? this.manager.getLayerState(this.desiredDOMStateKey) : undefined
  }

  get currentDOMState() {
    return this.currentDOMStatekey ? this.manager.getLayerState(this.currentDOMStatekey) : undefined
  }

  domMetrics = {
    bounds: new Bounds(),
    padding: new Edges(),
    margin: new Edges(),
    border: new Edges()
  }

  get depth() {
    let depth = 0
    let layer = this as WebLayer
    while (layer.parentLayer) {
      layer = layer.parentLayer
      depth++
    }
    return depth
  }

  get rootLayer() {
    let rootLayer = this as WebLayer
    while (rootLayer.parentLayer) rootLayer = rootLayer.parentLayer
    return rootLayer
  }

  traverseParentLayers(
    each: (layer: WebLayer) => void
  ) {
    const parentLayer = this.parentLayer
    if (parentLayer) {
      parentLayer.traverseParentLayers(each)
      each(parentLayer)
    }
  }

  traverseLayers(each: (layer: WebLayer) => void) {
    each(this)
    this.traverseChildLayers(each)
  }

  traverseChildLayers(
    each: (layer: WebLayer) => void
  ) {
    for (const child of this.childLayers) {
      child.traverseLayers(each)
    }
  }

  update() {
    if (this.desiredDOMStateKey !== this.currentDOMStatekey) {
      const desired = this.desiredDOMState
      if (desired && (this.isMediaElement || desired.texture.url || desired.fullWidth * desired.fullHeight === 0)) {
        this.currentDOMStatekey = this.desiredDOMStateKey
      }
    }
    const prev = this.previousDOMState
    const current = this.currentDOMState
    if (prev?.texture.url !== current?.texture.url) {
      this.eventCallback('layerpainted', { target: this.element })
    }
    this.previousDOMStateKey = this.currentDOMStatekey
  }

  async refresh() {
    this.currentDOMStatekey = undefined
    this.needsRefresh = false
    this._updateParentAndChildLayers()
    
    const result = await this.manager.addToSerializeQueue(this)
    if (result.needsRasterize && typeof result.stateKey === 'string') 
      await this.manager.addToRasterizeQueue(result.stateKey, result.svgUrl)
  }

  private _updateParentAndChildLayers() {
    const element = this.element
    const childLayers = this.childLayers
    const oldChildLayers = childLayers.slice()

    const previousParentLayer = this.parentLayer
    this.parentLayer = WebRenderer.getClosestLayer(this.element, false)
    if (previousParentLayer !== this.parentLayer) {
      this.parentLayer && this.parentLayer.childLayers.push(this)
      this.eventCallback('layermoved', { target: element })
    }

    childLayers.length = 0
    traverseChildElements(element, this._tryConvertElementToWebLayer, this)

    for (const child of oldChildLayers) {
      const parentLayer = WebRenderer.getClosestLayer(child.element, false)
      if (!parentLayer) {
        child.needsRemoval = true
        childLayers.push(child)
      }
    }
  }

  private _tryConvertElementToWebLayer(n: Node) {
    if (this.needsRemoval) return false
    const el = n as HTMLElement
    const styles = getComputedStyle(el)
    const isLayer = el.hasAttribute(WebRenderer.LAYER_ATTRIBUTE)
    if (isLayer || el.nodeName === 'VIDEO' || styles.transform !== 'none') {
      let child = WebRenderer.layers.get(el)
      if (!child) {
        child = new WebLayer(this.manager, el, this.eventCallback)
      }
      this.childLayers.push(child)
      return false // stop traversing this subtree
    }
    return true
  }
}

