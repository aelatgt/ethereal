import {WebRenderer} from './WebRenderer'
import "fast-text-encoding"
import {
  addCSSRule,
  traverseChildElements,
  getBounds,
  getPadding,
  getMargin,
  getBorder,
  Bounds,
  Edges
} from './dom-utils'
import { LRUMap } from 'lru_map'
import * as sha256 from 'fast-sha256'

import {serializeToString, serializeAttribute, serializeAttributeValue} from './xml-serializer'

export type EventCallback = (
  event:
    | 'layerpainted'
    | 'layercreated'
    | 'layermoved',
  data: { target: Element }
) => void

const encoder = new TextEncoder();

type SVGHash = string
type CanvasHash = string

export class WebLayer {
  static DEFAULT_CACHE_SIZE = 4
  private static svgRetryCount: Map<SVGHash, number> = new Map
  private static svgCanvasHash: LRUMap<SVGHash, CanvasHash> = new LRUMap(1000)
  private static cachedCanvases: LRUMap<CanvasHash, HTMLCanvasElement> = new LRUMap(WebLayer.DEFAULT_CACHE_SIZE)

  id:string

  constructor(public element: Element, public eventCallback: EventCallback) {
    WebRenderer.layers.set(element, this)
    this.id = element.getAttribute(WebRenderer.ELEMENT_UID_ATTRIBUTE) ||  WebRenderer.generateElementUID()
    element.setAttribute(WebRenderer.ELEMENT_UID_ATTRIBUTE, this.id)
    element.setAttribute(WebRenderer.LAYER_ATTRIBUTE,'')
    this.parentLayer = WebRenderer.getClosestLayer(this.element, false)
    this.eventCallback('layercreated', { target: element })
    WebLayer.cachedCanvases.limit = WebRenderer.layers.size * WebLayer.DEFAULT_CACHE_SIZE
    this._hashingCanvas.width = 20
    this._hashingCanvas.height = 20
  }

  needsRefresh = true
  needsRemoval = false

  pseudoStates = {
    hover: false,
    active: false,
    focus: false,
    target: false
  }

  svgImage: HTMLImageElement = new Image()
  
  private bounds = new Bounds()
  private padding = new Edges()
  private margin = new Edges()
  private border = new Edges()
  
  parentLayer?: WebLayer
  childLayers = [] as WebLayer[]
  pixelRatio?: number

  rasterizationCount: Map<string, number> = new Map()
  cachedBounds: Map<string, Bounds> = new Map()
  cachedMargin: Map<string, Edges> = new Map()

  private _dynamicAttributes = ''
  private _svgHash = ''
  private _svgDocument = ''
  private _svgHashRasterizing = ''
  private _svgSrc = ''
  private _hashingCanvas = document.createElement('canvas')

  _currentSVGHash?: string
  _currentCanvas?: HTMLCanvasElement
  _currentBounds!: Bounds
  _currentMargin!: Edges

  trySetFromSVGHash(svgHash:SVGHash) {
    const bounds = this.cachedBounds.get(svgHash)
    const margin = this.cachedMargin.get(svgHash)
    if (svgHash == this._currentSVGHash) {
      if (bounds && margin) {
        this._currentBounds = bounds
        this._currentMargin = margin
      }
      return true 
    } else {
      const previousCanvasHash = WebLayer.svgCanvasHash.get(this._currentSVGHash!)
      const canvasHash = WebLayer.svgCanvasHash.get(svgHash)!
      const canvas = WebLayer.cachedCanvases.get(canvasHash)
      if (canvas && bounds && margin) {
        this._currentSVGHash = svgHash
        this._currentCanvas = canvas
        this._currentBounds = bounds
        this._currentMargin = margin
        if (previousCanvasHash !== canvasHash && this.eventCallback) this.eventCallback('layerpainted', { target: this.element })
        return true
      }
    }
    return false
  }

  get currentCanvas() {
    return this._currentCanvas
  }

  get currentBounds() {
    return this._currentBounds
  }

