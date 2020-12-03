import { Vector3, Object3D, Mesh, MeshBasicMaterial, MeshDepthMaterial, PlaneGeometry, Ray, Raycaster, Texture, VideoTexture, ClampToEdgeWrapping, RGBADepthPacking, LinearFilter, Matrix4 } from 'three';
// import ResizeObserver from 'resize-observer-polyfill'
// import { NodeParser } from '@speigg/html2canvas/dist/npm/NodeParser'
// import Logger from '@speigg/html2canvas/dist/npm/Logger'
// import CanvasRenderer from '@speigg/html2canvas/dist/npm/renderer/CanvasRenderer'
// import Renderer from '@speigg/html2canvas/dist/npm/Renderer'
// import ResourceLoader from '@speigg/html2canvas/dist/npm/ResourceLoader'
// import { FontMetrics } from '@speigg/html2canvas/dist/npm/Font'
// import {CanvasRenderer as XCanvasRenderer} from 'html2canvas/dist/lib/render/canvas/canvas-renderer'
import { WebRenderer } from '../web-renderer';
import { Bounds, getBounds, getViewportBounds, traverseChildElements, DOM } from '../dom-utils';
const scratchVector = new Vector3();
const scratchVector2 = new Vector3();
const scratchBounds = new Bounds();
const scratchBounds2 = new Bounds();
export class WebLayer3DBase extends Object3D {
    constructor(elementOrHTML, options = {}) {
        super();
        this.options = options;
        this.textures = new Map();
        this.content = new Object3D();
        this.contentMesh = new Mesh(WebLayer3D.GEOMETRY, new MeshBasicMaterial({
            transparent: true,
            alphaTest: 0.001,
            opacity: 1
        }));
        this.cursor = new Object3D();
        this.depthMaterial = new MeshDepthMaterial({
            depthPacking: RGBADepthPacking,
            alphaTest: 0.01
        });
        this.target = new Object3D();
        this.contentTarget = new Object3D();
        this.childLayers = [];
        /**
         * Specifies whether or not this layer's layout
         * should match the layout stored in the `target` object
         *
         * When set to `true`, the target layout should always be applied.
         * When set to `false`, the target layout should never be applied.
         * When set to `'auto'`, the target layout should only be applied
         * when the `parentLayer` is the same as the `parent` object.
         *
         * It is the responsibiltiy of the update callback
         * to follow these rules.
         *
         * Defaults to `auto`
         */
        this.shouldApplyTargetPose = 'auto';
        /**
         * Specifies whether or not the update callback should update
         * the `content` layout to match the layout stored in
         * the `contentTarget` object
         *
         * It is the responsibiltiy of the update callback
         * to follow these rules.
         *
         * Defaults to `true`
         */
        this.shouldApplyContentTargetPose = true;
        this._lastTargetPosition = new Vector3();
        this._lastContentTargetScale = new Vector3(0.01, 0.01, 0.01);
        const element = this.element = typeof elementOrHTML === 'string' ? DOM(elementOrHTML) : elementOrHTML;
        this.name = element.id;
        this._webLayer = WebRenderer.getClosestLayer(element);
        // this.layout.forceBoundsExclusion = true
        // this.layout.innerAutoUpdate = false
        // this.content.layout.forceBoundsExclusion = true
        // this.content.layout.innerAutoUpdate = false
        //     layer.layout.minBounds.min.set(-layer.bounds.width*WebLayer3D.PIXEL_SIZE/2, -layer.bounds.height*WebLayer3D.PIXEL_SIZE/2, 0)
        //     layer.layout.minBounds.max.set(layer.bounds.width*WebLayer3D.PIXEL_SIZE/2, layer.bounds.height*WebLayer3D.PIXEL_SIZE/2, 0)
        // this.layout.relative.min.set(-0.5, 0.5, 0.5)
        // this.content.layout.relative.setFromCenterAndSize(ethereal.V_000, V_111)
        // this.content.layout.fit = 'fill'
        // this.transitioner.duration = 1.2
        // this.transitioner.easing = ethereal.easing.easeInOut
        // this.transitioner.matrixLocal.scale.start.setScalar(0.0001)
        // this.content.transitioner.duration = 1.2
        // this.content.transitioner.easing = ethereal.easing.easeInOut
        // this.content.transitioner.matrixLocal.scale.start.setScalar(0.0001)
        this.add(this.content);
        this.add(this.cursor);
        this.cursor.visible = false;
        // this.cursor.layout.forceBoundsExclusion = true
        this.contentMesh.visible = false;
        this.contentMesh['customDepthMaterial'] = this.depthMaterial;
        WebLayer3D.layersByElement.set(this.element, this);
        WebLayer3D.layersByMesh.set(this.contentMesh, this);
    }
    get currentTexture() {
        if (this._webLayer.element.tagName === 'VIDEO') {
            const video = this._webLayer.element;
            let t = this.textures.get(video);
            if (!t) {
                t = new VideoTexture(video);
                t.wrapS = ClampToEdgeWrapping;
                t.wrapT = ClampToEdgeWrapping;
                t.minFilter = LinearFilter;
                this.textures.set(video, t);
            }
            return t;
        }
        const canvas = this._webLayer.canvas;
        let t = this.textures.get(canvas);
        if (!t) {
            t = new Texture(canvas);
            t.wrapS = ClampToEdgeWrapping;
            t.wrapT = ClampToEdgeWrapping;
            t.minFilter = LinearFilter;
            this.textures.set(canvas, t);
        }
        return t;
    }
    // contentOpacity = this.transitioner.add(
    //   new ethereal.Transitionable({
    //     target: 0,
    //     path: 'contentMesh.material.opacity'
    //   })
    // )
    get needsRefresh() {
        return this._webLayer.needsRefresh;
    }
    set needsRefresh(value) {
        this._webLayer.needsRefresh = value;
    }
    /**
     * Get the hover state
     */
    get hover() {
        return WebRenderer.containsHover(this.element);
    }
    /**
     * Get the layer depth (distance from this layer's element and the parent layer's element)
     */
    get depth() {
        return this._webLayer.depth;
    }
    /**
     *
     */
    get index() {
        return this.parentLayer ? this.parentLayer.childLayers.indexOf(this) : 0;
    }
    /** If true, this layer needs to be removed from the scene */
    get needsRemoval() {
        return this._webLayer.needsRemoval;
    }
    get bounds() {
        return this._webLayer.bounds;
    }
    get parentLayer() {
        return (this._webLayer.parentLayer &&
            WebLayer3D.layersByElement.get(this._webLayer.parentLayer.element));
    }
    refresh(forceRefresh = false) {
        if (forceRefresh)
            this._webLayer.needsRefresh = true;
        this._webLayer.refresh();
        this.childLayers.length = 0;
        for (const c of this._webLayer.childLayers) {
            const child = WebLayer3D.getClosestLayerForElement(c.element);
            if (!child)
                continue;
            this.childLayers.push(child);
            child.refresh(forceRefresh);
        }
        this._refreshVideoBounds();
        this._refreshTargetPose();
        this._refreshMesh();
        const childMaterial = this.contentMesh.material;
        const isHidden = childMaterial.opacity < 0.005;
        if (isHidden)
            this.contentMesh.visible = false;
        else
            this.contentMesh.visible = true;
        if (this.needsRemoval && isHidden) {
            if (this.parent)
                this.parent.remove(this);
            this.dispose();
        }
        if (WebLayer3D.shouldApplyTargetPose(this)) {
            this.position.copy(this.target.position);
            this.quaternion.copy(this.target.quaternion);
            this.scale.copy(this.target.scale);
        }
        if (this.shouldApplyContentTargetPose) {
            this.content.position.copy(this.contentTarget.position);
            this.content.quaternion.copy(this.contentTarget.quaternion);
            this.content.scale.copy(this.contentTarget.scale);
        }
    }
    querySelector(selector) {
        const element = this.element.querySelector(selector);
        if (element) {
            return WebLayer3D.layersByElement.get(element);
        }
        return undefined;
    }
    traverseParentLayers(each, ...params) {
        const parentLayer = this.parentLayer;
        if (parentLayer) {
            parentLayer.traverseParentLayers(each, ...params);
            each(parentLayer, ...params);
        }
    }
    traverseLayers(each, ...params) {
        each(this, ...params);
        this.traverseChildLayers(each, ...params);
    }
    traverseChildLayers(each, ...params) {
        for (const child of this.childLayers) {
            child.traverseLayers(each, ...params);
        }
        return params;
    }
    dispose() {
        for (const t of this.textures.values()) {
            t.dispose();
        }
        this.contentMesh.geometry.dispose();
        WebRenderer.disposeLayer(this._webLayer);
        for (const child of this.childLayers)
            child.dispose();
    }
    _refreshVideoBounds() {
        if (this.element.nodeName === 'VIDEO') {
            const video = this.element;
            const texture = this.currentTexture;
            const computedStyle = getComputedStyle(this.element);
            const { objectFit } = computedStyle;
            const { width: viewWidth, height: viewHeight } = this.bounds;
            const { videoWidth, videoHeight } = video;
            const videoRatio = videoWidth / videoHeight;
            const viewRatio = viewWidth / viewHeight;
            texture.center.set(0.5, 0.5);
            switch (objectFit) {
                case 'none':
                    texture.repeat.set(viewWidth / videoWidth, viewHeight / videoHeight).clampScalar(0, 1);
                    break;
                case 'contain':
                case 'scale-down':
                    texture.repeat.set(1, 1);
                    if (viewRatio > videoRatio) {
                        const width = this.bounds.height * videoRatio || 0;
                        this.bounds.left += (this.bounds.width - width) / 2;
                        this.bounds.width = width;
                    }
                    else {
                        const height = this.bounds.width / videoRatio || 0;
                        this.bounds.top += (this.bounds.height - height) / 2;
                        this.bounds.height = height;
                    }
                    break;
                case 'cover':
                    texture.repeat.set(viewWidth / videoWidth, viewHeight / videoHeight);
                    if (viewRatio < videoRatio) {
                        const width = this.bounds.height * videoRatio || 0;
                        this.bounds.left += (this.bounds.width - width) / 2;
                        this.bounds.width = width;
                    }
                    else {
                        const height = this.bounds.width / videoRatio || 0;
                        this.bounds.top += (this.bounds.height - height) / 2;
                        this.bounds.height = height;
                    }
                    break;
                default:
                case 'fill':
                    texture.repeat.set(1, 1);
                    break;
            }
        }
    }
    _refreshTargetPose() {
        this.target.position.copy(this._lastTargetPosition);
        this.target.scale.set(1, 1, 1);
        this.target.quaternion.set(0, 0, 0, 1);
        this.contentTarget.position.set(0, 0, 0);
        this.contentTarget.scale.copy(this._lastContentTargetScale);
        this.contentTarget.quaternion.set(0, 0, 0, 1);
        if (this.needsRemoval) {
            // this.contentOpacity.target = 0
            return;
        }
        const bounds = this.bounds;
        // if (bounds.width === 0 || bounds.height === 0 || !this.currentTexture.image) {
        //   // this.contentOpacity.target = 0
        //   return
        // }
        // this.contentOpacity.target = 1
        const width = bounds.width;
        const height = bounds.height;
        const parentBounds = this.parentLayer instanceof WebLayer3DBase
            ? this.parentLayer.bounds
            : getViewportBounds(scratchBounds);
        const parentWidth = parentBounds.width;
        const parentHeight = parentBounds.height;
        const leftEdge = -parentWidth / 2 + width / 2;
        const topEdge = parentHeight / 2 - height / 2;
        const pixelSize = 1 / WebLayer3D.DEFAULT_PIXELS_PER_UNIT;
        const sep = this.options.layerSeparation || WebLayer3D.DEFAULT_LAYER_SEPARATION;
        this.target.position.set(pixelSize * (leftEdge + bounds.left), pixelSize * (topEdge - bounds.top), this.depth * sep +
            (this.parentLayer ? this.parentLayer.index * sep * 0.01 : 0) +
            this.index * sep * 0.001);
        this.contentTarget.scale.set(Math.max(pixelSize * width, 10e-6), Math.max(pixelSize * height, 10e-6), 1);
        this._lastTargetPosition.copy(this.target.position);
        this._lastContentTargetScale.copy(this.contentTarget.scale);
        // this.layout.inner.min.set(
        //   (-this.bounds.width * pixelSize) / 2,
        //   (-this.bounds.height * pixelSize) / 2,
        //   0
        // )
        // this.layout.inner.max.set(
        //   (this.bounds.width * pixelSize) / 2,
        //   (this.bounds.height * pixelSize) / 2,
        //   0
        // )
        // this.content.layout.inner.copy(this.layout.inner)
    }
    _refreshMesh() {
        const mesh = this.contentMesh;
        const texture = this.currentTexture;
        if (!texture.image)
            return;
        const material = mesh.material;
        if (material.map !== texture) {
            material.map = texture;
            material.needsUpdate = true;
            this.depthMaterial['map'] = texture;
            this.depthMaterial.needsUpdate = true;
        }
        if (!mesh.parent) {
            this.content.add(mesh);
            this._refreshTargetPose();
            this.content.position.copy(this.contentTarget.position);
            this.content.scale.copy(this.contentTarget.scale);
        }
        mesh.renderOrder = this.depth + this.index * 0.001;
    }
}
/**
 * Transform a DOM tree into 3D layers.
 *
 * When an instance is created, a `layer` data-attribute is set on the
 * the passed DOM element to match this instance's Object3D id.
 * If the passed DOM element has an `id` attribute, this instance's Object3D name
 * will be set to match the element id.
 *
 * Child WebLayer3D instances can be specified with an empty `layer` data-attribute,
 * which will be set when the child WebLayer3D instance is created automatically.
 * The data-attribute can be specified added in HTML or dynamically:
 *  - `<div data-layer></div>`
 *  - `element.dataset.layer = ''`
 *
 * Additionally, the pixel ratio can be adjusted on each layer, individually:
 *  - `<div data-layer data-layer-pixel-ratio="0.5"></div>`
 *  - `element.dataset.layerPixelRatio = '0.5'`
 *
 * Finally, each layer can prerender multipe states specified as CSS classes delimited by spaces:
 *  - `<div data-layer data-layer-states="near far"></div>`
 *  - `element.dataset.layerStates = 'near far'`
 *
 * Each WebLayer3D will render each of its states with the corresponding CSS class applied to the element.
 * The texture state can be changed by alternating between the specified classes,
 * without requiring the DOM to be re-rendered. Setting a state on a parent layer does
 * not affect the state of a child layer.
 *
 * Every layer has an implicit `hover` state which can be mixed with any other declared state,
 * by using the appropriate CSS selector: `.near.hover` or `.far.hover`. Besides than the
 * `hover` state. The hover state is controlled by interaction rays, which can be provided
 * with the `interactionRays` property.
 *
 * Default dimensions: 1px = 0.001 world dimensions = 1mm (assuming meters)
 *     e.g., 500px width means 0.5meters
 */
