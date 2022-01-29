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
export interface TextureData {
    hash: TextureHash;
    lastUsedTime: number;
    texture?: ArrayBuffer;
}
export declare class TextureStore extends Dexie {
    textures: Table<TextureData>;
    constructor(name: string);
}
export declare class WebLayerManagerBase {
    WebRenderer: typeof WebRenderer;
    constructor(name?: string);
    private _textureStore;
    private _textureUrls;
    private _textureData;
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
    getLayerState(hash: StateHash): LayerState;
    updateTexture(textureHash: TextureHash, imageData: ImageData): Promise<void>;
    requestTextureData(textureHash: TextureHash): Promise<TextureData | undefined>;
    getTextureData(textureHash: TextureHash): TextureData | undefined;
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
        svgHash: string;
        svgUrl: string;
        needsRasterize: boolean;
    }>;
    rasterize(stateHash: StateHash, svgUrl: SVGUrl): Promise<void>;
    getImageData(svgImage: HTMLImageElement, sourceWidth: number, sourceHeight: number, textureWidth: number, textureHeight: number): Promise<ImageData>;
    addToRasterizeQueue(hash: StateHash, url: string): ReturnType<typeof WebLayerManagerBase.prototype.rasterize>;
}