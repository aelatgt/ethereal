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

import {serializeToString, serializeAttribute} from './xml-serializer'

export type EventCallback = (
  event:
    | 'layerpainted'
    | 'layerresized'
    | 'layercreated'
    | 'layermoved'
    | 'removalrequired'
    | 'inputrequired',
  data: { target: Element }
) => void

export class WebLayer {
  static DEFAULT_CACHE_SIZE = 4
  private static blankRetryCounts: Map<string, number> = new Map
  private static canvasHashes: LRUMap<string, string> = new LRUMap(1000)
  private static cachedCanvases: LRUMap<string, HTMLCanvasElement> = new LRUMap(WebLayer.DEFAULT_CACHE_SIZE)

  id:string

  constructor(public element: Element, public eventCallback: EventCallback) {
    WebRenderer.layers.set(element, this)
    this.id = element.getAttribute(WebRenderer.ELEMENT_UID_ATTRIBUTE) ||  WebRenderer.generateElementUID()
    element.setAttribute(WebRenderer.ELEMENT_UID_ATTRIBUTE, this.id)
    element.setAttribute(WebRenderer.LAYER_ATTRIBUTE,'')
    this.parentLayer = WebRenderer.getClosestLayer(this.element.parentElement)
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
  bounds = new Bounds()
  // private _previousBounds = new Bounds()

  private padding = new Edges()
  private margin = new Edges()
  private border = new Edges()
  parentLayer?: WebLayer
  childLayers = [] as WebLayer[]
  pixelRatio?: number

  cachedBounds: Map<string, Bounds> = new Map()
  cachedMargin: Map<string, Edges> = new Map()

  private _dynamicAttributes = ''
  private _svgDocument = ''
  private _rasterizingDocument = ''
  private _svgSrc = ''
  private _hashingCanvas = document.createElement('canvas')

  _canvas!: HTMLCanvasElement

  set canvas(val: HTMLCanvasElement) {
    if (this._canvas !== val) {
      this._canvas = val
      if (this.eventCallback) this.eventCallback('layerpainted', { target: this.element })
    }
  }

  get canvas() {
    return this._canvas
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
    getBounds(this.element, this.bounds, this.parentLayer && this.parentLayer.element)
    this.needsRefresh = false
    this._updateParentAndChildLayers()
    WebRenderer.addToSerializeQueue(this)
  }

  private _updateParentAndChildLayers() {
    const element = this.element
    const childLayers = this.childLayers
    const oldChildLayers = childLayers.slice()

    const previousParentLayer = this.parentLayer
    this.parentLayer = WebRenderer.getClosestLayer(this.element.parentElement)
    if (previousParentLayer !== this.parentLayer) {
      this.parentLayer && this.parentLayer.childLayers.push(this)
      this.eventCallback('layermoved', { target: element })
    }

    childLayers.length = 0
    traverseChildElements(element, this._tryConvertElementToWebLayer, this)

    for (const child of oldChildLayers) {
      const parentLayer = WebRenderer.getClosestLayer(child.element.parentElement)
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
    const layer = WebRenderer.layers.get(element)
    if (layer) {      
      const bounds = layer.bounds
      let attributes = ''
      const extraStyle = `min-width:${bounds.width}px;min-height:${bounds.height}px;visibility:hidden`
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
    if (this.element.nodeName === 'VIDEO') return

    let { width, height } = this.bounds

    if (width * height > 0) {
      getPadding(this.element, this.padding)
      getMargin(this.element, this.margin)
      getBorder(this.element, this.border)
      // add margins and border
      width += Math.max(this.margin.left, 0) + Math.max(this.margin.right, 0)// + 0.5
      height += Math.max(this.margin.top, 0) + Math.max(this.margin.bottom, 0)
      // width += Math.max(this.border.left,0) + Math.max(this.border.right,0)
      // height += Math.max(this.border.top,0) + Math.max(this.border.bottom,0)

      // create svg markup
      const elementAttribute = WebRenderer.attributeHTML(WebRenderer.ELEMENT_UID_ATTRIBUTE,''+this.id)
      const layerElement = this.element as HTMLElement
      const computedStyle = getComputedStyle(layerElement)
      const needsInlineBlock = computedStyle.display === 'inline'
      WebRenderer.updateInputAttributes(layerElement)
      const layerHTML = serializeToString(layerElement, this.serializationReplacer).replace(
          elementAttribute,
            `${elementAttribute} ${WebRenderer.RENDERING_ATTRIBUTE}="" ` +
            `${needsInlineBlock ? `${WebRenderer.RENDERING_INLINE_ATTRIBUTE}="" ` : ' '} ` +
            WebRenderer.getPsuedoAttributes(this.pseudoStates)
      )
      // const layerHTML = WebRenderer.serializer
      //   .serializeToString(layerElement)
      //   .replace(
      //     elementAttribute,
      //       `${elementAttribute} ${WebRenderer.RENDERING_ATTRIBUTE}="" ` +
      //       `${needsInlineBlock ? `${WebRenderer.RENDERING_INLINE_ATTRIBUTE}="" ` : ' '} ` +
      //       WebRenderer.getPsuedoAttributes(this.pseudoStates)
      //   )
      const parentsHTML = this._getParentsHTML(layerElement)
      parentsHTML[0] = parentsHTML[0].replace(
        'html',
        'html ' + WebRenderer.RENDERING_DOCUMENT_ATTRIBUTE + '="" '
      )

      const [svgCSS] = await Promise.all([
        WebRenderer.getEmbeddedCSS(this.element),
        WebRenderer.embedExternalResources(this.element)
      ])
      const docString =
        '<svg width="' +
        width +
        '" height="' +
        height +
        '" xmlns="http://www.w3.org/2000/svg"><defs><style type="text/css"><![CDATA[a[href]{color:#0000EE;text-decoration:underline;}' +
        svgCSS.join('') +
        ']]></style></defs><foreignObject x="0" y="0" width="' +
        width +
        '" height="' +
        height +
        '">' +
        parentsHTML[0] +
        layerHTML +
        parentsHTML[1] +
        '</foreignObject></svg>'
      const svgDoc = this._svgDocument = docString
      // const svgSrc = (this._svgSrc = 'data:image/svg+xml;utf8,' + encodeURIComponent(docString))

      // check for existing canvas
      const canvasHash = WebLayer.canvasHashes.get(svgDoc)
      if (canvasHash && WebLayer.cachedCanvases.has(canvasHash)) {
        this.canvas = WebLayer.cachedCanvases.get(canvasHash)!
        return
      }

      // rasterize the svg document if no existing canvas matches
      this.cachedBounds.set(svgDoc, new Bounds().copy(this.bounds))
      this.cachedMargin.set(svgDoc, new Edges().copy(this.margin))
      WebRenderer.addToRasterizeQueue(this)
    }
  }

  async rasterize() {
    return new Promise<void>(resolve => {
      this.svgImage.onload = () => {
        WebRenderer.addToRenderQueue(this)
        resolve()
      }
      this._rasterizingDocument = this._svgDocument
      this.svgImage.src = (this._svgSrc = 'data:image/svg+xml;utf8,' + encodeURIComponent(this._svgDocument))
      if (this.svgImage.complete && this.svgImage.currentSrc === this.svgImage.src) {
        WebRenderer.addToRenderQueue(this)
        this.svgImage.onload = null
        resolve()
      }
    })
  }

  render() {
    const svgDoc = this._rasterizingDocument

    if (!this.cachedBounds.has(svgDoc) || !this.cachedMargin.has(svgDoc)) {
      this.needsRefresh = true
      return
    }

    if (!this.svgImage.complete) {
      WebRenderer.addToRenderQueue(this)
      return
    }

    let { width, height } = this.cachedBounds.get(svgDoc)!
    let { left, top } = this.cachedMargin.get(svgDoc)!

    const hashingCanvas = this._hashingCanvas
    let hw = hashingCanvas.width
    let hh = hashingCanvas.height
    const hctx = hashingCanvas.getContext('2d')!
    hctx.clearRect(0, 0, hw, hh)
    hctx.imageSmoothingEnabled = false
    hctx.drawImage(this.svgImage, left, top, width, height, 0, 0, hw, hh)
    const hashData = hctx.getImageData(0, 0, hw, hh).data
    const hash =
      WebRenderer.arrayBufferToBase64(sha256.hash(new Uint8Array(hashData))) +
      '?w=' +
      width +
      ';h=' +
      height
    WebLayer.canvasHashes.set(svgDoc, hash)

    const blankRetryCount = WebLayer.blankRetryCounts.get(svgDoc)||0
    if (WebRenderer.isBlankImage(hashData) && blankRetryCount < 10) {
      WebLayer.blankRetryCounts.set(svgDoc,blankRetryCount+1)
      setTimeout(() => WebRenderer.addToRenderQueue(this), 500)
      return
    }

    if (WebLayer.cachedCanvases.has(hash)) {
      this.canvas = WebLayer.cachedCanvases.get(hash)!
      return
    }

    const pixelRatio =
      this.pixelRatio ||
      parseFloat(this.element.getAttribute(WebRenderer.PIXEL_RATIO_ATTRIBUTE)!) ||
      window.devicePixelRatio
    const newCanvas =
      WebLayer.cachedCanvases.size === WebLayer.cachedCanvases.limit
        ? WebLayer.cachedCanvases.shift()![1]
        : document.createElement('canvas')
    let w = (newCanvas.width = width * pixelRatio)
    let h = (newCanvas.height = height * pixelRatio)
    const ctx = newCanvas.getContext('2d')!
    ctx.imageSmoothingEnabled = false
    ctx.clearRect(0, 0, w, h)
    ctx.drawImage(this.svgImage, left, top, width, height, 0, 0, w, h)
    WebLayer.cachedCanvases.set(hash, newCanvas)
    this.canvas = newCanvas
  }

  // Get all parents of the embeded html as these can effect the resulting styles
  private _getParentsHTML(element: Element) {
    const opens = []
    const closes = []
    let parent = element.parentElement!
    if (!parent) parent = document.documentElement
    do {
      let tag = parent.tagName.toLowerCase()
      let attributes = ' '
      for (const a of parent.attributes) {
        if (a.name === 'style') continue

        attributes += `${a.name}="${a.value}" `
      }
      const open =
        '<' +
        tag +
        (tag === 'html'
          ? ` xmlns="http://www.w3.org/1999/xhtml" style="--x-width:${
              this.bounds.width}px;--x-height:${this.bounds.height}px;--x-inline-top:${
              this.border.top + this.margin.top + this.padding.top}px" `
          : '') +
        attributes +
        `${WebRenderer.RENDERING_PARENT_ATTRIBUTE}="" ` +
        // WebRenderer.getPsuedoAttributes(parent) +
        ' >'
      opens.unshift(open)
      const close = '</' + tag + '>'
      closes.push(close)
      if (tag == 'html') break
    } while ((parent = parent.parentElement!))
    return [opens.join(''), closes.join('')]
  }
}