export class WebLayer3D extends WebLayer3DBase {
    constructor(elementOrHTML, options = {}) {
        super(elementOrHTML, options);
        this.options = options;
        this._doRefresh = () => {
            this.refresh();
        };
        this._interactionRays = [];
        this._raycaster = new Raycaster();
        this._hitIntersections = [];
        this._webLayer = WebRenderer.createLayerTree(this.element, (event, { target }) => {
            if (event === 'layercreated') {
                if (target === this.element)
                    return;
                const layer = new WebLayer3DBase(target, this.options);
                layer.parentLayer?.add(layer);
                if (this.options.onLayerCreate)
                    this.options.onLayerCreate(layer);
            }
            else if (event === 'layerpainted') {
                const layer = WebRenderer.layers.get(target);
                const canvas = layer.canvas;
                if (!canvas)
                    throw new Error('missing canvas');
                const texture = WebLayer3D.layersByElement.get(layer.element).currentTexture;
                texture.image = canvas;
                texture.needsUpdate = true;
            }
            else if (event === 'layermoved') {
                const layer = WebLayer3D.layersByElement.get(target);
                layer.parentLayer?.add(layer);
            }
        });
        if (this.options.onLayerCreate)
            this.options.onLayerCreate(this);
        this.refresh(true);
    }
    static computeNaturalDistance(projection, renderer) {
        let projectionMatrix = projection;
        if (projection.isCamera) {
            projectionMatrix = projection.projectionMatrix;
        }
        const pixelRatio = renderer.getPixelRatio();
        const widthPixels = renderer.domElement.width / pixelRatio;
        const width = WebLayer3D.DEFAULT_PIXELS_PER_UNIT * widthPixels;
        const horizontalFOV = getFovs(projectionMatrix).horizontal;
        const naturalDistance = width / 2 / Math.tan(horizontalFOV / 2);
        return naturalDistance;
    }
    static shouldApplyTargetPose(layer) {
        const should = layer.shouldApplyTargetPose;
        if (should === 'always' || should === true)
            return true;
        if (should === 'never' || should === false)
            return false;
        if (should === 'auto' && layer.parentLayer && layer.parent === layer.parentLayer)
            return true;
        return false;
    }
    // static hoverTargets = new Set<Element>()
    static _updateInteractions(rootLayer) {
        rootLayer.updateWorldMatrix(true, true);
        rootLayer.traverseLayers(WebLayer3D._hideCursor);
        WebRenderer.hoverTargetElements.clear();
        for (const ray of rootLayer._interactionRays) {
            rootLayer._hitIntersections.length = 0;
            if (ray instanceof Ray)
                rootLayer._raycaster.ray.copy(ray);
            else
                rootLayer._raycaster.ray.set(ray.getWorldPosition(scratchVector), ray.getWorldDirection(scratchVector2));
            rootLayer._raycaster.intersectObject(rootLayer, true, rootLayer._hitIntersections);
            for (const intersection of rootLayer._hitIntersections) {
                let layer = WebLayer3D.layersByMesh.get(intersection.object);
                if (layer && !layer.needsRemoval) {
                    layer.cursor.position.copy(intersection.point);
                    layer.worldToLocal(layer.cursor.position);
                    layer.cursor.visible = true;
                    while (layer instanceof WebLayer3DBase) {
                        WebRenderer.hoverTargetElements.add(layer.element);
                        layer = layer.parent;
                    }
                    break;
                }
            }
        }
        rootLayer.traverseLayers(this._doRefreshMesh);
        // rootLayer.traverseLayers(WebLayer3D._setHover)
        // WebLayer3D._setHoverClass(rootLayer.element)
        // domUtils.traverseChildElements(rootLayer.element, WebLayer3D._setHoverClass)
    }
    static scheduleRefresh(rootLayer) {
        WebRenderer.scheduleIdle(rootLayer._doRefresh);
    }
    // private static _setHover = function(layer: WebLayer3DBase) {
    //   layer._hover = WebLayer3D._hoverLayers.has(layer)
    //     ? 1
    //     : layer.parentLayer && layer.parentLayer._hover > 0
    //       ? layer.parentLayer._hover + 1
    //       : layer._hover
    // }
    // private static _setHoverClass = function(element: Element) {
    //   // const hover = WebLayer3D._hoverLayers.has(WebLayer3D.layersByElement.get(element))
    //   // if (hover && !element.classList.contains('hover')) element.classList.add('hover')
    //   // if (!hover && element.classList.contains('hover')) element.classList.remove('hover')
    //   // return true
    //   const hoverLayers = WebRenderer.hoverTargets
    //   let hover = false
    //   for (const layer of hoverLayers) {
    //     if (element.contains(layer.element)) {
    //       hover = true
    //       break
    //     }
    //   }
    //   if (hover && !element.classList.contains('hover')) element.classList.add('hover')
    //   if (!hover && element.classList.contains('hover')) element.classList.remove('hover')
    //   return true
    // }
    get parentLayer() {
        return super.parentLayer;
    }
    /**
     * A list of Rays to be used for interaction.
     * Can only be set on a root WebLayer3D instance.
     */
    get interactionRays() {
        return this._interactionRays;
    }
    set interactionRays(rays) {
        this._interactionRays = rays;
    }
    // refresh(forceRasterize=false) {
    //   if (WebLayer3D.DEBUG_PERFORMANCE) performance.mark('refresh start')
    //   super.refresh(forceRasterize)
    //   // WebLayer3D._scheduleRefresh(this)
    //   if (WebLayer3D.DEBUG_PERFORMANCE) performance.mark('refresh end')
    //   if (WebLayer3D.DEBUG_PERFORMANCE) performance.measure('refresh', 'refresh start', 'refresh end')
    // }
    /**
     * Update the pose and opacity of this layer (does not rerender the DOM).
     * This should be called each frame, and can only be called on a root WebLayer3D instance.
     *
     * @param lerp - lerp value
     * @param updateCallback - update callback called for each layer. Default is WebLayer3D.UDPATE_DEFAULT
     */
    update(lerp = 1, updateCallback = WebLayer3D.UPDATE_DEFAULT) {
        if (this.options.autoRefresh !== false && Math.random() > 0.8)
            WebLayer3D.scheduleRefresh(this);
        this.updateWorldMatrix(true, true);
        this.traverseLayers(updateCallback, lerp);
        WebLayer3D._updateInteractions(this);
    }
    static getLayerForQuery(selector) {
        const element = document.querySelector(selector);
        return WebLayer3D.layersByElement.get(element);
    }
    static getClosestLayerForElement(element) {
        const closestLayerElement = element && element.closest(`[${WebLayer3D.LAYER_ATTRIBUTE}]`);
        return WebLayer3D.layersByElement.get(closestLayerElement);
    }
    hitTest(ray) {
        const raycaster = this._raycaster;
        const intersections = this._hitIntersections;
        const meshMap = WebLayer3D.layersByMesh;
        raycaster.ray.copy(ray);
        intersections.length = 0;
        raycaster.intersectObject(this, true, intersections);
        for (const intersection of intersections) {
            const layer = meshMap.get(intersection.object);
            if (!layer)
                continue;
            const layerBoundingRect = getBounds(layer.element, scratchBounds);
            if (!layerBoundingRect.width || !layerBoundingRect.height)
                continue;
            let target = layer.element;
            const clientX = intersection.uv.x * layerBoundingRect.width;
            const clientY = (1 - intersection.uv.y) * layerBoundingRect.height;
            traverseChildElements(layer.element, el => {
                if (!target.contains(el))
                    return false;
                const elementBoundingRect = getBounds(el, scratchBounds2);
                const offsetLeft = elementBoundingRect.left - layerBoundingRect.left;
                const offsetTop = elementBoundingRect.top - layerBoundingRect.top;
                const { width, height } = elementBoundingRect;
                const offsetRight = offsetLeft + width;
                const offsetBottom = offsetTop + height;
                if (clientX > offsetLeft &&
                    clientX < offsetRight &&
                    clientY > offsetTop &&
                    clientY < offsetBottom) {
                    target = el;
                    return true;
                }
                return false; // stop traversal down this path
            });
            return { layer, intersection, target };
        }
        return undefined;
    }
}
WebLayer3D.layersByElement = new WeakMap();
WebLayer3D.layersByMesh = new WeakMap();
WebLayer3D.DEBUG_PERFORMANCE = false;
WebLayer3D.LAYER_ATTRIBUTE = 'data-layer';
WebLayer3D.PIXEL_RATIO_ATTRIBUTE = 'data-layer-pixel-ratio';
WebLayer3D.STATES_ATTRIBUTE = 'data-layer-states';
WebLayer3D.HOVER_DEPTH_ATTRIBUTE = 'data-layer-hover-depth';
WebLayer3D.DISABLE_TRANSFORMS_ATTRIBUTE = 'data-layer-disable-transforms';
WebLayer3D.DEFAULT_LAYER_SEPARATION = 0.001;
WebLayer3D.DEFAULT_PIXELS_PER_UNIT = 1000;
WebLayer3D.GEOMETRY = new PlaneGeometry(1, 1, 2, 2);
WebLayer3D.UPDATE_DEFAULT = function (layer, deltaTime = 1) {
    // layer.transitioner.active = true
    // layer.content.transitioner.active = true
    // layer.transitioner.update(deltaTime, false)
    // layer.content.transitioner.update(deltaTime, false)
};
WebLayer3D._doRefreshMesh = (layer) => {
    layer._refreshMesh();
};
// private static refreshBoundsQueue = [] as WebLayer3DBase[]
// private static async _scheduleRefreshBounds(rootLayer: WebLayer3D) {
//   rootLayer.traverseLayers((layer) => {
//     if (this.refreshBoundsQueue.indexOf(layer) === -1) this.refreshBoundsQueue.push(layer)
//   })
//   await microtask // wait for current frame to complete
//   const queue = this.refreshBoundsQueue
//   if (queue.length === 0 || rootLayer.options.autoRasterize === false) return
//   if (window.requestIdleCallback) {
//     window.requestIdleCallback(idleDeadline => {
//       if (!queue.length) return
//       if (WebLayer3D.DEBUG_PERFORMANCE) performance.mark('rasterize queue start')
//       while (queue.length && idleDeadline.timeRemaining() > 0) {
//         if (WebLayer3D.DEBUG_PERFORMANCE) performance.mark('rasterize start')
//         queue.shift()!.rasterize()
//         if (WebLayer3D.DEBUG_PERFORMANCE) performance.mark('rasterize end')
//         if (WebLayer3D.DEBUG_PERFORMANCE)
//           performance.measure('rasterize', 'rasterize start', 'rasterize end')
//       }
//       if (WebLayer3D.DEBUG_PERFORMANCE) performance.mark('rasterize queue end')
//       if (WebLayer3D.DEBUG_PERFORMANCE)
//         performance.measure('rasterize queue', 'rasterize queue start', 'rasterize queue end')
//     })
//   } else {
//     const startTime = performance.now()
//     if (WebLayer3D.DEBUG_PERFORMANCE) performance.mark('rasterize queue start')
//     while (queue.length && performance.now() - startTime < 5) {
//       if (WebLayer3D.DEBUG_PERFORMANCE) performance.mark('rasterize start')
//       queue.shift()!.rasterize()
//       if (WebLayer3D.DEBUG_PERFORMANCE) performance.mark('rasterize end')
//       if (WebLayer3D.DEBUG_PERFORMANCE)
//         performance.measure('rasterize', 'rasterize start', 'rasterize end')
//     }
//     if (WebLayer3D.DEBUG_PERFORMANCE) performance.mark('rasterize queue end')
//     if (WebLayer3D.DEBUG_PERFORMANCE)
//       performance.measure('rasterize queue', 'rasterize queue start', 'rasterize queue end')
//   }
// }
WebLayer3D._hideCursor = function (layer) {
    layer.cursor.visible = false;
};
function arraySubtract(a, b) {
    const result = [];
    for (const item of a) {
        if (!b.includes(item))
            result.push(item);
    }
    return result;
}
class CameraFOVs {
    constructor() {
        this.top = 0;
        this.left = 0;
        this.bottom = 0;
        this.right = 0;
        this.horizontal = 0;
        this.vertical = 0;
    }
}
const _fovs = new CameraFOVs();
const _getFovsMatrix = new Matrix4();
const _getFovsVector = new Vector3();
const FORWARD = new Vector3(0, 0, -1);
function getFovs(projectionMatrix) {
    const out = _fovs;
    const invProjection = _getFovsMatrix.getInverse(projectionMatrix);
    const vec = _getFovsVector;
    out.left = vec
        .set(-1, 0, -1)
        .applyMatrix4(invProjection)
        .angleTo(FORWARD);
    out.right = vec
        .set(1, 0, -1)
        .applyMatrix4(invProjection)
        .angleTo(FORWARD);
    out.top = vec
        .set(0, 1, -1)
        .applyMatrix4(invProjection)
        .angleTo(FORWARD);
    out.bottom = vec
        .set(0, -1, -1)
        .applyMatrix4(invProjection)
        .angleTo(FORWARD);
    out.horizontal = out.right + out.left;
    out.vertical = out.top + out.bottom;
    return out;
}
