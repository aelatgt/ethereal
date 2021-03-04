import {EventCallback, WebLayer} from './WebLayer'
import { addCSSRule } from './dom-utils'
import { Matrix4 } from 'three'
import { ResizeObserver as Polyfill } from '@juggle/resize-observer'
const ResizeObserver:typeof Polyfill = (self as any).ResizeObserver || Polyfill


function ensureElementIsInDocument(element: Element): Element {
  const document = element.ownerDocument!
  if (document.contains(element)) {
    return element
  }
  const container = document.createElement('div')
  container.setAttribute(WebRenderer.RENDERING_CONTAINER_ATTRIBUTE, '')
  container.style.position = 'fixed'
  container.style.width = '100%'
  container.style.height = '100%'
  container.style.top = '-100000px'
  container.style['contain' as any] = 'strict'
  container.appendChild(element)
  document.documentElement.appendChild(container)
  // document.body.appendChild(container)
  return element
}

const scratchMat1 = new Matrix4()
const scratchMat2 = new Matrix4()
const textDecoder = new TextDecoder()
const microtask = Promise.resolve()

export class WebRenderer {
  static ATTRIBUTE_PREFIX = 'xr'
  static get ELEMENT_UID_ATTRIBUTE() { return this.ATTRIBUTE_PREFIX + '-uid' }
  static get HOVER_ATTRIBUTE() { return this.ATTRIBUTE_PREFIX + '-hover'}
  static get ACTIVE_ATTRIBUTE() { return this.ATTRIBUTE_PREFIX + '-active'}
  static get FOCUS_ATTRIBUTE() { return this.ATTRIBUTE_PREFIX + '-focus'}
  static get TARGET_ATTRIBUTE() { return this.ATTRIBUTE_PREFIX + '-target'}
  static get LAYER_ATTRIBUTE() { return this.ATTRIBUTE_PREFIX + '-layer'}
  static get PIXEL_RATIO_ATTRIBUTE() { return this.ATTRIBUTE_PREFIX + '-pixel-ratio' }

  static get RENDERING_ATTRIBUTE() { return this.ATTRIBUTE_PREFIX + '-rendering' }
  static get RENDERING_PARENT_ATTRIBUTE() { return this.ATTRIBUTE_PREFIX + '-rendering-parent' }
  static get RENDERING_CONTAINER_ATTRIBUTE() { return this.ATTRIBUTE_PREFIX + '-rendering-container' }
  static get RENDERING_INLINE_ATTRIBUTE() { return this.ATTRIBUTE_PREFIX + '-rendering-inline' }
  static get RENDERING_DOCUMENT_ATTRIBUTE() { return this.ATTRIBUTE_PREFIX + '-rendering-document' }

  private static _nextUID = 0
  static generateElementUID() { return '' + (this._nextUID ++) }

  static serializer = new XMLSerializer()

  static rootLayers: Map<Element, WebLayer> = new Map()
  static layers: Map<Element, WebLayer> = new Map()
  private static mutationObservers: Map<Element, MutationObserver> = new Map()
  private static resizeObservers: Map<Element, Polyfill> = new Map()
  static serializeQueue = [] as WebLayer[]
  static rasterizeQueue = [] as WebLayer[]
  static renderQueue = [] as WebLayer[]

  // static readonly virtualHoverElements = new Set<Element>()
  static readonly focusElement:HTMLElement|null = null // i.e., element is ready to receive input
  static readonly activeElement:Element|null = null // i.e., button element is being "pressed down"
  static readonly targetElement:Element|null = null // i.e., the element whose ID matches the url #hash

  // static containsHover(element: Element) {
  //   for (const t of this.virtualHoverElements) {
  //     if (element.contains(t)) return true
  //   }
  //   return false
  // }

  static getPsuedoAttributes(states: typeof WebLayer.prototype.psuedoStates) {
    return (
      `${states.hover ? `${this.HOVER_ATTRIBUTE}="" ` : ' '}` +
      `${states.focus ? `${this.FOCUS_ATTRIBUTE}="" ` : ' '}` +
      `${states.active ? `${this.ACTIVE_ATTRIBUTE}="" ` : ' '}` +
      `${states.target ? `${this.TARGET_ATTRIBUTE}="" ` : ' '}`
    )
  }


