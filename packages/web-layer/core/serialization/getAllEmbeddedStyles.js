import { WebRenderer } from "../WebRenderer";
import { generateEmbeddedCSS, getEmbeddedCSS } from "./generateEmbeddedCSS";
export async function getAllEmbeddedStyles(el) {
    const rootNode = el.getRootNode();
    const embedded = WebRenderer.embeddedStyles.get(rootNode) || new Map();
    WebRenderer.embeddedStyles.set(rootNode, embedded);
    const styleElements = Array.from(rootNode.querySelectorAll("style, link[type='text/css'], link[rel='stylesheet']"));
    const inShadow = el.getRootNode() instanceof ShadowRoot;
    // let foundNewStyles = false
    for (const element of styleElements) {
        if (!embedded.has(element)) {
            // foundNewStyles = true
            embedded.set(element, new Promise(resolve => {
                if (element.tagName.toLowerCase() === 'style') {
                    resolve(generateEmbeddedCSS(window.location.href, element.textContent || ''));
                }
                else {
                    const link = element;
                    resolve(getEmbeddedCSS(link.href));
                }
            }).then((cssText) => {
                const regEx = RegExp(/@font-face[^{]*{([^{}]|{[^{}]*})*}/gi);
                const fontRules = cssText.match(regEx);
                // if we are inside shadow dom, we have to clone the fonts
                // into the light dom to load fonts in Chrome/Firefox
                if (inShadow && fontRules) {
                    for (const rule of fontRules) {
                        if (WebRenderer.fontStyles.has(rule))
                            continue;
                        const fontStyle = document.createElement('style');
                        fontStyle.innerHTML = fontRules.reduce((r, s) => s + '\n\n' + r, '');
                        document.head.appendChild(fontStyle);
                        WebRenderer.fontStyles.set(rule, fontStyle);
                        embedded.set(fontStyle, Promise.resolve(''));
                    }
                }
                return cssText;
            }));
        }
    }
    // if (foundNewStyles) this._addDynamicPseudoClassRules(rootNode)
    return Promise.all(embedded.values());
}
