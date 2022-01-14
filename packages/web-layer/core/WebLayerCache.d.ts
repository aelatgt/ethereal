import { Bounds, Edges } from "./dom-utils";
import Dexie, { Table } from 'dexie';
export declare type StateHash = string;
export declare type TextureHash = string;
export interface LayerStateData {
    bounds: Bounds;
    margin: Edges;
    renderAttempts: number;
    textureHash?: TextureHash;
    textureUrl?: string;
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
export declare class WebLayerCache {
    static instance: WebLayerCache;
    constructor(name?: string);
    private _textureStore;
    private _textureUrls;
    private _textureSubscriptions;
    private _layerStateData;
    getLayerStateData(hash: StateHash): LayerStateData;
    updateTexture(textureHash: TextureHash, canvas: HTMLCanvasElement): Promise<unknown>;
    requestTextureData(textureHash: TextureHash): Promise<TextureData | undefined>;
    getTextureURL(textureHash: TextureHash): string | undefined;
}