  static _didInit = false
  static _init() {
    if (this._didInit) return
    this._didInit = true

    // const inputStyles = document.createElement("style")
    // inputStyles.innerHTML = "input, select,textarea{border: 1px solid #000000;margin: 0;background-color: #ffffff;-webkit-appearance: none;}:-webkit-autofill {color: #fff !important;}input[type='checkbox']{width: 20px;height: 20px;display: inline-block;}input[type='radio']{width: 20px;height: 20px;display: inline-block;border-radius: 50%;}input[type='checkbox'][checked],input[type='radio'][checked]{background-color: #555555;}"
    // document.head.insertBefore(inputStyles, document.head.firstChild)
    const style = document.createElement('style')
    document.head.append(style)
    const sheet = style.sheet as CSSStyleSheet
    let i = 0
    addCSSRule(
      sheet,
      `[${WebRenderer.RENDERING_DOCUMENT_ATTRIBUTE}] *`,
      'transform: none !important;',
      i++
    )
    addCSSRule(
      sheet,
      `[${WebRenderer.RENDERING_ATTRIBUTE}], [${WebRenderer.RENDERING_ATTRIBUTE}] *`,
      'visibility: visible !important;',
      i++
    )
    addCSSRule(
      sheet,
      `[${WebRenderer.RENDERING_ATTRIBUTE}] [${WebRenderer.LAYER_ATTRIBUTE}], [${
        WebRenderer.RENDERING_ATTRIBUTE}] [${WebRenderer.LAYER_ATTRIBUTE}] *`,
      'visibility: hidden !important;',
      i++
    )
    addCSSRule(
      sheet,
      `[${WebRenderer.RENDERING_ATTRIBUTE}]`,
      'position: relative; top: 0 !important; left: 0 !important; float: none; box-sizing:border-box; width:var(--x-width); height:var(--x-height);',
      i++
    )
    addCSSRule(
      sheet,
      `[${WebRenderer.RENDERING_INLINE_ATTRIBUTE}]`,
      'top: var(--x-inline-top) !important; width:auto !important',
      i++
    )
    addCSSRule(
      sheet,
      `[${WebRenderer.RENDERING_PARENT_ATTRIBUTE}]`,
      'transform: none !important; left: 0 !important; top: 0 !important; margin: 0 !important; border:0 !important; border-radius:0 !important; height:100% !important; padding:0 !important; position:static !important; text-align:left !important; display:block !important; background: rgba(0,0,0,0) none !important; box-shadow:none !important',
      i++
    )
    addCSSRule(
      sheet,
      `[${WebRenderer.RENDERING_PARENT_ATTRIBUTE}]::before, [${WebRenderer.RENDERING_PARENT_ATTRIBUTE}]::after`,
      'content:none !important; box-shadow:none !important;',
      i++
    )

    let previousHash = ''
    const onHashChange = () => {
      if (previousHash != window.location.hash) {
        if (window.location.hash) {
          try {
            // @ts-ignore()
            this.targetElement = document.querySelector(window.location.hash)
          } catch {}
        }
      }
      previousHash = window.location.hash
    }
    window.addEventListener('hashchange', onHashChange, false)
    onHashChange()

    window.addEventListener('focusin', (evt) => {
      // @ts-ignore
      this.focusElement = evt.target
    }, false)

    window.addEventListener('focusout', (evt) => {
      // @ts-ignore
      this.focusElement = null
    }, false)
  }

  static addToSerializeQueue(layer: WebLayer) {
    if (this.serializeQueue.indexOf(layer) === -1) this.serializeQueue.push(layer)
  }

  static addToRasterizeQueue(layer: WebLayer) {
    if (this.rasterizeQueue.indexOf(layer) === -1) this.rasterizeQueue.push(layer)
  }

  static addToRenderQueue(layer: WebLayer) {
    if (this.renderQueue.indexOf(layer) === -1) this.renderQueue.push(layer)
  }