  get currentMargin() {
    return this._currentMargin
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

  refresh() {
    if (!this._currentSVGHash) {
      getBounds(this.element, this.bounds, this.parentLayer && this.parentLayer.element)
      getMargin(this.element, this.margin)
      this._currentBounds = this.bounds
      this._currentMargin = this.margin
    }
    this.needsRefresh = false
    this._updateParentAndChildLayers()
    WebRenderer.addToSerializeQueue(this)
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
        child = new WebLayer(el, this.eventCallback)
      }
      this.childLayers.push(child)
      return false // stop traversing this subtree
    }
    return true
  }

  serializationReplacer = (node:Node) => {
    if (this.element === node) return
    const element = node as Element
    const tagName = element.tagName?.toLowerCase()
    if (tagName === 'style' || tagName === 'link') return
    const layer = WebRenderer.layers.get(element)
    if (layer) {      
      const bounds = layer.bounds
      let attributes = ''
      const extraStyle = `max-width:${bounds.width+1}px;max-height:${bounds.height+1}px;min-width:${bounds.width}px;min-height:${bounds.height}px;visibility:hidden`
      let addedStyle = false
      for (const attr of layer.element.attributes) {
        if (attr.name === 'src') continue
        if (attr.name == 'style') {
          attributes += serializeAttribute(attr.name, attr.value + ';' + extraStyle)
          addedStyle = true
        } else {
          attributes += serializeAttribute(attr.name, attr.value)
        }
      }
      if (!addedStyle) {
        attributes += serializeAttribute('style', extraStyle)
      }
      const tag = element.tagName.toLowerCase()
      return `<${tag} ${attributes}></${tag}>`
    }
  }

  async serialize() {      
    const layerElement = this.element as HTMLElement
    if (layerElement.nodeName === 'VIDEO') return
    
    getBounds(layerElement, this.bounds, this.parentLayer?.element)
    getMargin(layerElement, this.margin)
    let { width, height } = this.bounds
    // add margins
    width += Math.max(this.margin.left, 0) + Math.max(this.margin.right, 0)
    height += Math.max(this.margin.top, 0) + Math.max(this.margin.bottom, 0)

    if (width * height > 0) {
      getPadding(layerElement, this.padding)
      getBorder(layerElement, this.border)

      // create svg markup
      const elementAttribute = WebRenderer.attributeHTML(WebRenderer.ELEMENT_UID_ATTRIBUTE,''+this.id)
      const computedStyle = getComputedStyle(layerElement)
      const needsInlineBlock = computedStyle.display === 'inline'
      WebRenderer.updateInputAttributes(layerElement)
      const parentsHTML = this._getParentsHTML(layerElement)
      parentsHTML[0] = parentsHTML[0].replace(
        'html',
        'html ' + WebRenderer.RENDERING_DOCUMENT_ATTRIBUTE + '="" '
      )

      const svgCSS = await WebRenderer.getAllEmbeddedStyles(layerElement)
      let layerHTML = await serializeToString(layerElement, this.serializationReplacer)
      
      layerHTML = layerHTML.replace(elementAttribute,
            `${elementAttribute} ${WebRenderer.RENDERING_ATTRIBUTE}="" ` +
            `${needsInlineBlock ? `${WebRenderer.RENDERING_INLINE_ATTRIBUTE}="" ` : ' '} ` +
            WebRenderer.getPsuedoAttributes(this.pseudoStates))
      const docString =
        '<svg width="' +
        width +
        '" height="' +
        height +
        '" xmlns="http://www.w3.org/2000/svg"><defs><style type="text/css"><![CDATA[\n' +
        svgCSS.join('\n') +
        ']]></style></defs><foreignObject x="0" y="0" width="' +
        (width+1) +
        '" height="' +
        (height+1) +
        '">' +
        parentsHTML[0] +
        layerHTML +
        parentsHTML[1] +
        '</foreignObject></svg>'
      const svgDoc = this._svgDocument = docString
      const svgHash = this._svgHash = WebRenderer.arrayBufferToBase64(sha256.hash(encoder.encode(svgDoc))) +
        '?w=' + width +
        ';h=' + height

      this.cachedBounds.set(svgHash, new Bounds().copy(this.bounds))
      this.cachedMargin.set(svgHash, new Edges().copy(this.margin))
      
      // try setting from cache
      if (this.trySetFromSVGHash(svgHash)) return

      // rasterize the svg document if no existing canvas matches
      WebRenderer.addToRasterizeQueue(this)
    } else {
      this._currentBounds.copy(this.bounds)
      this._currentMargin.copy(this.margin)
    }
  }

  async rasterize() {
    return new Promise<void>( (resolve, reject) => {
      const render = () => {
        WebRenderer.addToRenderQueue(this)
        this.svgImage.onload = null
        resolve()
      }
      this.svgImage.onload = () => {
        setTimeout(render, 10) // delay to make sure internal SVG images/resources are fully loaded 
      }
      this.svgImage.onerror = (error) => {
        reject(error)
      }
      this._svgHashRasterizing = this._svgHash
      this.svgImage.src = (this._svgSrc = 'data:image/svg+xml;utf8,' + encodeURIComponent(this._svgDocument))
    })
  }

  render() {

    if (!this.svgImage.complete || this.svgImage.currentSrc !== this.svgImage.src) {
      setTimeout(() => WebRenderer.addToRenderQueue(this),100)
      return
    }

    const svgHash = this._svgHashRasterizing

    if (!this.cachedBounds.has(svgHash) || !this.cachedMargin.has(svgHash)) {
      this.needsRefresh = true
      return
    }

    let { width, height } = this.cachedBounds.get(svgHash)!
    let { left, top, right, bottom } = this.cachedMargin.get(svgHash)!

    const fullWidth = width + left + right
    const fullHeight = height + top + bottom

    const hashingCanvas = this._hashingCanvas
    let hw = hashingCanvas.width
    let hh = hashingCanvas.height
    const hctx = hashingCanvas.getContext('2d')!
    hctx.clearRect(0, 0, hw, hh)
    hctx.imageSmoothingEnabled = false
    hctx.drawImage(this.svgImage, 0, 0, fullWidth, fullHeight, 0, 0, hw, hh)
    const hashData = hctx.getImageData(0, 0, hw, hh).data
    const canvasHash =
      WebRenderer.arrayBufferToBase64(sha256.hash(new Uint8Array(hashData)))
    
    const previousCanvasHash = WebLayer.svgCanvasHash.get(svgHash)
    WebLayer.svgCanvasHash.set(svgHash, canvasHash)
    if (previousCanvasHash !== canvasHash) {
      WebLayer.svgRetryCount.set(svgHash, 0)
    }

    const retryCount = WebLayer.svgRetryCount.get(svgHash)||0
    WebLayer.svgRetryCount.set(svgHash, retryCount+1)

    if (retryCount > 3 && WebLayer.cachedCanvases.has(canvasHash)) {
      if (this._svgHash === this._svgHashRasterizing)
        this.trySetFromSVGHash(this._svgHash)
      return
    }

    setTimeout(() => WebRenderer.addToRenderQueue(this), (500 + Math.random() * 1000) * 2^retryCount)

    if (previousCanvasHash === canvasHash && WebLayer.cachedCanvases.has(previousCanvasHash)) 
      return

    const pixelRatio =
      this.pixelRatio ||
      parseFloat(this.element.getAttribute(WebRenderer.PIXEL_RATIO_ATTRIBUTE)!) ||
      window.devicePixelRatio
    const newCanvas =
      WebLayer.cachedCanvases.size === WebLayer.cachedCanvases.limit
        ? WebLayer.cachedCanvases.shift()![1]
        : document.createElement('canvas')
    let w = (newCanvas.width = fullWidth * pixelRatio)
    let h = (newCanvas.height = fullHeight * pixelRatio)
    const ctx = newCanvas.getContext('2d')!
    ctx.imageSmoothingEnabled = false
    ctx.clearRect(0, 0, w, h)
    ctx.drawImage(this.svgImage, 0, 0, fullWidth, fullHeight, 0, 0, w, h)
    WebLayer.cachedCanvases.set(canvasHash, newCanvas)

    if (this._svgHash === this._svgHashRasterizing)
      this.trySetFromSVGHash(svgHash)
  }

  // Get all parents of the embeded html as these can effect the resulting styles
  private _getParentsHTML(element: Element) {
    const opens = []
    const closes = []
    let parent = element.parentElement
    if (!parent) parent = document.documentElement
    do {
      let tag = parent.tagName.toLowerCase()
      let attributes = ' '
      let style = ''
      for (const a of parent.attributes) {
        const value = serializeAttributeValue(a.value)
        if (a.name === 'style') { style = value; continue }
        attributes += `${a.name}="${value}" `
      }
      const open =
        '<' +
        tag +
        (tag === 'html'
          ? ` xmlns="http://www.w3.org/1999/xhtml" style="--x-width:${
              this.bounds.width}px;--x-height:${this.bounds.height}px;--x-inline-top:${
              this.border.top + this.margin.top + this.padding.top}px; ${style}" `
          : ` style="${style}" `) +
        attributes +
        `${WebRenderer.RENDERING_PARENT_ATTRIBUTE}="" ` +
        // WebRenderer.getPsuedoAttributes(parent) +
        ' >'
      opens.unshift(open)
      const close = '</' + tag + '>'
      closes.push(close)
      if (tag == 'html') break
    } while ((parent = parent !== document.documentElement ? parent.parentElement || document.documentElement : null))
    return [opens.join(''), closes.join('')]
  }
}