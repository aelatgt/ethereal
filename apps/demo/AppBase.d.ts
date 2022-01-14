import * as THREE from 'three';
import { WebContainer3D } from '@etherealjs/web-layer/three/WebContainer3D';
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
export default class AppBase {
    scene: THREE.Scene;
    dolly: THREE.Object3D;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    clock: THREE.Clock;
    imageLoader: THREE.ImageLoader;
    composer: any;
    renderPass: any;
    normalPass: any;
    areaImage: HTMLImageElement;
    searchImage: HTMLImageElement;
    smaaEffect: any;
    ssaoEffect: any;
    bloomEffect: any;
    effectPass: any;
    pointer: THREE.Vector2;
    raycaster: THREE.Raycaster;
    xrObjects: Map<any, THREE.Object3D>;
    loaded: Promise<unknown>;
    constructor();
    webContainers: Set<WebContainer3D>;
    registerWebLayer(layer: WebContainer3D): void;
    getXRObject3D(xrCoordinateSystem: any): THREE.Object3D;
    start(): Promise<void>;
    animate: () => void;
    private _wasPresenting;
    update: (deltaTime: number) => void;
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
    onUpdate: (event: UpdateEvent) => void;
    onEnterXR: (event: EnterXREvent) => void;
    onExitXR: (event: ExitXREvent) => void;
}