  static TASK_SERIALIZE_MAX_TIME = 200 // serialization is synchronous
  static TASK_RASTERIZE_MAX_TIME = 200 // processing of data:svg is async
  static TASK_RASTERIZE_MAX_SIMULTANEOUS = 2 // since rasterization is async, limit simultaneous rasterizations
  static TASK_RENDER_MAX_TIME = 300 // rendering to canvas is synchronous
  static rasterizeTaskCount = 0
  private static _runTasks() {
    WebRenderer.tasksPending = false
    const serializeQueue = WebRenderer.serializeQueue
    const rasterizeQueue = WebRenderer.rasterizeQueue
    const renderQueue = WebRenderer.renderQueue
    let startTime = performance.now()
    // while (renderQueue.length && performance.now() - startTime < WebRenderer.TASK_RENDER_MAX_TIME/2) {
    //     renderQueue.shift()!.render()
    // }
    // startTime = performance.now()
    while (serializeQueue.length && performance.now() - startTime < WebRenderer.TASK_SERIALIZE_MAX_TIME) {
      serializeQueue.shift()!.serialize()
    }
    startTime = performance.now()
    while (
      rasterizeQueue.length &&
      performance.now() - startTime < WebRenderer.TASK_RASTERIZE_MAX_TIME &&
      WebRenderer.rasterizeTaskCount < WebRenderer.TASK_RASTERIZE_MAX_SIMULTANEOUS
    ) {
      WebRenderer.rasterizeTaskCount++
      rasterizeQueue
        .shift()!
        .rasterize()
        .then(() => {
          WebRenderer.rasterizeTaskCount--
        })
    }
    startTime = performance.now()
    while (renderQueue.length && performance.now() - startTime < WebRenderer.TASK_RENDER_MAX_TIME / 2) {
      renderQueue.shift()!.render()
    }
  }

  static tasksPending = false
  
  static scheduleTasksIfNeeded() {
    if (this.tasksPending ||
        (WebRenderer.serializeQueue.length === 0 &&
        WebRenderer.rasterizeQueue.length === 0  &&
        WebRenderer.renderQueue.length === 0)) return
    this.tasksPending = true
    WebRenderer.scheduleIdle(WebRenderer._runTasks)
  }

  static scheduleIdle(cb:(deadline?:RequestIdleCallbackDeadline)=>any) {
    if ("requestIdleCallback" in self) {
      requestIdleCallback(cb)
    } else {
      setTimeout(cb,1)
    }
  }

  static setLayerNeedsRefresh(layer: WebLayer) {
    layer.needsRefresh = true
  }

  static createLayerTree(element: Element, eventCallback: EventCallback) {
    if (WebRenderer.getClosestLayer(element))
      throw new Error('A root WebLayer for the given element already exists')

    WebRenderer._init()
    ensureElementIsInDocument(element)

    const observer = new MutationObserver(WebRenderer._handleMutations)
    this.mutationObservers.set(element, observer)
    this.startMutationObserver(element)

    const resizeObserver = new ResizeObserver(records => {
      for (const record of records) {
        const layer = this.getClosestLayer(record.target)!
        layer.traverseLayers(WebRenderer.setLayerNeedsRefresh)
        layer.traverseParentLayers(WebRenderer.setLayerNeedsRefresh)
      }
    })
    resizeObserver.observe(element)
    this.resizeObservers.set(element, resizeObserver)

    element.addEventListener('input', this._triggerRefresh, { capture: true })
    element.addEventListener('keydown', this._triggerRefresh, { capture: true })
    element.addEventListener('submit', this._triggerRefresh, { capture: true })
    element.addEventListener('change', this._triggerRefresh, { capture: true })
    element.addEventListener('focus', this._triggerRefresh, { capture: true })
    element.addEventListener('blur', this._triggerRefresh, { capture: true })
    element.addEventListener('transitionend', this._triggerRefresh, { capture: true })

    const layer = new WebLayer(element, eventCallback)
    this.rootLayers.set(element, layer)
    return layer
  }

  static disposeLayer(layer: WebLayer) {
    if (this.rootLayers.has(layer.element)) {
      this.rootLayers.delete(layer.element)
      const observer = this.mutationObservers.get(layer.element)!
      observer.disconnect()
      this.mutationObservers.delete(layer.element)
      const resizeObserver = this.resizeObservers.get(layer.element)!
      resizeObserver.disconnect()
      this.resizeObservers.delete(layer.element)
      layer.element.removeEventListener('input', this._triggerRefresh, { capture: true })
      layer.element.removeEventListener('keydown', this._triggerRefresh, { capture: true })
      layer.element.removeEventListener('submit', this._triggerRefresh, { capture: true })
      layer.element.removeEventListener('change', this._triggerRefresh, { capture: true })
      layer.element.removeEventListener('focus', this._triggerRefresh, { capture: true })
      layer.element.removeEventListener('blur', this._triggerRefresh, { capture: true })
      layer.element.removeEventListener('transitionend', this._triggerRefresh, { capture: true })
    }
  }

