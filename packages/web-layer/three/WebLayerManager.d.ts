import { CompressedTexture } from 'three';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';
import { WebLayer3D } from './WebLayer3D';
import { WebLayerManagerBase } from '../core/WebLayerManagerBase';
export declare class WebLayerManager extends WebLayerManagerBase {
    static DEFAULT_TRANSCODER_PATH: string;
    static initialize(renderer: THREE.WebGLRenderer): void;
    static instance: WebLayerManager;
    constructor();
    renderer: THREE.WebGLRenderer;
    textureEncoding: import("three").TextureEncoding;
    texturesByUrl: Map<string, "error" | CompressedTexture | "pending">;
    layersUsingTexture: WeakMap<CompressedTexture, Set<WebLayer3D>>;
    textureLoader: KTX2Loader;
    layersByElement: WeakMap<Element, WebLayer3D>;
    layersByMesh: WeakMap<import("three").Mesh<import("three").BufferGeometry, import("three").Material | import("three").Material[]>, WebLayer3D>;
    pixelsPerUnit: number;
    getTexture(url: string, layer?: WebLayer3D): CompressedTexture | undefined;
    requestTexture(url: string, layer?: WebLayer3D): void;
    disposeLayer(layer: WebLayer3D): void;
}
