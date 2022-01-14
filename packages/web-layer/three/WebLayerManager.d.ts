import { CompressedTexture } from 'three';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';
import { WebLayer3D } from './WebLayer3D';
export declare class WebLayerManager {
    static initialize(renderer: THREE.WebGLRenderer): void;
    constructor();
    static instance: WebLayerManager;
    textureEncoding: import("three").TextureEncoding;
    texturesByUrl: Map<string, CompressedTexture | "pending">;
    layersUsingTexture: WeakMap<CompressedTexture, Set<WebLayer3D>>;
    textureLoader: KTX2Loader;
    layersByElement: WeakMap<Element, WebLayer3D>;
    layersByMesh: WeakMap<import("three").Mesh<import("three").BufferGeometry, import("three").Material | import("three").Material[]>, WebLayer3D>;
    pixelsPerUnit: number;
    getTexture(url: string, layer?: WebLayer3D): CompressedTexture | undefined;
    disposeLayer(layer: WebLayer3D): void;
}
