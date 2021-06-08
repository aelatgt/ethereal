// Based on https://github.com/cburgmer/xmlserializer 

function removeInvalidCharacters(content:string) {
    // See http://www.w3.org/TR/xml/#NT-Char for valid XML 1.0 characters
    return content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
}

function serializeAttributeValue (value:string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
}

function serializeTextContent (content:string) {
    return content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
}

export function serializeAttribute (name:string, value:string) {
    return ' ' + name + '="' + serializeAttributeValue(value) + '"'
}

function getTagName(node:Element) {
    var tagName = node.tagName
    // Aid in serializing of original HTML documents
    if (node.namespaceURI === 'http://www.w3.org/1999/xhtml') {
        tagName = tagName.toLowerCase()
    }
    return tagName
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

function serializeChildren(node:Element, options:Options) {
    let output = ''
    for (const n of node.childNodes) output += nodeTreeToXHTML(n, options)
    return output
}

function serializeTag(node:Element, options:Options) {
    let output = '<' + getTagName(node)
    output += serializeNamespace(node, options.depth === 0)
    
    for (const attr of node.attributes) {
        output += serializeAttribute(attr.name, attr.value)
    }

    if (node.childNodes.length > 0) {
        options.depth++
        output += '>'
        output += serializeChildren(node, options)
        output += '</' + getTagName(node) + '>'
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

function nodeTreeToXHTML(node:Node, options:Options) : string {
    const replaced = options.replacer?.(node)
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
    replacer?:(node:Node)=>string|void
}

export function serializeToString(node:Element, replacer:Options['replacer']) {
    return removeInvalidCharacters(nodeTreeToXHTML(node, {depth: 0, replacer}))
}