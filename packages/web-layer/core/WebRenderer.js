import { WebLayer } from './WebLayer';
import { ResizeObserver as Polyfill } from '@juggle/resize-observer';
const ResizeObserver = self.ResizeObserver || Polyfill;
function ensureElementIsInDocument(element, options) {
    if (document.contains(element)) {
        return element;
    }
    const container = document.createElement('div');
    container.id = element.id ? 'container-' + element.id : '';
    container.setAttribute(WebRenderer.RENDERING_CONTAINER_ATTRIBUTE, '');
    container.style.visibility = 'hidden';
    container.style.pointerEvents = 'none';
    container.style.touchAction = 'none';
    const containerShadow = container.attachShadow({ mode: 'open' });
    containerShadow.appendChild(element);
    document.documentElement.appendChild(container);
    return container;
}
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
    static dataURLMap = new Map();
    static embeddedCSSMap = new Map();
    static embeddedStyles = new Map();
    static fontStyles = new Map();
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
    a {
      color: blue;
      text-decoration: underline;
    }

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
                    this.embeddedStyles.get(document)?.delete(m.target);
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
    static deleteEmbeddedStyle(style) {
        const rootNode = style.getRootNode();
        const embedded = this.embeddedStyles.get(rootNode);
        embedded?.delete(style);
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
