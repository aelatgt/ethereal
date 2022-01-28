// Based on https://github.com/cburgmer/xmlserializer 

import { WebLayer } from "./WebLayer";
import { WebRenderer } from "./WebRenderer";

function removeInvalidCharacters(content:string) {
    // See http://www.w3.org/TR/xml/#NT-Char for valid XML 1.0 characters
    return content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
}

export function serializeAttributeValue (value:string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
}

export function serializeTextContent (content:string) {
    return content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
}

export function serializeAttribute (name:string, value:string) {
    return ' ' + name + '="' + serializeAttributeValue(value) + '"'
}

function serializeNamespace(node:Element, isRootNode:boolean) {
    const nodeHasXmlnsAttr = node.hasAttribute('xmlns')
    // Serialize the namespace as an xmlns attribute whenever the element
    // doesn't already have one and the inherited namespace does not match
    // the element's namespace.
    if (!nodeHasXmlnsAttr &&
        (isRootNode ||
            node.namespaceURI !== node.parentElement!.namespaceURI)) {
        return ' xmlns="' + node.namespaceURI + '"'
    } else {
        return ''
    }
}

async function serializeChildren(node:Element, options:Options) {
    let output = []
    for (const n of node.childNodes) output.push(nodeTreeToXHTML(n, options))
    return Promise.all(output).then(output => output.join(''))
}

async function serializeTag(node:Element, options:Options) {
    const tagName = node.tagName.toLowerCase()

    let output = '<' + tagName
    output += serializeNamespace(node, options.depth === 0)

    const childrenHTML = serializeChildren(node, options)
    
    for (const attr of node.attributes) {
        if (attr.name === 'src') {
            if (node.nodeName === 'IMG') {
                output += serializeAttribute(attr.name, await WebRenderer.getDataURL(attr.value))
            } else {
                output += serializeAttribute('data-src', attr.value)
            }
        } else {
            output += serializeAttribute(attr.name, attr.value)
        }
    }

    if (node.childNodes.length > 0) {
        options.depth++
        output += '>'
        output += await childrenHTML
        output += '</' + tagName + '>'
        options.depth--
    } else {
        output += '/>'
    }
    return output
}

function serializeText(node:Text) {
    var text = node.nodeValue || ''
    return serializeTextContent(text)
}

function serializeComment(node:Comment) {
    return '<!--' +
        node.data
        .replace(/-/g, '&#45;') +
        '-->'
}

function serializeCDATA(node:Node) {
    return '<![CDATA[' + node.nodeValue + ']]>'
}

async function nodeTreeToXHTML(node:Node, options:Options) : Promise<string> {
    const replaced = options.replacer?.(options.target, node)
    if (typeof replaced === 'string') {
        return replaced
    } else if (node.nodeName === '#document' ||
        node.nodeName === '#document-fragment') {
        return serializeChildren(node as Element, options)
    } else if ((node as Element).tagName) {
        return serializeTag(node as Element, options)
    } else if (node.nodeName === '#text') {
        return serializeText(node as Text)
    } else if (node.nodeName === '#comment') {
        // return serializeComment(node as Comment)
    } else if (node.nodeName === '#cdata-section') {
        return serializeCDATA(node)
    }
    return ''
}

interface Options {
    depth:number,
    target: Node,
    replacer?:(target:Node, node:Node)=>string|void
}

export async function serializeToString(node:Element, replacer:Options['replacer'] = serializationReplacer) {
    return removeInvalidCharacters(await nodeTreeToXHTML(node, {depth: 0, target:node, replacer}))
}

export const serializationReplacer = (target:Node, node:Node) => {
    if (target === node) return
    const element = node as Element
    const tagName = element.tagName?.toLowerCase()
    if (tagName === 'style' || tagName === 'link') return ''
    const layer = WebRenderer.layers.get(element)
    if (layer) {
    const bounds = layer.domMetrics.bounds
    let attributes = ''
    // in order to increase our cache hits, don't serialize nested layers
    // instead, replace nested layers with an invisible placerholder that is the same width/height
    // downsides of this are that we lose subpixel precision. To avoid any rendering issues,
    // each sublayer should have explictly defined sizes (no fit-content or auto sizing). 
    const extraStyle = `box-sizing:border-box;max-width:${bounds.width}px;max-height:${bounds.height}px;min-width:${bounds.width}px;min-height:${bounds.height}px;visibility:hidden`
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

// Get all parents of the embeded html as these can effect the resulting styles
export function getParentsHTML(layer: WebLayer, fullWidth:number, fullHeight:number, pixelRatio:number) {
    const opens = []
    const closes = []
    const metrics = layer.domMetrics
    let parent = layer.element.parentElement
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
                ? ` ${WebRenderer.RENDERING_DOCUMENT_ATTRIBUTE}="" xmlns="http://www.w3.org/1999/xhtml"
                    style="${getPixelRatioStyling(pixelRatio)} --x-width:${metrics.bounds.width}px; --x-height:${metrics.bounds.height}px; --x-inline-top:${metrics.border.top + metrics.margin.top + metrics.padding.top}px; ${style} width:${fullWidth}px; height:${fullHeight}px;" `
                : ` style="${style}" ${WebRenderer.RENDERING_PARENT_ATTRIBUTE}="" `) +
            attributes +
            ' >'
        opens.unshift(open)
        const close = '</' + tag + '>'
        closes.push(close)
        if (tag == 'html') break
    } while ((parent = parent !== document.documentElement ? parent.parentElement || document.documentElement : null))
    return [opens.join(''), closes.join('')]
}


/**
 * Get cross-compatible rasterization styles for scaling up web content
 * 
 * When rasterising an image w/ SVG data url into a Canvas;
 * Chrome scales the SVG web content before rasterizing (pretty)
 * Safari scales the SVG web content *after* rasterizing (not pretty)
 * Same result if using `transform: scale(x)` inside the SVG web content
 * 
 * Solution: use `zoom:x` instead of `transform: scale(x)`, 
 * as this allows Safari and Chrome to correctly scale up the web content before rasterizing it.
 * 
 * BUT: Firefox does not support zoom style :(
 * Thankfully, Firefox rasterizes properly with `transform: scale(x)`
 * 
 * Since Safari is the odd one out, we'll test for that. 
 * 
 */
 function getPixelRatioStyling(pixelRatio:number) {
    const isSafari = isSafariRegex.test(navigator.userAgent)
    if (isSafari) return `zoom:${pixelRatio}; `
    return `transform: scale(${pixelRatio}); transform-origin: top left; `
  }
  
  const isSafariRegex = /^((?!chrome|android).)*safari/i