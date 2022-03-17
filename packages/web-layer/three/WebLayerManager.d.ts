import { CanvasTexture, CompressedTexture } from 'three';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';
import { WebLayer3D } from './WebLayer3D';
import { TextureHash, WebLayerManagerBase } from '../core/WebLayerManagerBase';
export interface ThreeTextureData {
    canvasTexture?: CanvasTexture;
    compressedTexture?: CompressedTexture;
}
export declare class WebLayerManager extends WebLayerManagerBase {
    static DEFAULT_TRANSCODER_PATH: string;
    static initialize(renderer: THREE.WebGLRenderer): void;
    static instance: WebLayerManager;
    constructor();
    renderer: THREE.WebGLRenderer;
    textureEncoding: import("three").TextureEncoding;
    ktx2Loader: KTX2Loader;
    texturesByHash: Map<string, ThreeTextureData>;
    layersByElement: WeakMap<Element, WebLayer3D>;
    layersByMesh: WeakMap<import("three").Mesh<import("three").BufferGeometry, import("three").Material | import("three").Material[]>, WebLayer3D>;
    getTexture(textureHash: TextureHash): ThreeTextureData;
    _compressedTexturePromise: Map<string, (value?: any) => void>;
    private _loadCompressedTextureIfNecessary;
    _canvasTexturePromise: Map<string, (value?: any) => void>;
    private _loadCanvasTextureIfNecessary;
}
