import {WebRenderer} from './WebRenderer'
import "fast-text-encoding"
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

  id:string

  constructor(public manager:WebLayerManagerBase, public element: Element, public eventCallback: EventCallback) {
    if (!manager) throw new Error("WebLayerManager must be initialized")
    WebRenderer.layers.set(element, this)
    this.id = element.getAttribute(WebRenderer.ELEMENT_UID_ATTRIBUTE) ||  WebRenderer.generateElementUID()
    element.setAttribute(WebRenderer.ELEMENT_UID_ATTRIBUTE, this.id)
    element.setAttribute(WebRenderer.LAYER_ATTRIBUTE,'')
    this.parentLayer = WebRenderer.getClosestLayer(this.element, false)
    this.eventCallback('layercreated', { target: element })
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

  previousDOMStateHash?: string
  currentDOMStateHash?: string

  get previousDOMState() {
    return this.previousDOMStateHash ? this.manager.getLayerState(this.previousDOMStateHash) : undefined
  }

  get currentDOMState() {
    return this.currentDOMStateHash ? this.manager.getLayerState(this.currentDOMStateHash) : undefined
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
    const prevState = this.previousDOMState
    const state = this.currentDOMState
    if (prevState?.texture.url !== state?.texture.url) {
      this.eventCallback('layerpainted', { target: this.element })
    }
    this.previousDOMStateHash = this.currentDOMStateHash
  }

  async refresh() {
    this.currentDOMStateHash = undefined
    this.needsRefresh = false
    this._updateParentAndChildLayers()
    
    const result = await this.manager.addToSerializeQueue(this)
    if (result.needsRasterize) await this.manager.addToRasterizeQueue(result.svgHash, result.svgUrl)
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
    const id = el.getAttribute(WebRenderer.ELEMENT_UID_ATTRIBUTE)
    if (!id) {
        el.setAttribute(WebRenderer.ELEMENT_UID_ATTRIBUTE, WebRenderer.generateElementUID())
    }
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

