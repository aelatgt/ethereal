import { Vector3, Group, Object3D, Mesh, MeshBasicMaterial, MeshDepthMaterial, PlaneGeometry, Ray, Raycaster, Texture, VideoTexture, ClampToEdgeWrapping, RGBADepthPacking, LinearFilter, Matrix4 } from 'three';
import { WebRenderer } from '../WebRenderer';
import { Bounds, getBounds, getViewportBounds, traverseChildElements, DOM } from '../dom-utils';
const scratchVector = new Vector3();
const scratchVector2 = new Vector3();
const scratchBounds = new Bounds();
const scratchBounds2 = new Bounds();
export class WebLayer3DBase extends Group {
    constructor(elementOrHTML, options = {}) {
        super();
        this.options = options;
        this.textures = new Map();
        this.textureNeedsUpdate = false;
        // content = new Object3D()
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
        this.domLayout = new Object3D();
        this.domSize = new Vector3(1, 1, 1);
        this.childWebLayers = [];
        /**
         * Specifies whether or not the DOM layout should be applied.
         *
         * When set to `true`, the dom layout should always be applied.
         * When set to `false`, the dom layout should never be applied.
         * When set to `'auto'`, the dom layout should only be applied
         * when the `parentLayer` is the same as the `parent` object.
         *
         * It is the responsibiltiy of the update callback
         * to follow these rules.
         *
         * Defaults to `auto`
         */
        this.shouldApplyDOMLayout = 'auto';
        // private _refreshPending = false
        // private scheduleRefresh() {
        //   if (this._refreshPending) return
        //   this._refreshPending = true
        //   WebRenderer.scheduleIdle(() => {
        //     this._refreshPending = false
        //     this.refresh()
        //   })
        // }
        this._doUpdate = () => {
            this.updateLayout();
            this.updateContent();
            if (this.needsRefresh && this.options.autoRefresh)
                this.refresh();
            WebRenderer.scheduleTasksIfNeeded();
        };
        const element = this.element = typeof elementOrHTML === 'string' ? DOM(elementOrHTML) : elementOrHTML;
        this.name = element.id;
        this._webLayer = WebRenderer.getClosestLayer(element);
        this.add(this.contentMesh);
        this.cursor.visible = false;
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
            t.needsUpdate = true;
            t.wrapS = ClampToEdgeWrapping;
            t.wrapT = ClampToEdgeWrapping;
            t.minFilter = LinearFilter;
            this.textures.set(canvas, t);
        }
        else if (this.textureNeedsUpdate) {
            this.textureNeedsUpdate = false;
            t.needsUpdate = true;
        }
        return t;
    }
    /**
     * Get the hover state
     */
    get pseudoStates() {
        return this._webLayer.psuedoStates;
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
        return this.parentWebLayer ? this.parentWebLayer.childWebLayers.indexOf(this) : 0;
    }
    get needsRefresh() {
        return this._webLayer.needsRefresh;
    }
    setNeedsRefresh() {
        this._webLayer.traverseLayers(WebRenderer.setLayerNeedsRefresh);
    }
    /** If true, this layer needs to be removed from the scene */
    get needsRemoval() {
        return this._webLayer.needsRemoval;
    }
    get bounds() {
        return this._webLayer.bounds;
    }
    get parentWebLayer() {
        return (this._webLayer.parentLayer &&
            WebLayer3D.layersByElement.get(this._webLayer.parentLayer.element));
    }
    /**
     * Refresh from DOM
     */
    refresh(recurse = false) {
        this._webLayer.refresh();
        this.childWebLayers.length = 0;
        for (const c of this._webLayer.childLayers) {
            const child = WebLayer3D.getClosestLayerForElement(c.element);
            if (!child)
                continue;
            this.childWebLayers.push(child);
            if (recurse)
                child.refresh(recurse);
        }
        this._refreshVideoBounds();
        this._refreshDOMLayout();
    }
    updateLayout() {
        this.position.copy(this.domLayout.position);
        this.quaternion.copy(this.domLayout.quaternion);
        this.scale.copy(this.domLayout.scale);
        this.contentMesh.scale.copy(this.domSize);
        // handle layer visibiltiy or removal
        const mesh = this.contentMesh;
        const mat = mesh.material;
        const isHidden = mat.opacity < 0.005;
        if (isHidden)
            mesh.visible = false;
        else if (mesh.material.map)
            mesh.visible = true;
        if (this.needsRemoval && isHidden) {
            if (this.parent)
                this.parent.remove(this);
            this.dispose();
        }
    }
    updateContent() {
        const mesh = this.contentMesh;
        const texture = this.currentTexture;
        const material = mesh.material;
        if (texture.image && material.map !== texture) {
            material.map = texture;
            this.depthMaterial['map'] = texture;
            this.depthMaterial.needsUpdate = true;
            if (Math.abs(this.position.z) < 1e-9 && this.parent == this.parentWebLayer) {
                material.depthWrite = false;
                this.renderOrder = this.depth + this.index * 0.001;
            }
            else {
                material.depthWrite = true;
                this.renderOrder = 0;
            }
            material.needsUpdate = true;
        }
    }
    update(recurse = false) {
        if (recurse)
            this.traverseLayersPreOrder(this._doUpdate);
        else
            this._doUpdate();
    }
    querySelector(selector) {
        const element = this.element.querySelector(selector);
        if (element) {
            return WebLayer3D.layersByElement.get(element);
        }
        return undefined;
    }
    traverseLayerAncestors(each) {
        const parentLayer = this.parentWebLayer;
        if (parentLayer) {
            parentLayer.traverseLayerAncestors(each);
            each(parentLayer);
        }
    }
    traverseLayersPreOrder(each) {
        if (each(this) === false)
            return false;
        for (const child of this.childWebLayers) {
            if (child.traverseLayersPreOrder(each) === false)
                return false;
        }
        return true;
    }
    traverseLayersPostOrder(each) {
        for (const child of this.childWebLayers) {
            if (child.traverseLayersPostOrder(each) === false)
                return false;
        }
        return each(this) || true;
    }
    dispose() {
        for (const t of this.textures.values()) {
            t.dispose();
        }
        this.contentMesh.geometry.dispose();
        WebRenderer.disposeLayer(this._webLayer);
        for (const child of this.childWebLayers)
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
    _refreshDOMLayout() {
        if (this.needsRemoval) {
            return;
        }
        this.domLayout.position.set(0, 0, 0);
        this.domLayout.scale.set(1, 1, 1);
        this.domLayout.quaternion.set(0, 0, 0, 1);
        const bounds = this.bounds;
        const width = bounds.width;
        const height = bounds.height;
        const pixelSize = 1 / WebLayer3D.DEFAULT_PIXELS_PER_UNIT;
        this.domSize.set(Math.max(pixelSize * width, 10e-6), Math.max(pixelSize * height, 10e-6), 1);
        if (!WebLayer3D.shouldApplyDOMLayout(this))
            return;
        const parentBounds = this.parentWebLayer instanceof WebLayer3DBase
            ? this.parentWebLayer.bounds
            : getViewportBounds(scratchBounds);
        const parentWidth = parentBounds.width;
        const parentHeight = parentBounds.height;
        const leftEdge = -parentWidth / 2 + width / 2;
        const topEdge = parentHeight / 2 - height / 2;
        const sep = this.options.layerSeparation || WebLayer3D.DEFAULT_LAYER_SEPARATION;
        this.domLayout.position.set(pixelSize * (leftEdge + bounds.left), pixelSize * (topEdge - bounds.top), 0
        // this.depth * sep +
        //   (this.parentWebLayer ? this.parentWebLayer.index * sep * 0.01 : 0) +
        //   this.index * sep * 0.001
        );
    }
}
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
export class WebLayer3D extends WebLayer3DBase {
    constructor(elementOrHTML, options = {}) {
        super(elementOrHTML, options);
        this.options = options;
        this._interactionRays = [];
        this._raycaster = new Raycaster();
        this._hitIntersections = [];
        this._previousHoverLayers = new Set();
        this._contentMeshes = [];
        this._prepareHitTest = (layer) => {
            if (layer.pseudoStates.hover)
                this._previousHoverLayers.add(layer);
            layer.cursor.visible = false;
            layer.pseudoStates.hover = false;
            this._contentMeshes.push(layer.contentMesh);
        };
        this._webLayer = WebRenderer.createLayerTree(this.element, (event, { target }) => {
            if (event === 'layercreated') {
                if (target === this.element)
                    return;
                const layer = new WebLayer3DBase(target, this.options);
                layer.parentWebLayer?.add(layer);
                if (this.options.onLayerCreate)
                    this.options.onLayerCreate(layer);
            }
            else if (event === 'layerpainted') {
                const layer = WebRenderer.layers.get(target);
                const layer3D = WebLayer3D.layersByElement.get(layer.element);
                layer3D.textureNeedsUpdate = true;
            }
            else if (event === 'layermoved') {
                const layer = WebLayer3D.layersByElement.get(target);
                layer.parentWebLayer?.add(layer);
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
    static shouldApplyDOMLayout(layer) {
        const should = layer.shouldApplyDOMLayout;
        if (should === 'always' || should === true)
            return true;
        if (should === 'never' || should === false)
            return false;
        if (should === 'auto' && layer.parentWebLayer && layer.parent === layer.parentWebLayer)
            return true;
        return false;
    }
    get parentWebLayer() {
        return super.parentWebLayer;
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
     * Update this layer, optionally recursively
     */
    update(recurse = false) {
        this._updateInteractions();
        super.update(recurse);
    }
    _updateInteractions() {
        // this.updateWorldMatrix(true, true)
        const prevHover = this._previousHoverLayers;
        prevHover.clear();
        this._contentMeshes.length = 0;
        this.traverseLayersPreOrder(this._prepareHitTest);
        for (const ray of this._interactionRays) {
            if (ray instanceof Ray)
                this._raycaster.ray.copy(ray);
            else
                this._raycaster.ray.set(ray.getWorldPosition(scratchVector), ray.getWorldDirection(scratchVector2));
            this._hitIntersections.length = 0;
            const intersection = this._raycaster.intersectObjects(this._contentMeshes, false, this._hitIntersections)[0];
            if (intersection) {
                const layer = intersection.object.parent;
                layer.cursor.position.copy(intersection.point);
                layer.cursor.visible = true;
                layer.pseudoStates.hover = true;
                if (!prevHover.has(layer)) {
                    layer.setNeedsRefresh();
                }
            }
        }
        for (const layer of prevHover) {
            if (!layer.pseudoStates.hover) {
                layer.setNeedsRefresh();
            }
        }
    }
    static getLayerForQuery(selector) {
        const element = document.querySelector(selector);
        return WebLayer3D.layersByElement.get(element);
    }
    static getClosestLayerForElement(element) {
        const closestLayerElement = element && element.closest(`[${WebRenderer.LAYER_ATTRIBUTE}]`);
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
WebLayer3D.DEFAULT_LAYER_SEPARATION = 0.001;
WebLayer3D.DEFAULT_PIXELS_PER_UNIT = 1000;
WebLayer3D.GEOMETRY = new PlaneGeometry(1, 1, 2, 2);
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
