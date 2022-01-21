import { Bounds, Edges } from "./dom-utils";
import Dexie, { Table } from 'dexie';
export declare type StateHash = string;
export declare type TextureHash = string;
export interface LayerStateData {
    bounds: Bounds;
    margin: Edges;
    renderAttempts: number;
    fullWidth: number;
    fullHeight: number;
    textureWidth: number;
    textureHeight: number;
    textureHash?: TextureHash;
    textureUrl?: string;
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
    private _layerStateData;
    private _encoder;
    getLayerStateData(hash: StateHash): LayerStateData;
    updateTexture(textureHash: TextureHash, imageData: ImageData): Promise<unknown>;
    requestTextureData(textureHash: TextureHash): Promise<TextureData | undefined>;
    getTextureData(textureHash: TextureHash): TextureData | undefined;
    getTextureURL(textureHash: TextureHash): string | undefined;
}
