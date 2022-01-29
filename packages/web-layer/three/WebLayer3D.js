import { ClampToEdgeWrapping, DoubleSide, LinearFilter, Matrix4, Mesh, MeshBasicMaterial, MeshDepthMaterial, Object3D, PlaneGeometry, RGBADepthPacking, Vector3, VideoTexture } from "three";
import { WebRenderer } from "../core/WebRenderer";
import { Bounds, Edges } from "../core/dom-utils";
export const ON_BEFORE_UPDATE = Symbol('ON_BEFORE_UPDATE');
const scratchVector = new Vector3();
const scratchMatrix = new Matrix4;
/** Correct UVs to be compatible with `flipY=false` textures. */
function flipY(geometry) {
    const uv = geometry.attributes.uv;
    for (let i = 0; i < uv.count; i++) {
        uv.setY(i, 1 - uv.getY(i));
    }
    return geometry;
}
export class WebLayer3D extends Object3D {
    element;
    container;
    static GEOMETRY = flipY(new PlaneGeometry(1, 1, 2, 2));
    static FLIPPED_GEOMETRY = flipY(new PlaneGeometry(1, 1, 2, 2));
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
    _camera;
    constructor(element, container) {
        super();
        this.element = element;
        this.container = container;
        this.name = element.id;
        this._webLayer = WebRenderer.getClosestLayer(element);
        element.layer = this;
        // compressed textures need flipped geometry
        const geometry = (this.element.nodeName === 'VIDEO') ? WebLayer3D.GEOMETRY : WebLayer3D.FLIPPED_GEOMETRY;
        this.contentMesh = new Mesh(geometry, new MeshBasicMaterial({
            side: DoubleSide,
            depthWrite: false,
            transparent: true,
            alphaTest: 0.001,
            opacity: 1,
            toneMapped: false
        }));
        this._boundsMesh = new Mesh(geometry, new MeshBasicMaterial({
            visible: false
        }));
        this.add(this.contentMesh);
        this.add(this._boundsMesh);
        this.cursor.visible = false;
        this.matrixAutoUpdate = true;
        this.contentMesh.matrixAutoUpdate = true;
        this.contentMesh.visible = false;
        this.contentMesh['customDepthMaterial'] = this.depthMaterial;
        this.contentMesh.onBeforeRender = (renderer, scene, camera) => {
            this._camera = camera;
        };
        this._boundsMesh.matrixAutoUpdate = true;
        this.container.options.manager.layersByElement.set(this.element, this);
        this.container.options.manager.layersByMesh.set(this.contentMesh, this);
    }
    _webLayer;
    _localZ = 0;
    _viewZ = 0;
    _renderZ = 0;
    _mediaTexture;
    textures = new Set();
    _previousTexture;
    get domState() {
        return this._webLayer.currentDOMState;
    }
    get texture() {
        const manager = this.container.manager;
        if (this.element.tagName === 'VIDEO') {
            const video = this.element;
            let t = this._mediaTexture;
            if (!t) {
                t = new VideoTexture(video);
                t.wrapS = ClampToEdgeWrapping;
                t.wrapT = ClampToEdgeWrapping;
                t.minFilter = LinearFilter;
                if (manager.textureEncoding)
                    t.encoding = manager.textureEncoding;
                this._mediaTexture = t;
            }
            return t;
        }
        // if (this.element.tagName === 'IMG') {
        //   const img = this.element as HTMLImageElement
        //   let t = this._mediaTexture
        //   if (!t) {
        //     t = new Texture(img)
        //     t.wrapS = ClampToEdgeWrapping
        //     t.wrapT = ClampToEdgeWrapping
        //     t.minFilter = LinearFilter
        //     if (manager.textureEncoding) t.encoding = manager.textureEncoding
        //     this._mediaTexture = t
        //   }
        //   return t
        // }
        const textureUrl = this._webLayer.currentDOMState?.texture.url;
        let t = textureUrl ? manager.getTexture(textureUrl, this) : undefined;
        if (t)
            this.textures.add(t);
        return t;
    }
    contentMesh;
    /**
     * This non-visible mesh ensures that an adapted layer retains
     * its innerBounds, even if the content mesh is
     * independently adapted.
     */
    _boundsMesh;
    cursor = new Object3D();
    /**
     * Allows correct shadow maps
     */
    depthMaterial = new MeshDepthMaterial({
        depthPacking: RGBADepthPacking,
        alphaTest: 0.001
    });
    domLayout = new Object3D();
    domSize = new Vector3(1, 1, 1);
    /**
     * The desired pseudo state (changing this will set needsRefresh to true)
     */
    get desiredPseudoStates() {
        return this._webLayer.desiredPseudoState;
    }
    /**
     * Get the hover state
     */
    get pseudoStates() {
        return this._webLayer.currentDOMState?.pseudo;
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
    setNeedsRefresh(recurse = true) {
        this._webLayer.setNeedsRefresh(recurse);
    }
    /** If true, this layer needs to be removed from the scene */
    get needsRemoval() {
        return this._webLayer.needsRemoval;
    }
    bounds = new Bounds();
    margin = new Edges();
    get parentWebLayer() {
        return (this._webLayer.parentLayer &&
            this.container.manager.layersByElement.get(this._webLayer.parentLayer.element));
    }
    childWebLayers = [];
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
    shouldApplyDOMLayout = 'auto';
    /**
     * Refresh from DOM (potentially slow, call only when needed)
     */
    async refresh(recurse = false) {
        const refreshing = [];
        refreshing.push(this._webLayer.refresh());
        this.childWebLayers.length = 0;
        for (const c of this._webLayer.childLayers) {
            const child = this.container.manager.layersByElement
                .get(WebRenderer.getClosestLayer(c.element)?.element);
            if (!child)
                continue;
            this.childWebLayers.push(child);
            if (recurse)
                refreshing.push(child.refresh(recurse));
        }
        return Promise.all(refreshing).then(() => { });
    }
    updateLayout() {
        this._updateDOMLayout();
        if (this._camera) {
            this._localZ = Math.abs(scratchVector.setFromMatrixPosition(this.matrix).z +
                scratchVector.setFromMatrixPosition(this.contentMesh.matrix).z);
            this._viewZ = Math.abs(this.contentMesh.getWorldPosition(scratchVector).applyMatrix4(this._camera.matrixWorldInverse).z);
            let parentRenderZ = this.parentWebLayer ? this.parentWebLayer._renderZ : this._viewZ;
            if (this._localZ < 1e-3) { // coplanar? use parent renderZ
                this._renderZ = parentRenderZ;
            }
            else {
                this._renderZ = this._viewZ;
            }
            this.contentMesh.renderOrder = (this.container.options.renderOrderOffset || 0) +
                (1 - Math.log(this._renderZ + 1) / Math.log(this._camera.far + 1)) +
                (this.depth + this.index * 0.001) * 0.0000001;
        }
    }
    updateContent() {
        const mesh = this.contentMesh;
        const texture = this.texture;
        const material = mesh.material;
        if (texture && material.map !== texture) {
            const contentScale = this.contentMesh.scale;
            const aspect = Math.abs(contentScale.x * this.scale.x / contentScale.y * this.scale.y);
            const targetAspect = this.domSize.x / this.domSize.y;
            // swap texture when the aspect ratio matches
            if (Math.abs(targetAspect - aspect) < 1e3) {
                material.map = texture;
                this.depthMaterial['map'] = texture;
                material.needsUpdate = true;
                this.depthMaterial.needsUpdate = true;
            }
        }
        material.transparent = true;
        // handle layer visibility or removal
        const mat = mesh.material;
        const isHidden = mat.opacity < 0.005;
        if (isHidden)
            mesh.visible = false;
        else if (mat.map)
            mesh.visible = true;
        if (this.needsRemoval && isHidden) {
            if (this.parent)
                this.parent.remove(this);
            this.dispose();
        }
        this._refreshVideoBounds();
    }
    /** INTERNAL */
    [ON_BEFORE_UPDATE]() { }
    _doUpdate() {
        this[ON_BEFORE_UPDATE]();
        // content must update before layout
        this.updateContent();
        this.updateLayout();
        if (WebLayer3D.shouldApplyDOMLayout(this)) {
            this.position.copy(this.domLayout.position);
            this.quaternion.copy(this.domLayout.quaternion);
            this.scale.copy(this.domLayout.scale);
        }
        this.contentMesh.position.set(0, 0, 0);
        this.contentMesh.scale.copy(this.domSize);
        this.contentMesh.quaternion.set(0, 0, 0, 1);
        this._boundsMesh.position.set(0, 0, 0);
        this._boundsMesh.scale.copy(this.domSize);
        this._boundsMesh.quaternion.set(0, 0, 0, 1);
        if (this.needsRefresh && this.container.options.autoRefresh !== false)
            this.refresh();
        if (this._previousTexture !== this.texture) {
            if (this.texture)
                this.container.manager.renderer.initTexture(this.texture);
            this._previousTexture = this.texture;
            this.container.options.onLayerPaint?.(this);
        }
        this._webLayer.update();
        this.container.manager.scheduleTasksIfNeeded();
    }
    update(recurse = false) {
        if (recurse)
            this.traverseLayersPreOrder(this._doUpdate);
        else
            this._doUpdate();
    }
    querySelector(selector) {
        const element = this.element.querySelector(selector) ||
            this.element.shadowRoot?.querySelector(selector);
        if (element) {
            return this.container.manager.layersByElement.get(element);
        }
        return undefined;
    }
    traverseLayerAncestors(each) {
        const parentLayer = this.parentWebLayer;
        if (parentLayer) {
            parentLayer.traverseLayerAncestors(each);
            each.call(this, parentLayer);
        }
    }
    traverseLayersPreOrder(each) {
        if (each.call(this, this) === false)
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
        return each.call(this, this) || true;
    }
    dispose() {
        WebRenderer.disposeLayer(this._webLayer);
        this.container.manager.disposeLayer(this);
        for (const child of this.childWebLayers)
            child.dispose();
    }
    _refreshVideoBounds() {
        if (this.element.nodeName === 'VIDEO') {
            const domState = this.domState;
            if (!domState)
                return;
            const video = this.element;
            const texture = this.texture;
            const computedStyle = getComputedStyle(this.element);
            const { objectFit } = computedStyle;
            const { width: viewWidth, height: viewHeight } = this.bounds.copy(domState.bounds);
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
            domState.bounds.copy(this.bounds);
        }
    }
    _updateDOMLayout() {
        if (this.needsRemoval) {
            return;
        }
        const currentState = this._webLayer.currentDOMState;
        if (!currentState)
            return;
        const { bounds: currentBounds, margin: currentMargin } = currentState;
        this.domLayout.position.set(0, 0, 0);
        this.domLayout.scale.set(1, 1, 1);
        this.domLayout.quaternion.set(0, 0, 0, 1);
        const bounds = this.bounds.copy(currentBounds);
        const margin = this.margin.copy(currentMargin);
        const fullWidth = bounds.width + margin.left + margin.right;
        const fullHeight = bounds.height + margin.top + margin.bottom;
        const width = bounds.width;
        const height = bounds.height;
        const pixelSize = 1 / this.container.manager.pixelsPerUnit;
        this.domSize.set(Math.max(pixelSize * (width + margin.left + margin.right), 10e-6), Math.max(pixelSize * (height + margin.top + margin.bottom), 10e-6), 1);
        const parentLayer = this.parentWebLayer;
        if (!parentLayer)
            return;
        const parentBounds = parentLayer.bounds; //|| getViewportBounds(scratchBounds)
        const parentMargin = parentLayer.margin;
        const parentFullWidth = parentBounds.width + parentMargin.left + parentMargin.right;
        const parentFullHeight = parentBounds.height + parentMargin.bottom + parentMargin.top;
        const parentLeftEdge = -parentFullWidth / 2 + parentMargin.left;
        const parentTopEdge = parentFullHeight / 2 - parentMargin.top;
        this.domLayout.position.set(pixelSize * (parentLeftEdge + fullWidth / 2 + bounds.left - margin.left), pixelSize * (parentTopEdge - fullHeight / 2 - bounds.top + margin.top), 0);
        const computedStyle = getComputedStyle(this.element);
        const transform = computedStyle.transform;
        if (transform && transform !== 'none') {
            const cssTransform = WebRenderer.parseCSSTransform(computedStyle, bounds.width, bounds.height, pixelSize, scratchMatrix);
            if (cssTransform) {
                this.domLayout.updateMatrix();
                this.domLayout.matrix.multiply(cssTransform);
                this.domLayout.matrix.decompose(this.domLayout.position, this.domLayout.quaternion, this.domLayout.scale);
            }
        }
    }
}