  static getClosestLayer(element: Element|null): WebLayer | undefined {
    const closestLayerElement =
      element && (element.closest(`[${WebRenderer.LAYER_ATTRIBUTE}]`) as HTMLElement)
    return this.layers.get(closestLayerElement!)
  }

  static getCSSTransformForElement(element: Element, out = new Matrix4()) {
    const styles = getComputedStyle(element)
    var transformcss = styles['transform']
    if (transformcss.indexOf('matrix(') == 0) {
      out.identity()
      var mat = transformcss
        .substring(7, transformcss.length - 1)
        .split(', ')
        .map(parseFloat)
      out.elements[0] = mat[0]
      out.elements[1] = mat[1]
      out.elements[4] = mat[2]
      out.elements[5] = mat[3]
      out.elements[12] = mat[4]
      out.elements[13] = mat[5]
    } else if (transformcss.indexOf('matrix3d(') == 0) {
      var mat = transformcss
        .substring(9, transformcss.length - 1)
        .split(', ')
        .map(parseFloat)
      out.fromArray(mat)
    } else {
      return out.identity()
    }

    var origincss = styles.transformOrigin.split(' ').map(parseFloat)

    var ox = origincss[0]
    var oy = origincss[1]
    var oz = origincss[2] || 0

    var T1 = scratchMat1.identity().makeTranslation(-ox, -oy, -oz)
    var T2 = scratchMat2.identity().makeTranslation(ox, oy, oz)

    return out.premultiply(T2).multiply(T1)
  }

  static async embedExternalResources(element: Element) {
    const promises = []
    const elements = element.querySelectorAll('*')
    for (const element of elements) {
      const link = element.getAttributeNS('http://www.w3.org/1999/xlink', 'href')
      if (link) {
        promises.push(
          WebRenderer.getDataURL(link).then(dataURL => {
            element.removeAttributeNS('http://www.w3.org/1999/xlink', 'href')
            element.setAttribute('href', dataURL)
          })
        )
      }
      const imgElement = element as HTMLImageElement
      if (element.tagName == 'IMG' && imgElement.src.substr(0, 4) != 'data') {
        promises.push(
          WebRenderer.getDataURL(imgElement.src).then(dataURL => {
            element.setAttribute('src', dataURL)
          })
        )
      }
      if (element.namespaceURI == 'http://www.w3.org/1999/xhtml' && element.hasAttribute('style')) {
        const style = element.getAttribute('style') || ''
        promises.push(
          WebRenderer.generateEmbeddedCSS(window.location.href, style).then(css => {
            if (style != css) element.setAttribute('style', css)
          })
        )
      }
    }
    const styles = element.querySelectorAll('style')
    for (const style of styles) {
      promises.push(
        WebRenderer.generateEmbeddedCSS(window.location.href, style.innerHTML).then(css => {
          if (style.innerHTML != css) style.innerHTML = css
        })
      )
    }
    return Promise.all(promises)
  }

  static pauseMutationObservers() {
    const mutationObservers = WebRenderer.mutationObservers.values()
    for (const m of mutationObservers) {
      WebRenderer._handleMutations(m.takeRecords())
      m.disconnect()
    }
  }

  static resumeMutationObservers() {
    for (const [e] of WebRenderer.mutationObservers) {
      this.startMutationObserver(e)
    }
  }

  private static startMutationObserver(element: Element) {
    const observer = WebRenderer.mutationObservers.get(element)!
    observer.observe(element, {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true,
      characterDataOldValue: true,
      attributeOldValue: true
    })
  }

