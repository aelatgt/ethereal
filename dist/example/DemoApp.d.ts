import AppBase from './AppBase';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import '../src/index';
import { DemoBase } from './demos/DemoBase';
export declare class DemoApp extends AppBase {
    gltfLoader: GLTFLoader;
    cubeTextureLoader: THREE.CubeTextureLoader;
    room: THREE.Mesh;
    sky: THREE.CubeTexture;
    demos: DemoBase[];
    plane: THREE.PlaneGeometry;
    surfaceWallA: THREE.Mesh;
    surfaceWallB: THREE.Mesh;
    surfaceWallC: THREE.Mesh;
    surfaceWallD: THREE.Mesh;
    surfaceAboveBed: THREE.Mesh;
    target: THREE.Object3D;
    belowRoomTarget: THREE.Object3D;
    roomTarget: THREE.Object3D;
    constructor();
    loadSky(): void;
    loadRoom(): void;
    setupLights(): void;
}
