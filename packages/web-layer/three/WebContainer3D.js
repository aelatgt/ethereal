import { Bounds } from '../core/dom-utils';
import { WebRenderer } from '../core/WebRenderer';
import { getBounds, traverseChildElements, toDOM } from '../core/dom-utils';
import { ON_BEFORE_UPDATE, WebLayer3D } from './WebLayer3D';
import { WebLayerManager } from './WebLayerManager';
import { Object3D, Raycaster, Vector3 } from 'three';
const scratchVector = new Vector3();
const scratchVector2 = new Vector3();
const scratchBounds = new Bounds();
const scratchBounds2 = new Bounds();
/**
 * Transform a DOM tree into 3D layers.
 *
 * When an instance is created, a `xr-layer` is set on the
 * the passed DOM element to match this instance's Object3D id.
 * If the passed DOM element has an `id` attribute, this instance's Object3D name
 * will be set to match the element id.
 *
 * Child WebLayer3D instances can be specified with an `xr-layer` attribute,
 * which will be set when the child WebLayer3D instance is created automatically.
 * The attribute can be specified added in HTML or dynamically:
 *  - `<div xr-layer></div>`
 *
 * Additionally, the pixel ratio can be adjusted on each layer, individually:
 *  - `<div xr-layer xr-pixel-ratio="0.5"></div>`
 *
 * Default dimensions: 1px = 0.001 world dimensions = 1mm (assuming meters)
 *     e.g., 500px width means 0.5meters
 */
export class WebContainer3D extends Object3D {
    // static computeNaturalDistance(
    //   projection: THREE.Matrix4 | THREE.Camera,
    //   renderer: THREE.WebGLRenderer
    // ) {
    //   let projectionMatrix = projection as  THREE.Matrix4
    //   if ((projection as THREE.Camera).isCamera) {
    //     projectionMatrix = (projection as THREE.Camera).projectionMatrix
    //   }
    //   const pixelRatio = renderer.getPixelRatio()
    //   const widthPixels = renderer.domElement.width / pixelRatio
    //   const width = WebLayer3D.DEFAULT_PIXELS_PER_UNIT * widthPixels
    //   const horizontalFOV = getFovs(projectionMatrix).horizontal
    //   const naturalDistance = width / 2 / Math.tan(horizontalFOV / 2)
    //   return naturalDistance
    // }
    options;
    rootLayer;
    _interactionRays = [];
    _raycaster = new Raycaster();
    _hitIntersections = [];
    constructor(elementOrHTML, options = {}) {
        super();
        if (!options.manager)
            options.manager = WebLayerManager.instance;
        this.options = options;
        const element = typeof elementOrHTML === 'string' ? toDOM(elementOrHTML) : elementOrHTML;
        WebRenderer.createLayerTree(element, options, (event, { target }) => {
            if (event === 'layercreated') {
                const layer = target.layer || new WebLayer3D(target, this);
                if (target === element) {
                    layer[ON_BEFORE_UPDATE] = () => this._updateInteractions();
                    this.rootLayer = layer;
                    this.add(layer);
                }
                else
                    layer.parentWebLayer?.add(layer);
                this.options.onLayerCreate?.(layer);
            }
            else if (event === 'layermoved') {
                const layer = this.options.manager.layersByElement.get(target);
                layer.parentWebLayer?.add(layer);
            }
        });
        this.refresh();
        this.update();
    }
    get manager() {
        return this.options.manager;
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
    /**
     * Update all layers until they are rasterized and textures have been uploaded to the GPU
     */
    updateUntilReady() {
        const layersRemaining = new Set();
        this.rootLayer.refresh(true, true);
        this.rootLayer.traverseLayersPreOrder((layer) => {
            const domState = layer.domState;
            if (domState.fullWidth * domState.fullHeight > 0) {
                layersRemaining.add(layer);
            }
        });
        return new Promise((resolve) => {
            const intervalHandle = setInterval(() => {
                this.update();
                for (const layer of layersRemaining) {
                    if (layer.texture)
                        layersRemaining.delete(layer);
                }
                if (layersRemaining.size === 0) {
                    clearInterval(intervalHandle);
                    resolve(undefined);
                }
            }, 20);
        });
    }
    /**
     * Update all layers, recursively
     */
    update() {
        this.rootLayer.update(true);
    }
    /**
     * Refresh all layers, recursively
     */
    refresh() {
        this.rootLayer.refresh(true);
    }
    /**
     * Run a query selector on the root layer
     * @param selector
     * @deprecated
     */
    querySelector(selector) {
        return this.rootLayer.querySelector(selector);
    }
    /** Get the content mesh of the root layer
     * @deprecated
    */
    get contentMesh() {
        return this.rootLayer.contentMesh;
    }
    _previousHoverLayers = new Set();
    _contentMeshes = [];
    _prepareHitTest = (layer) => {
        if (layer.desiredPseudoStates.hover)
            this._previousHoverLayers.add(layer);
        layer.cursor.visible = false;
        layer.desiredPseudoStates.hover = false;
        this._contentMeshes.push(layer.contentMesh);
    };
    // private _intersectionGetGroupOrder(i:Intersection) {
    //   let o = i.object as THREE.Group&THREE.Object3D
    //   while (o.parent && !o.isGroup) {
    //     o = o.parent as THREE.Group&THREE.Object3D
    //   }
    //   i.groupOrder = o.renderOrder
    // }
    _intersectionSort(a, b) {
        const aLayer = a.object.parent;
        const bLayer = b.object.parent;
        if (aLayer.depth !== bLayer.depth) {
            return bLayer.depth - aLayer.depth;
        }
        return bLayer.index - aLayer.index;
    }
    _updateInteractions() {
        // this.updateWorldMatrix(true, true)
        const prevHover = this._previousHoverLayers;
        prevHover.clear();
        this._contentMeshes.length = 0;
        this.rootLayer.traverseLayersPreOrder(this._prepareHitTest);
        for (const ray of this._interactionRays) {
            if ('isObject3D' in ray && ray.isObject3D) {
                this._raycaster.ray.set(ray.getWorldPosition(scratchVector), ray.getWorldDirection(scratchVector2).negate());
            }
            else
                this._raycaster.ray.copy(ray);
            this._hitIntersections.length = 0;
            const intersections = this._raycaster.intersectObjects(this._contentMeshes, false, this._hitIntersections);
            // intersections.forEach(this._intersectionGetGroupOrder)
            intersections.sort(this._intersectionSort);
            const intersection = intersections[0];
            if (intersection) {
                const layer = intersection.object.parent;
                layer.cursor.position.copy(intersection.point);
                layer.cursor.visible = true;
                layer.desiredPseudoStates.hover = true;
                if (!prevHover.has(layer)) {
                    layer.setNeedsRefresh();
                }
            }
        }
        for (const layer of prevHover) {
            if (!layer.desiredPseudoStates.hover) {
                layer.setNeedsRefresh();
            }
        }
    }
    /**
     * Perform hit test with ray, or with -Z direction of an Object3D
     * @param ray
     */
    hitTest(ray) {
        const raycaster = this._raycaster;
        const intersections = this._hitIntersections;
        const meshMap = this.options.manager.layersByMesh;
        if ('isObject3D' in ray && ray.isObject3D) {
            this._raycaster.ray.set(ray.getWorldPosition(scratchVector), ray.getWorldDirection(scratchVector2).negate());
        }
        else {
            this._raycaster.ray.copy(ray);
        }
        intersections.length = 0;
        raycaster.intersectObject(this, true, intersections);
        // intersections.forEach(this._intersectionGetGroupOrder)
        intersections.sort(this._intersectionSort);
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
