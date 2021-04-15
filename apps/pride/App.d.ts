import * as THREE from 'three';
import { WebLayer3D, WebLayer3DOptions } from 'ethereal';
export interface EnterXREvent {
    type: 'enterxr';
}
export interface ExitXREvent {
    type: 'exitxr';
}
export interface UpdateEvent {
    type: 'update';
    deltaTime: number;
    elapsedTime: number;
}
export interface AppConfig {
    onUpdate: (event: UpdateEvent) => void;
    onEnterXR: (event: EnterXREvent) => void;
    onExitXR: (event: ExitXREvent) => void;
}
export default class AppBase {
    private _config;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    clock: THREE.Clock;
    private pointer;
    private raycaster;
    private mouseRay;
    private immersiveRays;
    interactionRays: (THREE.Ray | THREE.Object3D)[];
    xrObjects: Map<any, THREE.Object3D>;
    constructor(_config: AppConfig);
    webLayers: Set<WebLayer3D>;
    createWebLayerTree(el: HTMLDivElement, options: WebLayer3DOptions): WebLayer3D;
    getXRObject3D(xrCoordinateSystem: any): THREE.Object3D;
    start(): Promise<any>;
    onAnimate: () => void;
    private _wasPresenting;
    update: (deltaTime: number) => void;
    interactionSpace: "screen" | "world";
    get xrPresenting(): boolean;
    session: any;
    vuforia: any;
    frameOfReference: any;
    enterXR(): Promise<any>;
    private _enterXR;
    private _exitXR;
    lastResize: number;
    lastWidth: number;
    lastHeight: number;
    timeSinceLastResize: number;
    private _setSize;
}
declare global {
    interface Navigator {
        xr: any;
    }
    const XRWebGLLayer: any;
}