  private static _handleMutations = (records: MutationRecord[]) => {
    for (const record of records) {
      if (record.type === 'attributes') {
        const target = record.target as HTMLElement
        if (target.getAttribute(record.attributeName!) === record.oldValue) {
          continue
        }
      }
      if (record.type === 'characterData') {
        const target = record.target as CharacterData
        if (target.data === record.oldValue) {
          continue
        }
      }
      const target =
        record.target.nodeType === Node.ELEMENT_NODE
          ? (record.target as HTMLElement)
          : record.target.parentElement
      if (!target) continue
      const layer = WebRenderer.getClosestLayer(target)
      if (!layer) continue
      if (record.type === 'attributes' && record.attributeName === 'class') {
        const oldClasses = record.oldValue ? record.oldValue : ''
        const currentClasses = (record.target as HTMLElement).className
        if (oldClasses === currentClasses) continue
      }
      // layer.traverseParentLayers(WebRenderer.setLayerNeedsRefresh) // may be needed to support :focus-within() and future :has() selector support
      layer.parentLayer
        ? layer.parentLayer.traverseChildLayers(WebRenderer.setLayerNeedsRefresh)
        : layer.traverseLayers(WebRenderer.setLayerNeedsRefresh)
    }
  }

  private static _triggerRefresh = async (e: Event) => {
    const layer = WebRenderer.getClosestLayer(e.target as any)!
    // WebRenderer.updateInputAttributes(e.target as any)
    if (layer) {
      // layer.traverseParentLayers(WebRenderer.setLayerNeedsRefresh) // may be needed to support :focus-within() and future :has() selector support
      layer.parentLayer
        ? layer.parentLayer.traverseChildLayers(WebRenderer.setLayerNeedsRefresh)
        : layer.traverseLayers(WebRenderer.setLayerNeedsRefresh)
    }
  }

  private static _addDynamicPseudoClassRulesToPage() {
    const sheets = document.styleSheets
    for (let i = 0; i < sheets.length; i++) {
      try {
        const sheet = sheets[i] as CSSStyleSheet
        const rules = sheet.cssRules
        if (!rules) continue
        const newRules = []
        for (var j = 0; j < rules.length; j++) {
          if (rules[j].cssText.indexOf(':hover') > -1) {
            newRules.push(rules[j].cssText.replace(new RegExp(':hover', 'g'), `[${WebRenderer.HOVER_ATTRIBUTE}]`))
          }
          if (rules[j].cssText.indexOf(':active') > -1) {
            newRules.push(
              rules[j].cssText.replace(new RegExp(':active', 'g'), `[${WebRenderer.ACTIVE_ATTRIBUTE}]`)
            )
          }
          if (rules[j].cssText.indexOf(':focus') > -1) {
            newRules.push(rules[j].cssText.replace(new RegExp(':focus', 'g'), `[${WebRenderer.FOCUS_ATTRIBUTE}]`))
          }
          if (rules[j].cssText.indexOf(':target') > -1) {
            newRules.push(
              rules[j].cssText.replace(new RegExp(':target', 'g'), `[${WebRenderer.TARGET_ATTRIBUTE}]`)
            )
          }
          var idx = newRules.indexOf(rules[j].cssText)
          if (idx > -1) {
            newRules.splice(idx, 1)
          }
        }
        for (var j = 0; j < newRules.length; j++) {
          sheet.insertRule(newRules[j])
        }
      } catch (e) {}
    }
  }

