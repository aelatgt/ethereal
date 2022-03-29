import { WebLayer } from './WebLayer';
import { Matrix4 } from 'three';
import { ResizeObserver as Polyfill } from '@juggle/resize-observer';
const ResizeObserver = self.ResizeObserver || Polyfill;
function ensureElementIsInDocument(element, options) {
    if (document.contains(element)) {
        return element;
    }
    const container = document.createElement('div');
    container.id = element.id ? 'container-' + element.id : 'container';
    container.setAttribute(WebRenderer.RENDERING_CONTAINER_ATTRIBUTE, '');
    container.style.visibility = 'hidden';
    container.style.pointerEvents = 'none';
    container.style.touchAction = 'none';
    const containerShadow = container.attachShadow({ mode: 'open' });
    containerShadow.appendChild(element);
    document.documentElement.appendChild(container);
    return container;
}
const scratchMat1 = new Matrix4();
const scratchMat2 = new Matrix4();
export class WebRenderer {
    static ATTRIBUTE_PREFIX = 'xr';
    static get HOVER_ATTRIBUTE() { return this.ATTRIBUTE_PREFIX + '-hover'; }
    static get ACTIVE_ATTRIBUTE() { return this.ATTRIBUTE_PREFIX + '-active'; }
    static get FOCUS_ATTRIBUTE() { return this.ATTRIBUTE_PREFIX + '-focus'; }
    static get TARGET_ATTRIBUTE() { return this.ATTRIBUTE_PREFIX + '-target'; }
    static get LAYER_ATTRIBUTE() { return this.ATTRIBUTE_PREFIX + '-layer'; }
    static get PIXEL_RATIO_ATTRIBUTE() { return this.ATTRIBUTE_PREFIX + '-pixel-ratio'; }
    static get RENDERING_ATTRIBUTE() { return this.ATTRIBUTE_PREFIX + '-rendering'; }
    static get RENDERING_PARENT_ATTRIBUTE() { return this.ATTRIBUTE_PREFIX + '-rendering-parent'; }
    static get RENDERING_CONTAINER_ATTRIBUTE() { return this.ATTRIBUTE_PREFIX + '-rendering-container'; }
    static get RENDERING_INLINE_ATTRIBUTE() { return this.ATTRIBUTE_PREFIX + '-rendering-inline'; }
    static get RENDERING_DOCUMENT_ATTRIBUTE() { return this.ATTRIBUTE_PREFIX + '-rendering-document'; }
    static serializer = new XMLSerializer();
    // static containsHover(element: Element) {
    //   for (const t of this.virtualHoverElements) {
    //     if (element.contains(t)) return true
    //   }
    //   return false
    // }
    static getPsuedoAttributes(states) {
        return (`${states.hover ? `${this.HOVER_ATTRIBUTE}="" ` : ' '}` +
            `${states.focus ? `${this.FOCUS_ATTRIBUTE}="" ` : ' '}` +
            `${states.active ? `${this.ACTIVE_ATTRIBUTE}="" ` : ' '}` +
            `${states.target ? `${this.TARGET_ATTRIBUTE}="" ` : ' '}`);
    }
    static rootLayers = new Map();
    static layers = new Map();
    static focusElement = null; // i.e., element is ready to receive input
    static activeElement = null; // i.e., button element is being "pressed down"
    static targetElement = null; // i.e., the element whose ID matches the url #hash
    static mutationObservers = new Map();
    static resizeObservers = new Map();
    // static readonly virtualHoverElements = new Set<Element>()
    static rootNodeObservers = new Map();
    static containerStyleElement;
    static initRootNodeObservation(element) {
        const document = element.ownerDocument;
        const rootNode = element.getRootNode();
        const styleRoot = 'head' in rootNode ? rootNode.head : rootNode;
        if (this.rootNodeObservers.get(rootNode))
            return;
        if (!this.containerStyleElement) {
            const containerStyle = this.containerStyleElement = document.createElement('style');
            document.head.appendChild(containerStyle);
            containerStyle.innerHTML = `
        [${WebRenderer.RENDERING_CONTAINER_ATTRIBUTE}] {
          all: initial;
          position: fixed;
          width: 100%;
          height: 100%;
          top: 0px;
        }
      `;
        }
        const renderingStyles = `
    :host > [${WebRenderer.LAYER_ATTRIBUTE}] {
      display: flow-root;
    }

    [${WebRenderer.RENDERING_DOCUMENT_ATTRIBUTE}] * {
      transform: none !important;
    }

    [${WebRenderer.RENDERING_ATTRIBUTE}], [${WebRenderer.RENDERING_ATTRIBUTE}] * {
      visibility: visible !important;
      /* the following is a hack for Safari; 
      without some kind of css filter active, 
      any box-shadow effect will fail to rasterize properly */
      filter: opacity(1);
    }
    
    [${WebRenderer.RENDERING_ATTRIBUTE}] [${WebRenderer.LAYER_ATTRIBUTE}], [${WebRenderer.RENDERING_ATTRIBUTE}] [${WebRenderer.LAYER_ATTRIBUTE}] * {
      visibility: hidden !important;
    }

    [${WebRenderer.RENDERING_ATTRIBUTE}] {
      position: relative !important;
      top: 0 !important;
      left: 0 !important;
      float: left !important; /* prevent margin-collapse in SVG foreign-element for Webkit */
      box-sizing:border-box;
      min-width:var(--x-width);
      min-height:var(--x-height);
    }
    
    [${WebRenderer.RENDERING_INLINE_ATTRIBUTE}] {
      top: var(--x-inline-top) !important;
      width:auto !important;
    }

    [${WebRenderer.RENDERING_PARENT_ATTRIBUTE}] {
      transform: none !important;
      left: 0 !important;
      top: 0 !important;
      margin: 0 !important;
      border:0 !important;
      border-radius:0 !important;
      width: 100% !important;
      height:100% !important;
      padding:0 !important;
      visibility:hidden !important;
      filter:none !important;
    }
    
    [${WebRenderer.RENDERING_PARENT_ATTRIBUTE}]::before, [${WebRenderer.RENDERING_PARENT_ATTRIBUTE}]::after {
      content:none !important;
      box-shadow:none !important;
    }
    `;
        const style = document.createElement('style');
        style.textContent = renderingStyles;
        styleRoot.append(style); // otherwise stylesheet is not created
        if (rootNode === document) {
            let previousHash = '';
            const onHashChange = () => {
                if (previousHash != window.location.hash) {
                    if (window.location.hash) {
                        try {
                            // @ts-ignore()
                            this.targetElement = rootNode.querySelector(window.location.hash);
                        }
                        catch { }
                    }
                }
                previousHash = window.location.hash;
            };
            window.addEventListener('hashchange', onHashChange, false);
            onHashChange();
            window.addEventListener('focusin', (evt) => {
                // @ts-ignore
                this.focusElement = evt.target;
            }, false);
            window.addEventListener('focusout', (evt) => {
                // @ts-ignore
                this.focusElement = null;
            }, false);
            window.addEventListener('load', (event) => {
                setNeedsRefreshOnAllLayers();
            });
        }
        const setNeedsRefreshOnAllLayers = () => {
            for (const [e, l] of this.layers)
                l.needsRefresh = true;
        };
        const setNeedsRefreshOnStyleLoad = (node) => {
            var nodeName = node.nodeName.toUpperCase();
            if (STYLE_NODES.indexOf(nodeName) !== -1)
                node.addEventListener("load", setNeedsRefreshOnAllLayers);
        };
        const STYLE_NODES = ["STYLE", "LINK"];
        const observer = new MutationObserver((mutations) => {
            for (const m of mutations) {
                if (STYLE_NODES.indexOf(m.target.nodeName.toUpperCase()) !== -1) {
                    setNeedsRefreshOnAllLayers();
                    // this.embeddedCSS.get(document)?.delete(m.target as Element)
                }
                for (const node of m.addedNodes)
                    setNeedsRefreshOnStyleLoad(node);
            }
        });
        observer.observe(document, {
            childList: true,
            attributes: true,
            characterData: true,
            subtree: true,
            attributeOldValue: true,
            characterDataOldValue: true
        });
        this.rootNodeObservers.set(rootNode, observer);
    }
    static setLayerNeedsRefresh(layer) {
        layer.needsRefresh = true;
    }
    static createLayerTree(element, options, eventCallback) {
        if (WebRenderer.getClosestLayer(element))
            throw new Error('A root WebLayer for the given element already exists');
        const containerElement = ensureElementIsInDocument(element, options);
        WebRenderer.initRootNodeObservation(element);
        const observer = new MutationObserver(WebRenderer._handleMutations);
        this.mutationObservers.set(element, observer);
        this.startMutationObserver(element);
        const resizeObserver = new ResizeObserver(records => {
            for (const record of records) {
                const layer = this.getClosestLayer(record.target);
                layer.traverseLayers(WebRenderer.setLayerNeedsRefresh);
                layer.traverseParentLayers(WebRenderer.setLayerNeedsRefresh);
            }
        });
        resizeObserver.observe(element);
        this.resizeObservers.set(element, resizeObserver);
        element.addEventListener('input', this._triggerRefresh, { capture: true });
        element.addEventListener('keydown', this._triggerRefresh, { capture: true });
        element.addEventListener('submit', this._triggerRefresh, { capture: true });
        element.addEventListener('change', this._triggerRefresh, { capture: true });
        element.addEventListener('focus', this._triggerRefresh, { capture: true });
        element.addEventListener('blur', this._triggerRefresh, { capture: true });
        element.addEventListener('transitionend', this._triggerRefresh, { capture: true });
        const layer = new WebLayer(options.manager, element, eventCallback);
        this.rootLayers.set(element, layer);
        return containerElement;
    }
    static disposeLayer(layer) {
        if (this.rootLayers.has(layer.element)) {
            this.rootLayers.delete(layer.element);
            const observer = this.mutationObservers.get(layer.element);
            observer.disconnect();
            this.mutationObservers.delete(layer.element);
            const resizeObserver = this.resizeObservers.get(layer.element);
            resizeObserver.disconnect();
            this.resizeObservers.delete(layer.element);
            layer.element.removeEventListener('input', this._triggerRefresh, { capture: true });
            layer.element.removeEventListener('keydown', this._triggerRefresh, { capture: true });
            layer.element.removeEventListener('submit', this._triggerRefresh, { capture: true });
            layer.element.removeEventListener('change', this._triggerRefresh, { capture: true });
            layer.element.removeEventListener('focus', this._triggerRefresh, { capture: true });
            layer.element.removeEventListener('blur', this._triggerRefresh, { capture: true });
            layer.element.removeEventListener('transitionend', this._triggerRefresh, { capture: true });
        }
    }
    static getClosestLayer(element, inclusive = true) {
        let targetElement = inclusive ? element : element.parentElement;
        const closestLayerElement = targetElement?.closest(`[${WebRenderer.LAYER_ATTRIBUTE}]`);
        if (!closestLayerElement) {
            const host = element?.getRootNode().host;
            if (host) {
                return this.getClosestLayer(host, inclusive);
            }
        }
        return this.layers.get(closestLayerElement);
    }
    static parseCSSTransform(computedStyle, width, height, pixelSize, out = new Matrix4()) {
        const transform = computedStyle.transform;
        const transformOrigin = computedStyle.transformOrigin;
        if (transform.indexOf('matrix(') == 0) {
            out.identity();
            var mat = transform
                .substring(7, transform.length - 1)
                .split(', ')
                .map(parseFloat);
            out.elements[0] = mat[0];
            out.elements[1] = mat[1];
            out.elements[4] = mat[2];
            out.elements[5] = mat[3];
            out.elements[12] = mat[4];
            out.elements[13] = mat[5];
        }
        else if (transform.indexOf('matrix3d(') == 0) {
            var mat = transform
                .substring(9, transform.length - 1)
                .split(', ')
                .map(parseFloat);
            out.fromArray(mat);
        }
        else {
            return null;
        }
        if (out.elements[0] === 0)
            out.elements[0] = 1e-15;
        if (out.elements[5] === 0)
            out.elements[5] = 1e-15;
        if (out.elements[10] === 0)
            out.elements[10] = 1e-15;
        out.elements[12] *= pixelSize;
        out.elements[13] *= pixelSize * -1;
        var origin = transformOrigin.split(' ').map(parseFloat);
        var ox = (origin[0] - width / 2) * pixelSize;
        var oy = (origin[1] - height / 2) * pixelSize * -1;
        var oz = origin[2] || 0;
        var T1 = scratchMat1.identity().makeTranslation(-ox, -oy, -oz);
        var T2 = scratchMat2.identity().makeTranslation(ox, oy, oz);
        for (const e of out.elements) {
            if (isNaN(e))
                return null;
        }
        return out.premultiply(T2).multiply(T1);
    }
    static pauseMutationObservers() {
        const mutationObservers = WebRenderer.mutationObservers.values();
        for (const m of mutationObservers) {
            WebRenderer._handleMutations(m.takeRecords());
            m.disconnect();
        }
    }
    static resumeMutationObservers() {
        for (const [e] of WebRenderer.mutationObservers) {
            this.startMutationObserver(e);
        }
    }
    static startMutationObserver(element) {
        const observer = WebRenderer.mutationObservers.get(element);
        observer.observe(element, {
            attributes: true,
            childList: true,
            subtree: true,
            characterData: true,
            characterDataOldValue: true,
            attributeOldValue: true
        });
    }
    static _handleMutations = (records) => {
        for (const record of records) {
            if (record.type === 'attributes') {
                const target = record.target;
                if (target.getAttribute(record.attributeName) === record.oldValue) {
                    continue;
                }
            }
            if (record.type === 'characterData') {
                const target = record.target;
                if (target.data === record.oldValue) {
                    continue;
                }
                if (target.parentElement?.tagName.toLowerCase() === 'style') {
                    // if the style tag has changed, we need to remove it from the embedded styles cache
                    // to reprocess later
                    const style = target.parentElement;
                    const rootNode = style.getRootNode();
                    this.embeddedStyles.get(rootNode)?.delete(style);
                }
            }
            const target = record.target.nodeType === Node.ELEMENT_NODE
                ? record.target
                : record.target.parentElement;
            if (!target)
                continue;
            const layer = WebRenderer.getClosestLayer(target);
            if (!layer)
                continue;
            if (record.type === 'attributes' && record.attributeName === 'class') {
                const oldClasses = record.oldValue ? record.oldValue : '';
                const currentClasses = record.target.className;
                if (oldClasses === currentClasses)
                    continue;
            }
            // layer.traverseParentLayers(WebRenderer.setLayerNeedsRefresh) // may be needed to support :focus-within() and future :has() selector support
            layer.parentLayer
                ? layer.parentLayer.traverseChildLayers(WebRenderer.setLayerNeedsRefresh)
                : layer.traverseLayers(WebRenderer.setLayerNeedsRefresh);
        }
    };
    static _triggerRefresh = async (e) => {
        const layer = WebRenderer.getClosestLayer(e.target);
        // WebRenderer.updateInputAttributes(e.target as any)
        if (layer) {
            // layer.traverseParentLayers(WebRenderer.setLayerNeedsRefresh) // may be needed to support :focus-within() and future :has() selector support
            layer.parentLayer
                ? layer.parentLayer.traverseChildLayers(WebRenderer.setLayerNeedsRefresh)
                : layer.traverseLayers(WebRenderer.setLayerNeedsRefresh);
        }
    };
    // private static _addDynamicPseudoClassRules(doc:Document|ShadowRoot) {
    //   const sheets = doc.styleSheets
    //   for (let i = 0; i < sheets.length; i++) {
    //     try {
    //       const sheet = sheets[i] as CSSStyleSheet
    //       const rules = sheet.cssRules
    //       if (!rules) continue
    //       const newRules = []
    //       for (var j = 0; j < rules.length; j++) {
    //         if (rules[j].cssText.indexOf(':hover') > -1) {
    //           newRules.push(rules[j].cssText.replace(new RegExp(':hover', 'g'), `[${WebRenderer.HOVER_ATTRIBUTE}]`))
    //         }
    //         if (rules[j].cssText.indexOf(':active') > -1) {
    //           newRules.push(
    //             rules[j].cssText.replace(new RegExp(':active', 'g'), `[${WebRenderer.ACTIVE_ATTRIBUTE}]`)
    //           )
    //         }
    //         if (rules[j].cssText.indexOf(':focus') > -1) {
    //           newRules.push(rules[j].cssText.replace(new RegExp(':focus', 'g'), `[${WebRenderer.FOCUS_ATTRIBUTE}]`))
    //         }
    //         if (rules[j].cssText.indexOf(':target') > -1) {
    //           newRules.push(
    //             rules[j].cssText.replace(new RegExp(':target', 'g'), `[${WebRenderer.TARGET_ATTRIBUTE}]`)
    //           )
    //         }
    //         var idx = newRules.indexOf(rules[j].cssText)
    //         if (idx > -1) {
    //           newRules.splice(idx, 1)
    //         }
    //       }
    //       for (var j = 0; j < newRules.length; j++) {
    //         sheet.insertRule(newRules[j])
    //       }
    //     } catch (e) {}
    //   }
    // }
    static arrayBufferToBase64(bytes) {
        var binary = '';
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }
    static attributeCSS(name, value) {
        return value ? `[${name}]=${value}` : `[${name}]`;
    }
    static attributeHTML(name, value) {
        return value ? `${name}="${value}"` : `${name}=""`;
    }
    static async generateEmbeddedCSS(url, css) {
        let found;
        const promises = [];
        // Add classes for psuedo-classes
        css = css.replace(new RegExp(':hover', 'g'), this.attributeCSS(this.HOVER_ATTRIBUTE));
        css = css.replace(new RegExp(':active', 'g'), this.attributeCSS(this.ACTIVE_ATTRIBUTE));
        css = css.replace(new RegExp(':focus', 'g'), this.attributeCSS(this.FOCUS_ATTRIBUTE));
        css = css.replace(new RegExp(':target', 'g'), this.attributeCSS(this.TARGET_ATTRIBUTE));
        // Replace all urls in the css
        const regEx = RegExp(/(@import.*?["']([^"']+)["'].*?|url\((?!['"]?(?:data):)['"]?([^'"\)]*)['"]?\))/gi);
        while ((found = regEx.exec(css))) {
            const isCSSImport = !!found[2];
            const accept = isCSSImport ? 'type/css' : undefined;
            const resourceURL = found[2] || found[3];
            promises.push(this.getDataURL(new URL(resourceURL, url).href, accept).then(dataURL => {
                css = css.replace(resourceURL, dataURL);
            }));
        }
        await Promise.all(promises);
        return css;
    }
    static embeddedStyles = new Map();
    static fontStyles = new Map();
    static async getAllEmbeddedStyles(el) {
        const rootNode = el.getRootNode();
        const embedded = this.embeddedStyles.get(rootNode) || new Map();
        this.embeddedStyles.set(rootNode, embedded);
        const styleElements = Array.from(rootNode.querySelectorAll("style, link[type='text/css'], link[rel='stylesheet']"));
        const inShadow = el.getRootNode() instanceof ShadowRoot;
        // let foundNewStyles = false
        for (const element of styleElements) {
            if (!embedded.has(element)) {
                // foundNewStyles = true
                embedded.set(element, new Promise(resolve => {
                    if (element.tagName.toLowerCase() === 'style') {
                        resolve(element.textContent || '');
                    }
                    else {
                        const link = element;
                        resolve(this.getEmbeddedCSS(link.href));
                    }
                }).then((cssText) => {
                    const regEx = RegExp(/@font-face[^{]*{([^{}]|{[^{}]*})*}/gi);
                    const fontRules = cssText.match(regEx);
                    // if we are inside shadow dom, we have to clone the fonts
                    // into the light dom to load fonts in Chrome/Firefox
                    if (inShadow && fontRules) {
                        for (const rule of fontRules) {
                            if (this.fontStyles.has(rule))
                                continue;
                            const fontStyle = document.createElement('style');
                            fontStyle.innerHTML = fontRules.reduce((r, s) => s + '\n\n' + r, '');
                            document.head.appendChild(fontStyle);
                            this.fontStyles.set(rule, fontStyle);
                            embedded.set(fontStyle, Promise.resolve(''));
                        }
                    }
                    return this.generateEmbeddedCSS(window.location.href, cssText);
                }));
            }
        }
        // if (foundNewStyles) this._addDynamicPseudoClassRules(rootNode)
        return Promise.all(embedded.values());
    }
    static deleteEmbeddedStyle(style) {
        const rootNode = style.getRootNode();
        const embedded = this.embeddedStyles.get(rootNode);
        embedded?.delete(style);
    }
    // Generate and returns a dataurl for the given url
    static dataURLMap = new Map();
    static async getDataURL(url, accept) {
        if (url.startsWith('data'))
            return url;
        if (this.dataURLMap.has(url))
            return this.dataURLMap.get(url);
        const dataURLPromise = new Promise(async (resolveDataURL) => {
            const res = await fetch(url, accept ? { headers: { accept } } : undefined);
            const contentType = res.headers.get('content-type');
            if (contentType == 'text/css') {
                const css = await this.generateEmbeddedCSS(url, await res.text());
                this.embeddedCSSMap.set(url, css);
                resolveDataURL('data:' + contentType + ';base64,' + window.btoa(css));
            }
            else {
                const buffer = new Uint8Array(await res.arrayBuffer());
                resolveDataURL('data:' + contentType + ';base64,' + this.arrayBufferToBase64(buffer));
            }
        });
        this.dataURLMap.set(url, dataURLPromise);
        return dataURLPromise;
    }
    static embeddedCSSMap = new Map();
    static async getEmbeddedCSS(url) {
        if (this.embeddedCSSMap.has(url))
            return this.embeddedCSSMap.get(url);
        const res = await fetch(url, { headers: { 'accept': 'text/css' } });
        const css = await this.generateEmbeddedCSS(url, await res.text());
        this.embeddedCSSMap.set(url, css);
        return this.embeddedCSSMap.get(url);
    }
    static updateInputAttributes(element) {
        if (element.matches('input'))
            this._updateInputAttribute(element);
        for (const e of element.getElementsByTagName('input'))
            this._updateInputAttribute(e);
    }
    static _updateInputAttribute(inputElement) {
        if (inputElement.hasAttribute('checked')) {
            if (!inputElement.checked)
                inputElement.removeAttribute('checked');
        }
        else {
            if (inputElement.checked)
                inputElement.setAttribute('checked', '');
        }
        if (inputElement.getAttribute('value') !== inputElement.value) {
            inputElement.setAttribute('value', inputElement.value);
        }
    }
    static isBlankImage(imageData) {
        const pixelBuffer = new Uint32Array(imageData.buffer);
        return !pixelBuffer.some(color => color !== 0);
    }
}
