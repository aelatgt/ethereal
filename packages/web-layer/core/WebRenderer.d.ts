import { EventCallback, WebLayer } from './WebLayer';
import { WebLayerManagerBase } from './WebLayerManagerBase';
export interface WebLayerOptions {
    manager: WebLayerManagerBase;
    /**
     * Inject and apply only these stylesheets.
     * This only has an effect when passing a detached DOM element
     * as the root of the Layer tree. This dom element will be
     * hosted inside an iframe, along with the provided stylesheets,
     * for style isolation.
     */
    styleSheetURLs?: string[];
}
export declare type RequestIdleCallbackDeadline = {
    readonly didTimeout: boolean;
    timeRemaining: () => number;
};
export declare class WebRenderer {
    static ATTRIBUTE_PREFIX: string;
    static get HOVER_ATTRIBUTE(): string;
    static get ACTIVE_ATTRIBUTE(): string;
    static get FOCUS_ATTRIBUTE(): string;
    static get TARGET_ATTRIBUTE(): string;
    static get LAYER_ATTRIBUTE(): string;
    static get PIXEL_RATIO_ATTRIBUTE(): string;
    static get RENDERING_ATTRIBUTE(): string;
    static get RENDERING_PARENT_ATTRIBUTE(): string;
    static get RENDERING_CONTAINER_ATTRIBUTE(): string;
    static get RENDERING_INLINE_ATTRIBUTE(): string;
    static get RENDERING_DOCUMENT_ATTRIBUTE(): string;
    static serializer: XMLSerializer;
    static getPsuedoAttributes(states: typeof WebLayer.prototype.desiredPseudoState): string;
    static rootLayers: Map<Element, WebLayer>;
    static layers: Map<Element, WebLayer>;
    static readonly focusElement: HTMLElement | null;
    static readonly activeElement: Element | null;
    static readonly targetElement: Element | null;
    private static mutationObservers;
    private static resizeObservers;
    static rootNodeObservers: Map<Document | ShadowRoot, MutationObserver>;
    private static containerStyleElement;
    static dataURLMap: Map<string, Promise<string>>;
    static embeddedCSSMap: Map<string, string>;
    static embeddedStyles: Map<Document | ShadowRoot, Map<Element, Promise<string>>>;
    static fontStyles: Map<string, HTMLStyleElement>;
    static initRootNodeObservation(element: Element): void;
    static setLayerNeedsRefresh(layer: WebLayer): void;
    static createLayerTree(element: Element, options: WebLayerOptions, eventCallback: EventCallback): Element;
    static disposeLayer(layer: WebLayer): void;
    static getClosestLayer(element: Element, inclusive?: boolean): WebLayer | undefined;
    static pauseMutationObservers(): void;
    static resumeMutationObservers(): void;
    private static startMutationObserver;
    private static _handleMutations;
    private static _triggerRefresh;
    static arrayBufferToBase64(bytes: Uint8Array): string;
    static attributeCSS(name: string, value?: string): string;
    static attributeHTML(name: string, value?: string): string;
    static deleteEmbeddedStyle(style: HTMLStyleElement): void;
    static updateInputAttributes(element: Element): void;
    static _updateInputAttribute(inputElement: HTMLInputElement): void;
    static isBlankImage(imageData: Uint8ClampedArray): boolean;
}