  static arrayBufferToBase64(bytes:Uint8Array) {
    var binary = ''
    var len = bytes.byteLength
    for (var i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
  }

  static attributeCSS(name:string, value?:string) {
    return value ? `[${name}]=${value}` : `[${name}]`
  }

  static attributeHTML(name:string, value?:string) {
    return value ? `${name}="${value}"` : `${name}=""`
  }

  static async generateEmbeddedCSS(url:string, css:string): Promise<string> {
    let found
    const promises = []

    // Add classes for psuedo-classes
    css = css.replace(new RegExp(':hover', 'g'), this.attributeCSS(this.HOVER_ATTRIBUTE))
    css = css.replace(new RegExp(':active', 'g'), this.attributeCSS(this.ACTIVE_ATTRIBUTE))
    css = css.replace(new RegExp(':focus', 'g'), this.attributeCSS(this.FOCUS_ATTRIBUTE))
    css = css.replace(new RegExp(':target', 'g'), this.attributeCSS(this.TARGET_ATTRIBUTE))

    // Replace all urls in the css
    const regEx = RegExp(/url\((?!['"]?(?:data):)['"]?([^'"\)]*)['"]?\)/gi)
    while ((found = regEx.exec(css))) {
      const resourceURL = found[1]
      promises.push(
        this.getDataURL(new URL(resourceURL, url).href).then(dataURL => {
          css = css.replace(resourceURL, dataURL)
        })
      )
    }

    await Promise.all(promises)
    return css
  }

  static async getURL(url:string): Promise<XMLHttpRequest> {
    url = new URL(url, window.location.href).href
    return new Promise<XMLHttpRequest>(resolve => {
      var xhr = new XMLHttpRequest()

      xhr.open('GET', url, true)

      xhr.responseType = 'arraybuffer'

      xhr.onload = () => {
        resolve(xhr)
      }

      xhr.onerror = () => {
        resolve(xhr)
      }

      xhr.send()
    })
  }

  private static _embeddedPageCSS = new Map<Element, Promise<string>>()

  static async getEmbeddedPageCSS() {
    const embedded = this._embeddedPageCSS
    const styleElements = Array.from(
      document.querySelectorAll("style, link[type='text/css'], link[rel='stylesheet']")
    )
    let foundNewStyles = false
    for (const element of styleElements) {
      if (!embedded.has(element)) {
        foundNewStyles = true
        if (element.tagName == 'STYLE') {
          const sheet = (element as HTMLStyleElement).sheet as CSSStyleSheet
          let cssText = ''
          for (const rule of sheet.cssRules) {
            cssText += rule.cssText + '\n'
          }
          embedded.set(element, this.generateEmbeddedCSS(window.location.href, cssText))
        } else {
          embedded.set(
            element,
            this.getURL(element.getAttribute('href')!).then(xhr => {
              if (!xhr.response) return ''
              this._addDynamicPseudoClassRulesToPage()
              var css = textDecoder.decode(xhr.response)
              return this.generateEmbeddedCSS(window.location.href, css)
            })
          )
        }
      }
    }
    if (foundNewStyles) this._addDynamicPseudoClassRulesToPage()
    return Promise.all(embedded.values())
  }

  // Generate and returns a dataurl for the given url
  static async getDataURL(url:string): Promise<string> {
    const xhr = await this.getURL(url)
    const arr = new Uint8Array(xhr.response)
    const contentType = xhr.getResponseHeader('Content-Type')?.split(';')[0]
    if (contentType == 'text/css') {
      let css = textDecoder.decode(arr)
      css = await this.generateEmbeddedCSS(url, css)
      const base64 = window.btoa(css)
      if (base64.length > 0) {
        return 'data:' + contentType + ';base64,' + base64
      } else {
        return ''
      }
    } else {
      return 'data:' + contentType + ';base64,' + this.arrayBufferToBase64(arr)
    }
  }

  static updateInputAttributes(element: Element) {
    if (element.matches('input')) this._updateInputAttribute(element as HTMLInputElement)
    for (const e of element.getElementsByTagName('input')) this._updateInputAttribute(e)
  }

  static _updateInputAttribute(inputElement: HTMLInputElement) {
    if (inputElement.hasAttribute('checked')) {
      if (!inputElement.checked) inputElement.removeAttribute('checked')
    } else {
      if (inputElement.checked) inputElement.setAttribute('checked', '')
    }
    if (inputElement.getAttribute('value') !== inputElement.value) {
      inputElement.setAttribute('value', inputElement.value)
    }
  }

  // static getPsuedoAttributes(element: Element) {
  //   // const layer = this.layers.get(element)
  //   return (
  //     `${this.containsHover(element) ? `${this.HOVER_ATTRIBUTE}="" ` : ' '}` +
  //     `${element.contains(this.focusElement) ? `${this.FOCUS_ATTRIBUTE}="" ` : ' '}` +
  //     `${element.contains(this.activeElement) ? `${this.ACTIVE_ATTRIBUTE}="" ` : ' '}` +
  //     `${element.contains(this.targetElement) ? `${this.TARGET_ATTRIBUTE}="" ` : ' '}`
  //   )
  // }

  static isBlankImage(imageData:Uint8ClampedArray) {
      const pixelBuffer = new Uint32Array(imageData.buffer)
      return !pixelBuffer.some(color => color !== 0);
  }
}
