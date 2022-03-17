import { Bounds, Edges } from "./dom-utils";
import Dexie, { Table } from 'dexie';
import type { KTX2Encoder as KTX2EncoderType } from './textures/KTX2Encoder';
import { WebRenderer } from "./WebRenderer";
import { WebLayer } from "./WebLayer";
export declare type StateHash = string;
export declare type SVGUrl = string;
export declare type TextureHash = string;
export interface StateData {
    bounds: Bounds;
    margin: Edges;
    padding: Edges;
    border: Edges;
    fullWidth: number;
    fullHeight: number;
    pixelRatio: number;
    textureWidth: number;
    textureHeight: number;
    renderAttempts: number;
    texture?: TextureData;
    pseudo: {
        hover: boolean;
        active: boolean;
        focus: boolean;
        target: boolean;
    };
}
export interface TextureData {
    hash: TextureHash;
    canvas?: HTMLCanvasElement;
    ktx2Url?: string;
}
export interface StateStoreData {
    hash: StateHash;
    textureHash?: TextureHash;
}
export interface TextureStoreData {
    hash: TextureHash;
    timestamp: number;
    texture?: Uint8Array;
}
export declare class LayerStore extends Dexie {
    states: Table<StateStoreData>;
    textures: Table<TextureStoreData>;
    constructor(name: string);
}
export declare class WebLayerManagerBase {
    MINIMUM_RENDER_ATTEMPTS: number;
    WebRenderer: typeof WebRenderer;
    autosave: boolean;
    autosaveDelay: number;
    _autosaveTimer?: any;
    pixelsPerUnit: number;
    store: LayerStore;
    serializeQueue: {
        layer: WebLayer;
        resolve: (val: any) => void;
        promise: any;
    }[];
    rasterizeQueue: {
        hash: StateHash;
        svgUrl: string;
        resolve: (val: any) => void;
        promise: any;
    }[];
    optimizeQueue: {
        textureHash: TextureHash;
        resolve: (val: any) => void;
        promise: any;
    }[];
    textEncoder: TextEncoder;
    ktx2Encoder: KTX2EncoderType;
    private _unsavedTextureData;
    private _stateData;
    private _textureData;
    private _imagePool;
    constructor(name?: string);
    saveStore(): Promise<void>;
    private _packr;
    private _unpackr;
    importCache(url: string): Promise<void>;
    exportCache(states?: StateHash[]): Promise<Blob>;
    loadIntoStore(data: {
        stateData: StateStoreData[];
        textureData: TextureStoreData[];
    }): Promise<void>;
    getLayerState(hash: StateHash | HTMLMediaElement): StateData;
    getTextureState(textureHash: TextureHash): TextureData;
    private _statesRequestedFromStore;
    private _texturesRequestedFromStore;
    requestStoredData(hash: StateHash | HTMLMediaElement): Promise<StateData>;
    compressTexture(textureHash: TextureHash): Promise<void>;
    tasksPending: boolean;
    serializePendingCount: number;
    rasterizePendingCount: number;
    MAX_SERIALIZE_TASK_COUNT: number;
    MAX_RASTERIZE_TASK_COUNT: number;
    scheduleTasksIfNeeded(): void;
    private _runTasks;
    addToSerializeQueue(layer: WebLayer): ReturnType<typeof WebLayerManagerBase.prototype.serialize>;
    updateDOMMetrics(layer: WebLayer): void;
    serialize(layer: WebLayer): Promise<{
        stateKey: StateHash | HTMLMediaElement;
        svgUrl?: string | undefined;
        needsRasterize: boolean;
    }>;
    rasterize(stateHash: StateHash, svgUrl: SVGUrl): Promise<void>;
    rasterizeToCanvas(svgImage: HTMLImageElement, sourceWidth: number, sourceHeight: number, textureWidth: number, textureHeight: number, canvas?: HTMLCanvasElement): Promise<HTMLCanvasElement>;
    getImageData(canvas: HTMLCanvasElement): ImageData;
    addToRasterizeQueue(hash: StateHash, url: string): ReturnType<typeof WebLayerManagerBase.prototype.rasterize>;
    optimizeImageData(stateHash: StateHash): void;
    addToOptimizeQueue(hash: StateHash): void;
}
