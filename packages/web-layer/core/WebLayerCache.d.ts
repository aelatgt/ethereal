import { Bounds, Edges } from "./dom-utils";
import Dexie, { Table } from 'dexie';
export declare type StateHash = string;
export declare type TextureHash = string;
export interface LayerState {
    element: Element;
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
    renderAttempts: number;
    lastUsedTime: number;
    texture?: ArrayBuffer;
}
export declare class TextureStore extends Dexie {
    textures: Table<TextureData>;
    constructor(name: string);
}
export declare class WebLayerCache {
    static instance: WebLayerCache;
    constructor(name?: string);
    private _textureStore;
    private _textureUrls;
    private _textureData;
    private _textureSubscriptions;
    private _layerState;
    private _encoder;
    getLayerState(hash: StateHash): LayerState;
    updateTexture(textureHash: TextureHash, imageData: ImageData): Promise<unknown>;
    requestTextureData(textureHash: TextureHash): Promise<TextureData | undefined>;
    getTextureData(textureHash: TextureHash): TextureData | undefined;
    getTextureURL(textureHash: TextureHash): string | undefined;
}
