import { Bounds, Edges } from "./dom-utils";
import Dexie, { Table } from 'dexie';
import type { KTX2Encoder as KTX2EncoderType } from './textures/KTX2Encoder';
import { WebRenderer } from "./WebRenderer";
import { WebLayer } from "./WebLayer";
export declare type StateHash = string;
export declare type SVGUrl = string;
export declare type TextureHash = string;
export interface LayerState {
    bounds: Bounds;
    margin: Edges;
    padding: Edges;
    border: Edges;
    fullWidth: number;
    fullHeight: number;
    renderAttempts: number;
    texture: {
        width: number;
        height: number;
        pixelRatio: number;
        hash?: TextureHash;
        url?: string;
    };
    pseudo: {
        hover: boolean;
        active: boolean;
        focus: boolean;
        target: boolean;
    };
}
export interface StateData {
    hash: StateHash;
    textureHash?: TextureHash;
}
export interface TextureData {
    hash: TextureHash;
    timestamp: number;
    texture?: Uint8Array;
}
export declare class LayerStore extends Dexie {
    states: Table<StateData>;
    textures: Table<TextureData>;
    constructor(name: string);
}
export declare class WebLayerManagerBase {
    WebRenderer: typeof WebRenderer;
    autosave: boolean;
    autosaveDelay: number;
    _autosaveTimer?: any;
    constructor(name?: string);
    saveStore(): Promise<[import("dexie").IndexableType, import("dexie").IndexableType]>;
    private _packr;
    private _unpackr;
    importStore(url: string): Promise<[import("dexie").IndexableType, import("dexie").IndexableType]>;
    exportStore(states?: StateHash[]): Promise<Blob>;
    loadStore(data: {
        stateData: StateData[];
        textureData: TextureData[];
    }): Promise<[import("dexie").IndexableType, import("dexie").IndexableType]>;
    store: LayerStore;
    private _textureUrls;
    private _unsavedTextureData;
    private _layerState;
    serializeQueue: {
        layer: WebLayer;
        resolve: (val: any) => void;
        promise: any;
    }[];
    rasterizeQueue: {
        hash: StateHash;
        url: string;
        resolve: (val: any) => void;
        promise: any;
    }[];
    MINIMUM_RENDER_ATTEMPTS: number;
    canvasPool: HTMLCanvasElement[];
    imagePool: HTMLImageElement[];
    textEncoder: TextEncoder;
    ktx2Encoder: KTX2EncoderType;
    useCreateImageBitmap: boolean;
    getLayerState(hash: StateHash | HTMLMediaElement): LayerState;
    requestLayerState(hash: StateHash | HTMLMediaElement): Promise<LayerState>;
    updateTexture(textureHash: TextureHash, imageData: ImageData): Promise<void>;
    _texturesRequested: Set<string>;
    requestTextureData(textureHash: TextureHash): Promise<unknown>;
    getTextureURL(textureHash: TextureHash): string | undefined;
    tasksPending: boolean;
    serializePendingCount: number;
    rasterizePendingCount: number;
    MAX_SERIALIZE_TASK_COUNT: number;
    MAX_RASTERIZE_TASK_COUNT: number;
    scheduleTasksIfNeeded(): void;
    private _runTasks;
    addToSerializeQueue(layer: WebLayer): ReturnType<typeof WebLayerManagerBase.prototype.serialize>;
    serialize(layer: WebLayer): Promise<{
        stateKey: StateHash | HTMLMediaElement;
        svgUrl?: string | undefined;
        needsRasterize: boolean;
    }>;
    rasterize(stateHash: StateHash, svgUrl: SVGUrl): Promise<void>;
    getImageData(svgImage: HTMLImageElement, sourceWidth: number, sourceHeight: number, textureWidth: number, textureHeight: number): Promise<ImageData>;
    addToRasterizeQueue(hash: StateHash, url: string): ReturnType<typeof WebLayerManagerBase.prototype.rasterize>;
}
